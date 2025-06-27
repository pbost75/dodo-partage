// Script de débogage pour la suppression d'annonce PARTAGE-210986-X609O3

async function debugDeletion() {
  console.log('🔍 Débogage suppression annonce PARTAGE-210986-X609O3\n');
  
  const announcementId = 'recPVmPFgV2VhxGEK';
  const announcementRef = 'PARTAGE-210986-X609O3';
  
  try {
    // 1. Vérifier les données de l'annonce
    console.log('1️⃣ Récupération des données de l\'annonce...');
    const getResponse = await fetch('https://www.dodomove.fr/partage/api/get-announcements');
    
    if (getResponse.ok) {
      const result = await getResponse.json();
      const announcement = result.data.find(ann => ann.id === announcementId);
      
      if (announcement) {
        console.log('✅ Annonce trouvée:');
        console.log('   - ID:', announcement.id);
        console.log('   - Référence:', announcement.reference);
        console.log('   - Statut:', announcement.status);
        console.log('   - Auteur:', announcement.author);
        console.log('   - Départ:', announcement.departure);
        console.log('   - Arrivée:', announcement.arrival);
      } else {
        console.log('❌ Annonce non trouvée dans la liste');
        return;
      }
    }
    
    // 2. Tester l'accès direct aux données backend
    console.log('\n2️⃣ Test direct backend pour cette annonce...');
    const backendResponse = await fetch(`https://web-production-7b738.up.railway.app/api/partage/get-announcements?reference=${announcementRef}`);
    
    if (backendResponse.ok) {
      const backendResult = await backendResponse.json();
      console.log('✅ Backend répond');
      console.log('Nombre d\'annonces backend:', backendResult.data?.length || 0);
      
      if (backendResult.data && backendResult.data.length > 0) {
        const backendAnn = backendResult.data.find(ann => ann.reference === announcementRef);
        if (backendAnn) {
          console.log('📋 Données complètes backend:');
          console.log('   - delete_token présent:', backendAnn.delete_token ? '✅ OUI' : '❌ NON');
          console.log('   - edit_token présent:', backendAnn.edit_token ? '✅ OUI' : '❌ NON');
          console.log('   - Status:', backendAnn.status);
          console.log('   - Email:', backendAnn.contact_email);
          
          if (backendAnn.delete_token) {
            console.log('   - Delete token:', backendAnn.delete_token.substring(0, 20) + '...');
            
            // 3. Test de récupération pour suppression
            console.log('\n3️⃣ Test récupération pour suppression...');
            const deleteFormResponse = await fetch(`https://web-production-7b738.up.railway.app/api/partage/delete-form/${backendAnn.delete_token}`);
            
            console.log('Status delete-form:', deleteFormResponse.status);
            
            if (deleteFormResponse.ok) {
              const deleteFormResult = await deleteFormResponse.json();
              console.log('✅ Delete form accessible');
              console.log('Données retournées:', deleteFormResult.data);
              
              // 4. Test de suppression (DRY RUN - ne pas réellement supprimer)
              console.log('\n4️⃣ Simulation suppression (DRY RUN)...');
              console.log('🚫 Simulation seulement - pas de vraie suppression');
              console.log('URL qui serait appelée:', 'POST https://web-production-7b738.up.railway.app/api/partage/confirm-deletion');
              console.log('Payload qui serait envoyé:', {
                deleteToken: backendAnn.delete_token,
                reason: 'found_solution'
              });
              
            } else {
              const errorText = await deleteFormResponse.text();
              console.log('❌ Delete form inaccessible');
              console.log('Erreur:', errorText.substring(0, 300));
            }
            
          } else {
            console.log('❌ Pas de delete_token - Cette annonce a été créée avant l\'implémentation');
          }
        }
      }
    } else {
      console.log('❌ Backend inaccessible:', backendResponse.status);
    }
    
    // 5. Vérifier la structure des données depuis Airtable directement
    console.log('\n5️⃣ Informations pour diagnostic...');
    console.log('Si delete_token manque, c\'est que l\'annonce a été créée avant l\'implémentation');
    console.log('Des tokens doivent être générés pour les anciennes annonces');
    console.log('Ou il faut créer une nouvelle annonce pour tester');
    
  } catch (error) {
    console.error('❌ Erreur durant le debug:', error.message);
  }
}

debugDeletion(); 