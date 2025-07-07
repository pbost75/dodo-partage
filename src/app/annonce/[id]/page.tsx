'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSmartRouter } from '@/utils/navigation';
import { apiFetch } from '@/utils/apiUtils';
import { 
  Ship, 
  Search,
  Anchor, 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Package, 
  MapPin,
  Clock,
  Copy,
  Check,
  CalendarDays,
  DollarSign
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ContactModal from '@/components/partage/ContactModal';

// Interface pour les données d'annonce
interface AnnouncementDetail {
  id: string;
  reference: string;
  type: 'offer' | 'request';
  requestType: 'offer' | 'search'; // Type original du backend
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
  authorEmail: string;
  publishedAt: string;
  description: string;
  status: string;
  // Champs spécifiques aux demandes "search"
  acceptsCostSharing?: boolean;
  periodFormatted?: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useSmartRouter();
  const searchParams = useSearchParams();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Récupération des données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel API pour récupérer l'annonce spécifique
        const response = await apiFetch(`/api/get-announcements`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'annonce');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Annonce non trouvée');
        }

        // Trouver l'annonce par référence OU par ID (pour compatibilité avec les anciennes URLs)
        const foundAnnouncement = result.data.find((ann: AnnouncementDetail) => 
          ann.reference === params.id || ann.id === params.id
        );
        if (!foundAnnouncement) {
          throw new Error('Annonce non trouvée');
        }

        setAnnouncement(foundAnnouncement);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAnnouncement();
    }
  }, [params.id]);

  // Fonction pour détecter si c'est un port
  const isPort = (cityName: string): boolean => {
    const portCities = [
      'Le Havre', 'Marseille', 'Bordeaux', 'Nouméa', 'Port-Est', 'Fort-de-France', 
      'Pointe-à-Pitre', 'Longoni', 'Dégrad des Cannes'
    ];
    return portCities.some(port => cityName.toLowerCase().includes(port.toLowerCase()));
  };

  // Composant pour afficher une ville avec icône d'ancre si c'est un port
  const CityDisplay: React.FC<{ city: string; className?: string }> = ({ city, className = "" }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-gray-600">{city}</span>
      {isPort(city) && <Anchor className="w-3 h-3 text-gray-400 opacity-60" strokeWidth={1.5} />}
    </div>
  );

  // Fonctions utilitaires pour l'affichage selon le type
  const getAnnouncementIcon = () => {
    return announcement?.type === 'request' ? Search : Ship;
  };

  const getAnnouncementColor = () => {
    return announcement?.type === 'request' ? '#3B82F6' : '#F47D6C'; // Bleu pour search, rouge-orange pour offer
  };

  const getDateLabel = () => {
    return announcement?.type === 'request' ? 'Période souhaitée' : 'Date prévue';
  };

  const getDateIcon = () => {
    return announcement?.type === 'request' ? CalendarDays : Calendar;
  };

  // Fonction de partage
  const handleShare = async () => {
    const url = window.location.href;
    const title = announcement?.title || 'Annonce DodoPartage';
    const text = `${title} - ${announcement?.departure} → ${announcement?.arrival}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      setShareMenuOpen(!shareMenuOpen);
    }
  };

  // Fonction de copie du lien
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShareMenuOpen(false);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Fonction intelligente pour le retour
  const handleBackNavigation = () => {
    const params = searchParams.toString();
    if (params) {
      // Si on a des paramètres de recherche, retourner à la page d'accueil avec ces paramètres
      router.push(`/?${params}`);
    } else {
      // Sinon, utiliser le retour historique classique
      router.back();
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header avec skeleton */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Contenu skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Annonce non trouvée
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Cette annonce n\'existe pas ou a été supprimée.'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Retour aux annonces
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour aux annonces</span>
              <span className="sm:hidden">Retour</span>
            </button>

            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Partager</span>
              </button>

              {/* Menu de partage (fallback) */}
              {shareMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-48">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Lien copié !' : 'Copier le lien'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Layout mobile (1 colonne) */}
        <div className="lg:hidden">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            
            {/* En-tête de l'annonce */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                
                {/* Informations principales */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center border"
                      style={{ 
                        backgroundColor: `${getAnnouncementColor()}10`, 
                        borderColor: `${getAnnouncementColor()}20` 
                      }}
                    >
                      {React.createElement(getAnnouncementIcon(), { 
                        className: "w-6 h-6", 
                        style: { color: getAnnouncementColor() } 
                      })}
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                        {announcement.title}
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">
                        Référence: {announcement.reference}
                      </p>
                    </div>
                  </div>

                  {/* Étiquette type d'offre/demande */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      announcement.type === 'request' 
                        ? (announcement.acceptsCostSharing 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-green-50 text-green-700 border border-green-200')
                        : (announcement.price 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-green-50 text-green-700 border border-green-200')
                    }`}>
                      {announcement.type === 'request' 
                        ? (announcement.acceptsCostSharing ? 'Accepte participation aux frais' : 'Transport gratuit souhaité')
                        : (announcement.price ? 'Participation aux frais' : 'Gratuit')
                      }
                    </span>
                  </div>
                </div>

                {/* Volume */}
                <div className="text-center sm:text-right">
                  <div 
                    className="text-3xl font-bold mb-1"
                    style={{ color: getAnnouncementColor() }}
                  >
                    {announcement.volume}
                  </div>
                  <div className="text-sm text-gray-500">
                    {announcement.type === 'offer' ? 'Disponible' : 'Recherché'}
                  </div>
                </div>
              </div>
            </div>

            {/* Trajet */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: getAnnouncementColor() }} />
                Itinéraire
              </h2>
              
              <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                <div className="relative">
                  {/* Ligne de connexion verticale */}
                  <div className="absolute left-[7px] top-[12px] bottom-[12px] w-[2px] bg-gray-400"></div>
                  
                  <div className="space-y-6">
                    {/* Départ */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-1"></div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{announcement.departure}</div>
                        <CityDisplay city={announcement.departureCity} />
                      </div>
                    </div>
                    
                    {/* Destination */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-1"></div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{announcement.arrival}</div>
                        <CityDisplay city={announcement.arrivalCity} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date de transport ou période */}
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                {React.createElement(getDateIcon(), { className: "w-4 h-4" })}
                <span className="font-medium">{getDateLabel()}:</span>
                <span>
                  {announcement.type === 'request' 
                    ? (announcement.periodFormatted || announcement.date)
                    : `${announcement.date} ${announcement.year}`
                  }
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <div className="max-w-none">
                <p className="text-gray-700 leading-normal">
                  {announcement.description.replace(/\n/g, ' ')}
                </p>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Informations auteur */}
                <div className="flex flex-col gap-2">
                  <div className="font-medium text-gray-900">par {announcement.author}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {announcement.publishedAt}
                  </div>
                </div>

                {/* Bouton de contact */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  {announcement.type === 'offer' ? 'Contacter' : 'Proposer mes services'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout desktop (2 colonnes) */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          
          {/* Colonne gauche - Contenu principal (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              
              {/* En-tête avec titre et référence */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center border"
                    style={{ 
                      backgroundColor: `${getAnnouncementColor()}10`, 
                      borderColor: `${getAnnouncementColor()}20` 
                    }}
                  >
                    {React.createElement(getAnnouncementIcon(), { 
                      className: "w-6 h-6", 
                      style: { color: getAnnouncementColor() } 
                    })}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {announcement.title}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Référence: {announcement.reference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trajet */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: getAnnouncementColor() }} />
                  Itinéraire
                </h2>
                
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                  <div className="relative">
                    {/* Ligne de connexion verticale */}
                    <div className="absolute left-[7px] top-[12px] bottom-[12px] w-[2px] bg-gray-400"></div>
                    
                    <div className="space-y-6">
                      {/* Départ */}
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-1"></div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{announcement.departure}</div>
                          <CityDisplay city={announcement.departureCity} />
                        </div>
                      </div>
                      
                      {/* Destination */}
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-1"></div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{announcement.arrival}</div>
                          <CityDisplay city={announcement.arrivalCity} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <div className="max-w-none">
                  <p className="text-gray-700 leading-normal">
                    {announcement.description.replace(/\n/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Card Volume et Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center mb-4">
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: getAnnouncementColor() }}
                  >
                    {announcement.volume}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {announcement.type === 'offer' ? 'Disponible' : 'Recherché'}
                  </div>
                  
                  {/* Étiquette type d'offre/demande */}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    announcement.type === 'request' 
                      ? (announcement.acceptsCostSharing 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-green-50 text-green-700 border border-green-200')
                      : (announcement.price 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-green-50 text-green-700 border border-green-200')
                  }`}>
                    {announcement.type === 'request' 
                      ? (announcement.acceptsCostSharing ? 'Accepte participation aux frais' : 'Transport gratuit souhaité')
                      : (announcement.price ? 'Participation aux frais' : 'Gratuit')
                    }
                  </span>
                </div>
              </div>

              {/* Card Date */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(getDateIcon(), { 
                    className: "w-5 h-5", 
                    style: { color: getAnnouncementColor() } 
                  })}
                  <span className="font-semibold text-gray-900">{getDateLabel()}</span>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  {announcement.type === 'request' 
                    ? (announcement.periodFormatted || announcement.date)
                    : `${announcement.date} ${announcement.year}`
                  }
                </p>
              </div>

              {/* Card Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="font-medium text-gray-900 mb-2">par {announcement.author}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {announcement.publishedAt}
                  </div>
                </div>

                {/* Bouton de contact */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full"
                >
                  {announcement.type === 'offer' ? 'Contacter' : 'Proposer mes services'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton retour mobile */}
        <div className="mt-6 sm:hidden">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Voir toutes les annonces
          </Button>
        </div>
      </div>

      {/* Modal de contact */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        announcement={{
          id: announcement.id,
          type: announcement.type,
          departure: announcement.departure,
          arrival: announcement.arrival,
          volume: announcement.volume,
          date: announcement.date,
          author: announcement.author,
          authorEmail: announcement.authorEmail || ''
        }}
      />

      {/* Overlay pour fermer le menu de partage */}
      {shareMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShareMenuOpen(false)}
        />
      )}
    </div>
  );
} 