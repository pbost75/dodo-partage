import { NextRequest, NextResponse } from 'next/server';

// Interface pour les annonces reçues du backend
interface AnnouncementFromBackend {
  id: string;
  reference: string;
  status: string;
  created_at: string;
  contact_first_name: string;
  contact_email: string;
  contact_phone?: string;
  departure_country: string;
  departure_city: string;
  departure_postal_code: string;
  arrival_country: string;
  arrival_city: string;
  arrival_postal_code: string;
  shipping_date: string;
  shipping_date_formatted: string;
  container_type: string;
  container_available_volume: number;
  container_minimum_volume: number;
  offer_type: string;
  announcement_text: string;
  announcement_text_length: number;
}

// Interface pour les annonces formatées pour le frontend
interface AnnouncementFormatted {
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
  price?: string;
  items: string[];
  author: string;
  publishedAt: string;
  description: string;
  status: string;
}

// Fonction pour déterminer les objets à partir du texte d'annonce
function extractItemsFromText(text: string, offerType: string): string[] {
  const itemKeywords = {
    // Mobilier
    'mobilier': 'Mobilier',
    'meuble': 'Mobilier',
    'table': 'Mobilier',
    'chaise': 'Mobilier',
    'lit': 'Mobilier',
    'armoire': 'Mobilier',
    'commode': 'Mobilier',
    
    // Électroménager
    'electromenager': 'Électroménager',
    'électroménager': 'Électroménager',
    'frigo': 'Électroménager',
    'lave': 'Électroménager',
    'machine': 'Électroménager',
    'four': 'Électroménager',
    'micro-onde': 'Électroménager',
    
    // Cartons et emballages
    'carton': 'Cartons',
    'boite': 'Cartons',
    'caisse': 'Cartons',
    'emballage': 'Cartons',
    
    // Véhicules
    'vehicule': 'Véhicule',
    'véhicule': 'Véhicule',
    'moto': 'Véhicule',
    'voiture': 'Véhicule',
    'scooter': 'Véhicule',
    'velo': 'Véhicule',
    'vélo': 'Véhicule',
    
    // Outillage
    'outil': 'Outillage',
    'outillage': 'Outillage',
    'perceuse': 'Outillage',
    'marteau': 'Outillage',
    'bricolage': 'Outillage',
    
    // Vêtements
    'vetement': 'Vêtements',
    'vêtement': 'Vêtements',
    'habit': 'Vêtements',
    'linge': 'Vêtements',
    'textile': 'Vêtements',
    
    // Livres et documents
    'livre': 'Livres',
    'bouquin': 'Livres',
    'document': 'Livres',
    'papier': 'Livres',
    
    // Électronique
    'ordinateur': 'Appareils électroniques',
    'laptop': 'Appareils électroniques',
    'electronique': 'Appareils électroniques',
    'électronique': 'Appareils électroniques',
    'tv': 'Appareils électroniques',
    'télé': 'Appareils électroniques',
    'téléviseur': 'Appareils électroniques',
    
    // Jouets
    'jouet': 'Jouets',
    'jeu': 'Jouets',
    'peluche': 'Jouets',
    
    // Effets personnels (mots-clés étendus)
    'affaires': 'Effets personnels',
    'effet': 'Effets personnels',
    'personnel': 'Effets personnels',
    'affaire': 'Effets personnels',
    'bien': 'Effets personnels',
    'objet': 'Effets personnels',
    
    // Équipement
    'medical': 'Équipement',
    'médical': 'Équipement',
    'equipement': 'Équipement',
    'équipement': 'Équipement',
    'materiel': 'Équipement',
    'matériel': 'Équipement'
  };

  const detectedItems: string[] = [];
  const textLower = text.toLowerCase();

  for (const [keyword, item] of Object.entries(itemKeywords)) {
    if (textLower.includes(keyword) && !detectedItems.includes(item)) {
      detectedItems.push(item);
    }
  }

  // Logique améliorée pour les objets par défaut
  if (detectedItems.length === 0) {
    // Aucun objet détecté, ajouter des catégories par défaut
    if (offerType === 'free') {
      detectedItems.push('Effets personnels', 'Cartons', 'Vêtements');
    } else {
      detectedItems.push('Effets personnels', 'Cartons');
    }
  } else if (detectedItems.length === 1) {
    // Un seul objet détecté, ajouter des compléments logiques
    if (detectedItems.includes('Effets personnels')) {
      detectedItems.push('Cartons', 'Vêtements');
    } else {
      detectedItems.push('Effets personnels');
    }
  }

  return detectedItems.slice(0, 4); // Limiter à 4 objets max
}

