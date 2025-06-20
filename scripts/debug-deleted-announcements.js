/**
 * Script pour diagnostiquer les annonces supprimées qui apparaissent encore
 * Usage: node scripts/debug-deleted-announcements.js
 */

async function testAnnouncementFiltering() {
  console.log('🔍 Diagnostic des annonces supprimées...\n');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
  
  try {
    // Test 1: Récupération avec statut par défaut (published)
    console.log('📋 Test 1: Annonces avec statut "published" (par défaut)');
    const publishedResponse = await fetch(`${backendUrl}/api/partage/get-announcements?status=published`);
    const publishedResult = await publishedResponse.json();
    
    console.log(`✅ ${publishedResult.data?.length || 0} annonces publiées trouvées`);
    
    // Vérifier s'il y a des annonces avec statut "deleted" dans les résultats
    const deletedInPublished = publishedResult.data?.filter(ann => ann.status === 'deleted') || [];
    if (deletedInPublished.length > 0) {
      console.log(`❌ PROBLÈME: ${deletedInPublished.length} annonces supprimées trouvées dans les résultats "published"!`);
      deletedInPublished.forEach(ann => {
        console.log(`   - ${ann.reference} (ID: ${ann.id}) - Statut: ${ann.status}`);
      });
    } else {
      console.log('✅ Aucune annonce supprimée trouvée dans les résultats "published"');
    }

    // Test 2: Récupération de toutes les annonces (pour voir les supprimées)
    console.log('\n📋 Test 2: Toutes les annonces (status=all)');
    const allResponse = await fetch(`${backendUrl}/api/partage/get-announcements?status=all`);
    const allResult = await allResponse.json();
    
    console.log(`✅ ${allResult.data?.length || 0} annonces totales trouvées (toutes sauf supprimées)`);
    
    // Test 3: Récupération explicite des annonces supprimées
    console.log('\n📋 Test 3: Annonces supprimées uniquement (status=deleted)');
    const deletedResponse = await fetch(`${backendUrl}/api/partage/get-announcements?status=deleted`);
    const deletedResult = await deletedResponse.json();
    
    console.log(`✅ ${deletedResult.data?.length || 0} annonces supprimées trouvées`);
    
    if (deletedResult.data?.length > 0) {
      console.log('📝 Liste des annonces supprimées:');
      deletedResult.data.forEach(ann => {
        console.log(`   - ${ann.reference} (ID: ${ann.id}) - Supprimée le: ${ann.deleted_at || 'Date inconnue'}`);
      });
    }

    // Test 4: Statistiques globales
    console.log('\n📊 Statistiques globales:');
    console.log(`   - Annonces publiées: ${publishedResult.data?.length || 0}`);
    console.log(`   - Annonces totales (sauf supprimées): ${allResult.data?.length || 0}`);
    console.log(`   - Annonces supprimées: ${deletedResult.data?.length || 0}`);
    
    // Test 5: Vérification du frontend
    console.log('\n📋 Test 5: Test du frontend (comme l\'utilisateur)');
    const frontendResponse = await fetch('http://localhost:3000/api/get-announcements');
    
    if (frontendResponse.ok) {
      const frontendResult = await frontendResponse.json();
      console.log(`✅ Frontend: ${frontendResult.data?.length || 0} annonces récupérées`);
      
      const deletedInFrontend = frontendResult.data?.filter(ann => ann.status === 'deleted') || [];
      if (deletedInFrontend.length > 0) {
        console.log(`❌ PROBLÈME FRONTEND: ${deletedInFrontend.length} annonces supprimées apparaissent sur le site!`);
        deletedInFrontend.forEach(ann => {
          console.log(`   - ${ann.reference} - Statut: ${ann.status}`);
        });
      } else {
        console.log('✅ Frontend: Aucune annonce supprimée trouvée (correct)');
      }
    } else {
      console.log('⚠️  Impossible de tester le frontend (serveur Next.js non démarré?)');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction pour identifier les annonces avec des statuts étranges
async function identifyProblematicAnnouncements() {
  console.log('\n🔍 Recherche d\'annonces avec des statuts problématiques...');
  
  // Cette fonction nécessiterait un accès direct à Airtable
  // Pour l'instant, nous utilisons l'API backend
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
  
  try {
    // Récupérer toutes les annonces (y compris supprimées pour analyse)
    console.log('📋 Récupération de toutes les données pour analyse...');
    
    // Note: Cette requête pourrait nécessiter une route spéciale d'admin
    // Pour l'instant, on utilise les routes existantes
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

// Exécution du script
async function main() {
  console.log('🚀 Démarrage du diagnostic des annonces supprimées\n');
  
  await testAnnouncementFiltering();
  await identifyProblematicAnnouncements();
  
  console.log('\n✅ Diagnostic terminé');
  console.log('\n💡 Actions recommandées:');
  console.log('   1. Si des annonces supprimées apparaissent encore, vérifiez Airtable');
  console.log('   2. Redémarrez le serveur backend Railway après les corrections');
  console.log('   3. Testez à nouveau avec ce script');
  console.log('   4. Vérifiez le site web directement');
}

main().catch(console.error); 