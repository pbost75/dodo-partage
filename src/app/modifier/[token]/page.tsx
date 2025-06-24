'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  FileText, 
  Edit, 
  X, 
  Check, 
  Save, 
  Eye, 
  Trash2,
  Heart
} from 'lucide-react';

import FloatingInput from '@/components/ui/FloatingInput';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import SubmissionLoader from '@/components/ui/SubmissionLoader';

interface AnnouncementData {
  reference: string;
  status: string;
  contact: {
    firstName: string;
    email: string;
    phone?: string;
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
    type: string;
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: string;
  announcementText: string;
}

export default function ModifyAnnouncementPage() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [formData, setFormData] = useState<AnnouncementData | null>(null);
  const [originalData, setOriginalData] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  // Force deploy timestamp: 1750761857
  
  const { token } = useParams();
  const router = useRouter();

  const countryOptions = [
    { value: 'reunion', label: '🇷🇪 Réunion' },
    { value: 'martinique', label: '🇲🇶 Martinique' },
    { value: 'guadeloupe', label: '🇬🇵 Guadeloupe' },
    { value: 'guyane', label: '🇬🇫 Guyane' },
    { value: 'mayotte', label: '🇾🇹 Mayotte' },
    { value: 'nouvelle-caledonie', label: '🇳🇨 Nouvelle-Calédonie' },
    { value: 'polynesie', label: '🇵🇫 Polynésie française' },
    { value: 'saint-barthelemy', label: '🇧🇱 Saint-Barthélemy' },
    { value: 'saint-martin', label: '🇲🇫 Saint-Martin' },
    { value: 'saint-pierre-et-miquelon', label: '🇵🇲 Saint-Pierre-et-Miquelon' },
    { value: 'wallis-et-futuna', label: '🇼🇫 Wallis-et-Futuna' },
    { value: 'france', label: '🇫🇷 France métropolitaine' }
  ];

  useEffect(() => {
    loadAnnouncementForEdit();
  }, [token]);

