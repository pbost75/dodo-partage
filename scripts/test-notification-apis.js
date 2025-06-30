/**
 * Script de test pour les nouvelles APIs de notification d'expiration
 * Teste toutes les 4 nouvelles routes backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function testNotificationAPIs() {
  console.log('🧪 TEST DES APIs DE NOTIFICATION');
  console.log('==============================\n');

  let successCount = 0;
  let errorCount = 0;

  try {
    // Test 1: GET /api/partage/get-expiring-soon
    console.log('1️⃣ Test GET /api/partage/get-expiring-soon');
    console.log('-------------------------------------------');
    
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3); // Dans 3 jours
    const testDateStr = testDate.toISOString().split('T')[0];
    
    try {
      const response1 = await fetch(`${BACKEND_URL}/api/partage/get-expiring-soon?reminderDate=${testDateStr}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response1.ok) {
        const data1 = await response1.json();
        console.log(`✅ API fonctionnelle - ${data1.data.length} annonce(s) trouvée(s)`);
        console.log(`📅 Date testée: ${testDateStr}`);
        successCount++;
      } else {
        console.log(`❌ Erreur API: ${response1.status} ${response1.statusText}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Test 2: GET /api/partage/get-recently-expired
    console.log('2️⃣ Test GET /api/partage/get-recently-expired');
    console.log('--------------------------------------------');
    
    try {
      const response2 = await fetch(`${BACKEND_URL}/api/partage/get-recently-expired`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response2.ok) {
        const data2 = await response2.json();
        console.log(`✅ API fonctionnelle - ${data2.data.length} annonce(s) récemment expirée(s)`);
        console.log(`📅 Cutoff: ${data2.cutoffDate}`);
        successCount++;
      } else {
        console.log(`❌ Erreur API: ${response2.status} ${response2.statusText}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Test 3: POST /api/partage/send-expiration-reminder (simulation)
    console.log('3️⃣ Test POST /api/partage/send-expiration-reminder');
    console.log('------------------------------------------------');
    
    try {
      const response3 = await fetch(`${BACKEND_URL}/api/partage/send-expiration-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: 'test-non-existing-id',
          reminderType: '3_days_before'
        })
      });

      // On s'attend à une erreur 404 car l'ID n'existe pas
      if (response3.status === 404) {
        const error3 = await response3.json();
        console.log(`✅ API fonctionnelle - Erreur 404 attendue: ${error3.error}`);
        successCount++;
      } else if (response3.status === 400) {
        console.log(`✅ API fonctionnelle - Validation des paramètres OK`);
        successCount++;
      } else {
        console.log(`❌ Comportement inattendu: ${response3.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Test 4: POST /api/partage/send-post-expiration-notification (simulation)
    console.log('4️⃣ Test POST /api/partage/send-post-expiration-notification');
    console.log('--------------------------------------------------------');
    
    try {
      const response4 = await fetch(`${BACKEND_URL}/api/partage/send-post-expiration-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: 'test-non-existing-id',
          expiredAt: new Date().toISOString()
        })
      });

      // On s'attend à une erreur 404 car l'ID n'existe pas
      if (response4.status === 404) {
        const error4 = await response4.json();
        console.log(`✅ API fonctionnelle - Erreur 404 attendue: ${error4.error}`);
        successCount++;
      } else if (response4.status === 400) {
        console.log(`✅ API fonctionnelle - Validation des paramètres OK`);
        successCount++;
      } else {
        console.log(`❌ Comportement inattendu: ${response4.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Test 5: Validation du backend principal (sanity check)
    console.log('5️⃣ Test Backend Principal (Sanity Check)');
    console.log('---------------------------------------');
    
    try {
      const response5 = await fetch(`${BACKEND_URL}/ping`, {
        method: 'GET'
      });

      if (response5.ok) {
        console.log(`✅ Backend principal accessible`);
        successCount++;
      } else {
        console.log(`❌ Backend principal inaccessible: ${response5.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Backend principal inaccessible: ${error.message}`);
      errorCount++;
    }

    console.log('');

    // Résumé final
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('==================');
    console.log(`✅ Tests réussis: ${successCount}`);
    console.log(`❌ Tests échoués: ${errorCount}`);
    console.log(`🎯 Taux de réussite: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

    if (errorCount === 0) {
      console.log('\n🎉 TOUS LES TESTS PASSENT ! Le système de notifications est prêt.');
    } else {
      console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration du backend.');
    }

    return { successCount, errorCount };

  } catch (error) {
    console.error('💥 Erreur critique lors des tests:', error);
    return { successCount: 0, errorCount: 5 };
  }
}

// Exporter la fonction pour usage externe
module.exports = { testNotificationAPIs };

// Exécution directe si script appelé
if (require.main === module) {
  testNotificationAPIs()
    .then((stats) => {
      console.log(`\n📈 Tests terminés: ${stats.successCount}/${stats.successCount + stats.errorCount}`);
      process.exit(stats.errorCount === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
} 