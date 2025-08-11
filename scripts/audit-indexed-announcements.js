/**
 * 🔍 AUDIT DES ANNONCES DÉJÀ INDEXÉES PAR GOOGLE
 * 
 * Ce script génère une liste des URLs d'annonces à nettoyer pour éviter les 404 SEO toxiques
 */

require('dotenv').config({ path: '.env.local' });

async function auditIndexedAnnouncements() {
  console.log('🔍 Audit des annonces déjà indexées...\n');
  
  try {
    // 1. Récupérer toutes les annonces (actives + expirées + supprimées) via le backend centralisé
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    console.log('📡 Récupération des annonces du backend centralisé...');
    
    // Appeler l'API du backend centralisé qui peut récupérer toutes les annonces
    // On fait plusieurs appels pour récupérer tous les statuts
    const [publishedRes, expiredRes, deletedRes] = await Promise.all([
      fetch(`${backendUrl}/api/partage/get-announcements?status=published`),
      fetch(`${backendUrl}/api/partage/get-announcements?status=expired`),
      fetch(`${backendUrl}/api/partage/get-announcements?status=deleted`)
    ]);
    
    // Vérifier que tous les appels ont réussi
    if (!publishedRes.ok || !expiredRes.ok || !deletedRes.ok) {
      throw new Error(`Erreur API: ${publishedRes.status}, ${expiredRes.status}, ${deletedRes.status}`);
    }
    
    // Parser les résultats
    const [publishedResult, expiredResult, deletedResult] = await Promise.all([
      publishedRes.json(),
      expiredRes.json(),
      deletedRes.json()
    ]);
    
    // Combiner toutes les annonces
    const allAnnouncements = [
      ...(publishedResult.data || []),
      ...(expiredResult.data || []),
      ...(deletedResult.data || [])
    ];
    
    console.log(`📊 Total d'annonces trouvées: ${allAnnouncements.length}`);
    
    // 2. Analyser par statut
    const activeAnnouncements = allAnnouncements.filter(a => a.status === 'published');
    const expiredAnnouncements = allAnnouncements.filter(a => a.status === 'expired');
    const deletedAnnouncements = allAnnouncements.filter(a => a.status === 'deleted');
    
    console.log(`\n📈 Répartition par statut:`);
    console.log(`  ✅ Actives (published): ${activeAnnouncements.length}`);
    console.log(`  ⏰ Expirées (expired): ${expiredAnnouncements.length}`);
    console.log(`  🗑️ Supprimées (deleted): ${deletedAnnouncements.length}`);
    
    // 3. Générer les URLs potentiellement indexées (expirées + supprimées)
    const problematicAnnouncements = [...expiredAnnouncements, ...deletedAnnouncements];
    const problematicUrls = problematicAnnouncements.map(a => ({
      id: a.id,
      url: `https://www.dodomove.fr/partage/annonce/${a.id}`,
      status: a.status,
      title: a.title || `${a.departure} → ${a.arrival}`,
      created_at: a.created_at,
      expired_at: a.expired_at || a.deleted_at
    }));
    
    console.log(`\n🚨 URLs problématiques (potentiellement indexées): ${problematicUrls.length}`);
    
    // 4. Écrire les listes pour Google Search Console
    const fs = require('fs');
    const path = require('path');
    
    // Liste des URLs à supprimer de l'index Google
    const urlsToRemove = problematicUrls.map(item => item.url);
    fs.writeFileSync(
      path.join(__dirname, 'urls-to-remove-from-google.txt'),
      urlsToRemove.join('\n'),
      'utf8'
    );
    
    // Rapport détaillé JSON
    fs.writeFileSync(
      path.join(__dirname, 'indexed-announcements-audit.json'),
      JSON.stringify({
        audit_date: new Date().toISOString(),
        summary: {
          total_announcements: allAnnouncements.length,
          active_announcements: activeAnnouncements.length,
          expired_announcements: expiredAnnouncements.length,
          deleted_announcements: deletedAnnouncements.length,
          problematic_urls: problematicUrls.length
        },
        urls_to_remove: problematicUrls
      }, null, 2),
      'utf8'
    );
    
    console.log(`\n📝 Fichiers générés:`);
    console.log(`  📄 urls-to-remove-from-google.txt - Pour soumission Google Search Console`);
    console.log(`  📊 indexed-announcements-audit.json - Rapport détaillé`);
    
    // 5. Instructions pour la suite
    console.log(`\n🎯 ACTIONS RECOMMANDÉES:`);
    console.log(`\n1. 🔧 REDIRECTIONS (Priorité HAUTE):`);
    console.log(`   - Implémenter une redirection des annonces expirées/supprimées`);
    console.log(`   - Rediriger vers la page destination correspondante`);
    console.log(`   - Ex: /annonce/123 (France→Réunion) → /france-reunion/`);
    
    console.log(`\n2. 🗑️ SUPPRESSION GOOGLE (Priorité MOYENNE):`);
    console.log(`   - Aller dans Google Search Console`);
    console.log(`   - Outils > Suppressions > Supprimer temporairement`);
    console.log(`   - Importer les ${problematicUrls.length} URLs depuis urls-to-remove-from-google.txt`);
    
    console.log(`\n3. 📊 MONITORING (Priorité BASSE):`);
    console.log(`   - Surveiller que les nouvelles annonces ne s'indexent plus (grâce au noindex)`);
    console.log(`   - Vérifier dans 2-4 semaines que les 404 disparaissent`);
    
    console.log(`\n✅ Audit terminé avec succès !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    process.exit(1);
  }
}

// Exécuter l'audit
auditIndexedAnnouncements();
