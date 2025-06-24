'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function ShippingPeriodStep() {
  const router = useRouter();
  const { formData, setShippingPeriod } = useSearchStore();
  
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    formData.shippingPeriod.selectedMonths || []
  );
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Fermer le picker quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        // Déclencher la validation seulement à la fermeture si aucun mois sélectionné
        if (selectedMonths.length === 0) {
          setHasInteracted(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedMonths]);

  // Fonctions utilitaires pour la gestion des mois
  const formatMonthKey = (month: string, year: number) => `${month} ${year}`;

  const getMonthIndex = (monthName: string, year: number) => {
    const monthIndex = months.indexOf(monthName);
    return year * 12 + monthIndex;
  };

  const getMonthFromIndex = (index: number) => {
    const year = Math.floor(index / 12);
    const monthIndex = index % 12;
    return { month: months[monthIndex], year };
  };

  const createConsecutiveRange = (startIndex: number, endIndex: number) => {
    const range = [];
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    for (let i = start; i <= end; i++) {
      const { month, year } = getMonthFromIndex(i);
      range.push(formatMonthKey(month, year));
    }
    return range;
  };

  // Gestion de la sélection des mois
  const handleMonthToggle = (month: string, year: number) => {
    const clickedIndex = getMonthIndex(month, year);
    
    if (selectedMonths.length === 0) {
      // Premier mois sélectionné
      setSelectedMonths([formatMonthKey(month, year)]);
    } else {
      // Calculer les indices actuels
      const currentIndices = selectedMonths.map(m => {
        const [monthName, yearStr] = m.split(' ');
        return getMonthIndex(monthName, parseInt(yearStr));
      });
      
      const minIndex = Math.min(...currentIndices);
      const maxIndex = Math.max(...currentIndices);
      
      // Si on clique sur un mois déjà dans la sélection, on repart de ce mois uniquement
      if (currentIndices.includes(clickedIndex)) {
        setSelectedMonths([formatMonthKey(month, year)]);
      } else {
        // Étendre la sélection pour créer une période consécutive
        let newRange;
        if (clickedIndex < minIndex) {
          // Étendre vers le début
          newRange = createConsecutiveRange(clickedIndex, maxIndex);
        } else if (clickedIndex > maxIndex) {
          // Étendre vers la fin
          newRange = createConsecutiveRange(minIndex, clickedIndex);
        } else {
          // Le mois est au milieu, on repart de ce mois
          newRange = [formatMonthKey(month, year)];
        }
        setSelectedMonths(newRange);
      }
    }
  };

  const clearAll = () => {
    setSelectedMonths([]);
  };

  // Validation des mois sélectionnés
  const validateSelection = (months: string[]) => {
    if (months.length === 0) {
      return 'Veuillez sélectionner au moins une période';
    }
    return '';
  };

  // Gestion du changement de mois
  const handleMonthsChange = (months: string[]) => {
    setSelectedMonths(months);
    
    // Ne valider que si l'utilisateur a déjà interagi
    if (hasInteracted) {
      const validationError = validateSelection(months);
      if (validationError) {
        setError(validationError);
      } else {
        setError('');
      }
    }
  };

  // Mettre à jour les mois quand la sélection change
  useEffect(() => {
    handleMonthsChange(selectedMonths);
  }, [selectedMonths, hasInteracted]);

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

  // Fonction pour afficher la période sélectionnée
  const getDisplayText = () => {
    if (selectedMonths.length === 0) return 'Sélectionnez une période';
    if (selectedMonths.length === 1) return selectedMonths[0];
    
    // Afficher la période de début à fin
    const sortedMonths = [...selectedMonths].sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
    
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    
    return `${firstMonth} - ${lastMonth}`;
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
        ⏰ Quand voulez-vous expédier vos affaires ?
      </h1>

      <div className="space-y-6 mb-96">
        {/* Champ période avec style CustomDatePicker */}
        <div className="mb-12 relative" ref={containerRef}>
          {/* Interface visuelle identique au CustomDatePicker */}
          <div
            className={`peer block w-full border rounded-xl px-4 h-16 md:h-20 pt-5 md:pt-7 pb-2 text-base md:text-lg bg-white text-gray-900 cursor-pointer focus:outline-none transition-all duration-200
              ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'}
              ${isOpen ? 'shadow-sm' : ''}`}
            onClick={() => {
              const newIsOpen = !isOpen;
              setIsOpen(newIsOpen);
              setIsFocused(true);
              
              // Autoscroll pour s'assurer que le picker est visible
              if (newIsOpen) {
                setTimeout(() => {
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const pickerHeight = 420; // Hauteur approximative du picker
                    const spaceBelow = window.innerHeight - rect.bottom;
                    
                    // Si pas assez de place en bas, scroll vers le bas
                    if (spaceBelow < pickerHeight) {
                      const scrollOffset = pickerHeight - spaceBelow + 20; // +20px de marge
                      window.scrollBy({
                        top: scrollOffset,
                        behavior: 'smooth'
                      });
                    }
                  }
                }, 100); // Petit délai pour laisser le picker s'ouvrir
              }
            }}
            role="textbox"
            aria-expanded={isOpen}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
                setIsFocused(true);
              } else if (e.key === 'Escape') {
                setIsOpen(false);
                setIsFocused(false);
                // Déclencher la validation seulement à la fermeture si aucun mois sélectionné
                if (selectedMonths.length === 0) {
                  setHasInteracted(true);
                }
              } else if (e.key === 'Tab') {
                setIsOpen(false);
                // Déclencher la validation seulement à la fermeture si aucun mois sélectionné
                if (selectedMonths.length === 0) {
                  setHasInteracted(true);
                }
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="truncate font-['Lato']">
                {getDisplayText()}
              </div>
              <span className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* Label flottant */}
          <label
            className={`absolute left-4 bg-white px-2 text-base -top-2 -translate-y-1 scale-90 transition-colors duration-200 pointer-events-none z-10
              ${error ? 'text-red-500' : isFocused ? 'text-blue-700' : 'text-gray-500'}`}
          >
            Période d'expédition souhaitée
          </label>

          {/* Picker modal quand ouvert */}
          {isOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md">
                            {/* Instructions */}
              {selectedMonths.length === 0 && (
                <div className="text-center py-2 mb-4">
                  <p className="text-xs text-gray-500">
                    Cliquez sur un mois, puis étendez votre sélection
                  </p>
                </div>
              )}

              {/* Sélecteur d'année */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentYear(currentYear - 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-900">{currentYear}</span>
                <button
                  onClick={() => setCurrentYear(currentYear + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

                            {/* Grille des mois */}
              <div className="grid grid-cols-3 gap-2">
                {months.map(month => {
                  const monthKey = formatMonthKey(month, currentYear);
                  const isSelected = selectedMonths.includes(monthKey);
                  const isPast = currentYear === new Date().getFullYear() && 
                               months.indexOf(month) < new Date().getMonth();

                  return (
                                         <button
                       key={month}
                       onClick={() => {
                         handleMonthToggle(month, currentYear);
                         setHasInteracted(true);
                       }}
                       disabled={isPast}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all duration-200 relative group
                        ${isSelected 
                          ? 'bg-[#F47D6C] text-white shadow-sm transform scale-105' 
                          : isPast 
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm cursor-pointer'
                        }
                        ${!isPast && !isSelected ? 'border border-transparent hover:scale-102' : ''}
                      `}
                      title={isPast ? 'Mois passé' : isSelected ? 'Cliquez pour modifier la sélection' : 'Cliquez pour sélectionner cette période'}
                    >
                      {month}
                      {!isPast && !isSelected && (
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-300 opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Boutons de validation */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {selectedMonths.length > 0 && (
                    <button
                      onClick={() => {
                        clearAll();
                        setHasInteracted(true);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (selectedMonths.length > 0) {
                        setHasInteracted(true);
                      }
                      setIsOpen(false);
                      setIsFocused(false);
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${selectedMonths.length > 0 
                        ? 'bg-[#F47D6C] text-white hover:bg-[#F47D6C]/90 shadow-sm' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {selectedMonths.length > 0 ? 'Valider' : 'Fermer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <p className="text-sm text-red-600 font-['Lato'] mt-2">{error}</p>
          )}
        </div>

        {/* Encart informatif avec style cohérent - identique au funnel propose */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-8">
          <div className="flex gap-3">
            <span className="text-blue-600 flex-shrink-0 mt-0.5">🌟</span>
            <div className="text-sm text-blue-800 font-['Lato']">
              <p className="font-medium mb-2">Flexibilité = plus d'opportunités</p>
              <p className="text-blue-700 leading-relaxed">
                Plus votre période est large, plus vous aurez de chances de trouver quelqu'un 
                avec de l'espace dans son conteneur ! Sélectionnez minimum 3 mois pour maximiser vos chances.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Footer */}
      
    </motion.div>
  );
} 