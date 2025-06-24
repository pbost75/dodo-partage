'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import VolumeSelector from '@/components/ui/VolumeSelector';
import EnhancedRadioGroup from '@/components/ui/EnhancedRadioGroup';
import FloatingInput from '@/components/ui/FloatingInput';

// Options pour le type de budget
const budgetTypeOptions = [
  {
    value: 'no-budget',
    label: '💸 Gratuit uniquement',
    subtitle: 'Je cherche une place gratuite',
    description: 'Uniquement les offres sans frais'
  },
  {
    value: 'budget',
    label: '💰 Avec budget',
    subtitle: 'Je peux payer une participation',
    description: 'J\'ai un budget pour participer aux frais'
  }
];

export default function VolumeNeededStep() {
  const router = useRouter();
  const { formData, setVolumeNeeded } = useSearchStore();
  
  const [neededVolume, setNeededVolume] = useState(formData.volumeNeeded.neededVolume);
  const [budgetType, setBudgetType] = useState(formData.volumeNeeded.budgetType);
  const [maxBudget, setMaxBudget] = useState(formData.volumeNeeded.maxBudget || 0);
  const [errors, setErrors] = useState({
    neededVolume: '',
    budgetType: '',
    maxBudget: ''
  });

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

  // Validation du budget
  const validateBudget = (budget: number) => {
    if (budgetType === 'budget' && budget <= 0) {
      return 'Veuillez indiquer votre budget maximum';
    }
    if (budget > 50000) {
      return 'Le budget semble anormalement élevé';
    }
    return '';
  };

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setVolumeNeeded({
      neededVolume,
      budgetType,
      maxBudget: budgetType === 'budget' ? maxBudget : undefined
    });
  }, [neededVolume, budgetType, maxBudget, setVolumeNeeded]);

  // Gestion du changement de volume
  const handleVolumeChange = (volume: number) => {
    setNeededVolume(volume);
    const error = validateVolume(volume);
    setErrors(prev => ({ ...prev, neededVolume: error }));
  };

  // Gestion du changement de type de budget
  const handleBudgetTypeChange = (type: string) => {
    setBudgetType(type as 'no-budget' | 'budget');
    setErrors(prev => ({ ...prev, budgetType: '' }));
    
    // Si on passe à "gratuit", reset le budget
    if (type === 'no-budget') {
      setMaxBudget(0);
      setErrors(prev => ({ ...prev, maxBudget: '' }));
    }
  };

  // Gestion du changement de budget
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxBudget(value);
    const error = validateBudget(value);
    setErrors(prev => ({ ...prev, maxBudget: error }));
  };

  // Validation finale
  const validateForm = () => {
    const volumeError = validateVolume(neededVolume);
    const budgetError = validateBudget(maxBudget);
    const budgetTypeError = !budgetType ? 'Veuillez choisir votre approche budget' : '';

    const newErrors = {
      neededVolume: volumeError,
      budgetType: budgetTypeError,
      maxBudget: budgetError
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Gestion de la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      router.push('/funnel/search/announcement-text');
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

        {/* Type de budget */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 font-['Roboto_Slab']">
            Quel est votre budget ?
          </h2>
          <EnhancedRadioGroup
            name="budgetType"
            options={budgetTypeOptions}
            value={budgetType}
            onChange={handleBudgetTypeChange}
            error={errors.budgetType}
          />
        </div>

        {/* Champ budget conditionnel */}
        {budgetType === 'budget' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <FloatingInput
              label="Budget maximum (€)"
              type="number"
              name="maxBudget"
              value={maxBudget.toString()}
              onChange={handleBudgetChange}
              placeholder="Ex: 500"
              error={errors.maxBudget}
              min="1"
              max="50000"
            />
          </motion.div>
        )}

        {/* Info utile */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-8">
          <div className="flex gap-3">
            <span className="text-green-600 flex-shrink-0 mt-0.5">💡</span>
            <div className="text-sm text-green-800 font-['Lato']">
              <p className="font-medium mb-2">Conseil pour maximiser vos chances</p>
              <ul className="text-green-700 leading-relaxed space-y-1">
                <li>• Plus votre volume est flexible, plus vous aurez d'options</li>
                <li>• Les offres gratuites sont rares mais existent !</li>
                <li>• Un petit budget peut considérablement augmenter vos possibilités</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
} 