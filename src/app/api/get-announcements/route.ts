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
  
  // Champs pour les annonces "offer"
  container_type: string;
  container_available_volume?: number;
  container_minimum_volume?: number;
  offer_type?: string;
  
  // Champs pour les annonces "search"  
  request_type: 'offer' | 'search';
  volume_needed?: number;
  accepts_fees?: boolean;
  shipping_period_formatted?: string;
  shipping_period_start?: string;
  shipping_period_end?: string;
  
  announcement_text: string;
  announcement_text_length: number;
}

// Interface pour les annonces formatées pour le frontend
interface AnnouncementFormatted {
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
  authorContact: string; // 🔒 Email masqué pour affichage uniquement
  publishedAt: string;
  description: string;
  status: string;
  // Champs spécifiques aux demandes "search"
  acceptsCostSharing?: boolean;
  periodFormatted?: string;
}

// 🔒 Fonction pour masquer les emails (sécurité RGPD)
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Contact disponible';
  
  const [username, domain] = email.split('@');
  
  // Pour les emails très courts
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  // Masquage standard : premier + derniers caractères visibles
  const visibleChars = Math.min(2, Math.floor(username.length / 3));
  const maskedLength = username.length - (visibleChars * 2);
  const maskedUsername = username.substring(0, visibleChars) + 
                        '*'.repeat(Math.max(3, maskedLength)) + 
                        username.substring(username.length - visibleChars);
                        
  return `${maskedUsername}@${domain}`;
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
    
    // Mapping des mois en abréviations françaises
    const monthsAbbr = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui',
      'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const day = date.getDate();
    const month = monthsAbbr[date.getMonth()];
    const year = date.getFullYear();
    
    // Format : "18 Déc" (jour + mois abrégé)
    // L'année sera affichée séparément dans le composant
    return `${day} ${month}`;
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', dateString, error);
    return dateString; // Retourner la date brute en cas d'erreur
  }
}

// Fonction pour extraire l'année de la date de transport
function formatShippingYear(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch (error) {
    console.warn('Erreur lors du formatage de l\'année:', dateString, error);
    return '';
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

// Gestion des requêtes OPTIONS pour CORS (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
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
    const periods = searchParams.get('periods') || ''; // Nouveau : périodes sélectionnées

    console.log('🔍 Paramètres de filtrage:', {
      type, departure, arrival, volumeMin, volumeMax, status, periods
    });

    // Appel au backend centralisé
    const queryParams = new URLSearchParams({
      status,
      ...(type !== 'all' && { type }),
      ...(departure && { departure }),
      ...(arrival && { arrival }),
      ...(volumeMin && { volumeMin }),
      ...(volumeMax && { volumeMax }),
      ...(periods && { periods }) // Transmettre les périodes au backend
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
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
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
      // Détecter le type d'annonce
      const isSearchRequest = announcement.request_type === 'search';
      
      // Traitement différencié selon le type
      if (isSearchRequest) {
        // Annonce "search" - demande de place
        const volume = announcement.volume_needed || 0;
        const items = extractItemsFromText(announcement.announcement_text, 'request');
        
        return {
          id: announcement.id,
          reference: announcement.reference,
          type: 'request' as const,
          requestType: 'search' as const,
          title: `Recherche place ${announcement.departure_country} → ${announcement.arrival_country}`,
          departure: announcement.departure_country,
          departureCity: `${announcement.departure_city} (${announcement.departure_postal_code})`,
          arrival: announcement.arrival_country,
          arrivalCity: `${announcement.arrival_city} (${announcement.arrival_postal_code})`,
          volume: `${volume} m³`,
          volumeCategory: getVolumeCategory(volume),
          date: announcement.shipping_period_formatted || 'Période flexible',
          year: '',
          price: announcement.accepts_fees ? 'Accepte participation' : 'Transport gratuit souhaité',
          items,
          author: announcement.contact_first_name,
          authorContact: maskEmail(announcement.contact_email),
          publishedAt: getTimeAgo(announcement.created_at),
          description: announcement.announcement_text,
          status: announcement.status,
          acceptsCostSharing: announcement.accepts_fees,
          periodFormatted: announcement.shipping_period_formatted
        };
      } else {
        // Annonce "offer" - proposition de place
        const volume = announcement.container_available_volume || 0;
        const offerType = announcement.offer_type || 'free';
        const items = extractItemsFromText(announcement.announcement_text, offerType);
        
        return {
          id: announcement.id,
          reference: announcement.reference,
          type: 'offer' as const,
          requestType: 'offer' as const,
          title: generateTitle(
            announcement.departure_country,
            announcement.arrival_country,
            volume,
            offerType
          ),
          departure: announcement.departure_country,
          departureCity: `${announcement.departure_city} (${announcement.departure_postal_code})`,
          arrival: announcement.arrival_country,
          arrivalCity: `${announcement.arrival_city} (${announcement.arrival_postal_code})`,
          volume: `${volume} m³`,
          volumeCategory: getVolumeCategory(volume),
          date: formatShippingDate(announcement.shipping_date),
          year: formatShippingYear(announcement.shipping_date),
          price: offerType === 'paid' ? 'Prix à négocier' : undefined,
          items,
          author: announcement.contact_first_name,
          authorContact: maskEmail(announcement.contact_email),
          publishedAt: getTimeAgo(announcement.created_at),
          description: announcement.announcement_text,
          status: announcement.status
        };
      }
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
} 