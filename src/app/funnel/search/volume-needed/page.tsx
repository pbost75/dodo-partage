'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import VolumeSelector from '@/components/ui/VolumeSelector';
import SearchNavigationFooter from '@/components/layout/SearchNavigationFooter';
import { Calculator, ArrowRight, Check } from 'lucide-react';

export default function VolumeNeededStep() {
  const router = useRouter();
  const { formData, setVolumeNeeded } = useSearchStore();
  
  const [neededVolume, setNeededVolume] = useState(formData.volumeNeeded.neededVolume);
  const [errors, setErrors] = useState({
    neededVolume: ''
  });
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState<any>(null);

  // Validation du volume
  const validateVolume = (volume: number) => {
    if (volume <= 0) {
      return 'Le volume doit être supérieur à 0';
    }
    if (volume > 50) {
      return 'Le volume ne peut pas dépasser 50 m³ (limite d\'un conteneur 40 pieds)';
    }
    return '';
  };

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setVolumeNeeded({
      neededVolume
    });
  }, [neededVolume, setVolumeNeeded]);

  // Gestion du changement de volume
  const handleVolumeChange = (volume: number) => {
    setNeededVolume(volume);
    const error = validateVolume(volume);
    setErrors({ neededVolume: error });
  };

  // Gestion des messages du calculateur
  useEffect(() => {
    const handleCalculatorMessage = (event: MessageEvent) => {
      if (event.data.type === 'VOLUME_CALCULATED') {
        const { totalVolume } = event.data.payload;
        setCalculatorData(event.data.payload);
        // Mettre à jour automatiquement le volume avec celui calculé
        const roundedVolume = Math.round(totalVolume * 10) / 10;
        setNeededVolume(roundedVolume);
        const error = validateVolume(roundedVolume);
        setErrors({ neededVolume: error });
      } else if (event.data.type === 'CALCULATOR_RESET') {
        setCalculatorData(null);
      }
    };

    window.addEventListener('message', handleCalculatorMessage);
    return () => window.removeEventListener('message', handleCalculatorMessage);
  }, []);

  // Validation finale
  const validateForm = () => {
    const volumeError = validateVolume(neededVolume);
    const newErrors = { neededVolume: volumeError };
    setErrors(newErrors);
    return !volumeError;
  };

  // Gestion de la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      router.push('/funnel/search/budget');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* TITRE - Style identique aux autres étapes */}
      <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
        📦 Quel volume recherchez-vous ?
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Volume recherché */}
        <div>
          <VolumeSelector
            label="Volume recherché (m³)"
            value={neededVolume}
            onChange={handleVolumeChange}
            min={0.1}
            max={50}
            step={0.1}
            unit="m³"
            placeholder="Ex: 5.5"
            error={errors.neededVolume}
          />
          
          {/* Info sur les volumes */}
          <div className="mt-4 text-sm text-gray-600 font-['Lato']">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Conteneur 20 pieds : jusqu'à 25 m³
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Conteneur 40 pieds : jusqu'à 50 m³
              </span>
            </div>
          </div>
        </div>

        {/* Calculateur de volume intégré */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 font-['Roboto_Slab']">
                  Pas sûr de votre estimation ?
                </h3>
                <p className="text-sm text-gray-600 font-['Lato']">
                  Utilisez notre calculateur pour estimer précisément votre volume
                </p>
              </div>
            </div>
            
            {!showCalculator && (
              <button
                type="button"
                onClick={() => setShowCalculator(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-['Lato'] text-sm font-medium"
              >
                Calculer
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Résumé si calculateur utilisé */}
          {calculatorData && !showCalculator && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 font-['Lato']">
                  Volume calculé : {Math.round(calculatorData.totalVolume * 10) / 10} m³
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Lato']">
                {calculatorData.items.length} objet{calculatorData.items.length > 1 ? 's' : ''} sélectionné{calculatorData.items.length > 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => setShowCalculator(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 font-['Lato']"
              >
                Modifier la sélection →
              </button>
            </div>
          )}

          {/* Calculateur en iframe */}
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-purple-50 border-b border-purple-200">
                  <span className="font-medium text-purple-900 font-['Lato']">
                    Calculateur de volume
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCalculator(false)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-['Lato']"
                  >
                    Masquer
                  </button>
                </div>
                <iframe
                  src="https://calculateur.dodomove.fr/?embedded=true"
                  className="w-full h-96 border-0"
                  title="Calculateur de volume"
                />
              </div>
            </motion.div>
          )}

          {/* Avantages d'utiliser le calculateur */}
          {!showCalculator && !calculatorData && (
            <div className="space-y-2 text-sm">
              <p className="text-purple-700 leading-relaxed flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-600 rounded-full"></span>
                Sélectionnez vos objets dans notre base de données
              </p>
              <p className="text-purple-700 leading-relaxed flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-600 rounded-full"></span>
                Calcul automatique et précis du volume total
              </p>
              <p className="text-purple-700 leading-relaxed flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-600 rounded-full"></span>
                Évite les erreurs d'estimation
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Footer de navigation */}
      <SearchNavigationFooter />
    </motion.div>
  );
} 