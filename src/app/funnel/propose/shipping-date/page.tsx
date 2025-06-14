'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import CustomDatePicker from '@/components/ui/CustomDatePicker';

export default function ShippingDateStep() {
  const router = useRouter();
  const { formData, setShippingDate } = useProposeStore();
  
  const [selectedDate, setSelectedDate] = useState(formData.shippingDate);
  const [error, setError] = useState('');

  // Calculer les dates min/max
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 7); // Minimum 7 jours
  
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1); // Maximum 1 an

  // Formater les dates pour l'input HTML5
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Validation de la date
  const validateDate = (dateString: string) => {
    if (!dateString) {
      return 'Veuillez sélectionner une date de départ';
    }

    const selectedDate = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (selectedDate < minDate) {
      return 'La date doit être dans au moins 7 jours';
    }
    
    if (selectedDate > maxDate) {
      return 'La date ne peut pas être dans plus d\'un an';
    }

    return '';
  };

  // Gestion du changement de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => {
    const dateString = e.target.value;
    setSelectedDate(dateString);
    
    const validationError = validateDate(dateString);
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      setShippingDate(dateString);
    }
  };

  // Mettre à jour le store quand la date change et est valide
  useEffect(() => {
    if (selectedDate && !validateDate(selectedDate)) {
      setShippingDate(selectedDate);
    }
  }, [selectedDate, setShippingDate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* TITRE - Style identique à l'étape 1 */}
      <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
        📅 Quand part votre conteneur ?
      </h1>

      <div className="space-y-6 mb-96">
        {/* CustomDatePicker - identique à Dodomove */}
        <div className="mb-12">
          <CustomDatePicker
            label="Date de départ (approximative)"
            name="shippingDate"
            value={selectedDate}
            onChange={handleDateChange}
            error={error}
            min={formatDateForInput(minDate)}
            max={formatDateForInput(maxDate)}
            required
          />
        </div>

        {/* Info utile avec style cohérent */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-8">
          <div className="flex gap-3">
            <span className="text-blue-600 flex-shrink-0 mt-0.5">💡</span>
            <div className="text-sm text-blue-800 font-['Lato']">
              <p className="font-medium mb-2">Vous ne connaissez pas votre date exacte ?</p>
              <p className="text-blue-700 leading-relaxed">
                Pas de problème ! Indiquez une date approximative. Vous pourrez la modifier plus tard, 
                et les personnes intéressées pourront s'adapter à vos contraintes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 