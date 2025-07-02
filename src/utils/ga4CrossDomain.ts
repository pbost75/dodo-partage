/**
 * Utilitaire pour gérer le cross-domain tracking GA4 - DodoPartage
 * Adapté du système dodomove-funnel pour gérer dodomove.fr → dodomove.fr/partage/
 */

interface GA4Identifiers {
  client_id?: string;
  session_id?: string;
  cross_domain_detected?: boolean;
}

/**
 * Récupère les identifiants GA4 depuis les paramètres URL
 */
export function getGA4IdentifiersFromURL(): GA4Identifiers {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const identifiers: GA4Identifiers = {};
  
  // Paramètres cross-domain standard
  const clientId = urlParams.get('clientId') || urlParams.get('ga_client_id');
  const sessionId = urlParams.get('sessionId') || urlParams.get('ga_session_id');
  
  if (clientId) {
    identifiers.client_id = clientId;
    console.log('📊 [DodoPartage] Client ID récupéré depuis URL:', clientId);
  }
  
  if (sessionId) {
    identifiers.session_id = sessionId;
    console.log('📊 [DodoPartage] Session ID récupéré depuis URL:', sessionId);
  }
  
  // Paramètre _gl standard (cross-domain automatique GA4)
  const glParam = urlParams.get('_gl');
  if (glParam) {
    console.log('📊 [DodoPartage] Paramètre _gl détecté:', glParam);
    identifiers.cross_domain_detected = true;
  }
  
  // Détecter si on vient de dodomove.fr (via gclid ou autres paramètres Google)
  const gclid = urlParams.get('gclid');
  if (gclid) {
    console.log('📊 [DodoPartage] GCLID détecté (probable navigation depuis dodomove.fr):', gclid);
    identifiers.cross_domain_detected = true;
  }
  
  if (clientId || sessionId || glParam || gclid) {
    identifiers.cross_domain_detected = true;
  }
  
  return identifiers;
}

/**
 * Applique les identifiants GA4 pour préserver la session cross-domain
 */
export function applyGA4Identifiers(measurementId: string, identifiers: GA4Identifiers): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.warn('📊 [DodoPartage] gtag non disponible');
      resolve(false);
      return;
    }

    if (!identifiers.client_id && !identifiers.cross_domain_detected) {
      console.log('📊 [DodoPartage] Aucun paramètre cross-domain détecté');
      resolve(false);
      return;
    }

    try {
      const config: any = {};
      
      if (identifiers.client_id) {
        config.client_id = identifiers.client_id;
        console.log('📊 [DodoPartage] Application du Client ID:', identifiers.client_id);
      }
      
      if (identifiers.session_id) {
        config.session_id = identifiers.session_id;
        console.log('📊 [DodoPartage] Application du Session ID:', identifiers.session_id);
      }

      // Appliquer la configuration GA4
      window.gtag('config', measurementId, config);
      console.log('📊 [DodoPartage] Configuration GA4 cross-domain appliquée');
      
      resolve(true);
    } catch (error) {
      console.error('📊 [DodoPartage] Erreur configuration GA4:', error);
      resolve(false);
    }
  });
}

/**
 * Configuration principale du cross-domain tracking GA4 pour DodoPartage
 */
export async function setupGA4CrossDomainTracking(measurementId: string): Promise<GA4Identifiers> {
  console.log('📊 [DodoPartage] Initialisation cross-domain tracking...');
  
  if (typeof window === 'undefined') {
    console.warn('📊 [DodoPartage] Appelé côté serveur, ignoré');
    return {};
  }
  
  // Récupérer les identifiants depuis l'URL
  const identifiers = getGA4IdentifiersFromURL();
  
  if (identifiers.cross_domain_detected) {
    console.log('🔍 [DodoPartage] Navigation cross-domain détectée !');
    
    // Attendre que gtag soit prêt
    let attempts = 0;
    const maxAttempts = 30; // 3 secondes max
    
    const waitForGtag = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const checkGtag = () => {
          attempts++;
          
          if (typeof window.gtag === 'function') {
            resolve(true);
            return;
          }
          
          if (attempts >= maxAttempts) {
            console.warn('📊 [DodoPartage] Timeout: gtag non disponible');
            resolve(false);
            return;
          }
          
          setTimeout(checkGtag, 100);
        };
        
        checkGtag();
      });
    };
    
    const gtagReady = await waitForGtag();
    
    if (gtagReady) {
      await applyGA4Identifiers(measurementId, identifiers);
    }
  } else {
    console.log('📊 [DodoPartage] Navigation normale (pas de cross-domain)');
  }
  
  return identifiers;
} 