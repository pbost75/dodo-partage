import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log('📋 Récupération optimisée TEMPORAIRE de l\'annonce:', id);

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    // 🚀 OPTIMISATION TEMPORAIRE: Utiliser notre API transformée avec cache Next.js 
    // TODO: Remplacer par la route spécifique quand Railway sera fixé
    
    // IMPORTANT: On appelle notre propre API qui fait la transformation des données !
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://partage.dodomove.fr/api/get-announcements'
      : 'http://localhost:3000/api/get-announcements';
      
    const response = await fetch(`${apiUrl}?status=published`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage-internal',
        'X-Frontend-Version': '1.0.0',
      },
      // Cache Next.js pour éviter les appels répétés  
      next: { revalidate: 300 } // Cache pendant 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Erreur backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erreur du backend:', data.error);
      return NextResponse.json(
        { success: false, error: data.error || 'Erreur backend' },
        { status: 500 }
      );
    }

    // 🔍 TEMPORAIRE: Filtrer côté frontend pour trouver l'annonce spécifique
    const foundAnnouncement = data.data.find((ann: any) => 
      ann.reference === id || ann.id === id
    );

    if (!foundAnnouncement) {
      console.log(`❌ Annonce ${id} non trouvée dans les ${data.data.length} annonces`);
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    console.log(`✅ Annonce ${id} trouvée: ${foundAnnouncement.title || foundAnnouncement.reference}`);

    // Retourner l'annonce trouvée
    return NextResponse.json(
      {
        success: true,
        data: foundAnnouncement,
        backend: {
          ...data.backend,
          cached: data.backend?.cached || false,
          frontend_cached: true,
          frontend_filtered: true,
          frontend_timestamp: new Date().toISOString(),
          total_announcements: data.data.length,
          optimization: 'temporary_frontend_filtering'
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'annonce:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de l\'annonce',
      message: 'Une erreur technique s\'est produite',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

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