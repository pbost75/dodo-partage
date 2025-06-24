'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { Package, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import CardRadioGroup, { CardRadioOption } from '@/components/ui/CardRadioGroup';

interface ChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: 'cherche' | 'propose') => void;
}

const ChoiceModal: React.FC<ChoiceModalProps> = ({ isOpen, onClose, onChoice }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'cherche' | 'propose' | null>(null);

  // Empêcher le scroll de la page quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Nettoyer au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Réinitialiser l'état quand la modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setIsNavigating(false);
      setSelectedChoice(null);
    }
  }, [isOpen]);

  const handleDirectChoice = async (choice: string) => {
    const choiceType = choice as 'cherche' | 'propose';
    setSelectedChoice(choiceType);
    setIsNavigating(true);
    
    // Petit délai pour permettre l'animation du loader
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onChoice(choiceType);
    // Ne pas fermer la modal ici - elle se fermera automatiquement via onClose depuis le parent
  };

  // Options pour le choix de type - avec les mêmes icônes que FilterSection
  const choiceOptions: CardRadioOption[] = [
    {
      value: 'cherche',
      label: 'Je cherche de la place',
      description: 'J\'ai besoin d\'expédier mes affaires et je cherche quelqu\'un qui a de la place dans son conteneur',
      icon: <Search className="w-5 h-5" />,
      iconBgColor: 'bg-green-100',
      iconTextColor: 'text-green-600'
    },
    {
      value: 'propose',
      label: 'Je propose de la place',
      description: 'J\'ai un conteneur avec de la place disponible que je souhaite partager',
      icon: <Package className="w-5 h-5" />,
      iconBgColor: 'bg-blue-100',
      iconTextColor: 'text-blue-600'
    }
  ];

  // Animations identiques au funnel et à AlertModal
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Composant de loader pendant la navigation
  const NavigationLoader = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
    >
      <div className="text-center">
        {/* Spinner animé avec animation d'entrée */}
        <motion.div 
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ 
            scale: { duration: 0.4, ease: "easeOut", delay: 0.1 },
            rotate: { duration: 0.5, ease: "easeInOut", delay: 0.2 }
          }}
          className="relative mx-auto w-12 h-12 mb-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="absolute inset-2 rounded-full bg-blue-100 flex items-center justify-center"
          >
            {selectedChoice === 'propose' ? (
              <Package className="w-4 h-4 text-blue-600" />
            ) : (
              <Search className="w-4 h-4 text-green-600" />
            )}
          </motion.div>
        </motion.div>
        
        {/* Message de chargement avec animation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold text-gray-800 font-['Roboto_Slab']">
            Chargement en cours...
          </h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-sm text-gray-600 font-['Lato']"
          >
            {selectedChoice === 'propose' 
              ? 'Préparation du formulaire de dépôt d\'annonce'
              : 'Préparation du formulaire de recherche'
            }
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20"
        onClick={!isNavigating ? onClose : undefined}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loader overlay */}
          <AnimatePresence mode="wait">
            {isNavigating && (
              <NavigationLoader />
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative px-8 py-6 border-b border-gray-100">
            <button
              onClick={!isNavigating ? onClose : undefined}
              className={`absolute right-6 top-6 p-2 transition-colors rounded-full hover:bg-gray-100 ${
                isNavigating 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              disabled={isNavigating}
            >
              <FaTimes size={16} />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold font-['Roboto_Slab'] text-gray-800 mb-2">
                Créer une annonce
              </h2>
              <p className="text-gray-600 font-['Lato']">
                Quel type d'annonce souhaitez-vous publier ?
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {choiceOptions.map((option) => (
                <motion.div 
                  key={option.value}
                  whileHover={!isNavigating ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isNavigating ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`relative rounded-xl border-2 p-6 transition-all duration-300 ease-out ${
                    isNavigating 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-1'
                  } ${selectedChoice === option.value 
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                      : 'border-gray-200'
                  }`}
                  onClick={!isNavigating ? () => handleDirectChoice(option.value) : undefined}
                >
                  {/* Icon */}
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${option.iconBgColor}`}>
                    <span className={option.iconTextColor}>
                      {option.icon}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold font-['Roboto_Slab'] text-gray-800">
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="mt-2 text-sm text-gray-600 font-['Lato']">
                      {option.description}
                    </p>
                  )}

                  {/* Indicateur de sélection avec animation */}
                  {selectedChoice === option.value && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="absolute top-4 right-4"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <motion.svg 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <motion.path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </motion.svg>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bouton annuler seulement */}
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                onClick={!isNavigating ? onClose : undefined}
                disabled={isNavigating}
                className="px-6"
              >
                Annuler
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChoiceModal; 