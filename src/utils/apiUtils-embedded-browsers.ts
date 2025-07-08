/**
 * Utilitaires pour les appels API
 * Gestion intelligente des URLs cross-domain avec Worker Cloudflare
 * VERSION OPTIMISÉE POUR NAVIGATEURS EMBARQUÉS (Facebook, Instagram, WhatsApp, etc.)
 */

// Import des fonctions de détection depuis navigation-embedded-browsers.ts
import { isEmbeddedBrowser } from './navigation-embedded-browsers';

/**
 * Construit l'URL complète pour un appel API
 * avec gestion améliorée pour les navigateurs embarqués
 * @param path - Le chemin de l'API (ex: '/api/get-announcements')
 * @returns L'URL complète
 */
export function getApiUrl(path: string): string {
  // Vérifier si on est sur www.dodomove.fr (via le proxy Cloudflare)
  const isProxied = typeof window !== 'undefined' && window.location.hostname === 'www.dodomove.fr';
  const isEmbedded = isEmbeddedBrowser();
  
  if (isProxied) {
    // Si on est sur www.dodomove.fr/partage, utiliser /partage/api/ pour que le Worker puisse intercepter
    const url = `/partage${path}`;
    
    if (isEmbedded) {
      console.log('📱 API URL construite pour navigateur embarqué:', { path, url });
    }
    
    return url;
  }
  
  // Sinon, utiliser le domaine relatif (pour partage.dodomove.fr et localhost)
  return path;
}

/**
 * Configuration des options de fetch optimisées pour les navigateurs embarqués
 */
