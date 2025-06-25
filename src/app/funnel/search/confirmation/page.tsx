'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Home, AlertCircle, Search } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import Button from '@/components/ui/Button';
import SubmissionLoader from '@/components/ui/SubmissionLoader';

export default function SearchConfirmationPage() {
  const router = useRouter();
  const { formData, reset } = useSearchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Redirection si pas de données
  useEffect(() => {
    if (!formData.contact.email || !formData.volumeNeeded.neededVolume) {
      router.push('/funnel/search/locations');
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
    
    console.log('🚀 Début de soumission de demande de place');
    setIsSubmitting(true);
    
    try {
      // Envoyer les données à l'API spécifique aux demandes de place
      const response = await fetch('/api/submit-search-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Cas spécial : Demande potentielle déjà créée (429)
        if (response.status === 429) {
          console.log('⚠️ Demande potentiellement déjà créée - Considéré comme succès');
          // Considérer comme un succès car la demande a été créée
          setSubmissionResult({
            success: true,
            message: 'Demande déjà créée',
            isDuplicate: true
          });
          setIsSubmitted(true);
          return;
        }
        
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      console.log('✅ Demande de place soumise avec succès:', result);
      
      setSubmissionResult(result);
      setIsSubmitted(true);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la soumission de votre demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleNewSearch = () => {
    // Réinitialiser le store et rediriger vers le début du funnel search
    reset();
    router.push('/funnel/search/locations');
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
                Une erreur s'est produite lors de la soumission de votre demande de place
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
                  <li>• Toutes les étapes du funnel de recherche</li>
                  <li>• Validation des données</li>
                  <li>• Interface utilisateur complète</li>
                  <li>• Calculateur de volume intégré</li>
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
            🔍 Demande reçue !
          </motion.h1>

          {/* Message de confirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 mb-8"
          >
            <p className="text-xl text-gray-700 font-['Lato']">
              Votre demande de place a été enregistrée avec succès
            </p>

            {/* Résumé de la demande */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-left">
              <h3 className="font-semibold text-blue-900 mb-4 font-['Roboto_Slab']">
                📋 Résumé de votre demande
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span className="font-medium">Trajet :</span>
                  <span>{formData.departure.displayName} → {formData.arrival.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Volume recherché :</span>
                  <span>{formData.volumeNeeded.neededVolume} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Participation aux frais :</span>
                  <span>{formData.budget.acceptsFees ? 'Acceptée' : 'Non souhaitée'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Période :</span>
                  <span>
                    {formData.shippingPeriod.selectedMonths?.length ? 
                      formData.shippingPeriod.selectedMonths.join(', ') : 
                      'Flexible'
                    }
                  </span>
                </div>
                {formData.volumeNeeded.usedCalculator && (
                  <div className="flex justify-between">
                    <span className="font-medium">Calculateur :</span>
                    <span className="text-green-600">✓ Utilisé</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2 font-['Roboto_Slab']">
                    📧 Prochaines étapes
                  </h3>
                  <ol className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <span>Un email de validation a été envoyé à <strong>{formData.contact.email}</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <span>Cliquez sur le lien dans l'email pour confirmer votre demande</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <span>Votre demande sera visible par les transporteurs ayant de l'espace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                      <span>Vous recevrez les coordonnées des personnes intéressées</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Note importante */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">📥 Vérifiez vos emails</p>
                  <p>
                    Si vous ne recevez pas l'email de validation dans les 5 minutes, 
                    vérifiez votre dossier spam ou courrier indésirable.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <Button
              onClick={handleNewSearch}
              fullWidth
              size="lg"
              className="bg-[#F47D6C] hover:bg-[#e05a48] text-white"
              icon={<Search className="w-5 h-5" />}
              iconPosition="left"
            >
              Nouvelle recherche
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