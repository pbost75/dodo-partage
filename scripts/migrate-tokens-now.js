// Script pour migrer les tokens IMMÉDIATEMENT

async function migrateTokensNow() {
  console.log('🚀 Migration immédiate des tokens...\n');
  
  try {
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
      throw new Error(`Erreur migration (${migrationResponse.status}): ${errorText.substring(0, 200)}`);
    }
    
    const result = await migrationResponse.json();
    
    if (result.success) {
      console.log('🎉 Migration réussie !');
      console.log(`✅ ${result.updated} annonce(s) mise(s) à jour`);
      console.log(`📝 Message: ${result.message}\n`);
      
      if (result.details && result.details.length > 0) {
        console.log('📋 Annonces mises à jour:');
        result.details.forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.reference} - Tokens: ✅`);
        });
      }
      
      console.log('\n🎯 SUCCÈS! Maintenant vous pouvez:');
      console.log('1. ✅ Modifier vos annonces via les liens email');  
      console.log('2. ✅ Supprimer vos annonces via les liens email');
      console.log('3. ✅ Tester la suppression de PARTAGE-210986-X609O3');
      
    } else {
      console.log('❌ Migration échouée:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur durant la migration:', error.message);
    
    if (error.message.includes('404')) {
      console.log('\n⏳ L\'endpoint n\'est pas encore déployé par Railway');
      console.log('🔄 Attendez 1-2 minutes et relancez: node scripts/migrate-tokens-now.js');
    }
  }
}

migrateTokensNow(); 