'use client';

import React, { useEffect } from 'react';
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

  const handleDirectChoice = (choice: string) => {
    onChoice(choice as 'cherche' | 'propose');
    onClose();
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
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
                <div 
                  key={option.value} 
                  className="relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-md border-gray-200 hover:border-gray-300"
                  onClick={() => handleDirectChoice(option.value)}
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
                </div>
              ))}
            </div>

            {/* Bouton annuler seulement */}
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                onClick={onClose}
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