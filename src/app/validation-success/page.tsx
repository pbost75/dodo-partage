'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Eye, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ValidationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [announcementRef, setAnnouncementRef] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setAnnouncementRef(ref);
    }
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewAnnouncements = () => {
    router.push('/#annonces');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Animation de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-16 h-16 text-green-600" />
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
        >
          🎉 Annonce validée !
        </motion.h1>

        {/* Message principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6 mb-8"
        >
          <p className="text-xl text-gray-700">
            Félicitations ! Votre annonce est maintenant publiée et visible sur DodoPartage.
          </p>

          {/* Référence si disponible */}
          {announcementRef && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">📋 Référence de votre annonce</h3>
              <p className="text-blue-800 font-mono text-lg bg-white px-4 py-3 rounded-lg border">
                {announcementRef}
              </p>
              <p className="text-sm text-blue-700 mt-3">
                Conservez cette référence pour gérer votre annonce
              </p>
            </div>
          )}

          {/* Informations importantes */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-4 text-lg">✅ Votre annonce est maintenant :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-green-800">Visible sur la plateforme</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-green-800">Prête à recevoir des contacts</span>
              </div>
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-4 text-lg">📧 Comment ça fonctionne maintenant ?</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">1</span>
                <p className="text-yellow-800">Les personnes intéressées verront votre annonce</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">2</span>
                <p className="text-yellow-800">Elles pourront vous contacter via le formulaire</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">3</span>
                <p className="text-yellow-800">Vous recevrez leurs demandes directement par email</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">4</span>
                <p className="text-yellow-800">Vous pourrez échanger directement avec eux pour organiser le partage</p>
              </div>
            </div>
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

        {/* Message de remerciement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-gray-600">
            Merci d'utiliser DodoPartage pour faciliter les expéditions vers les DOM-TOM ! 🌴
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 