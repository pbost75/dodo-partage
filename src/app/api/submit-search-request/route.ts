import { NextRequest, NextResponse } from 'next/server';

// Interface pour les données de demande de place (funnel search)
interface SearchRequestData {
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
  
  // Période d'expédition flexible
  shippingPeriod: {
    period: 'flexible' | 'specific' | '';
    selectedMonths?: string[];
    urgency: 'urgent' | 'normal' | 'flexible' | '';
  };
  
  // Volume recherché avec données calculateur
  volumeNeeded: {
    neededVolume: number;
    usedCalculator?: boolean;
    listingItems?: string;
    volumeDescription?: string;
  };
  
  // Budget/participation aux frais
  budget: {
    acceptsFees: boolean | null;
  };
  
  // Texte de l'annonce/demande
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
  funnelType: 'search';
  
  // Timestamps pour le suivi
  createdAt?: string;
  submittedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: SearchRequestData = await request.json();

    console.log('📥 Demande de place reçue pour soumission:', {
      email: data.contact.email,
      firstName: data.contact.firstName,
      departure: data.departure.displayName,
      arrival: data.arrival.displayName,
      volumeNeeded: data.volumeNeeded.neededVolume,
      acceptsFees: data.budget.acceptsFees,
      selectedMonths: data.shippingPeriod.selectedMonths?.join(', ') || 'Aucun',
      urgency: data.shippingPeriod.urgency,
      announcementLength: data.announcementText?.length || 0,
      phone: data.contact.phone ? 'Fourni' : 'Non fourni',
      usedCalculator: data.volumeNeeded.usedCalculator || false
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

    if (!data.volumeNeeded.neededVolume || data.volumeNeeded.neededVolume <= 0) {
      return NextResponse.json(
        { error: 'Volume recherché doit être supérieur à 0' },
        { status: 400 }
      );
    }

    if (data.budget.acceptsFees === null) {
      return NextResponse.json(
        { error: 'Position sur la participation aux frais est requise' },
        { status: 400 }
      );
    }

    if (!data.announcementText || data.announcementText.length < 10) {
      return NextResponse.json(
        { error: 'Description de la demande doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    // Enrichissement des données avant envoi au backend
    const enrichedData = {
      ...data,
      // Ajout des métadonnées
      announcementTextLength: data.announcementText.length,
      submittedAt: new Date().toISOString(),
      
      // Formatage des mois sélectionnés
      shippingMonthsFormatted: data.shippingPeriod.selectedMonths?.join(', ') || 'Flexible',
      
      // Ajout d'informations sur le volume en texte
      volumeDisplay: `${data.volumeNeeded.neededVolume} m³`,
      budgetDisplay: data.budget.acceptsFees ? 'Accepte de participer aux frais' : 'Ne souhaite pas participer aux frais',
      
      // Ajout de champs compatibles pour l'email - format simple pour le backend
      departureCountry: data.departure.country,
      departureCity: data.departure.city,
      departurePostalCode: data.departure.postalCode,
      
      arrivalCountry: data.arrival.country,
      arrivalCity: data.arrival.city,
      arrivalPostalCode: data.arrival.postalCode,
      
      // Pour compatibilité avec les templates email
      departureLocation: data.departure.displayName || `${data.departure.city}, ${data.departure.country}`,
      arrivalLocation: data.arrival.displayName || `${data.arrival.city}, ${data.arrival.country}`,
      
      // Ajout du statut initial pour les demandes
      status: 'pending_validation',
      requestType: 'search', // Différencier des annonces "propose"
      
      // Ajout de l'étape de finalisation
      isCompleted: true,
      currentStep: 6, // Étape finale du funnel search
      
      // Informations sur l'origine de la soumission
      source: 'dodo-partage-search-frontend',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'Unknown',
      
      // Données spécifiques au calculateur si utilisé
      ...(data.volumeNeeded.usedCalculator && {
        calculatorData: {
          usedCalculator: true,
          listingItems: data.volumeNeeded.listingItems,
          volumeDescription: data.volumeNeeded.volumeDescription
        }
      })
    };

    // Envoi vers le backend centralisé Dodomove
    console.log('📤 Envoi de la demande de place vers le backend centralisé...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/submit-search-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage-search',
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
          message: 'Demande déjà créée ou en cours de traitement',
          isDuplicate: true,
          data: {
            email: data.contact.email,
            status: 'pending_validation',
            message: 'Une demande similaire a déjà été soumise récemment'
          },
          nextSteps: [
            'Vérifiez votre boîte email pour l\'email de confirmation',
            'Si vous n\'avez pas reçu d\'email, vérifiez vos spams',
            'La demande sera visible après validation par email'
          ]
        }, { status: 200 });
      }
      
      // Gestion spécifique des doublons détectés dans la base de données
      if (response.status === 409) {
        console.log('⚠️ Doublon détecté dans la base - Traité comme succès');
        return NextResponse.json({
          success: true,
          message: 'Demande déjà existante',
          isDuplicate: true,
          data: {
            email: data.contact.email,
            status: 'existing',
            message: 'Une demande identique existe déjà'
          },
          nextSteps: [
            'Votre demande précédente est toujours active',
            'Consultez votre email de confirmation pour la gérer',
            'Vous pouvez modifier ou supprimer votre demande via les liens dans l\'email'
          ]
        }, { status: 200 });
      }
      
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Demande de place soumise avec succès:', result);

    return NextResponse.json({
      success: true,
      message: 'Demande de place soumise avec succès',
      data: result,
      nextSteps: [
        'Un email de validation a été envoyé à votre adresse',
        'Cliquez sur le lien dans l\'email pour confirmer votre demande',
        'Votre demande sera ensuite visible par les transporteurs',
        'Vous recevrez un email de confirmation une fois la demande publiée'
      ]
    });

  } catch (error) {
    console.error('❌ Erreur lors de la soumission de la demande:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        details: 'Une erreur s\'est produite lors de la soumission de votre demande de place'
      },
      { status: 500 }
    );
  }
} 