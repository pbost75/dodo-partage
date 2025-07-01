/**
 * Correctif pour les problèmes de funnel sur le domaine proxy
 * Détecte et corrige les conflits de localStorage entre domaines
 */

import { isProxiedDomain, clearFunnelStorage } from './storageUtils';

/**
 * Détecte si on a un problème de store vide après navigation
 */
export function detectFunnelStoreProblem(currentStep: number, formData: any): boolean {
  console.log('🔍 [FunnelFix] Détection en cours:', {
    currentStep,
    formDataKeys: formData ? Object.keys(formData) : [],
    formDataLength: formData ? Object.keys(formData).length : 0,
    isProxied: isProxiedDomain(),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR'
  });

  // Si on est sur l'étape 1, pas de problème
  if (currentStep <= 1) {
    console.log('✅ [FunnelFix] Étape 1, pas de problème');
    return false;
  }
  
  // Si on a des données, pas de problème  
  if (formData && Object.keys(formData).length > 0) {
    console.log('✅ [FunnelFix] FormData présent, pas de problème');
    return false;
  }
  
  // Si on est sur le proxy et on a un store vide à l'étape > 1, c'est le problème
  const hasProblem = isProxiedDomain();
  console.log(`${hasProblem ? '🚨' : '✅'} [FunnelFix] Problème détecté:`, hasProblem);
  
  return hasProblem;
}

/**
 * Corrige automatiquement le problème en redirigeant vers le domaine direct
 */
export function redirectToDirectDomain(currentPath: string): void {
  if (!isProxiedDomain()) {
    console.log('❌ [FunnelFix] Pas sur le domaine proxy, pas de redirection');
    return;
  }
  
  // Construire l'URL du domaine direct  
  const directUrl = `https://partage.dodomove.fr${currentPath}`;
  
  console.log(`🔄 [FunnelFix] Redirection automatique vers le domaine direct: ${directUrl}`);
  
  // Redirection avec message explicatif
  if (typeof window !== 'undefined') {
    // Sauvegarder un flag pour expliquer la redirection
    sessionStorage.setItem('redirected-from-proxy', 'true');
    console.log('🔄 [FunnelFix] Déclenchement de la redirection...');
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
    console.log('📢 [FunnelFix] Message de redirection affiché');
    sessionStorage.removeItem('redirected-from-proxy');
    return true;
  }
  
  return false;
}

/**
 * Hook pour détecter et corriger automatiquement les problèmes de funnel
 */
export function useFunnelAutoFix(currentStep: number, formData: any, currentPath: string) {
  console.log('🎯 [FunnelFix] useFunnelAutoFix appelé:', { currentStep, currentPath });
  
  // Détecter le problème
  const hasProblem = detectFunnelStoreProblem(currentStep, formData);
  
  if (hasProblem) {
    console.warn('🚨 [FunnelFix] Problème de store détecté - redirection automatique');
    redirectToDirectDomain(currentPath);
    return true; // Indique qu'une redirection est en cours
  }
  
  console.log('✅ [FunnelFix] Aucun problème détecté');
  return false;
} 