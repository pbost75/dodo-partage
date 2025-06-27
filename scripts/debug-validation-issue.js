#!/usr/bin/env node

/**
 * Script de diagnostic pour le problème de validation en production
 * Usage: node scripts/debug-validation-issue.js
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = 'https://www.dodomove.fr/partage';
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

async function createTestAnnouncement() {
  log('\n🧪 Création d\'une annonce de test pour obtenir un vrai token', 'blue');
  
  const testAnnouncement = {
    contact: {
      firstName: 'TestDebug',
      email: 'bost.analytics@gmail.com',
      phone: '+33123456789'
    },
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
    announcementText: 'Test debug validation - à supprimer',
    currentStep: 7,
    isCompleted: true,
    // Nouveaux champs après suppression display_name
    departureLocation: 'Paris, France',
    arrivalLocation: 'Fort-de-France, Martinique'
  };
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/partage/submit-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAnnouncement)
    });
    
    if (response.status === 200 && response.data.success) {
      log(`   ✅ Annonce créée: ${response.data.data?.reference}`, 'green');
      return response.data.data?.reference;
    } else {
      log(`   ❌ Échec création: ${response.data.error || 'Inconnue'}`, 'red');
      return null;
    }
    
  } catch (error) {
    log(`   ❌ Erreur création: ${error.message}`, 'red');
    return null;
  }
}

async function findValidationToken(reference) {
  log('\n🔍 Recherche du token de validation dans Airtable...', 'blue');
  log('   Note: Cette étape nécessiterait l\'accès à Airtable', 'yellow');
  log('   Pour le test, nous allons utiliser des tokens fictifs', 'yellow');
  
  // En réalité, il faudrait interroger Airtable pour récupérer le validation_token
  // Mais pour le debug, nous allons tester avec des tokens factices
  return null;
}

async function testBackendValidation(token) {
  log(`\n🧪 Test validation backend directe avec token: ${token}`, 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/partage/validate-announcement?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Debug-Script/1.0'
      }
    });
    
    log(`   📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`   📊 Headers:`, 'yellow');
    Object.entries(response.headers).forEach(([key, value]) => {
      log(`      ${key}: ${value}`, 'yellow');
    });
    
    if (response.status === 200) {
      log(`   📄 Réponse de succès:`, 'green');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`   📄 Réponse d'erreur:`, 'red');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    return response;
    
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    return null;
  }
}

async function testFrontendValidation(token) {
  log(`\n🧪 Test validation frontend avec token: ${token}`, 'blue');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/api/validate-announcement?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Debug-Script/1.0'
      }
    });
    
    log(`   📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 302 || response.status === 307) {
      log(`   🔄 Redirection vers: ${response.headers.location}`, 'yellow');
      
      if (response.headers.location && response.headers.location.includes('validation-error')) {
        log(`   ❌ PROBLÈME DÉTECTÉ: Redirection vers page d'erreur`, 'red');
        
        // Analyser la raison
        const url = new URL(response.headers.location);
        const reason = url.searchParams.get('reason');
        log(`   📋 Raison: ${reason}`, 'red');
        
        return { redirectError: true, reason, location: response.headers.location };
      } else if (response.headers.location && response.headers.location.includes('validation-success')) {
        log(`   ✅ SUCCÈS: Redirection vers page de succès`, 'green');
        return { success: true, location: response.headers.location };
      }
    }
    
    return response;
    
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    return null;
  }
}

async function analyzeDiscrepancy(backendResponse, frontendResponse) {
  log('\n🔍 Analyse des différences Backend vs Frontend', 'blue');
  
  if (!backendResponse || !frontendResponse) {
    log('   ⚠️ Impossible d\'analyser - réponses manquantes', 'yellow');
    return;
  }
  
  log(`   📊 Backend status: ${backendResponse.status}`, backendResponse.status === 200 ? 'green' : 'red');
  log(`   📊 Frontend result: ${frontendResponse.redirectError ? 'ERROR' : 'SUCCESS'}`, frontendResponse.redirectError ? 'red' : 'green');
  
  if (backendResponse.status === 200 && frontendResponse.redirectError) {
    log('   🚨 INCOHÉRENCE DÉTECTÉE !', 'red');
    log('   📋 Backend dit: SUCCÈS (200)', 'red');
    log('   📋 Frontend dit: ERREUR', 'red');
    log('   📋 Cause probable: Frontend n\'interprète pas correctement la réponse backend', 'red');
    
    // Suggestions de debug
    log('\n💡 Suggestions de correction:', 'blue');
    log('   1. Vérifier que le backend retourne bien un JSON avec success:true', 'yellow');
    log('   2. Vérifier les logs du frontend (npm run dev)', 'yellow');
    log('   3. Vérifier les headers Content-Type du backend', 'yellow');
    log('   4. Tester la réponse backend en direct dans le navigateur', 'yellow');
  }
}

async function runDiagnostic() {
  log('🚀 Diagnostic du problème de validation DodoPartage', 'bold');
  log('======================================================', 'bold');
  
  // Test avec différents tokens factices
  const testTokens = [
    'fake-token-for-404',
    'validation-test-token',
    'debug-token-123'
  ];
  
  for (const token of testTokens) {
    log(`\n📋 Test avec token: ${token}`, 'bold');
    
    const backendResponse = await testBackendValidation(token);
    const frontendResponse = await testFrontendValidation(token);
    
    await analyzeDiscrepancy(backendResponse, frontendResponse);
    
    log('─'.repeat(50), 'yellow');
  }
  
  // Créer une vraie annonce pour obtenir un vrai token
  log('\n📋 Test avec une vraie annonce', 'bold');
  const reference = await createTestAnnouncement();
  
  if (reference) {
    log(`   ℹ️ Référence créée: ${reference}`, 'blue');
    log('   ℹ️ Pour continuer le test, vous devez:', 'blue');
    log('   1. Aller dans Airtable', 'yellow');
    log('   2. Trouver l\'annonce avec cette référence', 'yellow');
    log('   3. Copier le champ validation_token', 'yellow');
    log('   4. Relancer ce script avec le vrai token', 'yellow');
  }
  
  log('\n📊 Diagnostic terminé', 'bold');
  log('====================', 'bold');
}

// Point d'entrée
if (require.main === module) {
  runDiagnostic().catch(console.error);
} 