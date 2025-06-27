'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Mail, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  showRetryButton: boolean;
}

const errorMessages: Record<string, ErrorInfo> = {
  'missing-token': {
    title: 'Lien invalide',
    message: 'Le lien de validation ne contient pas de token d\'authentification.',
    suggestion: 'Vérifiez que vous avez bien copié le lien complet depuis votre email.',
    showRetryButton: false,
  },
  'token-not-found': {
    title: 'Token inconnu',
    message: 'Ce lien de validation n\'existe pas ou n\'est plus valide.',
    suggestion: 'Il est possible que l\'annonce ait déjà été validée ou que le lien soit incorrect.',
    showRetryButton: false,
  },
  'token-expired': {
    title: 'Lien expiré',
    message: 'Ce lien de validation a expiré.',
    suggestion: 'Les liens de validation expirent après 7 jours. Vous pouvez créer une nouvelle annonce.',
    showRetryButton: false,
  },
  'validation-failed': {
    title: 'Erreur de validation',
    message: 'Une erreur s\'est produite lors de la validation de votre annonce.',
    suggestion: 'Cette erreur est généralement temporaire. Veuillez réessayer dans quelques minutes.',
    showRetryButton: true,
  },
  'server-error': {
    title: 'Erreur serveur',
    message: 'Une erreur technique s\'est produite sur nos serveurs.',
    suggestion: 'Notre équipe technique a été notifiée. Veuillez réessayer plus tard.',
    showRetryButton: true,
  },
};

const defaultError: ErrorInfo = {
  title: 'Erreur de validation',
  message: 'Une erreur inattendue s\'est produite lors de la validation.',
  suggestion: 'Veuillez réessayer ou contacter notre support si le problème persiste.',
  showRetryButton: true,
};

function ValidationErrorContent() {
  const router = useSmartRouter();
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>(defaultError);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    const reason = searchParams.get('reason') || 'unknown';
    const token = searchParams.get('token');
    
    setCurrentToken(token);
    setErrorInfo(errorMessages[reason] || defaultError);
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateNewAnnouncement = () => {
    router.push('/funnel/propose/locations');
  };

  const handleRetryValidation = () => {
    if (currentToken) {
      // Réessayer avec le même token
              window.location.href = `${window.location.origin}/api/validate-announcement?token=${encodeURIComponent(currentToken)}`;
    } else {
      // Pas de token, retourner à l'accueil
      handleGoHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Icône d'erreur */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
        >
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
        >
          {errorInfo.title}
        </motion.h1>

        {/* Message d'erreur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6 mb-8"
        >
          <p className="text-xl text-gray-700">
            {errorInfo.message}
          </p>

          {/* Détails de l'erreur */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 text-lg">💡 Que faire ?</h3>
            <p className="text-red-800">
              {errorInfo.suggestion}
            </p>
          </div>

          {/* Aide supplémentaire */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg">🔍 Vérifications utiles</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium">Vérifiez votre email</p>
                  <p className="text-sm text-blue-700">Le lien de validation doit être copié en entier depuis l'email de confirmation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium">Utilisez un lien récent</p>
                  <p className="text-sm text-blue-700">Les liens de validation expirent après 7 jours pour des raisons de sécurité</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information sur les spams */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-3 text-lg">📧 Vous n'avez pas reçu l'email ?</h3>
            <div className="text-left space-y-2">
              <p className="text-yellow-800">• Vérifiez votre dossier spam/courrier indésirable</p>
              <p className="text-yellow-800">• L'email peut prendre quelques minutes à arriver</p>
                              <p className="text-yellow-800">• L'expéditeur est DodoPartage &lt;noreply@dodomove.fr&gt;</p>
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
          {errorInfo.showRetryButton && currentToken && (
            <Button
              onClick={handleRetryValidation}
              fullWidth
              size="lg"
              icon={<RefreshCw className="w-5 h-5" />}
              iconPosition="left"
              className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
            >
              Réessayer la validation
            </Button>
          )}
          
          <Button
            onClick={handleCreateNewAnnouncement}
            fullWidth
            size="lg"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Créer une nouvelle annonce
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

        {/* Contact support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-gray-600 text-sm">
            Si le problème persiste, contactez-nous à{' '}
            <a
              href="mailto:support@dodomove.fr"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support@dodomove.fr
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ValidationErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    }>
      <ValidationErrorContent />
    </Suspense>
  );
}