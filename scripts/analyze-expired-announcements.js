// Script pour analyser pourquoi les annonces ont été expirées
const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  process.exit(1);
}

/**
 * Récupère les annonces expirées
 */
async function getExpiredAnnouncements() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements?filterByFormula={status} = 'expired'&fields[]=id&fields[]=reference&fields[]=request_type&fields[]=status&fields[]=created_at&fields[]=shipping_date&fields[]=expired_at&fields[]=contact_first_name&fields[]=departure_country&fields[]=arrival_country&fields[]=expires_at`,
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
    return data.records || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces expirées:', error);
    throw error;
  }
}

/**
 * Analyse pourquoi une annonce a été expirée
 */
function analyzeExpiration(record) {
  const fields = record.fields;
  const now = new Date();
  
  console.log(`\n🔍 ANALYSE: ${fields.reference || record.id}`);
  console.log(`   Type: ${fields.request_type}`);
  console.log(`   Propriétaire: ${fields.contact_first_name}`);
  console.log(`   Trajet: ${fields.departure_country} → ${fields.arrival_country}`);
  console.log(`   Créée le: ${fields.created_at}`);
  console.log(`   Expirée le: ${fields.expired_at}`);
  
  // Vérifier si expires_at était défini
  if (fields.expires_at) {
    const expirationDate = new Date(fields.expires_at);
    console.log(`   📅 Date d'expiration définie: ${fields.expires_at}`);
    if (now >= expirationDate) {
      console.log(`   ⏰ RAISON: Expiration programmée atteinte`);
      return 'expiration_programmee';
    }
  }
  
  // Analyser selon le type
  if (fields.request_type === 'offer') {
    if (fields.shipping_date) {
      const shippingDate = new Date(fields.shipping_date);
      const dayAfterShipping = new Date(shippingDate);
      dayAfterShipping.setDate(dayAfterShipping.getDate() + 1);
      
      console.log(`   🚢 Date de départ: ${fields.shipping_date}`);
      console.log(`   📅 Expiration automatique le: ${dayAfterShipping.toISOString().split('T')[0]}`);
      
      if (now >= dayAfterShipping) {
        console.log(`   ⏰ RAISON: Date de départ passée (expire le lendemain)`);
        return 'date_depart_passee';
      }
    }
  } else if (fields.request_type === 'search') {
    if (fields.created_at) {
      const createdDate = new Date(fields.created_at);
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + 60);
      
      console.log(`   📅 Créée le: ${fields.created_at}`);
      console.log(`   📅 Expiration automatique le: ${expirationDate.toISOString().split('T')[0]} (60 jours)`);
      
      if (now >= expirationDate) {
        console.log(`   ⏰ RAISON: 60 jours écoulés depuis la création`);
        return 'delai_recherche_expire';
      }
    }
  }
  
  console.log(`   ❓ RAISON: Inconnue (peut-être expirée manuellement)`);
  return 'inconnue';
}

/**
 * Fonction principale
 */
async function analyzeAllExpired() {
  console.log('🔍 Analyse des annonces expirées\n');
  
  try {
    const expiredAnnouncements = await getExpiredAnnouncements();
    
    if (expiredAnnouncements.length === 0) {
      console.log('✅ Aucune annonce expirée trouvée');
      return;
    }
    
    console.log(`📊 ${expiredAnnouncements.length} annonce(s) expirée(s) trouvée(s):`);
    
    const reasons = {};
    
    for (const announcement of expiredAnnouncements) {
      const reason = analyzeExpiration(announcement);
      reasons[reason] = (reasons[reason] || 0) + 1;
    }
    
    console.log('\n📊 RÉSUMÉ DES RAISONS D\'EXPIRATION:');
    Object.entries(reasons).forEach(([reason, count]) => {
      console.log(`   • ${reason}: ${count} annonce(s)`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécution
if (require.main === module) {
  analyzeAllExpired();
}

module.exports = { analyzeAllExpired, analyzeExpiration }; 