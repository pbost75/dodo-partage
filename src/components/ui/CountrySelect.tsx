'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountryOption {
  value: string;
  label: string;
  emoji: string;
}

interface CountrySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CountryOption[];
  placeholder?: string;
  className?: string;
  onEnterPress?: () => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Sélectionnez une option",
  className = "",
  onEnterPress
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Trouver l'option sélectionnée
  const selectedOption = options.find(opt => opt.value === value);
  const isFilled = value !== '';
  const isActive = isOpen || isFilled;
  
  // Calculer la position optimale du dropdown
  const calculateDropdownPosition = () => {
    if (!selectRef.current) return 'bottom';
    
    const rect = selectRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Hauteur estimée du dropdown
    const dropdownHeight = Math.min(options.length * 56 + 16, 300);
    
    // Espace disponible en bas et en haut
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Si pas assez de place en bas, mais assez en haut, ouvrir vers le haut
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'top';
    }
    
    return 'bottom';
  };
  
  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);
  
  // Mettre à jour la position du dropdown quand il s'ouvre
  useEffect(() => {
    if (isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [isOpen, options.length]);
  
  // Gérer la sélection d'option
  const handleOptionSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };
  
  // Gérer l'ouverture/fermeture du menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Animation variants pour le menu déroulant
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: dropdownPosition === 'bottom' ? -10 : 10,
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
  
  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Structure EXACTEMENT identique à MonthPicker */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }}
        className="flex items-center gap-3 cursor-pointer"
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!isOpen && onEnterPress) {
              // Si le menu est fermé et qu'on a une fonction onEnterPress, l'appeler
              onEnterPress();
            } else {
              // Sinon, ouvrir/fermer le menu normalement
              toggleMenu();
            }
          } else if (e.key === ' ') {
            e.preventDefault();
            toggleMenu();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          } else if (e.key === 'Tab') {
            setIsOpen(false);
          } else if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F47D6C]/10 flex items-center justify-center flex-shrink-0">
          {selectedOption && selectedOption.value ? (
            <span className="text-sm sm:text-lg">{selectedOption.emoji}</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4 text-[#F47D6C]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L9 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            {label}
          </label>
          <div className="flex items-center justify-between w-full">
            <span 
              className="text-sm sm:text-lg font-medium text-gray-900 truncate font-inter flex-1 min-w-0"
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className={`text-gray-400 transform transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Liste déroulante personnalisée */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`absolute z-50 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-auto
              ${dropdownPosition === 'bottom' ? 'mt-1' : 'mb-1 bottom-full'}`}
            role="listbox"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`px-4 py-3.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3
                  ${option.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}
                  ${index < options.length - 1 ? 'border-b border-gray-100' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionSelect(option.value);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.value && (
                  <span className="text-xl flex-shrink-0">{option.emoji}</span>
                )}
                <span className="flex-1 font-inter">{option.label}</span>
                {option.value === value && (
                  <span className="ml-auto text-blue-600 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountrySelect; 