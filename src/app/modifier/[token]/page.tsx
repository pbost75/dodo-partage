'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Save, AlertTriangle, Calendar, Package, FileText, DollarSign, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import VolumeSelector from '@/components/ui/VolumeSelector';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CardRadioGroup from '@/components/ui/CardRadioGroup';
import { useToast } from '@/hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

// Interface pour les données du formulaire
interface FormData {
  shippingDate: string;
  announcementText: string;
  // Champs conditionnels selon le type
  // Pour offer:
  availableVolume: number;
  minimumVolume: number;
  offerType: 'free' | 'paid';
  // Pour search:
  volumeNeeded: number;
  acceptsCostSharing: boolean;
  shippingPeriod: string[]; // Périodes sélectionnées pour search
}

// Interface commune pour les deux types d'annonces
interface BaseAnnouncementData {
  reference: string;
  contact: {
    firstName: string;
    email: string;
    phone: string;
  };
  departure: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  shippingDate: string;
  announcementText: string;
  status: string;
  createdAt: string;
  requestType: 'search' | 'offer'; // Champ pour différencier les types
}

// Interface pour les annonces "offer" (propose de la place)
interface OfferAnnouncementData extends BaseAnnouncementData {
  requestType: 'offer';
  container: {
    type: '20' | '40';
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: 'free' | 'paid';
}

// Interface pour les annonces "search" (cherche de la place)
interface SearchAnnouncementData extends BaseAnnouncementData {
  requestType: 'search';
  volumeNeeded: {
    neededVolume: number;
    usedCalculator?: boolean;
  };
  acceptsCostSharing: boolean; // Accepte de participer aux frais
  shippingPeriod?: string[]; // Périodes sélectionnées pour search
}

type AnnouncementData = OfferAnnouncementData | SearchAnnouncementData;

export default function ModifierAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const token = params.token as string;
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Données du formulaire - adaptées selon le type
  const [formData, setFormData] = useState<FormData>({
    shippingDate: '',
    announcementText: '',
    // Champs conditionnels selon le type
    // Pour offer:
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free',
    // Pour search:
    volumeNeeded: 0,
    acceptsCostSharing: false,
    shippingPeriod: []
  });

