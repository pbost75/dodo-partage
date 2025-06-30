/**
 * Script de diagnostic des colonnes Airtable
 * Vérifie quelles colonnes existent réellement dans la table DodoPartage
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function debugAirtableColumns() {
  console.log('🔍 DIAGNOSTIC COLONNES AIRTABLE');
  console.log('================================\n');

  try {
    // 1. Récupérer UNE annonce pour voir toutes les colonnes disponibles
    console.log('1️⃣ Récupération d\'une annonce pour analyser les colonnes...');
    const response = await fetch(`${BACKEND_URL}/api/partage/get-announcements?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API Backend: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const announcements = data.data || [];
    
    if (announcements.length === 0) {
      console.log('❌ Aucune annonce trouvée pour analyser');
      return;
    }

    const announcement = announcements[0];
    console.log(`✅ Analyse de l'annonce ${announcement.id} - ${announcement.contact_first_name}\n`);

    // 2. Lister toutes les propriétés disponibles
    console.log('2️⃣ COLONNES DISPONIBLES DANS L\'API:');
    console.log('=====================================');
    
    const columns = Object.keys(announcement).sort();
    columns.forEach(col => {
      const value = announcement[col];
      const type = typeof value;
      const preview = value === null ? 'NULL' : 
                     value === '' ? 'VIDE' :
                     type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' :
                     JSON.stringify(value);
      
      console.log(`📋 ${col.padEnd(25)} | ${type.padEnd(8)} | ${preview}`);
    });

    // 3. Vérifier spécifiquement les champs d'expiration
    console.log('\n3️⃣ CHAMPS D\'EXPIRATION:');
    console.log('========================');
    console.log(`🗓️ expires_at: ${announcement.expires_at === null ? '❌ NULL' : announcement.expires_at === undefined ? '❌ UNDEFINED' : '✅ ' + announcement.expires_at}`);
    console.log(`🗓️ expired_at: ${announcement.expired_at === null ? '❌ NULL' : announcement.expired_at === undefined ? '❌ UNDEFINED' : '✅ ' + announcement.expired_at}`);
    
    // 4. Test direct de l'API Airtable (via notre backend)
    console.log('\n4️⃣ TEST MISE À JOUR:');
    console.log('=====================');
    
    const testDate = new Date().toISOString();
    console.log(`🧪 Test de mise à jour expires_at avec: ${testDate}`);
    
    const updateResponse = await fetch(`${BACKEND_URL}/api/partage/update-expires-at`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recordId: announcement.id,
        expiresAt: testDate,
        reason: 'Test diagnostic colonnes'
      })
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Mise à jour réussie:', updateData.message);
      
      // Vérifier immédiatement si la valeur est présente
      console.log('\n5️⃣ VÉRIFICATION IMMÉDIATE:');
      console.log('==========================');
      
      // Attendre un peu pour le cache
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const checkResponse = await fetch(`${BACKEND_URL}/api/partage/get-announcements?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const checkData = await checkResponse.json();
      const updatedAnnouncement = checkData.data[0];
      
      console.log(`🔍 expires_at après mise à jour: ${updatedAnnouncement.expires_at || 'TOUJOURS NULL'}`);
      
      if (updatedAnnouncement.expires_at) {
        console.log('🎉 SUCCÈS: expires_at fonctionne !');
      } else {
        console.log('❌ ÉCHEC: expires_at toujours NULL après mise à jour');
        console.log('💡 POSSIBLE: Colonne n\'existe pas dans Airtable ou nom différent');
      }
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Échec mise à jour:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécution
debugAirtableColumns(); 