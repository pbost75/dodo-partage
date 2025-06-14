"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import CardRadioGroup from '@/components/ui/CardRadioGroup';
import HelpBlock from '@/components/ui/HelpBlock';

export default function MinimumVolumeStep() {
  const router = useRouter();
  const { formData, setContainerDetails } = useProposeStore();
  
  // État local pour le volume minimum
  const [minimumVolume, setMinimumVolume] = useState(formData.container.minimumVolume);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Options pour le volume minimum
  const minimumVolumeOptions = [
    {
      id: 'flexible',
      label: 'Peu importe',
      description: 'Toutes demandes acceptées',
      value: 'flexible'
    },
    {
      id: '1',
      label: '1 m³',
      description: 'Minimum 1 m³',
      value: '1'
    },
    {
      id: '3',
      label: '3 m³',
      description: 'Minimum 3 m³',
      value: '3'
    },
    {
      id: '5',
      label: '5 m³',
      description: 'Minimum 5 m³',
      value: '5'
    }
  ];

  // Validation
  const validateMinimumVolume = (minVolume: number) => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    // Vérifier que le volume minimum n'est pas supérieur au volume disponible
    if (minVolume > formData.container.availableVolume) {
      newErrors.push('Le volume minimum ne peut pas être supérieur au volume disponible');
    }

    // Avertissement si le volume minimum est élevé
    if (minVolume >= 2 && formData.container.availableVolume < 3) {
      newWarnings.push('Volume minimum élevé par rapport à l\'espace disponible');
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return newErrors.length === 0;
  };

  // Gestion du changement de volume minimum
  const handleMinimumVolumeChange = (value: string) => {
    let volumeValue: number;
    
    if (value === 'flexible') {
      volumeValue = 0.1; // Valeur très faible pour "peu importe"
    } else {
      volumeValue = parseFloat(value);
    }
    
    setMinimumVolume(volumeValue);
    validateMinimumVolume(volumeValue);
    
    // Sauvegarder dans le store
    setContainerDetails(
      formData.container.type as '20' | '40',
      formData.container.availableVolume,
      volumeValue
    );
  };

  // Déterminer la valeur sélectionnée pour le radio group
  const getSelectedValue = () => {
    if (minimumVolume <= 0.1) return 'flexible';
    return minimumVolume.toString();
  };

  // Navigation vers l'étape suivante
  const handleContinue = () => {
    if (validateMinimumVolume(minimumVolume)) {
      router.push('/funnel/propose/offer-type');
    }
  };

  // Réhydrater les données au montage
  useEffect(() => {
    if (formData.container.minimumVolume > 0) {
      setMinimumVolume(formData.container.minimumVolume);
      validateMinimumVolume(formData.container.minimumVolume);
    }
  }, []);

  // Redirection si les étapes précédentes ne sont pas complètes
  useEffect(() => {
    if (!formData.container.type || formData.container.availableVolume <= 0) {
      router.push('/funnel/propose/container-details');
    }
  }, [formData.container, router]);

  const isValid = errors.length === 0 && minimumVolume > 0;

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
            Quel volume minimum acceptez-vous ?
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  💡 Pourquoi définir un volume minimum ?
                </p>
                <p className="text-gray-700 text-xs mb-4 leading-relaxed">
                  Cela vous évite de recevoir des demandes pour de très petits objets 
                  si vous préférez partager votre espace avec des envois plus importants.
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Exemples pratiques :</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-2">
                    <li>• <strong>Peu importe</strong> : Accepte tout (même 1 livre)</li>
                    <li>• <strong>1 m³</strong> : Équivaut à ~10 cartons standards</li>
                    <li>• <strong>3 m³</strong> : Électroménager ou mobilier</li>
                    <li>• <strong>5 m³</strong> : Déménagement partiel</li>
                  </ul>
                </div>
              </div>
            }
          />
        </div>

        <CardRadioGroup
          name="minimumVolume"
          options={minimumVolumeOptions}
          value={getSelectedValue()}
          onChange={handleMinimumVolumeChange}
          layout="column"
          compact={true}
        />

        {/* Messages d'erreur */}
        {errors.map((error, index) => (
          <div key={index} className="flex items-start gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ))}

        {/* Messages d'avertissement */}
        {warnings.map((warning, index) => (
          <div key={index} className="flex items-start gap-2 text-amber-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
} 