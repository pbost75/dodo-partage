import React, { useState, useEffect } from 'react';
import { FaCalculator, FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';

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
  onSave: (data: { volume: number; items: CalculatorItem[] }) => void;
  existingItems?: CalculatorItem[];
  existingVolume?: number;
}

export const VolumeCalculatorModal: React.FC<VolumeCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItems,
  existingVolume
}) => {
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Configuration de l'URL du calculateur avec support des données existantes
  const buildCalculatorUrl = () => {
    if (!isMounted) return '';
    
    // Utiliser la même URL que DodoMove funnel qui fonctionne
    let url = process.env.NEXT_PUBLIC_CALCULATOR_URL || 'https://calculateur-volume.dodomove.fr';
      
    const params = new URLSearchParams();
    
    // Mode embedded
    params.append('embedded', 'true');
    
    // Si on a des données existantes, les passer en paramètres
    if (existingItems && existingItems.length > 0) {
      try {
        // Encoder les données existantes pour les passer dans l'URL
        const encodedItems = encodeURIComponent(JSON.stringify(existingItems));
        params.append('items', encodedItems);
        console.log('📤 Transmission des données existantes au calculateur:', existingItems);
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'encodage des données existantes:', error);
      }
    }
    
    const finalUrl = `${url}?${params.toString()}`;
    console.log('🔗 URL du calculateur:', finalUrl);
    return finalUrl;
  };

  // Initialiser les données existantes si disponibles
  useEffect(() => {
    if (!isMounted) return;
    
    if (existingItems && existingItems.length > 0 && existingVolume) {
      setCalculatorData({
        items: existingItems,
        totalVolume: existingVolume
      });
      setHasData(true);
      console.log('📊 Données existantes chargées:', { items: existingItems, totalVolume: existingVolume });
    }
  }, [existingItems, existingVolume, isMounted]);

  // Gestion des messages depuis l'iframe du calculateur
  useEffect(() => {
    if (!isMounted) return;
    
    const handleMessage = (event: MessageEvent) => {
      // Liste des domaines autorisés pour le calculateur (même config que DodoMove)
      const allowedOrigins = [
        'https://calculateur-volume.dodomove.fr',
        'https://pbost75.github.io',
        'http://localhost:5173', // Pour le développement local
        'http://localhost:3000'  // Alternative pour le développement
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('⚠️ Message reçu d\'une origine non autorisée:', event.origin);
        return;
      }
      
      console.log('📨 Message reçu du calculateur:', event.data);
      
      if (event.data.type === 'CALCULATOR_LOADED') {
        setIsLoading(false);
        console.log('✅ Calculateur chargé et prêt');
        
        // Envoyer les données existantes au calculateur s'il y en a
        if (existingItems && existingItems.length > 0 && existingVolume) {
          const iframe = document.querySelector('iframe[title="Calculateur de volume de déménagement"]') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'LOAD_EXISTING_DATA',
              payload: {
                items: existingItems,
                totalVolume: existingVolume
              }
            }, event.origin);
            console.log('📤 Données existantes envoyées au calculateur');
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
      
      // Nouveau : gestion du message de sauvegarde automatique
      if (event.data.type === 'CALCULATOR_SAVE' && event.data.payload) {
        console.log('💾 Demande de sauvegarde reçue:', event.data.payload);
        handleSave(event.data.payload);
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
      
      // Signaler au calculateur qu'on est en mode modal
      setTimeout(() => {
        const iframe = document.querySelector('iframe[title="Calculateur de volume de déménagement"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'MODAL_MODE',
            payload: { modalMode: true }
          }, '*');
        }
      }, 1000);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isOpen, existingItems, existingVolume, isMounted]);
  
  // Fonction pour sauvegarder les données du calculateur
  const handleSave = (data: CalculatorData) => {
    try {
      console.log('💾 Sauvegarde des données calculateur:', data);
      
      // Appeler le callback de sauvegarde
      onSave({
        volume: data.totalVolume,
        items: data.items
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

  // Empêcher le scroll du body quand la modal est ouverte (seulement côté client)
  useEffect(() => {
    if (!isMounted || typeof document === 'undefined') return;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, isMounted]);

  // Ne pas rendre côté serveur ou si pas encore monté
  if (!isMounted || !isOpen) return null;

  const CALCULATOR_URL = buildCalculatorUrl();

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
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Roboto_Slab']">
              Calculateur de volume
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer le calculateur"
          >
            <FaTimes className="text-gray-500 text-lg" />
          </button>
        </div>

        {/* Contenu de l'iframe */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          {CALCULATOR_URL && (
            <iframe
              src={CALCULATOR_URL}
              className="w-full h-full border-0"
              title="Calculateur de volume de déménagement"
              allow="clipboard-write"
            />
          )}
          
          {/* Overlay de chargement */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <FaSpinner className="animate-spin text-blue-600 text-xl" />
                <span className="text-gray-700 font-['Lato']">Chargement du calculateur...</span>
              </div>
            </div>
          )}
          
          {/* Message d'erreur si échec du chargement */}
          {!isLoading && !calculatorData && (
            <div className="absolute inset-0 bg-white flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-500 mb-4">
                  <FaCalculator className="text-4xl mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-['Roboto_Slab']">
                  Calculateur temporairement indisponible
                </h3>
                <p className="text-gray-600 mb-4 font-['Lato']">
                  Vous pouvez estimer votre volume manuellement en attendant.
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-['Lato']"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bandeau fixe en bas */}
        <div className="bg-white border-t border-gray-200 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Volume total */}
            <div className="flex items-center w-full sm:w-auto">
              <div className="bg-blue-50 rounded-lg px-3 py-2 mr-3 flex-shrink-0">
                <div className="flex items-center">
                  <FaCalculator className="text-blue-600 mr-2 text-sm" />
                  <div>
                    <div className="text-base md:text-lg font-bold text-blue-800 font-['Lato']">
                      {calculatorData ? `${Math.round(calculatorData.totalVolume * 10) / 10} m³` : '0.0 m³'}
                    </div>
                    <div className="text-xs text-blue-600 font-['Lato']">Volume total</div>
                  </div>
                </div>
              </div>
              
              {/* Compteur d'objets */}
              {calculatorData && calculatorData.items.length > 0 && (
                <div className="text-sm text-gray-600 font-['Lato']">
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
              className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm md:text-base font-['Lato'] ${
                calculatorData && calculatorData.totalVolume > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
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