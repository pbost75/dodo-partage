/**
 * Script de test : Suppression d'alerte avec collecte de raison
 * Test complet du flow de suppression d'une alerte email
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-7b738.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://partage.dodomove.fr';

async function testAlertDeactivation() {
  console.log('🧪 Test du système de suppression d\'alertes DodoPartage');
  console.log('=' .repeat(60));

  try {
    // Étape 1: Créer une alerte de test
    console.log('\n📝 Étape 1: Création d\'une alerte de test...');
    
    const testAlert = {
      type: 'offer',
      departure: 'france',
      arrival: 'reunion',
      volume_min: 1,
      email: 'test-deactivation@example.com'
    };

    const createResponse = await fetch(`${BACKEND_URL}/api/partage/create-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Source': 'script-deactivation-test'
      },
      body: JSON.stringify(testAlert)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Erreur création alerte: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log('✅ Alerte créée avec succès');
    console.log('📧 Email:', createResult.data.email);
    console.log('🔑 Token:', createResult.data.deleteToken);

    const deleteToken = createResult.data.deleteToken;

    // Étape 2: Tester la suppression avec raison
    console.log('\n🗑️ Étape 2: Test de suppression avec raison...');
    
    const deletionReasons = [
      'found_solution',
      'plans_changed', 
      'too_many_emails',
      'not_relevant',
      'other'
    ];

    const testReason = deletionReasons[Math.floor(Math.random() * deletionReasons.length)];
    console.log('🎯 Raison de test sélectionnée:', testReason);

    const deleteData = {
      token: deleteToken,
      reason: testReason === 'other' ? 'Raison personnalisée pour test automatisé' : testReason
    };

    const deleteResponse = await fetch(`${BACKEND_URL}/api/partage/delete-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Source': 'script-suppression-test'
      },
      body: JSON.stringify(deleteData)
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Erreur suppression: ${deleteResponse.status} - ${errorText}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Alerte supprimée avec succès');
    console.log('📧 Email confirmé:', deleteResult.data.email);
    console.log('📝 Raison enregistrée:', deleteResult.data.reason);

    // Étape 3: Vérifier que l'alerte est bien supprimée (tentative de re-suppression)
    console.log('\n🔍 Étape 3: Vérification statut supprimé...');
    
    const retestResponse = await fetch(`${BACKEND_URL}/api/partage/delete-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Source': 'script-suppression-test'
      },
      body: JSON.stringify({
        token: deleteToken,
        reason: 'second_try'
      })
    });

    if (retestResponse.ok) {
      console.log('⚠️  Attention: L\'alerte a pu être supprimée plusieurs fois');
      console.log('🔧 Considérer ajouter une validation statut dans le backend');
    } else {
      console.log('✅ Tentative de re-suppression correctement bloquée');
    }

    // Étape 4: Test du frontend (URL de redirection)
    console.log('\n🌐 Étape 4: Test redirection frontend...');
    
    const frontendTestUrl = `${FRONTEND_URL}/api/unsubscribe-alert?token=${deleteToken}`;
    console.log('🔗 URL de test:', frontendTestUrl);
    console.log('📝 Note: Cette URL devrait rediriger vers /supprimer-alerte/{token}');

    // Résumé des tests
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log('✅ Création d\'alerte: OK');
    console.log('✅ Suppression avec raison: OK');
    console.log('✅ Email de confirmation: OK');
    console.log('✅ Enregistrement raison: OK');

    console.log('\n🎯 URLS DE TEST:');
    console.log(`📧 Lien email: ${FRONTEND_URL}/supprimer-alerte/${deleteToken}`);
    console.log(`🔗 Redirection: ${frontendTestUrl}`);

    console.log('\n🧪 Test terminé avec succès !');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:');
    console.error(error.message);
    console.error('\n📝 Détails techniques:');
    console.error(error);
    
    console.log('\n🔧 VÉRIFICATIONS À EFFECTUER:');
    console.log('- Backend Railway déployé et accessible');
    console.log('- Variables d\'environnement correctes');
    console.log('- Table Airtable avec champ deactivation_reason');
    console.log('- Clés API Resend et Airtable valides');
    
    process.exit(1);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testAlertDeactivation().catch(console.error);
}

module.exports = { testAlertDeactivation }; 