  // Nouvel état pour la popup de confirmation
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // États pour le sélecteur de période (search)
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isPeriodFocused, setIsPeriodFocused] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Spécifications des conteneurs
  const containerSpecs = {
    '20': { totalVolume: 33, maxAvailable: 25, description: '~33 m³ total' },
    '40': { totalVolume: 67, maxAvailable: 50, description: '~67 m³ total' }
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Charger les données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser la nouvelle route GET qui traite les données de période
        const response = await fetch(`/api/update-announcement/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Token de modification invalide ou expiré. Cette annonce n\'existe peut-être plus.');
          } else {
            throw new Error('Erreur lors du chargement de l\'annonce');
          }
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Format de réponse invalide');
        }
        
        const announcementData = result.data;
        setAnnouncement(announcementData);
        
        console.log('📋 Données récupérées:', {
          requestType: announcementData.requestType,
          hasShippingPeriod: !!announcementData.shippingPeriod,
          shippingPeriodLength: announcementData.shippingPeriod?.length || 0,
          hasShippingDate: !!announcementData.shippingDate
        });
        
        // Initialiser les données du formulaire selon le type
        if (announcementData.requestType === 'search') {
          // Pour les demandes de place
          const initialFormData: FormData = {
            shippingDate: announcementData.shippingDate || '',
            announcementText: announcementData.announcementText || '',
            volumeNeeded: announcementData.volumeNeeded?.neededVolume || 0,
            acceptsCostSharing: announcementData.acceptsCostSharing || false,
            shippingPeriod: announcementData.shippingPeriod || [], // Maintenant disponible depuis le backend
            // Valeurs par défaut pour les champs offer (non utilisés)
            availableVolume: 0,
            minimumVolume: 0,
            offerType: 'free'
          };
          setFormData(initialFormData);
          console.log('🔍 Données search initialisées:', {
            volumeNeeded: initialFormData.volumeNeeded,
            acceptsCostSharing: initialFormData.acceptsCostSharing,
            shippingPeriod: initialFormData.shippingPeriod
          });
        } else {
          // Pour les offres de place (type 'offer')
          const initialFormData: FormData = {
          shippingDate: announcementData.shippingDate || '',
            announcementText: announcementData.announcementText || '',
          availableVolume: announcementData.container?.availableVolume || 0,
          minimumVolume: announcementData.container?.minimumVolume || 0,
          offerType: announcementData.offerType || 'free',
            // Valeurs par défaut pour les champs search (non utilisés)
            volumeNeeded: 0,
            acceptsCostSharing: false,
            shippingPeriod: []
        };
        setFormData(initialFormData);
        
          // Validation initiale des volumes pour les offres
        if (announcementData.container?.type) {
          validateVolumes(
            initialFormData.availableVolume,
            initialFormData.minimumVolume,
            announcementData.container.type
          );
          }
          console.log('📦 Données offer initialisées:', {
            availableVolume: initialFormData.availableVolume,
            minimumVolume: initialFormData.minimumVolume,
            offerType: initialFormData.offerType
          });
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [token]);

  // Validation des volumes (reprise du funnel)
  const validateVolumes = (availableVolume: number, minimumVolume: number, containerType: '20' | '40') => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    // Validation volume disponible
    if (availableVolume <= 0) {
      newErrors.push('Le volume disponible doit être supérieur à 0');
    } else {
      const specs = containerSpecs[containerType];
      
      // ERREUR : Dépasse le maximum absolu
      if (availableVolume > specs.maxAvailable) {
        newErrors.push(`Volume trop important pour un conteneur ${containerType} pieds (max recommandé: ${specs.maxAvailable} m³)`);
      }
      
      // AVERTISSEMENT : Volume important mais acceptable (dès 50% du total)
      if (newErrors.length === 0 && availableVolume > specs.totalVolume * 0.5) {
        newWarnings.push('Volume important, vérifiez que vous avez vraiment autant d\'espace libre');
      }
    }

    // Validation volume minimum (accepte maintenant 0-5 entiers)
    if (minimumVolume < 0 || minimumVolume > 5) {
      newErrors.push('Le volume minimum doit être entre 0 et 5 m³');
    } else if (minimumVolume > availableVolume) {
      newErrors.push('Le volume minimum ne peut pas être supérieur au volume disponible');
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  };

  // Validation du volume recherché pour les demandes
  const validateVolumeNeeded = (volumeNeeded: number, containerType: '20' | '40') => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    if (volumeNeeded <= 0) {
      newErrors.push('Le volume recherché doit être supérieur à 0');
    } else {
      const specs = containerSpecs[containerType];
      
      if (volumeNeeded > specs.maxAvailable) {
        newErrors.push(`Volume trop important pour un conteneur ${containerType} pieds (max: ${specs.maxAvailable} m³)`);
      } else if (volumeNeeded > specs.totalVolume * 0.5) {
        newWarnings.push('Volume important, assurez-vous que c\'est nécessaire');
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  };

  // Gestionnaires d'événements
  const handleAvailableVolumeChange = (value: number) => {
    setFormData(prev => ({ ...prev, availableVolume: value }));
    if (announcement && announcement.requestType === 'offer') {
      const offerAnnouncement = announcement as OfferAnnouncementData;
      validateVolumes(value, formData.minimumVolume, offerAnnouncement.container.type);
    }
  };

  const handleMinimumVolumeChange = (value: number) => {
    setFormData(prev => ({ ...prev, minimumVolume: value }));
    if (announcement && announcement.requestType === 'offer') {
      const offerAnnouncement = announcement as OfferAnnouncementData;
      validateVolumes(formData.availableVolume, value, offerAnnouncement.container.type);
    }
  };

  const handleVolumeNeededChange = (value: number) => {
    setFormData(prev => ({ ...prev, volumeNeeded: value }));
    // Pour les annonces search, utiliser un type de conteneur par défaut pour la validation
    validateVolumeNeeded(value, '20'); // Utiliser 20 pieds par défaut pour les validations
  };

  const handleCostSharingChange = (accepts: boolean) => {
    setFormData(prev => ({ ...prev, acceptsCostSharing: accepts }));
  };

  const handleShippingPeriodChange = (months: string[]) => {
    setFormData(prev => ({ ...prev, shippingPeriod: months }));
  };

  // Fonctions utilitaires pour la gestion des mois (similaires au funnel)
  const formatMonthKey = (month: string, year: number) => `${month} ${year}`;

  const getMonthIndex = (monthName: string, year: number) => {
    const monthIndex = months.indexOf(monthName);
    return year * 12 + monthIndex;
  };

  const getMonthFromIndex = (index: number) => {
    const year = Math.floor(index / 12);
    const monthIndex = index % 12;
    return { month: months[monthIndex], year };
  };

  const createConsecutiveRange = (startIndex: number, endIndex: number) => {
    const range = [];
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    for (let i = start; i <= end; i++) {
      const { month, year } = getMonthFromIndex(i);
      range.push(formatMonthKey(month, year));
    }
    return range;
  };

  // Gestion de la sélection des mois
  const handleMonthToggle = (month: string, year: number) => {
    const clickedIndex = getMonthIndex(month, year);
    
    if (formData.shippingPeriod.length === 0) {
      // Premier mois sélectionné
      handleShippingPeriodChange([formatMonthKey(month, year)]);
    } else {
      // Calculer les indices actuels
      const currentIndices = formData.shippingPeriod.map(m => {
        const [monthName, yearStr] = m.split(' ');
        return getMonthIndex(monthName, parseInt(yearStr));
      });
      
      const minIndex = Math.min(...currentIndices);
      const maxIndex = Math.max(...currentIndices);
      
      // Si on clique sur un mois déjà dans la sélection, on repart de ce mois uniquement
      if (currentIndices.includes(clickedIndex)) {
        handleShippingPeriodChange([formatMonthKey(month, year)]);
      } else {
        // Étendre la sélection pour créer une période consécutive
        let newRange;
        if (clickedIndex < minIndex) {
          // Étendre vers le début
          newRange = createConsecutiveRange(clickedIndex, maxIndex);
        } else if (clickedIndex > maxIndex) {
          // Étendre vers la fin
          newRange = createConsecutiveRange(minIndex, clickedIndex);
        } else {
          // Le mois est au milieu, on repart de ce mois
          newRange = [formatMonthKey(month, year)];
        }
        handleShippingPeriodChange(newRange);
      }
    }
  };

  const clearAllPeriods = () => {
    handleShippingPeriodChange([]);
  };

  // Fonction pour afficher la période sélectionnée
  const getPeriodDisplayText = () => {
    if (formData.shippingPeriod.length === 0) return 'Sélectionnez une période';
    if (formData.shippingPeriod.length === 1) return formData.shippingPeriod[0];
    
    // Afficher la période de début à fin
    const sortedMonths = [...formData.shippingPeriod].sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
    
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    
    return `${firstMonth} - ${lastMonth}`;
  };

  // Options pour la participation aux frais - style CardRadioGroup
  const participationOptions = [
    {
      value: 'yes',
      label: 'Oui, je peux participer',
      description: 'Avec participation aux frais',
      emoji: '💰'
    },
    {
      value: 'no', 
      label: 'Non, transport gratuit',
      description: 'Uniquement gratuit',
      emoji: '🆓'
    }
  ];

  const handleSave = async () => {
    if (!announcement) return;
    
    // Validation finale selon le type
    if (announcement.requestType === 'search') {
      if (formData.volumeNeeded <= 0) {
        showErrorToast('Le volume recherché doit être supérieur à 0');
        return;
      }
      if (formData.shippingPeriod.length === 0) {
        showErrorToast('Veuillez sélectionner au moins une période d\'expédition');
        return;
      }
    } else {
      if (formData.availableVolume <= 0) {
        showErrorToast('Le volume disponible doit être supérieur à 0');
        return;
      }
      if (formData.minimumVolume > formData.availableVolume) {
        showErrorToast('Le volume minimum ne peut pas être supérieur au volume disponible');
        return;
      }
      if (!formData.shippingDate) {
        showErrorToast('Veuillez sélectionner une date d\'expédition');
        return;
      }
    }

    if (errors.length > 0) {
      showErrorToast('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Préparer les données selon le type d'annonce
      let updateData: any = {
        reference: announcement.reference,
        status: announcement.status,
        contact: announcement.contact,
        departure: announcement.departure,
        arrival: announcement.arrival,
        announcementText: formData.announcementText,
        updatedAt: new Date().toISOString()
      };
      
      if (announcement.requestType === 'search') {
        // Pour les demandes de place
        updateData = {
          ...updateData,
          volumeNeeded: formData.volumeNeeded,
          acceptsFees: formData.acceptsCostSharing,
          shippingPeriod: formData.shippingPeriod // Envoyer la période sélectionnée
        };
        console.log('💾 Sauvegarde search avec:', {
          volumeNeeded: formData.volumeNeeded,
          acceptsFees: formData.acceptsCostSharing,
          shippingPeriod: formData.shippingPeriod
        });
      } else {
        // Pour les offres de place
        updateData = {
          ...updateData,
          shippingDate: formData.shippingDate,
          container: {
            type: announcement.container.type,
            availableVolume: formData.availableVolume,
            minimumVolume: formData.minimumVolume
          },
          offerType: formData.offerType
        };
        console.log('💾 Sauvegarde offer avec:', {
          shippingDate: formData.shippingDate,
          availableVolume: formData.availableVolume,
          minimumVolume: formData.minimumVolume,
          offerType: formData.offerType
        });
      }
      
      // Utiliser la nouvelle route PUT
      const response = await fetch(`/api/update-announcement/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      console.log('✅ Annonce sauvegardée avec succès');
      
      // Afficher la popup de succès
      setShowSuccessModal(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      console.error('❌ Erreur de sauvegarde:', errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Popup de succès
  const SuccessModal = () => (
    <AnimatePresence>
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ✅ Annonce mise à jour
            </h3>
            
            <p className="text-gray-600 mb-6">
              Vos modifications ont été sauvegardées avec succès.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1"
              >
                Continuer à modifier
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Retour aux annonces
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
            </div>
          </div>
        </div>

        {/* Loading */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#243163] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour aux annonces</span>
            </button>
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
            </div>
          </div>
        </div>

      {/* Contenu */}
        <div className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Impossible de modifier l'annonce
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Retour aux annonces
            </Button>
          </div>
        ) : announcement ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Modifier l'annonce {announcement.reference}
            </h1>
            
            {/* Aperçu de l'annonce */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de l'annonce
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Référence:</strong> {announcement.reference}</p>
                <p><strong>Type:</strong> {announcement.requestType === 'search' ? '🔍 Cherche de la place' : '📦 Propose de la place'}</p>
                <p><strong>Trajet:</strong> {announcement.departure.displayName} → {announcement.arrival.displayName}</p>
                <p><strong>Contact:</strong> {announcement.contact.firstName} ({announcement.contact.email})</p>
                <p><strong>Conteneur:</strong> {announcement.requestType === 'offer' ? `${(announcement as OfferAnnouncementData).container.type} pieds ${containerSpecs[(announcement as OfferAnnouncementData).container.type].description}` : 'Variable selon l\'espace disponible'}</p>
        </div>
      </div>

            {/* Formulaire de modification */}
            <div className="space-y-8">
              {/* Date/Période d'expédition selon le type */}
              {announcement.requestType === 'search' ? (
                <div className="relative">
                  {/* Interface visuelle identique au CustomDatePicker */}
                  <div
                    className={`peer block w-full border rounded-xl px-4 h-16 md:h-20 pt-5 md:pt-7 pb-2 text-base md:text-lg bg-white text-gray-900 cursor-pointer focus:outline-none transition-all duration-200
                      ${isPeriodFocused ? 'border-blue-500' : 'border-gray-300'}
                      ${isPeriodOpen ? 'shadow-sm' : ''}`}
                    onClick={() => {
                      setIsPeriodOpen(!isPeriodOpen);
                      setIsPeriodFocused(true);
                    }}
                    role="textbox"
                    aria-expanded={isPeriodOpen}
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate font-['Lato']">
                        {getPeriodDisplayText()}
          </div>
                      <span className="text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </span>
        </div>
      </div>

                  {/* Label flottant */}
                  <label
                    className={`absolute left-4 bg-white px-2 text-base -top-2 -translate-y-1 scale-90 transition-colors duration-200 pointer-events-none z-10
                      ${isPeriodFocused ? 'text-blue-700' : 'text-gray-500'}`}
                  >
                    Période d'expédition souhaitée
                  </label>

                  {/* Picker modal quand ouvert */}
                  {isPeriodOpen && (
                    <div className="absolute z-50 top-full mt-1 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md">
                      {/* Instructions */}
                      {formData.shippingPeriod.length === 0 && (
                        <div className="text-center py-2 mb-4">
                          <p className="text-xs text-gray-500">
                            Cliquez sur un mois, puis étendez votre sélection
                          </p>
                        </div>
                      )}

                      {/* Sélecteur d'année */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCurrentYear(currentYear - 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-900">{currentYear}</span>
                        <button
                          onClick={() => setCurrentYear(currentYear + 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Grille des mois */}
                      <div className="grid grid-cols-3 gap-2">
                        {months.map(month => {
                          const monthKey = formatMonthKey(month, currentYear);
                          const isSelected = formData.shippingPeriod.includes(monthKey);
                          const isPast = currentYear === new Date().getFullYear() && 
                                       months.indexOf(month) < new Date().getMonth();

                          return (
                            <button
                              key={month}
                              onClick={() => {
                                handleMonthToggle(month, currentYear);
                              }}
                              disabled={isPast}
                              className={`
                                p-3 rounded-lg text-sm font-medium transition-all duration-200 relative group
                                ${isSelected 
                                  ? 'bg-[#F47D6C] text-white shadow-sm transform scale-105' 
                                  : isPast 
                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm cursor-pointer'
                                }
                                ${!isPast && !isSelected ? 'border border-transparent hover:scale-102' : ''}
                              `}
                              title={isPast ? 'Mois passé' : isSelected ? 'Cliquez pour modifier la sélection' : 'Cliquez pour sélectionner cette période'}
                            >
                              {month}
                              {!isPast && !isSelected && (
                                <div className="absolute inset-0 rounded-lg border-2 border-blue-300 opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                              )}
                            </button>
                          );
                        })}
              </div>

                      {/* Boutons de validation */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          {formData.shippingPeriod.length > 0 && (
                            <button
                              onClick={() => {
                                clearAllPeriods();
                              }}
                              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Effacer
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsPeriodOpen(false);
                              setIsPeriodFocused(false);
                            }}
                            className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Valider
                          </button>
              </div>
            </div>
          </div>
                  )}
                </div>
              ) : (
            <div>
              <CustomDatePicker
                    label="Date d'expédition souhaitée"
                value={formData.shippingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                    placeholder="Sélectionner une date"
              />
            </div>
              )}

              {/* Volume - Conditionnel selon le type */}
              {announcement.requestType === 'search' ? (
                // Pour les demandes de place
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <Search className="w-5 h-5 text-[#243163]" />
                    Volume recherché (m³)
                  </label>
                  <VolumeSelector
                    value={formData.volumeNeeded}
                    onChange={handleVolumeNeededChange}
                    max={containerSpecs['20'].maxAvailable}
                    label="Volume recherché"
                    step={0.1}
                    min={0.1}
                  />
                </div>
              ) : (
                // Pour les offres de place
                <>
              <div>
                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Package className="w-5 h-5 text-[#243163]" />
                      Volume disponible (m³)
                    </label>
                                    <VolumeSelector
                      value={formData.availableVolume}
                      onChange={handleAvailableVolumeChange}
                      max={announcement.requestType === 'offer' ? containerSpecs[(announcement as OfferAnnouncementData).container.type].maxAvailable : containerSpecs['20'].maxAvailable}
                      label="Volume disponible"
                    />
              </div>
              
              <div>
                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Package className="w-5 h-5 text-[#243163]" />
                      Volume minimum accepté (m³)
                    </label>
                <VolumeSelector
                  value={formData.minimumVolume}
                  onChange={handleMinimumVolumeChange}
                  max={5}
                      label="Volume minimum"
                  step={1}
                      min={0}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Volume minimum que vous acceptez de transporter (0 = pas de minimum)
                    </p>
                  </div>
                </>
              )}

              {/* Participation aux frais / Type d'offre - Conditionnel */}
              {announcement.requestType === 'search' ? (
                // Pour les demandes de place
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <DollarSign className="w-5 h-5 text-[#243163]" />
                    Participation aux frais
                  </label>
                  <CardRadioGroup
                    name="participation"
                    options={participationOptions}
                    value={formData.acceptsCostSharing === true ? 'yes' : formData.acceptsCostSharing === false ? 'no' : ''}
                    onChange={(value) => handleCostSharingChange(value === 'yes')}
                  />
                  </div>
              ) : (
                // Pour les offres de place
            <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <DollarSign className="w-5 h-5 text-[#243163]" />
                Type d'offre
              </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                  <input
                    type="radio"
                    name="offerType"
                    value="free"
                    checked={formData.offerType === 'free'}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                    className="mr-3"
                  />
                      <span>Gratuit</span>
                </label>
                    <label className="flex items-center">
                  <input
                    type="radio"
                    name="offerType"
                    value="paid"
                    checked={formData.offerType === 'paid'}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                    className="mr-3"
                  />
                      <span>Avec participation aux frais</span>
                    </label>
                  </div>
              </div>
              )}

            {/* Description */}
            <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <FileText className="w-5 h-5 text-[#243163]" />
                  {announcement.requestType === 'search' ? 'Description de votre demande' : 'Description de votre offre'}
              </label>
                <textarea
                  value={formData.announcementText}
                  onChange={(e) => setFormData(prev => ({ ...prev, announcementText: e.target.value }))}
                  placeholder={announcement.requestType === 'search' ? 
                    "Décrivez ce que vous souhaitez transporter..." : 
                    "Décrivez votre offre de transport..."
                  }
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#243163] focus:border-transparent"
                />
              </div>

              {/* Alertes d'erreur/avertissement */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Erreurs à corriger :</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Eye className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Avertissements :</h4>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
              </div>
            </div>
          </div>
              )}

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || errors.length > 0}
              loading={isSaving}
              icon={!isSaving ? <Save className="w-4 h-4" /> : undefined}
              iconPosition="left"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </div>
        </div>
          </div>
        ) : null}
      </div>

      {/* Popup de succès */}
      <SuccessModal />
    </div>
  );
}