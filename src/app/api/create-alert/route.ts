import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Nouvelle demande de création d\'alerte email');

    // Récupération des données du formulaire
    const body = await request.json();
    console.log('📥 Données reçues:', body);

    // Validation des données requises
    const { type, departure, arrival, volume_min, email } = body;

    if (!type || !departure || !arrival || volume_min === undefined || !email) {
      console.error('❌ Données manquantes:', { type, departure, arrival, volume_min, email });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes. Requis: type, departure, arrival, volume_min, email' 
        },
        { status: 400 }
      );
    }

    // Validation du type
    if (type !== 'offer' && type !== 'request') {
      console.error('❌ Type invalide:', type);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Type invalide. Doit être "offer" ou "request"' 
        },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Email invalide:', email);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Format d\'email invalide' 
        },
        { status: 400 }
      );
    }

    // Validation du volume minimum
    if (typeof volume_min !== 'number' || volume_min <= 0) {
      console.error('❌ Volume minimum invalide:', volume_min);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Volume minimum doit être un nombre positif' 
        },
        { status: 400 }
      );
    }

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration backend manquante' 
        },
        { status: 500 }
      );
    }

    console.log('📤 Envoi vers le backend centralisé Railway...');

    // Préparation des données pour le backend
    const alertData = {
      type, // 'offer' ou 'request' en anglais
      departure,
      arrival,
      volume_min,
      email,
      status: 'active',
      source: 'dodo-partage-frontend',
      timestamp: new Date().toISOString()
    };

    // Appel au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/create-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      body: JSON.stringify(alertData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Alerte créée avec succès via le backend centralisé:', result);

    return NextResponse.json({
      success: true,
      message: 'Alerte email créée avec succès !',
      data: {
        alertId: result.data?.alertId,
        recordId: result.data?.recordId,
        email: email,
        type: type, // 'offer' ou 'request'
        departure: departure,
        arrival: arrival,
        volume_min: volume_min,
        status: 'Active',
        confirmationEmailSent: result.data?.confirmationEmailSent || true,
        unsubscribeToken: result.data?.unsubscribeToken
      },
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors de la création d\'alerte:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur interne',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
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

// Méthode GET pour tester la route
export async function GET() {
  return NextResponse.json({
    message: 'Route API pour créer des alertes email via le backend centralisé',
    usage: 'POST /api/create-alert',
    requiredFields: {
      type: 'offer | request',
      departure: 'string (nom du lieu de départ)',
      arrival: 'string (nom du lieu d\'arrivée)', 
      volume_min: 'number (volume minimum en m³)',
      email: 'string (email pour recevoir les alertes)'
    },
    example: {
      type: 'request',
      departure: 'Paris, France',
      arrival: 'Fort-de-France, Martinique',
      volume_min: 5,
      email: 'user@example.com'
    },
    backend: {
      used: 'centralized',
      url: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app'
    }
  });
} 