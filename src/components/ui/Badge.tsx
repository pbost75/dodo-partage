'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'offer' | 'request' | 'price' | 'status' | 'category';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  animate?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'status',
  size = 'md',
  icon,
  animate = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center gap-2 font-semibold rounded-full transition-all duration-200';
  
  const variantClasses = {
    offer: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25',
    request: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25',
    price: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25',
    status: 'bg-gray-100 text-gray-800 border border-gray-200',
    category: 'bg-purple-100 text-purple-800 border border-purple-200'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const BadgeComponent = (
    <span className={combinedClasses}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );

  return animate ? (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.05 }}
    >
      {BadgeComponent}
    </motion.div>
  ) : BadgeComponent;
};

export default Badge; 