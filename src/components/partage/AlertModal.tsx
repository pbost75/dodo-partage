'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import CountrySelect from '@/components/ui/CountrySelect';

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
  volumeMin: string;
  volumeMax: string;
  alertName: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, initialFilters = {} }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<AlertFormData>({
    email: '',
    departure: initialFilters.departure || '',
    destination: initialFilters.destination || '',
    type: initialFilters.type || 'all',
    volumeMin: '',
    volumeMax: '',
    alertName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options des pays avec leurs emojis
  const countryOptions = [
    { value: '', label: 'Peu importe', emoji: '' },
    { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷' },
    { value: 'reunion', label: 'Réunion', emoji: '🌺' },
    { value: 'martinique', label: 'Martinique', emoji: '🌴' },
    { value: 'guadeloupe', label: 'Guadeloupe', emoji: '🏝️' },
    { value: 'guyane', label: 'Guyane', emoji: '🌿' },
    { value: 'mayotte', label: 'Mayotte', emoji: '🐋' },
    { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie', emoji: '🏖️' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous types d\'annonces' },
    { value: 'offer', label: 'Uniquement les offres (propose de la place)' },
    { value: 'request', label: 'Uniquement les demandes (cherche de la place)' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.alertName) {
      newErrors.alertName = 'Le nom de l\'alerte est obligatoire';
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
      console.log('Alerte configurée:', formData);
      
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

  const resetAndClose = () => {
    setStep('form');
    setFormData({
      email: '',
      departure: initialFilters.departure || '',
      destination: initialFilters.destination || '',
      type: initialFilters.type || 'all',
      volumeMin: '',
      volumeMax: '',
      alertName: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={resetAndClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {step === 'form' ? (
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F47D6C]/10 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#F47D6C]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-roboto-slab">
                      Créer une alerte
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Recevez un email dès qu'une annonce correspond à vos critères
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetAndClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom de l'alerte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de votre alerte *
                  </label>
                  <input
                    type="text"
                    value={formData.alertName}
                    onChange={(e) => handleInputChange('alertName', e.target.value)}
                    placeholder="Ex: Conteneur vers la Réunion"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F47D6C]/20 focus:border-[#F47D6C] transition-colors ${
                      errors.alertName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.alertName && (
                    <p className="text-red-600 text-sm mt-1">{errors.alertName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F47D6C]/20 focus:border-[#F47D6C] transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Critères de recherche */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Critères de recherche</h3>
                  
                  {/* Départ et destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Départ
                      </label>
                      <CountrySelect
                        label="Départ"
                        value={formData.departure}
                        onChange={(value) => handleInputChange('departure', value)}
                        options={countryOptions}
                        placeholder="Peu importe"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <CountrySelect
                        label="Destination"
                        value={formData.destination}
                        onChange={(value) => handleInputChange('destination', value)}
                        options={countryOptions}
                        placeholder="Peu importe"
                        className="w-full"
                      />
                      {errors.destination && (
                        <p className="text-red-600 text-sm mt-1">{errors.destination}</p>
                      )}
                    </div>
                  </div>

                  {/* Type d'annonce */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'annonce
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F47D6C]/20 focus:border-[#F47D6C] transition-colors"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Volume (optionnel) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume souhaité (optionnel)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.volumeMin}
                          onChange={(e) => handleInputChange('volumeMin', e.target.value)}
                          placeholder="Min (m³)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F47D6C]/20 focus:border-[#F47D6C] transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.volumeMax}
                          onChange={(e) => handleInputChange('volumeMax', e.target.value)}
                          placeholder="Max (m³)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F47D6C]/20 focus:border-[#F47D6C] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Comment ça marche ?</p>
                      <p>
                        Vous recevrez un email dès qu'une nouvelle annonce correspond à vos critères. 
                        Vous pourrez modifier ou supprimer cette alerte à tout moment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error global */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={resetAndClose}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Création...
                      </div>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Créer l'alerte
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-roboto-slab">
                  Alerte créée avec succès !
                </h2>
                <p className="text-gray-600">
                  Vous recevrez un email dès qu'une nouvelle annonce correspondra à vos critères.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{formData.alertName}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📧 Notifications envoyées à : {formData.email}</p>
                  {formData.departure && <p>📍 Départ : {countryOptions.find(c => c.value === formData.departure)?.label}</p>}
                  {formData.destination && <p>🎯 Destination : {countryOptions.find(c => c.value === formData.destination)?.label}</p>}
                  <p>📋 Type : {typeOptions.find(t => t.value === formData.type)?.label}</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={resetAndClose}
                className="w-full"
              >
                Parfait !
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal; 