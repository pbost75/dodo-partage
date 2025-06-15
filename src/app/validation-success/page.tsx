'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

function ValidationSuccessContent() {
  const router = useRouter();

  const handleViewAnnouncements = () => {
    router.push('/#annonces');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-12 text-center"
      >
        {/* Icône de succès personnalisée */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 relative"
        >
          <div className="text-6xl">🚢</div>
          <div className="absolute -top-2 -right-2 text-2xl">✅</div>
        </motion.div>

        {/* Titre principal */}
        <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4">
          Annonce validée !
        </h1>

        {/* Message simple */}
        <p className="text-lg text-gray-700 mb-12 leading-relaxed">
          Parfait ! Votre annonce est maintenant visible sur DodoPartage.<br/>
          Les personnes intéressées pourront vous contacter et vous recevrez leurs demandes par email.
        </p>

        {/* Bouton d'action unique */}
          <Button
            onClick={handleViewAnnouncements}
            fullWidth
            size="lg"
          className="bg-[#F47D6C] hover:bg-[#e05a48] text-white font-medium text-lg py-4"
          >
          <span className="mr-3 text-xl">👁️</span>
            Voir toutes les annonces
          </Button>
          
        {/* Message de remerciement minimaliste */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Merci d'utiliser DodoPartage 🌴
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