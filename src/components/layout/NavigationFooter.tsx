import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useProposeStore } from '@/store/proposeStore';
import { useSmartRouter } from '@/utils/navigation';

// Mapping des étapes pour navigation du funnel propose
const steps = [
  'locations',
  'shipping-date',
  'container-details',
  'minimum-volume',
  'offer-type',
  'announcement-text',
  'contact',
];

const stepLabels = [
  'Lieux',
  'Date',
  'Conteneur',
  'Volume min',
  'Offre',
  'Annonce',
  'Contact',
];

const nextLabels = [
  'Continuer',
  'Continuer',
  'Continuer',
  'Continuer',
  'Continuer',
  'Continuer',
  'Publier mon annonce',
];

const prevLabels = [
  '',
  'Retour',
  'Retour',
  'Retour',
  'Retour',
  'Retour',
  'Retour',
];

export default function NavigationFooter() {
  const router = useSmartRouter();
  const pathname = usePathname();
  
  // Récupérer les données du store pour validation
  const { formData } = useProposeStore();
  
  // Récupère le nom de l'étape courante
  const match = pathname.match(/\/funnel\/propose\/([^\/]+)/);
  const currentStep = match ? match[1] : '';
  const currentIndex = steps.indexOf(currentStep);
  
  // État pour gérer le feedback de chargement lors des transitions
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour forcer la re-render quand les erreurs changent
  const [validationTrigger, setValidationTrigger] = useState(0);
  
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

  // Détecter les erreurs de validation visibles dans les formulaires (comme Dodomove)
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
      case 'shipping-date':
        return !!formData.shippingDate;
      case 'container-details':
        return formData.container.type !== '' && 
               formData.container.availableVolume > 0 &&
               !hasValidationErrors();
      case 'minimum-volume':
        return formData.container.minimumVolume > 0;
      case 'offer-type':
        return formData.offerType !== '';
      case 'announcement-text':
        return formData.announcementText.trim() !== '';
      case 'contact':
        return formData.contact.firstName !== '' && 
               formData.contact.email !== '' && 
               !hasValidationErrors();
      default:
        return true; // Par défaut, le bouton est actif
    }
  };

  // Navigation
  const goNext = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (currentIndex < steps.length - 1) {
        const nextPath = `/funnel/propose/${steps[currentIndex + 1]}`;
        router.push(nextPath);
      } else {
        // Dernière étape (contact) : aller à la confirmation
        router.push('/funnel/propose/confirmation');
      }
      setIsLoading(false);
    }, 200);
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      setIsLoading(true);
      
      setTimeout(() => {
        const prevPath = `/funnel/propose/${steps[currentIndex - 1]}`;
        router.push(prevPath);
        setIsLoading(false);
      }, 200);
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