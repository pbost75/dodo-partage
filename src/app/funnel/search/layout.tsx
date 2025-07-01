"use client";

import React, { Suspense, useEffect } from 'react';
import { Roboto_Slab, Lato } from 'next/font/google';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import FunnelLayout from '@/components/layout/FunnelLayout';
import { useSearchFormData } from '@/store/searchStore';

// Définition des polices identiques au funnel propose
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-slab',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-lato',
});

// Calculer le numéro de l'étape à partir du pathname
function getStepInfo(pathname: string) {
  // Mapping des étapes pour le funnel "chercher de la place"
  const stepNumbers: Record<string, string> = {
    'locations': '1',
    'shipping-period': '2',
    'volume-needed': '3',
    'budget': '4',
    'announcement-text': '5',
    'contact': '6',
  };
  
  const match = pathname.match(/\/funnel\/search\/([^\/]+)/);
  const step = match ? match[1] : '';
  
  // Page de confirmation utilise son propre layout
  if (step === 'confirmation') {
    return {
      currentStep: '6',
      totalSteps: 6
    };
  }
  
  return {
    currentStep: stepNumbers[step] || '1',
    totalSteps: 6  // Nombre total d'étapes dans le funnel search
  };
}

export const dynamic = 'force-dynamic';

function FunnelContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentStep, totalSteps } = getStepInfo(pathname);
  const formData = useSearchFormData();
  
  // Analytics setup pour le funnel search (optionnel)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('📊 Funnel Search Layout - Étape:', currentStep, 'sur', totalSteps);
      // Ici tu pourras ajouter le tracking analytics plus tard si besoin
    }
  }, [currentStep, totalSteps]);
  
  return (
    <div className={`${robotoSlab.variable} ${lato.variable}`}>
      <FunnelLayout currentStep={currentStep} totalSteps={totalSteps}>
        <AnimatePresence mode="wait" initial={false}>
          <div key={pathname} className="w-full">
            {children}
          </div>
        </AnimatePresence>
      </FunnelLayout>
    </div>
  );
}

export default function SearchRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Lato']">Chargement...</p>
        </div>
      </div>
    }>
      <FunnelContent>{children}</FunnelContent>
    </Suspense>
  );
} 