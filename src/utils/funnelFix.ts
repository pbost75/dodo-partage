/**
 * Correctif pour les problèmes de funnel sur le domaine proxy
 * Détecte et corrige les conflits de localStorage entre domaines
 */

import { isProxiedDomain, clearFunnelStorage } from './storageUtils';

/**
 * Détecte si on a un problème de store vide après navigation
 */
export function detectFunnelStoreProblem(currentStep: number, formData: any): boolean {
  // Si on est sur l'étape 1, pas de problème
  if (currentStep <= 1) return false;
  
  // Si on a des données, pas de problème  
  if (formData && Object.keys(formData).length > 0) return false;
  
  // Si on est sur le proxy et on a un store vide à l'étape > 1, c'est le problème
  return isProxiedDomain();
}

/**
 * Corrige automatiquement le problème en redirigeant vers le domaine direct
 */
export function redirectToDirectDomain(currentPath: string): void {
  if (!isProxiedDomain()) return;
  
  // Construire l'URL du domaine direct  
  const directUrl = `https://partage.dodomove.fr${currentPath}`;
  
  console.log(`🔄 Redirection automatique vers le domaine direct: ${directUrl}`);
  
  // Redirection avec message explicatif
  if (typeof window !== 'undefined') {
    // Sauvegarder un flag pour expliquer la redirection
    sessionStorage.setItem('redirected-from-proxy', 'true');
    window.location.href = directUrl;
  }
}

/**
 * Affiche un message explicatif si on vient d'être redirigé
 */
export function showRedirectionMessage(): boolean {
  if (typeof window === 'undefined') return false;
  
  const wasRedirected = sessionStorage.getItem('redirected-from-proxy');
  if (wasRedirected) {
    sessionStorage.removeItem('redirected-from-proxy');
    return true;
  }
  
  return false;
}

/**
 * Hook pour détecter et corriger automatiquement les problèmes de funnel
 */
export function useFunnelAutoFix(currentStep: number, formData: any, currentPath: string) {
  // Détecter le problème
  const hasProblem = detectFunnelStoreProblem(currentStep, formData);
  
  if (hasProblem) {
    console.warn('🚨 Problème de store détecté - redirection automatique');
    redirectToDirectDomain(currentPath);
    return true; // Indique qu'une redirection est en cours
  }
  
  return false;
} 