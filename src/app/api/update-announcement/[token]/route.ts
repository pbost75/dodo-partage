import { NextRequest, NextResponse } from 'next/server';

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
      // Champs modifiables - utiliser les nouvelles valeurs
      shippingDate: data.shippingDate,
      container: {
        type: currentData.container.type, // Garder le type de conteneur actuel
        availableVolume: data.container.availableVolume,
        minimumVolume: data.container.minimumVolume
      },
      offerType: data.offerType,
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