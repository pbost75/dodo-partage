"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  maxLength: number;
  pattern: RegExp;
  formatter: (value: string) => string;
}

// Configuration des pays pour DodoPartage
const countries: Country[] = [
  { 
    code: 'FR', 
    name: 'France', 
    dialCode: '+33', 
    flag: '🇫🇷', 
    placeholder: '06 12 34 56 78',
    maxLength: 10,
    pattern: /^0[1-9]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'RE', 
    name: 'Réunion', 
    dialCode: '+262', 
    flag: '🇷🇪', 
    placeholder: '06 92 12 34 56',
    maxLength: 10,
    pattern: /^0[67]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'GP', 
    name: 'Guadeloupe', 
    dialCode: '+590', 
    flag: '🇬🇵', 
    placeholder: '05 90 12 34 56',
    maxLength: 10,
    pattern: /^0[567]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'MQ', 
    name: 'Martinique', 
    dialCode: '+596', 
    flag: '🇲🇶', 
    placeholder: '06 96 12 34 56',
    maxLength: 10,
    pattern: /^0[567]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'GF', 
    name: 'Guyane française', 
    dialCode: '+594', 
    flag: '🇬🇫', 
    placeholder: '05 94 12 34 56',
    maxLength: 10,
    pattern: /^0[567]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'YT', 
    name: 'Mayotte', 
    dialCode: '+262', 
    flag: '🇾🇹', 
    placeholder: '06 39 12 34 56',
    maxLength: 10,
    pattern: /^0[67]\d{8}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      if (value.length <= 8) return value.replace(/(\d{2})(\d{2})(\d{2})(\d+)/, '$1 $2 $3 $4');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
  },
  { 
    code: 'NC', 
    name: 'Nouvelle-Calédonie', 
    dialCode: '+687', 
    flag: '🇳🇨', 
    placeholder: '12 34 56',
    maxLength: 6,
    pattern: /^\d{6}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      return value.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
    }
  },
  { 
    code: 'PF', 
    name: 'Polynésie française', 
    dialCode: '+689', 
    flag: '🇵🇫', 
    placeholder: '87 12 34 56',
    maxLength: 8,
    pattern: /^[89]\d{7}$/,
    formatter: (value: string) => {
      if (value.length <= 2) return value;
      if (value.length <= 4) return value.replace(/(\d{2})(\d+)/, '$1 $2');
      if (value.length <= 6) return value.replace(/(\d{2})(\d{2})(\d+)/, '$1 $2 $3');
      return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
  }
];

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChange,
  error,
  required = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedDisplay, setFormattedDisplay] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse la valeur initiale
  useEffect(() => {
    if (!isInitialized && value && value.startsWith('+')) {
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        const cleanNumber = value.substring(country.dialCode.length);
        const displayNumber = cleanNumber.startsWith('0') ? cleanNumber : '0' + cleanNumber;
        setPhoneNumber(displayNumber);
        setFormattedDisplay(country.formatter(displayNumber));
      }
      setIsInitialized(true);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Formatage en temps réel
  const formatPhoneNumber = useCallback((value: string, country: Country) => {
    const cleanValue = value.replace(/\D/g, '');
    const truncatedValue = cleanValue.slice(0, country.maxLength);
    
    if (truncatedValue.length > 0) {
      return country.formatter(truncatedValue);
    }
    
    return truncatedValue;
  }, []);

  // Mettre à jour la valeur complète
  const updateFullNumber = useCallback(() => {
    if (isInitialized) {
      let internationalNumber = phoneNumber;
      if (phoneNumber.startsWith('0') && phoneNumber.length > 1) {
        internationalNumber = phoneNumber.substring(1);
      }
      
      const fullNumber = internationalNumber ? `${selectedCountry.dialCode}${internationalNumber}` : '';
      if (fullNumber !== value) {
        onChange(fullNumber);
      }
    }
  }, [selectedCountry, phoneNumber, onChange, value, isInitialized]);

  useEffect(() => {
    updateFullNumber();
  }, [updateFullNumber]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    const formatted = formatPhoneNumber(inputValue, selectedCountry);
    setFormattedDisplay(formatted);
    
    const cleanValue = inputValue.replace(/\D/g, '').slice(0, selectedCountry.maxLength);
    setPhoneNumber(cleanValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleDropdownToggle = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    // Auto-scroll quand le dropdown s'ouvre
    if (newState) {
      setTimeout(() => {
        const element = document.querySelector('[data-phone-input]');
        if (element) {
          const rect = element.getBoundingClientRect();
          const dropdownHeight = 320; // max-h-80 = 320px
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          // Déterminer la position du dropdown
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            setDropdownPosition('top');
          } else {
            setDropdownPosition('bottom');
          }
          
          // Si pas assez d'espace, scroll pour centrer le composant
          if (spaceBelow < dropdownHeight + 20 && spaceAbove < dropdownHeight + 20) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }, 100);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    if (phoneNumber) {
      const formatted = formatPhoneNumber(phoneNumber, country);
      setFormattedDisplay(formatted);
    }
  };

  const hasValue = phoneNumber.length > 0;
  const hasError = !!error;
  
  // Label toujours en haut pour éviter le recouvrement avec l'indicatif
  const isLabelUp = true;

  // Éviter l'erreur d'hydratation en attendant que le composant soit monté
  if (!isMounted) {
    return (
      <div className="relative w-full">
        <div className="relative border border-gray-300 rounded-xl transition-all duration-200 w-full">
          <label className="absolute left-4 bg-white px-2 text-base transition-all duration-200 pointer-events-none z-10 -top-2 -translate-y-1 scale-90 text-gray-500">
            {label}
          </label>
          <div className="flex w-full h-16 md:h-20">
            <div className="relative">
              <div className="flex items-center gap-2 px-3 border-r border-gray-300 bg-gray-50 rounded-l-xl h-full min-w-[120px]">
                <span className="text-lg">🇫🇷</span>
                <span className="text-gray-700 font-medium text-sm whitespace-nowrap">+33</span>
              </div>
            </div>
            <input
              type="tel"
              className="flex-1 px-4 rounded-r-xl bg-white focus:outline-none text-gray-900 text-base md:text-lg leading-tight min-w-0 w-full h-full"
              disabled
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" data-phone-input>
      <div className={`relative border ${hasError ? 'border-red-500 ring-2 ring-red-200' : isFocused ? 'border-blue-500 ring-2 ring-blue-200' : hasValue ? 'border-blue-500' : 'border-gray-300'} rounded-xl transition-all duration-200 w-full`}>
        
        {/* Label flottant */}
        <label 
          className={`absolute left-4 bg-white px-2 text-base transition-all duration-200 pointer-events-none z-10 ${
            isLabelUp 
              ? '-top-2 -translate-y-1 scale-90' 
              : 'top-1/2 -translate-y-1/2 scale-100'
          } ${hasError ? 'text-red-600' : isFocused ? 'text-blue-700' : hasValue ? 'text-blue-700' : 'text-gray-500'}`}
        >
          {label}
        </label>

        <div className="flex w-full h-16 md:h-20">
          {/* Sélecteur de pays */}
          <div className="relative">
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="flex items-center gap-2 px-3 border-r border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer rounded-l-xl h-full min-w-[120px]"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-gray-700 font-medium text-sm whitespace-nowrap">{selectedCountry.dialCode}</span>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown des pays */}
            {isDropdownOpen && (
              <div className={`absolute left-0 z-50 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto min-w-[300px] max-w-sm ${
                dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}>
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-gray-700 font-medium text-sm min-w-[60px]">{country.dialCode}</span>
                    <span className="text-gray-600 text-sm">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Champ de saisie du numéro */}
          <input
            type="tel"
            inputMode="numeric"
            value={formattedDisplay}
            onChange={handlePhoneNumberChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={selectedCountry.placeholder}
            required={required}
            className="flex-1 px-4 rounded-r-xl bg-white focus:outline-none text-gray-900 text-base md:text-lg leading-tight min-w-0 w-full h-full"
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {hasError && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default PhoneInput; 