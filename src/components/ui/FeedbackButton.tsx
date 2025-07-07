'use client';

import React from 'react';
import { FaCommentDots, FaBug, FaLightbulb } from 'react-icons/fa';

// Déclaration du type pour Canny
declare global {
  interface Window {
    Canny: any;
  }
}

interface FeedbackButtonProps {
  type?: 'floating' | 'inline';
  variant?: 'bug' | 'feature' | 'general';
  className?: string;
}

export default function FeedbackButton({ 
  type = 'floating', 
  variant = 'general',
  className = '' 
}: FeedbackButtonProps) {
  
  const handleFeedback = () => {
    // Utiliser directement l'URL Canny en attendant l'App ID
    const cannyUrl = 'https://dodomove.canny.io/feature-requests';
    
    if (typeof window !== 'undefined' && window.Canny && process.env.NEXT_PUBLIC_CANNY_APP_ID) {
      // Si Canny est configuré avec l'App ID, utiliser le widget
      window.Canny('initChangelog', {
        appID: process.env.NEXT_PUBLIC_CANNY_APP_ID,
        position: 'bottom',
        align: 'left'
      });
    } else {
      // Sinon, ouvrir directement la page Canny
      window.open(cannyUrl, '_blank', 'width=800,height=600');
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'bug': return <FaBug className="w-4 h-4" />;
      case 'feature': return <FaLightbulb className="w-4 h-4" />;
      default: return <FaCommentDots className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (variant) {
      case 'bug': return 'Signaler un bug';
      case 'feature': return 'Suggérer une amélioration';
      default: return 'Donner votre avis';
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'bug': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'feature': return 'bg-orange-600 hover:bg-orange-700 text-white';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  if (type === 'floating') {
    return (
      <button
        onClick={handleFeedback}
        className={`
          fixed bottom-6 right-6 z-50
          ${getColors()}
          rounded-full p-4 shadow-lg 
          transform transition-all duration-200 
          hover:scale-110 hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-blue-300
          ${className}
        `}
        title={getLabel()}
        aria-label={getLabel()}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={handleFeedback}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        ${getColors()}
        rounded-md font-medium text-sm
        transition-colors duration-200
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${className}
      `}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
} 