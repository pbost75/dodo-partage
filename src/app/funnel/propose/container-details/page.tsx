'use client';

import React, { useState, useEffect } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { useProposeStore } from '@/store/proposeStore';
import CardRadioGroup, { CardRadioOption } from '@/components/ui/CardRadioGroup';
import FloatingInput from '@/components/ui/FloatingInput';
import VolumeSelector from '@/components/ui/VolumeSelector';
import Button from '@/components/ui/Button';
import HelpBlock from '@/components/ui/HelpBlock';

// Spécifications des conteneurs
const containerSpecs = {
  '20': { totalVolume: 33, maxAvailable: 25, description: '~33 m³ total' },
  '40': { totalVolume: 67, maxAvailable: 50, description: '~67 m³ total' }
};

// Options pour le volume minimum
const minimumVolumeOptions = [
  { value: 0.1, label: 'Peu importe', description: 'Toutes demandes acceptées' },
  { value: 1.0, label: '1 m³', description: 'Minimum 1 m³' },
  { value: 3.0, label: '3 m³', description: 'Minimum 3 m³' },
  { value: 5.0, label: '5 m³', description: 'Minimum 5 m³' },
  { value: 10.0, label: '10 m³', description: 'Minimum 10 m³' }
];

export default function ContainerDetailsStep() {
  const router = useSmartRouter();
  const { formData, setContainerDetails } = useProposeStore();
  
  // États locaux
  const [containerType, setContainerType] = useState<'20' | '40' | ''>(formData.container.type);
  const [availableVolume, setAvailableVolume] = useState(formData.container.availableVolume || 0);
  const [showVolumeInput, setShowVolumeInput] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Options pour le type de conteneur
  const containerOptions: CardRadioOption[] = [
    {
      value: '20',
      label: '20 pieds',
      description: '~25 m³ exploitable',
      emoji: '📦'
    },
    {
      value: '40',
      label: '40 pieds',
      description: '~50 m³ exploitable',
      emoji: '📦'
    }
  ];

  // Effet pour initialiser l'affichage basé sur les données existantes
  useEffect(() => {
    // Si des données existent déjà, afficher les sections correspondantes
    if (formData.container.type) {
      setShowVolumeInput(true);
      if (formData.container.availableVolume > 0) {
        setHasUserInteracted(true); // L'utilisateur a déjà des données
      }
    }
  }, [formData.container.type, formData.container.availableVolume]);

  // Effet pour gérer l'apparition séquentielle
  useEffect(() => {
    // Montrer le volume disponible quand le type est sélectionné
    if (containerType && !showVolumeInput) {
      setTimeout(() => {
        setShowVolumeInput(true);
      }, 300);
    }
  }, [containerType, showVolumeInput]);



  // Validation et warnings - UNE SEULE ERREUR À LA FOIS
  const validateAndWarn = (type: string, volume: number, showErrors = true) => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    // 1. ERREURS par ordre de priorité (on s'arrête à la première)
    if (!type) {
      newErrors.push('Veuillez sélectionner un type de conteneur');
    }
    else if (volume <= 0 && showErrors) {
      newErrors.push('Le volume disponible doit être supérieur à 0');
    }
    else if (type && (type === '20' || type === '40') && volume > 0) {
      const specs = containerSpecs[type as '20' | '40'];
      
      // ERREUR : Dépasse le maximum absolu
      if (volume > specs.maxAvailable) {
        newErrors.push(`Volume trop important pour un conteneur ${type} pieds (max recommandé: ${specs.maxAvailable} m³)`);
      }
    }

    // 2. AVERTISSEMENTS (seulement si aucune erreur)
    if (newErrors.length === 0) {
      if (type && (type === '20' || type === '40') && volume > 0) {
        const specs = containerSpecs[type as '20' | '40'];
        
        // AVERTISSEMENT : Volume important mais acceptable (dès 50% du total)
        if (volume > specs.totalVolume * 0.5) {
          newWarnings.push('Volume important, vérifiez que vous avez vraiment autant d\'espace libre');
        }
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return newErrors.length === 0;
  };

  // Gestion du changement de type de conteneur
  const handleContainerTypeChange = (type: string) => {
    const containerType = type as '20' | '40';
    setContainerType(containerType);
    
    // Reset du volume si supérieur au max du nouveau type
    if (availableVolume > containerSpecs[containerType].maxAvailable) {
      setAvailableVolume(0);
    }
    
    validateAndWarn(type, availableVolume, hasUserInteracted);
    
    // Sauvegarder dans le store
    if (containerType && availableVolume > 0) {
      setContainerDetails(containerType, availableVolume, 0.1);
    }
  };

  // Gestion du changement de volume disponible
  const handleAvailableVolumeChange = (value: string) => {
    setHasUserInteracted(true);
    const volume = parseFloat(value) || 0;
    setAvailableVolume(volume);
    
    validateAndWarn(containerType || '', volume, true);
    
    // Sauvegarder dans le store
    if (containerType && volume > 0) {
      setContainerDetails(containerType as '20' | '40', volume, 0.1);
    }
  };

  // Navigation vers l'étape suivante
  const handleContinue = () => {
    if (validateAndWarn(containerType || '', availableVolume) && containerType) {
      setContainerDetails(containerType, availableVolume, 0.1);
      router.push('/funnel/propose/minimum-volume');
    }
  };

  const isValid = errors.length === 0 && containerType && availableVolume > 0;

  return (
    <div className="space-y-16">
      {/* 1. Type de conteneur - Toujours affiché */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-10">
          <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab']">
            Quelle est la taille de votre conteneur ?
          </h1>
          <HelpBlock 
            content={
              <div>
                <p className="text-gray-800 text-sm mb-3 font-medium">
                  Pourquoi "volume exploitable" ?
                </p>
                <p className="text-gray-700 text-xs mb-4 leading-relaxed">
                  Le volume total d'un conteneur n'est jamais entièrement utilisable. 
                  Les contraintes de forme, de chargement et de sécurité réduisent l'espace réellement disponible.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">20 pieds :</span>
                    <span>33 m³ total → <strong>25 m³ exploitable</strong></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">40 pieds :</span>
                    <span>67 m³ total → <strong>50 m³ exploitable</strong></span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
        
        <CardRadioGroup
          name="containerType"
          options={containerOptions}
          value={containerType}
          onChange={handleContainerTypeChange}
        />
      </motion.div>

      {/* 2. Volume disponible - Apparaît après sélection du type */}
      <AnimatePresence>
        {showVolumeInput && (
          <motion.div
            id="volume-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab']">
                Combien de m³ exploitable vous reste-t-il ?
              </h1>
              <HelpBlock 
                content={
                  <div>
                    <p className="text-gray-800 text-sm mb-3 font-medium">
                      📦 Exemples pour vous aider
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Électroménager standard :</p>
                        <ul className="text-xs text-gray-600 space-y-1 ml-2">
                          <li>• <strong>Machine à laver</strong> : ~0.8 m³</li>
                          <li>• <strong>Lave-vaisselle</strong> : ~0.6 m³</li>
                          <li>• <strong>Four micro-ondes</strong> : ~0.05 m³</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Mobilier courant :</p>
                        <ul className="text-xs text-gray-600 space-y-1 ml-2">
                          <li>• <strong>Carton de déménagement standard</strong> : ~0.1 m³</li>
                          <li>• <strong>Matelas 140x190</strong> : ~0.3 m³</li>
                          <li>• <strong>Chaise de bureau classique</strong> : ~0.2 m³</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Véhicules :</p>
                        <ul className="text-xs text-gray-600 space-y-1 ml-2">
                          <li>• <strong>Peugeot 208</strong> : ~11 m³</li>
                          <li>• <strong>Scooter 125cc</strong> : ~1.5 m³</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>

            <div className="space-y-4">
              {/* Conseil déplacé au-dessus du champ */}
              <div className="text-sm text-gray-700 mb-10" >
                <span>Dans le doute, choisissez toujours une valeur légèrement inférieure.</span>
              </div>

              <VolumeSelector
                label="Volume disponible (m³)"
                value={availableVolume}
                onChange={(value) => handleAvailableVolumeChange(value.toString())}
                placeholder="Ex: 1"
                min={0}
                max={containerType ? containerSpecs[containerType].maxAvailable : 50}
                step={0.5}
                unit="m³"
              />

              {/* Erreurs spécifiques au volume - affichées directement sous le champ */}
              {errors.filter(error => 
                error.includes('volume') || 
                error.includes('Volume') ||
                error.includes('supérieur') ||
                error.includes('important')
              ).map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}

              {/* Messages d'avertissement pour le volume - déplacés sous le composant */}
              {warnings.filter(warning => 
                warning.includes('volume') || 
                warning.includes('Volume') ||
                warning.includes('important') ||
                warning.includes('vérifiez')
              ).length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">💡 À vérifier :</p>
                      <ul className="space-y-1">
                        {warnings.filter(warning => 
                          warning.includes('volume') || 
                          warning.includes('Volume') ||
                          warning.includes('important') ||
                          warning.includes('vérifiez')
                        ).map((warning, index) => (
                          <li key={index} className="text-yellow-700">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Messages d'erreur - excluant les erreurs de volume qui sont affichées sous le champ */}
      {errors.filter(error => 
        !error.includes('volume') && 
        !error.includes('Volume') &&
        !error.includes('supérieur') &&
        !error.includes('important')
      ).length > 0 && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">⚠️ Veuillez corriger :</p>
              <ul className="space-y-1">
                {errors.filter(error => 
                  !error.includes('volume') && 
                  !error.includes('Volume') &&
                  !error.includes('supérieur') &&
                  !error.includes('important')
                ).map((error, index) => (
                  <li key={index} className="text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'avertissement généraux - excluant ceux du volume */}
      {warnings.filter(warning => 
        !warning.includes('volume') && 
        !warning.includes('Volume') &&
        !warning.includes('important') &&
        !warning.includes('vérifiez')
      ).length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">💡 À vérifier :</p>
              <ul className="space-y-1">
                {warnings.filter(warning => 
                  !warning.includes('volume') && 
                  !warning.includes('Volume') &&
                  !warning.includes('important') &&
                  !warning.includes('vérifiez')
                ).map((warning, index) => (
                  <li key={index} className="text-yellow-700">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 