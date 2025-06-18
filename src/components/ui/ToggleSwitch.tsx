'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';

interface ToggleSwitchProps {
  value: 'offer' | 'request';
  onChange: (value: 'offer' | 'request') => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onChange, className = '' }) => {
  const options = [
    {
      value: 'offer' as const,
      label: 'Propose',
      icon: Package,
      description: 'J\'offre de la place'
    },
    {
      value: 'request' as const,
      label: 'Cherche',
      icon: Search,
      description: 'Je recherche de la place'
    }
  ];

  return (
    <div className={`inline-flex bg-gray-100 rounded-xl p-1 ${className}`}>
      {options.map((option) => {
        const IconComponent = option.icon;
        const isActive = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'text-[#F47D6C]' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {/* Background animé */}
            {isActive && (
              <motion.div
                layoutId="toggle-background"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* Contenu */}
            <div className="relative flex items-center gap-2">
              <IconComponent className="w-4 h-4" />
              <span className="font-medium">{option.label}</span>
            </div>
            
            {/* Tooltip au survol */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ToggleSwitch; 