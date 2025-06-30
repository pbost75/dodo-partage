/**
 * Script d'envoi d'emails post-expiration
 * Envoie un email informatif quand une annonce vient d'expirer
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function sendPostExpirationNotifications() {
  console.log('🕐 NOTIFICATIONS POST-EXPIRATION');
  console.log('================================\n');

  try {
    // 1. Récupérer les annonces expirées dans les dernières 24h
    const response = await fetch(`${BACKEND_URL}/api/partage/get-recently-expired`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const recentlyExpired = data.data || [];

    console.log(`✅ ${recentlyExpired.length} annonce(s) récemment expirée(s)\n`);

    if (recentlyExpired.length === 0) {
      console.log('✅ Aucune notification post-expiration à envoyer');
      return { sent: 0, errors: 0 };
    }

    // 2. Envoyer les emails de notification
    let sentCount = 0;
    let errorCount = 0;

    for (const announcement of recentlyExpired) {
      try {
        console.log(`📧 Notification expiration pour ${announcement.contact_first_name} (${announcement.reference})`);
        
        // Appeler l'API backend pour envoyer l'email post-expiration
        const emailResponse = await fetch(`${BACKEND_URL}/api/partage/send-post-expiration-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            announcementId: announcement.id,
            expiredAt: announcement.expired_at,
            expirationReason: announcement.expiration_reason
          })
        });

        if (emailResponse.ok) {
          console.log(`   ✅ Notification envoyée avec succès`);
          sentCount++;
        } else {
          console.log(`   ❌ Erreur envoi notification: ${emailResponse.status}`);
          errorCount++;
        }

      } catch (error) {
        console.error(`   ❌ Erreur pour ${announcement.reference}:`, error.message);
        errorCount++;
      }
    }

    // 3. Statistiques finales
    console.log('\n📊 RÉSUMÉ DES NOTIFICATIONS:');
    console.log(`   • Notifications envoyées: ${sentCount}`);
    console.log(`   • Erreurs: ${errorCount}`);
    console.log('✅ Processus de notification terminé\n');

    return { sent: sentCount, errors: errorCount };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    throw error;
  }
}

// Exporter la fonction pour usage externe
module.exports = { sendPostExpirationNotifications };

// Exécution directe si script appelé
if (require.main === module) {
  sendPostExpirationNotifications()
    .then((stats) => {
      console.log(`📈 Résultat final: ${stats.sent} envoyés, ${stats.errors} erreurs`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du processus:', error);
      process.exit(1);
    });
} 