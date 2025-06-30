/**
 * Utilitaires SEO pour gérer les balises canonical et éviter le duplicate content
 */

/**
 * Génère l'URL canonical officielle (toujours vers www.dodomove.fr/partage)
 * @param path - Le chemin de la page (ex: "/annonce/123" ou "/")
 * @returns L'URL canonical complète
 */
export function getCanonicalUrl(path?: string): string {
  const baseDomain = 'https://www.dodomove.fr/partage';
  
  // Si pas de path ou path vide, retourner la base
  if (!path || path === '/') {
    return baseDomain;
  }
  
  // Nettoyer le path (enlever les / en début si présents)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseDomain}/${cleanPath}`;
}

/**
 * Détermine si la page actuelle doit être indexée par Google
 * @returns true si on est sur www.dodomove.fr, false si on est sur partage.dodomove.fr
 */
export function shouldIndexPage(): boolean {
  if (typeof window === 'undefined') {
    // Côté serveur, on suppose qu'on veut indexer par défaut
    return true;
  }
  
  const hostname = window.location.hostname;
  
  // Indexer seulement si on est sur le domaine principal
  return hostname === 'www.dodomove.fr' || hostname === 'dodomove.fr';
}

/**
 * Génère les balises meta robots selon le contexte
 * @returns L'objet robots pour Next.js metadata
 */
export function getRobotsDirectives(): { index: boolean; follow: boolean } {
  const shouldIndex = shouldIndexPage();
  
  return {
    index: shouldIndex,
    follow: shouldIndex
  };
} 