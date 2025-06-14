'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface FloatingSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: Option[];
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => void;
}

const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, options, error, id, className = '', value, onFocus, onBlur, onChange, ...props }, ref) => {
    const selectId = id || props.name;
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const isFilled = value !== undefined && value !== '';
    const isActive = isFocused || isFilled;
    const selectRef = useRef<HTMLDivElement>(null);
    
    // Trouver l'option sélectionnée pour afficher son label
    const selectedOption = options.find(opt => opt.value === value);
    
    // Calculer la position optimale du dropdown
    const calculateDropdownPosition = () => {
      if (!selectRef.current) return 'bottom';
      
      const rect = selectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Hauteur estimée du dropdown (nombre d'options * hauteur par option + padding)
      const dropdownHeight = Math.min(options.length * 56 + 16, 300); // max-h-64 = 16rem = 256px
      
      // Espace disponible en bas et en haut
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Si pas assez de place en bas, mais assez en haut, ouvrir vers le haut
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        return 'top';
      }
      
      // Par défaut, ouvrir vers le bas
      return 'bottom';
    };

    const toggleMenu = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setDropdownPosition(calculateDropdownPosition());
      }
    };

    const selectOption = (optionValue: string) => {
      onChange({ target: { value: optionValue } });
      setIsOpen(false);
      setIsFocused(false);
    };

    // Fermer le menu si on clique à l'extérieur
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Animation variants pour le menu déroulant avec position dynamique
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
      <div className="relative" ref={selectRef}>
        {/* Select natif caché pour l'accessibilité */}
        <select
          id={selectId}
          ref={ref}
          className="sr-only"
          aria-hidden="true"
          value={value}
          onChange={onChange}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        {/* Élément personnalisé qui ressemble à un select */}
        <div
          className={`peer block w-full rounded-xl px-4 h-16 md:h-20 text-base md:text-lg bg-white text-gray-900 cursor-pointer focus:outline-none transition-all duration-200 flex items-center
            ${error ? 'border-2 border-red-500' : isActive ? 'border-2 border-blue-500' : 'border border-gray-300'}
            ${isOpen ? 'shadow-sm' : ''}
            ${className}`}
          onClick={toggleMenu}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${selectId}-listbox`}
          aria-labelledby={`${selectId}-label`}
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            // Ne pas perdre le focus si on clique sur la liste déroulante
            if (!isOpen && !selectRef.current?.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setIsFocused(false);
            } else if (e.key === 'Tab') {
              setIsOpen(false);
            } else if (e.key === 'ArrowDown' && !isOpen) {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="truncate font-['Lato'] flex-1">
              {selectedOption ? (
                <span>
                  {selectedOption.emoji && `${selectedOption.emoji} `}
                  {selectedOption.label}
                </span>
              ) : (
                <span className="text-gray-400">Sélectionner un lieu</span>
              )}
            </div>
            <span className={`text-gray-400 transform transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
        
        {/* Label */}
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className={`absolute left-4 bg-white px-2 text-base -top-2 -translate-y-1 scale-90 transition-colors duration-200 pointer-events-none z-10
            ${error ? 'text-red-500' : isFocused ? 'text-blue-700' : 'text-gray-500'}`}
        >
          {label}
        </label>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mt-2">
            <span id={`${selectId}-error`} className="text-red-500 text-sm leading-5 block font-medium">
              {error}
            </span>
          </div>
        )}
        
        {/* Liste déroulante personnalisée avec positionnement intelligent */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto
                ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
              id={`${selectId}-listbox`}
              role="listbox"
              aria-labelledby={`${selectId}-label`}
            >
              {options.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 font-['Lato']
                    ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    ${index === 0 ? 'rounded-t-xl' : ''}
                    ${index === options.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'}
                  `}
                  onClick={() => selectOption(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.emoji && `${option.emoji} `}
                  {option.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingSelect.displayName = 'FloatingSelect';

export default FloatingSelect; 