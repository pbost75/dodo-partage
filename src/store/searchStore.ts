import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour les données du formulaire "cherche"
export interface LocationData {
  country: string;
  city: string;
  postalCode: string;
  displayName: string;
  isComplete: boolean;
}

export interface ShippingPeriodData {
  period: 'flexible' | 'specific' | '';
  preferredMonth?: string; // Pour période flexible (deprecated)
  specificDate?: string;   // Pour date spécifique (deprecated)
  selectedMonths?: string[]; // Nouvelle approche simplifiée
  urgency: 'urgent' | 'normal' | 'flexible' | '';
}

export interface VolumeNeededData {
  neededVolume: number;
  usedCalculator?: boolean;
  listingItems?: string;
  volumeDescription?: string;
}

export interface BudgetData {
  acceptsFees: boolean | null; // null = pas encore répondu, true = oui, false = non
}

export interface ContactData {
  firstName: string;
  email: string;
  phone?: string;
}

export interface SearchFormData {
  // Locations (identique à propose)
  departure: LocationData;
  arrival: LocationData;
  
  // Période d'expédition (plus flexible)
  shippingPeriod: ShippingPeriodData;
  
  // Volume recherché
  volumeNeeded: VolumeNeededData;
  
  // Budget
  budget: BudgetData;
  
  // Annonce (adaptée pour "cherche")
  announcementText: string;
  
  // Contact (identique à propose)
  contact: ContactData;
  
  // Métadonnées
  currentStep: number;
  isCompleted: boolean;
  funnelType: 'search'; // Différenciation avec propose
}

// Store interface
interface SearchStore {
  // État du formulaire
  formData: SearchFormData;
  
  // Actions pour mettre à jour les données
  setDeparture: (data: Partial<LocationData>) => void;
  setArrival: (data: Partial<LocationData>) => void;
  setShippingPeriod: (data: Partial<ShippingPeriodData>) => void;
  setVolumeNeeded: (data: Partial<VolumeNeededData>) => void;
  setBudget: (data: Partial<BudgetData>) => void;
  setAnnouncementText: (text: string) => void;
  setContact: (contact: Partial<ContactData>) => void;
  
  // Actions de navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Utilitaires
  isStepComplete: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
  getProgress: () => number;
  reset: () => void;
}

// État initial
const initialFormData: SearchFormData = {
  departure: {
    country: '',
    city: '',
    postalCode: '',
    displayName: '',
    isComplete: false
  },
  arrival: {
    country: '',
    city: '',
    postalCode: '',
    displayName: '',
    isComplete: false
  },
  shippingPeriod: {
    period: 'flexible',
    selectedMonths: [], // Sera peuplé automatiquement si vide lors de la soumission
    urgency: 'flexible'
  },
  volumeNeeded: {
    neededVolume: 0
  },
  budget: {
    acceptsFees: null
  },
  announcementText: '',
  contact: {
    firstName: '',
    email: '',
    phone: ''
  },
  currentStep: 1,
  isCompleted: false,
  funnelType: 'search'
};

// Création du store avec persistance
export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,

      // Actions pour les locations (identiques à propose)
      setDeparture: (data) => set((state) => ({
        formData: {
          ...state.formData,
          departure: {
            ...state.formData.departure,
            ...data,
            isComplete: Boolean(data.country && data.city)
          }
        }
      })),

      setArrival: (data) => set((state) => ({
        formData: {
          ...state.formData,
          arrival: {
            ...state.formData.arrival,
            ...data,
            isComplete: Boolean(data.country && data.city)
          }
        }
      })),

      // Action pour la période d'expédition
      setShippingPeriod: (data) => set((state) => ({
        formData: {
          ...state.formData,
          shippingPeriod: { ...state.formData.shippingPeriod, ...data }
        }
      })),

      // Action pour le volume recherché
      setVolumeNeeded: (data) => set((state) => ({
        formData: {
          ...state.formData,
          volumeNeeded: { ...state.formData.volumeNeeded, ...data }
        }
      })),

      // Action pour le budget
      setBudget: (data) => set((state) => ({
        formData: {
          ...state.formData,
          budget: { ...state.formData.budget, ...data }
        }
      })),

      // Action pour le texte d'annonce
      setAnnouncementText: (text) => set((state) => ({
        formData: { ...state.formData, announcementText: text }
      })),

      // Actions pour le contact
      setContact: (contact) => set((state) => ({
        formData: {
          ...state.formData,
          contact: { ...state.formData.contact, ...contact }
        }
      })),

      // Actions de navigation
      setCurrentStep: (step) => set((state) => ({
        formData: { ...state.formData, currentStep: step }
      })),

      nextStep: () => set((state) => {
        const nextStep = Math.min(state.formData.currentStep + 1, 6);
        return {
          formData: { ...state.formData, currentStep: nextStep }
        };
      }),

      previousStep: () => set((state) => {
        const prevStep = Math.max(state.formData.currentStep - 1, 1);
        return {
          formData: { ...state.formData, currentStep: prevStep }
        };
      }),

      // Utilitaires
      isStepComplete: (step) => {
        const { formData } = get();
        
        switch (step) {
          case 1: // Locations
            return formData.departure.isComplete && formData.arrival.isComplete;
          case 2: // Période d'expédition - Temporairement toujours valide
            return true; // TODO: Retourner à Boolean(formData.shippingPeriod.selectedMonths && formData.shippingPeriod.selectedMonths.length > 0) une fois le problème résolu
          case 3: // Volume recherché
            return Boolean(formData.volumeNeeded.neededVolume > 0);
          case 4: // Budget
            return formData.budget.acceptsFees !== null;
          case 5: // Texte annonce
            return formData.announcementText.length >= 50;
          case 6: // Contact
            return Boolean(formData.contact.firstName && formData.contact.email);
          default:
            return false;
        }
      },

      canProceedToStep: (step) => {
        const { isStepComplete } = get();
        
        // Peut aller à l'étape 1 toujours
        if (step === 1) return true;
        
        // Pour les autres étapes, toutes les précédentes doivent être complètes
        for (let i = 1; i < step; i++) {
          if (!isStepComplete(i)) return false;
        }
        
        return true;
      },

      getProgress: () => {
        const { isStepComplete } = get();
        const completedSteps = [1, 2, 3, 4, 5, 6].filter(step => isStepComplete(step)).length;
        return Math.round((completedSteps / 6) * 100);
      },

      reset: () => set({ formData: initialFormData })
    }),
    {
      name: 'search-funnel-storage',
      partialize: (state) => ({ formData: state.formData })
    }
  )
);

// Hook utilitaire pour obtenir les données actuelles
export const useSearchFormData = () => {
  const formData = useSearchStore((state) => state.formData);
  return formData;
};

// Hook utilitaire pour les actions
export const useSearchActions = () => {
  const {
    setDeparture,
    setArrival,
    setShippingPeriod,
    setVolumeNeeded,
    setBudget,
    setAnnouncementText,
    setContact,
    setCurrentStep,
    nextStep,
    previousStep,
    reset
  } = useSearchStore();
  
  return {
    setDeparture,
    setArrival,
    setShippingPeriod,
    setVolumeNeeded,
    setBudget,
    setAnnouncementText,
    setContact,
    setCurrentStep,
    nextStep,
    previousStep,
    reset
  };
}; 