'use client';

import React, { useState, useEffect } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import HelpBlock from '@/components/ui/HelpBlock';

interface GuidedAnswers {
  presentation: string;
  reason: string;
  restrictions: string;
  conditions: string;
}

export default function AnnouncementTextStepV2() {
  const router = useSmartRouter();
  const { formData, setAnnouncementText } = useProposeStore();
  
  const [answers, setAnswers] = useState<GuidedAnswers>({
    presentation: '',
    reason: '',
    restrictions: '',
    conditions: ''
  });
  
  const [generatedText, setGeneratedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Redirection si les étapes précédentes ne sont pas complètes
  useEffect(() => {
    if (!formData.offerType) {
      router.push('/funnel/propose/offer-type');
    }
  }, [formData.offerType, router]);

  // Générer le texte basé sur les réponses
  const generateFromAnswers = () => {
    const { departure, arrival, container, offerType, shippingDate } = formData;
    
    const departureStr = departure?.country && departure?.city 
      ? `${departure.country} (${departure.city})`
      : departure?.displayName || departure?.city || 'lieu de départ';
      
    const arrivalStr = arrival?.country && arrival?.city 
      ? `${arrival.country} (${arrival.city})`
      : arrival?.displayName || arrival?.city || 'lieu d\'arrivée';
    
    const volume = container?.availableVolume || 14;
    const dateStr = shippingDate ? new Date(shippingDate).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long' 
    }) : 'prochainement';
    
    // Construction du message personnalisé
    let message = `Bonjour ! `;
    
    // Présentation
    if (answers.presentation.trim()) {
      message += `${answers.presentation.trim()}. `;
    }
    
    // Raison du voyage
    if (answers.reason.trim()) {
      message += `${answers.reason.trim()} `;
    }
    
    // Informations du conteneur
    message += `Mon transport ${departureStr} → ${arrivalStr} est prévu ${dateStr}. `;
    message += `J'ai ${volume} m³ de libre que je `;
    message += offerType === 'free' ? 'partage gratuitement' : 'propose contre participation aux frais';
    message += `. `;
    
    // Restrictions
    if (answers.restrictions.trim()) {
      message += `Concernant les objets : ${answers.restrictions.trim()}. `;
    } else {
      message += `J'accepte les affaires personnelles classiques. `;
    }
    
    // Conditions/organisation
    if (answers.conditions.trim()) {
      message += `${answers.conditions.trim()} `;
    }
    
    message += `N'hésitez pas à me contacter pour organiser ça ensemble !`;
    
    return message;
  };

  // Mettre à jour le texte généré quand les réponses changent
  useEffect(() => {
    const text = generateFromAnswers();
    setGeneratedText(text);
    setAnnouncementText(text);
  }, [answers, formData]);

  const handleAnswerChange = (field: keyof GuidedAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const questions = [
    {
      id: 'presentation' as keyof GuidedAnswers,
      label: '👋 Présentez-vous brièvement',
      placeholder: 'Ex: "Je suis Marie, fonctionnaire en mutation" ou "Nous sommes un couple qui déménage"',
      help: 'Qui êtes-vous ? Votre situation personnelle aide à créer une relation de confiance.'
    },
    {
      id: 'reason' as keyof GuidedAnswers,
      label: '🎯 Pourquoi proposez-vous cette place ?',
      placeholder: 'Ex: "par solidarité entre expatriés" ou "pour partager les frais" ou "notre conteneur n\'est pas plein"',
      help: 'Expliquez votre motivation, cela rassure sur vos intentions.'
    },
    {
      id: 'restrictions' as keyof GuidedAnswers,
      label: '📦 Que refusez-vous de transporter ?',
      placeholder: 'Ex: "pas de produits dangereux ni d\'électroménager" ou "que des cartons et vêtements" (optionnel)',
      help: 'Précisez vos limites pour éviter les mauvaises surprises.'
    },
    {
      id: 'conditions' as keyof GuidedAnswers,
      label: '📅 Conditions d\'organisation',
      placeholder: 'Ex: "disponible weekends pour récupération" ou "envoi par transporteur possible" (optionnel)',
      help: 'Comment comptez-vous organiser la logistique ?'
    }
  ];

  const completedAnswers = Object.values(answers).filter(a => a.trim().length > 0).length;
  const progress = (completedAnswers / questions.length) * 100;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-10">
          <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab']">
            Créons votre annonce ensemble
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  ✨ Version guidée pour annonces personnelles
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">• Répondez aux 4 questions simples</p>
                  <p className="text-xs text-gray-600">• Votre annonce se crée automatiquement</p>
                  <p className="text-xs text-gray-600">• Plus personnel qu'un texte générique</p>
                  <p className="text-xs text-gray-600">• Vous pouvez modifier le résultat final</p>
                </div>
              </div>
            }
          />
        </div>

        {/* Barre de progression */}
        <div className="bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 text-center -mt-4 mb-8">
          {completedAnswers}/4 questions remplies
        </p>

        {/* Questions guidées */}
        <div className="grid gap-6">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-lg font-semibold text-blue-600">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {question.label}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {question.help}
                  </p>
                  <textarea
                    value={answers[question.id]}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none text-sm"
                    maxLength={150}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {answers[question.id].length}/150 caractères
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aperçu de l'annonce générée */}
        {completedAnswers >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-800">
                🎉 Aperçu de votre annonce personnalisée
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                {showPreview ? 'Masquer' : 'Voir l\'aperçu'}
              </button>
            </div>
            
            {showPreview && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {generatedText}
                </p>
                <div className="mt-3 pt-3 border-t border-green-100">
                  <p className="text-sm text-green-700">
                    ✨ {generatedText.length} caractères - Annonce personnalisée créée !
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Message d'encouragement */}
        {completedAnswers < 2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <span className="text-3xl mb-3 block">✍️</span>
            <h3 className="font-semibold text-blue-900 mb-2">
              Répondez aux questions pour créer votre annonce
            </h3>
            <p className="text-blue-700 text-sm">
              Chaque réponse rend votre annonce plus personnelle et attractive !
            </p>
          </div>
        )}

        {/* Zone d'édition libre si souhaitée */}
        {completedAnswers >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-gray-200 pt-6"
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              🔧 Modifier votre annonce (optionnel)
            </h3>
            <textarea
              value={generatedText}
              onChange={(e) => {
                setGeneratedText(e.target.value);
                setAnnouncementText(e.target.value);
              }}
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 mt-2">
              {generatedText.length}/500 caractères
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 