  const loadAnnouncementForEdit = async () => {
    try {
      // Appeler directement le backend centralisé pour récupérer l'annonce
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
      const response = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Annonce non trouvée');
        }
        throw new Error('Erreur lors du chargement');
      }
      
      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('Annonce non trouvée');
      }
      
      const announcementData = result.data;
      setAnnouncement(announcementData);
      setFormData(announcementData);
      setOriginalData(JSON.parse(JSON.stringify(announcementData)));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Impossible de charger l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const checkForChanges = (data: AnnouncementData) => {
    if (!originalData) return;
    
    const hasModifications = 
      data.shippingDate !== originalData.shippingDate ||
      data.container.availableVolume !== originalData.container.availableVolume ||
      data.container.minimumVolume !== originalData.container.minimumVolume ||
      data.offerType !== originalData.offerType ||
      data.announcementText !== originalData.announcementText;
    
    setHasChanges(hasModifications);
  };

  const toggleEditSection = (sectionId: string) => {
    setEditingSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const cancelEdit = (sectionId: string) => {
    if (originalData && formData) {
      // Restaurer les données originales pour cette section
      const restoredData = { ...formData };
      
      if (sectionId === 'date') {
        restoredData.shippingDate = originalData.shippingDate;
      } else if (sectionId === 'conteneur') {
        restoredData.container.availableVolume = originalData.container.availableVolume;
        restoredData.container.minimumVolume = originalData.container.minimumVolume;
      } else if (sectionId === 'offre') {
        restoredData.offerType = originalData.offerType;
      } else if (sectionId === 'description') {
        restoredData.announcementText = originalData.announcementText;
      }
      
      setFormData(restoredData);
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
      checkForChanges(restoredData);
    }
  };

  const updateFormData = (path: string, value: any) => {
    if (!formData) return;
    
    const updatedData = { ...formData };
    const pathArray = path.split('.');
    let current: any = updatedData;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setFormData(updatedData);
    checkForChanges(updatedData);
  };

  const saveAllChanges = async () => {
    if (!formData || !hasChanges) return;
    
    setIsSubmitting(true);
    try {
      // Utiliser la route backend classique (maintenant corrigée)
      const response = await fetch(`/api/update-announcement/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      const result = await response.json();
      if (result.success) {
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        setHasChanges(false);
        setEditingSections(new Set());
        
        // Afficher un message de succès
        alert('✅ Modifications sauvegardées avec succès !');
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCountryLabel = (value: string) => {
    return countryOptions.find(option => option.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Annonce introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Cette annonce n\'existe pas ou le lien de modification est invalide.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#E55A2B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour aux annonces</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">🔧 Modifier l'annonce</h1>
              <p className="text-sm text-white/70">{announcement.reference}</p>
            </div>
            
            {/* Bouton sauvegarde pour desktop */}
            {hasChanges && (
              <div className="hidden sm:block">
                <button
                  onClick={saveAllChanges}
                  disabled={isSubmitting}
                  className="bg-white text-[#243163] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loader de soumission */}
      {isSubmitting && <SubmissionLoader isSubmitting={isSubmitting} />}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-6">
        
        {/* Section Contact - NON MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Informations de contact</h3>
                <p className="text-sm text-gray-500">Prénom, email et téléphone (lecture seule)</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Non modifiable</span>
          </div>
          
          <div className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                💡 Pour modifier ces informations, supprimez cette annonce et créez-en une nouvelle.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formData.contact.firstName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formData.contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{formData.contact.phone || 'Non renseigné'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Trajet - NON MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trajet</h3>
                <p className="text-sm text-gray-500">Départ et arrivée</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Non modifiable</span>
          </div>
          
          <div className="p-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">
                💡 Pour modifier le trajet, supprimez cette annonce et créez-en une nouvelle.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Départ</div>
                <div className="text-gray-900 font-medium">
                  {getCountryLabel(formData.departure.country)} - {formData.departure.city} ({formData.departure.postalCode})
                </div>
              </div>
              <div className="text-center text-gray-400">↓</div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Arrivée</div>
                <div className="text-gray-900 font-medium">
                  {getCountryLabel(formData.arrival.country)} - {formData.arrival.city} ({formData.arrival.postalCode})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Date de transport - MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Date de transport</h3>
                <p className="text-sm text-gray-500">Date d'expédition prévue</p>
              </div>
            </div>
            
            {editingSections.has('date') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleEditSection('date');
                    if (hasChanges) checkForChanges(formData);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider</span>
                </button>
                <button
                  onClick={() => cancelEdit('date')}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleEditSection('date')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            {editingSections.has('date') ? (
              <CustomDatePicker
                label="Date d'expédition prévue"
                value={formData.shippingDate}
                onChange={(date) => updateFormData('shippingDate', date)}
              />
            ) : (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {new Date(formData.shippingDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section Volumes disponibles - MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Volumes disponibles</h3>
                <p className="text-sm text-gray-500">Volume disponible et minimum</p>
              </div>
            </div>
            
            {editingSections.has('conteneur') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleEditSection('conteneur');
                    if (hasChanges) checkForChanges(formData);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider</span>
                </button>
                <button
                  onClick={() => cancelEdit('conteneur')}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleEditSection('conteneur')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            {editingSections.has('conteneur') ? (
              <div className="space-y-4">
                <FloatingInput
                  label="Volume disponible (m³)"
                  type="number"
                  value={formData.container.availableVolume.toString()}
                  onChange={(e) => updateFormData('container.availableVolume', parseFloat(e.target.value) || 0)}
                  min="0.5"
                  max="50"
                  step="0.5"
                />
                <FloatingInput
                  label="Volume minimum requis (m³)"
                  type="number"
                  value={formData.container.minimumVolume.toString()}
                  onChange={(e) => updateFormData('container.minimumVolume', parseFloat(e.target.value) || 0)}
                  min="0.5"
                  max={formData.container.availableVolume.toString()}
                  step="0.5"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    Conteneur {formData.container.type === '20_feet' ? '20' : '40'} pieds
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Non modifiable</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-900">{formData.container.availableVolume} m³ disponible</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-900">Minimum {formData.container.minimumVolume} m³</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Type d'offre - MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Type d'offre</h3>
                <p className="text-sm text-gray-500">Gratuit ou participation aux frais</p>
              </div>
            </div>
            
            {editingSections.has('offre') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleEditSection('offre');
                    if (hasChanges) checkForChanges(formData);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider</span>
                </button>
                <button
                  onClick={() => cancelEdit('offre')}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleEditSection('offre')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            {editingSections.has('offre') ? (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="offerType"
                    value="free"
                    checked={formData.offerType === 'free'}
                    onChange={(e) => updateFormData('offerType', e.target.value)}
                    className="w-4 h-4 text-[#FF6B35]"
                  />
                  <span className="text-lg">🎁</span>
                  <div>
                    <div className="font-medium">Partage gratuit</div>
                    <div className="text-sm text-gray-500">Sans contrepartie financière</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="offerType"
                    value="paid"
                    checked={formData.offerType === 'paid'}
                    onChange={(e) => updateFormData('offerType', e.target.value)}
                    className="w-4 h-4 text-[#FF6B35]"
                  />
                  <span className="text-lg">💰</span>
                  <div>
                    <div className="font-medium">Participation aux frais</div>
                    <div className="text-sm text-gray-500">Partage des coûts de transport</div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {formData.offerType === 'free' ? '🎁' : '💰'}
                </span>
                <div>
                  <div className="text-gray-900 font-medium">
                    {formData.offerType === 'free' ? 'Partage gratuit' : 'Participation aux frais'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.offerType === 'free' ? 'Sans contrepartie financière' : 'Partage des coûts de transport'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Description - MODIFIABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-500">Détails de votre annonce</p>
              </div>
            </div>
            
            {editingSections.has('description') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleEditSection('description');
                    if (hasChanges) checkForChanges(formData);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider</span>
                </button>
                <button
                  onClick={() => cancelEdit('description')}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleEditSection('description')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            {editingSections.has('description') ? (
              <FloatingTextarea
                label="Description de votre annonce"
                value={formData.announcementText}
                onChange={(e) => updateFormData('announcementText', e.target.value)}
                placeholder="Décrivez ce que vous proposez, vos conditions particulières..."
                rows={4}
                maxLength={800}
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">
                {formData.announcementText}
              </p>
            )}
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => router.push(`/annonce/${announcement.reference}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir l'annonce publique
          </button>
          <button
            onClick={() => router.push(`/supprimer/${token}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer l'annonce
          </button>
        </div>

      </div>

      {/* Bouton flottant mobile pour sauvegarder */}
      {hasChanges && (
        <div className="fixed bottom-6 left-4 right-4 z-50 sm:hidden">
          <button
            onClick={saveAllChanges}
            disabled={isSubmitting}
            className="w-full bg-[#FF6B35] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#E55A2B] transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      )}
    </div>
  );
}