'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Check, AlertTriangle, Eye, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Import des composants UI
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import VolumeSelector from '@/components/ui/VolumeSelector';
import CustomSelect from '@/components/ui/CustomSelect';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpBlock from '@/components/ui/HelpBlock';

interface AnnouncementData {
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
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
  };
  shippingDate: string;
  container: {
    type: '20' | '40';
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: 'free' | 'paid';
  announcementText: string;
  status: string;
  createdAt: string;
}

// Options pour le type d'offre
const offerTypeOptions = [
  { value: 'free', label: 'Gratuit', description: 'Partage solidaire' },
  { value: 'paid', label: 'Participation', description: 'Avec participation aux frais' }
];

export default function ModifierAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast, info: showInfoToast } = useToast();
  const token = params.token as string;
  
  // États
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Données du formulaire (champs modifiables uniquement)
  const [formData, setFormData] = useState({
    shippingDate: '',
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free' as 'free' | 'paid',
    announcementText: ''
  });

  // Données originales pour détecter les changements
  const [originalData, setOriginalData] = useState({
    shippingDate: '',
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free' as 'free' | 'paid',
    announcementText: ''
  });

  // Ref pour éviter les sauvegardes multiples
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const backendUrl = 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
        
        if (!response.ok) {
          throw new Error('Annonce introuvable');
        }
        
        const data = await response.json();
        setAnnouncement(data);
        
        // Initialiser les données du formulaire
        const initialFormData = {
          shippingDate: data.shippingDate,
          availableVolume: data.container.availableVolume,
          minimumVolume: data.container.minimumVolume,
          offerType: data.offerType,
          announcementText: data.announcementText
        };
        
        setFormData(initialFormData);
        setOriginalData({ ...initialFormData });
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showErrorToast('Erreur lors du chargement de l\'annonce');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [token, router, showErrorToast]);

  // Détecter les changements
  useEffect(() => {
    const hasChanges = (
      formData.shippingDate !== originalData.shippingDate ||
      formData.availableVolume !== originalData.availableVolume ||
      formData.minimumVolume !== originalData.minimumVolume ||
      formData.offerType !== originalData.offerType ||
      formData.announcementText !== originalData.announcementText
    );
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      // Annuler le timeout précédent
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Programmer une nouvelle sauvegarde dans 2 secondes
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }
    
    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isSaving]);

  // Sauvegarde automatique
  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/update-announcement/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcement,
          shippingDate: formData.shippingDate,
          container: {
            ...announcement!.container,
            availableVolume: formData.availableVolume,
            minimumVolume: formData.minimumVolume
          },
          offerType: formData.offerType,
          announcementText: formData.announcementText,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Mettre à jour les données originales
        setOriginalData({ ...formData });
        setLastSaved(new Date());
        showSuccessToast('✅ Modifications sauvegardées');
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde automatique:', error);
      showErrorToast('❌ Erreur lors de la sauvegarde automatique');
    } finally {
      setIsSaving(false);
    }
  };

  // Sauvegarde manuelle
  const handleManualSave = async () => {
    if (!hasUnsavedChanges) {
      showInfoToast('Aucune modification à sauvegarder');
      return;
    }
    
    // Annuler la sauvegarde automatique en cours
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    await handleAutoSave();
  };

  // Navigation avec protection
  const handleNavigation = (url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(url);
      setShowExitWarning(true);
    } else {
      router.push(url);
    }
  };

  // Confirmer la sortie sans sauvegarder
  const handleConfirmExit = () => {
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
    }
  };

  // Sauvegarder avant de sortir
  const handleSaveAndExit = async () => {
    await handleAutoSave();
    if (pendingNavigation) {
      // Petite attente pour s'assurer que la sauvegarde est terminée
      setTimeout(() => {
        window.location.href = pendingNavigation!;
      }, 500);
    }
  };

  // Gestionnaires de changement
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
    setFormData(prev => ({ ...prev, shippingDate: e.target.value }));
  };

  const handleVolumeAvailableChange = (value: number) => {
    setFormData(prev => ({ ...prev, availableVolume: value }));
  };

  const handleVolumeMinimumChange = (value: number) => {
    setFormData(prev => ({ ...prev, minimumVolume: value }));
  };

  const handleOfferTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, offerType: value as 'free' | 'paid' }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, announcementText: e.target.value }));
  };

  // Protection avant fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">Annonce introuvable</div>
            <p className="text-gray-600 mb-6">Cette annonce n'existe pas ou le lien n'est plus valide.</p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Format de la date pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header avec indicateur de sauvegarde */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl mb-6 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNavigation('/')}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Modification de l'annonce
                  </h1>
                  <p className="text-gray-600">{announcement.reference}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Indicateur de sauvegarde */}
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Sauvegarde...</span>
                    </div>
                  )}
                  
                  {hasUnsavedChanges && !isSaving && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Non sauvegardé</span>
                    </div>
                  )}
                  
                  {!hasUnsavedChanges && !isSaving && lastSaved && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">
                        Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavigation(`/annonce/${announcement.reference}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir l'annonce</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de modification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
          >
            {/* Informations non modifiables */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations de l'annonce
              </h2>
              
              {/* Contact (lecture seule) */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contact
                  </h3>
                  <Badge variant="status" className="text-xs">
                    Non modifiable
                  </Badge>
                  <HelpBlock 
                    content="💡 Pour modifier ces informations, supprimez cette annonce et créez-en une nouvelle"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Prénom :</span>
                    <p className="font-medium">{announcement.contact.firstName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email :</span>
                    <p className="font-medium">{announcement.contact.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Téléphone :</span>
                    <p className="font-medium">{announcement.contact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Trajet (lecture seule) */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Trajet
                  </h3>
                  <Badge variant="status" className="text-xs">
                    Non modifiable
                  </Badge>
                  <HelpBlock 
                    content="💡 Pour modifier ces informations, supprimez cette annonce et créez-en une nouvelle"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-sm">Départ :</span>
                    <p className="font-medium">
                      {announcement.departure.city}, {announcement.departure.country}
                      {announcement.departure.postalCode && ` (${announcement.departure.postalCode})`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Arrivée :</span>
                    <p className="font-medium">
                      {announcement.arrival.city}, {announcement.arrival.country}
                      {announcement.arrival.postalCode && ` (${announcement.arrival.postalCode})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Type de conteneur (lecture seule) */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Conteneur
                  </h3>
                  <Badge variant="status" className="text-xs">
                    Non modifiable
                  </Badge>
                  <HelpBlock 
                    content="💡 Pour modifier ces informations, supprimez cette annonce et créez-en une nouvelle"
                  />
                </div>
                <p className="font-medium">
                  Conteneur {announcement.container.type} pieds 
                  <span className="text-gray-500 ml-2">
                    (~{announcement.container.type === '20' ? '33' : '67'} m³ total)
                  </span>
                </p>
              </div>
            </div>

            {/* Champs modifiables */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations modifiables
              </h2>

              {/* Date de transport */}
              <div>
                <CustomDatePicker
                  label="Date de transport souhaitée"
                  value={formData.shippingDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  name="shippingDate"
                />
              </div>

              {/* Volumes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VolumeSelector
                  label="Volume disponible (m³)"
                  value={formData.availableVolume}
                  onChange={handleVolumeAvailableChange}
                  min={0.5}
                  max={announcement.container.type === '20' ? 25 : 50}
                  step={0.5}
                  unit="m³"
                />
                
                <VolumeSelector
                  label="Volume minimum accepté (m³)"
                  value={formData.minimumVolume}
                  onChange={handleVolumeMinimumChange}
                  min={0.1}
                  max={formData.availableVolume}
                  step={0.1}
                  unit="m³"
                />
              </div>

              {/* Type d'offre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'offre
                </label>
                <CustomSelect
                  value={formData.offerType}
                  onChange={handleOfferTypeChange}
                  options={offerTypeOptions}
                />
              </div>

              {/* Description */}
              <div>
                <FloatingTextarea
                  label="Description de votre offre"
                  value={formData.announcementText}
                  onChange={handleTextChange}
                  placeholder="Décrivez votre offre de partage..."
                  rows={4}
                  maxLength={1000}
                  name="announcementText"
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {formData.announcementText.length}/1000 caractères
                </div>
              </div>
            </div>

            {/* Bouton de sauvegarde manuelle */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`px-8 py-3 flex items-center gap-2 ${
                  hasUnsavedChanges 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Sauvegarde...' : hasUnsavedChanges ? 'Sauvegarder maintenant' : 'Aucune modification'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal d'avertissement de sortie */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Modifications non sauvegardées
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleSaveAndExit}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder et continuer
                    </Button>
                    
                    <Button
                      onClick={handleConfirmExit}
                      variant="secondary"
                      className="w-full border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Quitter sans sauvegarder
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowExitWarning(false);
                        setPendingNavigation(null);
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}