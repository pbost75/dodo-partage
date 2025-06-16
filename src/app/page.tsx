'use client';

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { useAnnouncements, type AnnouncementFilters } from '@/hooks/useAnnouncements';

interface FilterState {
  type: string;
  minVolume: string;
}

export default function HomePage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'offer',
    minVolume: 'all'
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
    status: 'all' // Toutes les annonces (published + pending) pour le développement
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
      // Filtre par type d'annonce
      if (filters.type !== 'all' && announcement.type !== filters.type) {
        return false;
      }

      // Filtre par volume minimum
      // Logique : filtrer par volume minimum disponible
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
        // L'annonce a une date de shipping au format "2025-12-18"
        const announcementDate = announcement.date; // Format frontend: "18 décembre 2025"
        
        // Parser le format date du frontend pour extraire mois/année
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

  const router = useRouter();

  const handleChoice = (choice: 'cherche' | 'propose') => {
    setIsChoiceModalOpen(false);
    if (choice === 'propose') {
      router.push('/funnel/propose/locations');
    } else {
      // TODO: Implémenter le funnel "cherche"
      console.log('Funnel "cherche" pas encore implémenté');
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
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Aucune annonce trouvée
      </h3>
      <p className="text-gray-600 mb-4">
        {appliedDeparture || appliedDestination || appliedDates.length > 0 || filters.minVolume !== 'all'
          ? 'Aucune annonce ne correspond à vos critères de recherche.'
          : 'Il n\'y a pas encore d\'annonces publiées.'}
      </p>
      <div className="space-y-2">
        <Button
          variant="primary"
          onClick={handleCreateAnnouncement}
          icon={<Plus className="w-4 h-4" />}
        >
          Déposer une annonce
        </Button>
        {(appliedDeparture || appliedDestination || appliedDates.length > 0 || filters.minVolume !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              setAppliedDeparture('');
              setAppliedDestination('');
              setAppliedDates([]);
              setSearchDeparture('');
              setSearchDestination('');
              setSearchDates([]);
              setFilters({ type: 'offer', minVolume: 'all' });
              setDisplayedCount(4);
            }}
            className="text-gray-600"
          >
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
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
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-4 border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                ➕ Publier un trajet
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F47D6C] flex items-center justify-center text-white text-sm font-semibold">
                👤
              </div>
            </div>
          </div>

          {/* Titre principal */}
          <div className="text-center pb-20 sm:pb-24">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 font-roboto-slab">
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
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
                    <AnnouncementCardV2 {...announcement} />
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

