'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Filter, X, Bell, Plus, BellPlus, RefreshCw, AlertCircle, Clock, Zap, UserCheck, DollarSign, MessageCircle, Trophy, Users, LifeBuoy, Truck, Star, Search, FileText, BellRing, HandHeart, Award, Crown } from 'lucide-react';
import FilterSection from '@/components/partage/FilterSection';
import AnnouncementCard from '@/components/partage/AnnouncementCard';
import AnnouncementCardV2 from '@/components/partage/AnnouncementCardV2';
import AlertModal from '@/components/partage/AlertModal';
import ChoiceModal from '@/components/partage/ChoiceModal';
import Button from '@/components/ui/Button';
import FeedbackButton from '@/components/ui/FeedbackButton';
import BurgerMenu from '@/components/ui/BurgerMenu';
import MonthPicker from '@/components/ui/MonthPicker';
import CountrySelect from '@/components/ui/CountrySelect';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import DeletedNotification from '@/components/partage/DeletedNotification';
import FAQSection from '@/components/partage/FAQSection';
import { SEOHead } from '@/components/seo/SEOHead';
import FAQJsonLD from '@/components/seo/FAQJsonLD';
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
  const [displayedCount, setDisplayedCount] = useState(7); // Afficher 7 annonces par défaut

  // États pour la barre de recherche
  const [searchDeparture, setSearchDeparture] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [searchDates, setSearchDates] = useState<string[]>([]);

  // États pour les filtres appliqués (pour éviter la re-recherche constante)
  const [appliedDeparture, setAppliedDeparture] = useState<string>('');
  const [appliedDestination, setAppliedDestination] = useState<string>('');
  const [appliedDates, setAppliedDates] = useState<string[]>([]);

  // États pour le CTA alerte fixe
  const [showFixedAlert, setShowFixedAlert] = useState(false);
  
  // Calculer le nombre de filtres actifs pour l'indicateur visuel
  const activeFilterCount = (filters.minVolume !== 'all' ? 1 : 0) + (filters.priceType !== 'all' ? 1 : 0);
  
  // 🐛 DEBUG: Observer les changements d'état
  useEffect(() => {
    console.log('🚨 showFixedAlert changed to:', showFixedAlert);
  }, [showFixedAlert]);
  

  


  // Refs pour le scroll tracking
  const alertButtonRef = useRef<HTMLButtonElement>(null);
  const announcementsSectionRef = useRef<HTMLDivElement>(null);
  const announcementsListRef = useRef<HTMLDivElement>(null);
  const loadMoreButtonRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const hasProcessedModalParam = useRef(false);

  // Fonction helper pour mettre à jour l'URL avec l'état actuel
  const updateURLWithCurrentState = (currentFilters?: FilterState, currentType?: 'offer' | 'request') => {
    const filtersToUse = currentFilters || filters;
    const typeToUse = currentType || announcementType;
    
    const params = new URLSearchParams();
    if (appliedDeparture) params.set('departure', appliedDeparture);
    if (appliedDestination) params.set('destination', appliedDestination);
    if (appliedDates.length > 0) params.set('dates', appliedDates.join(','));
    params.set('type', typeToUse);
    if (filtersToUse.priceType !== 'all') params.set('priceType', filtersToUse.priceType);
    if (filtersToUse.minVolume !== 'all') params.set('minVolume', filtersToUse.minVolume);
    
    const url = params.toString() ? `/?${params.toString()}` : '/';
    router.push(url, { scroll: false });
  };

  // CORRECTION : Séparer la gestion du modal dans un useEffect séparé
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    
    if (modalParam === 'open' && !hasProcessedModalParam.current) {
      setIsChoiceModalOpen(true);
      console.log('🎯 Popup de choix ouverte automatiquement via URL');
      hasProcessedModalParam.current = true;
      
      // Nettoyer l'URL en supprimant le paramètre modal
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('modal');
      const newUrl = newParams.toString() ? `/?${newParams.toString()}` : '/';
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  // CORRECTION : useEffect séparé pour la restauration d'état (sans modification d'URL)
  useEffect(() => {
    const departure = searchParams.get('departure') || '';
    const destination = searchParams.get('destination') || '';
    const dates = searchParams.get('dates') ? searchParams.get('dates')!.split(',') : [];
    const type = searchParams.get('type') as 'offer' | 'request' || 'offer';
    const priceType = searchParams.get('priceType') || 'all';
    const minVolume = searchParams.get('minVolume') || 'all';

    // Mettre à jour tous les états DE RECHERCHE (ce qui est dans les champs)
    setSearchDeparture(departure);
    setSearchDestination(destination);
    setSearchDates(dates);
    setAnnouncementType(type);
    setFilters({ priceType, minVolume });

    // IMPORTANT: Mettre à jour les états APPLIQUÉS seulement s'il y a des paramètres URL
    // (c'est-à-dire une recherche restaurée, pas une saisie interactive)
    if (departure || destination || dates.length > 0) {
      setAppliedDeparture(departure);
      setAppliedDestination(destination);
      setAppliedDates(dates);
      console.log('🔄 États appliqués restaurés depuis URL:', {
        departure, destination, dates, type, priceType, minVolume
      });
    } else {
      console.log('🔄 États de recherche restaurés (sans application de filtres):', {
        departure, destination, dates, type, priceType, minVolume
      });
    }
  }, [searchParams]);

  // Gestion simplifiée et élégante du CTA alerte fixe
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const alertButton = alertButtonRef.current;
          const announcementsList = announcementsListRef.current;
          
          if (!alertButton || !announcementsList) {
            console.log('⚠️ Refs manquantes - alertButton:', !!alertButton, 'announcementsList:', !!announcementsList);
            ticking = false;
            return;
          }

          const isMobile = window.innerWidth < 1024;
          const windowHeight = window.innerHeight;
          const listRect = announcementsList.getBoundingClientRect();
          
          // 🎯 Conditions d'affichage optimisées
          const hasReachedAnnouncements = listRect.top <= windowHeight * 0.6; // Apparition quand on voit 60% de l'écran
          const hasPassedEndOfSection = listRect.bottom < windowHeight * 0.4; // Disparition quand il reste moins de 40%
          
          // Calculs pour déterminer l'affichage de la bulle
          
          if (isMobile) {
            // Mobile: montrer dans la zone des annonces seulement
            const isBackOnTop = listRect.top > windowHeight * 0.9;
            const shouldShow = hasReachedAnnouncements && !isBackOnTop && !hasPassedEndOfSection;
            setShowFixedAlert(shouldShow);
          } else {
            // Desktop: montrer si dans la zone des annonces ET bouton header pas visible
            const alertButtonRect = alertButton.getBoundingClientRect();
            const isHeaderButtonVisible = alertButtonRect.top > -50;
            const shouldShow = hasReachedAnnouncements && !isHeaderButtonVisible && !hasPassedEndOfSection;
            setShowFixedAlert(shouldShow);
          }



          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Écouter les événements
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Appel initial
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
          // Gestion explicite des valeurs null/undefined
          const acceptsCostSharing = announcement.acceptsCostSharing;
          
          if (filters.priceType === 'free') {
            // Afficher seulement ceux qui ne veulent pas payer (acceptsCostSharing === false)
            if (acceptsCostSharing !== false) {
              return false;
            }
          }
          if (filters.priceType === 'paid') {
            // Afficher seulement ceux qui acceptent de payer (acceptsCostSharing === true)
            if (acceptsCostSharing !== true) {
              return false;
            }
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
    
    // Protection contre les événements multiples
    if (newType === announcementType) {
      console.log('🔄 Type déjà sélectionné, pas de changement');
      return;
    }
    
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

  // Fonction pour scroller vers la section des annonces (avec délai pour mobile)
  const scrollToAnnouncements = () => {
    // Délai pour laisser le temps à la recherche de se terminer et à l'UI de se mettre à jour
    setTimeout(() => {
      if (announcementsSectionRef.current) {
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        
        if (isMobile) {
          // Sur mobile, scroll avec une animation douce vers la section des annonces
          announcementsSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          
          console.log('📱 Auto-scroll mobile vers la section des annonces');
        }
      }
    }, 300); // 300ms pour laisser le temps à l'API et à l'UI de se mettre à jour
  };

  const handleSearch = (e?: React.FormEvent | React.MouseEvent) => {
    // Empêcher le comportement par défaut (refresh de page)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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
    setDisplayedCount(7);
    
    // Auto-scroll vers la section des annonces sur mobile
    scrollToAnnouncements();
  };

  const handleCreateAlert = () => {
    setIsAlertModalOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setIsChoiceModalOpen(true);
  };

  const handleChoice = (choice: 'cherche' | 'propose') => {
    // Fermeture immédiate de la modal et redirection vers la page de transition
    setIsChoiceModalOpen(false);
    router.push(`/funnel-choice/${choice}`);
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
      {/* SEO Head pour canonical et robots */}
      <SEOHead 
        title="DodoPartage - Groupage conteneurs collaboratif DOM-TOM"
        description="Plateforme de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM. Proposez ou cherchez de la place pour vos expéditions."
      />
      
      {/* FAQ JSON-LD pour le référencement AEO */}
      <FAQJsonLD />
      
      {/* Header bleu avec surlignage jaune */}
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
              <BurgerMenu />
            </div>
          </div>

          {/* Section titres */}
          <div className="text-center pb-20 sm:pb-24">
            {/* Titre H1 SEO optimisé - responsive mobile/desktop */}
            <div className="mb-6 sm:mb-8 px-4 sm:px-0">
              <h1 className="text-white/90 text-xs sm:text-sm font-medium">
                {/* Version mobile - icône alignée avec le texte sur une ligne */}
                <div className="flex sm:hidden items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-[#EFB500] flex-shrink-0" />
                  <span className="font-bold tracking-wide text-center">
                    GROUPAGE CONTENEUR DOM-TOM
                  </span>
                </div>
                
                {/* Version desktop - icône à côté */}
                <div className="hidden sm:flex items-center justify-center gap-3">
                  <Crown className="w-5 h-5 text-[#EFB500] flex-shrink-0" />
                  <span className="font-bold tracking-wide">
                    GROUPAGE CONTENEUR DOM-TOM
                  </span>
                </div>
              </h1>
            </div>
            
            {/* Titre principal avec surlignage jaune */}
            <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 font-title leading-tight" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
              Partagez vos <span className="bg-[#EFB500] text-[#243163] px-2 py-1">conteneurs de déménagement</span>
            </div>
            <p className="text-lg sm:text-xl text-white/90 font-light max-w-3xl mx-auto">
              Trouvez ou proposez facilement une place dans un conteneur vers la Réunion et d'autres DOM-TOM.
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
                    onEnterPress={handleSearch}
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
                    onEnterPress={handleSearch}
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
                  type="submit"
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
          <div className="flex-1" ref={announcementsSectionRef}>
            <div ref={contentContainerRef}>
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
                  {/* Bouton alerte simplifié - icône seule - Desktop uniquement */}
                  <button
                    ref={alertButtonRef}
                    onClick={handleCreateAlert}
                    className="hidden lg:flex w-16 py-4 items-center justify-center bg-white border-2 border-[#F47D6C]/30 text-[#F47D6C] hover:bg-[#F47D6C] hover:text-white hover:border-[#F47D6C] transition-all duration-200 shadow-sm hover:shadow-md rounded-xl group relative flex-shrink-0"
                    title="Créer une alerte"
                  >
                    {/* Icône cloche avec plus intégrée */}
                    <BellPlus className="w-5 h-5" />
                    
                    {/* Tooltip au survol */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Créer une alerte
                    </div>
                  </button>
                  
                  {/* Bouton déposer annonce responsive - pleine largeur sur mobile */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateAnnouncement}
                    className="flex-1 lg:flex-none lg:w-auto bg-[#F47D6C] hover:bg-[#e66b5a] shadow-md hover:shadow-lg transition-all duration-200"
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
                  className={`lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm rounded-xl relative ${
                    activeFilterCount > 0
                      ? 'text-[#F47D6C] bg-[#F47D6C]/5 border-2 border-[#F47D6C]/30 hover:bg-[#F47D6C]/10 hover:border-[#F47D6C]/50'
                      : 'text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-[#F47D6C]/30 hover:text-[#F47D6C]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                  {/* Badge indicateur de filtres actifs */}
                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[#F47D6C] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                    >
                      {activeFilterCount}
                    </motion.div>
                  )}
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
              <div ref={announcementsListRef} className="space-y-4 sm:space-y-6">
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
                ref={loadMoreButtonRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-16 sm:mt-20 px-3 sm:px-0"
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






      {/* CTA Alerte fixe - EXACTEMENT la même structure que "Voir plus d'annonces" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showFixedAlert ? 1 : 0,
          y: showFixedAlert ? 0 : 20
        }}
        transition={{ 
          duration: 0.15, 
          ease: 'easeOut'
        }}
        className={`fixed bottom-6 left-0 right-0 z-40 ${showFixedAlert ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Reproduire exactement la structure du container principal */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            {/* Sidebar invisible - même largeur que l'original */}
            <div className="lg:w-80 flex-shrink-0 hidden lg:block"></div>
            
            {/* Contenu principal - même structure que l'original */}
            <div className="flex-1">
              <div className="text-center px-3 sm:px-0">
                <button
                  onClick={handleCreateAlert}
                  className="group bg-[#F47D6C] hover:bg-[#e66b5a] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2 sm:gap-3 relative min-w-[200px] sm:min-w-[240px]"
                  title="Créer une alerte"
                >
                  {/* Animation pulse pour attirer l'attention - en arrière-plan */}
                  <div className="absolute inset-0 rounded-xl bg-[#F47D6C] animate-pulse opacity-20 pointer-events-none -z-10"></div>
                  
                  <BellPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-white whitespace-nowrap">
                    Créer une alerte
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Comment ça marche */}
      <section id="how-it-works" className="w-full bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            {/* Colonne gauche - Titre et description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-2/5 lg:sticky lg:top-8 text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-title leading-tight" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                Comment fonctionne DodoPartage ?
              </h2>
              <p className="text-lg text-gray-600 font-lato leading-relaxed max-w-lg mx-auto lg:mx-0">
                DodoPartage facilite la mise en relation entre ceux qui cherchent de la place dans un conteneur et ceux qui en proposent. Tout se fait sans compte, en toute simplicité.
              </p>
            </motion.div>

            {/* Colonne droite - Grille des étapes */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-3/5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Étape 1 - Recherchez une annonce */}
                <div className="flex flex-col items-center sm:items-start space-y-4 text-center sm:text-left">
                  <div className="w-16 h-16 bg-[#243163] rounded-2xl flex items-center justify-center">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                      Recherchez une annonce
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-lato">
                      Utilisez la barre de recherche pour trouver une place dans un conteneur selon votre trajet et vos dates. Filtrez par type (gratuit ou payant), volume ou lieu de départ.
                    </p>
                  </div>
                </div>

                {/* Étape 2 - Pas trouvé ? Postez votre annonce */}
                <div className="flex flex-col items-center sm:items-start space-y-4 text-center sm:text-left">
                  <div className="w-16 h-16 bg-[#243163] rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                      Pas trouvé ? Postez votre annonce
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-lato">
                      Publiez votre propre annonce en 2 minutes, sans création de compte. Vous recevez les réponses directement par email.
                    </p>
                  </div>
                </div>

                {/* Étape 3 - Activez les alertes email */}
                <div className="flex flex-col items-center sm:items-start space-y-4 text-center sm:text-left">
                  <div className="w-16 h-16 bg-[#243163] rounded-2xl flex items-center justify-center">
                    <BellRing className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                      Activez les alertes email
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-lato">
                      Gagnez du temps : soyez notifié automatiquement dès qu'une nouvelle annonce correspond à votre recherche.
                    </p>
                  </div>
                </div>

                {/* Étape 4 - Organisez-vous librement */}
                <div className="flex flex-col items-center sm:items-start space-y-4 text-center sm:text-left">
                  <div className="w-16 h-16 bg-[#243163] rounded-2xl flex items-center justify-center">
                    <HandHeart className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                      Organisez-vous librement
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-lato">
                      La plateforme ne gère ni paiement ni contrat : vous échangez directement par email pour définir vos conditions.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Structure exacte de la maquette avec 2 zones */}
      <section className="w-full">
        {/* Zone supérieure - Fond clair */}
        <div className="bg-[#EDEEFF] pb-16 sm:pb-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center lg:items-center">
              
              {/* Colonne gauche - Contenu principal (45%) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-[45%] space-y-3 sm:space-y-4 text-center lg:text-left"
              >
                                {/* Logo DodoMove */}
                <div className="w-44 sm:w-60 mx-auto lg:mx-0">
                  <img 
                    src="/images/logo-Dodomove-positif-cropped.webp" 
                    alt="DodoMove" 
                    className="w-full h-auto"
                  />
                </div>

                {/* Badge leader */}
                <div className="inline-flex items-center gap-2 sm:gap-3 text-[#1a2741] text-xs sm:text-sm font-medium">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-sunflower font-bold">
                    <span className="block sm:hidden">BIENTÔT DISPONIBLE</span>
                    <span className="hidden sm:block">BIENTÔT DISPONIBLE</span>
                  </span>
                </div>

                {/* Titre avec soulignement jaune */}
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#243163] mb-2 font-title leading-tight" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                    <span className="block">Gagnez du temps et comparez les <span className="bg-[#EFB500] text-[#243163] px-2 py-1">solutions groupage</span> avec Dodomove</span>
                  </h2>
                </div>

                {/* Texte descriptif */}
                <p className="text-[#1a2741] text-base sm:text-lg mx-auto lg:mx-0 max-w-lg font-lato font-light">
                  Trouvez <span className="text-blue-600">rapidement et simplement</span> les bons professionnels pour vos envois par conteneur. Jusqu'à 3 devis en 24h !
                </p>

                {/* Bouton CTA et "en 2 minutes" */}
                <div className="flex justify-center lg:justify-start">
                  <div className="space-y-3 sm:space-y-4 text-center">
                    <a
                      href="https://www.dodomove.fr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#F47D6C] hover:bg-[#e66b5a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-colors shadow-lg hover:shadow-xl font-lato"
                    >
                      Je découvre
                    </a>
                    
                    <div className="flex items-center justify-center gap-2 text-[#1a2741]">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#F47F6B]" />
                      <span className="font-lato font-bold text-sm sm:text-base">en 2 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Colonne droite - Images */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full lg:w-[55%] flex justify-center lg:justify-end relative z-10"
              >
                {/* Badge d'étoiles flottant */}
                <div className="absolute -top-4 right-4 sm:-top-6 sm:right-6 lg:top-4 lg:right-8 bg-white rounded-xl px-3 py-2 shadow-lg z-20">
                  <div className="flex justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
                {/* Image principale - Format carré sur mobile, original sur desktop */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl w-80 h-80 sm:w-96 sm:h-96 lg:max-w-72 lg:h-[32rem] mb-[-6rem] sm:mb-[-8rem] lg:mb-0 mx-auto lg:mx-0">
                  <img 
                    src="https://www.dodomove.fr/wp-content/uploads/2023/09/pexels-ketut-subiyanto-4246085.jpg" 
                    alt="Couple préparant un déménagement" 
                    className="w-full h-full object-cover"
                  />
                  

                </div>

                {/* Image secondaire - Femme avec cartons - Cachée sur mobile et tablet, visible sur desktop */}
                <div className="hidden lg:block relative rounded-xl overflow-hidden shadow-xl max-w-72 mx-auto transform translate-y-8">
                  <img 
                    src="https://www.dodomove.fr/wp-content/uploads/2023/09/pexels-artem-podrez-5025510-scaled.jpg" 
                    alt="Femme avec des cartons" 
                    className="w-full h-108 md:h-[32rem] object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Zone inférieure - Fond bleu foncé avec les 4 avantages */}
        <div className="bg-[#071836] pt-24 sm:pt-32 lg:pt-20 pb-8 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-24 text-center lg:text-left">
              {/* Avantage 1 - Gagnez un temps précieux */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#243163] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>Gagnez un temps précieux</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                Votre temps est précieux. En passant par dodomove, obtenez juqu'à 3 devis personnalisés en 24h.                </p>
              </div>

              {/* Avantage 2 - Transporteurs fiables */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#243163] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>Transporteurs fiables et vérifiés</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                On ne vous propose que des transporteurs sérieux, formés et assurés pour les envois DOM-TOM.
                </p>
              </div>

              {/* Avantage 3 - Prix compétitifs */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#243163] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>Le bon prix, sans mauvaise surprise</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                Des devis transparents, sans frais cachés. Comparez et choisissez l'offre qui vous convient, au juste prix.
                </p>
              </div>

              {/* Avantage 4 - Support */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#243163] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <LifeBuoy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
                  Une question ?<br />
                  On vous guide.
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                Un doute sur votre volume, vos options ou vos démarches ? On vous répond, gratuitement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section id="faq">
        <FAQSection />
      </section>

      {/* Footer simple */}
      <footer className="bg-[#243163] text-gray-300 py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
            <a 
              href="https://www.dodomove.fr/contact/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#F47D6C] font-medium text-sm transition-all duration-200 hover:underline"
            >
              Nous contacter
            </a>
            <a 
              href="https://www.dodomove.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#F47D6C] font-medium text-sm transition-all duration-200 hover:underline"
            >
              Dodomove.fr
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center border-t border-gray-600 pt-4">
            <p className="text-xs sm:text-sm">
              © {new Date().getFullYear()} DodoPartage - Une initiative{' '}
              <a 
                href="https://www.dodomove.fr" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                className="text-[#F47D6C] font-semibold hover:underline transition-all duration-200"
              >
                Dodomove
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Notification de suppression avec Suspense amélioré */}
      <Suspense fallback={null}>
        <DeletedNotificationWrapper />
      </Suspense>

      {/* Languette de feedback sur le côté droit */}
      <FeedbackButton type="tab" variant="contact" />
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

