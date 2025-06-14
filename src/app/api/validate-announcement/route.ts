import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect('/validation-error?reason=missing-token');
    }

    console.log('🔍 Validation du token:', token);

    // Envoyer la demande de validation au backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/partage/validate-announcement?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de validation' }));
      console.error('❌ Erreur de validation:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Redirection vers page d'erreur avec le détail
      if (response.status === 404) {
        return NextResponse.redirect('/validation-error?reason=token-not-found');
      } else if (response.status === 410) {
        return NextResponse.redirect('/validation-error?reason=token-expired');
      } else {
        return NextResponse.redirect('/validation-error?reason=validation-failed');
      }
    }

    const result = await response.json();
    console.log('✅ Validation réussie:', result.data?.reference);

    // Redirection vers page de succès avec les informations
    const successUrl = new URL('/validation-success', request.url);
    if (result.data?.reference) {
      successUrl.searchParams.set('ref', result.data.reference);
    }
    
    return NextResponse.redirect(successUrl.toString());

  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
    
    // Redirection vers page d'erreur générique
    return NextResponse.redirect('/validation-error?reason=server-error');
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