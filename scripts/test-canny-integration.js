#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration Canny
 * Usage: node scripts/test-canny-integration.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de l\'intégration Canny\n');

// Fonction pour lire le fichier .env.local
function readEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local non trouvé');
    console.log('💡 Copiez env.local.example vers .env.local et ajoutez votre APP ID Canny\n');
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  return envVars;
}

// Test des variables d'environnement
const envVars = readEnvLocal();

if (!envVars) {
  process.exit(1);
}

console.log('📋 Variables Canny détectées:');
console.log(`   NEXT_PUBLIC_ENABLE_FEEDBACK: ${envVars.NEXT_PUBLIC_ENABLE_FEEDBACK || 'non défini'}`);
console.log(`   NEXT_PUBLIC_CANNY_APP_ID: ${envVars.NEXT_PUBLIC_CANNY_APP_ID ? 'défini ✅' : 'non défini ❌'}`);

// Validation des paramètres
let allGood = true;

if (envVars.NEXT_PUBLIC_ENABLE_FEEDBACK !== 'true') {
  console.log('\n⚠️  NEXT_PUBLIC_ENABLE_FEEDBACK devrait être "true"');
  allGood = false;
}

if (!envVars.NEXT_PUBLIC_CANNY_APP_ID) {
  console.log('\n⚠️  NEXT_PUBLIC_CANNY_APP_ID est requis pour l\'intégration complète');
  console.log('💡 Ajoutez votre APP ID Canny dans .env.local');
  allGood = false;
}

// Test de la structure des fichiers
console.log('\n📁 Vérification des fichiers:');

const filesToCheck = [
  'src/components/ui/FeedbackButton.tsx',
  'src/app/layout.tsx'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} manquant`);
    allGood = false;
  }
});

// Résultats
console.log('\n🎯 Résumé:');

if (allGood && envVars.NEXT_PUBLIC_CANNY_APP_ID) {
  console.log('✅ Configuration Canny complète !');
  console.log('🚀 L\'intégration widget Canny est active');
  console.log('📱 Les utilisateurs verront le widget intégré au lieu de la page externe');
} else if (envVars.NEXT_PUBLIC_ENABLE_FEEDBACK === 'true') {
  console.log('⚠️  Configuration Canny partielle');
  console.log('🌐 Les utilisateurs seront redirigés vers la page Canny externe');
  console.log('💡 Ajoutez NEXT_PUBLIC_CANNY_APP_ID pour une intégration complète');
} else {
  console.log('❌ Configuration Canny incomplète');
  console.log('🔧 Vérifiez votre fichier .env.local');
}

console.log('\n📖 Documentation:');
console.log('   • Widget intégré: https://developers.canny.io/install');
console.log('   • APP ID: Disponible dans votre dashboard Canny');

console.log('\n🔍 Pour tester:');
console.log('   1. npm run dev');
console.log('   2. Ouvrez http://localhost:3000');
console.log('   3. Survolez la languette "FEEDBACK" sur le côté droit');
console.log('   4. Cliquez sur une option pour tester l\'intégration'); 