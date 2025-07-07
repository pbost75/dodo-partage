#!/usr/bin/env node

/**
 * 🧪 Script de Test - Correction Backend Alertes
 * 
 * Ce script teste si la correction du statut "active" vs "Active" fonctionne
 */

const BACKEND_URL = 'https://web-production-7b738.up.railway.app';
const TEST_EMAIL = 'bost.analytics@gmail.com';

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
    return { success: false, error: error.message, status: 0 };
  }
}

// Test 1: Créer une alerte avec la bonne configuration
async function testCreateAlert() {
  console.log('\n🧪 TEST 1: Création d\'alerte avec configuration correcte');
  console.log('=' .repeat(60));
  
  const alertData = {
    type: 'offer',
    departure: 'reunion', // Minuscules sans accent comme dans Airtable
    arrival: 'mayotte',   // Minuscules sans accent comme dans Airtable
    volume_min: 1,
    email: TEST_EMAIL
  };
  
  console.log('📋 Données de l\'alerte (configuration actuelle Airtable):', alertData);
  
  const result = await makeRequest(`${BACKEND_URL}/api/partage/create-alert`, {
    method: 'POST',
    body: JSON.stringify(alertData)
  });
  
  if (result.success) {
    console.log('✅ Alerte créée avec succès!');
    console.log('📊 Détails:', {
      alertId: result.data.data.alertId,
      email: result.data.data.email,
      type: result.data.data.type,
      departure: result.data.data.departure,
      arrival: result.data.data.arrival,
      status: result.data.data.status, // Devrait être "active"
      confirmationSent: result.data.data.confirmationEmailSent
    });
    return result.data.data;
  } else {
    console.log('❌ Échec de création d\'alerte');
    console.log('💡 Erreur:', result.error);
    return null;
  }
}

// Test 2: Vérifier qu'une annonce Réunion → Mayotte correspond maintenant
async function testAlertMatching() {
  console.log('\n🧪 TEST 2: Test de correspondance Réunion → Mayotte');
  console.log('=' .repeat(60));
  
  // Récupérer l'annonce d'Isabelle (Réunion → Mayotte, 7m³)
  const announcementId = 'recBZCIgibMlD42EM';
  
  console.log(`📋 Test avec l'annonce d'Isabelle: ${announcementId}`);
  console.log('📦 Annonce: Réunion → Mayotte, 7m³ disponible, type: offer');
  console.log('🔔 Notre alerte: reunion → mayotte, 1m³ minimum, type: offer');
  console.log('');
  console.log('🤔 Correspondance attendue: ✅ OUI (si le backend est corrigé)');
  
  const result = await makeRequest(`${BACKEND_URL}/api/partage/check-alert-matches`, {
    method: 'POST',
    body: JSON.stringify({ announcementId })
  });
  
  if (result.success) {
    console.log('✅ Vérification des alertes réussie!');
    console.log('📊 Résultats:', {
      reference: result.data.data.reference,
      alertsSent: result.data.data.alertResult.alertsSent,
      totalAlerts: result.data.data.alertResult.totalAlerts,
      details: result.data.data.alertResult.details
    });
    
    if (result.data.data.alertResult.alertsSent > 0) {
      console.log('🎉 SUCCÈS! Le backend a trouvé des alertes correspondantes!');
      console.log('📧 Des emails d\'alerte ont été envoyés!');
      console.log('✅ La correction du statut "active" fonctionne!');
      return true;
    } else {
      console.log('❌ ÉCHEC: Aucune alerte correspondante trouvée');
      console.log('🔧 Le backend utilise probablement encore "Active" au lieu de "active"');
      console.log('📝 Il faut corriger le backend: filterByFormula: `{status} = \'active\'`');
      return false;
    }
    
  } else {
    console.log('❌ Échec de la vérification d\'alertes');
    console.log('💡 Erreur:', result.error);
    return false;
  }
}

// Test 3: Expliquer la configuration actuelle vs attendue
async function explainConfiguration() {
  console.log('\n🧪 TEST 3: Configuration Airtable vs Backend');
  console.log('=' .repeat(60));
  
  console.log('📋 Configuration Airtable (capture d\'écran utilisateur):');
  console.log('');
  console.log('🏷️  Champ "departure" (Single select):');
  console.log('   • france, reunion, martinique, guadeloupe');
  console.log('   • guyane, mayotte, nouvelle-caledonie, suisse, belgique');
  console.log('');
  console.log('🏷️  Champ "status" (Single select):');
  console.log('   • active (minuscules)');
  console.log('');
  console.log('🔧 Correction nécessaire dans dodomove-backend/server.js:');
  console.log('');
  console.log('   Ligne ~295:');
  console.log('   ❌ filterByFormula: `{status} = \'Active\'`');
  console.log('   ✅ filterByFormula: `{status} = \'active\'`');
  console.log('');
  console.log('💡 Pourquoi cette correction:');
  console.log('   • Airtable crée les alertes avec status: "active"');
  console.log('   • Mais la recherche cherche status: "Active"');
  console.log('   • Résultat: aucune alerte trouvée = pas d\'email envoyé');
}

// Fonction principale
async function runTests() {
  console.log('🚀 DÉBUT DES TESTS - Correction Backend Alertes DodoPartage');
  console.log('=' .repeat(70));
  console.log(`📧 Email de test: ${TEST_EMAIL}`);
  console.log(`🌐 Backend: ${BACKEND_URL}`);
  console.log('');
  
  try {
    // Test 1: Créer une alerte avec la bonne config
    const alertData = await testCreateAlert();
    
    // Test 2: Tester la correspondance
    const matchSuccess = await testAlertMatching();
    
    // Test 3: Expliquer la config
    await explainConfiguration();
    
    console.log('\n🏁 RÉSUMÉ DES TESTS');
    console.log('=' .repeat(70));
    
    if (matchSuccess) {
      console.log('🎉 ✅ SUCCÈS: Le système d\'alertes fonctionne correctement!');
      console.log('📧 Vous devriez avoir reçu un email d\'alerte dans votre boîte.');
    } else {
      console.log('🚨 ❌ PROBLÈME: Le backend utilise encore le mauvais statut');
      console.log('🔧 Action requise: Corriger "Active" → "active" dans le backend');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
  
  console.log('\n📊 Consultez les logs Railway pour plus de détails.');
  console.log('🔗 https://railway.app/project/dodomove-backend/logs');
}

// Lancer les tests
runTests(); 