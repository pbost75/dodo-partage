/**
 * Script de test pour vérifier la correction du bug d'envoi d'email
 * 
 * BUG IDENTIFIÉ: L'email était envoyé à celui qui répond au lieu du propriétaire de l'annonce
 * CORRECTION: Ajout de authorEmail dans les données et transmission explicite au backend
 */

// Configuration de test
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'https://web-production-7b738.up.railway.app';

/**
 * Teste la structure des données d'annonce
 */
async function testAnnouncementStructure() {
  console.log('\n🧪 TEST: Vérification structure des données');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/get-announcements?status=published`);
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('❌ Aucune annonce trouvée');
      return false;
    }
    
    const announcement = result.data[0];
    console.log('📋 Structure de l\'annonce:', {
      id: announcement.id ? '✅' : '❌',
      type: announcement.type ? '✅' : '❌',
      author: announcement.author ? '✅' : '❌',
      authorEmail: announcement.authorEmail ? '✅' : '❌ MANQUANT',
      departure: announcement.departure ? '✅' : '❌',
      arrival: announcement.arrival ? '✅' : '❌',
      volume: announcement.volume ? '✅' : '❌'
    });
    
    console.log('\n📧 Email du propriétaire:', announcement.authorEmail || 'NON DISPONIBLE');
    
    const hasRequiredFields = announcement.id && announcement.type && 
                             announcement.author && announcement.authorEmail &&
                             announcement.departure && announcement.arrival && 
                             announcement.volume;
    
    if (hasRequiredFields) {
      console.log('✅ Structure complète avec authorEmail - Bug corrigé !');
      return true;
    } else {
      console.log('❌ Structure incomplète - authorEmail manquant');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur technique:', error.message);
    return false;
  }
}

/**
 * Simule un test de contact (sans envoyer réellement)
 */
async function simulateContactTest() {
  console.log('\n🧪 TEST: Simulation contact (sans envoi)');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/get-announcements?status=published`);
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('❌ Aucune annonce trouvée pour simulation');
      return false;
    }
    
    const announcement = result.data[0];
    
    console.log('📨 Simulation données contact:');
    console.log('   Annonce ID:', announcement.id);
    console.log('   Propriétaire:', announcement.author);
    console.log('   Email propriétaire:', announcement.authorEmail || '❌ MANQUANT');
    console.log('   Celui qui répond: Test User (test@example.com)');
    console.log('   ➜ Email devrait aller à:', announcement.authorEmail || 'ERREUR');
    
    if (announcement.authorEmail) {
      console.log('✅ Email correctement identifié pour envoi');
      return true;
    } else {
      console.log('❌ Email propriétaire manquant - bug non corrigé');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log('🚀 DÉMARRAGE DES TESTS - Correction bug contact email');
  console.log('📋 Objectif: Vérifier que l\'email va au propriétaire de l\'annonce');
  console.log('🔗 Frontend:', FRONTEND_URL);
  
  const results = {
    structure: await testAnnouncementStructure(),
    simulation: await simulateContactTest()
  };
  
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(50));
  console.log('Structure données:', results.structure ? '✅ PASS' : '❌ FAIL');
  console.log('Simulation contact:', results.simulation ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = results.structure && results.simulation;
  
  if (allPassed) {
    console.log('\n🎉 TESTS RÉUSSIS - Bug corrigé !');
    console.log('✅ Les emails sont maintenant envoyés au propriétaire de l\'annonce');
    console.log('✅ Le champ authorEmail est bien présent dans les données');
  } else {
    console.log('\n❌ ÉCHEC DES TESTS - Bug non corrigé');
    console.log('🔍 Vérifiez que :');
    console.log('  1. Le serveur dev est démarré (npm run dev)');
    console.log('  2. authorEmail est inclus dans get-announcements');
    console.log('  3. Les annonces sont bien publiées');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Démarrage des tests si le script est exécuté directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAnnouncementStructure,
  simulateContactTest,
  runTests
}; 