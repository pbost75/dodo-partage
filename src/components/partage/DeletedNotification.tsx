'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToastContext } from '@/contexts/ToastContext';

const DeletedNotification: React.FC = () => {
  const searchParams = useSearchParams();
  const { success } = useToastContext();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    try {
      const deleted = searchParams.get('deleted');
      
      // Éviter les déclenchements multiples
      if (deleted === 'true' && !hasTriggered) {
        console.log('🗑️ Déclenchement du toast de suppression');
        
        success(
          'Annonce supprimée avec succès',
          'Votre annonce a été définitivement supprimée de DodoPartage.',
          6000
        );
        
        setHasTriggered(true);
        
        // Nettoyer l'URL sans recharger la page
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('deleted');
          window.history.replaceState({}, '', url.toString());
        } catch (urlError) {
          console.warn('⚠️ Impossible de nettoyer l\'URL:', urlError);
        }
      }
    } catch (error) {
      console.error('❌ Erreur dans DeletedNotification:', error);
    }
  }, [searchParams, success, hasTriggered]);

  return null; // Ce composant ne rend rien visuellement
};

export default DeletedNotification; 