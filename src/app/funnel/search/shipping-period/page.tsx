'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import HelpBlock from '@/components/ui/HelpBlock';

export default function ShippingPeriodStep() {
  const router = useSmartRouter();
  const { formData, setShippingPeriod } = useSearchStore();
  
  // États pour la sélection de période
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Initialiser depuis le store si données existantes
  useEffect(() => {
    if (formData.shippingPeriod.selectedMonths && formData.shippingPeriod.selectedMonths.length > 0) {
      const sortedMonths = [...formData.shippingPeriod.selectedMonths].sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return months.indexOf(monthA) - months.indexOf(monthB);
      });
      
      const firstMonth = sortedMonths[0];
      const lastMonth = sortedMonths[sortedMonths.length - 1];
      setStartDate(firstMonth);
      setEndDate(lastMonth);
      
      // Si on a déjà les deux dates, la sélection est terminée
      if (firstMonth && lastMonth) {
        setSelectionStep('end');
      }
    }
  }, []);

  // Fonctions utilitaires
  const formatMonthKey = (month: string, year: number) => `${month} ${year}`;
  
  const getMonthIndex = (monthName: string, year: number) => {
    const monthIndex = months.indexOf(monthName);
    return year * 12 + monthIndex;
  };

  const parseMonthKey = (monthKey: string) => {
    const [month, year] = monthKey.split(' ');
    return { month, year: parseInt(year) };
  };

  // Générer la liste de tous les mois entre début et fin
  const generateMonthsRange = (start: string, end: string) => {
    if (!start || !end) return [];
    
    const startParsed = parseMonthKey(start);
    const endParsed = parseMonthKey(end);
    
    const startIndex = getMonthIndex(startParsed.month, startParsed.year);
    const endIndex = getMonthIndex(endParsed.month, endParsed.year);
    
    const range = [];
    for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
      const year = Math.floor(i / 12);
      const monthIndex = i % 12;
      range.push(formatMonthKey(months[monthIndex], year));
    }
    return range;
  };

  // Gestion de la sélection d'un mois
  const handleMonthSelect = (month: string, year: number) => {
    const selectedMonth = formatMonthKey(month, year);
    console.log('🔍 Sélection mois:', selectedMonth, 'Étape:', selectionStep);
    
    if (selectionStep === 'start') {
      console.log('📅 Mise à jour startDate:', selectedMonth);
      setStartDate(selectedMonth);
      
      // Passer à la sélection de fin
      setSelectionStep('end');
    } else if (selectionStep === 'end') {
      console.log('📅 Mise à jour endDate:', selectedMonth);
      
      // Si l'utilisateur clique sur le même mois que le début, c'est OK
      if (selectedMonth === startDate) {
        console.log('📅 Même mois sélectionné pour début et fin');
        setEndDate(selectedMonth);
        return;
      }
      
      // Vérifier la cohérence des dates
      if (startDate) {
        const startParsed = parseMonthKey(startDate);
        const newEndIndex = getMonthIndex(month, year);
        const currentStartIndex = getMonthIndex(startParsed.month, startParsed.year);
        
        if (currentStartIndex > newEndIndex) {
          // Si fin < début, ajuster le début
          console.log('📅 Ajustement: fin < début, nouvelle période');
          setStartDate(selectedMonth);
          setEndDate(startDate);
        } else {
          setEndDate(selectedMonth);
        }
      } else {
        setEndDate(selectedMonth);
      }
    }
  };

  // Mettre à jour le store quand les dates changent
  useEffect(() => {
    if (startDate && endDate) {
      const monthsRange = generateMonthsRange(startDate, endDate);
      console.log('📊 Mise à jour store:', { startDate, endDate, monthsRange });
      setShippingPeriod({
        period: 'flexible',
        selectedMonths: monthsRange,
        urgency: 'flexible'
      });
    }
  }, [startDate, endDate, setShippingPeriod]);

  // Redirection si étapes précédentes incomplètes
  useEffect(() => {
    if (!formData.departure.country || !formData.arrival.country) {
      router.push('/funnel/search/locations');
    }
  }, [formData.departure.country, formData.arrival.country, router]);

  // Vérifier si un mois est dans la période sélectionnée (pour le surlignage)
  const isMonthInRange = (month: string, year: number) => {
    if (!startDate || !endDate) return false;
    
    const currentIndex = getMonthIndex(month, year);
    const startParsed = parseMonthKey(startDate);
    const endParsed = parseMonthKey(endDate);
    const startIndex = getMonthIndex(startParsed.month, startParsed.year);
    const endIndex = getMonthIndex(endParsed.month, endParsed.year);
    
    return currentIndex >= Math.min(startIndex, endIndex) && currentIndex <= Math.max(startIndex, endIndex);
  };

  // Fonction pour réinitialiser la sélection
  const resetSelection = () => {
    setStartDate('');
    setEndDate('');
    setSelectionStep('start');
    
    // Vider le store également
    setShippingPeriod({
      period: 'flexible',
      selectedMonths: [],
      urgency: 'flexible'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* TITRE avec aide inline */}
      <div className="text-left mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 font-['Roboto_Slab'] inline">
          ⏰ Choisissez une période de début et de fin pour votre recherche{' '}
        </h1>
        <div className="inline-block ml-1" style={{ transform: 'translateY(-2px)' }}>
          <HelpBlock 
            content={
              <div>
                <p className="font-medium mb-2">Flexibilité = plus d'opportunités</p>
                <p>Plus votre période est large, plus vous aurez de chances de trouver quelqu'un avec de l'espace dans son conteneur ! Sélectionnez minimum 3 mois pour maximiser vos chances.</p>
              </div>
            } 
          />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Instructions dynamiques - seulement pendant la sélection */}
        {(!startDate || !endDate) && (
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              {selectionStep === 'start' ? 
                'Choisissez le mois de début de votre période.' :
                startDate ? 
                  `Maintenant choisissez le mois de fin (ou re-cliquez sur ${startDate} pour un seul mois).` :
                  'Choisissez une période de début et de fin pour votre recherche.'
              }
            </p>
          </div>
        )}

        {/* Affichage conditionnel : picker ou résumé */}
        {!startDate || !endDate ? (
          /* Picker de mois principal */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 max-w-lg mx-auto">
            {/* Sélecteur d'année */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <button
                onClick={() => setCurrentYear(currentYear - 1)}
                className="p-2 md:p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
              <span className="text-lg md:text-xl font-semibold text-gray-900">{currentYear}</span>
              <button
                onClick={() => setCurrentYear(currentYear + 1)}
                className="p-2 md:p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>

            {/* Grille des mois avec surlignage de période */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {months.map(month => {
                const monthKey = formatMonthKey(month, currentYear);
                const isStartMonth = startDate === monthKey;
                const isEndMonth = endDate === monthKey;
                const isInRange = isMonthInRange(month, currentYear);
                const isPast = currentYear === new Date().getFullYear() && 
                             months.indexOf(month) < new Date().getMonth();

                return (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(month, currentYear)}
                    disabled={isPast}
                    className={`
                      p-3 md:p-4 rounded-lg text-sm md:text-base font-medium transition-all duration-200 relative group
                      ${isStartMonth || isEndMonth
                        ? 'bg-[#F47D6C] text-white shadow-md transform scale-105' 
                        : isInRange
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : isPast 
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm cursor-pointer'
                      }
                    `}
                    title={isPast ? 'Mois passé' : (isStartMonth || isEndMonth) ? 'Mois sélectionné' : isInRange ? 'Dans la période' : 'Cliquez pour sélectionner'}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Résumé amélioré avec dates mises en avant */
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              {(() => {
                const monthsCount = generateMonthsRange(startDate, endDate).length;
                const isOnlyOneMonth = startDate === endDate;
                
                return (
                  <>
                    <p className="text-sm md:text-base text-gray-600 mb-3">
                      {isOnlyOneMonth 
                        ? "Vous cherchez de la place dans un conteneur dont le départ est prévu en :"
                        : "Vous cherchez de la place dans un conteneur dont le départ est prévu entre :"}
                    </p>
                    
                    <div className="mb-4">
                      {isOnlyOneMonth ? (
                        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-[#F47D6C] mb-2">
                          <span>{startDate}</span>
                          <span className="text-sm text-gray-500">({monthsCount} mois)</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 text-lg md:text-xl font-bold text-[#F47D6C] mb-2">
                          <span>{startDate}</span>
                          <span className="text-gray-400">→</span>
                          <span>{endDate}</span>
                          <span className="text-sm text-gray-500">({monthsCount} mois)</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <button
                onClick={resetSelection}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors underline decoration-dotted underline-offset-2 hover:decoration-solid"
              >
                <span className="text-xs">✏️</span>
                Modifier cette période
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 