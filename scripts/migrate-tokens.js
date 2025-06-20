// Script pour migrer les tokens sur les annonces existantes

async function migrateTokens() {
  console.log('🚀 Migration des tokens pour les annonces existantes...\n');
  
  try {
    console.log('⏳ Attente que Railway déploie le nouvel endpoint...');
    console.log('📋 Vérification de la disponibilité du backend...\n');
    
    // 1. Vérifier que le backend est accessible
    const healthResponse = await fetch('https://web-production-7b738.up.railway.app/ping');
    if (!healthResponse.ok) {
      throw new Error('Backend inaccessible');
    }
    console.log('✅ Backend accessible\n');
    
    // 2. Appeler l'endpoint de migration
    console.log('🔧 Appel de l\'endpoint de migration...');
    
    const migrationResponse = await fetch('https://web-production-7b738.up.railway.app/api/partage/add-missing-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'add_tokens_to_existing'
      })
    });
    
    console.log('Status migration:', migrationResponse.status);
    
    if (!migrationResponse.ok) {
      const errorText = await migrationResponse.text();
      throw new Error(`Erreur migration (${migrationResponse.status}): ${errorText}`);
    }
    
    const result = await migrationResponse.json();
    
    if (result.success) {
      console.log('🎉 Migration réussie !');
      console.log(`✅ ${result.updated} annonce(s) mise(s) à jour`);
      console.log(`📝 Message: ${result.message}\n`);
      
      if (result.details && result.details.length > 0) {
        console.log('📋 Annonces mises à jour:');
        result.details.forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.reference} - Tokens ajoutés: ${detail.hasTokens ? '✅' : '❌'}`);
        });
      }
      
      console.log('\n🎯 Prochaines étapes:');
      console.log('1. Les annonces ont maintenant leurs tokens edit/delete');
      console.log('2. Les liens de modification/suppression fonctionnent');
      console.log('3. Testez la suppression de votre annonce');
      
    } else {
      console.log('❌ Migration échouée:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur durant la migration:', error.message);
    
    console.log('\n🔍 Informations de débogage:');
    console.log('- Assurez-vous que Railway a terminé le déploiement');
    console.log('- Vérifiez que l\'endpoint /api/partage/add-missing-tokens existe');
    console.log('- Attendez 2-3 minutes et réessayez');
  }
}

// Attendre un peu que Railway déploie
console.log('⏳ Attente du déploiement Railway (30 secondes)...');
setTimeout(() => {
  migrateTokens();
}, 30000); 