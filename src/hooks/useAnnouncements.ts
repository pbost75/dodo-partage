import { useState, useEffect, useCallback } from 'react';

// Interface pour les annonces
export interface Announcement {
  id: string;
  reference: string;
  type: 'offer' | 'request';
  title: string;
  departure: string;
  departureCity: string;
  arrival: string;
  arrivalCity: string;
  volume: string;
  volumeCategory: string;
  date: string;
  year: string;
  price?: string;
  items: string[];
  author: string;
  publishedAt: string;
  description: string;
  status: string;
  acceptsCostSharing?: boolean;
  periodFormatted?: string;
}

// Interface pour les filtres
export interface AnnouncementFilters {
  type?: 'offer' | 'request' | 'all';
  departure?: string;
  arrival?: string;
  volumeMin?: string;
  volumeMax?: string;
  status?: 'published' | 'all';
}

// Interface pour la réponse de l'API
interface ApiResponse {
  success: boolean;
  data: Announcement[];
  message: string;
  total: number;
  stats?: {
    total: number;
    byType: {
      offers: number;
      requests: number;
    };
    byStatus: {
      published: number;
      pending: number;
    };
  };
  error?: string;
}

export function useAnnouncements(initialFilters: AnnouncementFilters = {}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ApiResponse['stats']>();
  const [filters, setFilters] = useState<AnnouncementFilters>(initialFilters);

  // Fonction pour normaliser les noms de lieux (correspondant à la page d'accueil)
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

  // Fonction pour récupérer les annonces
  const fetchAnnouncements = useCallback(async (searchFilters: AnnouncementFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Récupération des annonces avec filtres:', searchFilters);

      // Construction des paramètres de requête avec normalisation
      const queryParams = new URLSearchParams();
      
      if (searchFilters.type && searchFilters.type !== 'all') {
        queryParams.append('type', searchFilters.type);
      }
      if (searchFilters.departure) {
        const normalizedDeparture = normalizeLocation(searchFilters.departure);
        queryParams.append('departure', normalizedDeparture);
        console.log('🔄 Départ normalisé:', searchFilters.departure, '→', normalizedDeparture);
      }
      if (searchFilters.arrival) {
        const normalizedArrival = normalizeLocation(searchFilters.arrival);
        queryParams.append('arrival', normalizedArrival);
        console.log('🔄 Arrivée normalisée:', searchFilters.arrival, '→', normalizedArrival);
      }
      if (searchFilters.volumeMin) {
        queryParams.append('volumeMin', searchFilters.volumeMin);
      }
      if (searchFilters.volumeMax) {
        queryParams.append('volumeMax', searchFilters.volumeMax);
      }
      if (searchFilters.status) {
        queryParams.append('status', searchFilters.status);
      }

      const url = `/api/get-announcements${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('📡 Appel API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des annonces');
      }

      console.log('✅ Annonces récupérées:', {
        total: result.data.length,
        message: result.message
      });

      setAnnouncements(result.data);
      setTotal(result.total);
      setStats(result.stats);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la récupération des annonces:', errorMessage);
      
      setError(errorMessage);
      setAnnouncements([]); // Réinitialiser les annonces en cas d'erreur
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour appliquer de nouveaux filtres
  const applyFilters = useCallback((newFilters: AnnouncementFilters) => {
    console.log('🔧 Application des nouveaux filtres:', newFilters);
    setFilters(newFilters);
    fetchAnnouncements(newFilters);
  }, [fetchAnnouncements]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    console.log('🔄 Rafraîchissement des annonces...');
    fetchAnnouncements(filters);
  }, [fetchAnnouncements, filters]);

  // Chargement initial
  useEffect(() => {
    fetchAnnouncements(filters);
  }, []); // Uniquement au montage du composant

  // Fonction pour filtrer localement les annonces (pour optimiser les performances)
  const filterAnnouncementsLocally = useCallback((
    announcements: Announcement[], 
    localFilters: Partial<AnnouncementFilters>
  ): Announcement[] => {
    return announcements.filter(announcement => {
      // Filtre par type
      if (localFilters.type && localFilters.type !== 'all' && announcement.type !== localFilters.type) {
        return false;
      }

      // Filtre par départ (recherche partielle insensible à la casse)
      if (localFilters.departure) {
        const departureMatch = announcement.departure.toLowerCase().includes(localFilters.departure.toLowerCase()) ||
                              announcement.departureCity.toLowerCase().includes(localFilters.departure.toLowerCase());
        if (!departureMatch) return false;
      }

      // Filtre par arrivée (recherche partielle insensible à la casse)
      if (localFilters.arrival) {
        const arrivalMatch = announcement.arrival.toLowerCase().includes(localFilters.arrival.toLowerCase()) ||
                            announcement.arrivalCity.toLowerCase().includes(localFilters.arrival.toLowerCase());
        if (!arrivalMatch) return false;
      }

      // Filtre par volume
      const volumeNum = parseFloat(announcement.volume.replace(' m³', ''));
      if (localFilters.volumeMin && volumeNum < parseFloat(localFilters.volumeMin)) {
        return false;
      }
      if (localFilters.volumeMax && volumeNum > parseFloat(localFilters.volumeMax)) {
        return false;
      }

      // Filtre par statut
      if (localFilters.status && localFilters.status !== 'all' && announcement.status !== localFilters.status) {
        return false;
      }

      return true;
    });
  }, []);

  return {
    // Données
    announcements,
    total,
    stats,
    
    // États
    loading,
    error,
    
    // Filtres actuels
    filters,
    
    // Actions
    applyFilters,
    refresh,
    fetchAnnouncements,
    filterAnnouncementsLocally,
    
    // Utilitaires
    isEmpty: announcements.length === 0,
    hasError: error !== null,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof AnnouncementFilters])
  };
} 