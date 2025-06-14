import { NextRequest, NextResponse } from 'next/server';

// Interface pour les données de l'annonce
interface AnnouncementData {
  departure: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  shippingDate: string;
  container: {
    type: '20' | '40';
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: 'free' | 'paid';
  announcementText: string;
  contact: {
    firstName: string;
    email: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: AnnouncementData = await request.json();

    console.log('📥 Données reçues pour soumission:', {
      email: data.contact.email,
      departure: data.departure.displayName,
      arrival: data.arrival.displayName,
      containerType: data.container.type,
      offerType: data.offerType
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

    // Envoi vers le backend centralisé Dodomove
    console.log('📤 Envoi vers le backend centralisé...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/submit-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de communication avec le serveur' }));
      console.error('❌ Erreur backend:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
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
    console.log('✅ Annonce soumise avec succès via le backend centralisé:', result.data?.reference);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: result.message || 'Annonce créée avec succès !',
      data: {
        reference: result.data?.reference,
        recordId: result.data?.recordId,
        email: data.contact.email,
        departure: data.departure.displayName,
        arrival: data.arrival.displayName,
        shippingDate: data.shippingDate,
        status: result.data?.status || 'En attente de validation'
      },
      nextSteps: result.nextSteps || [
        'Votre annonce a été enregistrée dans notre base de données',
        'Elle sera visible sur la plateforme après validation',
        'Vous recevrez un email de confirmation sous peu'
      ],
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
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
        backend: {
          used: 'centralized',
          url: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
} 