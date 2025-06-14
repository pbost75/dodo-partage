'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Home, AlertCircle } from 'lucide-react';
import { useProposeStore } from '@/store/proposeStore';
import Button from '@/components/ui/Button';
import SubmissionLoader from '@/components/ui/SubmissionLoader';

export default function ConfirmationPage() {
  const router = useRouter();
  const { formData, reset } = useProposeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Redirection si pas de données
  useEffect(() => {
    if (!formData.contact.email || !formData.container.type) {
      router.push('/funnel/propose/container-details');
      return;
    }
  }, [formData, router]);

  // Soumission automatique au chargement (une seule fois)
  useEffect(() => {
    if (!isSubmitted && !isSubmitting && !hasAttemptedSubmit && formData.contact.email) {
      setHasAttemptedSubmit(true);
      handleSubmit();
    }
  }, []); // Dépendances vides = exécution une seule fois au montage

  const handleSubmit = async () => {
    // Protection renforcée contre les soumissions multiples
    if (isSubmitting || isSubmitted || hasAttemptedSubmit) {
      console.log('⚠️ Soumission déjà en cours, terminée ou tentée, abandon');
      return;
    }
    
    console.log('🚀 Début de soumission unique');
    setIsSubmitting(true);
    
    try {
      // Envoyer les données à l'API
      const response = await fetch('/api/submit-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Cas spécial : Annonce potentielle déjà créée (429)
        if (response.status === 429) {
          console.log('⚠️ Annonce potentiellement déjà créée - Considéré comme succès');
          // Considérer comme un succès car l'annonce a été créée
          setSubmissionResult({
            success: true,
            message: 'Annonce déjà créée',
            isDuplicate: true
          });
          setIsSubmitted(true);
          return;
        }
        
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      console.log('✅ Annonce soumise avec succès:', result);
      
      setSubmissionResult(result);
      setIsSubmitted(true);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la soumission de votre annonce');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isSubmitting) {
    return <SubmissionLoader isSubmitting={isSubmitting} />;
  }

  // Affichage d'erreur si la soumission a échoué
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center p-8"
        >
          <div className="max-w-2xl w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4">
              Erreur temporaire
            </h1>
            
            <div className="space-y-6 mb-8">
              <p className="text-lg text-gray-700">
                Une erreur s'est produite lors de la soumission de votre annonce
              </p>
              
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Détails de l'erreur</h3>
                <p className="text-sm text-red-800">
                  {error}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">✅ Ce qui fonctionne déjà</h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Toutes les étapes du funnel</li>
                  <li>• Validation des données</li>
                  <li>• Interface utilisateur complète</li>
                  <li>• Composants téléphone et email</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => setError(null)}
                fullWidth
                size="lg"
                className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
              >
                Réessayer
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
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="max-w-2xl w-full text-center">
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
            className="text-4xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
          >
            ⛵ Bien reçu !
          </motion.h1>

          {/* Message de confirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            {/* Information importante sur la validation email */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800">
                    Un email a été envoyé à <strong>{formData.contact.email}</strong> avec un lien pour valider votre annonce.
                  </p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <p className="text-sm text-blue-900 font-medium">
                    ⚠️ Important : Votre annonce ne sera visible qu'après validation
                  </p>
                </div>
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-4 text-left text-lg">📋 Prochaines étapes</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">1</span>
                  <p className="text-yellow-800">Vérifiez votre boîte email (et les spams)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">2</span>
                  <p className="text-yellow-800">Cliquez sur le lien de validation dans l'email</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">3</span>
                  <p className="text-yellow-800">Votre annonce sera publiée et visible sur la plateforme</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">4</span>
                  <p className="text-yellow-800">Vous recevrez les demandes de contact par email</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bouton d'action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={handleGoHome}
              fullWidth
              size="lg"
              icon={<Home className="w-5 h-5" />}
              iconPosition="left"
              className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
            >
              Retour à l'accueil
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 