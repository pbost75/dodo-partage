'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Edit3, Send, MapPin, Calendar, Package, Mail, Heart, FileText } from 'lucide-react';
import { useProposeStore } from '@/store/proposeStore';
import Button from '@/components/ui/Button';

export default function RecapStep() {
  const router = useRouter();
  const { formData, reset } = useProposeStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mapping des IDs d'objets vers les libellés
  const itemLabels: Record<string, string> = {
    'documents': 'Documents & paperasse',
    'clothes': 'Vêtements & linge',
    'electronics': 'Électronique',
    'kitchenware': 'Ustensiles de cuisine',
    'decoration': 'Décoration & objets',
    'sports': 'Équipement de sport',
    'small-furniture': 'Petits meubles',
    'appliances': 'Électroménager',
    'large-furniture': 'Gros mobilier',
    'vehicles': 'Véhicules'
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Navigation vers une étape pour modification
  const handleEditStep = (stepPath: string) => {
    router.push(stepPath);
  };

  // Soumission finale
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Ici on ferait l'appel API pour sauvegarder l'annonce
      // await submitAnnouncement(formData);
      
      // Simulation d'API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      
      // Redirection vers une page de confirmation ou reset
      setTimeout(() => {
        reset();
        router.push('/'); // ou vers une page de confirmation
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setIsSubmitting(false);
    }
  };

  // État de soumission réussie
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            🎉 Annonce publiée !
          </h2>
          <p className="text-gray-600 text-lg">
            Votre offre de partage est maintenant en ligne
          </p>
          <p className="text-sm text-gray-500">
            Vous allez recevoir un email de confirmation avec le lien de gestion de votre annonce
          </p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <h3 className="font-semibold text-green-900 mb-2">📧 Prochaines étapes</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Vérifiez votre email dans quelques minutes</li>
              <li>• Cliquez sur le lien pour valider votre annonce</li>
              <li>• Les intéressés pourront vous contacter dès validation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Titre principal */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Récapitulatif de votre annonce
          </h2>
        </div>
        <p className="text-gray-600">
          Vérifiez vos informations avant publication
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 1. Itinéraire */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Itinéraire</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/locations')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium text-gray-900">Départ</div>
                <div className="text-gray-600">{formData.departure.displayName}</div>
              </div>
            </div>
            <div className="ml-1.5 w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium text-gray-900">Arrivée</div>
                <div className="text-gray-600">{formData.arrival.displayName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Date d'expédition */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Date d'expédition</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/shipping-date')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="text-gray-900 font-medium">
            📅 {formatDate(formData.shippingDate)}
          </div>
        </div>

        {/* 3. Conteneur */}
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Conteneur</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/container-details')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium text-gray-900">{formData.container.type} pieds</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Volume disponible</div>
              <div className="font-medium text-gray-900">{formData.container.availableVolume} m³</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Volume minimum</div>
              <div className="font-medium text-gray-900">{formData.container.minimumVolume} m³</div>
            </div>
          </div>
        </div>

        {/* 4. Objets acceptés */}
        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Objets acceptés</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/allowed-items')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.allowedItems.map((itemId) => (
              <span
                key={itemId}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {itemLabels[itemId] || itemId}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Type d'offre */}
        <div className="bg-white border-2 border-pink-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Type de partage</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/offer-type')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {formData.offerType === 'free' ? '🤝' : '💶'}
            </span>
            <div>
              <div className="font-medium text-gray-900">
                {formData.offerType === 'free' ? 'Partage gratuit' : 'Avec participation aux frais'}
              </div>
              <div className="text-sm text-gray-600">
                {formData.offerType === 'free' 
                  ? 'Par solidarité et convivialité' 
                  : 'Contribution financière demandée'
                }
              </div>
            </div>
          </div>
        </div>

        {/* 6. Texte d'annonce */}
        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Annonce</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/announcement-text')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="whitespace-pre-wrap text-gray-900 text-sm leading-relaxed">
              {formData.announcementText}
            </div>
          </div>
        </div>

        {/* 7. Contact */}
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditStep('/funnel/propose/contact')}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Modifier
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {formData.contact.firstName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{formData.contact.firstName}</div>
              <div className="text-gray-600">{formData.contact.email}</div>
              {formData.contact.phone && (
                <div className="text-gray-600 text-sm">📞 {formData.contact.phone}</div>
              )}
            </div>
          </div>
        </div>

        {/* Prévisualisation finale */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Aperçu de votre annonce publique</h3>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {formData.contact.firstName[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{formData.contact.firstName}</span>
                  <span className="text-sm text-gray-600">
                    • {formData.offerType === 'free' ? 'Partage gratuit' : 'Avec participation'}
                  </span>
                </div>
                
                <div className="text-sm text-blue-600 mb-2">
                  {formData.departure.displayName} → {formData.arrival.displayName}
                </div>
                
                <div className="text-sm text-gray-800 leading-relaxed mb-3">
                  {formData.announcementText.length > 100 
                    ? formData.announcementText.substring(0, 100) + '...' 
                    : formData.announcementText
                  }
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    📦 {formData.container.type} pieds
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    📏 {formData.container.availableVolume} m³
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    📅 {new Date(formData.shippingDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions et publication */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-900">📋 Conditions de publication</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Je confirme que les informations fournies sont exactes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>J'accepte d'être contacté par des personnes intéressées</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Je m'engage à répondre aux demandes dans les plus brefs délais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>J'accepte les conditions d'utilisation de DodoPartage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bouton de publication */}
        <div className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            fullWidth
            size="lg"
            icon={isSubmitting ? 
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> :
              <Send className="w-5 h-5" />
            }
            iconPosition="right"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier mon annonce 🚀'}
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-3">
            Votre annonce sera visible après validation par email
          </p>
        </div>
      </motion.div>
    </div>
  );
} 