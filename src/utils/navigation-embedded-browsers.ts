/**
 * Utilitaires de navigation pour gérer les deux contextes :
 * - partage.dodomove.fr (sans préfixe)
 * - www.dodomove.fr/partage OU dodomove.fr/partage (avec préfixe /partage)
 * 
 * VERSION OPTIMISÉE POUR NAVIGATEURS EMBARQUÉS (Facebook, Instagram, WhatsApp, etc.)
 */

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Détecte si on est dans un navigateur embarqué
 */
export function isEmbeddedBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || '';
  
  // Patterns pour détecter les navigateurs embarqués les plus courants
  const embeddedPatterns = [
    /FBAN|FBAV/i,         // Facebook App
    /FB_IAB/i,            // Facebook In-App Browser
    /Instagram/i,         // Instagram
    /WhatsApp/i,          // WhatsApp
    /Line/i,              // Line messenger
    /Viber/i,             // Viber
    /Telegram/i,          // Telegram
    /WeChat/i,            // WeChat
    /Snapchat/i,          // Snapchat
    /TikTok/i,            // TikTok
    /LinkedIn/i,          // LinkedIn App
    /TwitterAndroid|Twitter for/i, // Twitter Apps
    /Pinterest/i,         // Pinterest
    /YahooMobile/i,       // Yahoo App
    /GSA/i,               // Google Search App
    /CriOS/i,             // Chrome iOS (souvent WebView)
    /FxiOS/i,             // Firefox iOS (WebView)
    /Mercury/i,           // Mercury Browser
    /UCBrowser/i,         // UC Browser
  ];
  
  return embeddedPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Détermine si on est dans le contexte proxifié (www.dodomove.fr ou dodomove.fr)
 * avec gestion améliorée pour les navigateurs embarqués
 */
export function isProxiedContext(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  const isProxied = hostname === 'www.dodomove.fr' || hostname === 'dodomove.fr';
  
  // Log pour debug dans les navigateurs embarqués
  if (isEmbeddedBrowser()) {
    console.log('📱 Contexte détecté - Navigateur embarqué:', {
      hostname,
      isProxied,
      userAgent: navigator.userAgent.substring(0, 100)
    });
  }
  
  return isProxied;
}

/**
 * Construit une URL avec le bon préfixe selon le contexte
 * avec optimisations pour les navigateurs embarqués
 * @param path - Le chemin relatif (ex: '/annonce/123')
 * @returns L'URL complète avec le bon préfixe
 */
export function buildUrl(path: string): string {
  // Assurer que le path commence par /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const isProxied = isProxiedContext();
  const isEmbedded = isEmbeddedBrowser();
  
  if (isProxied) {
    // Si on est sur dodomove.fr ou www.dodomove.fr, ajouter le préfixe /partage
    const url = `/partage${cleanPath}`;
    
    // Log spécial pour les navigateurs embarqués
    if (isEmbedded) {
      console.log('📱 URL construite pour navigateur embarqué:', { path, url });
    }
    
    return url;
  }
  
  // Si on est sur partage.dodomove.fr, utiliser le path tel quel
  return cleanPath;
}

/**
 * Wrapper de window.location.href pour la navigation
 * avec gestion spéciale pour les navigateurs embarqués
 * @param path - Le chemin où naviguer
 */
export function navigateTo(path: string): void {
  if (typeof window === 'undefined') return;
  
  const url = buildUrl(path);
  const isEmbedded = isEmbeddedBrowser();
  
  if (isEmbedded) {
    console.log('📱 Navigation navigateur embarqué:', { path, url });
    
    // Pour les navigateurs embarqués, utiliser une approche plus robuste
    try {
      // Méthode 1: Essayer l'assignation directe
      window.location.href = url;
    } catch (error) {
      console.warn('📱 Fallback navigation pour navigateur embarqué:', error);
      // Méthode 2: Fallback avec window.open
      try {
        window.open(url, '_self');
      } catch (fallbackError) {
        console.error('📱 Échec navigation navigateur embarqué:', fallbackError);
        // Méthode 3: Last resort - forcer un reload
        window.location.replace(url);
      }
    }
  } else {
    window.location.href = url;
  }
}

/**
 * Wrapper de window.location.assign pour la navigation
 * @param path - Le chemin où naviguer  
 */
export function assignTo(path: string): void {
  if (typeof window === 'undefined') return;
  
  const url = buildUrl(path);
  const isEmbedded = isEmbeddedBrowser();
  
  if (isEmbedded) {
    // Pour les embarqués, utiliser navigateTo qui a les fallbacks
    navigateTo(path);
  } else {
    window.location.assign(url);
  }
}

