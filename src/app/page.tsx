'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Filter, X, Bell, Plus, BellPlus } from 'lucide-react';
import FilterSection from '@/components/partage/FilterSection';
import AnnouncementCard from '@/components/partage/AnnouncementCard';
import AnnouncementCardV2 from '@/components/partage/AnnouncementCardV2';
import AlertModal from '@/components/partage/AlertModal';
import ChoiceModal from '@/components/partage/ChoiceModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MonthPicker from '@/components/ui/MonthPicker';
import CountrySelect from '@/components/ui/CountrySelect';
import { useRouter } from 'next/navigation';

interface FilterState {
  type: string;
  volumes: string[];
}

export default function HomePage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'offer',
    volumes: []
  });
  const [displayedCount, setDisplayedCount] = useState(4); // Afficher 4 annonces par défaut

  // États pour la barre de recherche
  const [searchDeparture, setSearchDeparture] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [searchDates, setSearchDates] = useState<string[]>([]);

  // États pour les filtres appliqués (ne changent qu'au clic sur "Rechercher")
  const [appliedDeparture, setAppliedDeparture] = useState<string>('');
  const [appliedDestination, setAppliedDestination] = useState<string>('');
  const [appliedDates, setAppliedDates] = useState<string[]>([]);

  // Options des pays avec leurs emojis
  const countryOptions = [
    { value: '', label: 'Sélectionnez un lieu', emoji: '' },
    { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷' },
    { value: 'reunion', label: 'Réunion', emoji: '🌺' },
    { value: 'martinique', label: 'Martinique', emoji: '🌴' },
    { value: 'guadeloupe', label: 'Guadeloupe', emoji: '🏝️' },
    { value: 'guyane', label: 'Guyane', emoji: '🌿' },
    { value: 'mayotte', label: 'Mayotte', emoji: '🐋' },
    { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie', emoji: '🏖️' }
  ];

  // Fonction pour normaliser les noms de lieux
  const normalizeLocation = (location: string): string => {
    const locationMap: Record<string, string[]> = {
      'france': ['france métropolitaine', 'métropole', 'hexagone'],
      'reunion': ['réunion', 'la réunion'],
      'martinique': ['martinique'],
      'guadeloupe': ['guadeloupe'],
      'guyane': ['guyane', 'guyane française'],
      'mayotte': ['mayotte'],
      'nouvelle-caledonie': ['nouvelle-calédonie', 'nouvelle caledonie', 'nouméa']
    };

    const normalizedInput = location.toLowerCase();
    for (const [key, variations] of Object.entries(locationMap)) {
      if (variations.some(variation => normalizedInput.includes(variation))) {
        return key;
      }
    }
    return normalizedInput;
  };

  // Données d'exemple pour les annonces
  const sampleAnnouncements = [
    {
      id: '1',
      type: 'offer' as const,
      title: 'Conteneur partagé vers la Réunion',
      departure: 'France métropolitaine',
      departureCity: 'Le Havre (76600)',
      arrival: 'Réunion',
      arrivalCity: 'Port-Est (97470)',
      volume: '2.5 m³',
      volumeCategory: '1-3',
      date: '15 mars 2024',
      price: '150€',
      items: ['Mobilier', 'Électroménager', 'Cartons'],
      author: 'Jean',
      publishedAt: 'Publié il y a 2 heures',
      description: 'Bonjour ! Je fais un déménagement vers Saint-Denis de la Réunion et j\'ai encore de la place disponible dans mon conteneur 20 pieds. J\'ai réservé environ 8m³ mais je n\'utilise que 5.5m³, donc il me reste 2.5m³ disponibles. Le conteneur partira du port du Havre le 15 mars avec arrivée prévue début avril. Je peux prendre du mobilier léger, de l\'électroménager standard, des cartons et des affaires personnelles. Tout sera bien protégé avec du film plastique et des sangles. Je m\'occupe de toute la logistique côté français, vous n\'avez qu\'à déposer vos affaires à mon garde-meuble près de Rouen. N\'hésitez pas à me contacter pour organiser une visite et voir l\'espace disponible.'
    },
    {
      id: '2',
      type: 'request' as const,
      title: 'Recherche place pour véhicule moto',
      departure: 'France métropolitaine',
      departureCity: 'Marseille (Port)',
      arrival: 'Martinique',
      arrivalCity: 'Fort-de-France',
      volume: '3 m³',
      volumeCategory: '3-5',
      date: 'Avril 2024',
      items: ['Véhicule', 'Outillage', 'Équipement'],
      author: 'Marie',
      publishedAt: 'Publié il y a 5 heures',
      description: 'Salut tout le monde ! Je cherche une place dans un conteneur pour expédier ma moto Yamaha MT-07 vers Fort-de-France en Martinique. C\'est une moto de 180kg environ, elle rentre dans 3m³ avec quelques outils et équipements de moto. Je suis très flexible sur les dates, n\'importe quand en avril ou mai ça me va parfaitement. J\'ai déjà fait le nécessaire pour les papiers douanes et j\'ai l\'habitude des expéditions. Je peux me déplacer partout en France métropolitaine pour déposer la moto. Si vous avez de la place et que ça vous intéresse, on peut discuter du tarif. Je suis quelqu\'un de sérieux et ponctuel, références disponibles !'
    },
    {
      id: '3',
      type: 'offer' as const,
      title: 'Groupage Guadeloupe - Place disponible',
      departure: 'Bordeaux',
      departureCity: 'Bordeaux (33000)',
      arrival: 'Guadeloupe',
      arrivalCity: 'Pointe-à-Pitre',
      volume: '1.8 m³',
      volumeCategory: '1-3',
      date: '28 février 2024',
      price: '120€',
      items: ['Cartons', 'Effets personnels', 'Livres'],
      author: 'Pierre',
      publishedAt: 'Publié il y a 1 jour',
      description: 'Hello ! J\'organise un groupage vers Pointe-à-Pitre en Guadeloupe pour fin février. Mon conteneur part du port de Bordeaux le 28 février avec une arrivée prévue mi-mars. J\'ai encore 1.8m³ de disponible, parfait pour des cartons d\'affaires personnelles, des livres, des vêtements, du matériel informatique léger, etc. Attention, pas d\'électroménager lourd ni de mobilier volumineux pour cet envoi. Je propose un tarif de 67€/m³ soit 120€ pour les 1.8m³ restants. Le conteneur est assuré tous risques et j\'ai déjà fait plusieurs expéditions sans problème. Récupération possible dans tout le Sud-Ouest ou livraison directe à mon entrepôt près de Bordeaux.'
    },
    {
      id: '4',
      type: 'offer' as const,
      title: 'Conteneur familial vers Mayotte',
      departure: 'Lyon',
      departureCity: 'Lyon (69000)',
      arrival: 'Mayotte',
      arrivalCity: 'Longoni',
      volume: '4.2 m³',
      volumeCategory: '3-5',
      date: '20 mars 2024',
      price: '280€',
      items: ['Mobilier', 'Électroménager', 'Cartons', 'Jouets'],
      author: 'Sophie',
      publishedAt: 'Publié il y a 3 heures',
      description: 'Coucou ! Ma famille et moi déménageons vers Mamoudzou à Mayotte pour le travail de mon mari. Nous avons réservé un conteneur 20 pieds qui part de Marseille le 20 mars. Après avoir calculé, il nous reste environ 4.2m³ de place libre que nous souhaitons partager pour réduire les coûts. Nous acceptons du mobilier (pas trop lourd), de l\'électroménager, des cartons d\'affaires personnelles, des jouets pour enfants, des vêtements, etc. Notre conteneur est assuré et nous avons fait appel à un professionnel pour l\'emballage. Le trajet dure environ 4-5 semaines avec escale. Nous pouvons récupérer vos affaires dans la région lyonnaise ou vous pouvez les déposer directement chez notre transitaire à Marseille. Prix négociable selon le volume exact !'
    },
    {
      id: '5',
      type: 'request' as const,
      title: 'Besoin place pour matériel médical',
      departure: 'Paris',
      departureCity: 'Paris (75000)',
      arrival: 'Guyane',
      arrivalCity: 'Dégrad des Cannes',
      volume: '1.5 m³',
      volumeCategory: '1-3',
      date: 'Mai 2024',
      items: ['Équipement', 'Appareils électroniques'],
      author: 'Dr. Martin',
      publishedAt: 'Publié il y a 6 heures',
      description: 'Bonjour, je suis médecin et je m\'installe en Guyane française à Cayenne pour ouvrir un cabinet. J\'ai besoin d\'expédier du matériel médical spécialisé : échographe portable, matériel de consultation, quelques appareils électroniques médicaux. Le tout représente environ 1.5m³ et c\'est du matériel fragile et précieux qui nécessite un transport soigné. J\'ai toutes les autorisations nécessaires pour l\'exportation de matériel médical. Je cherche quelqu\'un de sérieux avec un conteneur assuré et qui prend soin des affaires. Je suis flexible sur les dates, n\'importe quand entre mai et juillet. Budget jusqu\'à 200€ pour ce volume. Je peux gérer la récupération et l\'emballage spécialisé de mon côté.'
    },
    {
      id: '6',
      type: 'offer' as const,
      title: 'Retour Martinique vers France',
      departure: 'Martinique',
      departureCity: 'Fort-de-France (97200)',
      arrival: 'France métropolitaine',
      arrivalCity: 'Le Havre (76600)',
      volume: '3.5 m³',
      volumeCategory: '3-5',
      date: '10 avril 2024',
      price: '200€',
      items: ['Mobilier', 'Cartons', 'Effets personnels'],
      author: 'Claire',
      publishedAt: 'Publié il y a 8 heures',
      description: 'Salut ! Situation un peu particulière : je rentre en métropole après 3 ans en Martinique et j\'ai un conteneur qui part de Fort-de-France vers Le Havre le 10 avril. J\'ai calculé large et il me reste 3.5m³ disponibles. Si ça peut aider quelqu\'un qui veut récupérer des affaires ou faire venir de la famille, pourquoi pas ! Je peux prendre du mobilier léger, des cartons, des souvenirs, de l\'artisanat local, des produits du terroir bien emballés (rhum, épices, etc.), des vêtements. Pas d\'électroménager ou de trucs trop lourds par contre. Le conteneur arrivera vers début mai en métropole. Je propose 57€/m³ soit 200€ pour tout l\'espace restant, ou possibilité de partager si vous avez moins. Récupération possible dans tout le centre de la Martinique.'
    },
    {
      id: '7',
      type: 'offer' as const,
      title: 'Groupage économique vers La Réunion',
      departure: 'Marseille',
      departureCity: 'Marseille (13000)',
      arrival: 'Réunion',
      arrivalCity: 'Port-Est (97470)',
      volume: '5.8 m³',
      volumeCategory: '5-10',
      date: '25 mars 2024',
      price: '350€',
      items: ['Cartons', 'Effets personnels', 'Mobilier', 'Électroménager'],
      author: 'Thomas',
      publishedAt: 'Publié il y a 12 heures',
      description: 'Hey ! Je monte un groupage économique vers Saint-Pierre à La Réunion. J\'ai négocié un super tarif avec un transitaire pro et j\'ai réservé un conteneur 20 pieds qui part de Marseille le 25 mars. Après ma propre cargaison, il me reste 5.8m³ à partager entre plusieurs personnes pour faire baisser les coûts de tout le monde. J\'accepte un peu de tout : cartons d\'affaires perso, petit mobilier, électroménager pas trop lourd, matériel informatique, livres, vêtements, etc. Seule condition : tout doit être bien emballé et étiqueté. J\'ai l\'habitude, c\'est mon 4ème groupage ! Le conteneur est assuré tous risques et le transitaire est très fiable. Tarif de 60€/m³ négociable selon le volume. Récupération dans toute la région PACA ou livraison directe au port. Arrivée prévue mi-avril à La Réunion.'
    },
    {
      id: '8',
      type: 'request' as const,
      title: 'Recherche espace pour outils professionnels',
      departure: 'Lyon',
      departureCity: 'Lyon (69000)',
      arrival: 'Nouvelle-Calédonie',
      arrivalCity: 'Nouméa (98800)',
      volume: '2.8 m³',
      volumeCategory: '1-3',
      date: 'Juin 2024',
      items: ['Outillage', 'Équipement'],
      author: 'Julien',
      publishedAt: 'Publié il y a 4 heures',
      description: 'Salut les amis ! Je suis artisan plombier et je pars m\'installer en Nouvelle-Calédonie à Nouméa pour rejoindre une entreprise locale. J\'ai besoin d\'expédier mes outils professionnels : caisse à outils complète, matériel de soudure, tuyauterie, outillage électroportatif, etc. C\'est du matériel de qualité que j\'ai accumulé pendant 15 ans de métier et qui vaut cher, donc je cherche quelqu\'un de sérieux avec un conteneur bien assuré. Le tout fait environ 2.8m³ une fois bien rangé dans des caisses solides. Je peux être flexible sur les dates, juin ou juillet ça m\'arrange. Budget jusqu\'à 300€ pour ce transport. Si vous avez de la place dans un conteneur vers Nouméa ou même vers n\'importe quel port de Nouvelle-Calédonie, contactez-moi ! Je peux me déplacer dans toute la région Rhône-Alpes pour déposer mes affaires.'
    },
    {
      id: '9',
      type: 'offer' as const,
      title: 'Déménagement complet vers les Antilles',
      departure: 'Toulouse',
      departureCity: 'Toulouse (31000)',
      arrival: 'Martinique',
      arrivalCity: 'Fort-de-France (97200)',
      volume: '6.5 m³',
      volumeCategory: '5-10',
      date: '12 juin 2024',
      price: '390€',
      items: ['Mobilier', 'Électroménager', 'Cartons', 'Effets personnels', 'Livres', 'Appareils électroniques'],
      author: 'Isabelle',
      publishedAt: 'Publié il y a 4 heures',
      description: 'Bonjour à tous ! Je propose de partager les frais de mon conteneur 20 pieds pour un déménagement complet vers la Martinique. Mon mari a obtenu une mutation à Fort-de-France et nous déménageons en famille avec nos deux enfants. J\'ai encore pas mal de place disponible (environ 6.5 m³) dans mon conteneur qui partira de Toulouse mi-juin via le port de Bordeaux. C\'est parfait si vous avez du mobilier, des appareils électroménagers, des cartons ou même des effets personnels à expédier. Le conteneur est sécurisé avec assurance tous risques et j\'ai fait appel à un déménageur professionnel agréé pour les DOM-TOM. Je peux également prendre en charge les démarches administratives si vous le souhaitez car j\'ai l\'habitude maintenant. Les objets sont bien protégés pendant le transport maritime qui dure environ 3 semaines. N\'hésitez pas à me contacter pour plus d\'informations sur les modalités pratiques, les tarifs exacts selon le volume ou si vous avez des questions spécifiques sur le processus d\'expédition. Je suis très flexible sur les dates de récupération de vos affaires avant le départ et je peux me déplacer dans tout le Sud-Ouest.'
    },
    {
      id: '10',
      type: 'request' as const,
      title: 'Étudiant cherche place pour ses affaires',
      departure: 'France métropolitaine',
      departureCity: 'Nantes (44000)',
      arrival: 'Guadeloupe',
      arrivalCity: 'Pointe-à-Pitre (97110)',
      volume: '1.2 m³',
      volumeCategory: '1-3',
      date: 'Août 2024',
      items: ['Cartons', 'Livres', 'Effets personnels', 'Appareils électroniques'],
      author: 'Emma',
      publishedAt: 'Publié il y a 7 heures',
      description: 'Coucou ! Je suis étudiante en master et je pars faire mon stage de fin d\'études en Guadeloupe pendant 6 mois. J\'aimerais emporter quelques affaires personnelles : mes livres de cours, mon ordinateur portable, des vêtements pour 6 mois, quelques souvenirs de famille, mon appareil photo, etc. Le tout tiendrait dans 3-4 gros cartons soit environ 1.2m³. Je cherche quelqu\'un de sympa qui aurait un peu de place dans son conteneur vers Pointe-à-Pitre. Comme je suis étudiante, mon budget est serré mais je peux aller jusqu\'à 100€ pour ce petit volume. Je suis super flexible sur les dates, tout l\'été me va ! Je peux récupérer les affaires partout en France métropolitaine pendant les vacances universitaires. Si quelqu\'un peut m\'aider, ce serait génial ! J\'ai des références de mes précédentes colocations et je suis quelqu\'un de sérieux et reconnaissant.'
    },
    {
      id: '11',
      type: 'offer' as const,
      title: 'Espace disponible vers Mayotte',
      departure: 'Paris',
      departureCity: 'Paris (75000)',
      arrival: 'Mayotte',
      arrivalCity: 'Longoni (97615)',
      volume: '2.1 m³',
      volumeCategory: '1-3',
      date: '5 mai 2024',
      price: '145€',
      items: ['Cartons', 'Effets personnels', 'Livres', 'Vêtements'],
      author: 'Ahmed',
      publishedAt: 'Publié il y a 1 jour',
      description: 'Salam ! Je retourne à Mayotte après mes études en métropole et j\'ai un petit conteneur qui part du Havre le 5 mai vers Mamoudzou. J\'ai optimisé mes affaires et il me reste 2.1m³ de libre. Je peux prendre des cartons pas trop lourds, des effets personnels, des livres, des vêtements, du matériel informatique léger, des cadeaux pour la famille, etc. Pas de mobilier ni d\'électroménager par contre, j\'ai pas la place. Mon transitaire est quelqu\'un de confiance, ça fait des années qu\'il bosse avec ma famille. Transport maritime sécurisé avec suivi. Je propose 70€/m³ donc 145€ pour tout l\'espace ou possibilité de partager. Récupération possible en région parisienne ou livraison directe chez le transitaire au Havre. J\'ai de la famille qui peut réceptionner à Mayotte si besoin.'
    },
    {
      id: '12',
      type: 'offer' as const,
      title: 'Retour Guyane vers métropole',
      departure: 'Guyane',
      departureCity: 'Cayenne (97300)',
      arrival: 'France métropolitaine',
      arrivalCity: 'Bordeaux (33000)',
      volume: '4.8 m³',
      volumeCategory: '3-5',
      date: '18 avril 2024',
      price: '280€',
      items: ['Mobilier', 'Cartons', 'Effets personnels', 'Objets fragiles'],
      author: 'Valérie',
      publishedAt: 'Publié il y a 15 heures',
      description: 'Bonjour ! Après 5 années formidables en Guyane, nous rentrons en métropole. Notre conteneur part de Cayenne le 18 avril vers Bordeaux avec arrivée prévue début mai. Nous avons calculé large et il nous reste 4.8m³ de place libre. Si ça peut rendre service à quelqu\'un qui veut faire venir des affaires de famille ou récupérer des souvenirs, nous serions ravis de partager ! Nous pouvons prendre du petit mobilier, des cartons d\'affaires personnelles, de l\'artisanat local, des hamacs, du matériel de camping/pêche, des objets fragiles bien emballés. Nous avons l\'habitude des transports longue distance et nous emballons tout avec soin. Le conteneur est assuré tous risques. Tarif de 58€/m³ soit 280€ pour tout l\'espace, négociable selon volume. Récupération possible dans toute la région de Cayenne et Saint-Laurent du Maroni.'
    }
  ];

  // Filtrer les annonces
  const filteredAnnouncements = sampleAnnouncements.filter(announcement => {
    // Filtre par type
    if (announcement.type !== filters.type) {
      return false;
    }

    // Filtre par volume (si des volumes sont sélectionnés)
    if (filters.volumes.length > 0) {
      if (!filters.volumes.includes(announcement.volumeCategory)) {
        return false;
      }
    }

    // Filtre par lieu de départ (filtres appliqués uniquement)
    if (appliedDeparture && normalizeLocation(announcement.departure) !== appliedDeparture) {
      return false;
    }

    // Filtre par destination (filtres appliqués uniquement)
    if (appliedDestination && normalizeLocation(announcement.arrival) !== appliedDestination) {
      return false;
    }

    // Filtre par dates (filtres appliqués uniquement) - pour l'instant on accepte toutes les dates
    // TODO: Implémenter la logique de dates si nécessaire

    return true;
  });

  // Annonces à afficher (avec pagination)
  const displayedAnnouncements = filteredAnnouncements.slice(0, displayedCount);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setDisplayedCount(4); // Reset à 4 annonces quand les filtres changent
  };

  const loadMoreAnnouncements = () => {
    setDisplayedCount(prev => prev + 4);
  };

  // Fonction pour effectuer la recherche
  const handleSearch = () => {
    setDisplayedCount(4); // Reset la pagination lors d'une nouvelle recherche
    // Appliquer les filtres de recherche
    setAppliedDeparture(searchDeparture);
    setAppliedDestination(searchDestination);
    setAppliedDates(searchDates);
  };

  // Logique pour afficher le bouton "Voir plus"
  const shouldShowLoadMore = displayedAnnouncements.length >= 4 && filteredAnnouncements.length > displayedCount;

  // Fonction pour ouvrir l'alerte avec les filtres actuels
  const handleCreateAlert = () => {
    setIsAlertModalOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setIsChoiceModalOpen(true);
  };

  const router = useRouter();

  const handleChoice = (choice: 'cherche' | 'propose') => {
    if (choice === 'propose') {
      // Rediriger vers le funnel "Je propose de la place"
      router.push('/funnel/propose/locations');
    } else if (choice === 'cherche') {
      // TODO: Rediriger vers le funnel "Je cherche de la place" (à créer)
      console.log('Funnel "Je cherche" pas encore implémenté');
      // Pour l'instant, on peut rediriger vers une page temporaire ou rester sur la page d'accueil
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche principale style BlaBlaCar */}
      <div className="bg-gradient-to-br from-[#243163] to-[#1e2951] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header avec logo/navigation */}
          <div className="flex items-center justify-between py-4 sm:py-4">
            <div className="flex items-center gap-8">
              <div className="text-lg sm:text-2xl font-bold text-white font-inter">
                DodoPartage
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-4">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-4 border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                ➕ Publier un trajet
              </Button>
              <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-[#F47D6C] flex items-center justify-center text-white text-sm font-semibold">
                👤
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="pb-5 sm:pb-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:gap-4 lg:flex-row lg:gap-0">
                {/* Départ */}
                <div className="flex-1 lg:pr-3">
                  <CountrySelect
                    label="Départ"
                    value={searchDeparture}
                    onChange={setSearchDeparture}
                    options={countryOptions}
                    placeholder="Sélectionnez un départ"
                    className="relative"
                  />
                </div>

                {/* Flèche de direction */}
                <div className="flex lg:px-2 items-center justify-center py-1 sm:py-2 lg:py-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                </div>

                {/* Destination */}
                <div className="flex-1 lg:pl-3 lg:border-r border-gray-200 lg:pr-6">
                  <CountrySelect
                    label="Destination"
                    value={searchDestination}
                    onChange={setSearchDestination}
                    options={countryOptions}
                    placeholder="Sélectionnez une destination"
                    className="relative"
                  />
                </div>

                {/* Date */}
                <div className="flex-1 lg:px-4 lg:pr-6">
                  <MonthPicker
                    selectedMonths={searchDates}
                    onMonthsChange={setSearchDates}
                    placeholder="Peu importe"
                  />
                </div>

                {/* Bouton rechercher */}
                <div className="flex items-end lg:items-center pt-3 sm:pt-2 lg:pt-0">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full lg:w-auto bg-[#F47D6C] hover:bg-[#e66b5a] border-0 px-6 sm:px-8 text-sm sm:text-base h-12 sm:h-auto"
                    onClick={handleSearch}
                  >
                    Rechercher
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal avec sidebar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Bouton pour ouvrir les filtres sur mobile */}
          <div className="lg:hidden mb-2">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Sidebar filtres - gauche */}
          <div className={`lg:w-80 flex-shrink-0 ${isMobileFiltersOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-6">
              {/* Overlay mobile */}
              {isMobileFiltersOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300" 
                  onClick={() => setIsMobileFiltersOpen(false)} 
                />
              )}
              
              {/* Contenu des filtres */}
              <div className={`
                fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white lg:relative lg:w-auto lg:h-auto lg:bg-transparent 
                transform transition-transform duration-300 ease-out lg:transform-none
                ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                overflow-y-auto shadow-xl lg:shadow-none
              `}>
                {/* Header mobile avec bouton fermer */}
                <div className="lg:hidden flex items-center justify-between p-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                  <h3 className="text-xl font-semibold text-gray-900">Filtres</h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6 lg:p-0">
                  <FilterSection 
                    isMobile={isMobileFiltersOpen} 
                    onMobileClose={() => setIsMobileFiltersOpen(false)} 
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal - droite */}
          <div className="flex-1">
            {/* Header des annonces */}
            <div className="mb-6 sm:mb-8">
              {/* Titre et boutons - responsive layout */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-roboto-slab">
                    Annonces récentes
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 font-lato">
                    {filteredAnnouncements.length > 0 
                      ? `${filteredAnnouncements.length} annonce${filteredAnnouncements.length > 1 ? 's' : ''} trouvée${filteredAnnouncements.length > 1 ? 's' : ''}`
                      : 'Aucune annonce ne correspond à vos critères'
                    }
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex gap-3 w-full sm:w-auto sm:flex-shrink-0"
                >
                  {/* Bouton alerte simplifié - icône seule */}
                  <button
                    onClick={handleCreateAlert}
                    className="w-16 py-4 flex items-center justify-center bg-white border-2 border-[#F47D6C]/30 text-[#F47D6C] hover:bg-[#F47D6C] hover:text-white hover:border-[#F47D6C] transition-all duration-200 shadow-sm hover:shadow-md rounded-xl group relative flex-shrink-0"
                    title="Créer une alerte"
                  >
                    {/* Icône cloche avec plus intégrée */}
                    <BellPlus className="w-5 h-5" />
                    
                    {/* Tooltip au survol */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Créer une alerte
                    </div>
                  </button>
                  
                  {/* Bouton déposer annonce responsive */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateAnnouncement}
                    className="flex-1 sm:flex-none sm:w-auto bg-[#F47D6C] hover:bg-[#e66b5a] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    ➕ Déposer une annonce
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Liste des annonces */}
            {filteredAnnouncements.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {displayedAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <AnnouncementCardV2 {...announcement} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou consultez toutes les annonces.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setFilters({ type: 'offer', volumes: [] })}
                >
                  Voir toutes les annonces
                </Button>
              </motion.div>
            )}

            {/* Load More Button */}
            {shouldShowLoadMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-8 sm:mt-12 px-3 sm:px-0"
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md py-3 sm:py-2" 
                  onClick={loadMoreAnnouncements}
                >
                  Voir plus d'annonces
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'alerte */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialFilters={{
          departure: appliedDeparture,
          destination: appliedDestination,
          type: filters.type === 'offer' ? 'offer' : filters.type === 'request' ? 'request' : 'all'
        }}
      />

      {/* Modal de choix du type d'annonce */}
      <ChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onChoice={handleChoice}
      />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card variant="gradient" padding="xl" className="text-center max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl">
                  📦
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-roboto-slab">
                    Votre annonce ici !
                  </h3>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto font-lato">
                    Vous avez de la place disponible dans un conteneur ou vous cherchez une solution d'expédition ?<br />
                    <span className="text-[#F47D6C] font-semibold">Publiez votre annonce en 2 minutes</span>
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-white/60 rounded-xl p-6 border border-white/50">
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="font-semibold text-gray-900 mb-1">Rapide</div>
                    <div className="text-sm text-gray-600">Publication en moins de 2 minutes</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-6 border border-white/50">
                    <div className="text-2xl mb-2">🆓</div>
                    <div className="font-semibold text-gray-900 mb-1">Gratuit</div>
                    <div className="text-sm text-gray-600">Aucune commission, aucun frais</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-6 border border-white/50">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="font-semibold text-gray-900 mb-1">Sécurisé</div>
                    <div className="text-sm text-gray-600">Vos données sont protégées</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleCreateAnnouncement}
                    className="bg-[#F47D6C] hover:bg-[#e66b5a] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    ➕ Déposer une annonce
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    ℹ️ En savoir plus
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2024 DodoPartage - Une initiative{' '}
            <span className="text-[#F47D6C] font-semibold">Dodomove</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

