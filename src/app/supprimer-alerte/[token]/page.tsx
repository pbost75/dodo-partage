'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DeletionReason {
  value: string;
  label: string;
  description: string;
}

const deletionReasons: DeletionReason[] = [
  {
    value: 'found_solution',
    label: 'J\'ai trouvé une solution',
    description: 'J\'ai trouvé un transporteur ou une autre solution de groupage'
  },
  {
    value: 'plans_changed',
    label: 'Mes plans ont changé',
    description: 'Je n\'ai plus besoin de ce service pour le moment'
  },
  {
    value: 'too_many_emails',
    label: 'Trop d\'emails',
    description: 'Je reçois trop de notifications par email'
  },
  {
    value: 'not_relevant',
    label: 'Alertes non pertinentes',
    description: 'Les alertes ne correspondent pas à mes besoins'
  },
  {
    value: 'other',
    label: 'Autre raison',
    description: 'Une raison non listée ci-dessus'
  }
];

export default function DeleteAlertPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [step, setStep] = useState<'reason' | 'confirm' | 'success' | 'error'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleReasonSelect = (reasonValue: string) => {
    setSelectedReason(reasonValue);
  };

  const handleContinue = () => {
    if (!selectedReason) return;
    setStep('confirm');
  };

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/unsubscribe-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          reason: selectedReason === 'other' ? customReason : selectedReason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      const result = await response.json();
      console.log('✅ Alerte supprimée:', result);
      
      setStep('success');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('reason');
    }
  };

  const getSelectedReasonLabel = () => {
    const reason = deletionReasons.find(r => r.value === selectedReason);
    return reason ? reason.label : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Roboto_Slab']">
            Supprimer l'alerte
          </h1>
          <p className="text-gray-600 mt-2">
            Nous sommes désolés de vous voir partir
          </p>
        </div>

        {/* Étape 1: Choix de la raison */}
        {step === 'reason' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pourquoi souhaitez-vous supprimer cette alerte ?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Votre retour nous aide à améliorer notre service.
            </p>

            <div className="space-y-3">
              {deletionReasons.map((reason) => (
                <motion.div
                  key={reason.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReason === reason.value
                        ? 'border-[#F47D6C] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => handleReasonSelect(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 mr-3 ${
                        selectedReason === reason.value
                          ? 'border-[#F47D6C] bg-[#F47D6C]'
                          : 'border-gray-300'
                      }`}>
                        {selectedReason === reason.value && (
                          <Check className="w-3 h-3 text-white m-auto" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {reason.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {reason.description}
                        </div>
                      </div>
                    </div>
                  </label>
                </motion.div>
              ))}
            </div>

            {/* Champ texte pour "Autre" */}
            {selectedReason === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Veuillez préciser la raison..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F47D6C] focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {customReason.length}/200 caractères
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                className="flex-1 bg-[#F47D6C] hover:bg-[#e05a48]"
              >
                Continuer
              </Button>
            </div>
          </motion.div>
        )}

        {/* Étape 2: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmez la suppression
            </h2>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-800 font-medium">
                    Vous êtes sur le point de supprimer votre alerte
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Vous ne recevrez plus de notifications pour les nouvelles opportunités correspondant à vos critères.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Raison sélectionnée :</h3>
              <p className="text-gray-700">
                {selectedReason === 'other' ? customReason : getSelectedReasonLabel()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isSubmitting}
              >
                Retour
              </Button>
              <Button
                onClick={handleDeactivate}
                loading={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Supprimer définitivement
              </Button>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Succès */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Alerte supprimée avec succès
            </h2>
            
            <p className="text-gray-600 mb-6">
              Votre alerte a été supprimée. Vous ne recevrez plus de notifications par email pour cette alerte.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 Vous pouvez créer une nouvelle alerte à tout moment sur DodoPartage
              </p>
            </div>

            <Button
              onClick={() => router.push('/')}
              className="w-full bg-[#F47D6C] hover:bg-[#e05a48]"
            >
              Retour à DodoPartage
            </Button>
          </motion.div>
        )}

        {/* Étape 4: Erreur */}
        {step === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur lors de la suppression
            </h2>
            
            <p className="text-gray-600 mb-4">
              {errorMessage || 'Une erreur inattendue s\'est produite.'}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('reason')}
                className="flex-1"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-[#F47D6C] hover:bg-[#e05a48]"
              >
                Retour à l'accueil
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
} 