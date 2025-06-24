'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import CardRadioGroup from '@/components/ui/CardRadioGroup';
import FloatingInput from '@/components/ui/FloatingInput';
import SearchNavigationFooter from '@/components/layout/SearchNavigationFooter';

// Options pour la participation aux frais - style CardRadioGroup
const participationOptions = [
  {
    value: 'yes',
    label: 'Oui, je peux participer',
    description: 'J\'accepte de contribuer aux frais partagés si nécessaire',
    emoji: '💰',
    iconBgColor: 'bg-green-50',
    iconTextColor: 'text-green-500'
  },
  {
    value: 'no',
    label: 'Non, uniquement gratuit',
    description: 'Je cherche seulement des offres sans participation financière',
    emoji: '🆓',
    iconBgColor: 'bg-orange-50',
    iconTextColor: 'text-orange-500'
  }
];

export default function BudgetStep() {
  const router = useRouter();
  const { formData, setBudget } = useSearchStore();
  
  // Protection contre l'erreur d'hydratation - s'assurer que budget existe
  const budget = formData.budget || { acceptsFees: null, maxBudget: undefined };
  
  const [acceptsFees, setAcceptsFees] = useState<boolean | null>(budget.acceptsFees);
  const [maxBudget, setMaxBudget] = useState(budget.maxBudget || 0);
  const [errors, setErrors] = useState({
    acceptsFees: '',
    maxBudget: ''
  });

  // Validation du budget
  const validateBudget = (budget: number) => {
    if (acceptsFees && budget <= 0) {
      return 'Veuillez indiquer votre budget approximatif';
    }
    if (budget > 10000) {
      return 'Le budget semble très élevé';
    }
    return '';
  };

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setBudget({
      acceptsFees,
      maxBudget: acceptsFees ? maxBudget : undefined
    });
  }, [acceptsFees, maxBudget, setBudget]);

  // Gestion du changement de participation
  const handleParticipationChange = (value: string) => {
    const newAcceptsFees = value === 'yes';
    setAcceptsFees(newAcceptsFees);
    setErrors(prev => ({ ...prev, acceptsFees: '' }));
    
    // Si on passe à "non", reset le budget
    if (!newAcceptsFees) {
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
    const participationError = acceptsFees === null ? 'Veuillez choisir votre position sur la participation aux frais' : '';
    const budgetError = validateBudget(maxBudget);

    const newErrors = {
      acceptsFees: participationError,
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
      {/* TITRE CLARIFIÉ */}
      <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
        💰 Participation aux frais
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question sur la participation avec le nouveau style */}
        <div>
          <CardRadioGroup
            name="participation"
            options={participationOptions}
            value={acceptsFees === true ? 'yes' : acceptsFees === false ? 'no' : ''}
            onChange={handleParticipationChange}
            error={errors.acceptsFees}
          />
        </div>

        {/* Champ budget conditionnel */}
        {acceptsFees === true && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <FloatingInput
              label="Budget approximatif (€)"
              type="number"
              name="maxBudget"
              value={maxBudget.toString()}
              onChange={handleBudgetChange}
              placeholder="Ex: 300"
              error={errors.maxBudget}
              min="1"
              max="10000"
            />
            <p className="text-sm text-gray-600 mt-2 font-['Lato']">
              💡 Indiquez un montant approximatif pour aider les autres à évaluer la faisabilité
            </p>
          </motion.div>
        )}

        {/* Encart informatif */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2 font-['Roboto_Slab']">
                Pourquoi cette question ?
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-700 leading-relaxed font-['Lato']">
                  • Les conteneurs ont des coûts (transport, manutention, stockage)
                </p>
                <p className="text-blue-700 leading-relaxed font-['Lato']">
                  • Participer aux frais augmente vos chances de trouver de la place
                </p>
                <p className="text-blue-700 leading-relaxed font-['Lato']">
                  • Les offres gratuites existent mais sont plus rares
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer de navigation */}
      <SearchNavigationFooter />
    </motion.div>
  );
} 