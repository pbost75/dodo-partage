import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de connexion avec le backend centralisé...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    console.log('📋 Configuration backend:', {
      url: backendUrl,
      timestamp: new Date().toISOString()
    });

    // Test de connexion générale
    console.log('🔗 Test de connexion générale...');
    const healthResponse = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!healthResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'Backend centralisé non accessible',
        details: `Status: ${healthResponse.status} - ${healthResponse.statusText}`,
        config: {
          backendUrl: backendUrl
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const healthData = await healthResponse.json();
    console.log('✅ Backend accessible:', healthData);

    // Test spécifique DodoPartage
    console.log('🔗 Test spécifique DodoPartage...');
    const partageResponse = await fetch(`${backendUrl}/api/partage/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!partageResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'Routes DodoPartage non disponibles sur le backend',
        details: `Status: ${partageResponse.status} - ${partageResponse.statusText}`,
        config: {
          backendUrl: backendUrl,
          healthCheck: healthData
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const partageData = await partageResponse.json();
    console.log('✅ Routes DodoPartage disponibles:', partageData);

    return NextResponse.json({
      success: true,
      message: 'Connexion avec le backend centralisé réussie !',
      backend: {
        url: backendUrl,
        health: healthData,
        partage: partageData
      },
      tests: {
        generalHealth: '✅ Réussi',
        partageRoutes: '✅ Réussi',
        airtableConfig: partageData.config?.airtable?.configured ? '✅ Configuré' : '⚠️ Non configuré',
        resendConfig: partageData.config?.resend?.configured ? '✅ Configuré' : '⚠️ Non configuré'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors du test backend:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test de connexion avec le backend',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      config: {
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 