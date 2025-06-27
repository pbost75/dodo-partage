'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Filter, X, Bell, Plus, BellPlus, RefreshCw, AlertCircle } from 'lucide-react';
import FilterSection from '@/components/partage/FilterSection';
import AnnouncementCard from '@/components/partage/AnnouncementCard';
import AnnouncementCardV2 from '@/components/partage/AnnouncementCardV2';
import AlertModal from '@/components/partage/AlertModal';
import ChoiceModal from '@/components/partage/ChoiceModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MonthPicker from '@/components/ui/MonthPicker';
import CountrySelect from '@/components/ui/CountrySelect';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import DeletedNotification from '@/components/partage/DeletedNotification';
import { useSearchParams } from 'next/navigation';
import { useAnnouncements, type AnnouncementFilters } from '@/hooks/useAnnouncements';
import { useSmartRouter } from '@/utils/navigation';

interface FilterState {
  priceType: string; // Gratuit, payant ou tous
  minVolume: string;
}

function HomePageContent() {
  const router = useSmartRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceType: 'all',
    minVolume: 'all'
  });

  // État pour le toggle "Propose" vs "Cherche"
  const [announcementType, setAnnouncementType] = useState<'offer' | 'request'>('offer');
  const [displayedCount, setDisplayedCount] = useState(4); // Afficher 4 annonces par défaut

  // États pour la barre de recherche
  const [searchDeparture, setSearchDeparture] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [searchDates, setSearchDates] = useState<string[]>([]);

  // États pour les filtres appliqués (ne changent qu'au clic sur "Rechercher")
  const [appliedDeparture, setAppliedDeparture] = useState<string>('');
  const [appliedDestination, setAppliedDestination] = useState<string>('');
  const [appliedDates, setAppliedDates] = useState<string[]>([]);

  // Fonction helper pour mettre à jour l'URL avec l'état actuel
  const updateURLWithCurrentState = (currentFilters?: FilterState, currentType?: 'offer' | 'request') => {
    const params = new URLSearchParams();
    
    if (appliedDeparture) params.set('departure', appliedDeparture);
    if (appliedDestination) params.set('destination', appliedDestination);
    if (appliedDates.length > 0) params.set('dates', appliedDates.join(','));
    
    const typeToUse = currentType || announcementType;
    params.set('type', typeToUse);
    
    const filtersToUse = currentFilters || filters;
    if (filtersToUse.priceType !== 'all') params.set('priceType', filtersToUse.priceType);
    if (filtersToUse.minVolume !== 'all') params.set('minVolume', filtersToUse.minVolume);
    
    const url = params.toString() ? `/?${params.toString()}` : '/';
    router.push(url, { scroll: false });
  };

  // Initialiser les états depuis les URL parameters au chargement
  useEffect(() => {
    const departure = searchParams.get('departure') || '';
    const destination = searchParams.get('destination') || '';
    const dates = searchParams.get('dates') ? searchParams.get('dates')!.split(',') : [];
    const type = searchParams.get('type') as 'offer' | 'request' || 'offer';
    const priceType = searchParams.get('priceType') || 'all';
    const minVolume = searchParams.get('minVolume') || 'all';

    // Mettre à jour tous les états
    setSearchDeparture(departure);
    setSearchDestination(destination);
    setSearchDates(dates);
    setAppliedDeparture(departure);
    setAppliedDestination(destination);
    setAppliedDates(dates);
    setAnnouncementType(type);
    setFilters({ priceType, minVolume });

    console.log('🔄 États restaurés depuis URL:', {
      departure, destination, dates, type, priceType, minVolume
    });
  }, [searchParams]);

  // Hook pour récupérer les annonces depuis le backend
  const {
    announcements,
    loading,
    error,
    total,
    stats,
    applyFilters,
    refresh,
    isEmpty,
    hasError
  } = useAnnouncements({
    type: 'all', // Récupérer toutes les annonces par défaut
    status: 'published' // Uniquement les annonces validées pour l'affichage public
  });

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

  // Fonction pour filtrer les annonces localement (optimisation UI)
  const getFilteredAnnouncements = () => {
    if (!announcements || announcements.length === 0) return [];

    return announcements.filter(announcement => {
      // Filtre par type d'annonce (maintenant géré par le toggle)
      if (announcement.type !== announcementType) {
        return false;
      }
      
      // Filtre par type de prix - adapter la logique selon le type d'annonce
      if (filters.priceType !== 'all') {
        if (announcementType === 'offer') {
          // Pour les offres : vérifier le champ price
          const isAnnouncementFree = !announcement.price || announcement.price === 'Gratuit';
          if (filters.priceType === 'free' && !isAnnouncementFree) {
            return false;
          }
          if (filters.priceType === 'paid' && isAnnouncementFree) {
            return false;
          }
        } else if (announcementType === 'request') {
          // Pour les demandes : vérifier acceptsCostSharing
          const acceptsFees = announcement.acceptsCostSharing === true;
          if (filters.priceType === 'free' && acceptsFees) {
            return false; // Afficher seulement ceux qui ne veulent pas payer
          }
          if (filters.priceType === 'paid' && !acceptsFees) {
            return false; // Afficher seulement ceux qui acceptent de payer
          }
        }
      }

      // Filtre par volume minimum
      if (filters.minVolume !== 'all') {
        const volumeNum = parseFloat(announcement.volume.replace(' m³', ''));
        const minVolumeRequired = parseFloat(filters.minVolume);
        
        if (volumeNum < minVolumeRequired) {
          return false;
        }
      }

      // Filtre par départ appliqué (avec normalisation)
      if (appliedDeparture) {
        const normalizedAnnouncementDeparture = normalizeLocation(announcement.departure);
        const normalizedAnnouncementDepartureCity = normalizeLocation(announcement.departureCity);
        const departureMatch = 
          normalizedAnnouncementDeparture.includes(appliedDeparture) ||
          normalizedAnnouncementDepartureCity.includes(appliedDeparture);
        if (!departureMatch) return false;
      }

      // Filtre par destination appliquée (avec normalisation)
      if (appliedDestination) {
        const normalizedAnnouncementArrival = normalizeLocation(announcement.arrival);
        const normalizedAnnouncementArrivalCity = normalizeLocation(announcement.arrivalCity);
        const destinationMatch = 
          normalizedAnnouncementArrival.includes(appliedDestination) ||
          normalizedAnnouncementArrivalCity.includes(appliedDestination);
        if (!destinationMatch) return false;
      }

      // Filtre par dates appliquées (période sélectionnée)
      if (appliedDates.length > 0) {
        // L'annonce a une date de shipping au format variable selon le type
        const announcementDate = announcement.date;
        
        // Gestion différente selon le type d'annonce
        if (announcementType === 'offer') {
          // Pour les offres : format "18 décembre 2025"
          const dateMatch = announcementDate.match(/(\d{1,2})\s+([a-zA-Zàâäéèêëïîôöùûüÿç]+)\s+(\d{4})/);
          if (dateMatch) {
            const [, day, monthName, year] = dateMatch;
            
            // Mapping des noms de mois français
            const monthsMap: Record<string, string> = {
              'janvier': 'Janvier', 'février': 'Février', 'mars': 'Mars', 'avril': 'Avril',
              'mai': 'Mai', 'juin': 'Juin', 'juillet': 'Juillet', 'août': 'Août',
              'septembre': 'Septembre', 'octobre': 'Octobre', 'novembre': 'Novembre', 'décembre': 'Décembre'
            };
            
            const normalizedMonth = monthsMap[monthName.toLowerCase()];
            if (normalizedMonth) {
              const announcementMonthYear = `${normalizedMonth} ${year}`;
              
              // Vérifier si ce mois/année est dans la période sélectionnée
              const dateMatches = appliedDates.includes(announcementMonthYear);
              if (!dateMatches) return false;
            }
          }
        } else if (announcementType === 'request') {
          // Pour les demandes : peut avoir un format de période flexible
          // On vérifie si la période de la demande correspond à au moins un des mois sélectionnés
          const hasDateMatch = appliedDates.some(selectedDate => 
            announcementDate.toLowerCase().includes(selectedDate.toLowerCase())
          );
          if (!hasDateMatch) return false;
        }
      }

    return true;
    });
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const displayedAnnouncements = filteredAnnouncements.slice(0, displayedCount);
  const hasMoreAnnouncements = filteredAnnouncements.length > displayedCount;

  const handleFiltersChange = (newFilters: FilterState) => {
    console.log('🔧 Changement de filtres:', newFilters);
    setFilters(newFilters);
    
    // Mettre à jour l'URL avec les nouveaux filtres
    updateURLWithCurrentState(newFilters, announcementType);
  };

  const handleAnnouncementTypeChange = (newType: 'offer' | 'request') => {
    console.log('🔄 Changement type annonce:', newType);
    setAnnouncementType(newType);
    
    // Mettre à jour l'URL avec le nouveau type
    updateURLWithCurrentState(filters, newType);
    
    // Forcer une récupération des données pour le nouveau type
    // Cela garantit qu'on récupère bien toutes les annonces du type sélectionné
    applyFilters({
      type: newType,
      departure: appliedDeparture,
      arrival: appliedDestination,
      status: 'published'
    });
    
    // Réinitialiser l'affichage
    setDisplayedCount(4);
  };

  const loadMoreAnnouncements = () => {
    setDisplayedCount(prev => Math.min(prev + 4, filteredAnnouncements.length));
  };

  const handleSearch = () => {
    console.log('🔍 Recherche avec:', { 
      departure: searchDeparture, 
      destination: searchDestination 
    });
    
    // Normaliser les termes de recherche avant application
    const normalizedDeparture = searchDeparture ? normalizeLocation(searchDeparture) : '';
    const normalizedDestination = searchDestination ? normalizeLocation(searchDestination) : '';
    
    console.log('🔄 Recherche normalisée:', { 
      departure: `${searchDeparture} → ${normalizedDeparture}`, 
      destination: `${searchDestination} → ${normalizedDestination}` 
    });
    
    // Sauvegarder les paramètres dans l'URL pour préserver l'état
    const params = new URLSearchParams();
    if (normalizedDeparture) params.set('departure', normalizedDeparture);
    if (normalizedDestination) params.set('destination', normalizedDestination);
    if (searchDates.length > 0) params.set('dates', searchDates.join(','));
    params.set('type', announcementType);
    if (filters.priceType !== 'all') params.set('priceType', filters.priceType);
    if (filters.minVolume !== 'all') params.set('minVolume', filters.minVolume);
    
    // Mettre à jour l'URL sans recharger la page
    const url = params.toString() ? `/?${params.toString()}` : '/';
    router.push(url, { scroll: false });
    
    // Appliquer les filtres via le hook (qui fera l'appel API)
    applyFilters({
      departure: normalizedDeparture,
      arrival: normalizedDestination,
      status: 'published'
    });
    
    // Aussi appliquer les filtres localement pour l'affichage immédiat
    setAppliedDeparture(normalizedDeparture);
    setAppliedDestination(normalizedDestination);
    setAppliedDates(searchDates);
    
    // Réinitialiser le nombre d'annonces affichées
    setDisplayedCount(4);
  };

  const handleCreateAlert = () => {
    setIsAlertModalOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setIsChoiceModalOpen(true);
  };

  const handleChoice = (choice: 'cherche' | 'propose') => {
    if (choice === 'propose') {
      // La modal se fermera via son propre état de navigation
      // Délai pour coordonner avec l'animation du loader dans ChoiceModal
      setTimeout(() => {
        setIsChoiceModalOpen(false);
        router.push('/funnel/propose/locations');
      }, 400); // Légèrement plus long que le délai dans ChoiceModal
    } else {
      // Redirection vers le funnel search
      setTimeout(() => {
        setIsChoiceModalOpen(false);
        router.push('/funnel/search/locations');
      }, 400); // Même délai que pour propose
    }
  };

  // Composant de chargement
  const LoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Composant d'erreur
  const ErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Erreur de chargement
      </h3>
      <p className="text-red-700 mb-4">
        {error || 'Impossible de récupérer les annonces pour le moment.'}
      </p>
      <Button
        variant="outline"
        onClick={refresh}
        icon={<RefreshCw className="w-4 h-4" />}
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        Réessayer
      </Button>
    </div>
  );

  // Composant d'état vide
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {announcementType === 'offer' 
          ? 'Aucune offre de place disponible' 
          : 'Aucune demande de place'
        }
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {(() => {
          const hasFilters = appliedDeparture || appliedDestination || appliedDates.length > 0;
          if (announcementType === 'offer') {
            return hasFilters
              ? 'Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
              : 'Aucune offre de conteneur n\'est disponible pour le moment.';
          } else {
            return hasFilters
              ? 'Aucune demande ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
              : 'Aucune demande de place n\'est active pour le moment.';
          }
        })()}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="primary"
          onClick={handleCreateAnnouncement}
          className="bg-[#F47D6C] hover:bg-[#e66b5a]"
        >
          {announcementType === 'offer' 
            ? '➕ Proposer un conteneur' 
            : '➕ Créer une demande'
          }
        </Button>
        {(appliedDeparture || appliedDestination || appliedDates.length > 0) && (
          <Button
            variant="outline"
            onClick={() => {
              // Réinitialiser tous les filtres de recherche
              setAppliedDeparture('');
              setAppliedDestination('');
              setAppliedDates([]);
              setSearchDeparture('');
              setSearchDestination('');
              setSearchDates([]);
              
              // Récupérer toutes les annonces du type actuel
              applyFilters({
                type: announcementType,
                status: 'published'
              });
              
              // Nettoyer l'URL
              router.push(`/?type=${announcementType}`, { scroll: false });
            }}
          >
            🔄 Réinitialiser les filtres
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bleu simplifié */}
      <div className="bg-gradient-to-br from-[#243163] to-[#1e2951] relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header avec logo/navigation */}
          <div className="flex items-center justify-between py-6 sm:py-8">
            <div className="flex items-center gap-8">
              <div className="text-xl sm:text-3xl font-bold text-white font-inter">
                DodoPartage
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-4 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                onClick={handleCreateAnnouncement}
              >
                ➕ Publier une annonce
              </Button>
            </div>
          </div>

          {/* Titre principal */}
          <div className="text-center pb-20 sm:pb-24">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
              Partagez vos conteneurs de déménagement
            </h1>
            <p className="text-lg sm:text-xl text-white/90 font-light max-w-3xl mx-auto">
              Trouvez facilement de l'espace dans un conteneur ou proposez le vôtre entre la métropole et les DOM-TOM
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche flottante à cheval */}
      <div className="relative -mt-12 sm:-mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:gap-4 lg:flex-row lg:gap-0">
              {/* Départ - Mobile: carte délimitée */}
              <div className="flex-1 lg:pr-3">
                <div className="lg:border-none border border-gray-200 rounded-lg p-3 lg:p-0">
                  <CountrySelect
                    label="Départ"
                    value={searchDeparture}
                    onChange={setSearchDeparture}
                    options={countryOptions}
                    placeholder="Sélectionnez un départ"
                    className="relative"
                  />
                </div>
              </div>

              {/* Flèche de direction - cachée sur mobile */}
              <div className="hidden lg:flex lg:px-2 items-center justify-center py-1 sm:py-2 lg:py-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
              </div>

              {/* Destination - Mobile: carte délimitée */}
              <div className="flex-1 lg:pl-3 lg:border-r border-gray-200 lg:pr-6">
                <div className="lg:border-none border border-gray-200 rounded-lg p-3 lg:p-0">
                  <CountrySelect
                    label="Destination"
                    value={searchDestination}
                    onChange={setSearchDestination}
                    options={countryOptions}
                    placeholder="Sélectionnez une destination"
                    className="relative"
                  />
                </div>
              </div>

              {/* Date - Mobile: carte délimitée */}
              <div className="flex-1 lg:px-4 lg:pr-6">
                <div className="lg:border-none border border-gray-200 rounded-lg p-3 lg:p-0">
                  <MonthPicker
                    selectedMonths={searchDates}
                    onMonthsChange={setSearchDates}
                    placeholder="Peu importe"
                  />
                </div>
              </div>

              {/* Bouton rechercher */}
              <div className="flex items-end lg:items-center pt-3 sm:pt-2 lg:pt-0">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full lg:w-auto bg-[#F47D6C] hover:bg-[#e66b5a] border-0 px-6 sm:px-8 text-sm sm:text-base h-12 sm:h-auto shadow-lg"
                  onClick={handleSearch}
                >
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal avec sidebar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4 sm:pb-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Sidebar filtres - gauche */}
          <div className={`lg:w-80 flex-shrink-0 ${isMobileFiltersOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-6">
              {/* Overlay mobile avec animation */}
              {isMobileFiltersOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" 
                  onClick={() => setIsMobileFiltersOpen(false)} 
                />
              )}
              
              {/* Version DESKTOP - Layout normal sans animation */}
              <div className="hidden lg:block">
                <FilterSection 
                  isMobile={false} 
                  onMobileClose={() => {}} 
                  onFiltersChange={handleFiltersChange}
                  filters={filters}
                />
              </div>
              
              {/* Version MOBILE - Avec animation Framer Motion */}
              {isMobileFiltersOpen && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 300,
                    duration: 0.4
                  }}
                  className="lg:hidden fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white overflow-y-auto shadow-2xl"
                >
                  {/* Header mobile avec bouton fermer */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-semibold text-gray-900">Filtres</h3>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <FilterSection 
                      isMobile={true} 
                      onMobileClose={() => setIsMobileFiltersOpen(false)} 
                      onFiltersChange={handleFiltersChange}
                      filters={filters}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Contenu principal - droite */}
          <div className="flex-1">
            {/* Header des annonces */}
            <div className="mb-6 sm:mb-8">
              {/* Titre et boutons - responsive layout */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
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
              
              {/* Toggle Switch et bouton Filtres sur la même ligne (mobile) */}
              <div className="mt-6 flex items-center justify-between sm:justify-start gap-4">
                <ToggleSwitch
                  value={announcementType}
                  onChange={handleAnnouncementTypeChange}
                  className="shadow-sm"
                />
                
                {/* Bouton filtres visible uniquement sur mobile */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#F47D6C]/30 hover:text-[#F47D6C] transition-all duration-200 shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </motion.button>
              </div>
            </div>

            {/* Liste des annonces */}
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {displayedAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <AnnouncementCardV2 
                      {...announcement} 
                      searchParams={searchParams.toString()} 
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMoreAnnouncements && (
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
          type: announcementType
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
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
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

      {/* Notification de suppression avec Suspense amélioré */}
      <Suspense fallback={null}>
        <DeletedNotificationWrapper />
      </Suspense>
    </div>
  );
}

// Wrapper pour gérer les erreurs de Suspense
function DeletedNotificationWrapper() {
  try {
    return <DeletedNotification />;
  } catch (error) {
    console.warn('⚠️ Erreur Suspense DeletedNotification:', error);
    return null;
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

