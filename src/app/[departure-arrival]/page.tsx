import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DestinationPageServerContent from '@/components/pages/DestinationPageServerContent';
import StructuredData from '@/components/seo/StructuredData';
import { 
  generateAllDestinationCombinations, 
  validateDestinationRoute, 
  getDestinationMetadata, 
  generateUniqueContent,
  type DestinationRoute 
} from '@/utils/destinations';
import { apiFetch } from '@/utils/apiUtils';

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
  type?: 'offer' | 'request';
}

interface PageProps {
  params: Promise<{ 
    'departure-arrival': string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 🚀 GÉNÉRATION STATIQUE DES 72 PAGES DE DESTINATIONS
 * 
 * Cette fonction génère automatiquement toutes les combinaisons possibles
 * de départ-arrivée pour le pré-rendu statique Next.js.
 */
export async function generateStaticParams(): Promise<{ 'departure-arrival': string }[]> {
  const combinations = generateAllDestinationCombinations();
  
  console.log(`🏗️ Génération de ${combinations.length} pages de destinations...`);
  
  return combinations.map((route: DestinationRoute) => ({
    'departure-arrival': route.slug
  }));
}

/**
 * 🎯 GÉNÉRATION DES MÉTADONNÉES SEO DYNAMIQUES
 * 
 * Chaque page a ses propres title, description et Open Graph
 * optimisés pour le référencement géographique.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams['departure-arrival'];
  
  // Parser le slug (ex: "france-reunion" → departure="france", arrival="reunion")
  const parts = slug.split('-');
  if (parts.length < 2) {
    return {
      title: 'Page non trouvée | DodoPartage',
      description: 'Cette page de destination n\'existe pas.'
    };
  }
  
  // Reconstruction intelligente pour les slugs composés (ex: "nouvelle-caledonie")
  let departure = '';
  let arrival = '';
  
  // Essayer différentes combinaisons pour trouver la bonne séparation
  for (let i = 1; i < parts.length; i++) {
    const testDeparture = parts.slice(0, i).join('-');
    const testArrival = parts.slice(i).join('-');
    
    if (validateDestinationRoute(testDeparture, testArrival)) {
      departure = testDeparture;
      arrival = testArrival;
      break;
    }
  }
  
  if (!departure || !arrival) {
    return {
      title: 'Destination non trouvée | DodoPartage',
      description: 'Cette combinaison de destinations n\'est pas supportée.'
    };
  }
  
  return getDestinationMetadata(departure, arrival);
}

/**
 * 🌟 PAGE PRINCIPALE DE DESTINATION
 * 
 * Server Component qui pré-rend le contenu filtré côté serveur
 * pour un SEO optimal et des performances maximales.
 */
export default async function DestinationPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams['departure-arrival'];
  
  console.log(`🎯 Rendu de la page destination: ${slug}`);
  
  // Parser le slug pour extraire departure et arrival
  const parts = slug.split('-');
  if (parts.length < 2) {
    console.log(`❌ Slug invalide: ${slug}`);
    notFound();
  }
  
  // Reconstruction intelligente pour les slugs composés
  let departure = '';
  let arrival = '';
  
  for (let i = 1; i < parts.length; i++) {
    const testDeparture = parts.slice(0, i).join('-');
    const testArrival = parts.slice(i).join('-');
    
    if (validateDestinationRoute(testDeparture, testArrival)) {
      departure = testDeparture;
      arrival = testArrival;
      break;
    }
  }
  
  if (!departure || !arrival) {
    console.log(`❌ Combinaison invalide: ${slug} (departure: ${departure}, arrival: ${arrival})`);
    notFound();
  }
  
  console.log(`✅ Route validée: ${departure} → ${arrival}`);
  
  // 🎨 GÉNÉRATION DU CONTENU UNIQUE (>70% différent par destination)
  const uniqueContent = generateUniqueContent(departure, arrival);
  
  // 🚀 STRATÉGIE BUILD-TIME : Pas de pré-fetch au build, les annonces seront chargées côté client
  // Cela évite les erreurs d'URL invalides pendant la génération statique
  console.log(`📊 Build-time: Génération de la page ${departure} → ${arrival} sans pré-fetch`);
  
  // ✨ RENDU DU COMPOSANT SERVER + CLIENT (annonces chargées côté client)
    return (
    <>
      {/* 🌟 Structured Data JSON-LD pour le SEO 2025 */}
      <StructuredData departure={departure} arrival={arrival} />
      
      <DestinationPageServerContent 
        departure={departure}
        arrival={arrival}
        prerenderedAnnouncements={[]} // Vide au build, chargé côté client
        uniqueContent={uniqueContent}
      />
    </>
  );
}

/**
 * 🔄 CONFIGURATION DE REVALIDATION
 * 
 * Actualisation du contenu statique toutes les heures
 * pour maintenir les annonces à jour.
 */
export const revalidate = 3600; // 1 heure

/**
 * ⚡ OPTIMISATIONS NEXT.JS
 */
export const dynamic = 'force-static'; // Force le pré-rendu statique
export const dynamicParams = true; // Permet de nouvelles destinations sans rebuild
