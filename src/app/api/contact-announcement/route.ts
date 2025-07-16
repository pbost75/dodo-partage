import { NextRequest, NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/utils/cors';

interface ContactRequest {
  announcementId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
  // 🔒 SÉCURITÉ : Plus besoin de l'email complet côté frontend
  announcementDetails: {
    id: string;
    type: 'offer' | 'request';
    departure: string;
    arrival: string;
    volume: string;
    date: string;
    author: string;
    // authorEmail: string; // ❌ RETIRÉ pour la sécurité
  };
}

// Handler OPTIONS pour les requêtes preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('📬 Nouvelle demande de contact reçue');

    // Parse des données du formulaire
    const data: ContactRequest = await request.json();
    console.log('📥 Données reçues:', {
      announcementId: data.announcementId,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone ? '***' : 'Non fourni',
      messageLength: data.message.length,
      announcementType: data.announcementDetails.type
    });

    // Validation des données obligatoires
    if (!data.contactName || !data.contactEmail || !data.message || !data.announcementId) {
      console.error('❌ Données manquantes dans la requête');
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // URL du backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ BACKEND_URL non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration backend manquante' },
        { status: 500 }
      );
    }

    console.log('📤 Envoi vers le backend centralisé...');

    // Appel au backend centralisé
    const response = await fetch(`${backendUrl}/api/partage/contact-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        announcementId: data.announcementId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        message: data.message,
        announcementDetails: data.announcementDetails,
        // 🔒 SÉCURITÉ : Le backend récupère l'email depuis la base de données via l'ID
        // Plus besoin de passer l'email explicitement côté frontend
        senderEmail: data.contactEmail,                       // Email de celui qui répond
        senderName: data.contactName,                         // Nom de celui qui répond
        // 🚫 CORRECTION CC: Désactiver la copie automatique à l'expéditeur
        skipSenderCc: true,                                   // Ne pas mettre l'expéditeur en cc
        timestamp: new Date().toISOString(),
        source: 'dodo-partage-frontend'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur du backend centralisé:', response.status, errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Contact envoyé avec succès via le backend centralisé:', result);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès !',
      data: {
        contactId: result.data?.contactId,
        emailSent: result.data?.emailSent || true,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        announcementId: data.announcementId,
        announcementAuthor: data.announcementDetails.author,
        timestamp: new Date().toISOString()
      },
      backend: {
        used: 'centralized',
        url: backendUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du contact:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de l\'envoi de votre message',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 