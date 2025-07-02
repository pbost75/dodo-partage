'use client';

import { useEffect } from 'react';
import { setupGA4CrossDomainTracking } from '@/utils/ga4CrossDomain';

interface CrossDomainTrackerProps {
  measurementId: string;
}

const CrossDomainTracker: React.FC<CrossDomainTrackerProps> = ({ measurementId }) => {
  useEffect(() => {
    // Configuration du cross-domain tracking au chargement de l'app
    const setupTracking = async () => {
      try {
        console.log('📊 [DodoPartage] Initialisation cross-domain tracking...');
        const identifiers = await setupGA4CrossDomainTracking(measurementId);
        
        if (identifiers.cross_domain_detected) {
          console.log('✅ [DodoPartage] Cross-domain tracking configuré avec succès');
        }
      } catch (error) {
        console.warn('⚠️ [DodoPartage] Erreur cross-domain tracking:', error);
      }
    };

    setupTracking();
  }, [measurementId]);

  // Ce composant ne rend rien - il est purement fonctionnel
  return null;
};

export default CrossDomainTracker; 