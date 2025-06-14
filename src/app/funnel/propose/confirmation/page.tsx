'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Home } from 'lucide-react';
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
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      console.log('Annonce soumise avec succès:', result);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
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
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4">
              Erreur temporaire
            </h1>
            
            <div className="space-y-6 mb-8">
              <p className="text-lg text-gray-700">
                Une erreur s'est produite lors de la soumission
              </p>
              
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">🚧 Mode développement</h3>
                <p className="text-sm text-yellow-800">
                  Le système de stockage Airtable n'est pas encore configuré. Votre funnel fonctionne parfaitement, 
                  il suffit d'attendre l'intégration avec le backend centralisé.
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
            className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4"
          >
            ⛵ Annonce créée avec succès !
          </motion.h1>

          {/* Message de confirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            <p className="text-lg text-gray-700">
              Votre annonce a été enregistrée
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Email de confirmation envoyé</span>
              </div>
              <p className="text-sm text-blue-800">
                Un email a été envoyé à <strong>{formData.contact.email}</strong> avec un lien pour valider votre annonce.
              </p>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3 text-left">📝 Prochaines étapes</h3>
              <ul className="text-sm text-yellow-800 space-y-2 text-left">
                <li>1. Vérifiez votre boîte email (et les spams)</li>
                <li>2. Cliquez sur le lien de validation</li>
                <li>3. Votre annonce sera publiée et visible</li>
                <li>4. Vous recevrez les demandes de contact par email</li>
              </ul>
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