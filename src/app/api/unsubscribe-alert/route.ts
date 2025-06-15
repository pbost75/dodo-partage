import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚫 Demande de désabonnement d\'alerte');

    const body = await request.json();
    const { unsubscribe_token } = body;

    if (!unsubscribe_token) {
      console.error('❌ Token de désabonnement manquant');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de désabonnement requis' 
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

    console.log('📤 Envoi vers le backend centralisé pour désabonnement...');

    // Appel au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/unsubscribe-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      body: JSON.stringify({
        unsubscribe_token,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Désabonnement réussi via le backend centralisé');

    return NextResponse.json({
      success: true,
      message: 'Vous avez été désabonné avec succès de cette alerte.',
      data: result.data || {},
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors du désabonnement:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur interne',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Méthode GET pour désabonnement via URL (pour les liens email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(generateErrorHtml('Token de désabonnement manquant dans l\'URL'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return new NextResponse(generateErrorHtml('Configuration backend manquante'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    console.log('📤 Désabonnement via GET vers le backend centralisé...');

    // Appel au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/unsubscribe-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      body: JSON.stringify({
        unsubscribe_token: token,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      return new NextResponse(generateErrorHtml(`Erreur du backend: ${response.status}`), {
        status: response.status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const result = await response.json();
    console.log('✅ Désabonnement réussi via GET');

    // Retourner une page HTML de succès
    return new NextResponse(generateSuccessHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors du désabonnement GET:', error);
    
    return new NextResponse(generateErrorHtml('Une erreur technique s\'est produite'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Fonction pour générer la page HTML de succès
function generateSuccessHtml(): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Désabonnement réussi - DodoPartage</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 16px;
        }
        p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
        }
        .button:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✅</div>
        <h1>Désabonnement réussi</h1>
        <p>
          Vous avez été désabonné avec succès de cette alerte email.<br>
          Vous ne recevrez plus de notifications pour ce trajet.
        </p>
        <a href="https://partage.dodomove.fr" class="button">
          Retour à DodoPartage
        </a>
      </div>
    </body>
    </html>
  `;
}

// Fonction pour générer la page HTML d'erreur
function generateErrorHtml(errorMessage: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Erreur - DodoPartage</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #dc2626;
          margin-bottom: 16px;
        }
        p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: #6b7280;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">❌</div>
        <h1>Erreur de désabonnement</h1>
        <p>
          ${errorMessage}<br>
          Veuillez réessayer plus tard ou contactez notre support.
        </p>
        <a href="https://partage.dodomove.fr" class="button">
          Retour à DodoPartage
        </a>
      </div>
    </body>
    </html>
  `;
} 