'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronRight, HelpCircle, ExternalLink, MessageCircle, Plus, AlertTriangle, Lightbulb, Mail } from 'lucide-react';
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
      items: [
        {
          icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
          label: 'Comment ça fonctionne',
          description: 'Découvrir le processus',
          action: () => handleScrollToSection('how-it-works')
        },
        {
          icon: <ExternalLink className="w-5 h-5 text-purple-600" />,
          label: 'Découvrir Dodomove',
          description: 'Site principal',
          action: () => handleExternalLink('https://www.dodomove.fr')
        },
        {
          icon: <MessageCircle className="w-5 h-5 text-orange-600" />,
          label: 'FAQ',
          description: 'Questions fréquentes',
          action: () => handleScrollToSection('faq')
        }
      ]
    },
    {
      title: 'Actions',
      items: [
        {
          icon: <Plus className="w-5 h-5 text-green-600" />,
          label: 'Publier une annonce',
          description: 'Créer en 2 minutes',
          action: handleCreateAnnouncement,
          highlight: true
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          label: 'Signaler un bug',
          description: 'Rapporter un problème',
          action: () => handleExternalLink('https://dodomove.canny.io/signaler-un-bug')
        },
        {
          icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
          label: 'Proposer une idée',
          description: 'Suggérer une amélioration',
          action: () => handleExternalLink('https://dodomove.canny.io/proposer-une-idee')
        },
        {
          icon: <Mail className="w-5 h-5 text-blue-600" />,
          label: 'Nous contacter',
          description: 'Besoin d\'aide',
          action: () => handleExternalLink('https://www.dodomove.fr/contact/')
        }
      ]
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton burger minimaliste */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-center w-10 h-10
          border border-white/30 text-white 
          hover:bg-white/10 hover:border-white/50
          rounded-lg transition-all duration-200
        "
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      {/* Overlay + Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop simple */}
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar minimaliste */}
          <div 
            ref={sidebarRef}
            className="
              absolute right-0 top-0 h-full w-80 max-w-[85vw]
              bg-white border-l border-gray-200
              transform transition-transform duration-300 ease-out
              flex flex-col
            "
          >
            {/* Header simple */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <p className="text-sm text-gray-500">Navigation & actions</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="py-6">
                  {/* Titre de section */}
                  <div className="px-6 mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        onClick={item.action}
                        className={`
                          w-full px-6 py-3 text-left
                          hover:bg-gray-50 
                          flex items-center gap-3 
                          transition-colors duration-150 group
                          ${item.highlight ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                        `}
                      >
                        {/* Icône */}
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {item.icon}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className={`
                            font-medium text-gray-900
                            ${item.highlight ? 'text-blue-900' : ''}
                          `}>
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>

                        {/* Flèche subtile */}
                        <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer simple */}
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  DodoPartage
                </div>
                <div className="text-xs text-gray-400">
                  v1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 