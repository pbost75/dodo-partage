'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaBug, FaLightbulb, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface BurgerMenuProps {
  className?: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  highlight?: boolean;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
}

export default function BurgerMenu({ className = '' }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Bloquer le scroll du body quand le menu est ouvert
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
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

  const menuSections: MenuSection[] = [
    {
      title: 'Navigation',
      icon: '🧭',
      items: [
        {
          icon: <span className="text-2xl">📋</span>,
          label: 'Comment ça fonctionne ?',
          description: 'Découvrez le processus',
          action: () => handleScrollToSection('how-it-works')
        },
        {
          icon: <span className="text-2xl">🚀</span>,
          label: 'Découvrir Dodomove',
          description: 'Notre site principal',
          action: () => handleExternalLink('https://www.dodomove.fr')
        },
        {
          icon: <span className="text-2xl">❓</span>,
          label: 'FAQ',
          description: 'Questions fréquentes',
          action: () => handleScrollToSection('faq')
        }
      ]
    },
    {
      title: 'Actions',
      icon: '⚡',
      items: [
        {
          icon: <span className="text-2xl">➕</span>,
          label: 'Publier une annonce',
          description: 'Créez votre annonce en 2 min',
          action: handleCreateAnnouncement,
          highlight: true
        }
      ]
    },
    {
      title: 'Feedback',
      icon: '💬',
      items: [
        {
          icon: <FaBug className="w-5 h-5 text-red-500" />,
          label: 'Signaler un bug',
          description: 'Rapportez un problème',
          action: () => handleExternalLink('https://dodomove.canny.io/signaler-un-bug')
        },
        {
          icon: <FaLightbulb className="w-5 h-5 text-orange-500" />,
          label: 'Proposer une idée',
          description: 'Suggérez une amélioration',
          action: () => handleExternalLink('https://dodomove.canny.io/proposer-une-idee')
        },
        {
          icon: <FaCommentDots className="w-5 h-5 text-blue-500" />,
          label: 'Nous contacter',
          description: 'Besoin d\'aide ?',
          action: () => handleExternalLink('https://www.dodomove.fr/contact/')
        }
      ]
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton burger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center p-2.5 sm:p-3
          border-2 border-white/20 text-white 
          hover:bg-white/10 hover:border-white/40 
          rounded-xl transition-all duration-300
          shadow-lg hover:shadow-xl
          ${isOpen ? 'bg-white/20 border-white/50 scale-95' : 'hover:scale-105'}
        `}
        aria-label="Menu de navigation"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <FaBars 
            className={`w-5 h-5 transition-all duration-300 ${
              isOpen ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
            }`} 
          />
          <FaTimes 
            className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
              isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-180'
            }`} 
          />
        </div>
      </button>

      {/* Overlay + Sidebar */}
      <div 
        className={`
          fixed inset-0 z-50 transition-all duration-400 ease-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
      >
        {/* Backdrop avec blur */}
        <div 
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-md
            transition-all duration-400
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={`
            absolute right-0 top-0 h-full w-96 max-w-[85vw]
            bg-white shadow-2xl
            transform transition-all duration-500 ease-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            flex flex-col
          `}
        >
          {/* Header élégant */}
          <div className="bg-gradient-to-r from-[#243163] to-[#1a2741] px-6 py-6 text-white relative overflow-hidden">
            {/* Pattern décoratif */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-xl">🧭</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Menu</h2>
                    <p className="text-white/80 text-sm">Navigation & Actions</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto py-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-8 last:mb-4">
                {/* Titre de section avec icône */}
                <div className="px-6 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{section.icon}</span>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                      {section.title}
                    </h3>
                  </div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-[#F47D6C] to-transparent"></div>
                </div>

                {/* Items de section */}
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className={`
                        w-full px-6 py-4 text-left
                        hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30
                        flex items-center gap-4 
                        transition-all duration-300 group
                        ${item.highlight ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#F47D6C]' : ''}
                      `}
                    >
                      {/* Icône */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        transition-all duration-300 group-hover:scale-110
                        ${item.highlight 
                          ? 'bg-gradient-to-br from-[#F47D6C] to-[#e66b5a] text-white shadow-lg' 
                          : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                        }
                      `}>
                        {item.icon}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className={`
                          font-semibold text-gray-900 group-hover:text-gray-800 transition-colors
                          ${item.highlight ? 'text-[#243163]' : ''}
                        `}>
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                          {item.description}
                        </div>
                      </div>

                      {/* Flèche */}
                      <FaChevronRight className={`
                        w-4 h-4 text-gray-400 
                        transform transition-all duration-300 
                        group-hover:text-gray-600 group-hover:translate-x-1
                        ${item.highlight ? 'text-[#F47D6C]' : ''}
                      `} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer élégant */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#243163] to-[#1a2741] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">DodoPartage</div>
                  <div className="text-xs text-gray-500">by Dodomove</div>
                </div>
              </div>
              <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 