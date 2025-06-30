#!/usr/bin/env node

/**
 * 🧪 Script de Test - Système d'Alertes Automatiques DodoPartage
 * 
 * Ce script teste le système complet de notifications d'alertes :
 * 1. Crée une alerte de test
 * 2. Vérifie qu'elle est active
 * 3. Teste la correspondance avec une annonce existante
 * 4. Teste l'envoi de notifications
 */

const BACKEND_URL = 'https://web-production-7b738.up.railway.app';
const TEST_EMAIL = 'bost.analytics@gmail.com'; // Email de test du développeur

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

// Test 1: Créer une alerte de test
async function testCreateAlert() {
  console.log('\n🧪 TEST 1: Création d\'alerte de test');
  console.log('=' .repeat(50));
  
  const alertData = {
    type: 'offer', // Je veux être notifié quand quelqu'un PROPOSE de la place
    departure: 'France',
    arrival: 'Martinique',
    volume_min: 1,
    email: TEST_EMAIL
  };
  
  console.log('📋 Données de l\'alerte:', alertData);
  
  const result = await makeRequest(`${BACKEND_URL}/api/partage/create-alert`, {
    method: 'POST',
    body: JSON.stringify(alertData)
  });
  
  if (result.success) {
    console.log('✅ Alerte créée avec succès!');
    console.log('📊 Détails:', {
      alertId: result.data.recordId,
      email: result.data.email,
      type: result.data.type,
      confirmationSent: result.data.confirmationEmailSent
    });
    return result.data;
  } else {
    console.log('❌ Échec de création d\'alerte');
    return null;
  }
}

// Test 2: Récupérer une annonce existante pour test
async function getTestAnnouncement() {
  console.log('\n🧪 TEST 2: Récupération d\'annonce de test');
  console.log('=' .repeat(50));
  
  // Récupérer les annonces publiées de type 'offer' (France → Martinique si possible)
  const result = await makeRequest(`${BACKEND_URL}/api/partage/get-announcements?status=published&type=offer`);
  
  if (result.success && result.data.length > 0) {
    // Filtrer les annonces France → Martinique
    const franceToMartiniqueOffers = result.data.filter(ann => 
      ann.departure_country?.toLowerCase().includes('france') &&
      ann.arrival_country?.toLowerCase().includes('martinique')
    );
    
    if (franceToMartiniqueOffers.length > 0) {
      const testAnnouncement = franceToMartiniqueOffers[0];
      console.log('✅ Annonce de test trouvée (France → Martinique):');
      console.log('📋 Détails:', {
        id: testAnnouncement.id,
        reference: testAnnouncement.reference,
        trajet: `${testAnnouncement.departure_country} → ${testAnnouncement.arrival_country}`,
        volume: `${testAnnouncement.container_available_volume}m³`,
        type: testAnnouncement.request_type,
        contact: testAnnouncement.contact_first_name
      });
      return testAnnouncement;
    } else {
      console.log('⚠️ Aucune annonce France → Martinique trouvée, utilisation de la première annonce');
      const firstOffer = result.data.find(ann => ann.request_type === 'offer');
      if (firstOffer) {
        console.log('📋 Annonce de test:', {
          id: firstOffer.id,
          reference: firstOffer.reference,
          trajet: `${firstOffer.departure_country} → ${firstOffer.arrival_country}`,
          volume: `${firstOffer.container_available_volume}m³`,
          type: firstOffer.request_type
        });
        return firstOffer;
      }
    }
  }
  
  console.log('❌ Aucune annonce de test disponible');
  return null;
}

// Test 3: Tester la vérification d'alertes manuellement
async function testAlertMatching(announcementId) {
  console.log('\n🧪 TEST 3: Test de correspondance d\'alertes');
  console.log('=' .repeat(50));
  
  console.log(`📋 Test avec l'annonce ID: ${announcementId}`);
  
  const result = await makeRequest(`${BACKEND_URL}/api/partage/check-alert-matches`, {
    method: 'POST',
    body: JSON.stringify({ announcementId })
  });
  
  if (result.success) {
    console.log('✅ Vérification des alertes réussie!');
    console.log('📊 Résultats:', {
      reference: result.data.reference,
      alertsSent: result.data.alertResult.alertsSent,
      totalAlerts: result.data.alertResult.totalAlerts,
      details: result.data.alertResult.details
    });
    
    if (result.data.alertResult.alertsSent > 0) {
      console.log('🎉 Des notifications d\'alertes ont été envoyées!');
      console.log('📧 Vérifiez votre email:', TEST_EMAIL);
    } else {
      console.log('📭 Aucune alerte correspondante (normal si critères différents)');
    }
    
    return result.data.alertResult;
  } else {
    console.log('❌ Échec de la vérification d\'alertes');
    return null;
  }
}

