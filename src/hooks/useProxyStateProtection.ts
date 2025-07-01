import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import { useProposeStore } from '@/store/proposeStore';

/**
 * Hook pour protéger le state Zustand des problèmes liés au proxy Cloudflare
 * Détecte les réinitialisations de store non désirées et les corrige automatiquement
 */
export function useProxyStateProtection() {
  const pathname = usePathname();
  
  // Détection du type de funnel
  const isSearchFunnel = pathname.includes('/funnel/search/');
  const isProposeFunnel = pathname.includes('/funnel/propose/');
  
  // Stores
  const searchStore = useSearchStore();
  const proposeStore = useProposeStore();
  
  // État local pour la surveillance
  const [protectionActive, setProtectionActive] = useState(false);
  const lastValidState = useRef<any>(null);
  const stateCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const navigationCount = useRef(0);
  
  // Détection des navigations suspectes
  const prevPathname = useRef(pathname);
  
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      navigationCount.current++;
      console.log('🧭 Navigation détectée:', prevPathname.current, '→', pathname, `(#${navigationCount.current})`);
      
      // Si navigation répétée vers la même étape en moins de 2 secondes
      if (navigationCount.current > 1 && prevPathname.current === pathname) {
        console.warn('⚠️ Navigation suspecte détectée - possible problème de proxy');
        restoreState();
      }
      
      prevPathname.current = pathname;
    }
  }, [pathname]);
  
  // Fonction pour sauvegarder l'état valide
  const saveValidState = () => {
    if (isSearchFunnel && searchStore.formData) {
      lastValidState.current = {
        type: 'search',
        data: JSON.parse(JSON.stringify(searchStore.formData)),
        timestamp: Date.now(),
        pathname: pathname
      };
    } else if (isProposeFunnel && proposeStore.formData) {
      lastValidState.current = {
        type: 'propose', 
        data: JSON.parse(JSON.stringify(proposeStore.formData)),
        timestamp: Date.now(),
        pathname: pathname
      };
    }
  };
  
  // Fonction pour restaurer l'état
  const restoreState = () => {
    if (!lastValidState.current) return;
    
    const timeDiff = Date.now() - lastValidState.current.timestamp;
    
    // Restaurer seulement si l'état est récent (moins de 30 secondes)
    if (timeDiff < 30000) {
      console.log('🔄 Restauration du state depuis la sauvegarde:', lastValidState.current);
      
      if (lastValidState.current.type === 'search' && isSearchFunnel) {
        // Restaurer manuellement chaque partie du store
        const data = lastValidState.current.data;
        
        if (data.departure.isComplete) {
          searchStore.setDeparture(data.departure);
        }
        if (data.arrival.isComplete) {
          searchStore.setArrival(data.arrival);
        }
        if (data.volumeNeeded.neededVolume > 0) {
          searchStore.setVolumeNeeded(data.volumeNeeded);
        }
        if (data.budget.acceptsFees !== null) {
          searchStore.setBudget(data.budget);
        }
        if (data.announcementText) {
          searchStore.setAnnouncementText(data.announcementText);
        }
        if (data.contact.firstName || data.contact.email) {
          searchStore.setContact(data.contact);
        }
        
        // Restaurer l'étape courante
        searchStore.setCurrentStep(data.currentStep);
        
      } else if (lastValidState.current.type === 'propose' && isProposeFunnel) {
        // Similaire pour le store propose
        const data = lastValidState.current.data;
        
        if (data.departure.isComplete) {
          proposeStore.setDeparture(data.departure);
        }
        if (data.arrival.isComplete) {
          proposeStore.setArrival(data.arrival);
        }
        // ... autres champs
        
        proposeStore.setCurrentStep(data.currentStep);
      }
    }
  };
  
  // Vérification périodique de l'intégrité du state
  const checkStateIntegrity = () => {
    if (isSearchFunnel) {
      const currentState = searchStore.formData;
      
      // Vérifier si le state semble avoir été réinitialisé de manière suspecte
      const suspiciousReset = (
        currentState.currentStep === 1 &&
        !currentState.departure.isComplete &&
        !currentState.arrival.isComplete &&
        lastValidState.current &&
        lastValidState.current.data.currentStep > 1
      );
      
      if (suspiciousReset) {
        console.warn('⚠️ Réinitialisation suspecte du state détectée');
        restoreState();
      } else if (currentState.currentStep > 1) {
        // Sauvegarder l'état valide si on est avancé dans le funnel
        saveValidState();
      }
    }
    
    // Similaire pour propose funnel
    if (isProposeFunnel) {
      const currentState = proposeStore.formData;
      
      const suspiciousReset = (
        currentState.currentStep === 1 &&
        !currentState.departure.isComplete &&
        !currentState.arrival.isComplete &&
        lastValidState.current &&
        lastValidState.current.data.currentStep > 1
      );
      
      if (suspiciousReset) {
        console.warn('⚠️ Réinitialisation suspecte du state détectée (propose)');
        restoreState();
      } else if (currentState.currentStep > 1) {
        saveValidState();
      }
    }
  };
  
  // Activation de la protection
  useEffect(() => {
    if (isSearchFunnel || isProposeFunnel) {
      setProtectionActive(true);
      
      // Sauvegarder l'état initial
      saveValidState();
      
      // Démarrer la vérification périodique
      stateCheckInterval.current = setInterval(checkStateIntegrity, 1000);
      
      console.log('🛡️ Protection du state activée pour', isSearchFunnel ? 'search' : 'propose', 'funnel');
      
      return () => {
        if (stateCheckInterval.current) {
          clearInterval(stateCheckInterval.current);
        }
        setProtectionActive(false);
        console.log('🛡️ Protection du state désactivée');
      };
    }
  }, [isSearchFunnel, isProposeFunnel, pathname]);
  
  // Détection des contextes proxifiés
  const isProxiedContext = typeof window !== 'undefined' && 
    window.location.hostname === 'www.dodomove.fr';
  
  return {
    protectionActive,
    isProxiedContext,
    hasValidBackup: !!lastValidState.current,
    manualRestore: restoreState,
    manualSave: saveValidState,
    navigationCount: navigationCount.current
  };
} 