'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';

interface MonthPickerProps {
  selectedMonths: string[];
  onMonthsChange: (months: string[]) => void;
  placeholder?: string;
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonths,
  onMonthsChange,
  placeholder = "Peu importe"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

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

  const handleMonthToggle = (month: string, year: number) => {
    const clickedIndex = getMonthIndex(month, year);
    
    if (selectedMonths.length === 0) {
      // Premier mois sélectionné
      onMonthsChange([formatMonthKey(month, year)]);
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
        onMonthsChange([formatMonthKey(month, year)]);
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
        onMonthsChange(newRange);
      }
    }
  };

  const removeMonth = (monthToRemove: string) => {
    onMonthsChange(selectedMonths.filter(m => m !== monthToRemove));
  };

  const clearAll = () => {
    onMonthsChange([]);
  };

  const getDisplayText = () => {
    if (selectedMonths.length === 0) return placeholder;
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

  // Auto-scroll sur mobile quand le picker s'ouvre
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Vérifier si nous sommes sur mobile
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Délai pour permettre au dropdown de s'afficher complètement
        setTimeout(() => {
          if (dropdownRef.current) {
            // Scroll personnalisé pour centrer le picker dans la vue mobile
            dropdownRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 150); // Délai légèrement plus long pour l'animation d'ouverture
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F47D6C]/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#F47D6C]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Période
          </label>
          <div className="flex items-center justify-between w-full">
            <span 
              className="text-sm sm:text-lg font-medium text-gray-900 truncate font-inter flex-1 min-w-0"
            >
              {getDisplayText()}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
          {/* Selected months pills */}
          {selectedMonths.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Période sélectionnée
                </span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Tout effacer
                </button>
              </div>
              <div className="bg-[#F47D6C]/10 border border-[#F47D6C]/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[#F47D6C] font-semibold text-sm flex-1">
                    {selectedMonths.length === 1 
                      ? selectedMonths[0] 
                      : `${selectedMonths[0].split(' ')[0]} - ${selectedMonths[selectedMonths.length - 1].split(' ')[0]} ${selectedMonths[selectedMonths.length - 1].split(' ')[1]}`
                    }
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {/* Bouton Valider (fermer) */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="
                        w-7 h-7 rounded-full 
                        bg-[#F47D6C] hover:bg-[#e66b5a] 
                        text-white 
                        flex items-center justify-center
                        transition-colors duration-150
                      "
                      title="Valider la sélection"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    {/* Bouton Effacer */}
                    <button
                      onClick={clearAll}
                      className="
                        w-7 h-7 rounded-full 
                        bg-gray-300 hover:bg-gray-400 
                        text-gray-600 hover:text-gray-700
                        flex items-center justify-center
                        transition-colors duration-150
                      "
                      title="Effacer la sélection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Year selector */}
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

          {/* Months grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map(month => {
              const monthKey = formatMonthKey(month, currentYear);
              const isSelected = selectedMonths.includes(monthKey);
              const isPast = currentYear === new Date().getFullYear() && 
                           months.indexOf(month) < new Date().getMonth();

              return (
                <button
                  key={month}
                  onClick={() => handleMonthToggle(month, currentYear)}
                  disabled={isPast}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-[#F47D6C] text-white' 
                      : isPast 
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                const currentMonth = new Date().getMonth();
                const currentYearNow = new Date().getFullYear();
                const startIndex = getMonthIndex(months[currentMonth], currentYearNow);
                const nextThreeMonths = createConsecutiveRange(startIndex, startIndex + 2);
                onMonthsChange(nextThreeMonths);
              }}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium"
            >
              3 prochains mois
            </button>
            <button
              onClick={() => {
                const currentMonth = new Date().getMonth();
                const currentYearNow = new Date().getFullYear();
                const startIndex = getMonthIndex(months[currentMonth], currentYearNow);
                const nextSixMonths = createConsecutiveRange(startIndex, startIndex + 5);
                onMonthsChange(nextSixMonths);
              }}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium"
            >
              6 prochains mois
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthPicker; 