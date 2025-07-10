'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Edit2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import CustomSelect from '@/components/ui/CustomSelect';
import { apiFetch } from '@/utils/apiUtils';
import { useGTM } from '@/hooks/useGTM';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: {
    departure?: string;
    destination?: string;
    type?: string;
  };
}

interface AlertFormData {
  email: string;
  departure: string;
  destination: string;
  type: string;
  volumeMin: number;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, initialFilters = {} }) => {
  const { trackAlertCreated } = useGTM();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<AlertFormData>({
    email: '',
    departure: '',
    destination: '',
    type: '',
    volumeMin: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour contrôler l'affichage progressif des champs
  const [editingField, setEditingField] = useState<'type' | 'departure' | 'destination' | 'volume' | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  
  // État pour gérer l'espace des dropdowns
  const [dropdownSpacing, setDropdownSpacing] = useState<number>(0);
  
  // Détection mobile/desktop pour animations optimisées
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Empêcher le scroll de la page quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialisation correcte des filtres
  useEffect(() => {
    if (isOpen) {
      // Créer le nouveau formData avec les filtres initiaux OU valeurs vides
      const newFormData = {
        email: '',
        departure: initialFilters.departure || '',
        destination: initialFilters.destination || '',
        type: initialFilters.type || '',
        volumeMin: 1
      };
      setFormData(newFormData);
      
      // Déterminer quels champs sont déjà complétés basé sur les filtres actuels
      const completed = new Set<string>();
      if (newFormData.type) {
        completed.add('type');
      }
      if (newFormData.departure) {
        completed.add('departure');
      }
      if (newFormData.destination) {
        completed.add('destination');
      }
      // Ne pas marquer volumeMin comme complété par défaut
      
      setCompletedFields(completed);
      
      // Déterminer le premier champ à éditer - TOUJOURS commencer par le premier non complété
      if (!newFormData.type) {
        setEditingField('type');
      } else if (!newFormData.departure) {
        setEditingField('departure');
      } else if (!newFormData.destination) {
        setEditingField('destination');
      } else {
        // Si tous les champs précédents sont remplis, aller au volume
        setEditingField('volume');
      }
      
      // Reset de l'espacement dropdown
      setDropdownSpacing(0);
    }
  }, [isOpen, initialFilters]);

  // Calculer l'espace nécessaire pour les dropdowns
  useEffect(() => {
    if (editingField) {
      // Ajouter de l'espace quand un dropdown est ouvert
      setDropdownSpacing(240); // Espace pour les options du dropdown
    } else {
      setDropdownSpacing(0);
    }
  }, [editingField]);

  // Options sans pictogrammes pour une meilleure UX mobile
  const typeOptions = [
    { value: 'offer', label: 'proposent de la place', description: 'Conteneurs avec espace disponible' },
    { value: 'request', label: 'cherchent de la place', description: 'Personnes ayant besoin d\'espace' }
  ];

  const locations = [
    { value: 'france', label: 'France métropolitaine', description: 'Métropole' },
    { value: 'reunion', label: 'La Réunion', description: 'Océan Indien' },
    { value: 'martinique', label: 'La Martinique', description: 'Antilles' },
    { value: 'guadeloupe', label: 'La Guadeloupe', description: 'Antilles' },
    { value: 'guyane', label: 'La Guyane', description: 'Amérique du Sud' },
    { value: 'mayotte', label: 'Mayotte', description: 'Océan Indien' },
    { value: 'nouvelle-caledonie', label: 'La Nouvelle-Calédonie', description: 'Pacifique' }
  ];

  const volumes = [
    { value: '1', label: 'peu importe', description: 'Tous volumes acceptés' },
    { value: '2', label: '2m³ minimum', description: 'Quelques cartons' },
    { value: '5', label: '5m³ minimum', description: 'Moto ou scooter' },
    { value: '10', label: '10m³ minimum', description: 'Appartement 2 pièces' },
    { value: '20', label: '20m³ minimum', description: 'Voiture standard' }
  ];

  // Fonctions pour gérer la sélection progressive
  const handleFieldChange = (field: keyof AlertFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Marquer le champ comme complété
    setCompletedFields(prev => new Set([...prev, field]));
    
    // Passer au champ suivant
    if (field === 'type') {
      setEditingField('departure');
    } else if (field === 'departure') {
      setEditingField('destination');
    } else if (field === 'destination') {
      setEditingField('volume');
    } else if (field === 'volumeMin') {
      setEditingField(null); // Tous les champs sont complétés
    }
  };

  const handleEditField = (field: 'type' | 'departure' | 'destination' | 'volume') => {
    setEditingField(field);
  };

  // Fonction pour obtenir le texte d'affichage des options
  const getOptionLabel = (options: any[], value: string) => {
    return options.find(opt => opt.value === value)?.label || value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      // Appel à l'API pour créer l'alerte
      const response = await apiFetch('/api/create-alert', {
        method: 'POST',
        body: JSON.stringify({
          type: formData.type,
          departure: formData.departure, // Envoyer la value directement (ex: "france")
          arrival: formData.destination, // Envoyer la value directement (ex: "reunion")
          volume_min: formData.volumeMin,
          email: formData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de l\'alerte');
      }

      const result = await response.json();
      console.log('✅ Alerte créée avec succès:', result);
      
      // ✅ Tracker l'événement création d'alerte avec les bonnes données
      trackAlertCreated({
        announcement_type: formData.type as 'offer' | 'request'
      });
      
      setStep('success');
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'alerte:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
      alert('Erreur lors de la création de l\'alerte. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setFormData({
      email: '',
      departure: '',
      destination: '',
      type: '',
      volumeMin: 1
    });
    setEditingField('type');
    setCompletedFields(new Set());
    setDropdownSpacing(0);
    onClose();
  };

  if (!isOpen) return null;

  // Hauteur optimisée selon l'étape
  const modalHeight = step === 'success' ? 450 : 630; // Confirmation plus compacte

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`
          fixed inset-0 flex items-center justify-center z-50 md:p-4
          /* Mobile: pas de backdrop visible pour effet page complète */
          ${isMobile ? 'bg-white' : 'bg-black/50 backdrop-blur-sm'}
        `}
        onClick={resetAndClose}
      >
        <motion.div
          initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          transition={{ 
            type: isMobile ? 'spring' : 'tween',
            damping: isMobile ? 25 : undefined,
            stiffness: isMobile ? 300 : undefined,
            duration: isMobile ? undefined : 0.2
          }}
          className={`
            bg-white w-full shadow-2xl overflow-hidden
            /* Mobile: plein écran sans bordures */
            h-screen
            /* Desktop: popup traditionnelle avec bordures */
            md:rounded-2xl md:max-w-md md:max-w-2xl
            ${step === 'success' 
              ? 'md:h-[450px] md:max-h-[90vh] md:min-h-[400px]' 
              : 'md:h-[630px] md:max-h-[90vh] md:min-h-[500px]'
            }
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            {step === 'form' ? (
              <>
                {/* Header optimisé mobile */}
                <div className="border-b border-gray-100 p-4 md:p-6 flex justify-between items-start flex-shrink-0">
                  <div className="flex-1 pr-2">
                    <h2 className="text-lg md:text-xl font-bold text-blue-900 font-['Roboto_Slab']">
                      Créer une alerte
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 leading-tight">
                      Soyez notifié(e) dès qu'une opportunité correspond à vos besoins
                    </p>
                  </div>
                  <button 
                    onClick={resetAndClose}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6 h-full">
                    {/* Formulaire progressif hybride */}
                    <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                      <div className="space-y-4">
                        {/* Construction progressive de la phrase */}
                        <div className="text-lg leading-relaxed text-gray-800 space-y-1">
                          <span>Je veux être alerté(e) quand des personnes </span>
                          
                          {/* Champ Type */}
                          {editingField === 'type' ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="inline-block w-full mt-2 mb-1"
                            >
                              <CustomSelect
                                options={typeOptions}
                                value={formData.type}
                                onChange={(value) => handleFieldChange('type', value)}
                                className="w-full"
                                showEmojis={false}
                                placeholder="sélectionnez le type..."
                              />
                            </motion.div>
                          ) : completedFields.has('type') && formData.type && (
                            <button
                              type="button"
                              onClick={() => handleEditField('type')}
                              className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 my-0.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <span className="font-medium">{getOptionLabel(typeOptions, formData.type)}</span>
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}

                          {/* Continuation de la phrase si le type est sélectionné */}
                          {completedFields.has('type') && formData.type && editingField !== 'type' && (
                            <>
                              <span> depuis </span>
                              
                              {/* Champ Départ */}
                              {editingField === 'departure' ? (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="inline-block w-full mt-2 mb-1"
                                >
                                  <CustomSelect
                                    options={locations}
                                    value={formData.departure}
                                    onChange={(value) => handleFieldChange('departure', value)}
                                    className="w-full"
                                    showEmojis={false}
                                    placeholder="sélectionnez le départ..."
                                  />
                                </motion.div>
                              ) : completedFields.has('departure') && formData.departure && (
                                <button
                                  type="button"
                                  onClick={() => handleEditField('departure')}
                                  className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 my-0.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  <span className="font-medium">{getOptionLabel(locations, formData.departure)}</span>
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}

                              {/* Continuation si départ sélectionné */}
                              {completedFields.has('departure') && formData.departure && editingField !== 'departure' && (
                                <>
                                  <span> vers </span>
                                  
                                  {/* Champ Destination */}
                                  {editingField === 'destination' ? (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="inline-block w-full mt-2 mb-1"
                                    >
                                      <CustomSelect
                                        options={locations}
                                        value={formData.destination}
                                        onChange={(value) => handleFieldChange('destination', value)}
                                        className="w-full"
                                        showEmojis={false}
                                        placeholder="sélectionnez la destination..."
                                      />
                                    </motion.div>
                                  ) : completedFields.has('destination') && formData.destination && (
                                    <button
                                      type="button"
                                      onClick={() => handleEditField('destination')}
                                      className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 my-0.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                      <span className="font-medium">{getOptionLabel(locations, formData.destination)}</span>
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}

                                  {/* Continuation si destination sélectionnée */}
                                  {completedFields.has('destination') && formData.destination && editingField !== 'destination' && (
                                    <>
                                      <span> avec un volume minimum de </span>
                                      
                                      {/* Champ Volume */}
                                      {editingField === 'volume' ? (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="inline-block w-full mt-2 mb-1"
                                        >
                                          <CustomSelect
                                            options={volumes}
                                            value={formData.volumeMin.toString()}
                                            onChange={(value) => handleFieldChange('volumeMin', parseInt(value))}
                                            className="w-full"
                                            showEmojis={false}
                                            placeholder="sélectionnez le volume minimum..."
                                          />
                                        </motion.div>
                                      ) : completedFields.has('volumeMin') && (
                                        <button
                                          type="button"
                                          onClick={() => handleEditField('volume')}
                                          className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 my-0.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                                        >
                                          <span className="font-medium">{getOptionLabel(volumes, formData.volumeMin.toString())}</span>
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      )}

                                      {/* Point final si tout est complété */}
                                      {completedFields.has('volumeMin') && editingField !== 'volume' && (
                                        <span>.</span>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Email - affiché seulement si tous les champs principaux sont complétés */}
                    {editingField === null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <FloatingInput
                          label="Votre email pour recevoir les alertes"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          fixedLabel={true}
                          placeholder="marie.payet@email.com"
                        />
                        
                        {/* Info box compacte */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <div className="flex gap-2">
                            <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800">
                              <p className="leading-relaxed">
                                Vous recevrez un email dès qu'une nouvelle annonce correspond à vos critères. 
                                Vous pourrez modifier ou supprimer cette alerte à tout moment directement depuis les emails reçus.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* CTA affiché directement avec le champ email */}
                        <Button
                          type="submit"
                          loading={isSubmitting}
                          className="w-full bg-[#F47D6C] hover:bg-[#e05a48] text-white mt-4"
                          disabled={!formData.email}
                          icon={<Bell className="w-4 h-4" />}
                          iconPosition="left"
                        >
                          Créer l'alerte
                        </Button>
                      </motion.div>
                    )}
                  </form>
                </div>
              </>
            ) : (
              /* Success State optimisé mobile */
              <div className="text-center p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-blue-900 font-['Roboto_Slab'] mb-3">
                  Alerte créée avec succès ! 🎉
                </h2>
                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                  Vous recevrez un email dès qu'une nouvelle annonce correspondra à vos critères.
                </p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4 md:mb-6 text-left">
                  <p className="font-medium text-gray-800 mb-2 text-sm md:text-base">
                    Alerte configurée pour les personnes qui {formData.type === 'offer' ? 'proposent' : 'cherchent'} de la place
                    {formData.departure && ` depuis ${locations.find(l => l.value === formData.departure)?.label}`}
                    {formData.destination && ` vers ${locations.find(l => l.value === formData.destination)?.label}`}
                    {formData.volumeMin > 1 && ` (${volumes.find(v => v.value === formData.volumeMin.toString())?.label})`}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">📧 Notifications envoyées à : {formData.email}</p>
                </div>

                <Button
                  onClick={resetAndClose}
                  className="w-full bg-[#F47D6C] hover:bg-[#e05a48] text-white"
                >
                  Parfait !
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertModal; 