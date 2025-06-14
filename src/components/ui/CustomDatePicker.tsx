"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string, name?: string } }) => void;
  error?: string;
}

// Utilitaires pour la manipulation des dates
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const getMonthName = (month: number) => {
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return monthNames[month];
};
const getDayName = (day: number) => {
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return dayNames[day];
};
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  name,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || name;
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // État pour suivre la date actuellement affichée dans le calendrier
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Dates limites (par défaut: aujourd'hui jusqu'à +2 ans)
  const minDate = props.min ? new Date(props.min) : today;
  const maxDate = props.max ? new Date(props.max) : new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  
  // Générer les jours pour le mois en cours, toujours avec 6 semaines (42 jours)
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Ajuster pour que la semaine commence le lundi (0) et non le dimanche (6)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Tableau de jours pour le mois en cours
    const days = Array(adjustedFirstDay).fill(null); // Jours avant le 1er du mois
    
    // Ajouter tous les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Ajouter des jours supplémentaires pour atteindre 42 jours (6 semaines)
    const remainingDays = 42 - days.length;
    if (remainingDays > 0) {
      days.push(...Array(remainingDays).fill(null));
    }
    
    return days;
  };
  
  // Vérifier si une date est dans la plage autorisée
  const isInRange = (day: number): boolean => {
    if (!day) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    return date >= minDate && date <= maxDate;
  };
  
  // Vérifier si une date est dans le passé
  const isPastDate = (day: number): boolean => {
    if (!day) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliser à minuit pour comparer juste les dates
    return date < today;
  };
  
  // Vérifier si c'est la date d'aujourd'hui
  const isToday = (day: number): boolean => {
    if (!day) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Vérifier si une date correspond à la date sélectionnée
  const isSelected = (day: number): boolean => {
    if (!day || !value) return false;
    
    const [selectedYear, selectedMonth, selectedDay] = value.split('-').map(Number);
    return (
      selectedYear === currentYear &&
      selectedMonth - 1 === currentMonth &&
      selectedDay === day
    );
  };
  
  // Gérer l'ouverture/fermeture du calendrier
  const toggleCalendar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsFocused(true);
      
      // Si une date est déjà sélectionnée, naviguer vers ce mois
      if (value) {
        const [year, month] = value.split('-').map(Number);
        setCurrentYear(year);
        setCurrentMonth(month - 1);
      } else if (props.min && props.min !== formatDate(today)) {
        // Si aucune date sélectionnée mais qu'il y a une date minimum différente d'aujourd'hui,
        // ouvrir sur le mois de la date minimum (utile pour le champ date de fin)
        const minDateObj = new Date(props.min);
        setCurrentYear(minDateObj.getFullYear());
        setCurrentMonth(minDateObj.getMonth());
      }
      
      // Autoscroll pour s'assurer que le calendrier est visible
      setTimeout(() => {
        if (datePickerRef.current) {
          const rect = datePickerRef.current.getBoundingClientRect();
          const calendarHeight = 420; // Hauteur approximative du calendrier
          const spaceBelow = window.innerHeight - rect.bottom;
          
          // Si pas assez de place en bas, scroll vers le bas
          if (spaceBelow < calendarHeight) {
            const scrollOffset = calendarHeight - spaceBelow + 20; // +20px de marge
            window.scrollBy({
              top: scrollOffset,
              behavior: 'smooth'
            });
          }
        }
      }, 100); // Petit délai pour laisser le calendrier s'ouvrir
    }
  };
  
  // Gérer la sélection d'une date
  const handleDateSelect = (day: number) => {
    if (!day || !isInRange(day) || isPastDate(day)) return;
    
    const selected = new Date(currentYear, currentMonth, day);
    const formattedDate = formatDate(selected);
    
    onChange({ target: { value: formattedDate, name } } as any);
    setIsOpen(false);
  };
  
  // Naviguer vers le mois précédent
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Naviguer vers le mois suivant
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Fermer le calendrier quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Animation variants pour le calendrier
  const calendarVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.15,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };
  
  // Générer l'en-tête du calendrier avec les jours de la semaine
  const renderCalendarHeader = () => {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, index) => (
          <div key={index} className="text-center text-gray-500 font-semibold text-sm py-1 h-8 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative" ref={datePickerRef}>
      {/* Calendrier personnalisé - positionné en dessous */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${inputId}-calendar`}
            className="absolute z-50 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-auto"
            style={{ width: '340px', left: '0', maxWidth: '100%' }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={calendarVariants}
          >
            {/* En-tête du calendrier avec navigation */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  onClick={prevMonth}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="font-semibold text-gray-800">
                  {getMonthName(currentMonth)} {currentYear}
                </div>
                
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  onClick={nextMonth}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Corps du calendrier */}
            <div className="p-3">
              {/* Jours de la semaine */}
              {renderCalendarHeader()}
              
              {/* Grille des jours avec hauteur fixe - 6 semaines */}
              <div className="grid grid-cols-7 gap-1" style={{ height: '246px' }}>
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className={`
                      p-2 text-center rounded-md transition-colors duration-150 h-10 flex items-center justify-center
                      ${!day ? 'invisible' : ''}
                      ${isSelected(day) ? 'bg-blue-100 text-blue-700 font-semibold' : 
                        isToday(day) && isInRange(day) ? 'border border-blue-500 text-blue-700 font-medium' :
                        isPastDate(day) ? 'text-gray-400 cursor-not-allowed' : 
                        isInRange(day) ? 'text-blue-600 cursor-pointer hover:bg-blue-50' : 
                        'text-gray-300 cursor-not-allowed'}
                    `}
                    onClick={() => isInRange(day) && !isPastDate(day) && handleDateSelect(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions du calendrier */}
            <div className="p-3 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now.getMonth());
                  setCurrentYear(now.getFullYear());
                }}
              >
                Aujourd'hui
              </button>
              
              <button
                type="button"
                className="text-sm text-red-500 hover:text-red-700"
                onClick={() => {
                  onChange({ target: { value: '', name } } as any);
                  setIsOpen(false);
                }}
              >
                Effacer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input natif caché pour l'accessibilité */}
      <input
        type="date"
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        className="sr-only"
        aria-hidden="true"
        {...props}
      />
      
      {/* Élément personnalisé qui ressemble à un input date */}
      <div
        className={`peer block w-full border rounded-xl px-4 h-16 md:h-20 pt-5 md:pt-7 pb-2 text-base md:text-lg bg-white text-gray-900 cursor-pointer focus:outline-none transition-all duration-200
          ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'}
          ${isOpen ? 'shadow-sm' : ''}
          ${className}`}
        onClick={toggleCalendar}
        role="textbox"
        aria-expanded={isOpen}
        aria-controls={`${inputId}-calendar`}
        aria-labelledby={`${inputId}-label`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCalendar();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
            setIsFocused(false);
          } else if (e.key === 'Tab') {
            setIsOpen(false);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="truncate font-['Lato']">
            {value ? formatDisplayDate(value) : 'Sélectionnez une date'}
          </div>
          <span className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
      
      {/* Label */}
      <label
        id={`${inputId}-label`}
        htmlFor={inputId}
        className={`absolute left-4 bg-white px-2 text-base -top-2 -translate-y-1 scale-90 transition-colors duration-200 pointer-events-none z-10
          ${error ? 'text-red-500' : isFocused ? 'text-blue-700' : 'text-gray-500'}`}
      >
        {label}
      </label>
      
      {/* Message d'erreur */}
      {error && (
        <span id={`${inputId}-error`} className="text-red-500 text-xs mt-1 block">{error}</span>
      )}
      
      {/* Élément pour ajouter l'effet focus ring */}
      {isFocused && (
        <div className={`absolute inset-0 rounded-xl pointer-events-none ring-2 ${error ? 'ring-red-200' : 'ring-blue-200'}`} />
      )}
    </div>
  );
};

export default CustomDatePicker; 