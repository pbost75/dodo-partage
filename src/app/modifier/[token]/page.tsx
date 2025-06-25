'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Save, AlertTriangle, Calendar, Package, FileText, DollarSign, Eye, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import VolumeSelector from '@/components/ui/VolumeSelector';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { useToast } from '@/hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [formData, setFormData] = useState<any>({
    shippingDate: '',
    announcementText: '',
    // Champs conditionnels selon le type
    // Pour offer:
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free' as 'free' | 'paid',
    // Pour search:
    volumeNeeded: 0,
    acceptsCostSharing: false
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
          const initialFormData = {
            shippingDate: announcementData.shippingDate || '',
            announcementText: announcementData.announcementText || '',
            volumeNeeded: announcementData.container?.volumeNeeded || 0,
            acceptsCostSharing: announcementData.acceptsCostSharing || false,
            // Valeurs par défaut pour les champs offer (non utilisés)
            availableVolume: 0,
            minimumVolume: 0,
            offerType: 'free' as 'free' | 'paid'
          };
          setFormData(initialFormData);
        } else {
          // Pour les offres de place (type 'offer')
          const initialFormData = {
            shippingDate: announcementData.shippingDate || '',
            announcementText: announcementData.announcementText || '',
            availableVolume: announcementData.container?.availableVolume || 0,
            minimumVolume: announcementData.container?.minimumVolume || 0,
            offerType: announcementData.offerType || 'free',
            // Valeurs par défaut pour les champs search (non utilisés)
            volumeNeeded: 0,
            acceptsCostSharing: false
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

    // Avertissement si le volume minimum est élevé
    if (newErrors.length === 0 && minimumVolume >= 2 && availableVolume < 3) {
      newWarnings.push('Volume minimum élevé par rapport à l\'espace disponible');
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return { errors: newErrors, warnings: newWarnings };
  };

  // Validation du volume recherché pour les demandes
  const validateVolumeNeeded = (volumeNeeded: number, containerType: '20' | '40') => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    if (volumeNeeded <= 0) {
      newErrors.push('Le volume recherché doit être supérieur à 0');
    } else {
      const specs = containerSpecs[containerType];
      
      // ERREUR : Dépasse le maximum du conteneur
      if (volumeNeeded > specs.totalVolume) {
        newErrors.push(`Volume trop important pour un conteneur ${containerType} pieds (max: ${specs.totalVolume} m³)`);
      }
      
      // AVERTISSEMENT : Volume très important
      if (newErrors.length === 0 && volumeNeeded > specs.totalVolume * 0.7) {
        newWarnings.push('Volume important, cela pourrait limiter vos options de transport');
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return { errors: newErrors, warnings: newWarnings };
  };

  // Gestionnaires pour les offres (propose)
  const handleAvailableVolumeChange = (value: number) => {
    const newFormData = { ...formData, availableVolume: value };
    setFormData(newFormData);
    
    if (announcement?.container?.type) {
      const newErrors = validateVolumes(value, newFormData.minimumVolume, announcement.container.type);
      setErrors(newErrors.errors);
      setWarnings(newErrors.warnings);
    }
  };

  const handleMinimumVolumeChange = (value: number) => {
    // Arrondir à l'entier le plus proche pour le volume minimum
    const roundedValue = Math.round(value);
    setFormData((prev: any) => ({ ...prev, minimumVolume: roundedValue }));
    
    const newErrors = validateVolumes(formData.availableVolume, roundedValue, announcement?.container?.type || '20');
    setErrors(newErrors.errors);
    setWarnings(newErrors.warnings);
  };

  // Gestionnaires pour les demandes (search)
  const handleVolumeNeededChange = (value: number) => {
    setFormData((prev: any) => ({ ...prev, volumeNeeded: value }));
    
    if (announcement?.container?.type) {
      const newErrors = validateVolumeNeeded(value, announcement.container.type);
      setErrors(newErrors.errors);
      setWarnings(newErrors.warnings);
    }
  };

  const handleCostSharingChange = (accepts: boolean) => {
    setFormData((prev: any) => ({ ...prev, acceptsCostSharing: accepts }));
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!announcement) return;
    
    // Validation avant sauvegarde selon le type
    if (announcement.requestType === 'offer' && announcement.container?.type) {
      const validationResult = validateVolumes(formData.availableVolume, formData.minimumVolume, announcement.container.type);
      if (validationResult.errors.length > 0) {
        showErrorToast('❌ Veuillez corriger les erreurs avant de sauvegarder');
        return;
      }
    } else if (announcement.requestType === 'search' && announcement.container?.type) {
      const validationResult = validateVolumeNeeded(formData.volumeNeeded, announcement.container.type);
      if (validationResult.errors.length > 0) {
        showErrorToast('❌ Veuillez corriger les erreurs avant de sauvegarder');
        return;
      }
    }
    
    try {
      setIsSaving(true);
      
      // Préparer les données selon le type d'annonce
      let updateData;
      if (announcement.requestType === 'search') {
        updateData = {
          ...announcement,
          shippingDate: formData.shippingDate,
          container: {
            ...announcement.container,
            volumeNeeded: formData.volumeNeeded
          },
          acceptsCostSharing: formData.acceptsCostSharing,
          announcementText: formData.announcementText,
          updatedAt: new Date().toISOString()
        };
      } else {
        updateData = {
          ...announcement,
          shippingDate: formData.shippingDate,
          container: {
            ...announcement.container,
            availableVolume: formData.availableVolume,
            minimumVolume: formData.minimumVolume
          },
          offerType: formData.offerType,
          announcementText: formData.announcementText,
          updatedAt: new Date().toISOString()
        };
      }

      const response = await fetch(`/api/update-announcement/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showErrorToast('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Composant popup de confirmation
  const SuccessModal = () => (
    <AnimatePresence>
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-blue-900 font-['Roboto_Slab'] mb-3">
              Annonce mise à jour !
            </h3>
            <p className="text-gray-700 mb-6">
              Vos modifications ont été sauvegardées avec succès.
            </p>
            
            {/* Boutons d'action */}
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => router.push(`/annonce/${announcement?.reference}`)}
                icon={<Eye className="w-4 h-4" />}
                iconPosition="left"
                className="w-full bg-[#243163] hover:bg-[#1e2951]"
              >
                Voir mon annonce
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Retour aux annonces
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading state
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

  // Error state
  if (error) {
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

        {/* Error */}
        <div className="max-w-4xl mx-auto px-4 py-8">
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
        </div>
      </div>
    );
  }

  // Main render
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
            <h1 className="text-xl font-semibold">Modifier l'annonce {announcement?.reference}</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          
          {/* Informations non modifiables */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span> Informations de l'annonce
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Référence:</strong> {announcement?.reference}</p>
                <p><strong>Contact:</strong> {announcement?.contact?.firstName}</p>
                <p><strong>Email:</strong> {announcement?.contact?.email}</p>
              </div>
              <div>
                <p><strong>Trajet:</strong> {announcement?.departure?.displayName} → {announcement?.arrival?.displayName}</p>
                <p><strong>Conteneur:</strong> {announcement?.container?.type} pieds</p>
              </div>
            </div>
          </div>

          {/* Formulaire de modification */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations modifiables
            </h2>

            {/* Date de transport */}
            <div>
              <CustomDatePicker
                label="Date de transport souhaitée"
                name="shippingDate"
                value={formData.shippingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Formulaire conditionnel selon le type d'annonce */}
            {announcement?.requestType === 'search' ? (
              // Formulaire pour les demandes de place
              <div className="space-y-6">
                {/* Volume recherché */}
                <div>
                  <VolumeSelector
                    label="Volume recherché (m³)"
                    value={formData.volumeNeeded}
                    onChange={handleVolumeNeededChange}
                    min={0.5}
                    max={announcement?.container?.type === '20' ? 33 : 67}
                    step={0.5}
                    unit="m³"
                    placeholder="Ex: 4.5"
                  />
                </div>
              </div>
            ) : (
              // Formulaire pour les offres de place
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <VolumeSelector
                    label="Volume dispo (m³)"
                    value={formData.availableVolume}
                    onChange={handleAvailableVolumeChange}
                    min={0.5}
                    max={announcement?.container?.type === '20' ? 25 : 50}
                    step={0.5}
                    unit="m³"
                    placeholder="Ex: 12"
                  />
                </div>
                
                <div>
                  <VolumeSelector
                    label="Volume mini (m³)"
                    value={formData.minimumVolume}
                    onChange={handleMinimumVolumeChange}
                    min={0}
                    max={5}
                    step={1}
                    unit="m³"
                    placeholder="Ex: 1"
                  />
                </div>
              </div>
            )}

            {/* Messages d'erreur pour les volumes */}
            {errors.length > 0 && (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Messages d'avertissement pour les volumes */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 text-orange-600 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Section conditionelle : Type d'offre ou Participation aux frais */}
            {announcement?.requestType === 'search' ? (
              // Pour les demandes : participation aux frais
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4" />
                  Participation aux frais
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="acceptsCostSharing"
                      value="true"
                      checked={formData.acceptsCostSharing === true}
                      onChange={() => handleCostSharingChange(true)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Oui</div>
                      <div className="text-sm text-gray-600">J'accepte de participer aux frais</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="acceptsCostSharing"
                      value="false"
                      checked={formData.acceptsCostSharing === false}
                      onChange={() => handleCostSharingChange(false)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Non</div>
                      <div className="text-sm text-gray-600">Je cherche un transport gratuit</div>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              // Pour les offres : type d'offre
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4" />
                  Type d'offre
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="offerType"
                      value="free"
                      checked={formData.offerType === 'free'}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Gratuit</div>
                      <div className="text-sm text-gray-600">Partage solidaire</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="offerType"
                      value="paid"
                      checked={formData.offerType === 'paid'}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Participation</div>
                      <div className="text-sm text-gray-600">Avec participation aux frais</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                {announcement?.requestType === 'search' ? <Search className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {announcement?.requestType === 'search' ? 'Description de votre demande' : 'Description de votre offre'}
              </label>
              <div className="space-y-3">
                <textarea
                  value={formData.announcementText}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, announcementText: e.target.value }))}
                  placeholder={announcement?.requestType === 'search' ? 'Décrivez votre demande de transport...' : 'Décrivez votre offre de partage...'}
                  className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none"
                  maxLength={500}
                />
                
                {/* Compteurs */}
                <div className="flex justify-between text-sm">
                  <span className={`${formData.announcementText.length >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formData.announcementText.length}/500 caractères {formData.announcementText.length < 50 && '(minimum 50)'}
                  </span>
                  <span className="text-gray-500">
                    {formData.announcementText.split(/\s+/).filter(word => word.length > 0).length} mot{formData.announcementText.split(/\s+/).filter(word => word.length > 0).length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="flex-1"
              disabled={isSaving}
            >
              🔙 Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1 bg-[#243163] hover:bg-[#1e2951]"
              disabled={isSaving || errors.length > 0}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mise à jour...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Mettre à jour l'annonce
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <SuccessModal />
    </div>
  );
}