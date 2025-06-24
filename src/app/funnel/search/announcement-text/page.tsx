'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';
import HelpBlock from '@/components/ui/HelpBlock';


export default function AnnouncementTextStep() {
  const router = useRouter();
  const { formData, setAnnouncementText } = useSearchStore();
  
  const [text, setText] = useState(formData.announcementText || '');

  // Fonction pour générer automatiquement le texte d'annonce de recherche
  const generateAnnouncementText = () => {
    const { departure, arrival, shippingPeriod, volumeNeeded, budget } = formData;
    
    // Construire des noms explicites avec pays et ville
    const departureStr = departure?.country && departure?.city 
      ? `${departure.country} (${departure.city})`
      : departure?.displayName || departure?.city || 'lieu d\'expédition';
      
    const arrivalStr = arrival?.country && arrival?.city 
      ? `${arrival.country} (${arrival.city})`
      : arrival?.displayName || arrival?.city || 'lieu d\'arrivée';
    
    const volume = volumeNeeded?.neededVolume || 5;
    
    // Période formatée (nouvelle méthode avec selectedMonths)
    let periodStr = '';
    if (shippingPeriod?.selectedMonths && shippingPeriod.selectedMonths.length > 0) {
      if (shippingPeriod.selectedMonths.length === 1) {
        periodStr = `en ${shippingPeriod.selectedMonths[0]}`;
      } else if (shippingPeriod.selectedMonths.length === 2) {
        periodStr = `entre ${shippingPeriod.selectedMonths[0]} et ${shippingPeriod.selectedMonths[1]}`;
      } else {
        periodStr = `entre ${shippingPeriod.selectedMonths[0]} et ${shippingPeriod.selectedMonths[shippingPeriod.selectedMonths.length - 1]}`;
      }
    } else {
      periodStr = 'prochainement';
    }
    
    // Budget
    const budgetStr = budget?.acceptsFees === false
      ? 'Je cherche une place gratuite par entraide.'
      : 'Je peux participer aux frais (budget à discuter).';

    // Templates de texte selon le budget
    const templates = {
      free: [
        `🔍 Bonjour ! Je cherche de la place dans un conteneur ${departureStr} → ${arrivalStr} ${periodStr}.

J'ai environ ${volume} m³ d'affaires personnelles à transporter. ${budgetStr}

Si vous avez de l'espace libre, contactez-moi ! Merci 🙏`,

        `📦 Bonjour ! Recherche place conteneur ${departureStr} → ${arrivalStr} ${periodStr}.

Volume: environ ${volume} m³ (affaires personnelles). ${budgetStr}

Merci de me contacter si vous pouvez m'aider !`
      ],
      budget: [
        `🔍 Bonjour ! Je cherche de la place dans un conteneur ${departureStr} → ${arrivalStr} ${periodStr}.

J'ai environ ${volume} m³ d'affaires personnelles. ${budgetStr}

Contactez-moi si vous avez de l'espace disponible !`,

        `📦 Recherche espace conteneur ${departureStr} → ${arrivalStr} ${periodStr}.

Volume: ${volume} m³. ${budgetStr}

N'hésitez pas à me contacter pour qu'on s'arrange !`
      ]
    };

    // Choisir un template selon le budget
    const templateType = budget?.acceptsFees === false ? 'free' : 'budget';
    const availableTemplates = templates[templateType];
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    return randomTemplate;
  };

  // Générer automatiquement au chargement si pas de texte
  useEffect(() => {
    if (!text || text.length < 10) {
      const generatedText = generateAnnouncementText();
      setText(generatedText);
      setAnnouncementText(generatedText);
    }
  }, [formData]); // Ajout de formData comme dépendance

  // Redirection si les étapes précédentes ne sont pas complètes
  useEffect(() => {
    if (formData.budget.acceptsFees === null) {
      router.push('/funnel/search/budget');
    }
  }, [formData.budget.acceptsFees, router]);

  // Gestion du changement de texte
  const handleTextChange = (newText: string) => {
    setText(newText);
    setAnnouncementText(newText);
  };

  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

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
            Rédigez votre demande
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  ✍️ Conseils pour une bonne demande
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">• Soyez précis sur vos dates et lieux</p>
                  <p className="text-xs text-gray-600">• Décrivez le type d'objets à transporter</p>
                  <p className="text-xs text-gray-600">• Indiquez votre flexibilité et votre budget</p>
                  <p className="text-xs text-gray-600">• Restez poli et remerciant</p>
                </div>
              </div>
            }
          />
        </div>

        {/* Zone de texte - toujours éditable */}
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Rédigez votre demande ici..."
            className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none"
            maxLength={500}
          />
          
          {/* Compteurs */}
          <div className="flex justify-between text-sm">
            <span className={`${charCount >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
              {charCount}/500 caractères {charCount < 50 && '(minimum 50)'}
            </span>
            <span className="text-gray-500">
              {wordCount} mot{wordCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Info spécifique à la recherche */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mt-8">
          <div className="flex gap-3">
            <span className="text-orange-600 flex-shrink-0 mt-0.5">💡</span>
            <div className="text-sm text-orange-800 font-['Lato']">
              <p className="font-medium mb-2">Conseils pour une demande efficace</p>
              <p className="text-orange-700 leading-relaxed">
                Plus vous êtes précis et flexible, plus vous aurez de réponses ! 
                N'hésitez pas à mentionner votre aide pour le chargement/déchargement.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
} 