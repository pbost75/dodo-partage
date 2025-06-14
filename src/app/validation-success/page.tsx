'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ValidationSuccessPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewAnnouncements = () => {
    router.push('/'); // Rediriger vers la liste des annonces
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
          {/* Icône de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
          >
            ✅ Email validé avec succès !
          </motion.h1>

          {/* Message de confirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            <p className="text-lg text-gray-700">
              Votre annonce de partage est maintenant <strong>publiée et visible</strong> sur DodoPartage
            </p>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🎉 Votre annonce est en ligne !</h3>
              <p className="text-sm text-green-800">
                Les utilisateurs peuvent maintenant voir votre offre de partage et vous contacter directement par email.
              </p>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">📬 Que se passe-t-il maintenant ?</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li>• Votre annonce est visible dans la liste des offres</li>
                <li>• Les personnes intéressées vous contacteront par email</li>
                <li>• Vous recevrez les demandes directement dans votre boîte mail</li>
                <li>• Vous pourrez organiser le partage avec les intéressés</li>
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
              onClick={handleViewAnnouncements}
              fullWidth
              size="lg"
              icon={<Eye className="w-5 h-5" />}
              iconPosition="left"
              className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
            >
              Voir toutes les annonces
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