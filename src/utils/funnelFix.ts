/**
 * Correctif pour les problèmes de funnel sur le domaine proxy
 * Détecte et corrige les conflits de localStorage entre domaines
 */

import { isProxiedDomain, clearFunnelStorage } from './storageUtils';

/**
 * Extrait le numéro d'étape depuis l'URL
 */
function getStepFromPath(pathname: string): number {
  // Mapping des étapes pour les funnels
  const stepMapping: Record<string, number> = {
    // Funnel Search
    'locations': 1,
    'shipping-period': 2,
    'volume-needed': 3,
    'budget': 4,
    'announcement-text': 5,
    'contact': 6,
    
    // Funnel Propose  
    'shipping-date': 2,
    'container-details': 3,
    'minimum-volume': 4,
    'offer-type': 5,
    // 'announcement-text': 6, // Déjà défini pour search
    // 'contact': 7, // Différent pour propose
  };
  
  // Pour le funnel propose, le contact est à l'étape 7
  if (pathname.includes('/propose/contact')) return 7;
  if (pathname.includes('/propose/announcement-text')) return 6;
  
  // Extraire le nom de l'étape de l'URL
  const match = pathname.match(/\/funnel\/[^\/]+\/([^\/]+)/);
  if (!match) return 1;
  
  const stepName = match[1];
  return stepMapping[stepName] || 1;
}

/**
 * Détecte si on a un problème de store vide après navigation
 */
export function detectFunnelStoreProblem(currentStep: number, formData: any, pathname: string): boolean {
  // Obtenir l'étape réelle depuis l'URL
  const urlStep = getStepFromPath(pathname);
  
  console.log('🔍 [FunnelFix] Détection en cours:', {
    currentStep,
    urlStep,
    pathname,
    formDataKeys: formData ? Object.keys(formData) : [],
    formDataLength: formData ? Object.keys(formData).length : 0,
    isProxied: isProxiedDomain(),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR'
  });

  // NOUVELLE LOGIQUE : Si on est sur le proxy et que l'URL indique une étape > 1
  // mais que le store a un currentStep = 1, c'est le problème !
  if (isProxiedDomain() && urlStep > 1 && currentStep <= 1) {
    console.log('🚨 [FunnelFix] PROBLÈME DÉTECTÉ : URL étape', urlStep, 'mais store étape', currentStep);
    return true;
  }

  // Si on est sur l'étape 1 (URL et store), pas de problème
  if (urlStep <= 1) {
    console.log('✅ [FunnelFix] Étape 1 selon URL, pas de problème');
    return false;
  }
  
  // Si on a des données et que store/URL sont cohérents, pas de problème  
  if (formData && Object.keys(formData).length > 0 && Math.abs(currentStep - urlStep) <= 1) {
    console.log('✅ [FunnelFix] FormData présent et cohérence store/URL, pas de problème');
    return false;
  }
  
  // Si on est sur le proxy avec incohérence, c'est le problème
  const hasProblem = isProxiedDomain();
  console.log(`${hasProblem ? '🚨' : '✅'} [FunnelFix] Problème détecté (fallback):`, hasProblem);
  
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
  
  // Détecter le problème avec la nouvelle logique
  const hasProblem = detectFunnelStoreProblem(currentStep, formData, currentPath);
  
  if (hasProblem) {
    console.warn('🚨 [FunnelFix] Problème de store détecté - redirection automatique');
    redirectToDirectDomain(currentPath);
    return true; // Indique qu'une redirection est en cours
  }
  
  console.log('✅ [FunnelFix] Aucun problème détecté');
  return false;
} 