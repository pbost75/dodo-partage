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

    // Configuration Airtable directe
    const Airtable = require('airtable');
    
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    
    if (!apiKey || !baseId) {
      console.error('❌ Configuration Airtable manquante');
      return NextResponse.json(
        { success: false, error: 'Configuration base de données manquante' },
        { status: 500 }
      );
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