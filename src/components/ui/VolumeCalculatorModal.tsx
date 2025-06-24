"use client";

import React, { useState, useEffect } from 'react';
import { FaCalculator, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

interface CalculatorItem {
  id: string;
  name: string;
  quantity: number;
  volume: number;
  category: string;
}

interface CalculatorData {
  items: CalculatorItem[];
  totalVolume: number;
}

interface VolumeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    description: string;
    volume: number;
    listingItems: string;
    usedCalculator: boolean;
  }) => void;
  existingListingItems?: string;
  existingVolume?: number;
}

export const VolumeCalculatorModal: React.FC<VolumeCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingListingItems,
  existingVolume
}) => {
  // Configuration de l'URL du calculateur avec support des données existantes
  const buildCalculatorUrl = () => {
    let url = process.env.NEXT_PUBLIC_CALCULATOR_URL || 'https://calculateur-volume.dodomove.fr';
    const params = new URLSearchParams();
    
    // Mode embedded
    params.append('embedded', 'true');
    
    // Si on a des données existantes, les passer en paramètres
    if (existingListingItems) {
      try {
        // Encoder les données existantes pour les passer dans l'URL
        const encodedItems = encodeURIComponent(existingListingItems);
        params.append('items', encodedItems);
        console.log('📤 Transmission des données existantes au calculateur:', existingListingItems);
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'encodage des données existantes:', error);
      }
    }
    
    return `${url}?${params.toString()}`;
  };
  
  const CALCULATOR_URL = buildCalculatorUrl();
  
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  // Initialiser les données existantes si disponibles
  useEffect(() => {
    if (existingListingItems && existingVolume) {
      try {
        const items = JSON.parse(existingListingItems);
        setCalculatorData({
          items,
          totalVolume: existingVolume
        });
        setHasData(true);
        console.log('📊 Données existantes chargées:', { items, totalVolume: existingVolume });
      } catch (error) {
        console.warn('⚠️ Erreur lors du parsing des données existantes:', error);
      }
    }
  }, [existingListingItems, existingVolume]);

  // Écouter les messages du calculateur
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Liste des domaines autorisés pour le calculateur
      const allowedOrigins = [
        'https://calculateur-volume.dodomove.fr',
        'https://pbost75.github.io',
        'http://localhost:5173', // Pour le développement local
        'http://localhost:3000'  // Alternative pour le développement
      ];
      
      // Sécurité : vérifier l'origine du message
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('⚠️ Message reçu d\'une origine non autorisée:', event.origin);
        return;
      }
      
      console.log('📨 Message reçu du calculateur:', event.data);
      
      if (event.data.type === 'CALCULATOR_LOADED') {
        setIsLoading(false);
        console.log('✅ Calculateur chargé et prêt');
        
        // Envoyer les données existantes au calculateur s'il y en a
        if (existingListingItems && existingVolume) {
          try {
            const items = JSON.parse(existingListingItems);
            const iframe = document.querySelector('iframe[title="Calculateur de volume de déménagement"]') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'LOAD_EXISTING_DATA',
                payload: {
                  items,
                  totalVolume: existingVolume
                }
              }, event.origin);
              console.log('📤 Données existantes envoyées au calculateur');
            }
          } catch (error) {
            console.warn('⚠️ Erreur lors de l\'envoi des données existantes:', error);
          }
        }
      }
      
      if (event.data.type === 'VOLUME_CALCULATED' && event.data.payload) {
        setCalculatorData(event.data.payload);
        setHasData(true);
        console.log('📊 Données calculées reçues:', event.data.payload);
      }
      
      if (event.data.type === 'CALCULATOR_RESET') {
        setCalculatorData(null);
        setHasData(false);
        console.log('🔄 Calculateur réinitialisé');
      }
      
      // Nouveau : gestion du message de sauvegarde
      if (event.data.type === 'CALCULATOR_SAVE' && event.data.payload) {
        console.log('💾 Demande de sauvegarde reçue:', event.data.payload);
        handleSave(event.data.payload);
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, existingListingItems, existingVolume]);
  
  // Fonction pour sauvegarder les données du calculateur
  const handleSave = (data: CalculatorData) => {
    try {
      // Créer la description formatée pour le funnel
      const description = data.items
        .map(item => `${item.name} (${item.quantity}x - ${(item.volume * item.quantity).toFixed(1)}m³)`)
        .join('\n');
      
      // Créer la liste JSON pour le backend
      const listingItems = JSON.stringify(data.items);
      
      console.log('💾 Sauvegarde des données calculateur:', {
        description,
        volume: data.totalVolume,
        listingItems,
        usedCalculator: true
      });
      
      // Appeler le callback de sauvegarde
      onSave({
        description,
        volume: data.totalVolume,
        listingItems,
        usedCalculator: true
      });
      
      // Fermer la modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  };

  // Gérer la fermeture de la modal
  const handleClose = () => {
    setCalculatorData(null);
    setHasData(false);
    setIsLoading(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-[60] ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl transition-transform duration-300 flex flex-col overflow-hidden ${
          isOpen ? 'transform scale-100' : 'transform scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <FaCalculator className="text-blue-600 mr-3 text-xl" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Calculateur de volume
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer le calculateur"
          >
            <FaTimes className="text-gray-500 text-lg" />
          </button>
        </div>

        {/* Contenu de l'iframe */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          <iframe
            src={CALCULATOR_URL}
            className="w-full h-full border-0"
            title="Calculateur de volume de déménagement"
            allow="clipboard-write"
          />
          
          {/* Overlay de chargement */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <FaSpinner className="animate-spin text-blue-600 text-xl" />
                <span className="text-gray-700">Chargement du calculateur...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bandeau fixe en bas - style Dodomove */}
        <div className="bg-white border-t border-gray-200 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Volume total */}
            <div className="flex items-center w-full sm:w-auto">
              <div className="bg-blue-50 rounded-lg px-3 py-2 mr-3 flex-shrink-0">
                <div className="flex items-center">
                  <FaCalculator className="text-blue-600 mr-2 text-sm" />
                  <div>
                    <div className="text-base md:text-lg font-bold text-blue-800">
                      {calculatorData ? `${calculatorData.totalVolume.toFixed(1)} m³` : '0.0 m³'}
                    </div>
                    <div className="text-xs text-blue-600">Volume total</div>
                  </div>
                </div>
              </div>
              
              {/* Compteur d'objets */}
              {calculatorData && calculatorData.items.length > 0 && (
                <div className="text-sm text-gray-600">
                  {calculatorData.items.length} objet{calculatorData.items.length > 1 ? 's' : ''} sélectionné{calculatorData.items.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {/* Bouton de sauvegarde */}
            <button
              onClick={() => {
                if (calculatorData && calculatorData.totalVolume > 0) {
                  handleSave(calculatorData);
                }
              }}
              disabled={!calculatorData || calculatorData.totalVolume === 0}
              className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm md:text-base ${
                calculatorData && calculatorData.totalVolume > 0
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaCheck className="text-sm" />
              <span>Utiliser ce volume</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 