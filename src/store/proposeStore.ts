import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour les données du formulaire
export interface LocationData {
  country: string;
  city: string;
  postalCode: string;
  displayName: string;
  isComplete: boolean;
}

export interface ContainerData {
  type: '20' | '40' | '';
  availableVolume: number;
  minimumVolume: number;
}

export interface ContactData {
  firstName: string;
  email: string;
  phone?: string;
}

export interface ProposeFormData {
  // Locations
  departure: LocationData;
  arrival: LocationData;
  
  // Date d'expédition
  shippingDate: string;
  
  // Conteneur
  container: ContainerData;
  
  // Type d'offre
  offerType: 'free' | 'paid' | '';
  
  // Annonce
  announcementText: string;
  
  // Contact
  contact: ContactData;
  
  // Métadonnées
  currentStep: number;
  isCompleted: boolean;
}

// Store interface
interface ProposeStore {
  // État du formulaire
  formData: ProposeFormData;
  
  // Actions pour mettre à jour les données
  setDeparture: (data: Partial<LocationData>) => void;
  setArrival: (data: Partial<LocationData>) => void;
  setShippingDate: (date: string) => void;
  setContainerDetails: (type: '20' | '40', availableVolume: number, minimumVolume: number) => void;
  setOfferType: (type: 'free' | 'paid') => void;
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
const initialFormData: ProposeFormData = {
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
  shippingDate: '',
  container: {
    type: '',
    availableVolume: 0,
    minimumVolume: 0.1
  },
  offerType: '',
  announcementText: '',
  contact: {
    firstName: '',
    email: '',
    phone: ''
  },
  currentStep: 1,
  isCompleted: false
};

// Création du store avec persistance
export const useProposeStore = create<ProposeStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,

      // Actions pour les locations
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

      // Action pour la date
      setShippingDate: (date) => set((state) => ({
        formData: { ...state.formData, shippingDate: date }
      })),

      // Actions pour le conteneur
      setContainerDetails: (type, availableVolume, minimumVolume) => set((state) => ({
        formData: {
          ...state.formData,
          container: { type, availableVolume, minimumVolume }
        }
      })),

      // Action pour le type d'offre
      setOfferType: (offerType) => set((state) => ({
        formData: { ...state.formData, offerType }
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
        const nextStep = Math.min(state.formData.currentStep + 1, 7);
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
          case 2: // Date
            return Boolean(formData.shippingDate);
          case 3: // Conteneur
            return Boolean(formData.container.type && formData.container.availableVolume > 0);
          case 4: // Volume minimum
            return Boolean(formData.container.minimumVolume > 0);
          case 5: // Type d'offre
            return Boolean(formData.offerType);
          case 6: // Texte annonce
            return formData.announcementText.length >= 50;
          case 7: // Contact
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
        const completedSteps = [1, 2, 3, 4, 5, 6, 7].filter(step => isStepComplete(step)).length;
        return Math.round((completedSteps / 7) * 100);
      },

      reset: () => set({ formData: initialFormData })
    }),
    {
      name: 'propose-funnel-storage',
      partialize: (state) => ({ formData: state.formData })
    }
  )
);

// Hook utilitaire pour obtenir les données actuelles
export const useProposeFormData = () => {
  const formData = useProposeStore((state) => state.formData);
  return formData;
};

// Hook utilitaire pour les actions
export const useProposeActions = () => {
  const {
    setDeparture,
    setArrival,
    setShippingDate,
    setContainerDetails,
    setOfferType,
    setAnnouncementText,
    setContact,
    setCurrentStep,
    nextStep,
    previousStep,
    reset
  } = useProposeStore();
  
  return {
    setDeparture,
    setArrival,
    setShippingDate,
    setContainerDetails,
    setOfferType,
    setAnnouncementText,
    setContact,
    setCurrentStep,
    nextStep,
    previousStep,
    reset
  };
}; 