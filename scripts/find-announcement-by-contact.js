// Script pour retrouver quelle annonce a été contactée par un email spécifique
// Utile pour les contacts créés avant la migration vers announcement_reference

require('dotenv').config({ path: '.env.local' });

// Node.js 18+ a fetch intégré

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  console.error('💡 Créez un fichier .env dans le dossier racine avec:');
  console.error('   AIRTABLE_BASE_ID=appyuDiWXUzpy9DTT');
  console.error('   AIRTABLE_TOKEN=patXXXXXXXXXXXXXX');
  process.exit(1);
}

/**
 * Récupère tous les contacts d'un email spécifique
 */
async function getContactsByEmail(email) {
  try {
    console.log(`🔍 Recherche des contacts pour: ${email}`);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20-%20Contact%20Request?filterByFormula={requester_email} = '${email}'`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📋 ${data.records.length} contact(s) trouvé(s)`);
    return data.records;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des contacts:', error);
    throw error;
  }
}

/**
 * Récupère une annonce par son ID Airtable
 */
async function getAnnouncementById(recordId) {
  try {
    console.log(`🔍 Recherche de l'annonce avec ID: ${recordId}`);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20-%20Announcement/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Annonce non trouvée (supprimée ou ID incorrect)');
        return null;
      }
      throw new Error(`Erreur API Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Annonce trouvée: ${data.fields.reference}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'annonce:', error);
    return null;
  }
}

/**
 * Récupère une annonce par sa référence (nouveau système)
 */
async function getAnnouncementByReference(reference) {
  try {
    console.log(`🔍 Recherche de l'annonce avec référence: ${reference}`);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20-%20Announcement?filterByFormula={reference} = '${reference}'`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.records[0] || null;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'annonce:', error);
    return null;
  }
}

/**
 * Affiche les détails d'un contact
 */
function displayContactDetails(contact, index) {
  const fields = contact.fields;
  
  console.log(`\n📞 CONTACT ${index + 1}:`);
  console.log('='.repeat(30));
  console.log(`ID Contact: ${contact.id}`);
  console.log(`Date: ${fields.created_at || 'Non définie'}`);
  console.log(`Nom: ${fields.requester_name || 'Non défini'}`);
  console.log(`Email: ${fields.requester_email || 'Non défini'}`);
  console.log(`Téléphone: ${fields.requester_phone || 'Non fourni'}`);
  console.log(`Message: ${fields.requester_message ? fields.requester_message.substring(0, 100) + '...' : 'Aucun'}`);
  console.log(`Type annonce: ${fields.ad_type || 'Non défini'}`);
  console.log(`Statut: ${fields.status || 'Non défini'}`);
  
  // Identifier le système utilisé
  if (fields.announcement_reference && fields.announcement_reference.startsWith('PARTAGE-')) {
    console.log(`📋 Référence annonce: ${fields.announcement_reference} (nouveau système)`);
    return { type: 'reference', value: fields.announcement_reference };
  } else if (fields.announcement_reference && fields.announcement_reference.startsWith('rec')) {
    console.log(`📋 ID annonce: ${fields.announcement_reference} (ancien système dans nouveau champ)`);
    return { type: 'id', value: fields.announcement_reference };
  } else if (fields.announcement_id) {
    console.log(`📋 ID annonce: ${fields.announcement_id} (ancien système)`);
    return { type: 'id', value: fields.announcement_id };
  } else {
    console.log('❌ Aucune référence d\'annonce trouvée');
    return null;
  }
}

/**
 * Affiche les détails d'une annonce
 */
function displayAnnouncementDetails(announcement) {
  if (!announcement) {
    console.log('❌ Annonce non trouvée');
    return;
  }
  
  const fields = announcement.fields;
  
  console.log('\n🎯 ANNONCE CONTACTÉE:');
  console.log('='.repeat(40));
  console.log(`Référence: ${fields.reference}`);
  console.log(`Type: ${fields.request_type}`);
  console.log(`Statut: ${fields.status}`);
  console.log(`Propriétaire: ${fields.contact_first_name}`);
  console.log(`Email propriétaire: ${fields.contact_email}`);
  console.log(`Trajet: ${fields.departure_country} → ${fields.arrival_country}`);
  console.log(`Villes: ${fields.departure_city} → ${fields.arrival_city}`);
  console.log(`Date création: ${fields.created_at}`);
  console.log(`Date expédition: ${fields.shipping_date || 'Non définie'}`);
  
  if (fields.request_type === 'offer') {
    console.log(`Volume disponible: ${fields.container_available_volume} m³`);
    console.log(`Volume minimum: ${fields.container_minimum_volume} m³`);
    console.log(`Type conteneur: ${fields.container_type}`);
    console.log(`Type d'offre: ${fields.offer_type}`);
  } else {
    console.log(`Volume recherché: ${fields.volume_needed} m³`);
    console.log(`Accepte frais: ${fields.accepts_fees}`);
  }
  
  console.log(`\n🌐 URL de l'annonce: https://www.dodomove.fr/partage/annonce/${fields.reference}`);
}

/**
 * Fonction principale
 */
async function findAnnouncementByContact(email) {
  console.log(`\n🔍 RECHERCHE D'ANNONCE PAR CONTACT`);
  console.log(`📧 Email recherché: ${email}`);
  console.log('='.repeat(50));
  
  try {
    // 1. Récupérer tous les contacts de cet email
    const contacts = await getContactsByEmail(email);
    
    if (contacts.length === 0) {
      console.log('❌ Aucun contact trouvé pour cet email');
      return;
    }
    
    // 2. Traiter chaque contact
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const announcementRef = displayContactDetails(contact, i);
      
      if (!announcementRef) {
        console.log('⏭️  Pas de référence d\'annonce, passage au suivant');
        continue;
      }
      
      // 3. Récupérer l'annonce selon le système
      let announcement = null;
      
      if (announcementRef.type === 'reference') {
        // Nouveau système avec référence lisible
        announcement = await getAnnouncementByReference(announcementRef.value);
      } else if (announcementRef.type === 'id') {
        // Ancien système avec ID technique
        announcement = await getAnnouncementById(announcementRef.value);
      }
      
      // 4. Afficher les détails de l'annonce
      displayAnnouncementDetails(announcement);
      
      if (i < contacts.length - 1) {
        console.log('\n' + '='.repeat(50));
      }
    }
    
    console.log(`\n✅ Analyse terminée pour ${contacts.length} contact(s)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
  }
}

// Exécution
if (require.main === module) {
  const email = process.argv[2] || 'cecilelecornu@laposte.net';
  console.log('🚀 Démarrage du script de recherche...');
  findAnnouncementByContact(email);
}

module.exports = { findAnnouncementByContact }; 