'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Home, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ValidationErrorPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@dodomove.fr?subject=Problème de validation d\'annonce DodoPartage';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Icône d'erreur */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
          >
            <AlertCircle className="w-12 h-12 text-red-600" />
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
          >
            ❌ Erreur de validation
          </motion.h1>

          {/* Message d'erreur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            <p className="text-lg text-gray-700">
              Nous n'avons pas pu valider votre annonce
            </p>
            
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">🚫 Problème de validation</h3>
              <p className="text-sm text-red-800">
                Le lien de validation est peut-être expiré, invalide, ou l'annonce a déjà été validée.
              </p>
            </div>

            {/* Solutions possibles */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">💡 Que faire ?</h3>
              <ul className="text-sm text-yellow-800 space-y-2 text-left">
                <li>• Vérifiez que vous avez cliqué sur le bon lien dans l'email</li>
                <li>• Le lien de validation expire après 24h</li>
                <li>• Si le problème persiste, contactez notre support</li>
                <li>• Vous pouvez aussi créer une nouvelle annonce</li>
              </ul>
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <Button
              onClick={handleContactSupport}
              fullWidth
              size="lg"
              icon={<Mail className="w-5 h-5" />}
              iconPosition="left"
              className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
            >
              Contacter le support
            </Button>
            
            <Button
              onClick={handleGoHome}
              fullWidth
              size="lg"
              variant="outline"
              icon={<Home className="w-5 h-5" />}
              iconPosition="left"
            >
              Retour à l'accueil
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 