// Script pour ajouter des tokens aux annonces existantes sans tokens

async function addTokensToExisting() {
  console.log('🔧 Ajout de tokens aux annonces existantes...\n');
  
  try {
    // 1. Récupérer toutes les annonces pour identifier celles sans tokens
    console.log('1️⃣ Récupération des annonces depuis le backend...');
    const response = await fetch('https://web-production-7b738.up.railway.app/api/partage/get-announcements');
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const result = await response.json();
    const announcements = result.data || [];
    
    console.log(`📋 ${announcements.length} annonces trouvées`);
    
    // Filtrer les annonces sans tokens
    const announcementsWithoutTokens = announcements.filter(ann => 
      !ann.delete_token || !ann.edit_token
    );
    
    console.log(`🎯 ${announcementsWithoutTokens.length} annonces sans tokens identifiées\n`);
    
    if (announcementsWithoutTokens.length === 0) {
      console.log('✅ Toutes les annonces ont déjà leurs tokens !');
      return;
    }
    
    // Afficher les annonces qui vont être mises à jour
    console.log('📝 Annonces qui seront mises à jour:');
    announcementsWithoutTokens.forEach((ann, index) => {
      console.log(`  ${index + 1}. ${ann.reference} (${ann.contact_first_name}) - ${ann.departure_city} → ${ann.arrival_city}`);
    });
    
    console.log('\n⚠️  ATTENTION: Cette opération va modifier les données Airtable');
    console.log('⚠️  Les tokens seront ajoutés via des appels directs au backend');
    console.log('⚠️  Assurez-vous que le backend a accès à Airtable\n');
    
    // 2. Pour chaque annonce sans tokens, faire un appel spécial au backend
    for (let i = 0; i < announcementsWithoutTokens.length; i++) {
      const announcement = announcementsWithoutTokens[i];
      
      console.log(`🔧 [${i + 1}/${announcementsWithoutTokens.length}] Traitement de ${announcement.reference}...`);
      
      try {
        // Générer des tokens côté frontend (pour simulation)
        const editToken = 'edit_retro_' + Date.now() + '_' + Math.random().toString(36).substr(2, 15);
        const deleteToken = 'del_retro_' + Date.now() + '_' + Math.random().toString(36).substr(2, 15);
        
        console.log(`   🔑 Tokens générés:`);
        console.log(`      Edit: ${editToken}`);
        console.log(`      Delete: ${deleteToken}`);
        
        // Ici, il faudrait un endpoint spécial dans le backend pour ajouter les tokens
        // Pour l'instant, on simule et on affiche ce qui devrait être fait
        
        console.log(`   ⚠️  ACTION REQUISE: Ajouter manuellement ces tokens à l'enregistrement ${announcement.id} dans Airtable`);
        console.log(`   📋 Champs à mettre à jour:`);
        console.log(`      - edit_token: "${editToken}"`);
        console.log(`      - delete_token: "${deleteToken}"`);
        
        // Pause entre les traitements
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Erreur pour ${announcement.reference}:`, error.message);
      }
      
      console.log('');
    }
    
    console.log('🎯 NEXT STEPS:');
    console.log('1. Connectez-vous à Airtable');
    console.log('2. Ouvrez la table "DodoPartage - Announcement"');
    console.log('3. Pour chaque annonce listée ci-dessus, ajoutez les tokens dans les colonnes edit_token et delete_token');
    console.log('4. Ou créez un endpoint backend pour automatiser cette tâche');
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement:', error.message);
  }
}

addTokensToExisting(); 