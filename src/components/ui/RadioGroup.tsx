"use client";

import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-3 font-['Lato']">
          {label}
        </label>
      )}

      <div className={`
        ${orientation === 'vertical' ? 'space-y-4' : 'grid grid-cols-1 gap-4 md:grid-cols-2'}
      `}>
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
            <div className="absolute right-4 top-4">
              <div className={`
                h-6 w-6 rounded-full border-2 flex items-center justify-center
                ${value === option.value
                  ? 'border-blue-600 bg-white'
                  : 'border-gray-300'
                }
              `}>
                {value === option.value && (
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
            
            {option.icon && (
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 flex-shrink-0">
                <span className="text-blue-500 text-xl">{option.icon}</span>
              </div>
            )}

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

export default RadioGroup; 