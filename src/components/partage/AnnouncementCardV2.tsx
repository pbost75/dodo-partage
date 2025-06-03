'use client';

import React, { useState } from 'react';
import { Ship, MapPin, Home, Zap, Package, Car, Wrench, Shirt, Book, Wine, Laptop, Gamepad2, Anchor } from 'lucide-react';
import Button from '@/components/ui/Button';

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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Limite de caractères pour l'affichage tronqué
  const CHAR_LIMIT = 100;
  const shouldTruncate = description.length > CHAR_LIMIT;
  const displayedDescription = shouldTruncate && !isExpanded 
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

  // Mapping des objets vers des pictogrammes minimalistes avec cercles
  const getItemIcon = (item: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Mobilier': <Home className="w-3 h-3" />,
      'Électroménager': <Zap className="w-3 h-3" />,
      'Cartons': <Package className="w-3 h-3" />,
      'Véhicule': <Car className="w-3 h-3" />,
      'Outillage': <Wrench className="w-3 h-3" />,
      'Effets personnels': <Shirt className="w-3 h-3" />,
      'Livres': <Book className="w-3 h-3" />,
      'Objets fragiles': <Wine className="w-3 h-3" />,
      'Appareils électroniques': <Laptop className="w-3 h-3" />,
      'Vêtements': <Shirt className="w-3 h-3" />,
      'Jouets': <Gamepad2 className="w-3 h-3" />,
      'Instruments de musique': <Package className="w-3 h-3" />,
      'Équipement': <Wrench className="w-3 h-3" />,
    };
    return iconMap[item] || <Package className="w-3 h-3" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4 sm:p-6">
      {/* Version Mobile */}
      <div className="sm:hidden">
        {/* Header mobile : date dans encart + volume à droite */}
        <div className="flex items-start justify-between mb-4">
          {/* Date dans un encart comme desktop */}
          <div className="w-16 h-16 bg-[#F47D6C]/10 rounded-lg flex flex-col items-center justify-center border border-[#F47D6C]/20">
            <Ship className="w-4 h-4 text-[#F47D6C] mb-1" />
            <div className="text-xs font-semibold text-[#F47D6C] text-center leading-tight px-1">
              {date.includes('-') ? 'Période' : date.split(' ').slice(0, 2).join(' ')}
            </div>
          </div>
          
          {/* Volume à droite comme desktop */}
          <div className="text-right">
            <div className="text-xl font-bold text-[#F47D6C]">{volume}</div>
            <div className="text-xs text-gray-500">
              {type === 'offer' ? 'Disponible' : 'Recherché'}
            </div>
          </div>
        </div>

        {/* Trajet mobile avec même format que desktop */}
        <div className="mb-4">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
            <div className="relative">
              {/* Ligne de connexion verticale plus épaisse - perfectement alignée avec les points 16px */}
              <div className="absolute left-[7px] top-[10px] bottom-[10px] w-[2px] bg-gray-400"></div>
              
              <div className="space-y-4">
                {/* Départ */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-4 aspect-square rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-0.5"></div>
                  <div>
                    <span className="text-base font-medium text-gray-900">{departure}</span>
                    {departureCity && (
                      <CityDisplay city={departureCity} className="mt-0.5" />
                    )}
                  </div>
                </div>
                
                {/* Destination */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-4 aspect-square rounded-full border-2 border-gray-400 bg-white flex-shrink-0 mt-0.5"></div>
                  <div>
                    <span className="text-base font-medium text-gray-900">{arrival}</span>
                    {arrivalCity && (
                      <CityDisplay city={arrivalCity} className="mt-0.5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayedDescription}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-[#F47D6C] text-sm font-medium hover:text-[#e66b5a] transition-colors duration-200 focus:outline-none focus:underline"
              >
                {isExpanded ? 'voir moins' : 'voir plus'}
              </button>
            )}
          </p>
        </div>

        {/* Pictogrammes */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {items.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              title={item}
            >
              {getItemIcon(item)}
            </div>
          ))}
          {items.length > 4 && (
            <span className="text-xs text-gray-500 ml-1">
              +{items.length - 4}
            </span>
          )}
        </div>

        {/* Footer mobile */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-2 border-[#F47D6C] text-[#F47D6C] bg-white hover:bg-[#F47D6C] hover:text-white py-3 shadow-none transition-all duration-200 font-medium"
          >
            {type === 'offer' ? 'Contacter' : 'Proposer'}
          </Button>
          
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <span>{publishedAt}</span>
            <span>•</span>
            <span className="font-medium text-gray-900">par {author}</span>
          </div>
        </div>
      </div>

      {/* Version Desktop (inchangée) */}
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

          {/* Description avec "voir plus" */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {displayedDescription}
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-[#F47D6C] text-sm font-medium hover:text-[#e66b5a] transition-colors duration-200 focus:outline-none focus:underline"
                >
                  {isExpanded ? 'voir moins' : 'voir plus'}
                </button>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Pictogrammes des objets autorisés */}
            <div className="flex items-center gap-2">
              {items.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                  title={item}
                >
                  {getItemIcon(item)}
                </div>
              ))}
              {items.length > 4 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{items.length - 4}
                </span>
              )}
            </div>

            {/* Auteur et action */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">{publishedAt}</div>
                <div className="text-sm font-medium text-gray-900">par {author}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-[#F47D6C] text-[#F47D6C] bg-white hover:bg-[#F47D6C] hover:text-white px-4 py-2 shadow-none transition-all duration-200"
              >
                {type === 'offer' ? 'Contacter' : 'Proposer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCardV2; 