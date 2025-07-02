'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSmartRouter } from '@/utils/navigation';

// Types pour les étapes de validation
type ValidationStep = 'initializing' | 'validating' | 'redirecting';

const EmailValidationPage = () => {
  const params = useParams();
  const smartRouter = useSmartRouter();
  const [currentStep, setCurrentStep] = useState<ValidationStep>('initializing');
  const [hasError, setHasError] = useState(false);
  
  const token = params.token as string;

  useEffect(() => {
    if (!token) {
      console.log('❌ Token manquant, redirection vers erreur');
      smartRouter.push('/validation-error?reason=missing-token');
      return;
    }

    console.log('🔐 Validation d\'email en cours - Token:', token);

    const timeouts: NodeJS.Timeout[] = [];

    // Étape 1: Initialisation (immédiat)
    console.log('⏳ Étape 1: Initialisation de la validation');
    setCurrentStep('initializing');
    
    // Étape 2: Validation (après 800ms)
    timeouts.push(setTimeout(() => {
      console.log('⏳ Étape 2: Validation en cours');
      setCurrentStep('validating');
    }, 800));
    
    // Étape 3: Appel API (après 1400ms)
    timeouts.push(setTimeout(async () => {
      console.log('⏳ Étape 3: Appel de l\'API de validation');
      setCurrentStep('redirecting');
      
      try {
        // Construire l'URL de l'API de validation (compatible cross-domain)
        let apiUrl: string;
        
        if (typeof window !== 'undefined' && window.location.hostname === 'www.dodomove.fr') {
          // Contexte proxy : rediriger vers l'API sur le sous-domaine technique
          apiUrl = `https://partage.dodomove.fr/api/validate-announcement?token=${encodeURIComponent(token)}`;
          console.log('🌐 Mode proxy détecté - API call vers partage.dodomove.fr');
        } else {
          // Contexte direct : API locale
          apiUrl = `/api/validate-announcement?token=${encodeURIComponent(token)}`;
          console.log('🔗 Mode direct - API call locale');
        }
        
        console.log('📡 Appel API:', apiUrl);
        
        // Redirection directe vers l'API
        window.location.href = apiUrl;
        
      } catch (error) {
        console.error('❌ Erreur lors de la validation:', error);
        setHasError(true);
        
        setTimeout(() => {
          smartRouter.push('/validation-error?reason=network-error');
        }, 2000);
      }
    }, 1400));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [token, smartRouter]);

  const getStepMessage = () => {
    if (hasError) {
      return {
        main: 'Erreur de connexion',
        sub: 'Redirection vers la page d\'erreur...',
        emoji: '⚠️'
      };
    }
    
    switch (currentStep) {
      case 'initializing':
        return {
          main: 'Validation de votre email',
          sub: 'Vérification du lien de confirmation...',
          emoji: '📧'
        };
      case 'validating':
        return {
          main: 'Validation en cours',
          sub: 'Confirmation de votre annonce...',
          emoji: '🔐'
        };
      case 'redirecting':
        return {
          main: 'Validation terminée',
          sub: 'Redirection vers les résultats...',
          emoji: '✅'
        };
      default:
        return {
          main: 'Validation...',
          sub: 'Veuillez patienter',
          emoji: '⏳'
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
        {/* Bateau animé identique aux funnels */}
        <div className="relative w-32 h-24 mx-auto mb-6">
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
            <div className="relative">
              <div className="w-12 h-4 bg-gradient-to-b from-blue-700 to-blue-800 rounded-b-full rounded-t-lg relative">
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                <div className="absolute -right-1 top-1 w-2 h-2 bg-blue-800 rounded-r-full"></div>
              </div>
              <div className="absolute top-0 left-1 right-1 h-1 bg-amber-100 rounded-sm"></div>
            </div>

            <div className="absolute -top-8 left-1/2 transform -translate-x-0.5 w-0.5 h-8 bg-amber-800"></div>
            
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

            <div className="absolute -top-5 left-4 transform -translate-x-0.5 w-0.5 h-5 bg-amber-700"></div>
            
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <span className="text-2xl">{message.emoji}</span>
          <h3 className="text-xl font-semibold text-blue-900 font-['Roboto_Slab']">
            {message.main}
          </h3>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-blue-700'}`}
        >
          {message.sub}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-gray-500 text-xs mt-4"
        >
          {hasError 
            ? 'Une erreur s\'est produite lors de la validation...'
            : 'Sécurisation et validation de votre annonce...'
          }
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ 
            duration: hasError ? 2 : 1.4, 
            ease: "easeInOut" 
          }}
          className="mt-8 h-1 bg-blue-200 rounded-full mx-auto max-w-xs"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: hasError ? 2 : 1.4, 
              ease: "easeInOut" 
            }}
            className={`h-full rounded-full ${hasError ? 'bg-red-500' : 'bg-blue-500'}`}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={() => {
              console.log('🔴 Bouton de secours utilisé');
              smartRouter.push('/validation-error?reason=manual-redirect');
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Problème de validation ? Cliquez ici
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmailValidationPage;
