import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useSearchStore } from '@/store/searchStore';
import { useSmartRouter } from '@/utils/navigation';

// Mapping des étapes pour navigation du funnel search
const steps = [
  'locations',
  'shipping-period',
  'volume-needed',
  'budget',
  'announcement-text',
  'contact',
];

const stepLabels = [
  'Lieux',
  'Période',
  'Volume',
  'Budget',
  'Annonce',
  'Contact',
];

const nextLabels = [
  'Continuer',
  'Continuer',
  'Continuer',
  'Continuer',
  'Continuer',
  'Publier ma demande',
];

const prevLabels = [
  '',
  'Retour',
  'Retour',
  'Retour',
  'Retour',
  'Retour',
];

export default function SearchNavigationFooter() {
  const router = useSmartRouter();
  const pathname = usePathname();
  
  // Récupérer les données du store pour validation
  const { formData } = useSearchStore();
  
  // Récupère le nom de l'étape courante
  const match = pathname.match(/\/funnel\/search\/([^\/]+)/);
  const currentStep = match ? match[1] : '';
  const currentIndex = steps.indexOf(currentStep);
  
  // États pour gérer le feedback de chargement lors des transitions (système intelligent comme Dodomove)
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null);
  const [lastNavigationAttempt, setLastNavigationAttempt] = useState<number | null>(null);
  
  // État pour forcer la re-render quand les erreurs changent
  const [validationTrigger, setValidationTrigger] = useState(0);
  
  // 🎯 SYSTÈME INTELLIGENT : Écouter les changements de pathname pour arrêter le loading automatiquement
  useEffect(() => {
    if (pathname !== currentPath) {
      console.log(`✅ Navigation réussie: ${currentPath} → ${pathname}`);
      setIsLoading(false);
      setCurrentPath(pathname);
      setNavigationStartTime(null);
      setLastNavigationAttempt(null);
      
      // Nettoyer le timeout si la navigation a réussi
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    }
  }, [pathname, currentPath, loadingTimeout]);
  
  // Observer les changements dans le DOM pour les erreurs de validation
  useEffect(() => {
    const checkForErrors = () => {
      setValidationTrigger(prev => prev + 1);
    };
    
    // Vérifier toutes les 500ms si il y a des changements d'erreurs
    const interval = setInterval(checkForErrors, 500);
    
    return () => clearInterval(interval);
  }, [currentStep]);

  // Ne rien afficher si on n'est pas sur une étape du funnel
  if (currentIndex === -1) return null;

  // Détecter les erreurs de validation visibles dans les formulaires
  const hasValidationErrors = (): boolean => {
    try {
      // Rechercher les éléments d'erreur visibles dans le DOM
      const errorSelectors = [
        '[data-error="true"]',
        '.error:not(:empty)',
        '.text-red-500:not(:empty)',
        '.text-red-600:not(:empty)', 
        '.text-red-700:not(:empty)',
        '[class*="error"]:not(:empty)',
        'input[aria-invalid="true"]',
        'select[aria-invalid="true"]',
        'input.border-red-500',
        'select.border-red-500'
      ];
      
      // Vérifier s'il y a des erreurs visibles
      for (const selector of errorSelectors) {
        const errorElements = document.querySelectorAll(selector);
        if (errorElements.length > 0) {
          // Vérifier si au moins une erreur est réellement visible et non vide
          for (const element of errorElements) {
            const computedStyle = window.getComputedStyle(element);
            const isVisible = computedStyle.display !== 'none' && 
                             computedStyle.visibility !== 'hidden' &&
                             computedStyle.opacity !== '0';
            
            if (isVisible) {
              // Pour les éléments de texte d'erreur, vérifier qu'ils ne sont pas vides
              if (element.textContent && element.textContent.trim()) {
                console.log(`🚨 Erreur de validation détectée pour ${currentStep}:`, element.textContent.trim());
                return true;
              }
              // Pour les champs avec bordure rouge (aria-invalid ou classes CSS)
              if (element.matches('input[aria-invalid="true"], select[aria-invalid="true"], input.border-red-500, select.border-red-500')) {
                console.log(`🚨 Champ invalide détecté pour ${currentStep}:`, element);
                return true;
              }
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la vérification des erreurs de validation pour ${currentStep}:`, error);
      return false; // En cas d'erreur, ne pas bloquer la navigation
    }
  };

  // Vérifie si le bouton Suivant doit être actif
  const isNextButtonEnabled = () => {
    switch(currentStep) {
      case 'locations':
        // Vérifier que les données de départ et d'arrivée sont complètes ET qu'il n'y a pas d'erreurs de validation visibles
        return formData.departure.isComplete === true && 
               formData.arrival.isComplete === true && 
               !hasValidationErrors();
      case 'shipping-period':
        return formData.shippingPeriod.selectedMonths && 
               formData.shippingPeriod.selectedMonths.length > 0;
      case 'volume-needed':
        return formData.volumeNeeded.neededVolume > 0;
      case 'budget':
        return formData.budget && formData.budget.acceptsFees !== null;
      case 'announcement-text':
        return formData.announcementText.trim().length >= 50;
      case 'contact':
        return formData.contact.firstName !== '' && 
               formData.contact.email !== '' && 
               !hasValidationErrors();
      default:
        return true; // Par défaut, le bouton est actif
    }
  };

  // 🎯 FONCTION INTELLIGENTE pour activer le loading avec timeout de sécurité (comme Dodomove)
  const startLoading = () => {
    setIsLoading(true);
    const startTime = Date.now();
    setNavigationStartTime(startTime);
    setLastNavigationAttempt(startTime);
    
    // Timeout ultra-intelligent avec détection d'activité
    const checkTimeout = () => {
      const elapsed = Date.now() - startTime;
      const timeSinceLastAttempt = lastNavigationAttempt ? Date.now() - lastNavigationAttempt : elapsed;
      
      // Logs de debug plus détaillés
      if (elapsed > 2000 && elapsed % 2000 < 1000) { // Log toutes les 2 secondes
        console.log(`⏳ Navigation en cours... ${elapsed}ms écoulées (pathname: ${pathname === currentPath ? 'inchangé' : 'changé'})`);
      }
      
      // Conditions pour timeout (beaucoup plus strict) :
      // 1. Plus de 10 secondes écoulées
      // 2. ET aucun changement de route détecté
      // 3. ET pas d'activité de navigation récente
      if (elapsed > 10000 && pathname === currentPath && timeSinceLastAttempt > 8000) {
        console.warn(`⏰ Timeout de sécurité final après ${elapsed}ms - navigation définitivement bloquée`);
        setIsLoading(false);
        setLoadingTimeout(null);
        setNavigationStartTime(null);
        setLastNavigationAttempt(null);
      } else if (elapsed < 10000 && pathname === currentPath) {
        // Continuer à vérifier toutes les 1000ms avec beaucoup plus de patience
        const newTimeout = setTimeout(checkTimeout, 1000);
        setLoadingTimeout(newTimeout);
      }
      // Si pathname a changé, le useEffect s'en occupera automatiquement
    };
    
    // Démarrer la vérification après 2 secondes (encore plus patient)
    const timeout = setTimeout(checkTimeout, 2000);
    setLoadingTimeout(timeout);
  };

  // 🎯 NAVIGATION INTELLIGENTE : Pas de setTimeout arbitraire, loading synchronisé avec la vraie navigation
  const goNext = () => {
    // Protection contre les doubles clics
    if (isLoading) {
      console.log('🛡️ Double clic détecté, navigation déjà en cours');
      return;
    }
    
    // Activer l'état de chargement avec sécurité anti-blocage
    startLoading();
    
    console.log(`🚀 Navigation SEARCH: ${currentStep} → étape suivante`);
    
    // Navigation immédiate sans délai artificiel
    if (currentIndex < steps.length - 1) {
      const nextPath = `/funnel/search/${steps[currentIndex + 1]}`;
      router.push(nextPath);
    } else {
      // Dernière étape (contact) : aller à la confirmation
      router.push('/funnel/search/confirmation');
    }
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      // Protection contre les doubles clics
      if (isLoading) {
        console.log('🛡️ Double clic détecté, navigation déjà en cours');
        return;
      }
      
      // Activer l'état de chargement avec sécurité anti-blocage
      startLoading();
      
      console.log(`🔙 Navigation SEARCH retour: ${currentStep} → étape précédente`);
      
      // Navigation immédiate avec délai minimal juste pour permettre au state de s'appliquer
      setTimeout(() => {
        const prevPath = `/funnel/search/${steps[currentIndex - 1]}`;
        router.push(prevPath);
      }, 50); // Délai minimal juste pour permettre au state de s'appliquer
    }
  };

  return (
    <div className="z-50 bg-white border-t border-gray-200 
      md:fixed md:bottom-0 md:left-0 md:w-full md:px-4 md:pt-6 md:pb-3 md:bg-white md:border-t md:z-50
      fixed bottom-0 left-0 w-full px-4 pt-4 pb-6 shadow-lg navigation-footer-mobile">
      {/* Desktop : boutons côte à côte, sticky en bas */}
      <div className={`hidden md:flex w-full max-w-3xl mx-auto pb-2 ${currentIndex === 0 ? 'justify-start' : 'gap-4'}`}>
        {currentIndex > 0 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            icon={<FaArrowLeft />}
            iconPosition="left"
            onClick={goPrev}
            className="w-1/2"
            loading={isLoading}
          >
            {prevLabels[currentIndex]}
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          icon={<FaArrowRight />}
          iconPosition="right"
          onClick={goNext}
          className={currentIndex === 0 ? 'w-1/2' : 'w-1/2'}
          disabled={!isNextButtonEnabled()}
          loading={isLoading}
        >
          {nextLabels[currentIndex]}
        </Button>
      </div>
      {/* Mobile : design amélioré avec CTA fixe */}
      <div className="flex flex-col w-full md:hidden">
        <Button
          type="button"
          size="lg"
          icon={<FaArrowRight />}
          iconPosition="right"
          onClick={goNext}
          className="w-full mb-3 h-12 text-base font-medium shadow-sm"
          disabled={!isNextButtonEnabled()}
          loading={isLoading}
        >
          {nextLabels[currentIndex]}
        </Button>
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className={`flex items-center justify-center text-gray-600 text-sm py-2 bg-transparent border-none focus:outline-none hover:text-gray-800 transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isLoading}
          >
            <FaArrowLeft className="mr-2 text-xs" /> {prevLabels[currentIndex]}
          </button>
        )}
      </div>
    </div>
  );
} 