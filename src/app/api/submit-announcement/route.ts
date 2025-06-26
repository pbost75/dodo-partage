import { NextRequest, NextResponse } from 'next/server';
import { convertSingleDateToPeriod } from '@/utils/dateUtils';

// Interface complète pour les données de l'annonce avec toutes les données du funnel
interface AnnouncementData {
  // Données de localisation complètes
  departure: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
    isComplete?: boolean;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
    isComplete?: boolean;
  };
  
  // Date d'expédition
  shippingDate: string;
  
  // Détails du conteneur complets
  container: {
    type: '20' | '40';
    availableVolume: number;
    minimumVolume: number;
  };
  
  // Type d'offre
  offerType: 'free' | 'paid';
  
  // Texte de l'annonce
  announcementText: string;
  
  // Informations de contact complètes
  contact: {
    firstName: string;
    email: string;
    phone?: string;
  };
  
  // Métadonnées du funnel
  currentStep?: number;
  isCompleted?: boolean;
  
  // Données calculées
  announcementTextLength?: number;
  
  // Timestamps pour le suivi
  createdAt?: string;
  submittedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: AnnouncementData = await request.json();

    console.log('📥 Données reçues pour soumission:', {
      email: data.contact.email,
      firstName: data.contact.firstName,
      departure: data.departure.displayName,
      arrival: data.arrival.displayName,
      containerType: data.container.type,
      availableVolume: data.container.availableVolume,
      minimumVolume: data.container.minimumVolume,
      offerType: data.offerType,
      shippingDate: data.shippingDate,
      announcementLength: data.announcementText?.length || 0,
      phone: data.contact.phone ? 'Fourni' : 'Non fourni'
    });

    // Validation des données requises
    if (!data.contact.email || !data.contact.firstName) {
      return NextResponse.json(
        { error: 'Email et prénom sont requis' },
        { status: 400 }
      );
    }

    if (!data.departure.country || !data.arrival.country) {
      return NextResponse.json(
        { error: 'Destinations de départ et d\'arrivée sont requises' },
        { status: 400 }
      );
    }

    if (!data.container.type || !data.container.availableVolume) {
      return NextResponse.json(
        { error: 'Informations du conteneur sont requises' },
        { status: 400 }
      );
    }

    if (!data.shippingDate) {
      return NextResponse.json(
        { error: 'Date d\'expédition est requise' },
        { status: 400 }
      );
    }

    if (!data.announcementText || data.announcementText.length < 10) {
      return NextResponse.json(
        { error: 'Description de l\'annonce doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    // Conversion de la date unique en période pour les champs Airtable
    const periodData = convertSingleDateToPeriod(data.shippingDate);

    // Enrichissement des données avant envoi au backend
    const enrichedData = {
      ...data,
      // Ajout des métadonnées
      announcementTextLength: data.announcementText.length,
      submittedAt: new Date().toISOString(),
      
      // Type de requête pour Airtable
      request_type: 'offer', // Différencier des demandes "search"
      
      // Formatage de la date d'expédition en français
      shippingDateFormatted: periodData.formattedPeriod,
      
      // Nouvelles données de période pour Airtable
      shipping_period_start: periodData.startDate,
      shipping_period_end: periodData.endDate,
      shipping_period_formatted: periodData.formattedPeriod,
      
      // Ajout d'informations sur le conteneur en texte
      containerTypeDisplay: data.container.type === '20' ? '20 pieds' : '40 pieds',
      
      // Ajout de champs compatibles pour l'email - format simple pour le backend
      departureCountry: data.departure.country,
      departureCity: data.departure.city,
      departurePostalCode: data.departure.postalCode,
      
      arrivalCountry: data.arrival.country,
      arrivalCity: data.arrival.city,
      arrivalPostalCode: data.arrival.postalCode,
      
      // Pour compatibilité avec les templates email (construction du nom complet)
      departureLocation: data.departure.displayName || `${data.departure.city}, ${data.departure.country}`,
      arrivalLocation: data.arrival.displayName || `${data.arrival.city}, ${data.arrival.country}`,
      
      // Ajout du statut initial
      status: 'pending_validation',
      
      // Ajout de l'étape de finalisation
      isCompleted: true,
      currentStep: 7, // Étape finale atteinte
      
      // Informations sur l'origine de la soumission
      source: 'dodo-partage-frontend',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'Unknown'
    };

    // Envoi vers le backend centralisé Dodomove
    console.log('📤 Envoi vers le backend centralisé avec données complètes...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/submit-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      body: JSON.stringify(enrichedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de communication avec le serveur' }));
      console.error('❌ Erreur backend:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Gestion spécifique des erreurs de doublons
      if (response.status === 429) {
        console.log('⚠️ Détection de doublon potentiel (verrou) - Traité comme succès');
        return NextResponse.json({
          success: true,
          message: 'Annonce déjà créée ou en cours de traitement',
          isDuplicate: true,
          data: {
            email: data.contact.email,
            status: 'pending_validation',
            message: 'Une annonce similaire a déjà été soumise récemment'
          },
          nextSteps: [
            'Vérifiez votre boîte email pour l\'email de confirmation',
            'Si vous n\'avez pas reçu d\'email, vérifiez vos spams',
            'L\'annonce sera visible après validation par email'
          ]
        }, { status: 200 }); // 200 au lieu de 429 pour éviter l'erreur côté frontend
      }
      
      // Gestion spécifique des doublons détectés dans la base de données
      if (response.status === 409) {
        console.log('⚠️ Doublon détecté dans la base - Traité comme succès');
        return NextResponse.json({
          success: true,
          message: 'Annonce déjà existante',
          isDuplicate: true,
          data: {
            email: data.contact.email,
            status: 'duplicate_detected',
            message: 'Une annonce similaire existe déjà pour cette adresse email'
          },
          nextSteps: [
            'Une annonce similaire a déjà été créée récemment',
            'Vérifiez votre boîte email pour l\'email de confirmation',
            'Si vous souhaitez créer une nouvelle annonce, attendez quelques minutes',
            'Si vous n\'avez pas reçu d\'email, vérifiez vos spams'
          ]
        }, { status: 200 }); // 200 au lieu de 409 pour éviter l'erreur côté frontend
      }
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la sauvegarde de l\'annonce',
          details: errorData.error || `Erreur serveur (${response.status})`,
          suggestion: 'Veuillez réessayer dans quelques instants'
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Annonce soumise avec succès via le backend centralisé:', {
      reference: result.data?.reference,
      recordId: result.data?.recordId,
      status: result.data?.status
    });

    // Réponse de succès avec toutes les informations
    return NextResponse.json({
      success: true,
      message: result.message || 'Annonce créée avec succès !',
      data: {
        reference: result.data?.reference,
        recordId: result.data?.recordId,
        email: data.contact.email,
        firstName: data.contact.firstName,
        departure: data.departure.displayName,
        arrival: data.arrival.displayName,
        shippingDate: data.shippingDate,
        shippingDateFormatted: enrichedData.shippingDateFormatted,
        containerType: enrichedData.containerTypeDisplay,
        availableVolume: data.container.availableVolume,
        minimumVolume: data.container.minimumVolume,
        offerType: data.offerType === 'free' ? 'Gratuit' : 'Avec participation aux frais',
        status: result.data?.status || 'En attente de validation',
        validationEmailSent: result.data?.validationEmailSent || true
      },
      nextSteps: result.nextSteps || [
        'Un email de confirmation a été envoyé à votre adresse',
        'Cliquez sur le lien dans l\'email pour valider votre annonce',
        'Votre annonce sera visible après validation',
        'Vous recevrez les demandes de contact par email'
      ],
      validation: {
        emailRequired: true,
        tokenSent: true,
        expiresIn: '7 jours'
      },
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString(),
        dataCompleteness: 'full'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la soumission:', error);
    
    // Log détaillé pour le debugging
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la soumission de l\'annonce',
        message: 'Une erreur technique s\'est produite. Veuillez réessayer.',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        suggestion: 'Si le problème persiste, contactez notre support à support@dodomove.fr',
        backend: {
          used: 'centralized',
          url: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app',
          timestamp: new Date().toISOString(),
          error: true
        }
      },
      { status: 500 }
    );
  }
} 