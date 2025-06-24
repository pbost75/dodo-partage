import { NextRequest, NextResponse } from 'next/server';

interface UpdateAnnouncementRequest {
  shippingDate: string;
  container: {
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: string;
  announcementText: string;
}

// Fonction de contournement utilisant le backend comme proxy
async function useBackendAsProxy(token: string, data: UpdateAnnouncementRequest) {
  console.log('🔄 Utilisation du backend comme proxy pour la mise à jour');
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    // Récupérer d'abord les données actuelles
    const getCurrentResponse = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
    if (!getCurrentResponse.ok) {
      throw new Error('Impossible de récupérer les données actuelles');
    }
    
    const currentResult = await getCurrentResponse.json();
    if (!currentResult.success || !currentResult.data) {
      throw new Error('Données actuelles introuvables');
    }
    
    const currentData = currentResult.data;
    
    // Créer un payload minimal qui évite les champs problématiques
    const minimalPayload = {
      contact: {
        firstName: currentData.contact.firstName,
        email: currentData.contact.email,
        phone: currentData.contact.phone || ''
        // PAS de lastName !
      },
      departure: currentData.departure,
      arrival: currentData.arrival,
      shippingDate: data.shippingDate,
      container: {
        type: currentData.container.type,
        availableVolume: data.container.availableVolume,
        minimumVolume: data.container.minimumVolume
      },
      offerType: data.offerType,
      announcementText: data.announcementText
    };
    
    // Appeler la route backend normale mais sans lastName
    const updateResponse = await fetch(`${backendUrl}/api/partage/update-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editToken: token,
        data: minimalPayload
      }),
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Backend error: ${updateResponse.status} - ${errorText}`);
    }
    
    const result = await updateResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Votre annonce a été mise à jour avec succès !',
      data: result.data || {
        reference: 'PARTAGE-UPDATE',
        updatedAt: new Date().toISOString(),
        method: 'backend-proxy'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'utilisation du backend comme proxy:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de votre annonce',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        method: 'backend-proxy-failed'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log('📝 Mise à jour annonce directe pour token:', token);

    // Parse des données du formulaire
    const data: UpdateAnnouncementRequest = await request.json();
    console.log('📥 Données reçues:', {
      shippingDate: data.shippingDate,
      availableVolume: data.container.availableVolume,
      minimumVolume: data.container.minimumVolume,
      offerType: data.offerType,
      textLength: data.announcementText.length
    });

    // Validation des données obligatoires
    if (!data.shippingDate || !data.container.availableVolume || !data.offerType || !data.announcementText) {
      console.error('❌ Données obligatoires manquantes');
      return NextResponse.json(
        { success: false, error: 'Données obligatoires manquantes' },
        { status: 400 }
      );
    }

    // Configuration Airtable - utiliser les mêmes variables que le backend
    const Airtable = require('airtable');
    
    // Tenter d'utiliser les variables locales d'abord, sinon utiliser des valeurs par défaut
    let apiKey = process.env.AIRTABLE_API_KEY;
    let baseId = process.env.AIRTABLE_BASE_ID;
    
    // Si les variables ne sont pas définies, utiliser celles du backend (pour éviter l'erreur)
    if (!apiKey || !baseId) {
      console.log('⚠️ Variables Airtable non définies, tentative de récupération depuis le backend...');
      
      // Récupération temporaire via le backend qui a accès aux vraies variables
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
        const envResponse = await fetch(`${backendUrl}/env`);
        
        if (envResponse.ok) {
          console.log('✅ Utilisation des variables du backend centralisé');
          // Utiliser les valeurs du backend (mais elles sont masquées, donc on doit continuer via le backend)
          throw new Error('Variables non accessibles directement');
        }
      } catch (envError) {
        console.log('⚠️ Impossible de récupérer les variables, utilisation du backend comme proxy');
        
        // Solution de contournement : utiliser le backend comme proxy
        return await useBackendAsProxy(token, data);
      }
    }

    Airtable.configure({ apiKey });
    const base = Airtable.base(baseId);
    const partageTableName = 'DodoPartage - Announcement';

    console.log('🔍 Recherche de l\'annonce avec token:', token);

    // Trouver l'annonce par edit_token
    const records = await base(partageTableName).select({
      filterByFormula: `{edit_token} = '${token}'`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      console.error('❌ Annonce non trouvée pour token:', token);
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    const record = records[0];
    const recordId = record.id;
    const oldData = record.fields;
    
    console.log('✅ Annonce trouvée:', {
      id: recordId,
      reference: oldData.reference,
      currentDate: oldData.shipping_date,
      currentVolume: oldData.container_available_volume
    });

    // Préparer SEULEMENT les champs modifiables
    const updatedFields = {
      shipping_date: data.shippingDate,
      container_available_volume: parseFloat(data.container.availableVolume.toString()),
      container_minimum_volume: parseFloat(data.container.minimumVolume.toString()),
      offer_type: data.offerType,
      announcement_text: data.announcementText,
      announcement_text_length: data.announcementText.length,
      updated_at: new Date().toISOString()
    };

    console.log('📝 Mise à jour des champs:', Object.keys(updatedFields));

    // Mettre à jour l'enregistrement
    const updatedRecord = await base(partageTableName).update(recordId, updatedFields);

    console.log('✅ Annonce mise à jour avec succès:', {
      reference: oldData.reference,
      updatedFields: Object.keys(updatedFields)
    });

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Votre annonce a été mise à jour avec succès !',
      data: {
        reference: oldData.reference,
        updatedAt: updatedFields.updated_at,
        changes: {
          shippingDate: data.shippingDate,
          availableVolume: data.container.availableVolume,
          minimumVolume: data.container.minimumVolume,
          offerType: data.offerType,
          textLength: data.announcementText.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour directe:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de votre annonce',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 