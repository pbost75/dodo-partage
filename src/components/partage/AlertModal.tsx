'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Check, Package, Search } from 'lucide-react';
import { FaTimes } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingSelect from '@/components/ui/FloatingSelect';
import RangeSlider from '@/components/ui/RangeSlider';

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
  volumeMax: number;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, initialFilters = {} }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<AlertFormData>({
    email: '',
    departure: initialFilters.departure || '',
    destination: initialFilters.destination || '',
    type: initialFilters.type || 'offer', // Par défaut "offres" au lieu de "all"
    volumeMin: 0,
    volumeMax: 20
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Empêcher le scroll de la page quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Nettoyer au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Mise à jour automatique des filtres quand initialFilters change
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        departure: initialFilters.departure || '',
        destination: initialFilters.destination || '',
        type: initialFilters.type || 'offer'
      }));
    }
  }, [isOpen, initialFilters]);

  const countryOptions = [
    { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷' },
    { value: 'reunion', label: 'Réunion', emoji: '🌺' },
    { value: 'martinique', label: 'Martinique', emoji: '🌴' },
    { value: 'guadeloupe', label: 'Guadeloupe', emoji: '🏝️' },
    { value: 'guyane', label: 'Guyane', emoji: '🌿' },
    { value: 'mayotte', label: 'Mayotte', emoji: '🐋' },
    { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie', emoji: '🏖️' }
  ];

  // Fonction pour générer automatiquement un nom d'alerte parlant
  const generateAlertName = () => {
    const departureLabel = countryOptions.find(c => c.value === formData.departure)?.label || '';
    const destinationLabel = countryOptions.find(c => c.value === formData.destination)?.label || '';
    const typeLabel = formData.type === 'offer' ? 'Proposes' : 'Recherches';
    
    // Cas où départ et destination sont spécifiés
    if (formData.departure && formData.destination) {
      return `${typeLabel} de ${departureLabel} vers ${destinationLabel}`;
    }
    // Cas où seul le départ est spécifié
    else if (formData.departure) {
      return `${typeLabel} au départ de ${departureLabel}`;
    }
    // Cas où seule la destination est spécifiée
    else if (formData.destination) {
      return `${typeLabel} vers ${destinationLabel}`;
    }
    // Cas par défaut
    else {
      return `${typeLabel} de conteneurs`;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.departure && !formData.destination) {
      newErrors.destination = 'Veuillez sélectionner au moins un lieu (départ ou destination)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulation d'appel API - à remplacer par l'appel réel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Intégrer avec le backend pour sauvegarder l'alerte
      const alertData = {
        ...formData,
        name: generateAlertName() // Génération automatique du nom
      };
      console.log('Alerte configurée:', alertData);
      
      setStep('success');
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AlertFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: keyof AlertFormData) => (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setFormData({
      email: '',
      departure: initialFilters.departure || '',
      destination: initialFilters.destination || '',
      type: initialFilters.type || 'offer',
      volumeMin: 0,
      volumeMax: 20
    });
    setErrors({});
    onClose();
  };

  // Animations identiques au funnel
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {step === 'form' ? (
              <>
                {/* Header identique au funnel */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                  <h2 className="text-xl font-title font-bold text-[#243163]">
                    Créer une alerte
                  </h2>
                  <button 
                    onClick={resetAndClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Formulaire réorganisé */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Info box en premier */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 font-body">
                        <p className="font-medium mb-1">Comment ça marche ?</p>
                        <p>
                          Vous recevrez un email dès qu'une nouvelle annonce correspond à vos critères. 
                          Vous pourrez modifier ou supprimer cette alerte à tout moment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Type d'annonce en premier */}
                  <div>
                    <div className="mb-3">
                      <span className="text-sm font-body font-medium text-gray-700">
                        Type d'annonce recherchée
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`relative flex items-center justify-center h-16 md:h-20 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.type === 'offer' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="type"
                          value="offer"
                          checked={formData.type === 'offer'}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-3 h-3 text-blue-600" />
                          </div>
                          <div className="font-body font-medium text-sm">Proposes</div>
                        </div>
                        {formData.type === 'offer' && (
                          <div className="absolute top-3 right-3">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </label>
                      
                      <label className={`relative flex items-center justify-center h-16 md:h-20 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.type === 'request' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="type"
                          value="request"
                          checked={formData.type === 'request'}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Search className="w-3 h-3 text-green-600" />
                          </div>
                          <div className="font-body font-medium text-sm">Recherches</div>
                        </div>
                        {formData.type === 'request' && (
                          <div className="absolute top-3 right-3">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Départ et Destination après le type */}
                  <div>
                    <div className="mb-3">
                      <span className="text-sm font-body font-medium text-gray-700">
                        Lieux
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FloatingSelect
                          label="Départ"
                          name="departure"
                          options={countryOptions}
                          value={formData.departure}
                          onChange={handleSelectChange('departure')}
                        />
                      </div>
                      
                      <div>
                        <FloatingSelect
                          label="Destination"
                          name="destination"
                          options={countryOptions}
                          value={formData.destination}
                          onChange={handleSelectChange('destination')}
                          error={errors.destination}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Volume souhaité */}
                  <div>
                    <RangeSlider
                      min={0}
                      max={20}
                      minValue={formData.volumeMin}
                      maxValue={formData.volumeMax}
                      step={0.5}
                      unit="m³"
                      label="Volume souhaité (optionnel)"
                      onChange={(min, max) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          volumeMin: min, 
                          volumeMax: max 
                        }));
                      }}
                    />
                  </div>

                  {/* Email en dernier */}
                  <div>
                    <h3 className="text-sm font-body font-medium text-gray-700 mb-3">
                      Votre email
                    </h3>
                    <FloatingInput
                      label="Votre email *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      required
                    />
                  </div>

                  {/* Error global */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-800 text-sm font-body">{errors.submit}</p>
                    </div>
                  )}

                  {/* Boutons identiques au funnel */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors font-body font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#F47D6C] text-white py-3 rounded-md hover:bg-[#e05a48] transition-colors font-body font-medium disabled:opacity-50"
                    >
                      {isSubmitting ? 'Création...' : 'Créer l\'alerte'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success State - style identique au funnel */
              <>
                <div className="bg-green-50 p-6 text-center border-b">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600 text-2xl" />
                  </div>
                  <h2 className="text-2xl font-title font-bold text-[#243163] mb-2">
                    Alerte créée !
                  </h2>
                  <p className="text-gray-600 font-body">
                    Vous recevrez un email dès qu'une nouvelle annonce correspondra à vos critères.
                  </p>
                </div>

                <div className="p-6">
                  <div className="bg-gray-50 rounded-md p-4 mb-6">
                    <h3 className="font-semibold text-[#243163] mb-2 font-title">{generateAlertName()}</h3>
                    <div className="text-sm text-gray-600 space-y-1 font-body">
                      <p>📧 Notifications envoyées à : {formData.email}</p>
                      {formData.departure && <p>📍 Départ : {countryOptions.find(c => c.value === formData.departure)?.label}</p>}
                      {formData.destination && <p>🎯 Destination : {countryOptions.find(c => c.value === formData.destination)?.label}</p>}
                      <p>📋 Type : {formData.type === 'offer' ? 'Proposes (propose de la place)' : 'Recherches (cherche de la place)'}</p>
                    </div>
                  </div>

                  <button
                    onClick={resetAndClose}
                    className="w-full bg-[#F47D6C] text-white py-3 rounded-md hover:bg-[#e05a48] transition-colors font-body font-medium"
                  >
                    Parfait !
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal; 