/**
 * Wrapper de window.location.replace pour la navigation
 * @param path - Le chemin où naviguer
 */
export function replaceTo(path: string): void {
  if (typeof window === 'undefined') return;
  
  const url = buildUrl(path);
  window.location.replace(url);
}

/**
 * Créer un href avec le bon préfixe pour les liens <a>
 * @param path - Le chemin du lien
 * @returns L'href avec le bon préfixe
 */
export function createHref(path: string): string {
  return buildUrl(path);
}

/**
 * Hook personnalisé qui remplace useRouter pour la navigation intelligente
 * Version optimisée pour les navigateurs embarqués
 * @returns Un objet stable avec des méthodes qui gèrent automatiquement les préfixes
 */
export function useSmartRouter() {
  const router = useRouter();
  
  // Utiliser useCallback pour mémoriser les fonctions et éviter les re-renders
  const push = useCallback((path: string, options?: { scroll?: boolean }) => {
    const smartPath = buildUrl(path);
    const isEmbedded = isEmbeddedBrowser();
    
    if (isEmbedded) {
      console.log('📱 Navigation router embarqué:', { path, smartPath });
      
      // Pour les navigateurs embarqués, utiliser une approche plus robuste
      try {
        // TOUJOURS utiliser le router Next.js pour préserver le state
        router.push(smartPath, options);
      } catch (error) {
        console.warn('📱 Fallback router push pour navigateur embarqué:', error);
        // Fallback: navigation directe
        navigateTo(path);
      }
    } else {
      // TOUJOURS utiliser le router Next.js pour préserver le state
      // (Zustand, form state, etc.)
      router.push(smartPath, options);
    }
  }, [router]);

  const replace = useCallback((path: string) => {
    const smartPath = buildUrl(path);
    const isEmbedded = isEmbeddedBrowser();
    
    if (isEmbedded) {
      console.log('📱 Navigation replace embarqué:', { path, smartPath });
      
      try {
        router.replace(smartPath);
      } catch (error) {
        console.warn('📱 Fallback router replace pour navigateur embarqué:', error);
        replaceTo(path);
      }
    } else {
      router.replace(smartPath);
    }
  }, [router]);

  const back = useCallback(() => {
    const isEmbedded = isEmbeddedBrowser();
    
    if (isEmbedded) {
      console.log('📱 Navigation back embarqué');
      
      try {
        router.back();
      } catch (error) {
        console.warn('📱 Fallback router back pour navigateur embarqué:', error);
        // Fallback: utiliser l'historique du navigateur
        window.history.back();
      }
    } else {
      router.back();
    }
  }, [router]);

  const forward = useCallback(() => {
    router.forward();
  }, [router]);

  const refresh = useCallback(() => {
    const isEmbedded = isEmbeddedBrowser();
    
    if (isEmbedded) {
      console.log('📱 Navigation refresh embarqué');
      
      try {
        router.refresh();
      } catch (error) {
        console.warn('📱 Fallback router refresh pour navigateur embarqué:', error);
        // Fallback: reload de la page
        window.location.reload();
      }
    } else {
      router.refresh();
    }
  }, [router]);

  // Utiliser useMemo pour renvoyer un objet stable qui ne change que si router change
  return useMemo(() => ({
    push,
    replace,
    back,
    forward,
    refresh,
    // Ajout de méthodes utilitaires
    isEmbedded: isEmbeddedBrowser(),
    isProxied: isProxiedContext(),
  }), [push, replace, back, forward, refresh]);
}

/**
 * Utilitaire pour détecter les capacités du navigateur embarqué
 */
export function getEmbeddedBrowserCapabilities() {
  if (typeof window === 'undefined') return null;
  
  const userAgent = navigator.userAgent;
  const isEmbedded = isEmbeddedBrowser();
  
  if (!isEmbedded) return null;
  
  return {
    isEmbedded: true,
    userAgent: userAgent.substring(0, 100),
    supportsLocalStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    supportsSessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    supportsCookies: navigator.cookieEnabled,
    supportsHistoryAPI: !!(window.history && window.history.pushState),
    isFacebook: /FBAN|FBAV|FB_IAB/i.test(userAgent),
    isInstagram: /Instagram/i.test(userAgent),
    isWhatsApp: /WhatsApp/i.test(userAgent),
    isLine: /Line/i.test(userAgent),
    isTelegram: /Telegram/i.test(userAgent),
    isWeChat: /WeChat/i.test(userAgent),
    isTikTok: /TikTok/i.test(userAgent),
    isLinkedIn: /LinkedIn/i.test(userAgent),
    isTwitter: /TwitterAndroid|Twitter for/i.test(userAgent),
  };
} 