import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const announcementId = searchParams.get('id');

    // Validation des paramètres
    if (!token || !announcementId) {
      return NextResponse.json(
        { error: 'Token ou ID d\'annonce manquant' },
        { status: 400 }
      );
    }

    // TODO: Intégration avec le backend centralisé Dodomove
    // En attendant la mise en place d'Airtable, on simule la validation
    
    console.log('Validation demandée pour:', { token, announcementId });
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validation basique du format du token et de l'ID
    if (token.length < 10 || !announcementId.startsWith('temp_')) {
      console.log('Token ou ID invalide');
      return NextResponse.redirect(new URL('/validation-error', request.url));
    }
    
    // TODO: Quand le backend sera prêt, décommenter et adapter :
    /*
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/validate-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        announcementId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur validation backend:', errorData);
      
      return NextResponse.redirect(new URL('/validation-error', request.url));
    }

    const result = await response.json();
    */

    // Rediriger vers une page de succès
    return NextResponse.redirect(new URL('/validation-success', request.url));

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    
    // Rediriger vers une page d'erreur
    return NextResponse.redirect(new URL('/validation-error', request.url));
  }
}

// Support pour les requêtes POST également (au cas où)
export async function POST(request: NextRequest) {
  try {
    const { token, announcementId } = await request.json();

    // Validation des paramètres
    if (!token || !announcementId) {
      return NextResponse.json(
        { error: 'Token ou ID d\'annonce manquant' },
        { status: 400 }
      );
    }

    // TODO: Intégration avec le backend centralisé Dodomove
    // En attendant la mise en place d'Airtable, on simule la validation
    
    console.log('Validation POST demandée pour:', { token, announcementId });
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validation basique du format du token et de l'ID
    if (token.length < 10) {
      throw new Error('Token invalide');
    }
    
    // TODO: Quand le backend sera prêt, décommenter et adapter :
    /*
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/validate-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        announcementId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur validation backend:', errorData);
      throw new Error(`Erreur backend: ${response.status}`);
    }

    const result = await response.json();
    */

    // Simulation de la réponse du backend
    return NextResponse.json({
      success: true,
      message: 'Annonce validée avec succès',
      announcement: {
        id: announcementId,
        status: 'published',
        validatedAt: new Date().toISOString(),
      },
      note: 'Mode simulation - En attente de l\'intégration Airtable',
    });

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation de l\'annonce',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 