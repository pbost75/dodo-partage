"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ProgressBar from '../ui/ProgressBar';
import { useProposeStore } from '@/store/proposeStore';
import NavigationFooter from './NavigationFooter';
import SearchNavigationFooter from './SearchNavigationFooter';

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
  
  // Détecter le type de funnel selon le pathname
  const isSearchFunnel = pathname.includes('/funnel/search/');
  const isProposeFunnel = pathname.includes('/funnel/propose/');
  
  // Calculer le pourcentage de progression
  const progressPercentage = (parseInt(currentStep) / totalSteps) * 100;
  
  // Récupérer la fonction resetStore depuis le store (uniquement pour propose)
  const { reset } = useProposeStore();
  
  // Fonction pour réinitialiser le store et le localStorage (uniquement pour propose)
  const handleReset = () => {
    if (!isProposeFunnel) return; // Pas de reset pour search
    
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les données du formulaire?')) {
      // Réinitialiser le store
      reset();
      
      // Supprimer uniquement les données du funnel dans localStorage
      localStorage.removeItem('dodo-partage-propose-store');
      
      // Rediriger directement vers la première étape du funnel
      window.location.href = '/funnel/propose/locations';
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header simple et stable - IDENTIQUE à Dodomove */}
      <header className="bg-white relative z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2 pt-6 pb-4">
            <div className="h-14 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 font-roboto-slab">
                DodoPartage
              </h1>
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
      
      {/* Bouton de réinitialisation discret - Uniquement pour le funnel propose */}
      {isProposeFunnel && (
        <button
          onClick={handleReset}
          className="fixed bottom-4 right-4 bg-gray-200 bg-opacity-50 hover:bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xs z-50"
          title="Réinitialiser le formulaire (pour tests)"
        >
          R
        </button>
      )}
    </div>
  );
};

export default FunnelLayout; 