'use client';

import React, { useState, useEffect } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import CardRadioGroup, { CardRadioOption } from '@/components/ui/CardRadioGroup';
import HelpBlock from '@/components/ui/HelpBlock';

export default function OfferTypeStep() {
  const router = useSmartRouter();
  const { formData, setOfferType } = useProposeStore();
  
  const [selectedType, setSelectedType] = useState<'free' | 'paid' | ''>(formData.offerType);

  // Options pour le type d'offre
  const offerTypeOptions: CardRadioOption[] = [
    {
      value: 'free',
      label: 'Partage gratuit',
      description: 'Je partage par solidarité et convivialité',
      emoji: '🤝',
      iconBgColor: 'bg-green-50',
      iconTextColor: 'text-green-500'
    },
    {
      value: 'paid',
      label: 'Participation aux frais',
      description: 'Je demande une contribution financière',
      emoji: '💶',
      iconBgColor: 'bg-orange-50',
      iconTextColor: 'text-orange-500'
    }
  ];

  // Gestion du changement de type
  const handleTypeChange = (type: string) => {
    const offerType = type as 'free' | 'paid';
    setSelectedType(offerType);
    setOfferType(offerType);
    
    // Auto-scroll vers le bloc d'information si "paid" est sélectionné
    if (offerType === 'paid') {
      setTimeout(() => {
        const element = document.getElementById('payment-info');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 400); // Délai pour attendre l'animation d'apparition
    }
  };

  // Redirection si les étapes précédentes ne sont pas complètes
  useEffect(() => {
    if (!formData.container.type || formData.container.availableVolume <= 0 || formData.container.minimumVolume <= 0) {
      router.push('/funnel/propose/minimum-volume');
    }
  }, [formData.container, router]);

  // Détecter si on est sur mobile pour le mode compact
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            Quel type de partage ?
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  💡 Quelle différence ?
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">🤝 Partage gratuit :</p>
                    <p className="text-xs text-gray-600">Esprit solidaire, favorise l'entraide. Les personnes peuvent vous remercier si elles le souhaitent.</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">💶 Participation aux frais :</p>
                    <p className="text-xs text-gray-600">Aide à couvrir vos coûts de transport. Montant à négocier directement entre vous.</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>Note :</strong> DodoPartage ne gère aucun paiement. Tous les arrangements se font directement entre vous.
                  </p>
                </div>
              </div>
            }
          />
        </div>

        <CardRadioGroup
          name="offerType"
          options={offerTypeOptions}
          value={selectedType}
          onChange={handleTypeChange}
          layout={isMobile ? "column" : "grid"}
          compact={isMobile}
        />

        {/* Bloc d'information important - affiché uniquement pour "paid" */}
        {selectedType === 'paid' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 rounded-xl p-4 border border-blue-200"
            id="payment-info"
          >
            <div className="flex gap-3">
              <div className="text-blue-600 flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <ul className="space-y-1 text-blue-700">
                  <li>• DodoPartage ne gère aucun paiement</li>
                  <li>• Tous les arrangements se font directement entre vous</li>
                  <li>• Les détails financiers ne sont pas affichés publiquement</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 