'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import FloatingInput from '@/components/ui/FloatingInput';
import PhoneInput from '@/components/ui/PhoneInput';


export default function ContactStep() {
  const router = useRouter();
  const { formData, setContact } = useSearchStore();
  
  const [firstName, setFirstName] = useState(formData.contact.firstName);
  const [email, setEmail] = useState(formData.contact.email);
  const [phone, setPhone] = useState(formData.contact.phone || '');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirection si étapes précédentes incomplètes
  useEffect(() => {
    // Vérifier que les étapes essentielles sont complètes
    if (!formData.departure.country || !formData.arrival.country) {
      router.push('/funnel/search/locations');
      return;
    }
    if (formData.volumeNeeded.neededVolume <= 0) {
      router.push('/funnel/search/volume-needed');
      return;
    }
    if (formData.budget.acceptsFees === null) {
      router.push('/funnel/search/budget');
      return;
    }
  }, [formData, router]);

  // Validation en temps réel
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'Le prénom est obligatoire';
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'Le prénom doit faire au moins 2 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          newErrors.firstName = 'Le prénom contient des caractères invalides';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'L\'email est obligatoire';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements avec sauvegarde automatique
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    validateField('firstName', value);
    setContact({ firstName: value });
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField('email', value);
    setContact({ email: value });
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setContact({ phone: value });
  };

  const isValid = firstName.trim().length >= 2 && 
                 /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                 Object.keys(errors).length === 0;

  return (
    <div className="space-y-8">
      {/* Titre principal */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-900 font-['Roboto_Slab'] mb-4">
          Vos coordonnées
        </h2>
        <p className="text-gray-600">
          Pour que les personnes avec de l'espace puissent vous contacter
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Message de confidentialité */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">🔒 Données protégées</p>
              <p className="text-green-700">
                Vos coordonnées ne sont partagées qu'avec les personnes réellement intéressées. 
                Aucune utilisation commerciale.
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="space-y-6">
          {/* Prénom */}
          <FloatingInput
            label="Prénom *"
            type="text"
            name="firstName"
            value={firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            error={errors.firstName}
          />

          {/* Email */}
          <FloatingInput
            label="Email *"
            type="email"
            name="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={errors.email}
          />

          {/* Téléphone avec indicatifs pays */}
          <PhoneInput
            label="Téléphone (optionnel)"
            value={phone}
            onChange={handlePhoneChange}
          />
          
          {phone && (
            <p className="text-sm text-gray-500 -mt-4">
              Le téléphone facilite les échanges mais n'est pas obligatoire
            </p>
          )}
        </div>
      </motion.div>

    </div>
  );
} 