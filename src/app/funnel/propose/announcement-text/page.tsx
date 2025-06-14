'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import HelpBlock from '@/components/ui/HelpBlock';

export default function AnnouncementTextStep() {
  const router = useRouter();
  const { formData, setAnnouncementText } = useProposeStore();
  
  const [text, setText] = useState(formData.announcementText || '');

  // Fonction pour générer automatiquement le texte d'annonce
  const generateAnnouncementText = () => {
    const { departure, arrival, container, offerType, shippingDate } = formData;
    
    // Construire des noms explicites avec pays et ville
    const departureStr = departure?.country && departure?.city 
      ? `${departure.country} (${departure.city})`
      : departure?.displayName || departure?.city || 'lieu de départ';
      
    const arrivalStr = arrival?.country && arrival?.city 
      ? `${arrival.country} (${arrival.city})`
      : arrival?.displayName || arrival?.city || 'lieu d\'arrivée';
    const containerType = container?.type || '20';
    const availableVolume = container?.availableVolume || 14;
    const currentOfferType = offerType || 'free';

    // Date formatée
    const dateStr = shippingDate ? new Date(shippingDate).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long' 
    }) : 'prochainement';

    // Templates de texte selon le type d'offre
    const templates = {
      free: [
        `🚢 Bonjour ! Transport ${departureStr} → ${arrivalStr} ${dateStr} en conteneur ${containerType} pieds.

J'ai ${availableVolume} m³ de disponible et je propose un partage gratuit par solidarité. J'accepte : vos affaires personnelles.

N'hésitez pas à me contacter pour qu'on organise ça ensemble !`,

        `📦 Bonjour ! Déménagement ${departureStr} → ${arrivalStr} ${dateStr} avec conteneur ${containerType} pieds.

${availableVolume} m³ libre que je partage gratuitement par entraide. J'accepte : vos affaires personnelles.

Contactez-moi pour organiser le transport !`
      ],
      paid: [
        `🚢 Bonjour ! Transport ${departureStr} → ${arrivalStr} ${dateStr} en conteneur ${containerType} pieds.

J'ai ${availableVolume} m³ de disponible et je cherche quelqu'un pour partager les frais. J'accepte : vos affaires personnelles.

Contactez-moi pour discuter des modalités !`,

        `📦 Bonjour ! Déménagement ${departureStr} → ${arrivalStr} ${dateStr} avec conteneur ${containerType} pieds.

${availableVolume} m³ libre contre participation aux frais. J'accepte : vos affaires personnelles.

Contactez-moi pour qu'on s'arrange !`
      ]
    };

    // Choisir un template aléatoire
    const availableTemplates = templates[currentOfferType as 'free' | 'paid'] || templates.free;
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    return randomTemplate;
  };

  // Générer automatiquement au chargement si pas de texte
  useEffect(() => {
    console.log('FormData in useEffect:', formData);
    if (!text || text.length < 10) {
      const generatedText = generateAnnouncementText();
      console.log('Generated text:', generatedText);
      setText(generatedText);
      setAnnouncementText(generatedText);
    }
  }, [formData]); // Ajout de formData comme dépendance

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
                  ✍️ Conseils pour une bonne annonce
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">• Précisez vos dates et lieux</p>
                  <p className="text-xs text-gray-600">• Mentionnez les types d'objets acceptés ou refusés</p>
                  <p className="text-xs text-gray-600">• Indiquez si c'est gratuit ou avec participation</p>
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
            placeholder="Rédigez votre annonce ici..."
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
      </motion.div>
    </div>
  );
} 