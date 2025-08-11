/**
 * Utilitaires de navigation côté SERVEUR UNIQUEMENT
 * Ces fonctions ne contiennent pas de hooks React
 */

/**
 * Détecte si on est dans un contexte proxied (côté serveur)
 * Version server-side basée sur les headers
 */
export function isProxiedContextServer(headers?: Headers): boolean {
  // Côté serveur, on peut détecter via les headers
  if (headers) {
    const host = headers.get('host');
    const forwarded = headers.get('x-forwarded-host');
    return host?.includes('dodomove.fr') || forwarded?.includes('dodomove.fr') || false;
  }
  
  // Fallback : détecter via les variables d'environnement
  const seoUrl = process.env.NEXT_PUBLIC_SEO_URL;
  return seoUrl?.includes('dodomove.fr') || false;
}

/**
 * Construit une URL compatible server/client
 * Version server-only (sans hooks)
 */
export function buildUrlServer(path: string, useProxyPrefix: boolean = true): string {
  // Nettoyer le path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Si on utilise le prefix proxy
  if (useProxyPrefix && isProxiedContextServer()) {
    return `/partage${cleanPath}`;
  }
  
  return cleanPath;
}

/**
 * Crée un href pour les liens Next.js côté serveur
 * Cette fonction peut être utilisée dans les Server Components
 */
export function createHrefServer(path: string): string {
  return buildUrlServer(path, true);
}
