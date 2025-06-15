#!/usr/bin/env node

/**
 * Script de test pour les alertes email DodoPartage via le backend centralisé
 * Usage: npm run test:email-alerts
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
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

async function testFrontendConnection() {
  log('\n🧪 Test 2: Connexion frontend aux alertes email', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-email-alerts`);
    
    if (response.status === 200 && response.data.success) {
      log('✅ Connexion frontend réussie !', 'green');
      log(`   Backend utilisé: ${response.data.backend.url}`, 'yellow');
      log(`   Status backend: ${response.data.backend.accessible ? 'Accessible' : 'Non accessible'}`, 'yellow');
      return true;
    } else {
      log('❌ Échec de connexion frontend', 'red');
      log(`   Erreur: ${response.data.message || 'Inconnue'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erreur de connexion frontend', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testCreateAlert() {
  log('\n🧪 Test 3: Création d\'une alerte email', 'blue');
  
  const testAlert = {
    type: 'request',
    departure: 'Paris, France',
    arrival: 'Fort-de-France, Martinique',
    volume_min: 5,
    email: 'test@example.com'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/create-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAlert)
    });
    
    if (response.status === 200 && response.data.success) {
      log('✅ Alerte créée avec succès !', 'green');
      log(`   Alert ID: ${response.data.data?.alertId || 'N/A'}`, 'yellow');
      log(`   Email: ${response.data.data?.email}`, 'yellow');
      log(`   Backend: ${response.data.backend?.used}`, 'yellow');
      return response.data.data?.alertId;
    } else {
      log('❌ Échec de création', 'red');
      log(`   Erreur: ${response.data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Erreur lors de la création', 'red');
    log(`   ${error.message}`, 'red');
    return null;
  }
}

async function testApiDocumentation() {
  log('\n🧪 Test 4: Documentation de l\'API', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/create-alert`);
    
    if (response.status === 200 && response.data.message) {
      log('✅ Documentation accessible', 'green');
      log(`   Usage: ${response.data.usage}`, 'yellow');
      log(`   Backend: ${response.data.backend?.url}`, 'yellow');
      return true;
    } else {
      log('❌ Documentation non accessible', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erreur d\'accès à la documentation', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testValidation() {
  log('\n🧪 Test 5: Validation des données', 'blue');
  
  const invalidAlert = {
    type: 'invalid-type',
    departure: '',
    arrival: 'Fort-de-France, Martinique',
    volume_min: -5,
    email: 'invalid-email'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/create-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidAlert)
    });
    
    if (response.status === 400 && !response.data.success) {
      log('✅ Validation fonctionne correctement', 'green');
      log(`   Erreur attendue: ${response.data.error}`, 'yellow');
      return true;
    } else {
      log('❌ Validation ne fonctionne pas', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Erreur lors du test de validation', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Tests des alertes email DodoPartage via backend centralisé', 'bold');
  log('=' .repeat(70), 'blue');
  
  const results = [];
  
  // Test 1: Backend centralisé
  results.push(await testBackendConnection());
  
  // Test 2: Frontend vers backend
  results.push(await testFrontendConnection());
  
  // Test 3: Création d'alerte
  const alertId = await testCreateAlert();
  results.push(!!alertId);
  
  // Test 4: Documentation
  results.push(await testApiDocumentation());
  
  // Test 5: Validation
  results.push(await testValidation());
  
  // Résumé
  log('\n' + '=' .repeat(70), 'blue');
  log('📊 Résumé des tests:', 'bold');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log(`✅ Tous les tests réussis (${passed}/${total})`, 'green');
    log('\n🎉 Système d\'alertes email opérationnel via backend centralisé !', 'green');
  } else {
    log(`❌ ${total - passed} test(s) échoué(s) sur ${total}`, 'red');
    log('\n🔧 Vérifiez votre configuration:', 'yellow');
    log('   1. Backend centralisé accessible', 'yellow');
    log('   2. Variables d\'environnement frontend', 'yellow');
    log('   3. Routes backend configurées', 'yellow');
  }
  
  log('\n📝 Architecture utilisée:', 'blue');
  log('   Frontend (Next.js) → Backend centralisé (Railway) → Airtable + Resend', 'yellow');
  log('\n📝 Variables d\'environnement requises:', 'blue');
  log('   NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app', 'yellow');
  
  log('\n🔗 URLs importantes:', 'blue');
  log(`   Backend: ${BACKEND_URL}`, 'yellow');
  log(`   Frontend: ${BASE_URL}`, 'yellow');
  log(`   Test frontend: ${BASE_URL}/api/test-email-alerts`, 'yellow');
  
  process.exit(passed === total ? 0 : 1);
}

// Vérification que le serveur frontend est démarré
async function checkFrontendServer() {
  try {
    await makeRequest(`${BASE_URL}/api/test-email-alerts`);
    return true;
  } catch (error) {
    log('❌ Serveur frontend non accessible sur http://localhost:3000', 'red');
    log('   Démarrez le serveur avec: npm run dev', 'yellow');
    return false;
  }
}

// Point d'entrée principal
async function main() {
  const frontendRunning = await checkFrontendServer();
  if (!frontendRunning) {
    process.exit(1);
  }
  
  await runAllTests();
}

main().catch(console.error); 