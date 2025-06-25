'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import VolumeSelector from '@/components/ui/VolumeSelector';

import { VolumeCalculatorModal } from '@/components/ui/VolumeCalculatorModal';
import { Calculator, ArrowRight, Check } from 'lucide-react';

interface CalculatorItem {
  id: string;
  name: string;
  quantity: number;
  volume: number;
  category: string;
}

export default function VolumeNeededStep() {
  const router = useRouter();
  const { formData, setVolumeNeeded } = useSearchStore();
  
  const [neededVolume, setNeededVolume] = useState(formData.volumeNeeded.neededVolume);
  const [errors, setErrors] = useState({
    neededVolume: ''
  });
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorItems, setCalculatorItems] = useState<CalculatorItem[]>(() => {
    try {
      return formData.volumeNeeded.listingItems ? JSON.parse(formData.volumeNeeded.listingItems) : [];
    } catch {
      return [];
    }
  });
  const [usedCalculator, setUsedCalculator] = useState(formData.volumeNeeded.usedCalculator || false);
  const [listingItems, setListingItems] = useState<string>(formData.volumeNeeded.listingItems || '');
  const [volumeDescription, setVolumeDescription] = useState<string>(formData.volumeNeeded.volumeDescription || '');
  const [isMounted, setIsMounted] = useState(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validation du volume
  const validateVolume = (volume: number) => {
    if (volume <= 0) {
      return 'Le volume doit être supérieur à 0';
    }
    if (volume > 50) {
      return 'Le volume ne peut pas dépasser 50 m³';
    }
    return '';
  };

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setVolumeNeeded({
      neededVolume,
      usedCalculator,
      listingItems: listingItems || undefined,
      volumeDescription: volumeDescription || undefined
    });
  }, [neededVolume, usedCalculator, listingItems, volumeDescription, setVolumeNeeded]);

  // Gestion du changement de volume
  const handleVolumeChange = (volume: number) => {
    setNeededVolume(volume);
    const error = validateVolume(volume);
    setErrors({ neededVolume: error });
    
    // Si l'utilisateur modifie manuellement, désactiver le flag calculateur
    if (usedCalculator && volume !== neededVolume) {
      setUsedCalculator(false);
      setCalculatorItems([]);
    }
  };

  // Gestion de la sauvegarde depuis le calculateur
  const handleCalculatorSave = (data: { 
    description: string; 
    volume: number; 
    listingItems: string; 
    usedCalculator: boolean; 
  }) => {
    console.log('💾 Données reçues du calculateur:', data);
    
    // Mettre à jour le volume avec la valeur calculée
    const roundedVolume = Math.round(data.volume * 10) / 10;
    setNeededVolume(roundedVolume);
    
    // Sauvegarder les données du calculateur
    setListingItems(data.listingItems);
    setVolumeDescription(data.description);
    setUsedCalculator(data.usedCalculator);
    
    // Parser les items pour l'affichage
    try {
      const items = JSON.parse(data.listingItems);
      setCalculatorItems(items);
    } catch (error) {
      console.warn('⚠️ Erreur lors du parsing des items:', error);
      setCalculatorItems([]);
    }
    
    // Valider le nouveau volume
    const error = validateVolume(roundedVolume);
    setErrors({ neededVolume: error });
  };

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
    <>
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
            

          </div>

          {/* Calculateur de volume intégré */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
              
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-['Lato'] text-sm font-medium ${
                  usedCalculator && calculatorItems.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {usedCalculator && calculatorItems.length > 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Modifier ma liste
                  </>
                ) : (
                  <>
                    Calculer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Résumé si calculateur utilisé */}
            {usedCalculator && calculatorItems.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 font-['Lato']">
                    Volume calculé : {Math.round(neededVolume * 10) / 10} m³
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-['Lato']">
                  {calculatorItems.length} objet{calculatorItems.length > 1 ? 's' : ''} sélectionné{calculatorItems.length > 1 ? 's' : ''}
                </p>
                <div className="mt-2 text-xs text-gray-500 font-['Lato']">
                  💡 Vous pouvez ajuster le volume manuellement ou modifier votre sélection
                </div>
              </div>
            )}

            {/* Avantages d'utiliser le calculateur */}
            {!usedCalculator && (
              <div className="space-y-2 text-sm">
                <p className="text-blue-700 leading-relaxed flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Sélectionnez vos objets dans notre base de données
                </p>
                <p className="text-blue-700 leading-relaxed flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Calcul automatique et précis du volume total
                </p>
                <p className="text-blue-700 leading-relaxed flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Évite les erreurs d'estimation
                </p>
              </div>
            )}
          </div>
        </form>


      </motion.div>

      {/* Modal du calculateur de volume */}
      {isMounted && (
        <VolumeCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          onSave={handleCalculatorSave}
          existingListingItems={usedCalculator ? listingItems : undefined}
          existingVolume={usedCalculator ? neededVolume : undefined}
        />
      )}
    </>
  );
} 