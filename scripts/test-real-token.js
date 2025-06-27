#!/usr/bin/env node

/**
 * Script pour tester avec un vrai token de validation
 * Usage: node scripts/test-real-token.js [TOKEN]
 */

const https = require('https');

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
    const req = https.request(url, options, (res) => {
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
    
    req.end();
  });
}

async function testValidationFlow(token) {
  log(`🧪 Test complet du flux de validation avec token: ${token}`, 'bold');
  log('='.repeat(70), 'bold');
  
  // 1. Test direct backend
  log('\n1️⃣ Test Backend Direct', 'blue');
  try {
    const backendResponse = await makeRequest(`${BACKEND_URL}/api/partage/validate-announcement?token=${encodeURIComponent(token)}`);
    
    log(`   📊 Status: ${backendResponse.status}`, backendResponse.status === 200 ? 'green' : 'red');
    log(`   📄 Content-Type: ${backendResponse.headers['content-type']}`, 'yellow');
    
    if (backendResponse.status === 200) {
      log(`   ✅ BACKEND: SUCCÈS !`, 'green');
      log('   📄 Réponse complète:', 'green');
      console.log(JSON.stringify(backendResponse.data, null, 2));
      
      // Vérifications importantes
      if (backendResponse.data && backendResponse.data.success === true) {
        log('   ✅ Champ success: true ✓', 'green');
      } else {
        log('   ❌ Champ success manquant ou false !', 'red');
      }
      
      if (backendResponse.headers['content-type']?.includes('application/json')) {
        log('   ✅ Content-Type JSON ✓', 'green');
      } else {
        log('   ❌ Content-Type non-JSON !', 'red');
      }
      
    } else {
      log(`   ❌ BACKEND: ÉCHEC`, 'red');
      log('   📄 Réponse d\'erreur:', 'red');
      console.log(JSON.stringify(backendResponse.data, null, 2));
    }
    
  } catch (error) {
    log(`   ❌ Erreur backend: ${error.message}`, 'red');
    return;
  }
  
  // 2. Test frontend
  log('\n2️⃣ Test Frontend (via Next.js API)', 'blue');
  try {
    const frontendResponse = await makeRequest(`${FRONTEND_URL}/api/validate-announcement?token=${encodeURIComponent(token)}`);
    
    log(`   📊 Status: ${frontendResponse.status}`, frontendResponse.status === 200 ? 'green' : 'red');
    
    if (frontendResponse.status === 302 || frontendResponse.status === 307) {
      const location = frontendResponse.headers.location;
      log(`   🔄 Redirection vers: ${location}`, 'yellow');
      
      if (location.includes('validation-success')) {
        log('   ✅ FRONTEND: SUCCÈS ! Redirection vers page de succès', 'green');
        
        // Extraire la référence si présente
        const url = new URL(location);
        const ref = url.searchParams.get('ref');
        if (ref) {
          log(`   📋 Référence: ${ref}`, 'green');
        }
        
      } else if (location.includes('validation-error')) {
        log('   ❌ FRONTEND: ÉCHEC ! Redirection vers page d\'erreur', 'red');
        
        const url = new URL(location);
        const reason = url.searchParams.get('reason');
        log(`   📋 Raison: ${reason}`, 'red');
        
        // Analyser les raisons possibles
        switch(reason) {
          case 'validation-failed':
            log('   💡 Cette erreur indique que le frontend a reçu une réponse du backend qu\'il interprète comme un échec', 'yellow');
            break;
          case 'server-error':
            log('   💡 Erreur lors du parsing de la réponse ou exception dans le frontend', 'yellow');
            break;
          case 'token-not-found':
            log('   💡 Backend a retourné 404', 'yellow');
            break;
          default:
            log(`   💡 Raison inconnue: ${reason}`, 'yellow');
        }
      }
    } else {
      log(`   📄 Réponse inattendue:`, 'yellow');
      console.log(frontendResponse.raw);
    }
    
  } catch (error) {
    log(`   ❌ Erreur frontend: ${error.message}`, 'red');
  }
  
  // 3. Test navigation browser-like
  log('\n3️⃣ Test Navigation Simulée', 'blue');
  try {
    const navResponse = await makeRequest(`${FRONTEND_URL}/api/validate-announcement?token=${encodeURIComponent(token)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    if (navResponse.status === 307 || navResponse.status === 302) {
      const finalUrl = navResponse.headers.location;
      log(`   🌐 Redirection finale: ${finalUrl}`, 'yellow');
      
      if (finalUrl.includes('validation-success')) {
        log('   ✅ L\'utilisateur sera dirigé vers la page de SUCCÈS', 'green');
      } else {
        log('   ❌ L\'utilisateur sera dirigé vers la page d\'ERREUR', 'red');
      }
    }
    
  } catch (error) {
    log(`   ⚠️ Erreur navigation: ${error.message}`, 'yellow');
  }
  
  log('\n📊 Résumé du diagnostic', 'bold');
  log('='.repeat(30), 'bold');
  log('Si le backend retourne 200 mais le frontend redirige vers validation-error,', 'yellow');
  log('alors le problème est dans le code frontend qui n\'interprète pas correctement', 'yellow');
  log('la réponse du backend.', 'yellow');
}

// Point d'entrée
const token = process.argv[2];

if (!token) {
  log('❌ Usage: node scripts/test-real-token.js [TOKEN]', 'red');
  log('📋 Veuillez fournir le token de validation récupéré depuis Airtable', 'yellow');
  log('📋 Exemple: node scripts/test-real-token.js "validation_abc123def456"', 'yellow');
  process.exit(1);
}

testValidationFlow(token).catch(console.error); 