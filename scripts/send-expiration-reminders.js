/**
 * Script d'envoi d'emails de prévention d'expiration
 * Envoie un email 3 jours avant expiration avec options d'action
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function sendExpirationReminders() {
  console.log('📬 ENVOI RAPPELS D\'EXPIRATION');
  console.log('==============================\n');

  try {
    // 1. Calculer la date dans 3 jours
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const reminderDate = threeDaysFromNow.toISOString().split('T')[0]; // Format YYYY-MM-DD

    console.log(`📅 Recherche d'annonces expirant le: ${reminderDate}\n`);

    // 2. Récupérer les annonces qui expirent dans 3 jours
    const response = await fetch(`${BACKEND_URL}/api/partage/get-expiring-soon?reminderDate=${reminderDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const expiringAnnouncements = data.data || [];

    console.log(`✅ ${expiringAnnouncements.length} annonce(s) expirant dans 3 jours\n`);

    if (expiringAnnouncements.length === 0) {
      console.log('✅ Aucun rappel à envoyer aujourd\'hui');
      return { sent: 0, errors: 0 };
    }

    // 3. Envoyer les emails de rappel
    let sentCount = 0;
    let errorCount = 0;

    for (const announcement of expiringAnnouncements) {
      try {
        console.log(`📧 Envoi rappel à ${announcement.contact_first_name} (${announcement.reference})`);
        
        // Appeler l'API backend pour envoyer l'email de rappel
        const emailResponse = await fetch(`${BACKEND_URL}/api/partage/send-expiration-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            announcementId: announcement.id,
            reminderType: '3_days_before'
          })
        });

        if (emailResponse.ok) {
          console.log(`   ✅ Email envoyé avec succès`);
          sentCount++;
        } else {
          console.log(`   ❌ Erreur envoi email: ${emailResponse.status}`);
          errorCount++;
        }

      } catch (error) {
        console.error(`   ❌ Erreur pour ${announcement.reference}:`, error.message);
        errorCount++;
      }
    }

    // 4. Statistiques finales
    console.log('\n📊 RÉSUMÉ DES ENVOIS:');
    console.log(`   • Emails envoyés: ${sentCount}`);
    console.log(`   • Erreurs: ${errorCount}`);
    console.log('✅ Processus de rappel terminé\n');

    return { sent: sentCount, errors: errorCount };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    throw error;
  }
}

// Exporter la fonction pour usage externe
module.exports = { sendExpirationReminders };

// Exécution directe si script appelé
if (require.main === module) {
  sendExpirationReminders()
    .then((stats) => {
      console.log(`📈 Résultat final: ${stats.sent} envoyés, ${stats.errors} erreurs`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du processus:', error);
      process.exit(1);
    });
} 