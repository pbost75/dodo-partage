#!/usr/bin/env node

/**
 * Script de test spécifique pour la validation d'email DodoPartage
 * Usage: node scripts/test-email-validation.js
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
          resolve({ 
            status: res.statusCode, 
            data: jsonData, 
            headers: res.headers,
            raw: data
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data, 
            headers: res.headers,
            raw: data
          });
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

async function testBackendValidationRoute() {
  log('\n🧪 Test 1: Route de validation backend directe', 'blue');
  
  const testTokens = [
    'fake-token-123',
    'invalid',
    '',
    'very-long-token-that-should-not-exist-123456789'
  ];
  
  for (const token of testTokens) {
    try {
      log(`\n   Test avec token: "${token}"`, 'yellow');
      
      const response = await makeRequest(`${BACKEND_URL}/api/partage/validate-announcement?token=${encodeURIComponent(token)}`);
      
      log(`   ✅ Backend répond: ${response.status}`, 'green');
      
      if (response.status === 404) {
        try {
          const errorData = JSON.parse(response.data);
          log(`   📄 Message: ${errorData.message}`, 'yellow');
        } catch (e) {
          log(`   📄 Réponse brute: ${response.data}`, 'yellow');
        }
      }
      
    } catch (error) {
      log(`   ❌ Erreur: ${error.message}`, 'red');
    }
  }
}

async function testFrontendValidationRoute() {
  log('\n🧪 Test 2: Route de validation frontend', 'blue');
  
  const testTokens = [
    'fake-token-123',
    'invalid',
    'very-long-token-that-should-not-exist-123456789'
  ];
  
  for (const token of testTokens) {
    try {
      log(`\n   Test avec token: "${token}"`, 'yellow');
      
      const response = await makeRequest(`${BASE_URL}/api/validate-announcement?token=${encodeURIComponent(token)}`, {
        headers: {
          'User-Agent': 'DodoPartage-Test-Script/1.0'
        }
      });
      
      log(`   ✅ Frontend répond: ${response.status}`, 'green');
      
      if (response.status === 307 || response.status === 302) {
        log(`   🔄 Redirection vers: ${response.headers.location}`, 'yellow');
      } else if (response.status === 500) {
        log(`   ❌ ERREUR 500 DÉTECTÉE !`, 'red');
        log(`   📄 Réponse: ${response.raw}`, 'red');
      } else {
        log(`   📄 Réponse: ${response.raw}`, 'yellow');
      }
      
    } catch (error) {
      log(`   ❌ Erreur: ${error.message}`, 'red');
    }
  }
}

async function testValidationFlow() {
  log('\n🧪 Test 3: Flux complet de validation simulé', 'blue');
  
  try {
    // 1. Créer une annonce pour obtenir un vrai token
    log('\n   Étape 1: Soumission d\'une annonce test', 'yellow');
    
    const testAnnouncement = {
      departure: {
        country: 'France',
        city: 'Paris',
        postalCode: '75001',
        displayName: 'Paris, France',
        isComplete: true
      },
      arrival: {
        country: 'Martinique',
        city: 'Fort-de-France',
        postalCode: '97200',
        displayName: 'Fort-de-France, Martinique',
        isComplete: true
      },
      shippingDate: '2024-03-15',
      container: {
        type: '20',
        availableVolume: 8,
        minimumVolume: 2
      },
      offerType: 'free',
      announcementText: 'Test pour validation email',
      contact: {
        firstName: 'TestValidation',
        email: 'test.validation@example.com',
        phone: '+33123456789'
      },
      currentStep: 7,
      isCompleted: true
    };
    
    const submissionResponse = await makeRequest(`${BASE_URL}/api/submit-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAnnouncement)
    });
    
    if (submissionResponse.status === 200 && submissionResponse.data.success) {
      log(`   ✅ Annonce créée: ${submissionResponse.data.data?.reference}`, 'green');
      
      // Note: Nous ne pouvons pas obtenir le vrai token ici car il est envoyé par email
      // Mais au moins nous savons que le processus de création fonctionne
      
    } else {
      log(`   ❌ Échec création annonce: ${submissionResponse.data.error || 'Inconnue'}`, 'red');
    }
    
  } catch (error) {
    log(`   ❌ Erreur flux: ${error.message}`, 'red');
  }
}

async function testErrorHandling() {
  log('\n🧪 Test 4: Gestion d\'erreurs spécifiques', 'blue');
  
  try {
    // Test sans token
    log('\n   Test sans token', 'yellow');
    const noTokenResponse = await makeRequest(`${BASE_URL}/api/validate-announcement`);
    log(`   Status: ${noTokenResponse.status}, Location: ${noTokenResponse.headers.location || 'N/A'}`, 'yellow');
    
    // Test avec token vide
    log('\n   Test avec token vide', 'yellow');
    const emptyTokenResponse = await makeRequest(`${BASE_URL}/api/validate-announcement?token=`);
    log(`   Status: ${emptyTokenResponse.status}, Location: ${emptyTokenResponse.headers.location || 'N/A'}`, 'yellow');
    
    // Test avec caractères spéciaux
    log('\n   Test avec caractères spéciaux', 'yellow');
    const specialCharsResponse = await makeRequest(`${BASE_URL}/api/validate-announcement?token=${encodeURIComponent('test@#$%^&*()_+')}`);
    log(`   Status: ${specialCharsResponse.status}, Location: ${specialCharsResponse.headers.location || 'N/A'}`, 'yellow');
    
  } catch (error) {
    log(`   ❌ Erreur test gestion erreurs: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('🚀 Tests de validation email DodoPartage', 'bold');
  log('========================================', 'bold');
  
  await testBackendValidationRoute();
  await testFrontendValidationRoute();
  await testValidationFlow();
  await testErrorHandling();
  
  log('\n📊 Tests terminés', 'bold');
  log('================', 'bold');
  
  log('\n💡 Si vous voyez une erreur 500:', 'blue');
  log('1. Vérifiez les logs de npm run dev dans un autre terminal', 'yellow');
  log('2. L\'erreur devrait maintenant être plus détaillée', 'yellow');
  log('3. Le problème peut venir du backend Railway', 'yellow');
}

async function checkServers() {
  try {
    // Vérifier frontend
    const frontendResponse = await makeRequest(`${BASE_URL}/api/test-backend`);
    const frontendOk = frontendResponse.status === 200;
    
    // Vérifier backend
    const backendResponse = await makeRequest(`${BACKEND_URL}/health`);
    const backendOk = backendResponse.status === 200;
    
    if (!frontendOk) {
      log('❌ Le serveur frontend n\'est pas accessible sur ' + BASE_URL, 'red');
      log('💡 Assurez-vous que le serveur est démarré avec: npm run dev', 'yellow');
      process.exit(1);
    }
    
    if (!backendOk) {
      log('❌ Le backend centralisé n\'est pas accessible', 'red');
      log('💡 Vérifiez Railway Dashboard', 'yellow');
      process.exit(1);
    }
    
    log('✅ Serveurs frontend et backend accessibles', 'green');
    
  } catch (error) {
    log('❌ Erreur vérification serveurs: ' + error.message, 'red');
    process.exit(1);
  }
}

async function main() {
  await checkServers();
  await runAllTests();
}

main().catch(console.error); 