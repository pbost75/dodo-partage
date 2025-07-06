"use client";

import React from 'react';

export interface CardRadioOption {
  value: string;
  label: string | React.ReactNode;
  description?: string;
  emoji?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
}

export interface CardRadioGroupProps {
  label?: string;
  name: string;
  options: CardRadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  layout?: 'grid' | 'column'; // Nouvelle prop pour contrôler la disposition
  compact?: boolean; // Nouvelle prop pour un affichage plus compact
}

const CardRadioGroup: React.FC<CardRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className,
  layout = 'grid', // Valeur par défaut
  compact = false, // Valeur par défaut
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-3 font-['Lato']">
          {label}
        </label>
      )}

      <div className={`${layout === 'column' ? (compact ? 'space-y-2' : 'space-y-4') : 'grid grid-cols-1 gap-4 md:grid-cols-2'}`}>
        {options.map((option) => (
          <div 
            key={option.value} 
            className={`
              relative cursor-pointer rounded-xl border transition-all hover:shadow-md
              ${compact ? 'p-3 md:p-4' : 'p-4 md:p-6'}
              ${value === option.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            
            {/* Radio button indicator */}
            <div className={`absolute ${compact ? 'right-3 top-3 md:right-4 md:top-4' : 'right-3 top-3 md:right-4 md:top-4'}`}>
              <div 
                className={`
                  ${compact ? 'h-5 w-5 md:h-6 md:w-6' : 'h-5 w-5 md:h-6 md:w-6'} rounded-full border flex items-center justify-center
                  ${value === option.value
                    ? 'border-blue-600 bg-white'
                    : 'border-gray-300'
                  }
                `}
              >
                {value === option.value && (
                  <div className={`${compact ? 'h-2.5 w-2.5 md:h-3 md:w-3' : 'h-2.5 w-2.5 md:h-3 md:w-3'} rounded-full bg-blue-600`}></div>
                )}
              </div>
            </div>
            
            {/* Layout mobile : icône et titre sur la même ligne, description masquée */}
            <div className="flex items-center gap-3 md:block">
              {/* Icon */}
              {(option.emoji || option.icon) && (
                <div className={`flex-shrink-0 flex items-center justify-center rounded-full 
                  ${compact ? 'h-8 w-8 md:h-10 md:w-10' : 'h-10 w-10 md:h-12 md:w-12'} 
                  ${compact ? '' : 'md:mb-4'} 
                  ${option.iconBgColor || 'bg-blue-50'} shadow-sm`}>
                  {option.emoji ? (
                    <span className={`${option.iconTextColor || 'text-blue-500'} 
                      ${compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
                      {option.emoji}
                    </span>
                  ) : (
                    <span className={`${option.iconTextColor || 'text-blue-500'}`}>
                      {option.icon}
                    </span>
                  )}
                </div>
              )}
              
              {/* Content */}
              <h3 className={`${compact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-semibold font-['Roboto_Slab'] text-gray-800`}>
                {option.label}
              </h3>
            </div>
            
            {/* Description - masquée sur mobile, visible sur desktop */}
            {option.description && (
              <p className={`${compact ? 'mt-1 md:mt-2' : 'mt-2 md:mt-3'} text-sm md:text-base text-gray-600 font-['Lato'] hidden md:block`}>
                {option.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-['Lato']">{error}</p>
      )}
    </div>
  );
};

export default CardRadioGroup; 