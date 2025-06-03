'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ship } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface AnnouncementCardProps {
  id: string;
  type: 'offer' | 'request';
  title: string;
  departure: string;
  arrival: string;
  volume: string;
  date: string;
  price?: string;
  items: string[];
  author: string;
  publishedAt: string;
  description?: string;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  id,
  type,
  title,
  departure,
  arrival,
  volume,
  date,
  price,
  items,
  author,
  publishedAt,
  description
}) => {
  const isOffer = type === 'offer';

  return (
    <Card hover className="group border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="p-4 sm:p-6">
        {/* 1. INFORMATIONS CLÉS : Date + Volume */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          {/* Date mise en avant */}
          <div className="rounded-xl p-3 sm:p-4 border border-gray-200 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-xs sm:text-sm">📅</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                  {isOffer ? date : `Avril 2024`}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  {isOffer ? 'Date de départ' : 'Période'}
                </div>
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="text-center bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
              {volume}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {isOffer ? 'disponible' : 'recherché'}
            </div>
          </div>
        </div>

        {/* 2. TRAJET : Destinations avec background dégradé */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-red-50 via-orange-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-orange-100/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              {/* Départ */}
              <div className="text-center sm:text-left flex-1">
                <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {departure}
                </div>
                <div className="text-sm text-orange-600 font-medium">Départ</div>
              </div>
              
              {/* Ligne de connexion avec bateau au centre */}
              <div className="flex sm:hidden items-center gap-1 my-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F47D6C]"></div>
                <div className="w-8 h-px bg-gradient-to-r from-[#F47D6C] to-orange-400"></div>
                <Ship className="w-4 h-4 text-gray-600 rotate-90" />
                <div className="w-8 h-px bg-gradient-to-r from-orange-400 to-pink-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              </div>
              
              {/* Version desktop */}
              <div className="hidden sm:flex items-center gap-2 mx-4 lg:mx-8">
                <div className="w-2 h-2 rounded-full bg-[#F47D6C]"></div>
                <div className="w-12 lg:w-16 h-px bg-gradient-to-r from-[#F47D6C] to-orange-400"></div>
                <Ship className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                <div className="w-12 lg:w-16 h-px bg-gradient-to-r from-orange-400 to-pink-400"></div>
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              </div>
              
              {/* Arrivée */}
              <div className="text-center sm:text-right flex-1">
                <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {arrival}
                </div>
                <div className="text-sm text-orange-600 font-medium">Destination</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTENU DESCRIPTIF : Message puis objets acceptés */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Description en premier */}
          {description && (
            <div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Types d'objets acceptés (sans label) */}
          {items.length > 0 && (
            <div>
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5 text-gray-400 flex-shrink-0">✓</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {items.slice(0, 4).map((item, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                    >
                      {item}
                    </span>
                  ))}
                  {items.length > 4 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                      +{items.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER : Auteur + Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                {author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{author}</div>
              <div className="text-xs text-gray-500">
                Membre vérifié • {publishedAt}
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-300 text-gray-700 hover:border-[#F47D6C] hover:text-[#F47D6C] hover:bg-red-50 w-full sm:w-auto"
          >
            Contacter
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AnnouncementCard; 