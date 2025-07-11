import { NextRequest, NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/utils/cors';

// Handler OPTIONS pour les requêtes preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Détecter si on est appelé via le proxy Cloudflare
    const referer = request.headers.get('referer') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for') || '';
    const isProxied = referer.includes('www.dodomove.fr') || 
                      request.headers.get('host') === 'www.dodomove.fr' ||
                      request.headers.get('x-forwarded-host') === 'www.dodomove.fr';
    
    console.log('🔍 Contexte de l\'appel:', {
      origin: new URL(request.url).origin,
      referer,
      host: request.headers.get('host'),
      xForwardedHost: request.headers.get('x-forwarded-host'),
      isProxied
    });
    
    // Définir la base URL selon le contexte
    let baseUrl: string;
    if (isProxied) {
      baseUrl = 'https://www.dodomove.fr/partage';
      console.log('📍 Mode proxy détecté - URLs vers www.dodomove.fr/partage');
    } else {
      baseUrl = new URL(request.url).origin;
      console.log('📍 Mode direct détecté - URLs vers', baseUrl);
    }

    if (!token) {
      console.log('❌ Token manquant dans la requête');
      const errorUrl = isProxied ? 
        'https://www.dodomove.fr/partage/validation-error?reason=missing-token' : 
        `${baseUrl}/validation-error?reason=missing-token`;
      return NextResponse.redirect(errorUrl);
    }

    console.log('🔍 Validation du token:', token);

    // Envoyer la demande de validation au backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    console.log('📤 Appel backend:', `${backendUrl}/api/partage/validate-announcement?token=${token}`);
    
    const response = await fetch(`${backendUrl}/api/partage/validate-announcement?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Réponse backend:', response.status, response.statusText);
    console.log('📥 Headers backend:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Essayer de parser la réponse JSON pour avoir plus de détails
      let errorData;
      try {
        errorData = await response.json();
        console.log('📄 Détails erreur backend:', errorData);
      } catch (parseError) {
        console.log('⚠️ Impossible de parser la réponse backend, utilisation du statut HTTP');
        errorData = { error: `Erreur ${response.status}` };
      }
      
      console.error('❌ Erreur de validation:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Redirection vers page d'erreur avec le détail approprié
      const getErrorUrl = (reason: string) => isProxied ? 
        `https://www.dodomove.fr/partage/validation-error?reason=${reason}` : 
        `${baseUrl}/validation-error?reason=${reason}`;
        
      if (response.status === 404) {
        console.log('🔄 Redirection: token non trouvé');
        return NextResponse.redirect(getErrorUrl('token-not-found'));
      } else if (response.status === 410) {
        console.log('🔄 Redirection: token expiré');
        return NextResponse.redirect(getErrorUrl('token-expired'));
      } else if (response.status === 400) {
        console.log('🔄 Redirection: token invalide');
        return NextResponse.redirect(getErrorUrl('token-invalid'));
      } else {
        console.log('🔄 Redirection: erreur de validation générique');
        return NextResponse.redirect(getErrorUrl('validation-failed'));
      }
    }

    // Succès - parser la réponse
    let result;
    try {
      const responseText = await response.text();
      console.log('📄 Réponse backend brute:', responseText);
      
      result = JSON.parse(responseText);
      console.log('✅ Validation réussie:', result.data?.reference || 'Pas de référence');
      console.log('🔍 Réponse complète parsée:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ Erreur parsing réponse succès:', parseError);
      console.error('📄 Texte de réponse brut qui a causé l\'erreur:', await response.text());
      const errorUrl = isProxied ? 
        'https://www.dodomove.fr/partage/validation-error?reason=server-error' : 
        `${baseUrl}/validation-error?reason=server-error`;
      return NextResponse.redirect(errorUrl);
    }

    // Redirection vers page de succès avec les informations
    let successUrl: URL;
    if (isProxied) {
      // En mode proxy, rediriger vers /partage/validation-success
      successUrl = new URL('/partage/validation-success', 'https://www.dodomove.fr');
    } else {
      // En mode direct, rediriger vers /validation-success sur le domaine actuel
      successUrl = new URL('/validation-success', baseUrl);
    }
    
    if (result.data?.reference) {
      successUrl.searchParams.set('ref', result.data.reference);
    }
    
    console.log('🔄 Redirection succès vers:', successUrl.toString());
    return NextResponse.redirect(successUrl.toString());

  } catch (error) {
    console.error('❌ Erreur grave lors de la validation:', error);
    
    // Log détaillé pour le debugging
    if (error instanceof Error) {
      console.error('Détails:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Redirection vers page d'erreur générique
    const referer = request.headers.get('referer') || '';
    const isProxiedError = referer.includes('www.dodomove.fr') || 
                          request.headers.get('host') === 'www.dodomove.fr' ||
                          request.headers.get('x-forwarded-host') === 'www.dodomove.fr';
    const baseUrl = new URL(request.url).origin;
    const errorUrl = isProxiedError ? 
      'https://www.dodomove.fr/partage/validation-error?reason=server-error' : 
      `${baseUrl}/validation-error?reason=server-error`;
    return NextResponse.redirect(errorUrl);
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