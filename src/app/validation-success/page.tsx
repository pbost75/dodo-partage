'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

function ValidationSuccessContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
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
        <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-3">
          🎉 Annonce validée !
        </h1>

        {/* Message simple */}
        <p className="text-lg text-gray-700 mb-8">
          Félicitations ! Votre annonce est maintenant publiée et visible sur DodoPartage.
        </p>

        {/* Référence - Design simplifié */}
        {announcementRef && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
            <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Référence de votre annonce</h3>
            <div className="bg-white px-4 py-3 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-mono text-base font-semibold">
                {announcementRef}
              </p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Conservez cette référence pour gérer votre annonce
            </p>
          </div>
        )}

        {/* Statut actuel - Design épuré */}
        <div className="bg-green-50 rounded-xl p-4 mb-8 border border-green-100">
          <h3 className="text-sm font-medium text-green-900 mb-3">✅ Votre annonce est maintenant :</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm">Visible sur la plateforme</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm">Prête à recevoir des contacts</span>
            </div>
          </div>
        </div>

        {/* Fonctionnement - Version condensée */}
        <div className="bg-orange-50 rounded-xl p-4 mb-8 border border-orange-100">
          <h3 className="text-sm font-medium text-orange-900 mb-3">📧 Comment ça fonctionne maintenant ?</h3>
          <div className="text-left space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-900 mt-0.5">1</span>
              <p className="text-orange-800 text-sm">Les personnes intéressées verront votre annonce</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-900 mt-0.5">2</span>
              <p className="text-orange-800 text-sm">Elles pourront vous contacter via le formulaire</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-900 mt-0.5">3</span>
              <p className="text-orange-800 text-sm">Vous recevrez leurs demandes directement par email</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-900 mt-0.5">4</span>
              <p className="text-orange-800 text-sm">Vous pourrez échanger directement avec eux pour organiser le partage</p>
            </div>
          </div>
        </div>

        {/* Boutons d'action - Simplifiés */}
        <div className="space-y-3">
          <Button
            onClick={handleViewAnnouncements}
            fullWidth
            size="lg"
            className="bg-[#F47D6C] hover:bg-[#e05a48] text-white font-medium"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir toutes les annonces
          </Button>
          
          <Button
            onClick={handleGoHome}
            fullWidth
            size="lg"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Message de remerciement - Simplifié */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Merci d'utiliser DodoPartage pour faciliter les expéditions vers les DOM-TOM ! 🌴
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ValidationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ValidationSuccessContent />
    </Suspense>
  );
}