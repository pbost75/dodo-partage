'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              {/* Icône DodoPartage */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 11l3-3m0 0l3-3m-3 3h12" 
                  />
                </svg>
              </div>
              
              {/* Titre */}
              <div>
                <h1 className="text-xl font-bold text-blue-900 font-['Roboto_Slab']">
                  DodoPartage
                </h1>
                <p className="text-xs text-gray-500 font-['Lato']">
                  Groupage collaboratif multi-destinations
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation centrale */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium font-['Lato'] transition-colors"
            >
              Annonces
            </Link>
            <Link 
              href="/deposer" 
              className="text-gray-700 hover:text-blue-600 font-medium font-['Lato'] transition-colors"
            >
              Déposer une annonce
            </Link>
            <Link 
              href="/aide" 
              className="text-gray-700 hover:text-blue-600 font-medium font-['Lato'] transition-colors"
            >
              Aide
            </Link>
          </nav>

          {/* Actions droite */}
          <div className="flex items-center space-x-4">
            {/* Lien retour Dodomove */}
            <Link
              href="https://dodomove.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors font-['Lato']"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour sur Dodomove.fr
            </Link>

            {/* Bouton CTA mobile */}
            <div className="md:hidden">
              <Link href="/deposer">
                <Button variant="primary" size="sm">
                  Déposer
                </Button>
              </Link>
            </div>

            {/* Bouton CTA desktop */}
            <div className="hidden md:block">
              <Link href="/deposer">
                <Button variant="primary">
                  Déposer une annonce
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden border-t border-gray-100 py-3">
          <nav className="flex justify-around">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 font-medium text-sm font-['Lato'] transition-colors"
            >
              Annonces
            </Link>
            <Link 
              href="/aide" 
              className="text-gray-600 hover:text-blue-600 font-medium text-sm font-['Lato'] transition-colors"
            >
              Aide
            </Link>
            <Link
              href="https://dodomove.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm font-['Lato'] transition-colors"
            >
              Dodomove.fr
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 