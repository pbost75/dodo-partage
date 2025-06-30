// Script pour débugger une annonce spécifique
const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  process.exit(1);
}

/**
 * Récupère une annonce spécifique par référence
 */
async function getAnnouncementByReference(reference) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements?filterByFormula={reference} = '${reference}'`,
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
    throw error;
  }
}

/**
 * Debug complet d'une annonce
 */
function debugAnnouncement(record) {
  if (!record) {
    console.log('❌ Annonce non trouvée');
    return;
  }
  
  const fields = record.fields;
  const now = new Date();
  
  console.log('\n🔍 ANALYSE DÉTAILLÉE DE L\'ANNONCE:');
  console.log('='.repeat(50));
  console.log(`ID Airtable: ${record.id}`);
  console.log(`Référence: ${fields.reference}`);
  console.log(`Type: ${fields.request_type}`);
  console.log(`Statut: ${fields.status}`);
  console.log(`Propriétaire: ${fields.contact_first_name}`);
  console.log(`Email: ${fields.contact_email}`);
  console.log(`Trajet: ${fields.departure_country} → ${fields.arrival_country}`);
  console.log(`Ville départ: ${fields.departure_city} (${fields.departure_postal_code})`);
  console.log(`Ville arrivée: ${fields.arrival_city} (${fields.arrival_postal_code})`);
  
  // Dates importantes
  console.log('\n📅 DATES IMPORTANTES:');
  console.log('='.repeat(30));
  console.log(`Créée le: ${fields.created_at}`);
  console.log(`Date de départ: ${fields.shipping_date || 'Non définie'}`);
  console.log(`Date d'expiration programmée: ${fields.expires_at || 'Non définie'}`);
  console.log(`Date d'expiration effective: ${fields.expired_at || 'Non expirée'}`);
  console.log(`Date actuelle: ${now.toISOString()}`);
  
  // Détails du conteneur (si offer)
  if (fields.request_type === 'offer') {
    console.log('\n🚢 DÉTAILS CONTENEUR:');
    console.log('='.repeat(25));
    console.log(`Type: ${fields.container_type}`);
    console.log(`Volume disponible: ${fields.container_available_volume} m³`);
    console.log(`Volume minimum: ${fields.container_minimum_volume} m³`);
    console.log(`Type d'offre: ${fields.offer_type}`);
  }
  
  // Détails de la recherche (si search)
  if (fields.request_type === 'search') {
    console.log('\n🔍 DÉTAILS RECHERCHE:');
    console.log('='.repeat(25));
    console.log(`Volume recherché: ${fields.volume_needed} m³`);
    console.log(`Accepte frais: ${fields.accepts_fees}`);
    console.log(`Période: ${fields.shipping_period_formatted}`);
  }
  
  // ANALYSE DE L'EXPIRATION
  console.log('\n⏰ ANALYSE DE L\'EXPIRATION:');
  console.log('='.repeat(35));
  
  // Vérifier si expires_at était défini
  if (fields.expires_at) {
    const expirationDate = new Date(fields.expires_at);
    console.log(`🔴 EXPIRATION PROGRAMMÉE trouvée: ${fields.expires_at}`);
    console.log(`   Date d'expiration: ${expirationDate.toLocaleDateString('fr-FR')}`);
    console.log(`   Déjà passée ? ${now >= expirationDate ? 'OUI' : 'NON'}`);
    
    if (now >= expirationDate) {
      console.log(`   ✅ RAISON VALIDE: Expiration programmée atteinte`);
      return 'expiration_programmee';
    } else {
      console.log(`   ❌ PROBLÈME: Expiration programmée dans le futur mais annonce expirée !`);
    }
  } else {
    console.log(`✅ Pas d'expiration programmée définie`);
  }
  
  // Analyser selon le type
  if (fields.request_type === 'offer') {
    console.log('\n📦 ANALYSE OFFRE:');
    if (fields.shipping_date) {
      const shippingDate = new Date(fields.shipping_date);
      const dayAfterShipping = new Date(shippingDate);
      dayAfterShipping.setDate(dayAfterShipping.getDate() + 1);
      
      console.log(`   🚢 Date de départ: ${shippingDate.toLocaleDateString('fr-FR')}`);
      console.log(`   📅 Expiration automatique le: ${dayAfterShipping.toLocaleDateString('fr-FR')}`);
      console.log(`   ⏰ Date de départ passée ? ${now >= dayAfterShipping ? 'OUI' : 'NON'}`);
      
      if (now >= dayAfterShipping) {
        console.log(`   ✅ RAISON VALIDE: Date de départ passée`);
        return 'date_depart_passee';
      } else {
        console.log(`   ❌ PROBLÈME: Date de départ dans le futur mais annonce expirée !`);
        console.log(`   🚨 ERREUR D'EXPIRATION DÉTECTÉE !`);
      }
    } else {
      console.log(`   ⚠️  Pas de date de départ définie`);
    }
  } else if (fields.request_type === 'search') {
    console.log('\n🔍 ANALYSE RECHERCHE:');
    if (fields.created_at) {
      const createdDate = new Date(fields.created_at);
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + 60);
      
      console.log(`   📅 Créée le: ${createdDate.toLocaleDateString('fr-FR')}`);
      console.log(`   📅 Expiration automatique le: ${expirationDate.toLocaleDateString('fr-FR')} (60 jours)`);
      console.log(`   ⏰ 60 jours écoulés ? ${now >= expirationDate ? 'OUI' : 'NON'}`);
      
      if (now >= expirationDate) {
        console.log(`   ✅ RAISON VALIDE: 60 jours écoulés`);
        return 'delai_recherche_expire';
      } else {
        console.log(`   ❌ PROBLÈME: Moins de 60 jours mais annonce expirée !`);
        console.log(`   🚨 ERREUR D'EXPIRATION DÉTECTÉE !`);
      }
    }
  }
  
  console.log('\n🚨 CONCLUSION: EXPIRATION INJUSTIFIÉE DÉTECTÉE !');
  return 'erreur_expiration';
}

/**
 * Fonction principale
 */
async function debugSpecificAnnouncement(reference) {
  console.log(`🔍 Debug de l'annonce: ${reference}`);
  
  try {
    const announcement = await getAnnouncementByReference(reference);
    const result = debugAnnouncement(announcement);
    
    if (result === 'erreur_expiration') {
      console.log('\n🛠️  ACTIONS RECOMMANDÉES:');
      console.log('1. Remettre le statut à "published"');
      console.log('2. Vérifier le script d\'expiration');
      console.log('3. Analyser les logs d\'expiration');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Exécution
if (require.main === module) {
  const reference = process.argv[2] || 'PARTAGE-233976-4N4ID5';
  debugSpecificAnnouncement(reference);
}

module.exports = { debugSpecificAnnouncement }; 