function getEmbeddedBrowserFetchOptions(isEmbedded: boolean): RequestInit {
  const baseOptions: RequestInit = {
    credentials: 'same-origin',
    cache: 'no-cache', // Éviter les problèmes de cache dans les WebViews
  };
  
  if (isEmbedded) {
    return {
      ...baseOptions,
      // Mode plus permissif pour les navigateurs embarqués
      mode: 'cors',
      credentials: 'include', // Inclure les cookies pour l'authentification
      // Headers spéciaux pour les navigateurs embarqués
      headers: {
        'X-Embedded-Browser': 'true',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    };
  }
  
  return baseOptions;
}

/**
 * Wrapper de fetch avec retry automatique pour les navigateurs embarqués
 * @param url - L'URL à appeler
 * @param options - Options de fetch
 * @param retryCount - Nombre de tentatives restantes
 * @returns Promise<Response>
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retryCount: number = 3
): Promise<Response> {
  const isEmbedded = isEmbeddedBrowser();
  
  try {
    // Timeout plus long pour les navigateurs embarqués
    const timeoutDuration = isEmbedded ? 15000 : 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Log pour debug des navigateurs embarqués
    if (isEmbedded) {
      console.log('📱 API Response:', {
        url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }
    
    // Si la réponse est OK, la retourner
    if (response.ok) {
      return response;
    }
    
    // Si c'est une erreur réseau et qu'on est dans un navigateur embarqué, retry
    if (isEmbedded && retryCount > 0 && (response.status >= 500 || response.status === 0)) {
      console.warn(`📱 Retry API call pour navigateur embarqué (${retryCount} tentatives restantes):`, {
        url,
        status: response.status,
      });
      
      // Attendre un peu avant de retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retryCount - 1);
    }
    
    return response;
    
  } catch (error) {
    console.error('📱 Erreur API fetch:', { url, error, isEmbedded });
    
    // Retry pour les navigateurs embarqués en cas d'erreur réseau
    if (isEmbedded && retryCount > 0) {
      console.warn(`📱 Retry après erreur pour navigateur embarqué (${retryCount} tentatives restantes):`, error);
      
      // Attendre un peu avant de retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchWithRetry(url, options, retryCount - 1);
    }
    
    throw error;
  }
}

/**
 * Wrapper de fetch qui utilise automatiquement le bon domaine
 * avec optimisations pour les navigateurs embarqués
 * @param path - Le chemin de l'API (ex: '/api/get-announcements')
 * @param options - Options de fetch
 * @returns Promise<Response>
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  const isEmbedded = isEmbeddedBrowser();
  
  console.log('🌐 API call:', { url, isEmbedded });
  
  // Fusionner les options par défaut avec les options spécifiques aux navigateurs embarqués
  const embeddedOptions = getEmbeddedBrowserFetchOptions(isEmbedded);
  const mergedOptions: RequestInit = {
    ...embeddedOptions,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...embeddedOptions.headers,
      ...options?.headers,
    },
  };
  
  // Log détaillé pour les navigateurs embarqués
  if (isEmbedded) {
    console.log('📱 API call détaillé:', {
      url,
      method: mergedOptions.method || 'GET',
      headers: mergedOptions.headers,
      hasBody: !!mergedOptions.body,
    });
  }
  
  return fetchWithRetry(url, mergedOptions);
}

/**
 * Wrapper spécialisé pour les appels API POST avec gestion des erreurs améliorée
 * @param path - Le chemin de l'API
 * @param data - Les données à envoyer
 * @returns Promise<Response>
 */
export async function apiPost(path: string, data: any): Promise<Response> {
  const isEmbedded = isEmbeddedBrowser();
  
  if (isEmbedded) {
    console.log('📱 API POST pour navigateur embarqué:', { path, data });
  }
  
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Wrapper spécialisé pour les appels API GET avec cache adapté
 * @param path - Le chemin de l'API
 * @returns Promise<Response>
 */
export async function apiGet(path: string): Promise<Response> {
  const isEmbedded = isEmbeddedBrowser();
  
  return apiFetch(path, {
    method: 'GET',
    // Cache désactivé pour les navigateurs embarqués
    cache: isEmbedded ? 'no-cache' : 'default',
  });
}

/**
 * Utilitaire pour vérifier la connectivité API depuis un navigateur embarqué
 * @returns Promise<boolean>
 */
export async function checkApiConnectivity(): Promise<boolean> {
  const isEmbedded = isEmbeddedBrowser();
  
  if (!isEmbedded) {
    return true; // Pas besoin de vérifier pour les navigateurs normaux
  }
  
  try {
    console.log('📱 Vérification connectivité API pour navigateur embarqué...');
    
    const response = await apiFetch('/api/test-backend', {
      method: 'GET',
    });
    
    const isConnected = response.ok;
    
    console.log('📱 Résultat connectivité API:', { isConnected, status: response.status });
    
    return isConnected;
    
  } catch (error) {
    console.error('📱 Échec vérification connectivité API:', error);
    return false;
  }
}

/**
 * Utilitaire pour diagnostiquer les problèmes API dans les navigateurs embarqués
 * @returns Promise<object>
 */
export async function diagnoseApiIssues(): Promise<{
  connectivity: boolean;
  corsSupport: boolean;
  cookieSupport: boolean;
  localStorageSupport: boolean;
  userAgent: string;
  currentUrl: string;
}> {
  const isEmbedded = isEmbeddedBrowser();
  
  if (!isEmbedded) {
    return {
      connectivity: true,
      corsSupport: true,
      cookieSupport: true,
      localStorageSupport: true,
      userAgent: 'Standard browser',
      currentUrl: window.location.href,
    };
  }
  
  console.log('📱 Diagnostic API pour navigateur embarqué...');
  
  // Test de connectivité
  const connectivity = await checkApiConnectivity();
  
  // Test du support des cookies
  const cookieSupport = (() => {
    try {
      document.cookie = 'test=1';
      const hasCookie = document.cookie.includes('test=1');
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return hasCookie;
    } catch {
      return false;
    }
  })();
  
  // Test du support du localStorage
  const localStorageSupport = (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  })();
  
  // Test du support CORS (simplifié)
  const corsSupport = (() => {
    try {
      return !!(window as any).XMLHttpRequest && 'withCredentials' in new XMLHttpRequest();
    } catch {
      return false;
    }
  })();
  
  const diagnosis = {
    connectivity,
    corsSupport,
    cookieSupport,
    localStorageSupport,
    userAgent: navigator.userAgent.substring(0, 100),
    currentUrl: window.location.href,
  };
  
  console.log('📱 Résultat diagnostic API:', diagnosis);
  
  return diagnosis;
} 