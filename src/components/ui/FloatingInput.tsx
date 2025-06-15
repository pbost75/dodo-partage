import React, { useState } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fixedLabel?: boolean;
  country?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, id, className = '', value, onFocus, onBlur, fixedLabel = false, country, ...props }, ref) => {
    const inputId = id || props.name;
    const [isFocused, setIsFocused] = useState(false);
    const isFilled = value !== undefined && value !== '';
    
    // Déterminer si le label doit être en position haute
    const isLabelUp = isFocused || isFilled || fixedLabel;
    
    // Fonction pour obtenir les placeholders adaptés au pays
    const getCountrySpecificPlaceholders = (selectedCountry?: string) => {
      switch (selectedCountry) {
        case 'France':
          return { postalCode: '75001', city: 'Paris' };
        case 'Réunion':
          return { postalCode: '97400', city: 'Saint-Denis' };
        case 'Martinique':
          return { postalCode: '97200', city: 'Fort-de-France' };
        case 'Guadeloupe':
          return { postalCode: '97100', city: 'Basse-Terre' };
        case 'Guyane':
          return { postalCode: '97300', city: 'Cayenne' };
        case 'Mayotte':
          return { postalCode: '97600', city: 'Mamoudzou' };
        case 'Nouvelle-Calédonie':
          return { postalCode: '98800', city: 'Nouméa' };
        case 'Polynésie française':
          return { postalCode: '98700', city: 'Papeete' };
        case 'Maurice':
          return { postalCode: '20301', city: 'Port-Louis' };
        default:
          // Placeholders par défaut si aucun pays sélectionné
          return { postalCode: '75001', city: 'Paris' };
      }
    };
    
    // Déterminer le placeholder à afficher
    const getPlaceholder = () => {
      if (fixedLabel) {
        return props.placeholder || " ";
      }
      
      // Placeholder visible seulement au focus
      if (isFocused) {
        // Placeholders contextuels selon le type de champ
        const fieldName = props.name?.toLowerCase() || '';
        const countryPlaceholders = getCountrySpecificPlaceholders(country);
        
        if (fieldName.includes('prenom') || fieldName.includes('firstname')) {
          return "Jean";
        }
        if (fieldName.includes('nom') || fieldName.includes('lastname') || fieldName.includes('name')) {
          return "Payet";
        }
        if (fieldName.includes('address') || fieldName.includes('adresse')) {
          return "23 rue des Roses";
        }
        if (fieldName.includes('postal') || fieldName.includes('code')) {
          return countryPlaceholders.postalCode;
        }
        if (fieldName.includes('city') || fieldName.includes('ville')) {
          return countryPlaceholders.city;
        }
        if (fieldName.includes('volume')) {
          return "15";
        }
        // Si un placeholder spécifique est fourni et n'est pas vide, l'utiliser
        if (props.placeholder && props.placeholder.trim() !== "") {
          return props.placeholder;
        }
        // Sinon placeholder vide
        return " ";
      }
      
      // Quand le label est en bas, toujours un placeholder vide
      return " ";
    };
    
    return (
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={`peer block w-full border rounded-xl px-4 h-16 md:h-20 text-base md:text-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 leading-tight font-['Lato']
            ${error ? 'border-red-500 focus:ring-red-200' : isFocused ? 'border-blue-500 focus:ring-blue-200' : 'border-gray-300'}
            ${fixedLabel ? 'pt-4 pb-4' : 'py-0'} ${className}`}
          placeholder={getPlaceholder()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          value={value}
          onFocus={e => { setIsFocused(true); onFocus && onFocus(e); }}
          onBlur={e => { setIsFocused(false); onBlur && onBlur(e); }}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-4 bg-white px-2 text-base transition-all duration-200 pointer-events-none z-10
            ${error ? 'text-red-500' : isFocused ? 'text-blue-700' : 'text-gray-500'}
            ${isLabelUp || fixedLabel ? '-top-2 -translate-y-1 scale-90' : 'top-1/2 -translate-y-1/2 scale-100'}
          `}
        >
          {label}
        </label>
        {error && (
          <span id={`${inputId}-error`} className="text-red-500 text-sm mt-2 block font-['Lato']">{error}</span>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput; 