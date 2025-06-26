import { NextRequest, NextResponse } from 'next/server';
import { convertSingleDateToPeriod, convertSelectedMonthsToDates, convertDatesToSelectedMonths } from '@/utils/dateUtils';

interface UpdateAnnouncementRequest {
  reference: string;
  status: string;
  contact: {
    firstName: string;
    email: string;
    phone?: string;
  };
  departure: {
    country: string;
    city: string;
    postalCode: string;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
  };
  shippingDate: string;
  container: {
    type: string;
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: string;
  announcementText: string;
  updatedAt: string;
  // Nouveaux champs pour les demandes "search"
  shippingPeriod?: string[];
  volumeNeeded?: number;
  acceptsFees?: boolean;
  request_type?: 'offer' | 'search';
}

// Route GET pour récupérer les données d'une annonce à modifier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log('📥 Récupération des données pour édition, token:', token);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    // Récupérer les données depuis le backend
    const response = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
    
    if (!response.ok) {
      console.error('❌ Erreur backend:', response.status);
      return NextResponse.json(
        { success: false, error: 'Annonce introuvable' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.error('❌ Données manquantes dans la réponse backend');
      return NextResponse.json(
        { success: false, error: 'Données d\'annonce introuvables' },
        { status: 404 }
      );
    }

    const rawData = result.data;
    console.log('📋 Données brutes récupérées:', {
      requestType: rawData.requestType,
      hasShippingPeriodStart: !!rawData.shipping_period_start,
      hasShippingPeriodEnd: !!rawData.shipping_period_end,
      hasShippingDate: !!rawData.shippingDate
    });

    // Conversion des données selon le type d'annonce
    let processedData = { ...rawData };

    if (rawData.requestType === 'search') {
      // Pour les demandes de place, reconstruire shippingPeriod depuis les dates
      if (rawData.shipping_period_start && rawData.shipping_period_end) {
        const selectedMonths = convertDatesToSelectedMonths(
          rawData.shipping_period_start,
          rawData.shipping_period_end
        );
        processedData.shippingPeriod = selectedMonths;
        console.log('🔄 Période reconstruite pour search:', selectedMonths);
      }
    } else {
      // Pour les offres, garder la date unique
      // Les dates start/end sont déjà présentes pour l'affichage
      console.log('📅 Offre avec date unique:', rawData.shippingDate);
    }

    console.log('✅ Données traitées avec succès');
    
    return NextResponse.json({
      success: true,
      data: processedData
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des données',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log('📝 Demande de mise à jour d\'annonce reçue pour token:', token);

    // Parse des données du formulaire
    const data: UpdateAnnouncementRequest = await request.json();
    console.log('📥 Données de mise à jour reçues:', {
      reference: data.reference,
      contact: data.contact.firstName,
      departure: `${data.departure.city} → ${data.arrival.city}`,
      updatedAt: data.updatedAt
    });

    // Validation des données obligatoires
    if (!data.contact.firstName || !data.contact.email || !data.announcementText) {
      console.error('❌ Données obligatoires manquantes');
      return NextResponse.json(
        { success: false, error: 'Données obligatoires manquantes' },
        { status: 400 }
      );
    }

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    console.log('📤 Envoi vers le backend centralisé...');

    // D'abord récupérer les données actuelles
    const getCurrentResponse = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
    if (!getCurrentResponse.ok) {
      throw new Error('Impossible de récupérer les données actuelles');
    }
    
    const currentResult = await getCurrentResponse.json();
    if (!currentResult.success || !currentResult.data) {
      throw new Error('Données actuelles introuvables');
    }
    
    const currentData = currentResult.data;
    
    // Traitement différent selon le type d'annonce
    let periodData: any = {};
    
    if (currentData.requestType === 'search' && data.shippingPeriod) {
      // Pour les demandes search, convertir la période sélectionnée en dates
      const convertedPeriod = convertSelectedMonthsToDates(data.shippingPeriod);
      periodData = {
        shipping_period_start: convertedPeriod.startDate,
        shipping_period_end: convertedPeriod.endDate,
        shipping_period_formatted: convertedPeriod.formattedPeriod,
        shippingPeriod: data.shippingPeriod // Garder aussi l'array pour le frontend
      };
    } else if (currentData.requestType === 'offer' && data.shippingDate) {
      // Pour les annonces offer, convertir la date unique en période
      const convertedDate = convertSingleDateToPeriod(data.shippingDate);
      periodData = {
        shippingDate: data.shippingDate,
        shipping_period_start: convertedDate.startDate,
        shipping_period_end: convertedDate.endDate,
        shipping_period_formatted: convertedDate.formattedPeriod
      };
    }
    
    // Respecter l'API backend en envoyant tous les champs attendus
    // mais en gardant les valeurs non-modifiables actuelles
    const mergedData = {
      contact: {
        firstName: currentData.contact.firstName, // Garder le prénom actuel (non modifiable)
        email: currentData.contact.email, // Garder l'email actuel (non modifiable)
        phone: currentData.contact.phone || '' // Garder le téléphone actuel (non modifiable)
        // Volontairement PAS de lastName pour éviter l'erreur Airtable
      },
      departure: {
        country: currentData.departure.country, // Garder le départ actuel (non modifiable)
        city: currentData.departure.city,
        postalCode: currentData.departure.postalCode || ''
      },
      arrival: {
        country: currentData.arrival.country, // Garder l'arrivée actuelle (non modifiable)
        city: currentData.arrival.city,
        postalCode: currentData.arrival.postalCode || ''
      },
      // Ajouter les données de période converties
      ...periodData,
      // Champs spécifiques selon le type
      ...(currentData.requestType === 'search' ? {
        volumeNeeded: data.volumeNeeded,
        acceptsFees: data.acceptsFees
      } : {
        container: {
          type: currentData.container.type, // Garder le type de conteneur actuel
          availableVolume: data.container.availableVolume,
          minimumVolume: data.container.minimumVolume
        },
        offerType: data.offerType
      }),
      announcementText: data.announcementText,
      source: 'dodo-partage-frontend',
      timestamp: new Date().toISOString()
    };

    // Appel au backend centralisé pour la mise à jour
    const response = await fetch(`${backendUrl}/api/partage/update-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editToken: token,
        data: mergedData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Annonce mise à jour avec succès via le backend centralisé:', result);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Votre annonce a été mise à jour avec succès !',
      data: {
        reference: data.reference,
        updatedAt: data.updatedAt,
        contact: data.contact.firstName,
        announcement: {
          departure: `${data.departure.city}, ${data.departure.country}`,
          arrival: `${data.arrival.city}, ${data.arrival.country}`,
          volume: data.container.availableVolume,
          offerType: data.offerType
        }
      },
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'annonce:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la mise à jour de votre annonce',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 