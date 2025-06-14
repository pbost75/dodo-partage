'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  onChange: (min: number, max: number) => void;
  label?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  step = 0.5,
  unit = 'm³',
  onChange,
  label = 'Volume souhaité'
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculer les positions en pourcentage
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const value = Math.round(((percent / 100) * (max - min) + min) / step) * step;

    if (isDragging === 'min' && value <= maxValue) {
      onChange(Math.max(min, value), maxValue);
    } else if (isDragging === 'max' && value >= minValue) {
      onChange(minValue, Math.min(max, value));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, minValue, maxValue]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-body font-medium text-gray-700">{label}</span>
        <div className="text-sm text-gray-600 font-body font-medium">
          {minValue === max ? `${max}+ ${unit}` : `${minValue} - ${maxValue} ${unit}`}
        </div>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-xl p-4">
        <div className="relative">
          {/* Track de base */}
          <div
            ref={sliderRef}
            className="relative h-3 bg-gray-100 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              const value = Math.round(((percent / 100) * (max - min) + min) / step) * step;
              
              // Déplacer la poignée la plus proche
              const distanceToMin = Math.abs(value - minValue);
              const distanceToMax = Math.abs(value - maxValue);
              
              if (distanceToMin < distanceToMax) {
                onChange(Math.max(min, Math.min(value, maxValue)), maxValue);
              } else {
                onChange(minValue, Math.max(minValue, Math.min(max, value)));
              }
            }}
          >
            {/* Track actif */}
            <div
              className="absolute h-3 bg-gradient-to-r from-[#F47D6C] to-[#e66b5a] rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`
              }}
            />
            
            {/* Poignée min */}
            <div
              className={`absolute w-6 h-6 bg-white border-2 border-[#F47D6C] rounded-full shadow-lg cursor-grab transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
                isDragging === 'min' ? 'scale-110 shadow-xl cursor-grabbing' : 'hover:scale-105 hover:shadow-xl'
              }`}
              style={{
                left: `${minPercent}%`,
                top: '50%'
              }}
              onMouseDown={handleMouseDown('min')}
            />
            
            {/* Poignée max */}
            <div
              className={`absolute w-6 h-6 bg-white border-2 border-[#F47D6C] rounded-full shadow-lg cursor-grab transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
                isDragging === 'max' ? 'scale-110 shadow-xl cursor-grabbing' : 'hover:scale-105 hover:shadow-xl'
              }`}
              style={{
                left: `${maxPercent}%`,
                top: '50%'
              }}
              onMouseDown={handleMouseDown('max')}
            />
          </div>
          
          {/* Marques de graduation */}
          <div className="flex justify-between mt-3 text-xs text-gray-400 font-body">
            <span>{min} {unit}</span>
            <span>{Math.round((min + max) / 2)} {unit}</span>
            <span>{max}+ {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider; 