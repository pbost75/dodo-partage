"use client";

import React from 'react';

export interface CardRadioOption {
  value: string;
  label: string;
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
}

const CardRadioGroup: React.FC<CardRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-3 font-['Lato']">
          {label}
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option) => (
          <div 
            key={option.value} 
            className={`
              relative cursor-pointer rounded-xl border-2 p-6
              transition-all hover:shadow-md
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
            <div className="absolute right-4 top-4">
              <div 
                className={`
                  h-6 w-6 rounded-full border-2 flex items-center justify-center
                  ${value === option.value
                    ? 'border-blue-600 bg-white'
                    : 'border-gray-300'
                  }
                `}
              >
                {value === option.value && (
                  <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                )}
              </div>
            </div>
            
            {/* Icon */}
            {(option.emoji || option.icon) && (
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full 
                ${option.iconBgColor || 'bg-blue-50'}`}>
                {option.emoji ? (
                  <span className={`${option.iconTextColor || 'text-blue-500'} text-2xl`}>
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
            <h3 className="text-lg font-semibold font-['Roboto_Slab'] text-gray-800">
              {option.label}
            </h3>
            {option.description && (
              <p className="mt-2 text-sm text-gray-600 font-['Lato']">
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