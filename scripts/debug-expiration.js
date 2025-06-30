/**
 * Script de diagnostic pour l'expiration des annonces
 * Vérifie l'état actuel des annonces et de la colonne expires_at
 * Utilise l'API du backend centralisé Dodomove
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function diagnosticExpiration() {
  console.log('🔍 DIAGNOSTIC SYSTÈME D\'EXPIRATION');
  console.log('=====================================\n');

  try {
    // 1. Récupérer toutes les annonces via l'API backend
    console.log('1️⃣ Récupération des annonces via API backend...');
    const response = await fetch(`${BACKEND_URL}/api/partage/get-announcements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API Backend: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const allAnnouncements = data.data || [];
    console.log(`✅ ${allAnnouncements.length} annonces totales récupérées\n`);

    // 2. Filtrer les annonces published
    const publishedAnnouncements = allAnnouncements.filter(ann => ann.status === 'published');
    console.log(`📋 ${publishedAnnouncements.length} annonces avec status='published'\n`);

    // 3. Analyse détaillée
    console.log('3️⃣ Analyse détaillée des annonces published...');
    
    let hasExpiresAt = 0;
    let hasExpiredAt = 0;
    let noExpiresAt = 0;
    let shouldExpireToday = 0;
    
    const today = new Date();
    
    for (const announcement of publishedAnnouncements) {
      console.log(`\n📄 ${announcement.id} - ${announcement.contact_first_name} (${announcement.request_type})`);
      
      if (announcement.expires_at) {
        hasExpiresAt++;
        const expiresDate = new Date(announcement.expires_at);
        console.log(`   expires_at: ${announcement.expires_at}`);
        console.log(`   Expire ${expiresDate <= today ? '✅ AUJOURD\'HUI/PASSÉ' : '⏳ FUTUR'}`);
        
        if (expiresDate <= today) {
          shouldExpireToday++;
        }
      } else {
        noExpiresAt++;
        console.log(`   expires_at: ❌ VIDE`);
      }
      
      if (announcement.expired_at) {
        hasExpiredAt++;
        console.log(`   expired_at: ${announcement.expired_at} (déjà expirée)`);
      }
      
      if (announcement.shipping_date) {
        console.log(`   shipping_date: ${announcement.shipping_date}`);
      }
    }

    // 4. Résumé
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('========================');
    console.log(`📋 Total annonces published: ${publishedAnnouncements.length}`);
    console.log(`✅ Avec expires_at rempli: ${hasExpiresAt}`);
    console.log(`❌ Sans expires_at: ${noExpiresAt}`);
    console.log(`🗓️ Avec expired_at (déjà expirées): ${hasExpiredAt}`);
    console.log(`⏰ Devraient expirer aujourd'hui: ${shouldExpireToday}`);

    // 5. Diagnostic final
    console.log('\n🎯 DIAGNOSTIC:');
    if (noExpiresAt > 0) {
      console.log(`❌ PROBLÈME: ${noExpiresAt} annonces n'ont pas de expires_at`);
      console.log(`   → La colonne expires_at existe-t-elle dans Airtable ?`);
      console.log(`   → Les nouvelles annonces sont-elles créées avec expires_at ?`);
    }
    
    if (shouldExpireToday === 0) {
      console.log(`ℹ️ NORMAL: Aucune annonce à expirer aujourd'hui`);
    } else {
      console.log(`⚠️ ATTENTION: ${shouldExpireToday} annonces devraient expirer`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécution
diagnosticExpiration(); 