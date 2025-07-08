'use client';

import React from 'react';
import Link from 'next/link';
import { createHref } from '@/utils/navigation';
import { Ship, Anchor, Search } from 'lucide-react';

interface AnnouncementProps {
  id: string;
  reference: string;
  type: 'offer' | 'request';
  departure: string;
  departureCity?: string;
  arrival: string;
  arrivalCity?: string;
  volume: string;
  date: string;
  year: string;
  items: string[];
  author: string;
  publishedAt: string;
  description: string;
  price?: string;
  acceptsCostSharing?: boolean; // Ajout du champ manquant
}

interface AnnouncementCardV2Props extends AnnouncementProps {
  searchParams?: string; // Paramètres de recherche à préserver
}

const AnnouncementCardV2: React.FC<AnnouncementCardV2Props> = ({
  id,
  reference,
  type,
  departure,
  departureCity,
  arrival,
  arrivalCity,
  volume,
  date,
  year,
  items,
  author,
  publishedAt,
  description,
  price,
  acceptsCostSharing,
  searchParams = '',
}) => {
  // Limite de caractères pour l'affichage tronqué
  const CHAR_LIMIT = 100;
  const shouldTruncate = description.length > CHAR_LIMIT;
  const displayedDescription = shouldTruncate 
    ? description.slice(0, CHAR_LIMIT) + '...'
    : description;

  // Fonction pour détecter si c'est un port (basée sur des noms de villes portuaires)
  const isPort = (cityName: string): boolean => {
    const portCities = [
      'Le Havre', 'Marseille', 'Bordeaux', 'Nouméa', 'Port-Est', 'Fort-de-France', 
      'Pointe-à-Pitre', 'Longoni', 'Dégrad des Cannes'
    ];
    return portCities.some(port => cityName.toLowerCase().includes(port.toLowerCase()));
  };

  // Fonction pour obtenir le texte de prix correct selon le type d'annonce
  const getPriceText = (): string => {
    if (type === 'offer') {
      // Pour les offres : basé sur le champ price
      return price ? 'Participation aux frais' : 'Gratuit';
    } else {
      // Pour les demandes : basé sur acceptsCostSharing
      if (acceptsCostSharing === true) {
        return 'Accepte participation aux frais';
      } else if (acceptsCostSharing === false) {
        return 'Transport gratuit souhaité';
      } else {
        // Fallback au cas où la valeur serait null/undefined
        return price ? 'Participation aux frais' : 'Gratuit';
      }
    }
  };

  // Composant pour afficher une ville avec icône d'ancre si c'est un port
  const CityDisplay: React.FC<{ city: string; className?: string }> = ({ city, className = "" }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-500">{city}</span>
      {isPort(city) && <Anchor className="w-2 h-2 text-gray-400 opacity-60" strokeWidth={1.5} />}
    </div>
  );

  // Fonctions utilitaires pour l'affichage selon le type
  const getIcon = () => {
    return type === 'request' ? Search : Ship;
  };

  const getColor = () => {
    return type === 'request' ? '#3B82F6' : '#F47D6C'; // Bleu pour search, rouge-orange pour offer
  };

  const getBgColor = () => {
    return type === 'request' ? 'bg-blue-500/10' : 'bg-[#F47D6C]/10';
  };

  const getBorderColor = () => {
    return type === 'request' ? 'border-blue-500/20' : 'border-[#F47D6C]/20';
  };

  const getTextColor = () => {
    return type === 'request' ? 'text-blue-600' : 'text-[#F47D6C]';
  };

  // Construire l'URL de détail avec les paramètres de recherche
  const basePath = `/annonce/${reference}`;
  const detailUrl = searchParams 
    ? `${basePath}?${searchParams}`
    : basePath;

  // 🔥 CORRECTION PROXY : Sauvegarder les paramètres au clic pour garantir leur préservation
  const handleAnnouncementClick = () => {
    if (searchParams && typeof window !== 'undefined') {
      sessionStorage.setItem('dodopartage_search_params', searchParams);
      console.log('🔄 Paramètres sauvés au clic sur l\'annonce:', searchParams);
    }
  };

  const IconComponent = getIcon();

  return (
    <Link href={createHref(detailUrl)} className="block" onClick={handleAnnouncementClick}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4 sm:p-6 cursor-pointer">
        {/* Version Mobile Optimisée */}
        <div className="sm:hidden">
          {/* Layout horizontal compact : Date + Trajet + Volume */}
          <div className="flex items-start gap-3 mb-4">
            {/* Date alignée avec la hauteur du trajet */}
            <div className={`w-16 h-16 ${getBgColor()} rounded-lg flex flex-col items-center justify-center ${getBorderColor()} border flex-shrink-0`}>
              <IconComponent className={`w-4 h-4 ${getTextColor()} mb-1`} />
              <div className={`text-xs font-semibold ${getTextColor()} text-center leading-tight px-1`}>
                {date.includes('-') ? 'Période' : (
                  <>
                    <div>{date}</div>
                    <div className="text-[10px] opacity-75">{year}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Trajet vertical compact aligné */}
            <div className="flex-1 min-w-0 py-1">
              <div className="relative h-14">
                {/* Ligne de connexion verticale */}
                <div className="absolute left-[6px] top-[8px] bottom-[8px] w-0.5 bg-gray-400"></div>
                
                <div className="flex flex-col justify-between h-full">
                  {/* Départ */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-3 h-3 rounded-full border border-gray-400 bg-white flex-shrink-0 mt-0.5"></div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 block truncate">{departure}</span>
                      {departureCity && (
                        <CityDisplay city={departureCity} />
                      )}
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-3 h-3 rounded-full border border-gray-400 bg-white flex-shrink-0 mt-0.5"></div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 block truncate">{arrival}</span>
                      {arrivalCity && (
                        <CityDisplay city={arrivalCity} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Volume compact */}
            <div className="text-right flex-shrink-0">
              <div className={`text-lg font-bold ${getTextColor()}`}>{volume}</div>
              <div className="text-xs text-gray-500">
                {type === 'offer' ? 'Disponible' : 'Recherché'}
              </div>
            </div>
          </div>

          {/* Description compacte - une ligne maximum sur mobile */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-nowrap truncate">
              {description}
            </p>
          </div>

          {/* Footer compact avec badge et auteur sur la même ligne */}
          <div className="flex items-center justify-between">
            {/* Étiquette type d'offre discrète */}
            <span className="inline-flex items-center px-2 py-1 rounded text-xs text-gray-500 bg-gray-50">
              {getPriceText()}
            </span>

            {/* Auteur */}
            <div className="text-right">
              <div className="text-xs text-gray-500">{publishedAt}</div>
              <div className="text-xs font-medium text-gray-900">par {author}</div>
            </div>
          </div>
        </div>

        {/* Version Desktop */}
        <div className="hidden sm:flex gap-6">
          {/* Zone Date (remplace l'image) */}
          <div className={`flex-shrink-0 w-20 h-20 ${getBgColor()} rounded-xl flex flex-col items-center justify-center ${getBorderColor()} border self-start`}>
            <IconComponent className={`w-6 h-6 ${getTextColor()} mb-1`} />
            <div className={`text-xs font-semibold ${getTextColor()} text-center leading-tight px-1`}>
              {date.includes('-') ? 'Période' : (
                <>
                  <div>{date}</div>
                  <div className="text-[10px] opacity-75">{year}</div>
                </>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              {/* Trajet vertical */}
              <div className="flex-1">
                <div className="relative">
                  {/* Ligne de connexion verticale - parfaitement centrée avec les points 12px décalés */}
                  <div className="absolute left-[5px] top-[9px] bottom-[9px] w-0.5 bg-gray-400"></div>
                  
                  <div className="space-y-3">
                    {/* Départ */}
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-3 aspect-square rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-[3px]"></div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 block truncate">{departure}</span>
                        {departureCity && (
                          <CityDisplay city={departureCity} />
                        )}
                      </div>
                    </div>
                    
                    {/* Destination */}
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-3 aspect-square rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-[3px]"></div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 block truncate">{arrival}</span>
                        {arrivalCity && (
                          <CityDisplay city={arrivalCity} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="text-right">
                <div className={`text-lg font-bold ${getTextColor()}`}>{volume}</div>
                <div className="text-xs text-gray-500">
                  {type === 'offer' ? 'Disponible' : 'Recherché'}
                </div>
              </div>
            </div>

            {/* Description sans bouton "voir plus" */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {displayedDescription}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Étiquette type d'offre discrète */}
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs text-gray-500 bg-gray-50">
                  {getPriceText()}
                </span>
              </div>

              {/* Auteur */}
              <div className="text-right">
                <div className="text-xs text-gray-500">{publishedAt}</div>
                <div className="text-sm font-medium text-gray-900">par {author}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnnouncementCardV2; 