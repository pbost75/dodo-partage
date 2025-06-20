import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToastContext } from '@/contexts/ToastContext';

const DeletedNotification: React.FC = () => {
  const searchParams = useSearchParams();
  const { success } = useToastContext();

  useEffect(() => {
    const deleted = searchParams.get('deleted');
    if (deleted === 'true') {
      success(
        'Annonce supprimée avec succès',
        'Votre annonce a été définitivement supprimée de DodoPartage.',
        6000
      );
      
      // Nettoyer l'URL sans recharger la page
      const url = new URL(window.location.href);
      url.searchParams.delete('deleted');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, success]);

  return null; // Ce composant ne rend rien visuellement
};

export default DeletedNotification; 