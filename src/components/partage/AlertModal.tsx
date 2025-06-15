'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import CustomSelect from '@/components/ui/CustomSelect';

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
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<AlertFormData>({
    email: '',
    departure: initialFilters.departure || 'france',
    destination: initialFilters.destination || 'reunion',
    type: initialFilters.type || 'offer',
    volumeMin: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Mise à jour automatique des filtres
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        departure: initialFilters.departure || 'france',
        destination: initialFilters.destination || 'reunion',
        type: initialFilters.type || 'offer'
      }));
    }
  }, [isOpen, initialFilters]);

  const typeOptions = [
    { value: 'offer', label: 'proposent de la place', emoji: '📦', description: 'Conteneurs avec espace disponible' },
    { value: 'request', label: 'cherchent de la place', emoji: '🔍', description: 'Personnes ayant besoin d\'espace' }
  ];

  const locations = [
    { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷', description: 'Métropole' },
    { value: 'reunion', label: 'La Réunion', emoji: '🌺', description: 'Océan Indien' },
    { value: 'martinique', label: 'La Martinique', emoji: '🌴', description: 'Antilles' },
    { value: 'guadeloupe', label: 'La Guadeloupe', emoji: '🏝️', description: 'Antilles' },
    { value: 'guyane', label: 'La Guyane', emoji: '🌿', description: 'Amérique du Sud' },
    { value: 'mayotte', label: 'Mayotte', emoji: '🐋', description: 'Océan Indien' },
    { value: 'nouvelle-caledonie', label: 'La Nouvelle-Calédonie', emoji: '🏖️', description: 'Pacifique' }
  ];

  const volumes = [
    { value: '1', label: 'peu importe', emoji: '📏', description: 'Tous volumes acceptés' },
    { value: '2', label: '2m³ minimum', emoji: '📦', description: 'Quelques cartons' },
    { value: '5', label: '5m³ minimum', emoji: '🏠', description: 'Mobilier moyen' },
    { value: '10', label: '10m³ minimum', emoji: '🚚', description: 'Gros déménagement' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('success');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setFormData({
      email: '',
      departure: initialFilters.departure || 'france',
      destination: initialFilters.destination || 'reunion',
      type: initialFilters.type || 'offer',
      volumeMin: 1
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
          >
            {step === 'form' ? (
              <>
              {/* Header cohérent avec le projet */}
              <div className="border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 font-['Roboto_Slab']">
                    Créer une alerte
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Soyez notifié(e) dès qu'une opportunité correspond à vos besoins
                  </p>
                </div>
                  <button 
                    onClick={resetAndClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                  <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Formulaire à trous en langage naturel */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-lg leading-relaxed text-gray-800 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>Je veux être alerté(e) quand des personnes</span>
                      <CustomSelect
                        options={typeOptions}
                        value={formData.type}
                        onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      />
                  </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span>depuis</span>
                      <CustomSelect
                        options={locations}
                        value={formData.departure}
                        onChange={(value) => setFormData(prev => ({ ...prev, departure: value }))}
                      />
                      <span>vers</span>
                      <CustomSelect
                        options={locations}
                        value={formData.destination}
                        onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span>avec un volume de</span>
                      <CustomSelect
                        options={volumes}
                        value={formData.volumeMin.toString()}
                        onChange={(value) => setFormData(prev => ({ ...prev, volumeMin: parseInt(value) }))}
                      />
                      <span>.</span>
                    </div>
                  </div>
                      </div>
                      
                {/* Email */}
                      <div>
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
                  
                  {/* Info box déplacée */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
                    <div className="flex gap-2">
                      <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p>
                          Vous recevrez un email dès qu'une nouvelle annonce correspond à vos critères. 
                          Vous pourrez modifier ou supprimer cette alerte à tout moment directement depuis les emails reçus.
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                      type="button"
                    variant="outline"
                      onClick={resetAndClose}
                    className="flex-1"
                    >
                      Annuler
                  </Button>
                  <Button
                      type="submit"
                    loading={isSubmitting}
                    className="flex-1 bg-[#F47D6C] hover:bg-[#e05a48] text-white"
                    disabled={!formData.email}
                    >
                    <Bell className="w-4 h-4 mr-2" />
                    Créer l'alerte
                  </Button>
                  </div>
                </form>
              </>
            ) : (
            /* Success State */
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
                  </div>
              <h2 className="text-2xl font-bold text-blue-900 font-['Roboto_Slab'] mb-3">
                Alerte créée avec succès ! 🎉
                  </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                    Vous recevrez un email dès qu'une nouvelle annonce correspondra à vos critères.
                  </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="font-medium text-gray-800 mb-2">
                  Alerte configurée pour les personnes qui {formData.type === 'offer' ? 'proposent' : 'cherchent'} de la place
                  {formData.departure && ` depuis ${locations.find(l => l.value === formData.departure)?.label}`}
                  {formData.destination && ` vers ${locations.find(l => l.value === formData.destination)?.label}`}
                  {formData.volumeMin > 1 && ` (${volumes.find(v => v.value === formData.volumeMin.toString())?.label})`}
                </p>
                <p className="text-sm text-gray-600">📧 Notifications envoyées à : {formData.email}</p>
                  </div>

              <Button
                    onClick={resetAndClose}
                className="w-full bg-[#F47D6C] hover:bg-[#e05a48] text-white"
                  >
                    Parfait !
              </Button>
                </div>
            )}
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default AlertModal; 