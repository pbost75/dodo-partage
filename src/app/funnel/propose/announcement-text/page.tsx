'use client';

import React, { useState, useEffect } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import HelpBlock from '@/components/ui/HelpBlock';

export default function AnnouncementTextStep() {
  const router = useSmartRouter();
  const { formData, setAnnouncementText } = useProposeStore();
  
  const [text, setText] = useState(formData.announcementText || '');

  // Redirection si les étapes précédentes ne sont pas complètes
  useEffect(() => {
    if (!formData.offerType) {
      router.push('/funnel/propose/offer-type');
    }
  }, [formData.offerType, router]);

  // Gestion du changement de texte
  const handleTextChange = (newText: string) => {
    setText(newText);
    setAnnouncementText(newText);
  };

  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  // Placeholder personnalisé et optimisé
  const getPersonalizedPlaceholder = () => {
    const { departure, arrival, container, offerType } = formData;
    
    const departureStr = departure?.country === 'France' ? 'de France' : departure?.country || 'votre pays de départ';
    const arrivalStr = arrival?.country === 'Réunion' ? 'la Réunion' : 
                     arrival?.country === 'Martinique' ? 'la Martinique' : 
                     arrival?.country === 'Guadeloupe' ? 'la Guadeloupe' : 
                     arrival?.country === 'Guyane' ? 'la Guyane' : 
                     arrival?.country === 'Mayotte' ? 'Mayotte' : 
                     arrival?.country === 'Nouvelle-Calédonie' ? 'la Nouvelle-Calédonie' : 
                     arrival?.country || 'votre destination';
    const volume = container?.availableVolume || 'X';
    const offerTypeStr = offerType === 'free' ? 'gratuitement' : 'contre participation aux frais';
    
    return `✍️ Personnalisez votre message :
• Présentez-vous et expliquez votre situation (déménagement, retour, mutation, etc.)
• Précisez ce que vous acceptez/refusez de transporter
• Donnez vos conditions et disponibilités pour vous organiser

Les annonces personnelles attirent plus de contacts !`;
  };

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
            Rédigez votre annonce
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  ✍️ Conseils pour une annonce qui marche
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">• <strong>Soyez personnel</strong> : présentez-vous, expliquez votre situation</p>
                  <p className="text-xs text-gray-600">• <strong>Soyez précis</strong> : dates flexibles ? objets refusés ?</p>
                  <p className="text-xs text-gray-600">• <strong>Soyez rassurant</strong> : montrez que vous êtes sérieux</p>
                  <p className="text-xs text-gray-600">• <strong>Inspiration</strong> : regardez les annonces Facebook</p>
                </div>
              </div>
            }
          />
        </div>

        {/* Message d'encouragement */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-semibold text-blue-900">
                Une annonce bien rédigée et personnelle génère jusqu'à 3x plus de contacts !
              </h3>
            </div>
          </div>
        </div>

        {/* Zone de texte */}
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={getPersonalizedPlaceholder()}
            className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none placeholder-gray-400"
            maxLength={800}
          />
          
          {/* Compteurs */}
          <div className="flex justify-between text-sm">
            <span className={`${charCount >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
              {charCount}/800 caractères {charCount < 50 && '(minimum 50 pour une annonce efficace)'}
            </span>
            <span className="text-gray-500">
              {wordCount} mot{wordCount !== 1 ? 's' : ''}
            </span>
          </div>
          

        </div>
      </motion.div>
    </div>
  );
} 