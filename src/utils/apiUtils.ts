/**
 * Utilitaires pour les appels API
 * Gestion intelligente des URLs cross-domain avec Worker Cloudflare
 */

/**
 * Construit l'URL complète pour un appel API
 * @param path - Le chemin de l'API (ex: '/api/get-announcements')
 * @returns L'URL complète
 */
export function getApiUrl(path: string): string {
  // Vérifier si on est sur www.dodomove.fr (via le proxy Cloudflare)
  const isProxied = typeof window !== 'undefined' && window.location.hostname === 'www.dodomove.fr';
  
  if (isProxied) {
    // Si on est sur www.dodomove.fr/partage, utiliser /partage/api/ pour que le Worker puisse intercepter
    return `/partage${path}`;
  }
  
  // Sinon, utiliser le domaine relatif (pour partage.dodomove.fr et localhost)
  return path;
}

/**
 * Wrapper de fetch qui utilise automatiquement le bon domaine
 * @param path - Le chemin de l'API (ex: '/api/get-announcements')
 * @param options - Options de fetch
 * @returns Promise<Response>
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  console.log('🌐 API call:', url);
  
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
} 