import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Test de connexion aux alertes email via le backend centralisé...');

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json({
        success: false,
        message: 'Configuration backend manquante',
        error: 'NEXT_PUBLIC_BACKEND_URL non défini',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('📤 Test de connexion vers:', backendUrl);

    // Test de connexion au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/test`, {
      method: 'GET',
      headers: {
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        message: 'Erreur de connexion au backend centralisé',
        error: `${response.status} - ${errorText}`,
        backend: {
          url: backendUrl,
          status: response.status,
          accessible: false
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Test réussi:', result);

    return NextResponse.json({
      success: true,
      message: 'Connexion aux alertes email réussie via le backend centralisé !',
      backend: {
        url: backendUrl,
        status: response.status,
        accessible: true,
        config: result.config || {},
        features: result.features || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test de connexion',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      backend: {
        url: process.env.NEXT_PUBLIC_BACKEND_URL || 'non-configuré',
        accessible: false,
        error: true
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 