"use client";

import React, { useState, useCallback } from 'react';

interface EmailInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fixedLabel?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = " ",
  error,
  required = false,
  disabled = false,
  fixedLabel = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  // Validation email
  const validateEmail = useCallback((email: string) => {
    if (!email) return null;
    
    // Regex email plus robuste
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return 'Format d\'email invalide';
    }
    
    // Vérifications supplémentaires
    if (email.length > 254) {
      return 'L\'email est trop long';
    }
    
    if (email.includes('..')) {
      return 'L\'email ne peut pas contenir deux points consécutifs';
    }
    
    return null;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim(); // Supprimer les espaces en début/fin
    onChange(name, inputValue);
    
    // Effacer les erreurs de validation pendant la saisie
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenBlurred(true);
    
    // Déclencher la validation au blur
    const validationResult = validateEmail(value);
    setValidationError(validationResult);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Fonction exposée pour la validation lors de la soumission du formulaire
  const validateForSubmission = useCallback(() => {
    const validationResult = validateEmail(value);
    setValidationError(validationResult);
    setHasBeenBlurred(true);
    return !validationResult;
  }, [value, validateEmail]);

  // Exposer la fonction de validation pour le composant parent
  React.useEffect(() => {
    // @ts-ignore
    if (window.emailValidators) {
      // @ts-ignore
      window.emailValidators[name] = validateForSubmission;
    } else {
      // @ts-ignore
      window.emailValidators = { [name]: validateForSubmission };
    }
    
    return () => {
      // @ts-ignore
      if (window.emailValidators) {
        // @ts-ignore
        delete window.emailValidators[name];
      }
    };
  }, [validateForSubmission, name]);

  const hasValue = value.length > 0;
  const hasError = !!(error || validationError);
  const displayError = error || validationError;

  // Déterminer si le label doit être en position haute
  const isLabelUp = isFocused || hasValue || fixedLabel;

  return (
    <div className="relative w-full">
      <div className={`relative border ${hasError ? 'border-red-500 ring-2 ring-red-200' : isFocused ? 'border-blue-500 ring-2 ring-blue-200' : hasValue ? 'border-blue-500' : 'border-gray-300'} rounded-xl transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} w-full`}>
        
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

        {/* Champ de saisie */}
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isLabelUp ? "exemple@gmail.com" : " "}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-5 rounded-xl bg-white focus:outline-none text-gray-900 font-['Lato'] text-base md:text-lg leading-tight h-16 md:h-20"
          aria-describedby={hasError ? `${name}-error` : undefined}
          aria-invalid={hasError}
        />
      </div>

      {/* Message d'erreur */}
      {hasError && (
        <p id={`${name}-error`} className="mt-2 text-sm text-red-600 font-['Lato']" role="alert">
          {displayError}
        </p>
      )}


    </div>
  );
};

export default EmailInput; 