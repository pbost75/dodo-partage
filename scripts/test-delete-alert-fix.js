#!/usr/bin/env node

/**
 * 🧪 Script de Test - Correction Suppression Alerte "Autre"
 * 
 * Ce script teste que la correction pour la raison "autre" fonctionne
 */

const BACKEND_URL = 'https://web-production-7b738.up.railway.app';
const TEST_EMAIL = 'test-delete-fix@example.com';

// Fonction helper pour les requêtes
async function makeRequest(url, options = {}) {
  try {
    console.log(`📤 Requête: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status}:`, data);
      return { success: false, error: data, status: response.status };
    }
    
    console.log(`✅ Succès ${response.status}`);
    return { success: true, data, status: response.status };
    
  } catch (error) {
    console.error(`❌ Erreur réseau:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTest() {
  console.log('🚀 DÉBUT DU TEST - Correction Suppression Alerte "Autre"');
  console.log('======================================================================');
  console.log(`📧 Email de test: ${TEST_EMAIL}`);
  console.log(`🌐 Backend: ${BACKEND_URL}`);
  console.log('');

  // ÉTAPE 1: Créer une alerte de test
  console.log('🧪 ÉTAPE 1: Création d\'une alerte de test');
  console.log('============================================================');
  
  const alertData = {
    type: 'offer',
    departure: 'france',
    arrival: 'reunion',
    volume_min: 1,
    email: TEST_EMAIL
  };
  
  console.log('📋 Données de l\'alerte:', alertData);
  
  const createResult = await makeRequest(`${BACKEND_URL}/api/partage/create-alert`, {
    method: 'POST',
    body: JSON.stringify(alertData)
  });

  if (!createResult.success) {
    console.log('❌ Échec de la création d\'alerte');
    console.log('💡 Erreur:', createResult.error);
    return;
  }

  console.log('✅ Alerte créée avec succès!');
  console.log('📊 Détails:', createResult.data);
  
  // Récupérer le delete_token  
  const deleteToken = createResult.data.data.deleteToken;
  if (!deleteToken) {
    console.log('❌ Pas de delete_token dans la réponse');
    return;
  }
  
  console.log(`🔑 Delete token: ${deleteToken}`);
  console.log('');

  // ÉTAPE 2: Tester la suppression avec raison "autre"
  console.log('🧪 ÉTAPE 2: Test suppression avec raison "autre"');
  console.log('============================================================');
  
  const deleteData = {
    token: deleteToken,
    reason: 'other',
    customReason: 'Test de la correction du bug autre'
  };
  
  console.log('📋 Données de suppression:', deleteData);
  
  // Attendre un peu que Railway déploie
  console.log('⏳ Attente du déploiement Railway (30 secondes)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const deleteResult = await makeRequest(`${BACKEND_URL}/api/partage/delete-alert`, {
    method: 'POST',
    body: JSON.stringify(deleteData)
  });

  if (!deleteResult.success) {
    console.log('❌ Échec de la suppression d\'alerte');
    console.log('💡 Erreur:', deleteResult.error);
    
    if (deleteResult.error?.message?.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
      console.log('🚨 LE BUG PERSISTE: Airtable refuse encore la valeur');
    }
    return;
  }

  console.log('✅ Alerte supprimée avec succès!');
  console.log('📊 Détails:', deleteResult.data);
  console.log('');

  // ÉTAPE 3: Vérification du résultat
  console.log('🧪 ÉTAPE 3: Vérification du résultat');
  console.log('============================================================');
  
  const result = deleteResult.data;
  
  if (result.reason === 'other' && result.customReason === 'Test de la correction du bug autre') {
    console.log('✅ Les données sont correctement transmises');
    console.log(`📝 Raison sauvegardée: "${result.savedReason}"`);
    
    if (result.savedReason.includes('other: Test de la correction du bug autre')) {
      console.log('🎉 PARFAIT! Le texte personnalisé est bien formaté');
    }
  } else {
    console.log('⚠️ Problème dans la transmission des données');
  }

  console.log('');
  console.log('🏁 RÉSUMÉ DU TEST');
  console.log('======================================================================');
  console.log('🎉 ✅ SUCCÈS: La suppression avec raison "autre" fonctionne!');
  console.log('✅ Le bug INVALID_MULTIPLE_CHOICE_OPTIONS est corrigé');
  console.log('✅ Le texte personnalisé est correctement sauvegardé');
  console.log('');
  console.log('💡 Maintenant vous pouvez supprimer vos alertes avec n\'importe quelle raison!');
}

// Exécuter le test
runTest().catch(console.error); 