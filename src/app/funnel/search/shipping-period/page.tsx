'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import EnhancedRadioGroup from '@/components/ui/EnhancedRadioGroup';
import FloatingSelect from '@/components/ui/FloatingSelect';

// Options pour les mois
const monthOptions = [
  { value: 'janvier', label: 'Janvier' },
  { value: 'février', label: 'Février' },
  { value: 'mars', label: 'Mars' },
  { value: 'avril', label: 'Avril' },
  { value: 'mai', label: 'Mai' },
  { value: 'juin', label: 'Juin' },
  { value: 'juillet', label: 'Juillet' },
  { value: 'août', label: 'Août' },
  { value: 'septembre', label: 'Septembre' },
  { value: 'octobre', label: 'Octobre' },
  { value: 'novembre', label: 'Novembre' },
  { value: 'décembre', label: 'Décembre' },
];

// Options pour l'urgence
const urgencyOptions = [
  {
    value: 'urgent',
    label: '🔥 Urgent',
    subtitle: 'Dans les prochaines semaines',
    description: 'Je dois partir rapidement'
  },
  {
    value: 'normal',
    label: '📅 Normal',
    subtitle: 'Dans les prochains mois',
    description: 'J\'ai une date à respecter'
  },
  {
    value: 'flexible',
    label: '🌴 Flexible',
    subtitle: 'Quand ça m\'arrange',
    description: 'Pas de contrainte de temps'
  }
];

export default function ShippingPeriodStep() {
  const router = useRouter();
  const { formData, setShippingPeriod } = useSearchStore();
  
  const [period, setPeriod] = useState(formData.shippingPeriod.period);
  const [preferredMonth, setPreferredMonth] = useState(formData.shippingPeriod.preferredMonth || '');
  const [specificDate, setSpecificDate] = useState(formData.shippingPeriod.specificDate || '');
  const [urgency, setUrgency] = useState(formData.shippingPeriod.urgency);
  const [errors, setErrors] = useState({
    period: '',
    preferredMonth: '',
    specificDate: '',
    urgency: ''
  });

  // Calculer les dates min/max
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1); // Minimum demain
  
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1); // Maximum 1 an

  // Formater les dates pour l'input HTML5
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Options pour le type de période
  const periodOptions = [
    {
      value: 'flexible',
      label: '📅 Période flexible',
      subtitle: 'Un mois approximatif',
      description: 'Je préfère une certaine période'
    },
    {
      value: 'specific',
      label: '🎯 Date précise',
      subtitle: 'Une date exacte',
      description: 'J\'ai une date de départ fixe'
    }
  ];

  // Validation
  const validateForm = () => {
    const newErrors = {
      period: !period ? 'Veuillez choisir un type de période' : '',
      preferredMonth: period === 'flexible' && !preferredMonth ? 'Veuillez sélectionner un mois' : '',
      specificDate: period === 'specific' && !specificDate ? 'Veuillez sélectionner une date' : '',
      urgency: !urgency ? 'Veuillez indiquer votre urgence' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Mettre à jour le store quand les données changent
  useEffect(() => {
    setShippingPeriod({
      period,
      preferredMonth: period === 'flexible' ? preferredMonth : undefined,
      specificDate: period === 'specific' ? specificDate : undefined,
      urgency
    });
  }, [period, preferredMonth, specificDate, urgency, setShippingPeriod]);

  // Gestion de la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      router.push('/funnel/search/volume-needed');
    }
  };

  // Gestion du changement de période
  const handlePeriodChange = (value: string) => {
    setPeriod(value as 'flexible' | 'specific');
    // Réinitialiser les erreurs liées
    setErrors(prev => ({
      ...prev,
      period: '',
      preferredMonth: '',
      specificDate: ''
    }));
  };

  // Gestion du changement d'urgence
  const handleUrgencyChange = (value: string) => {
    setUrgency(value as 'urgent' | 'normal' | 'flexible');
    setErrors(prev => ({ ...prev, urgency: '' }));
  };

  // Gestion du changement de mois
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => {
    setPreferredMonth(e.target.value);
    setErrors(prev => ({ ...prev, preferredMonth: '' }));
  };

  // Gestion du changement de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    setSpecificDate(e.target.value);
    setErrors(prev => ({ ...prev, specificDate: '' }));
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
        ⏰ Quand souhaitez-vous partir ?
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Type de période */}
        <div>
          <EnhancedRadioGroup
            name="period"
            options={periodOptions}
            value={period}
            onChange={handlePeriodChange}
            error={errors.period}
          />
        </div>

        {/* Champ conditionnel pour période flexible */}
        {period === 'flexible' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <FloatingSelect
              label="Mois souhaité"
              id="preferredMonth"
              options={monthOptions}
              value={preferredMonth}
              onChange={handleMonthChange}
              error={errors.preferredMonth}
              required
            />
          </motion.div>
        )}

        {/* Champ conditionnel pour date spécifique */}
        {period === 'specific' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <CustomDatePicker
              label="Date de départ souhaitée"
              name="specificDate"
              value={specificDate}
              onChange={handleDateChange}
              error={errors.specificDate}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              required
            />
          </motion.div>
        )}

        {/* Niveau d'urgence */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 font-['Roboto_Slab']">
            Quel est votre niveau d'urgence ?
          </h2>
          <EnhancedRadioGroup
            name="urgency"
            options={urgencyOptions}
            value={urgency}
            onChange={handleUrgencyChange}
            error={errors.urgency}
          />
        </div>

        {/* Info utile */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-8">
          <div className="flex gap-3">
            <span className="text-blue-600 flex-shrink-0 mt-0.5">💡</span>
            <div className="text-sm text-blue-800 font-['Lato']">
              <p className="font-medium mb-2">Flexibilité = plus d'opportunités</p>
              <p className="text-blue-700 leading-relaxed">
                Plus vous êtes flexible sur les dates, plus vous avez de chances de trouver 
                une place dans un conteneur à un prix avantageux !
              </p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
} 