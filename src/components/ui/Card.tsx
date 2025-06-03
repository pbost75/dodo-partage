'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  hover = false,
  className = '',
  onClick
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300 ease-out';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg border-0',
    outlined: 'bg-white border-2 border-blue-100 shadow-none',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-orange-50 border border-blue-100 shadow-sm'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-300 cursor-pointer' 
    : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `.trim();

  const CardComponent = (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );

  return hover ? (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {CardComponent}
    </motion.div>
  ) : CardComponent;
};

export default Card; 