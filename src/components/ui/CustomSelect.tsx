import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showEmojis?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className = "",
  showEmojis = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Trigger optimisé mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F47D6C]/30 focus:border-[#F47D6C] font-medium text-[#F47D6C] hover:bg-gray-50 transition-colors w-full justify-between text-sm md:text-base"
      >
        <span className="flex items-center gap-1.5 truncate">
          {showEmojis && selectedOption?.emoji && (
            <span className="text-sm flex-shrink-0">{selectedOption.emoji}</span>
          )}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown optimisé mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 md:max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              {showEmojis && option.emoji && (
                <span className="text-sm flex-shrink-0">{option.emoji}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base truncate">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 truncate">{option.description}</div>
                )}
              </div>
              {value === option.value && (
                <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect; 