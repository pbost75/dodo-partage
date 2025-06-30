/**
 * Script d'expiration automatique des annonces DodoPartage
 * 
 * Logique d'expiration :
 * - Annonces "propose" (offres) : Expirent le jour de la date de départ (Jour J)
 * - Annonces "cherche" (demandes) : Expirent après 60 jours de création
 * 
 * Usage :
 * - node scripts/expire-announcements.js
 * - Peut être appelé par un cron job quotidien
 */

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  process.exit(1);
}

/**
 * Récupère les annonces actives depuis Airtable
 */
async function getActiveAnnouncements() {
  try {
    console.log('📋 Récupération des annonces actives...');
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements?filterByFormula=AND({status} = 'published', {expires_at} != '')&fields[]=id&fields[]=status&fields[]=request_type&fields[]=shipping_date&fields[]=created_at&fields[]=expires_at&fields[]=contact_first_name&fields[]=departure_country&fields[]=arrival_country`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.records.length} annonces actives trouvées`);
    
    return data.records;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces:', error);
    throw error;
  }
}

/**
 * Vérifie si une annonce doit expirer
 */
function shouldExpire(announcement) {
  const now = new Date();
  const record = announcement.fields;
  
  // Vérification de l'expiration basée sur expires_at (désormais calculé correctement dans le backend)
  if (record.expires_at) {
    const expirationDate = new Date(record.expires_at);
    if (now >= expirationDate) {
      // Déterminer la raison selon le type d'annonce
      const reason = record.request_type === 'offer' ? 'date_depart_passee' : 'delai_recherche_expire';
      
      return {
        shouldExpire: true,
        reason: reason,
        expirationDate: expirationDate.toISOString(),
        requestType: record.request_type
      };
    }
  }

  return { shouldExpire: false };
}

/**
 * Met à jour le statut d'une annonce vers "expired"
 */
async function expireAnnouncement(announcementId, reason) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements/${announcementId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            status: 'expired',
            expired_at: new Date().toISOString(),
            expiration_reason: reason
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur mise à jour: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur lors de l'expiration de ${announcementId}:`, error);
    throw error;
  }
}

/**
 * Fonction principale d'expiration
 */
async function runExpirationProcess() {
  console.log('🚀 Démarrage du processus d\'expiration automatique');
  console.log(`📅 Date/heure: ${new Date().toISOString()}`);
  
  let processedCount = 0;
  let expiredCount = 0;
  let errorCount = 0;

  try {
    // Récupération des annonces actives
    const announcements = await getActiveAnnouncements();
    
    if (announcements.length === 0) {
      console.log('ℹ️ Aucune annonce active à vérifier');
      return;
    }

    console.log(`🔍 Vérification de ${announcements.length} annonces...`);

    // Traitement de chaque annonce
    for (const announcement of announcements) {
      processedCount++;
      const record = announcement.fields;
      
      try {
        const expirationCheck = shouldExpire(announcement);
        
        if (expirationCheck.shouldExpire) {
          console.log(`⏰ Expiration détectée: ${announcement.id}`);
          console.log(`   Type: ${record.request_type}`);
          console.log(`   Propriétaire: ${record.contact_first_name}`);
          console.log(`   Trajet: ${record.departure_country} → ${record.arrival_country}`);
          console.log(`   Raison: ${expirationCheck.reason}`);
          
          // Marquer comme expiré
          await expireAnnouncement(announcement.id, expirationCheck.reason);
          expiredCount++;
          
          console.log(`✅ Annonce ${announcement.id} marquée comme expirée`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors du traitement de ${announcement.id}:`, error);
      }

      // Petite pause pour éviter de surcharger l'API
      if (processedCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Résumé final
    console.log('\n📊 Résumé du processus d\'expiration:');
    console.log(`   • Annonces vérifiées: ${processedCount}`);
    console.log(`   • Annonces expirées: ${expiredCount}`);
    console.log(`   • Erreurs: ${errorCount}`);
    
    if (expiredCount > 0) {
      console.log('✅ Processus d\'expiration terminé avec succès');
    } else {
      console.log('ℹ️ Aucune annonce à expirer aujourd\'hui');
    }

  } catch (error) {
    console.error('❌ Erreur critique lors du processus d\'expiration:', error);
    process.exit(1);
  }
}

/**
 * Test de la logique d'expiration (mode dry-run)
 */
async function testExpirationLogic() {
  console.log('🧪 Mode test - Simulation du processus d\'expiration');
  
  try {
    const announcements = await getActiveAnnouncements();
    
    let wouldExpireCount = 0;
    
    for (const announcement of announcements) {
      const record = announcement.fields;
      const expirationCheck = shouldExpire(announcement);
      
      if (expirationCheck.shouldExpire) {
        wouldExpireCount++;
        console.log(`🔍 SERAIT EXPIRÉ: ${announcement.id}`);
        console.log(`   Type: ${record.request_type}`);
        console.log(`   Raison: ${expirationCheck.reason}`);
        console.log(`   Détails:`, expirationCheck);
      }
    }
    
    console.log(`\n📊 Résumé du test: ${wouldExpireCount} annonces seraient expirées`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Execution du script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--test') || args.includes('-t')) {
    // Mode test
    testExpirationLogic();
  } else {
    // Mode production
    runExpirationProcess();
  }
}

module.exports = {
  runExpirationProcess,
  testExpirationLogic,
  shouldExpire
}; 