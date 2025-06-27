'use client';

import React, { useState, useEffect } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import CardRadioGroup from '@/components/ui/CardRadioGroup';


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
  const router = useSmartRouter();
  const { formData, setBudget } = useSearchStore();
  
  // Protection contre l'erreur d'hydratation - s'assurer que budget existe
  const budget = formData.budget || { acceptsFees: null };
  
  const [acceptsFees, setAcceptsFees] = useState<boolean | null>(budget.acceptsFees);
  const [errors, setErrors] = useState({
    acceptsFees: ''
  });

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setBudget({
      acceptsFees
    });
  }, [acceptsFees, setBudget]);

  // Gestion du changement de participation
  const handleParticipationChange = (value: string) => {
    const newAcceptsFees = value === 'yes';
    setAcceptsFees(newAcceptsFees);
    setErrors(prev => ({ ...prev, acceptsFees: '' }));
  };

  // Validation finale
  const validateForm = () => {
    const participationError = acceptsFees === null ? 'Veuillez choisir votre position sur la participation aux frais' : '';

    const newErrors = {
      acceptsFees: participationError
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
                <p className="text-blue-700 leading-relaxed font-['Lato']">
                  • Le montant se négocie directement entre les parties
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer de navigation */}

    </motion.div>
  );
} 