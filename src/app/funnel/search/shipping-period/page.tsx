'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import MonthPicker from '@/components/ui/MonthPicker';
import SearchNavigationFooter from '@/components/layout/SearchNavigationFooter';

export default function ShippingPeriodStep() {
  const router = useRouter();
  const { formData, setShippingPeriod } = useSearchStore();
  
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    formData.shippingPeriod.selectedMonths || []
  );

  // Mettre à jour le store quand les mois changent
  useEffect(() => {
    setShippingPeriod({
      period: 'flexible', // Toujours flexible maintenant
      selectedMonths: selectedMonths,
      urgency: 'flexible' // Toujours flexible
    });
  }, [selectedMonths, setShippingPeriod]);

  // Redirection si étapes précédentes incomplètes
  useEffect(() => {
    if (!formData.departure.country || !formData.arrival.country) {
      router.push('/funnel/search/locations');
    }
  }, [formData.departure.country, formData.arrival.country, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* TITRE - Style identique aux autres étapes */}
      <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
        ⏰ Quand voulez-vous expédier vos affaires ?
      </h1>

      <div className="space-y-8">
        {/* Sélecteur de mois simple */}
        <div>
          <MonthPicker
            selectedMonths={selectedMonths}
            onMonthsChange={setSelectedMonths}
            placeholder="Sélectionnez une période"
          />
        </div>

        {/* Encart informatif sur la flexibilité */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex gap-4">
            <span className="text-blue-600 flex-shrink-0 mt-0.5 text-2xl">🌟</span>
            <div className="text-blue-800 font-['Lato']">
              <h3 className="font-semibold mb-3 text-lg">Flexibilité = plus d'opportunités</h3>
              <div className="space-y-2 text-sm">
                <p className="leading-relaxed">
                  Plus votre période est large, plus vous aurez de chances de trouver quelqu'un 
                  avec de l'espace dans son conteneur !
                </p>
                <p className="leading-relaxed font-medium">
                  💡 <span className="font-normal">Conseil : Sélectionnez 3 à 6 mois pour maximiser vos chances</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Footer */}
      <SearchNavigationFooter />
    </motion.div>
  );
} 