// Test 4: Vérifier les critères de correspondance en détail
async function explainAlertMatching() {
  console.log('\n🧪 TEST 4: Explication des critères de correspondance');
  console.log('=' .repeat(50));
  
  console.log('📋 Logique de correspondance des alertes:');
  console.log('');
  console.log('1. 🎯 TYPE (logique identique):');
  console.log('   • Alerte "offer" → Annonce "offer" (personnes qui proposent)');
  console.log('   • Alerte "request" → Annonce "search" (personnes qui cherchent)');
  console.log('');
  console.log('2. 🗺️ TRAJET (exact):');
  console.log('   • Même pays de départ ET d\'arrivée');
  console.log('   • Normalisation des accents (France = france)');
  console.log('');
  console.log('3. 📦 VOLUME (minimum):');
  console.log('   • Pour offres: volume_min ≤ container_available_volume');
  console.log('   • Pour recherches: volume_min ≤ volume_needed');
  console.log('');
  console.log('🔍 Notre test:');
  console.log(`   • Alerte: type="offer", France → Martinique, volume_min=1m³`);
  console.log(`   • Correspond aux annonces d'OFFRES de France vers Martinique avec ≥1m³`);
}

// Test 5: Créer une alerte spécifique pour tester la correspondance
async function testSpecificAlertMatch() {
  console.log('\n🧪 TEST 5: Test avec alerte spécifique');
  console.log('=' .repeat(50));
  
  // D'abord récupérer une annonce existante
  const announcement = await getTestAnnouncement();
  if (!announcement) {
    console.log('❌ Pas d\'annonce disponible pour test spécifique');
    return false;
  }
  
  // Créer une alerte qui correspond exactement à cette annonce
  const specificAlertData = {
    type: announcement.request_type, // Même type
    departure: announcement.departure_country,
    arrival: announcement.arrival_country,
    volume_min: 1, // Volume minimum bas pour matcher
    email: TEST_EMAIL
  };
  
  console.log('📋 Création d\'alerte spécifique pour correspondance garantie:');
  console.log('   • Type:', specificAlertData.type);
  console.log('   • Trajet:', `${specificAlertData.departure} → ${specificAlertData.arrival}`);
  console.log('   • Volume min:', `${specificAlertData.volume_min}m³`);
  
  const alertResult = await makeRequest(`${BACKEND_URL}/api/partage/create-alert`, {
    method: 'POST',
    body: JSON.stringify(specificAlertData)
  });
  
  if (!alertResult.success) {
    console.log('❌ Échec de création d\'alerte spécifique');
    return false;
  }
  
  console.log('✅ Alerte spécifique créée!');
  
  // Attendre un peu pour que l'alerte soit active
  console.log('⏳ Attente de 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Tester la correspondance
  const matchResult = await testAlertMatching(announcement.id);
  
  if (matchResult && matchResult.alertsSent > 0) {
    console.log('🎉 SUCCÈS! La correspondance spécifique a fonctionné!');
    return true;
  } else {
    console.log('⚠️ Pas de correspondance détectée (à investiguer)');
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 DÉBUT DES TESTS - Système d\'Alertes Automatiques DodoPartage');
  console.log('=' .repeat(70));
  console.log(`📧 Email de test: ${TEST_EMAIL}`);
  console.log(`🌐 Backend: ${BACKEND_URL}`);
  console.log('');
  
  try {
    // Test 1: Créer une alerte générale
    const alertData = await testCreateAlert();
    
    // Test 2: Récupérer une annonce de test
    const announcement = await getTestAnnouncement();
    
    // Test 3: Tester la correspondance si on a les deux
    if (announcement) {
      await testAlertMatching(announcement.id);
    }
    
    // Test 4: Explication des critères
    await explainAlertMatching();
    
    // Test 5: Test avec correspondance spécifique
    await testSpecificAlertMatch();
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
  
  console.log('\n🏁 TESTS TERMINÉS');
  console.log('=' .repeat(70));
  console.log('📧 Vérifiez votre email pour les notifications reçues!');
  console.log('📊 Consultez les logs Railway pour plus de détails.');
}

// Exécuter les tests
runTests().catch(console.error); 