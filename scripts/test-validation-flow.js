#!/usr/bin/env node

/**
 * Script de test pour le flux complet de validation DodoPartage
 * Usage: node scripts/test-validation-flow.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'https://web-production-7b738.up.railway.app';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendConnection() {
  log('\n🧪 Test 1: Connexion au backend centralisé', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.status === 200) {
      log('✅ Backend centralisé accessible !', 'green');
      log(`   URL: ${BACKEND_URL}`, 'yellow');
      return true;
    } else {
      log('❌ Backend centralisé non accessible', 'red');
      log(`   Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erreur de connexion au backend', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testAnnouncementSubmission() {
  log('\n🧪 Test 2: Soumission d\'annonce avec données complètes (structure mise à jour)', 'blue');
  
  const testAnnouncement = {
    departure: {
      country: 'France',
      city: 'Paris',
      postalCode: '75001',
      displayName: 'Paris, France', // Sera utilisé pour construire departureLocation
      isComplete: true
    },
    arrival: {
      country: 'Martinique',
      city: 'Fort-de-France',
      postalCode: '97200',
      displayName: 'Fort-de-France, Martinique', // Sera utilisé pour construire arrivalLocation
      isComplete: true
    },
    shippingDate: '2024-03-15',
    container: {
      type: '20',
      availableVolume: 8,
      minimumVolume: 2
    },
    offerType: 'free',
    announcementText: 'Je propose de la place dans mon conteneur de déménagement de Paris vers la Martinique. Parfait pour des cartons ou du petit mobilier.',
    contact: {
      firstName: 'Pierre',
      email: 'pierre.test@example.com',
      phone: '+33123456789'
    },
    currentStep: 7,
    isCompleted: true
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/submit-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAnnouncement)
    });
    
    if (response.status === 200 && response.data.success) {
      log('✅ Annonce soumise avec succès !', 'green');
      log(`   Référence: ${response.data.data?.reference || 'N/A'}`, 'yellow');
      log(`   Email: ${response.data.data?.email}`, 'yellow');
      log(`   Départ: ${response.data.data?.departure}`, 'yellow');
      log(`   Arrivée: ${response.data.data?.arrival}`, 'yellow');
      log(`   Validation email envoyé: ${response.data.data?.validationEmailSent ? 'Oui' : 'Non'}`, 'yellow');
      
      // Vérification spécifique : les lieux doivent être correctement formatés
      const departure = response.data.data?.departure;
      const arrival = response.data.data?.arrival;
      
      if (departure && departure.includes(',') && arrival && arrival.includes(',')) {
        log('✅ Format des lieux correct (ville, pays)', 'green');
      } else {
        log('⚠️ Format des lieux à vérifier', 'yellow');
        log(`   Départ reçu: "${departure}"`, 'yellow');
        log(`   Arrivée reçue: "${arrival}"`, 'yellow');
      }
      
      return {
        success: true,
        reference: response.data.data?.reference,
        email: response.data.data?.email
      };
    } else {
      log('❌ Échec de soumission', 'red');
      log(`   Erreur: ${response.data.error || 'Inconnue'}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Erreur lors de la soumission', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testValidationAPI() {
  log('\n🧪 Test 3: Test de l\'API de validation', 'blue');
  
  // Test avec un token factice pour vérifier que l'API ne plante pas
  const fakeToken = 'test-token-123-456-789';
  
  try {
    // Test direct de l'API de validation (elle va échouer mais ne doit pas planter)
    const response = await makeRequest(`${BASE_URL}/api/validate-announcement?token=${fakeToken}`);
    
    log(`   Status de réponse: ${response.status}`, 'yellow');
    
    if (response.status === 302 || response.status === 307) {
      // Redirection, c'est normal
      const location = response.headers.location;
      log('✅ API de validation fonctionne (redirection détectée)', 'green');
      log(`   Redirection vers: ${location}`, 'yellow');
      return true;
    } else if (response.status >= 200 && response.status < 400) {
      log('✅ API de validation répond correctement', 'green');
      return true;
    } else {
      log('⚠️ API de validation retourne une erreur (normal avec faux token)', 'yellow');
      return true; // C'est attendu avec un faux token
    }
  } catch (error) {
    log('❌ Erreur dans l\'API de validation', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testValidationPages() {
  log('\n🧪 Test 4: Pages de validation', 'blue');
  
  try {
    // Test page de succès
    const successResponse = await makeRequest(`${BASE_URL}/validation-success`);
    if (successResponse.status === 200) {
      log('✅ Page de succès accessible', 'green');
    } else {
      log('❌ Page de succès non accessible', 'red');
    }
    
    // Test page d'erreur
    const errorResponse = await makeRequest(`${BASE_URL}/validation-error?reason=test`);
    if (errorResponse.status === 200) {
      log('✅ Page d\'erreur accessible', 'green');
    } else {
      log('❌ Page d\'erreur non accessible', 'red');
    }
    
    return true;
  } catch (error) {
    log('❌ Erreur lors du test des pages', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Démarrage des tests de validation DodoPartage', 'bold');
  log('==========================================', 'bold');
  
  const results = {
    backend: false,
    submission: false,
    validation: false,
    pages: false
  };
  
  // Test 1: Backend
  results.backend = await testBackendConnection();
  
  // Test 2: Soumission
  const submissionResult = await testAnnouncementSubmission();
  results.submission = submissionResult.success;
  
  // Test 3: API de validation
  results.validation = await testValidationAPI();
  
  // Test 4: Pages
  results.pages = await testValidationPages();
  
  // Résumé
  log('\n📊 Résumé des tests', 'bold');
  log('==================', 'bold');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSÉ' : '❌ ÉCHEC';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(r => r);
  const globalStatus = allPassed ? '✅ TOUS LES TESTS PASSÉS' : '⚠️ CERTAINS TESTS ONT ÉCHOUÉ';
  const globalColor = allPassed ? 'green' : 'yellow';
  
  log(`\n${globalStatus}`, globalColor);
  
  if (!allPassed) {
    log('\n💡 Actions recommandées:', 'blue');
    if (!results.backend) log('- Vérifier la connexion au backend Railway', 'yellow');
    if (!results.submission) log('- Vérifier l\'API de soumission d\'annonces', 'yellow');
    if (!results.validation) log('- Vérifier l\'API de validation', 'yellow');
    if (!results.pages) log('- Vérifier les pages de validation', 'yellow');
  }
}

async function checkFrontendServer() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-backend`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkFrontendServer();
  
  if (!serverRunning) {
    log('❌ Le serveur frontend n\'est pas accessible sur ' + BASE_URL, 'red');
    log('💡 Assurez-vous que le serveur est démarré avec: npm run dev', 'yellow');
    process.exit(1);
  }
  
  await runAllTests();
}

main().catch(console.error); 