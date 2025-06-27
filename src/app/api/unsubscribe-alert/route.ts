import { NextRequest, NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/utils/cors';

// Handler OPTIONS pour les requêtes preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Nouvelle demande de suppression d\'alerte email');

    // Récupération des données du formulaire
    const body = await request.json();
    console.log('📥 Données reçues:', body);

    // Validation des données requises
    const { token, reason } = body;

    if (!token) {
      console.error('❌ Token manquant:', token);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de suppression manquant' 
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
    const deactivationData = {
      token,
      reason: reason || 'Non spécifiée',
      timestamp: new Date().toISOString()
    };

    // Appel au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/delete-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'dodo-partage',
        'X-Frontend-Version': '1.0.0',
      },
      body: JSON.stringify(deactivationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Alerte supprimée avec succès via le backend centralisé:', result);

    return NextResponse.json({
      success: true,
      message: 'Alerte supprimée avec succès !',
      data: {
        email: result.data?.email,
        reason: result.data?.reason
      },
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors de la suppression d\'alerte:', error);
    
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

// Méthode GET pour redirection vers la page de suppression
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(generateErrorHtml('Token de suppression manquant dans l\'URL'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Rediriger vers la page de suppression avec le token
    const redirectUrl = `/supprimer-alerte/${token}`;
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('❌ Erreur serveur lors de la redirection:', error);
    
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