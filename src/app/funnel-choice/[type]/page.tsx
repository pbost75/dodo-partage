'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSmartRouter } from '@/utils/navigation';

// Types pour les étapes de transition
type TransitionStep = 'initializing' | 'preparing' | 'redirecting';

const FunnelChoicePage = () => {
  const params = useParams();
  const smartRouter = useSmartRouter();
  const [currentStep, setCurrentStep] = useState<TransitionStep>('initializing');
  
  const type = params.type as 'propose' | 'cherche';

  useEffect(() => {
    console.log('🚀 Page de transition - Type:', type);
    
    if (!type || (type !== 'propose' && type !== 'cherche')) {
      console.log('❌ Type invalide, redirection vers accueil');
      smartRouter.push('/');
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    // Étape 1: Initialisation (immédiat)
    console.log('⏳ Étape 1: Initialisation');
    setCurrentStep('initializing');
    
    // Étape 2: Préparation (après 600ms)
    timeouts.push(setTimeout(() => {
      console.log('⏳ Étape 2: Préparation');
      setCurrentStep('preparing');
    }, 600));
    
    // Étape 3: Redirection (après 1200ms)
    timeouts.push(setTimeout(() => {
      console.log('⏳ Étape 3: Redirection en cours');
      setCurrentStep('redirecting');
    }, 1200));

    // Redirection finale (après 1800ms)
    timeouts.push(setTimeout(() => {
      console.log('🎯 Redirection finale pour type:', type);
      try {
        if (type === 'propose') {
          console.log('👉 Redirection vers funnel propose');
          smartRouter.push('/funnel/propose/locations');
        } else {
          console.log('👉 Redirection vers funnel search');
          smartRouter.push('/funnel/search/locations');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la redirection:', error);
        // Fallback vers l'accueil
        smartRouter.push('/');
      }
    }, 1800));

    // Cleanup
    return () => {
      console.log('🧹 Cleanup des timeouts');
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [type, smartRouter]);

  const getStepMessage = () => {
    switch (currentStep) {
      case 'initializing':
        return {
          main: type === 'propose' 
            ? 'Préparation de votre annonce' 
            : 'Recherche d\'espaces disponibles',
          sub: type === 'propose'
            ? 'Initialisation du formulaire de partage...'
            : 'Préparation de votre recherche...'
        };
      case 'preparing':
        return {
          main: type === 'propose'
            ? 'Configuration de votre espace'
            : 'Analyse des conteneurs disponibles',
          sub: type === 'propose'
            ? 'Préparation des options de conteneur'
            : 'Recherche des meilleures correspondances'
        };
      case 'redirecting':
        return {
          main: 'Presque prêt !',
          sub: type === 'propose'
            ? 'Ouverture du formulaire de partage'
            : 'Ouverture du formulaire de recherche'
        };
      default:
        return {
          main: 'Chargement...',
          sub: 'Veuillez patienter'
        };
    }
  };

  const message = getStepMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Container pour le bateau et les vagues */}
        <div className="relative w-32 h-24 mx-auto mb-6">
          {/* Vagues d'arrière-plan multiples */}
          <motion.div
            animate={{ 
              x: [-30, 30, -30],
              scaleY: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full opacity-40"
          />
          
          <motion.div
            animate={{ 
              x: [20, -20, 20],
              scaleY: [1.2, 0.8, 1.2]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 rounded-full opacity-60"
          />

          {/* Voilier complet */}
          <motion.div
            animate={{ 
              y: [-3, 3, -3],
              x: [-8, 8, -8],
              rotate: [-1, 1, -1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
          >
            {/* Coque du bateau - plus réaliste */}
            <div className="relative">
              {/* Coque principale */}
              <div className="w-12 h-4 bg-gradient-to-b from-blue-700 to-blue-800 rounded-b-full rounded-t-lg relative">
                {/* Ligne de flottaison */}
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                {/* Proue (avant du bateau) */}
                <div className="absolute -right-1 top-1 w-2 h-2 bg-blue-800 rounded-r-full"></div>
              </div>
              
              {/* Pont du bateau */}
              <div className="absolute top-0 left-1 right-1 h-1 bg-amber-100 rounded-sm"></div>
            </div>

            {/* Mât principal */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-0.5 w-0.5 h-8 bg-amber-800"></div>
            
            {/* Voile principale (grand-voile) */}
            <motion.div
              animate={{ 
                skewX: [-3, 3, -3],
                scaleX: [0.9, 1.1, 0.9]
              }}
              transition={{ 
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-7 left-1 transform origin-bottom"
            >
              <div className="w-0 h-0 border-l-4 border-r-0 border-b-6 border-l-white border-b-transparent drop-shadow-sm"></div>
            </motion.div>

            {/* Voile d'avant (foc) */}
            <motion.div
              animate={{ 
                skewX: [-4, 2, -4],
                scaleX: [1.1, 0.9, 1.1]
              }}
              transition={{ 
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
              className="absolute -top-5 left-3 transform origin-bottom"
            >
              <div className="w-0 h-0 border-l-3 border-r-0 border-b-4 border-l-gray-100 border-b-transparent drop-shadow-sm"></div>
            </motion.div>

            {/* Petit mât avant */}
            <div className="absolute -top-5 left-4 transform -translate-x-0.5 w-0.5 h-5 bg-amber-700"></div>
            
            {/* Drapeau en haut du mât */}
            <motion.div
              animate={{ 
                rotate: [-10, 10, -10],
                scaleX: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 left-3 w-2 h-1 bg-red-500 rounded-r-sm"
            ></motion.div>
          </motion.div>
          
          {/* Sillage du bateau */}
          <motion.div
            animate={{ 
              scale: [0.6, 1.4, 0.6],
              opacity: [0.1, 0.3, 0.1],
              x: [-5, 5, -5]
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
            className="absolute bottom-1 right-6 w-4 h-1 bg-blue-300 rounded-full"
          />
          
          <motion.div
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.4, 0.2],
              x: [-3, 3, -3]
            }}
            transition={{ 
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
            className="absolute bottom-0 right-8 w-3 h-1 bg-blue-400 rounded-full"
          />

          {/* Mouettes (optionnel - petits points volants) */}
          <motion.div
            animate={{ 
              x: [-40, 40, -40],
              y: [-2, -6, -2]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 left-8 w-1 h-1 bg-gray-400 rounded-full opacity-60"
          />
          
          <motion.div
            animate={{ 
              x: [40, -40, 40],
              y: [-1, -4, -1]
            }}
            transition={{ 
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute -top-6 right-6 w-1 h-1 bg-gray-500 rounded-full opacity-50"
          />
        </div>

        {/* Message principal avec style maritime */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-blue-900 mb-3 font-['Roboto_Slab']"
        >
          {message.main}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-blue-700 text-sm font-medium"
        >
          {message.sub}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-gray-500 text-xs mt-4"
        >
          {type === 'propose' 
            ? 'Navigation vers votre espace de partage...'
            : 'Navigation vers votre espace de recherche...'
          }
        </motion.p>
        
        {/* Indicateur de progression - pour donner un feedback visuel */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="mt-8 h-1 bg-blue-200 rounded-full mx-auto max-w-xs"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-blue-500 rounded-full"
          />
        </motion.div>
        
        {/* Bouton de secours - apparaît après 3 secondes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={() => {
              console.log('🔴 Bouton de secours utilisé');
              smartRouter.push('/');
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Problème de redirection ? Cliquez ici
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FunnelChoicePage; 