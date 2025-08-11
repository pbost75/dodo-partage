import React from 'react';
import DestinationPageContent from './DestinationPageContent';
import { type DestinationContent } from '@/utils/destinations';

interface AnnouncementData {
  id: string;
  title?: string;
  departure: string;
  departureCity?: string;
  arrival: string;
  arrivalCity?: string;
  volume: string;
  date: string;
  description: string;
  author: string;
  publishedAt: string;
  price?: string;
  type?: 'offer' | 'request'; // Ajout du type pour le filtrage
}

interface DestinationPageServerContentProps {
  departure: string;
  arrival: string;
  prerenderedAnnouncements: AnnouncementData[];
  uniqueContent: DestinationContent;
}

// 🔥 CRITIQUE : Server Component qui passe les données au Client Component
export default function DestinationPageServerContent({ 
  departure, 
  arrival,
  prerenderedAnnouncements,
  uniqueContent
}: DestinationPageServerContentProps) {
  return (
    <DestinationPageContent
      departure={departure}
      arrival={arrival}
      prerenderedAnnouncements={prerenderedAnnouncements}
      uniqueContent={uniqueContent}
    />
  );
}