import React, { useState, useRef, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

interface HelpBlockProps {
  text?: string;
  content?: React.ReactNode;
  label?: string;
}

const HelpBlock: React.FC<HelpBlockProps> = ({ text, content, label = 'Aide' }) => {
  const [showHelpBlock, setShowHelpBlock] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Basculer l'affichage du bloc d'aide
  const toggleHelpBlock = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowHelpBlock(!showHelpBlock);
  };

  // Fermer quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        helpRef.current && 
        buttonRef.current &&
        !helpRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowHelpBlock(false);
      }
    };

    if (showHelpBlock) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpBlock]);

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showHelpBlock) {
        setShowHelpBlock(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showHelpBlock]);

  return (
    <div className="relative inline-block">
      <button 
        ref={buttonRef}
        onClick={toggleHelpBlock} 
        className={`w-4 h-4 rounded-full bg-[#F47D6C] hover:bg-[#e05a48] flex items-center justify-center transition-colors duration-200 ${showHelpBlock ? 'bg-[#e05a48]' : ''}`}
        aria-expanded={showHelpBlock}
        aria-label={`${showHelpBlock ? 'Fermer' : 'Ouvrir'} l'aide`}
      >
        <span className="text-white text-s font-bold leading-none">?</span>
      </button>
      
      {showHelpBlock && (
        <div 
          ref={helpRef}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-80 max-w-[90vw] animate-fadeIn"
        >
          {/* Flèche pointant vers le bouton */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
          
          {/* Contenu principal */}
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <FaQuestionCircle className="text-blue-500" size={16} />
              </div>
              <div className="text-gray-700 text-sm font-['Lato'] ml-3 leading-relaxed">
                {content || text}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpBlock; 