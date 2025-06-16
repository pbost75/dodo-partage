'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Smartphone, 
  Archive, 
  BookOpen, 
  Armchair, 
  Truck 
} from 'lucide-react';

interface FilterState {
  type: string;
  minVolume: string; // Changé de volumes[] à minVolume string
}

interface FilterSectionProps {
  isMobile?: boolean;
  onMobileClose?: () => void;
  onFiltersChange?: (filters: FilterState) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ isMobile = false, onMobileClose, onFiltersChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    type: 'offer', // "Propose" sélectionné par défaut
    minVolume: 'all' // Tous volumes par défaut
  });

  const filterOptions = {
    type: [
      { 
        value: 'offer', 
        label: 'Propose', 
        icon: Package, 
        description: 'J\'offre de la place',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      { 
        value: 'request', 
        label: 'Cherche', 
        icon: Search, 
        description: 'Je recherche de la place',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      }
    ],
    minVolume: [
      { 
        value: 'all', 
        label: 'Tous volumes', 
        icon: Package,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        description: 'Afficher toutes les annonces'
      },
      { 
        value: '1', 
        label: 'Min 1 m³', 
        icon: Smartphone,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        description: 'Au moins 1m³ disponible'
      },
      { 
        value: '3', 
        label: 'Min 3 m³', 
        icon: Archive,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
        description: 'Au moins 3m³ disponible'
      },
      { 
        value: '5', 
        label: 'Min 5 m³', 
        icon: BookOpen,
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        description: 'Au moins 5m³ disponible'
      },
      { 
        value: '10', 
        label: 'Min 10 m³', 
        icon: Truck,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        description: 'Au moins 10m³ disponible'
      }
    ]
  };

  const handleTypeChange = (value: string) => {
    const newFilters = {
      ...filters,
      type: value
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleVolumeChange = (value: string) => {
    const newFilters = {
      ...filters,
      minVolume: value
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = { type: 'offer', minVolume: 'all' };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const activeFilterCount = (filters.minVolume !== 'all' ? 1 : 0) + (filters.type !== 'offer' ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#F47D6C]/10 rounded-xl flex items-center justify-center">
          <span className="text-[#F47D6C]">🔍</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 font-inter">
            Filtrer les annonces
          </h3>
          <p className="text-sm text-gray-500">
            Trouvez exactement ce que vous cherchez
          </p>
        </div>
      </div>

      {/* Clear filters si actifs */}
      {activeFilterCount > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearAllFilters}
          className="w-full mb-6 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-center text-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
        >
          ✕ Effacer les filtres ({activeFilterCount})
        </motion.button>
      )}

      <div className="space-y-8">
        {/* Type d'annonce - Radio buttons */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            Type d'annonce
          </h4>
          <div className="space-y-2">
            {filterOptions.type.map((option) => {
              const IconComponent = option.icon;
              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group
                    ${filters.type === option.value 
                      ? 'border-[#F47D6C]/30 bg-[#F47D6C]/5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="announcementType"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center
                      ${filters.type === option.value 
                        ? 'border-[#F47D6C] bg-[#F47D6C]' 
                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }
                    `}>
                      {filters.type === option.value && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-4 h-4 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Volume minimum - Radio buttons */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#F47D6C] rounded-full"></span>
            Volume minimum disponible
          </h4>
          <div className="space-y-2">
            {filterOptions.minVolume.map((option) => {
              const isSelected = filters.minVolume === option.value;
              const IconComponent = option.icon;
              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group
                    ${isSelected 
                      ? 'border-[#F47D6C]/30 bg-[#F47D6C]/5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="minVolume"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center
                      ${isSelected 
                        ? 'border-[#F47D6C] bg-[#F47D6C]' 
                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }
                    `}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-4 h-4 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bouton recherche - différent selon mobile/desktop */}
      {isMobile ? (
        <div className="mt-8">
          <button 
            onClick={onMobileClose}
            className="w-full p-4 bg-gradient-to-r from-[#F47D6C] to-[#e66b5a] text-white font-semibold rounded-xl hover:from-[#e66b5a] hover:to-[#d65a47] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <span>👁️</span>
            <span>Voir les annonces</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default FilterSection; 