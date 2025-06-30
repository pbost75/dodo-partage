// Script pour corriger les annonces expirées par erreur
const fetch = require('node-fetch');

const BACKEND_URL = 'https://web-production-7b738.up.railway.app';

/**
 * Remet une annonce en "published" via l'API backend
 */
async function fixWronglyExpiredAnnouncement(reference) {
  try {
    console.log(`🔧 Correction de l'annonce: ${reference}`);
    
    // Note: Cette fonction nécessiterait une route spéciale dans le backend
    // Pour l'instant, on va la faire manuellement dans Airtable
    
    console.log('⚠️  Action manuelle requise:');
    console.log(`1. Aller dans Airtable`);
    console.log(`2. Trouver l'annonce ${reference}`);
    console.log(`3. Changer le statut de "expired" vers "published"`);
    console.log(`4. Vider le champ "expired_at"`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return false;
  }
}

/**
 * Analyse toutes les annonces expirées pour détecter les erreurs
 */
async function findWronglyExpiredAnnouncements() {
  try {
    console.log('🔍 Recherche des annonces expirées par erreur...');
    
    const response = await fetch(`${BACKEND_URL}/api/partage/get-announcements?status=all`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Erreur API: ' + data.message);
    }
    
    const expiredAnnouncements = data.data.filter(a => a.status === 'expired');
    console.log(`📊 ${expiredAnnouncements.length} annonces expirées trouvées`);
    
    const wronglyExpired = [];
    const now = new Date();
    
    for (const announcement of expiredAnnouncements) {
      let shouldBeActive = false;
      let reason = '';
      
      if (announcement.request_type === 'offer') {
        if (announcement.shipping_date) {
          const shippingDate = new Date(announcement.shipping_date);
          const dayAfterShipping = new Date(shippingDate);
          dayAfterShipping.setDate(dayAfterShipping.getDate() + 1);
          
          if (now < dayAfterShipping) {
            shouldBeActive = true;
            reason = `Date de départ dans le futur: ${announcement.shipping_date}`;
          }
        }
      } else if (announcement.request_type === 'search') {
        if (announcement.created_at) {
          const createdDate = new Date(announcement.created_at);
          const expirationDate = new Date(createdDate);
          expirationDate.setDate(expirationDate.getDate() + 60);
          
          if (now < expirationDate) {
            shouldBeActive = true;
            reason = `Moins de 60 jours: créée le ${announcement.created_at}`;
          }
        }
      }
      
      if (shouldBeActive) {
        wronglyExpired.push({
          reference: announcement.reference,
          type: announcement.request_type,
          owner: announcement.contact_first_name,
          route: `${announcement.departure_country} → ${announcement.arrival_country}`,
          reason: reason
        });
      }
    }
    
    if (wronglyExpired.length > 0) {
      console.log('\n🚨 ANNONCES EXPIRÉES PAR ERREUR DÉTECTÉES:');
      console.log('='.repeat(50));
      
      wronglyExpired.forEach((item, index) => {
        console.log(`${index + 1}. ${item.reference}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   Propriétaire: ${item.owner}`);
        console.log(`   Trajet: ${item.route}`);
        console.log(`   Raison: ${item.reason}`);
        console.log('');
      });
      
      console.log('🛠️  ACTIONS REQUISES:');
      console.log('1. Remettre ces annonces en statut "published" dans Airtable');
      console.log('2. Vider le champ "expired_at"');
      console.log('3. Vérifier la logique d\'expiration');
      
    } else {
      console.log('✅ Aucune annonce expirée par erreur détectée');
    }
    
    return wronglyExpired;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    return [];
  }
}

// Exécution
if (require.main === module) {
  findWronglyExpiredAnnouncements();
}

module.exports = { findWronglyExpiredAnnouncements, fixWronglyExpiredAnnouncement }; 