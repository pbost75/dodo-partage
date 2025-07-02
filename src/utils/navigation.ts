/**
 * Utilitaires de navigation pour gérer les deux contextes :
 * - partage.dodomove.fr (sans préfixe)
 * - www.dodomove.fr/partage OU dodomove.fr/partage (avec préfixe /partage)
 */

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Détermine si on est dans le contexte proxifié (www.dodomove.fr ou dodomove.fr)
 */
export function isProxiedContext(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'www.dodomove.fr' || hostname === 'dodomove.fr';
}

/**
 * Construit une URL avec le bon préfixe selon le contexte
 * @param path - Le chemin relatif (ex: '/annonce/123')
 * @returns L'URL complète avec le bon préfixe
 */
export function buildUrl(path: string): string {
  // Assurer que le path commence par /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (isProxiedContext()) {
    // Si on est sur dodomove.fr ou www.dodomove.fr, ajouter le préfixe /partage
    return `/partage${cleanPath}`;
  }
  
  // Si on est sur partage.dodomove.fr, utiliser le path tel quel
  return cleanPath;
}

/**
 * Wrapper de window.location.href pour la navigation
 * @param path - Le chemin où naviguer
 */
export function navigateTo(path: string): void {
  if (typeof window === 'undefined') return;
  
  const url = buildUrl(path);
  window.location.href = url;
}

/**
 * Wrapper de window.location.assign pour la navigation
 * @param path - Le chemin où naviguer  
 */
export function assignTo(path: string): void {
  if (typeof window === 'undefined') return;
  
  const url = buildUrl(path);
  window.location.assign(url);
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
 * Version stable qui évite les re-renders et boucles infinies
 * @returns Un objet stable avec des méthodes qui gèrent automatiquement les préfixes
 */
export function useSmartRouter() {
  const router = useRouter();
  
  // Utiliser useCallback pour mémoriser les fonctions et éviter les re-renders
  const push = useCallback((path: string, options?: { scroll?: boolean }) => {
    const smartPath = buildUrl(path);
    
    // TOUJOURS utiliser le router Next.js pour préserver le state
    // (Zustand, form state, etc.)
    router.push(smartPath, options);
  }, [router]);

  const replace = useCallback((path: string) => {
    const smartPath = buildUrl(path);
    
    // TOUJOURS utiliser le router Next.js pour préserver le state
    router.replace(smartPath);
  }, [router]);

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const forward = useCallback(() => {
    router.forward();
  }, [router]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Utiliser useMemo pour renvoyer un objet stable qui ne change que si router change
  return useMemo(() => ({
    push,
    replace,
    back,
    forward,
    refresh
  }), [push, replace, back, forward, refresh]);
} 