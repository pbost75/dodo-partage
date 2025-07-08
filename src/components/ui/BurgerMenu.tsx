'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaBug, FaLightbulb, FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface BurgerMenuProps {
  className?: string;
}

export default function BurgerMenu({ className = '' }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fermer le menu sur Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleCreateAnnouncement = () => {
    router.push('/funnel-choice/propose');
    setIsOpen(false);
  };

  const menuItems = [
    // Section navigation
    {
      type: 'section' as const,
      title: 'Navigation',
      items: [
        {
          icon: <span className="text-blue-500">📋</span>,
          label: 'Comment ça fonctionne ?',
          action: () => handleScrollToSection('how-it-works')
        },
        {
          icon: <span className="text-green-500">🚀</span>,
          label: 'Découvrir Dodomove',
          action: () => handleExternalLink('https://www.dodomove.fr')
        },
        {
          icon: <span className="text-purple-500">❓</span>,
          label: 'FAQ',
          action: () => handleScrollToSection('faq')
        }
      ]
    },
    // Section actions
    {
      type: 'section' as const,
      title: 'Actions',
      items: [
        {
          icon: <span className="text-orange-500">➕</span>,
          label: 'Publier une annonce',
          action: handleCreateAnnouncement
        }
      ]
    },
    // Section feedback
    {
      type: 'section' as const,
      title: 'Feedback',
      items: [
        {
          icon: <FaBug className="w-4 h-4 text-red-500" />,
          label: 'Signaler un bug',
          action: () => handleExternalLink('https://dodomove.canny.io/signaler-un-bug')
        },
        {
          icon: <FaLightbulb className="w-4 h-4 text-orange-500" />,
          label: 'Proposer une idée',
          action: () => handleExternalLink('https://dodomove.canny.io/proposer-une-idee')
        },
        {
          icon: <FaCommentDots className="w-4 h-4 text-blue-500" />,
          label: 'Nous contacter',
          action: () => handleExternalLink('https://www.dodomove.fr/contact/')
        }
      ]
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton burger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center p-2 sm:p-2.5 
          border-2 border-white/20 text-white 
          hover:bg-white/10 hover:border-white/40 
          rounded-lg transition-all duration-200
          ${isOpen ? 'bg-white/10 border-white/40' : ''}
        `}
        aria-label="Menu de navigation"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <FaBars className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour mobile */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" />
          
          {/* Menu */}
          <div 
            ref={menuRef}
            className={`
              absolute top-full right-0 mt-2 z-50
              bg-white rounded-lg shadow-xl border border-gray-200
              w-72 max-w-[90vw] sm:max-w-none
              max-h-[80vh] overflow-y-auto
              transform transition-all duration-200 ease-out
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
          >
            {menuItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'border-t border-gray-100' : ''}>
                {/* Titre de section */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                  {section.title}
                </div>
                
                {/* Items de section */}
                <div className="py-1">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium group-hover:text-gray-900">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer avec branding */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  DodoPartage by Dodomove
                </span>
                <div className="text-xs text-gray-400">
                  v1.0
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 