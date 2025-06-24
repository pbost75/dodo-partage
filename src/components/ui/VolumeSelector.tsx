import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface VolumeSelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

const VolumeSelector: React.FC<VolumeSelectorProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.5,
  unit = 'm³',
  placeholder = '',
  error,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  
  // Déterminer si le label doit être en position haute
  const isLabelUp = isFocused || value >= 0 || inputValue !== '';

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    const roundedValue = Math.round(newValue * 10) / 10; // Arrondir à 1 décimale
    onChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    const roundedValue = Math.round(newValue * 10) / 10; // Arrondir à 1 décimale
    onChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    const numValue = parseFloat(inputVal);
    if (!isNaN(numValue)) {
      const roundedValue = Math.round(numValue * 10) / 10; // Arrondir à 1 décimale
      onChange(Math.max(min, Math.min(max, roundedValue)));
    } else if (inputVal === '') {
      onChange(0);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Synchroniser l'affichage avec la valeur réelle, formatée à 1 décimale
    const displayValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
    setInputValue(displayValue);
  };

  return (
    <div className={`relative max-w-sm mx-auto ${className}`}>
      {/* Container principal avec le style FloatingInput */}
      <div className={`relative flex items-center border rounded-xl bg-white h-16 md:h-20 transition-all duration-200 
        ${error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200' : 
          isLabelUp ? 'border-blue-500 focus-within:ring-2 focus-within:ring-blue-200' : 
          'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200'}`}>
        
        {/* Bouton - */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mx-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Diminuer le volume"
        >
          <Minus className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Input central */}
        <div className="flex-1 relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            step={step}
            min={min}
            max={max}
            placeholder={isLabelUp ? placeholder : " "}
            className="w-full text-center text-lg md:text-xl font-medium bg-transparent border-none outline-none text-gray-900 font-['Lato'] py-4"
            aria-invalid={!!error}
          />
          

        </div>

        {/* Bouton + */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mx-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Augmenter le volume"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Label flottant centré */}
      <label
        className={`absolute left-1/2 -translate-x-1/2 bg-white px-2 text-base transition-all duration-200 pointer-events-none z-10 font-['Lato']
          ${error ? 'text-red-500' : isLabelUp ? 'text-blue-700' : 'text-gray-500'}
          ${isLabelUp ? '-top-2 -translate-y-1 scale-90' : 'top-1/2 -translate-y-1/2 scale-100'}
        `}
      >
        {label}
      </label>

      {/* Message d'erreur */}
      {error && (
        <span className="text-red-500 text-sm mt-2 block font-['Lato']">{error}</span>
      )}
    </div>
  );
};

export default VolumeSelector;