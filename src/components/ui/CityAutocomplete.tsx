"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCitySuggestions, CitySuggestion } from '@/utils/cityAutocomplete';
import FloatingInput from './FloatingInput';

interface CityAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCitySelect?: (city: CitySuggestion) => void;
  country?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  label,
  name,
  value,
  onChange,
  onCitySelect,
  country = 'France',
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFocused, setHasFocused] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSelectingRef = useRef(false);

  // Fonction pour déclencher la recherche
  const triggerSearch = async (searchValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Déclencher la recherche si valeur assez longue et après premier focus
    if (searchValue.length >= 2 && !disabled && hasFocused) {
      timeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await getCitySuggestions(searchValue, country);
          setSuggestions(results);
          
          // Calculer la direction du dropdown
          if (inputRef.current && results.length > 0) {
            const rect = inputRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = Math.min(results.length * 60, 240); // Estimation
            
            setDropdownDirection(spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'up' : 'down');
          }
          
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Erreur lors de la recherche de villes:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Reset des suggestions quand le pays change
  useEffect(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, [country]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer la sélection d'une suggestion
  const handleSuggestionSelect = (suggestion: CitySuggestion) => {
    isSelectingRef.current = true;
    
    // Mettre à jour la valeur de l'input
    const syntheticEvent = {
      target: {
        name,
        value: suggestion.name
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    
    // Notifier le parent
    if (onCitySelect) {
      onCitySelect(suggestion);
    }
    
    // Fermer les suggestions
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  // Gérer la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Gérer les changements dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Éviter la recherche si on vient de sélectionner une suggestion
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      onChange(e);
      return;
    }
    
    // Appeler le onChange du parent
    onChange(e);
    
    // Déclencher la recherche
    triggerSearch(e.target.value);
  };

  // Gérer le focus
  const handleInputFocus = () => {
    setHasFocused(true);
  };

  // Animation variants pour les suggestions
  const suggestionsVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
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
    <div ref={containerRef} className="relative">
      <FloatingInput
        label={label}
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        error={error}
        required={required}
        disabled={disabled}
        ref={inputRef}
        autoComplete="off"
      />
      
      {/* Dropdown avec suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            variants={suggestionsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute z-[60] w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto ${
              dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
            style={{ 
              maxHeight: 'min(240px, calc(100vh - 100px))'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.name}-${suggestion.country}-${index}`}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-900' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium text-gray-900">
                  {suggestion.name}
                </div>
                {suggestion.region && (
                  <div className="text-sm text-gray-500">
                    {suggestion.region}, {suggestion.country}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete; 