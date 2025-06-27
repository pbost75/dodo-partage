'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { motion } from 'framer-motion';
import { useProposeStore } from '@/store/proposeStore';
import FloatingSelect from '@/components/ui/FloatingSelect';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import PostalCodeAutocomplete from '@/components/ui/PostalCodeAutocomplete';
import { CitySuggestion, getPostalCodeByCity, getCityByPostalCode } from '@/utils/cityAutocomplete';

// Options des pays identiques à Dodomove
const countryOptions = [
  { value: 'France', label: 'France' },
  { value: 'Réunion', label: 'Réunion' },
  { value: 'Martinique', label: 'Martinique' },
  { value: 'Guadeloupe', label: 'Guadeloupe' },
  { value: 'Guyane', label: 'Guyane' },
  { value: 'Mayotte', label: 'Mayotte' },
  { value: 'Nouvelle-Calédonie', label: 'Nouvelle-Calédonie' },
  { value: 'Polynésie française', label: 'Polynésie française' },
  { value: 'Maurice', label: 'Maurice' },
];

export default function LocationsPage() {
  const router = useSmartRouter();
  const { formData: storeData, setDeparture, setArrival } = useProposeStore();
  
  // Ref pour l'autoscroll
  const arrivalSectionRef = useRef<HTMLDivElement>(null);

  // État local du formulaire
  const [formData, setFormData] = useState({
    departureCountry: storeData.departure.country || 'France',
    departureCity: storeData.departure.city || '',
    departurePostalCode: storeData.departure.postalCode || '',
    arrivalCountry: storeData.arrival.country || '',
    arrivalCity: storeData.arrival.city || '',
    arrivalPostalCode: storeData.arrival.postalCode || '',
  });

  // Erreurs de validation
  const [errors, setErrors] = useState({
    departureCountry: '',
    departureCity: '',
    departurePostalCode: '',
    arrivalCountry: '',
    arrivalCity: '',
    arrivalPostalCode: '',
  });

  // Détermine si on doit afficher le bloc d'arrivée
  const shouldShowArrival = formData.departureCity !== '';

  // Vérifier si le formulaire est complet et mettre à jour le store
  useEffect(() => {
    const allFieldsFilled = 
      formData.departureCountry !== '' && 
      formData.departureCity !== '' && 
      formData.departurePostalCode !== '' &&
      formData.arrivalCountry !== '' && 
      formData.arrivalCity !== '' &&
      formData.arrivalPostalCode !== '';

    // Vérifier que les pays ne sont pas identiques (comme dans Dodomove)
    const sameCountry = formData.departureCountry !== '' && 
                       formData.arrivalCountry !== '' && 
                       formData.departureCountry === formData.arrivalCountry;
    
    // Mettre à jour le départ
    setDeparture({
      country: formData.departureCountry,
      city: formData.departureCity,
      postalCode: formData.departurePostalCode,
      isComplete: formData.departureCountry !== '' && formData.departureCity !== '' && formData.departurePostalCode !== ''
    });

    // Mettre à jour l'arrivée (pas complète si même pays que le départ)
    setArrival({
      country: formData.arrivalCountry,
      city: formData.arrivalCity,
      postalCode: formData.arrivalPostalCode,
      isComplete: formData.arrivalCountry !== '' && formData.arrivalCity !== '' && formData.arrivalPostalCode !== '' && !sameCountry
    });
  }, [formData, setDeparture, setArrival]);

  // Gérer les changements dans les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur lors de la saisie
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Gérer la sélection d'une ville de départ avec autoscroll
  const handleDepartureCitySelect = (city: CitySuggestion) => {
    setFormData(prev => ({
      ...prev,
      departureCity: city.name,
      departurePostalCode: city.postalCode || '' // Auto-remplir le code postal
    }));

    // Autoscroll vers le bloc d'arrivée après un délai pour l'animation
    setTimeout(() => {
      if (arrivalSectionRef.current) {
        arrivalSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 300);
  };

  // Gérer la sélection d'un code postal de départ
  const handleDeparturePostalCodeSelect = (suggestion: CitySuggestion) => {
    setFormData(prev => ({
      ...prev,
      departurePostalCode: suggestion.postalCode || '',
      departureCity: suggestion.name // Auto-remplir la ville
    }));
  };

  // Gérer la sélection d'une ville d'arrivée
  const handleArrivalCitySelect = (city: CitySuggestion) => {
    setFormData(prev => ({
      ...prev,
      arrivalCity: city.name,
      arrivalPostalCode: city.postalCode || '' // Auto-remplir le code postal
    }));
  };

  // Gérer la sélection d'un code postal d'arrivée
  const handleArrivalPostalCodeSelect = (suggestion: CitySuggestion) => {
    setFormData(prev => ({
      ...prev,
      arrivalPostalCode: suggestion.postalCode || '',
      arrivalCity: suggestion.name // Auto-remplir la ville
    }));
  };

  // Gérer les changements dans les selects de pays
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string } }, field: 'departureCountry' | 'arrivalCountry') => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validation spéciale pour éviter le même pays de départ et d'arrivée
    if (field === 'arrivalCountry') {
      // Vérifier si le pays d'arrivée est identique au pays de départ
      if (value && value === formData.departureCountry) {
        setErrors(prev => ({
          ...prev,
          arrivalCountry: `${value} est votre pays de départ. Veuillez choisir une destination différente.`
        }));
      } else {
        // Effacer l'erreur si le pays est valide
        setErrors(prev => ({
          ...prev,
          arrivalCountry: ''
        }));
      }
    } else {
      // Pour le pays de départ, effacer l'erreur normalement
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
      
      // Si on change le pays de départ, vérifier s'il faut aussi mettre à jour l'erreur d'arrivée
      if (value && value === formData.arrivalCountry) {
        setErrors(prev => ({
          ...prev,
          arrivalCountry: `${formData.arrivalCountry} est maintenant votre pays de départ. Veuillez choisir une destination différente.`
        }));
      } else if (formData.arrivalCountry && errors.arrivalCountry.includes('est votre pays de départ')) {
        // Effacer l'erreur d'arrivée si elle concernait le conflit de pays
        setErrors(prev => ({
          ...prev,
          arrivalCountry: ''
        }));
      }
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    // Vérification du pays identique (même logique que Dodomove)
    const sameCountryError = formData.arrivalCountry && formData.departureCountry && 
      formData.arrivalCountry === formData.departureCountry ? 
      `${formData.arrivalCountry} est votre pays de départ. Veuillez choisir une destination différente.` : '';

    const newErrors = {
      departureCountry: !formData.departureCountry ? 'Le pays de départ est requis' : '',
      departureCity: !formData.departureCity ? 'La ville de départ est requise' : '',
      departurePostalCode: !formData.departurePostalCode ? 'Le code postal de départ est requis' : '',
      arrivalCountry: !formData.arrivalCountry ? 'Le pays d\'arrivée est requis' : sameCountryError,
      arrivalCity: !formData.arrivalCity ? 'La ville d\'arrivée est requise' : '',
      arrivalPostalCode: !formData.arrivalPostalCode ? 'Le code postal d\'arrivée est requis' : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Les données sont déjà mises à jour via useEffect
      // On peut directement naviguer vers l'étape suivante
      router.push('/funnel/propose/shipping-date');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* TITRE 1 - Style identique Dodomove */}
      <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
        🛫 D'où part votre conteneur ?
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pays de départ */}
        <div>
          <FloatingSelect
            label="Pays"
            id="departureCountry"
            options={countryOptions}
            value={formData.departureCountry}
            onChange={(e) => handleCountryChange(e, 'departureCountry')}
            error={errors.departureCountry}
            required
          />
        </div>

        {/* Ville et Code postal de départ - côte à côte */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-12">
          <CityAutocomplete
            label="Ville"
            name="departureCity"
            value={formData.departureCity}
            onChange={handleChange}
            onCitySelect={handleDepartureCitySelect}
            country={formData.departureCountry}
            error={errors.departureCity}
            required
          />
          <PostalCodeAutocomplete
            label="Code postal"
            name="departurePostalCode"
            value={formData.departurePostalCode}
            onChange={handleChange}
            onPostalCodeSelect={handleDeparturePostalCodeSelect}
            country={formData.departureCountry}
            error={errors.departurePostalCode}
            required
          />
        </div>

        {/* BLOC D'ARRIVÉE - Apparition progressive */}
        {shouldShowArrival && (
          <motion.div
            ref={arrivalSectionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-16"
          >
            {/* TITRE 2 - Style identique Dodomove */}
            <h1 className="text-3xl font-bold mb-10 text-blue-900 font-['Roboto_Slab']">
              🏝️ Où arrive votre conteneur ?
            </h1>

            {/* Pays d'arrivée */}
            <div className="mb-6">
              <FloatingSelect
                label="Pays"
                id="arrivalCountry"
                options={countryOptions}
                value={formData.arrivalCountry}
                onChange={(e) => handleCountryChange(e, 'arrivalCountry')}
                error={errors.arrivalCountry}
                required
              />
            </div>

            {/* Ville et Code postal d'arrivée - côte à côte */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-12">
              <CityAutocomplete
                label="Ville"
                name="arrivalCity"
                value={formData.arrivalCity}
                onChange={handleChange}
                onCitySelect={handleArrivalCitySelect}
                country={formData.arrivalCountry}
                error={errors.arrivalCity}
                required
              />
              <PostalCodeAutocomplete
                label="Code postal"
                name="arrivalPostalCode"
                value={formData.arrivalPostalCode}
                onChange={handleChange}
                onPostalCodeSelect={handleArrivalPostalCodeSelect}
                country={formData.arrivalCountry}
                error={errors.arrivalPostalCode}
                required
              />
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
} 