"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ProgressBar from '../ui/ProgressBar';
import { useProposeStore } from '@/store/proposeStore';
import { useSearchStore } from '@/store/searchStore';
import NavigationFooter from './NavigationFooter';
import SearchNavigationFooter from './SearchNavigationFooter';
import { useSmartRouter } from '@/utils/navigation';
import { X } from 'lucide-react';

interface FunnelLayoutProps {
  children: ReactNode;
  currentStep: string;
  totalSteps: number;
}

const FunnelLayout: React.FC<FunnelLayoutProps> = ({ 
  children, 
  currentStep, 
  totalSteps 
}) => {
  const pathname = usePathname();
  const smartRouter = useSmartRouter();
  
  // Détecter le type de funnel selon le pathname
  const isSearchFunnel = pathname.includes('/funnel/search/');
  const isProposeFunnel = pathname.includes('/funnel/propose/');
  
  // Calculer le pourcentage de progression
  const progressPercentage = (parseInt(currentStep) / totalSteps) * 100;
  
  // Récupérer les fonctions reset depuis les stores
  const { reset: resetPropose } = useProposeStore();
  const { reset: resetSearch } = useSearchStore();
  
  // Fonction pour réinitialiser le store et le localStorage
  const handleReset = () => {
    const funnelType = isSearchFunnel ? 'search' : 'propose';
    const confirmMessage = `Êtes-vous sûr de vouloir réinitialiser toutes les données du formulaire ${funnelType} ?`;
    
    if (confirm(confirmMessage)) {
      if (isSearchFunnel) {
        // Réinitialiser le store search
        resetSearch();
        // Supprimer les données du funnel search dans localStorage
        localStorage.removeItem('search-funnel-storage');
        // Rediriger vers la première étape du funnel search
        smartRouter.push('/funnel/search/locations');
      } else if (isProposeFunnel) {
        // Réinitialiser le store propose
        resetPropose();
        // Supprimer les données du funnel propose dans localStorage
        localStorage.removeItem('dodo-partage-propose-store');
        // Rediriger vers la première étape du funnel propose
        smartRouter.push('/funnel/propose/locations');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header simple et stable avec navigation - IDENTIQUE à Dodomove */}
      <header className="bg-white relative z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2 pt-6 pb-4">
            <div className="h-14 flex items-center relative">
              {/* Logo cliquable pour retourner à l'accueil */}
              <button
                onClick={() => smartRouter.push('/')}
                className="text-2xl font-bold text-blue-600 font-title hover:text-blue-700 transition-colors"
                style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
                title="Retour à l'accueil DodoPartage"
              >
                DodoPartage
              </button>
              
              {/* Croix de fermeture discrète */}
              <button
                onClick={() => smartRouter.push('/')}
                className="absolute -right-2 -top-1 md:fixed md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="Quitter le funnel"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500 font-['Lato']">
                  {isSearchFunnel ? 'Votre demande de place' : 'Votre annonce de partage'}
                </span>
                <span className="text-sm text-gray-400 font-['Lato']">{progressPercentage.toFixed(0)}% de progression</span>
              </div>
              <ProgressBar percentage={progressPercentage} currentStep={currentStep} totalSteps={totalSteps} />
            </div>
          </div>
        </div>
        <div className="border-b border-gray-100 w-full" />
      </header>

      {/* Contenu principal avec gestion mobile améliorée - IDENTIQUE à Dodomove */}
      <main className="flex justify-center items-start bg-white">
        {/* Sur mobile: hauteur dynamique moins header et footer avec padding généreux pour dropdowns */}
        {/* Sur desktop: hauteur minimum sans contrainte stricte */}
        <div className="w-full max-w-3xl 
                        min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-180px)]
                        p-4 md:p-8 
                        pb-[200px] md:pb-28
                        pt-6 md:pt-8">
          {children}
        </div>
      </main>

      {/* Footer de navigation conditionnel selon le type de funnel */}
      {isSearchFunnel && <SearchNavigationFooter />}
      {isProposeFunnel && <NavigationFooter />}
      
      {/* Bouton de réinitialisation discret - Pour les deux funnels */}
      {(isSearchFunnel || isProposeFunnel) && (
        <button
          onClick={handleReset}
          className="fixed bottom-4 right-4 bg-gray-200 bg-opacity-50 hover:bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xs z-50"
          title={`Réinitialiser le formulaire ${isSearchFunnel ? 'search' : 'propose'} (pour tests)`}
        >
          R
        </button>
      )}
    </div>
  );
};

export default FunnelLayout; 