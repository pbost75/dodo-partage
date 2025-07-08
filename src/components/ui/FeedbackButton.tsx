'use client';

import React, { useState } from 'react';
import { FaCommentDots, FaBug, FaLightbulb, FaChevronLeft } from 'react-icons/fa';

// Déclaration du type pour Canny
declare global {
  interface Window {
    Canny: any;
  }
}

interface FeedbackButtonProps {
  type?: 'floating' | 'inline' | 'tab';
  variant?: 'bug' | 'feature' | 'general';
  className?: string;
}

export default function FeedbackButton({ 
  type = 'tab',
  variant = 'general',
  className = '' 
}: FeedbackButtonProps) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleFeedback = (feedbackType?: 'bug' | 'feature' | 'general') => {
    // URLs Canny spécifiques par type de feedback
    const cannyUrls = {
      bug: 'https://dodomove.canny.io/feature-requests',
      feature: 'https://dodomove.canny.io/feature-requests', 
      general: 'https://dodomove.canny.io/feature-requests'
    };
    
    const currentUrl = cannyUrls[feedbackType || 'general'];
    
    if (typeof window !== 'undefined' && window.Canny && process.env.NEXT_PUBLIC_CANNY_APP_ID) {
      // Si Canny est configuré avec l'APP ID, utiliser le widget intégré
      try {
        // Ouvrir le widget de feedback approprié
        if (feedbackType === 'bug') {
          window.Canny('openChangelog');
        } else {
          // Pour les suggestions et avis généraux, ouvrir le formulaire de feedback
          window.Canny('openBoard', 'feature-requests');
        }
      } catch (error) {
        console.warn('Erreur widget Canny, fallback vers URL:', error);
        window.open(currentUrl, '_blank', 'width=800,height=600');
      }
    } else {
      // Sinon, ouvrir directement la page Canny correspondante
      window.open(currentUrl, '_blank', 'width=800,height=600');
    }
  };

  const getIcon = (variantType?: string) => {
    switch (variantType || variant) {
      case 'bug': return <FaBug className="w-3 h-3" />;
      case 'feature': return <FaLightbulb className="w-3 h-3" />;
      default: return <FaCommentDots className="w-3 h-3" />;
    }
  };

  const getLabel = (variantType?: string) => {
    switch (variantType || variant) {
      case 'bug': return 'Bug';
      case 'feature': return 'Idée';
      default: return 'Avis';
    }
  };

  const getColors = (variantType?: string) => {
    switch (variantType || variant) {
      case 'bug': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'feature': return 'bg-orange-600 hover:bg-orange-700 text-white';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  // Nouvelle languette avec menu déroulant
  if (type === 'tab') {
    return (
      <div
        className="fixed top-1/2 -translate-y-1/2 right-0 z-40"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Menu déroulant */}
        <div className={`
          absolute right-12 top-1/2 -translate-y-1/2
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
        `}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[140px]">
            {/* Option Bug */}
            <button
              onClick={() => handleFeedback('bug')}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors"
            >
              <FaBug className="w-3 h-3 text-red-500" />
              <span className="text-sm font-medium">Signaler un bug</span>
            </button>
            
            {/* Option Idée */}
            <button
              onClick={() => handleFeedback('feature')}
              className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <FaLightbulb className="w-3 h-3 text-orange-500" />
              <span className="text-sm font-medium">Proposer une idée</span>
            </button>
            
            {/* Option Avis */}
            <button
              onClick={() => handleFeedback('general')}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaCommentDots className="w-3 h-3 text-blue-500" />
              <span className="text-sm font-medium">Donner mon avis</span>
            </button>
          </div>
        </div>

        {/* Languette principale */}
        <button
          className={`
            ${getColors('general')}
            rounded-l-lg px-3 py-6 shadow-lg 
            transform transition-all duration-300 
            ${isExpanded ? '-translate-x-1 shadow-xl' : 'hover:-translate-x-1 hover:shadow-xl'}
            focus:outline-none focus:ring-2 focus:ring-blue-300/50
            flex flex-col items-center justify-center gap-2
            min-h-[80px] w-12
            ${className}
          `}
          title="Feedback • Donnez votre avis ou signalez un problème"
          aria-label="Feedback • Donnez votre avis ou signalez un problème"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1">
              {getIcon('general')}
              <FaChevronLeft className={`w-2 h-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            <span 
              className="text-[9px] font-bold tracking-wide leading-none"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              FEEDBACK
            </span>
          </div>
        </button>
      </div>
    );
  }

  if (type === 'floating') {
    return (
      <button
        onClick={() => handleFeedback()}
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
      onClick={() => handleFeedback()}
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