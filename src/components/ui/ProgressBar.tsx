"use client";

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  currentStep?: string;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
      {/* Barre de progression */}
      <div 
        className="h-full bg-[#F47D6C] transition-all duration-500 ease-in-out" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar; 