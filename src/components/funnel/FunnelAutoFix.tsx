'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useFunnelAutoFix, showRedirectionMessage } from '@/utils/funnelFix';

interface FunnelAutoFixProps {
  children: React.ReactNode;
  currentStep: number;
  formData: any;
  funnelType: 'propose' | 'search';
}

/**
 * Composant wrapper qui détecte et corrige automatiquement les problèmes de funnel
 * sur le domaine proxy en redirigeant vers le domaine direct
 */
export default function FunnelAutoFix({ 
  children, 
  currentStep, 
  formData, 
  funnelType 
}: FunnelAutoFixProps) {
  const pathname = usePathname();
  const [showMessage, setShowMessage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Vérifier si on vient d'être redirigé
  useEffect(() => {
    const wasRedirected = showRedirectionMessage();
    if (wasRedirected) {
      setShowMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowMessage(false), 5000);
    }
  }, []);

  // Détecter et corriger les problèmes de store
  useEffect(() => {
    const needsRedirection = useFunnelAutoFix(currentStep, formData, pathname);
    if (needsRedirection) {
      setIsRedirecting(true);
    }
  }, [currentStep, formData, pathname]);

  // Message de redirection en cours
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Redirection en cours...
          </h3>
          <p className="text-gray-600 text-sm">
            Nous vous redirigeons vers une version optimisée du funnel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Message informatif si on vient d'être redirigé */}
      {showMessage && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <span className="text-sm">
              ✅ Vous avez été redirigé vers la version optimisée du funnel
            </span>
            <button 
              onClick={() => setShowMessage(false)}
              className="ml-2 text-blue-700 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Contenu normal du funnel */}
      {children}
    </>
  );
} 