'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Save, AlertTriangle, Calendar, Package, FileText, DollarSign, Eye, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import VolumeSelector from '@/components/ui/VolumeSelector';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import MonthPicker from '@/components/ui/MonthPicker';
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
  container: {
    type: '20' | '40';
    volumeNeeded: number; // Volume recherché
  };
  acceptsCostSharing: boolean; // Accepte de participer aux frais
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

  // Spécifications des conteneurs
  const containerSpecs = {
    '20': { totalVolume: 33, maxAvailable: 25, description: '~33 m³ total' },
    '40': { totalVolume: 67, maxAvailable: 50, description: '~67 m³ total' }
  };

  // Charger les données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
        
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
        
        // Initialiser les données du formulaire selon le type
        if (announcementData.requestType === 'search') {
          // Pour les demandes de place
          const initialFormData: FormData = {
            shippingDate: announcementData.shippingDate || '',
            announcementText: announcementData.announcementText || '',
            volumeNeeded: announcementData.container?.volumeNeeded || 0,
            acceptsCostSharing: announcementData.acceptsCostSharing || false,
            shippingPeriod: [], // À implémenter : conversion depuis la date
            // Valeurs par défaut pour les champs offer (non utilisés)
            availableVolume: 0,
            minimumVolume: 0,
            offerType: 'free'
          };
          setFormData(initialFormData);
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
    if (announcement && announcement.container?.type) {
      validateVolumes(value, formData.minimumVolume, announcement.container.type);
    }
  };

  const handleMinimumVolumeChange = (value: number) => {
    setFormData(prev => ({ ...prev, minimumVolume: value }));
    if (announcement && announcement.container?.type) {
      validateVolumes(formData.availableVolume, value, announcement.container.type);
    }
  };

  const handleVolumeNeededChange = (value: number) => {
    setFormData(prev => ({ ...prev, volumeNeeded: value }));
    if (announcement && announcement.container?.type) {
      validateVolumeNeeded(value, announcement.container.type);
    }
  };

  const handleCostSharingChange = (accepts: boolean) => {
    setFormData(prev => ({ ...prev, acceptsCostSharing: accepts }));
  };

  const handleShippingPeriodChange = (months: string[]) => {
    setFormData(prev => ({ ...prev, shippingPeriod: months }));
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
    } else {
      if (formData.availableVolume <= 0) {
        showErrorToast('Le volume disponible doit être supérieur à 0');
        return;
      }
      if (formData.minimumVolume > formData.availableVolume) {
        showErrorToast('Le volume minimum ne peut pas être supérieur au volume disponible');
        return;
      }
    }

    if (errors.length > 0) {
      showErrorToast('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    try {
      setIsSaving(true);
      
      const backendUrl = 'https://web-production-7b738.up.railway.app';
      
      // Préparer les données selon le type d'annonce
      let updateData;
      
      if (announcement.requestType === 'search') {
        updateData = {
          shippingDate: formData.shippingDate,
          announcementText: formData.announcementText,
          volumeNeeded: formData.volumeNeeded,
          acceptsCostSharing: formData.acceptsCostSharing
        };
      } else {
        updateData = {
          shippingDate: formData.shippingDate,
          announcementText: formData.announcementText,
          availableVolume: formData.availableVolume,
          minimumVolume: formData.minimumVolume,
          offerType: formData.offerType
        };
      }
      
      const response = await fetch(`${backendUrl}/api/partage/update-announcement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          ...updateData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      // Afficher la popup de succès
      setShowSuccessModal(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de sauvegarde';
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
                <p><strong>Conteneur:</strong> {announcement.container?.type} pieds {containerSpecs[announcement.container?.type || '20'].description}</p>
              </div>
            </div>

            {/* Formulaire de modification */}
            <div className="space-y-8">
              {/* Date/Période d'expédition selon le type */}
              {announcement.requestType === 'search' ? (
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <Calendar className="w-5 h-5 text-[#243163]" />
                    Période d'expédition souhaitée
                  </label>
                  <MonthPicker
                    selectedMonths={formData.shippingPeriod}
                    onMonthsChange={handleShippingPeriodChange}
                    placeholder="Sélectionner une période"
                  />
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
                    max={containerSpecs[announcement.container?.type || '20'].maxAvailable}
                    label="Volume recherché"
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
                      max={containerSpecs[announcement.container?.type || '20'].maxAvailable}
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
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Sauvegarder les modifications
                    </>
                  )}
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