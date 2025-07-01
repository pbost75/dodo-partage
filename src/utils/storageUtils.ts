/**
 * Utilitaires pour la gestion du stockage selon le contexte (proxy vs direct)
 */

/**
 * Détermine si on est sur le domaine proxifié par Cloudflare
 * @returns true si on est sur www.dodomove.fr (proxy), false si partage.dodomove.fr (direct)
 */
export function isProxiedDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'www.dodomove.fr';
}

/**
 * Configuration pour la persistance Zustand selon le contexte
 * @param storeName - Nom du store pour le localStorage
 * @returns Configuration de persistance ou false si pas de persistance
 */
export function getStorageConfig(storeName: string) {
  // Si on est sur le proxy, désactiver la persistance pour éviter les conflits
  if (isProxiedDomain()) {
    console.log(`🚫 Persistance désactivée pour ${storeName} (domaine proxy détecté)`);
    return false;
  }
  
  // Sinon, utiliser la persistance normale
  console.log(`✅ Persistance activée pour ${storeName}`);
  return {
    name: storeName,
    partialize: (state: any) => ({ formData: state.formData })
  };
}

/**
 * Nettoyage du localStorage pour les stores de funnel
 * Utile si on a des données corrompues
 */
export function clearFunnelStorage() {
  if (typeof window === 'undefined') return;
  
  const storageKeys = ['propose-funnel-storage', 'search-funnel-storage'];
  storageKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🧹 Store ${key} nettoyé`);
  });
} 