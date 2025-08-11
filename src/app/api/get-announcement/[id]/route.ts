import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log('📋 Récupération optimisée de l\'annonce:', id);

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    // 🚀 OPTIMISATION: Appel direct à la nouvelle route spécifique
    const response = await fetch(`${backendUrl}/api/partage/get-announcement/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      // Cache Next.js pour éviter les appels répétés
      next: { revalidate: 300 } // Cache pendant 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Annonce non trouvée',
          message: 'Cette annonce n\'existe pas ou n\'est plus disponible'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération de l\'annonce',
        message: 'Une erreur technique s\'est produite'
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ Annonce récupérée optimisée:', result.data?.reference);

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error: 'Aucune donnée disponible'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
      backend: {
        ...result.backend,
        frontendCache: true,
        optimizedRoute: true
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // Cache côté navigateur pour les annonces spécifiques
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'annonce:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de l\'annonce',
      message: 'Une erreur technique s\'est produite',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Gestion des requêtes OPTIONS pour CORS (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
