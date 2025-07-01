"use client";

import React, { Suspense, useEffect } from 'react';
import { Roboto_Slab, Lato } from 'next/font/google';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import FunnelLayout from '@/components/layout/FunnelLayout';
import { useProposeFormData } from '@/store/proposeStore';

// Définition des polices identiques au funnel Dodomove
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
  // Mapping des étapes pour le funnel "proposer de la place"
  const stepNumbers: Record<string, string> = {
    'locations': '1',
    'shipping-date': '2',
    'container-details': '3',
    'minimum-volume': '4',
    'offer-type': '5',
    'announcement-text': '6',
    'contact': '7',
  };
  
  const match = pathname.match(/\/funnel\/propose\/([^\/]+)/);
  const step = match ? match[1] : '';
  
  // Page de confirmation utilise son propre layout
  if (step === 'confirmation') {
    return {
      currentStep: '7',
      totalSteps: 7
    };
  }
  
  return {
    currentStep: stepNumbers[step] || '1',
    totalSteps: 7  // Nombre total d'étapes dans le funnel propose (sans récap)
  };
}

export const dynamic = 'force-dynamic';

function FunnelContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentStep, totalSteps } = getStepInfo(pathname);
  const formData = useProposeFormData();
  
  // Analytics setup pour le funnel propose (optionnel)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('📊 Funnel Propose Layout - Étape:', currentStep, 'sur', totalSteps);
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

export default function ProposeRootLayout({
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