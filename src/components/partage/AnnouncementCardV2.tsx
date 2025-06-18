'use client';

import React from 'react';
import Link from 'next/link';
import { Ship, Anchor } from 'lucide-react';

interface AnnouncementProps {
  id: string;
  type: 'offer' | 'request';
  departure: string;
  departureCity?: string;
  arrival: string;
  arrivalCity?: string;
  volume: string;
  date: string;
  items: string[];
  author: string;
  publishedAt: string;
  description: string;
  price?: string;
}

const AnnouncementCardV2: React.FC<AnnouncementProps> = ({
  id,
  type,
  departure,
  departureCity,
  arrival,
  arrivalCity,
  volume,
  date,
  items,
  author,
  publishedAt,
  description,
  price,
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

  // Composant pour afficher une ville avec icône d'ancre si c'est un port
  const CityDisplay: React.FC<{ city: string; className?: string }> = ({ city, className = "" }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-500">{city}</span>
      {isPort(city) && <Anchor className="w-2 h-2 text-gray-400 opacity-60" strokeWidth={1.5} />}
    </div>
  );

  return (
    <Link href={`/annonce/${id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4 sm:p-6 cursor-pointer">
        {/* Version Mobile Optimisée */}
        <div className="sm:hidden">
                      {/* Layout horizontal compact : Date + Trajet + Volume */}
            <div className="flex items-start gap-3 mb-4">
            {/* Date alignée avec la hauteur du trajet */}
            <div className="w-16 h-16 bg-[#F47D6C]/10 rounded-lg flex flex-col items-center justify-center border border-[#F47D6C]/20 flex-shrink-0">
              <Ship className="w-4 h-4 text-[#F47D6C] mb-1" />
              <div className="text-xs font-semibold text-[#F47D6C] text-center leading-tight px-1">
                {date.includes('-') ? 'Période' : date.split(' ').slice(0, 2).join(' ')}
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
              <div className="text-lg font-bold text-[#F47D6C]">{volume}</div>
              <div className="text-xs text-gray-500">
                {type === 'offer' ? 'Disponible' : 'Recherché'}
              </div>
            </div>
          </div>

          {/* Description compacte */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              {displayedDescription}
            </p>
          </div>

          {/* Footer compact avec badge et auteur sur la même ligne */}
          <div className="flex items-center justify-between">
            {/* Étiquette type d'offre */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              price 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {price ? '💰 Participation aux frais' : '🎁 Gratuit'}
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
          <div className="flex-shrink-0 w-20 h-20 bg-[#F47D6C]/10 rounded-xl flex flex-col items-center justify-center border border-[#F47D6C]/20 self-start">
            <Ship className="w-6 h-6 text-[#F47D6C] mb-1" />
            <div className="text-xs font-semibold text-[#F47D6C] text-center leading-tight px-1">
              {date.includes('-') ? 'Période' : date.split(' ').slice(0, 2).join(' ')}
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
                <div className="text-lg font-bold text-[#F47D6C]">{volume}</div>
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
              {/* Étiquette type d'offre */}
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  price 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {price ? '💰 Participation aux frais' : '🎁 Gratuit'}
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