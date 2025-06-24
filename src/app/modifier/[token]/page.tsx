'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Check, X, MapPin, Calendar, Package, FileText, User, Phone, Mail, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingSelect from '@/components/ui/FloatingSelect';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import CountrySelect from '@/components/ui/CountrySelect';
import PhoneInput from '@/components/ui/PhoneInput';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import VolumeSelector from '@/components/ui/VolumeSelector';
import CardRadioGroup from '@/components/ui/CardRadioGroup';
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

interface EditableSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isEditing: boolean;
}

export default function ModifyAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<AnnouncementData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Options pour les pays
  const countryOptions = [
    { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷' },
    { value: 'reunion', label: 'Réunion', emoji: '🌺' },
    { value: 'martinique', label: 'Martinique', emoji: '🌴' },
    { value: 'guadeloupe', label: 'Guadeloupe', emoji: '🏝️' },
    { value: 'guyane', label: 'Guyane', emoji: '🌿' },
    { value: 'mayotte', label: 'Mayotte', emoji: '🐋' },
    { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie', emoji: '🏖️' }
  ];

  // Options pour les types de conteneur
  const containerTypeOptions = [
    { value: '20_feet', label: 'Conteneur 20 pieds', description: 'Standard pour petits volumes' },
    { value: '40_feet', label: 'Conteneur 40 pieds', description: 'Grande capacité' }
  ];

  // Options pour le type d'offre
  const offerTypeOptions = [
    { value: 'free', label: 'Gratuit', description: 'Partage sans contrepartie financière' },
    { value: 'paid', label: 'Participation aux frais', description: 'Partage des coûts de transport' }
  ];

  useEffect(() => {
    const loadAnnouncementForEdit = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/edit-form/${params.token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Token de modification invalide, expiré, ou cette annonce a été créée avant l\'implémentation des fonctionnalités de gestion. Veuillez contacter support@dodomove.fr pour modifier votre annonce.');
          } else {
            throw new Error('Erreur lors du chargement de l\'annonce');
          }
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Annonce non trouvée');
        }
        
        setAnnouncement(result.data);
        setFormData(result.data);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Token invalide';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadAnnouncementForEdit();
    }
  }, [params.token]);

  const toggleEditSection = (sectionId: string) => {
    const newEditingSections = new Set(editingSections);
    if (newEditingSections.has(sectionId)) {
      newEditingSections.delete(sectionId);
    } else {
      newEditingSections.add(sectionId);
    }
    setEditingSections(newEditingSections);
  };

  const cancelEdit = (sectionId: string) => {
    const newEditingSections = new Set(editingSections);
    newEditingSections.delete(sectionId);
    setEditingSections(newEditingSections);
    
    // Restaurer les données originales
    if (announcement) {
      setFormData({ ...announcement });
    }
  };

  const updateFormData = (path: string, value: any) => {
    if (!formData) return;
    
    const keys = path.split('.');
    const newData = { ...formData };
    let current = newData as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
    setHasChanges(true);
  };

  const saveAllChanges = async () => {
    if (!formData || !hasChanges) return;

    setSaving(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
      const response = await fetch(`${backendUrl}/api/partage/update-announcement/${params.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      // Mettre à jour les données locales
      setAnnouncement(formData);
      setHasChanges(false);
      setEditingSections(new Set());

      // Feedback de succès
      alert('✅ Vos modifications ont été sauvegardées avec succès !');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Edit className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#243163] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <Edit className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Impossible de modifier l'annonce
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Retour aux annonces
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement || !formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux annonces</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
                <p className="text-sm text-white/70">{announcement.reference}</p>
              </div>
            </div>
            
            {/* Bouton de sauvegarde flottant */}
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="secondary"
                    onClick={saveAllChanges}
                    disabled={saving}
                    className="bg-white text-[#243163] hover:bg-gray-100"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#243163]"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {!saving && <span className="ml-2">Sauvegarder</span>}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

             {/* Loader de sauvegarde */}
       <AnimatePresence>
         {saving && (
           <SubmissionLoader isSubmitting={saving} />
         )}
       </AnimatePresence>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Section Contact */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Informations de contact</h3>
                <p className="text-sm text-gray-500">Prénom, email et téléphone</p>
              </div>
            </div>
            <button
              onClick={() => toggleEditSection('contact')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {editingSections.has('contact') ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </>
              )}
            </button>
          </div>
          
          <div className="p-4">
            {editingSections.has('contact') ? (
              <div className="space-y-4">
                <FloatingInput
                  label="Prénom"
                  value={formData.contact.firstName}
                  onChange={(e) => updateFormData('contact.firstName', e.target.value)}
                  required
                />
                <FloatingInput
                  label="Email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => updateFormData('contact.email', e.target.value)}
                  required
                />
                                                  <PhoneInput
                   label="Téléphone"
                   value={formData.contact.phone || ''}
                   onChange={(name: string, value: string) => updateFormData('contact.phone', value)}
                 />
               </div>
             ) : (
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
             )}
           </div>
         </div>

         {/* Section Trajet */}
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
             <button
               onClick={() => toggleEditSection('trajet')}
               className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             >
               {editingSections.has('trajet') ? (
                 <>
                   <X className="w-4 h-4" />
                   <span>Annuler</span>
                 </>
               ) : (
                 <>
                   <Edit className="w-4 h-4" />
                   <span>Modifier</span>
                 </>
               )}
             </button>
           </div>
           
           <div className="p-4">
             {editingSections.has('trajet') ? (
               <div className="space-y-6">
                 <div>
                   <h4 className="font-medium text-gray-700 mb-3">Départ</h4>
                   <div className="space-y-3">
                     <CountrySelect
                       label="Pays de départ"
                       options={countryOptions}
                       value={formData.departure.country}
                       onChange={(value) => updateFormData('departure.country', value)}
                     />
                     <div className="grid grid-cols-2 gap-3">
                       <FloatingInput
                         label="Ville"
                         value={formData.departure.city}
                         onChange={(e) => updateFormData('departure.city', e.target.value)}
                         required
                       />
                       <FloatingInput
                         label="Code postal"
                         value={formData.departure.postalCode}
                         onChange={(e) => updateFormData('departure.postalCode', e.target.value)}
                         required
                       />
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="font-medium text-gray-700 mb-3">Arrivée</h4>
                   <div className="space-y-3">
                     <CountrySelect
                       label="Pays d'arrivée"
                       options={countryOptions}
                       value={formData.arrival.country}
                       onChange={(value) => updateFormData('arrival.country', value)}
                     />
                     <div className="grid grid-cols-2 gap-3">
                       <FloatingInput
                         label="Ville"
                         value={formData.arrival.city}
                         onChange={(e) => updateFormData('arrival.city', e.target.value)}
                         required
                       />
                       <FloatingInput
                         label="Code postal"
                         value={formData.arrival.postalCode}
                         onChange={(e) => updateFormData('arrival.postalCode', e.target.value)}
                         required
                       />
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="space-y-4">
                 <div>
                   <div className="text-sm text-gray-500 mb-1">Départ</div>
                   <div className="text-gray-900 font-medium">
                     {countryOptions.find(c => c.value === formData.departure.country)?.label} - {formData.departure.city} ({formData.departure.postalCode})
                   </div>
                 </div>
                 <div className="text-center text-gray-400">↓</div>
                 <div>
                   <div className="text-sm text-gray-500 mb-1">Arrivée</div>
                   <div className="text-gray-900 font-medium">
                     {countryOptions.find(c => c.value === formData.arrival.country)?.label} - {formData.arrival.city} ({formData.arrival.postalCode})
                   </div>
                 </div>
               </div>
             )}
           </div>
         </div>

         {/* Section Date et Transport */}
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-gray-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                 <Calendar className="w-5 h-5 text-orange-600" />
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">Date et transport</h3>
                 <p className="text-sm text-gray-500">Date d'expédition prévue</p>
               </div>
             </div>
             <button
               onClick={() => toggleEditSection('transport')}
               className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             >
               {editingSections.has('transport') ? (
                 <>
                   <X className="w-4 h-4" />
                   <span>Annuler</span>
                 </>
               ) : (
                 <>
                   <Edit className="w-4 h-4" />
                   <span>Modifier</span>
                 </>
               )}
             </button>
           </div>
           
           <div className="p-4">
             {editingSections.has('transport') ? (
               <CustomDatePicker
                 label="Date d'expédition prévue"
                 value={formData.shippingDate}
                 onChange={(date) => updateFormData('shippingDate', date)}
                 required
               />
             ) : (
               <div className="flex items-center gap-3">
                 <Calendar className="w-4 h-4 text-gray-400" />
                 <span className="text-gray-900">{new Date(formData.shippingDate).toLocaleDateString('fr-FR')}</span>
               </div>
             )}
           </div>
         </div>

         {/* Section Conteneur */}
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-gray-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                 <Package className="w-5 h-5 text-purple-600" />
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">Conteneur</h3>
                 <p className="text-sm text-gray-500">Type et volumes</p>
               </div>
             </div>
             <button
               onClick={() => toggleEditSection('conteneur')}
               className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             >
               {editingSections.has('conteneur') ? (
                 <>
                   <X className="w-4 h-4" />
                   <span>Annuler</span>
                 </>
               ) : (
                 <>
                   <Edit className="w-4 h-4" />
                   <span>Modifier</span>
                 </>
               )}
             </button>
           </div>
           
           <div className="p-4">
             {editingSections.has('conteneur') ? (
               <div className="space-y-6">
                 <CardRadioGroup
                   name="containerType"
                   value={formData.container.type}
                   onChange={(value) => updateFormData('container.type', value)}
                   options={containerTypeOptions}
                 />
                 
                 <VolumeSelector
                   label="Volume disponible (m³)"
                   value={formData.container.availableVolume}
                   onChange={(value) => updateFormData('container.availableVolume', value)}
                   min={1}
                   max={50}
                   step={0.5}
                 />
                 
                 <VolumeSelector
                   label="Volume minimum requis (m³)"
                   value={formData.container.minimumVolume}
                   onChange={(value) => updateFormData('container.minimumVolume', value)}
                   min={0.5}
                   max={formData.container.availableVolume}
                   step={0.5}
                 />
               </div>
             ) : (
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Package className="w-4 h-4 text-gray-400" />
                   <span className="text-gray-900">
                     Conteneur {formData.container.type === '20_feet' ? '20' : '40'} pieds
                   </span>
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

         {/* Section Offre */}
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-gray-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                 <span className="text-yellow-600">💰</span>
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">Type d'offre</h3>
                 <p className="text-sm text-gray-500">Gratuit ou participation</p>
               </div>
             </div>
             <button
               onClick={() => toggleEditSection('offre')}
               className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             >
               {editingSections.has('offre') ? (
                 <>
                   <X className="w-4 h-4" />
                   <span>Annuler</span>
                 </>
               ) : (
                 <>
                   <Edit className="w-4 h-4" />
                   <span>Modifier</span>
                 </>
               )}
             </button>
           </div>
           
           <div className="p-4">
             {editingSections.has('offre') ? (
               <CardRadioGroup
                 name="offerType"
                 value={formData.offerType}
                 onChange={(value) => updateFormData('offerType', value)}
                 options={offerTypeOptions}
               />
             ) : (
               <div className="flex items-center gap-3">
                 <span className="text-2xl">
                   {formData.offerType === 'free' ? '🎁' : '💰'}
                 </span>
                 <span className="text-gray-900 font-medium">
                   {formData.offerType === 'free' ? 'Partage gratuit' : 'Participation aux frais'}
                 </span>
               </div>
             )}
           </div>
         </div>

        {/* Section Description */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-500">Détails de l'annonce</p>
              </div>
            </div>
            <button
              onClick={() => toggleEditSection('description')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {editingSections.has('description') ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </>
              )}
            </button>
          </div>
          
          <div className="p-4">
            {editingSections.has('description') ? (
              <FloatingTextarea
                label="Description de votre annonce"
                value={formData.announcementText}
                onChange={(e) => updateFormData('announcementText', e.target.value)}
                placeholder="Décrivez ce que vous proposez..."
                rows={4}
                maxLength={800}
                required
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{formData.announcementText}</p>
            )}
          </div>
        </div>

        {/* Actions en bas */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/annonce/${announcement.reference}`)}
            className="flex-1"
          >
            👁️ Voir l'annonce publique
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/supprimer/${params.token}`)}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            🗑️ Supprimer l'annonce
          </Button>
        </div>

      </div>

      {/* Bouton flottant mobile pour sauvegarder */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50 sm:hidden"
          >
            <Button
              variant="primary"
              onClick={saveAllChanges}
              disabled={saving}
              className="w-full shadow-lg"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {!saving && <span className="ml-2">Sauvegarder les modifications</span>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 