// Fonction pour déterminer la catégorie de volume
function getVolumeCategory(volume: number): string {
  if (volume < 1) return '<1';
  if (volume <= 3) return '1-3';
  if (volume <= 5) return '3-5';
  if (volume <= 10) return '5-10';
  return '10+';
}

// Fonction pour formater le temps écoulé
function getTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Publié il y a moins d\'1 heure';
  if (diffInHours < 24) return `Publié il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Publié il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `Publié il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
}

// Fonction pour formater la date de transport
function formatShippingDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    return date.toLocaleDateString('fr-FR', options);
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', dateString, error);
    return dateString; // Retourner la date brute en cas d'erreur
  }
}

// Fonction pour générer un titre à partir des données
function generateTitle(departure: string, arrival: string, volume: number, offerType: string): string {
  const volumeStr = `${volume} m³`;
  
  if (offerType === 'paid') {
    return `Conteneur partagé ${departure} → ${arrival}`;
  } else {
    return `Groupage gratuit ${departure} → ${arrival}`;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📋 Récupération des annonces depuis le backend centralisé...');

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    // Récupération des paramètres de filtrage
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // offer, request, all
    const departure = searchParams.get('departure') || '';
    const arrival = searchParams.get('arrival') || '';
    const volumeMin = searchParams.get('volumeMin') || '';
    const volumeMax = searchParams.get('volumeMax') || '';
    const status = searchParams.get('status') || 'published'; // published, all

    console.log('🔍 Paramètres de filtrage:', {
      type, departure, arrival, volumeMin, volumeMax, status
    });

    // Appel au backend centralisé
    const queryParams = new URLSearchParams({
      status,
      ...(type !== 'all' && { type }),
      ...(departure && { departure }),
      ...(arrival && { arrival }),
      ...(volumeMin && { volumeMin }),
      ...(volumeMax && { volumeMax })
    });

    const response = await fetch(`${backendUrl}/api/partage/get-announcements?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      
      // En cas d'erreur, retourner un tableau vide plutôt qu'une erreur
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Aucune annonce disponible pour le moment',
        total: 0,
        filtered: 0
      });
    }

    const result = await response.json();
    console.log('✅ Annonces récupérées du backend:', {
      total: result.data?.length || 0,
      status: result.success ? 'succès' : 'échec'
    });

    // Formatage des annonces pour le frontend
    const announcements: AnnouncementFromBackend[] = result.data || [];
    const formattedAnnouncements: AnnouncementFormatted[] = announcements.map((announcement) => {
      const items = extractItemsFromText(announcement.announcement_text, announcement.offer_type);
      
      return {
        id: announcement.id,
        reference: announcement.reference,
        type: 'offer', // Pour l'instant, toutes les annonces sont des offres
        title: generateTitle(
          announcement.departure_country,
          announcement.arrival_country,
          announcement.container_available_volume,
          announcement.offer_type
        ),
        departure: announcement.departure_country,
        departureCity: `${announcement.departure_city} (${announcement.departure_postal_code})`,
        arrival: announcement.arrival_country,
        arrivalCity: `${announcement.arrival_city} (${announcement.arrival_postal_code})`,
        volume: `${announcement.container_available_volume} m³`,
        volumeCategory: getVolumeCategory(announcement.container_available_volume),
        date: formatShippingDate(announcement.shipping_date),
        price: announcement.offer_type === 'paid' ? 'Prix à négocier' : undefined,
        items,
        author: announcement.contact_first_name,
        publishedAt: getTimeAgo(announcement.created_at),
        description: announcement.announcement_text,
        status: announcement.status
      };
    });

    // Statistiques pour debug
    const stats = {
      total: formattedAnnouncements.length,
      byType: {
        offers: formattedAnnouncements.filter(a => a.type === 'offer').length,
        requests: formattedAnnouncements.filter(a => a.type === 'request').length
      },
      byStatus: {
        published: formattedAnnouncements.filter(a => a.status === 'published').length,
        pending: formattedAnnouncements.filter(a => a.status === 'pending_validation').length
      }
    };

    console.log('📊 Statistiques des annonces formatées:', stats);

    return NextResponse.json({
      success: true,
      data: formattedAnnouncements,
      message: `${formattedAnnouncements.length} annonce${formattedAnnouncements.length > 1 ? 's' : ''} trouvée${formattedAnnouncements.length > 1 ? 's' : ''}`,
      total: formattedAnnouncements.length,
      stats,
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des annonces',
      message: 'Une erreur technique s\'est produite',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      data: [], // Retourner un tableau vide en cas d'erreur
      backend: {
        used: 'centralized',
        url: process.env.NEXT_PUBLIC_BACKEND_URL || 'non-configuré',
        timestamp: new Date().toISOString(),
        error: true
      }
    }, { status: 500 });
  }
} 