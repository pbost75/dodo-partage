// Test de récupération des annonces pour identifier le problème des URLs

async function testGetAnnouncements() {
  console.log('🔍 Test de récupération des annonces...\n');
  
  try {
    // Test API locale (développement)
    console.log('1️⃣ Test API locale...');
    const localResponse = await fetch('http://localhost:3000/api/get-announcements');
    
    if (localResponse.ok) {
      const localResult = await localResponse.json();
      console.log('✅ API locale fonctionne');
      console.log('Nombre d\'annonces:', localResult.data?.length || 0);
      
      if (localResult.data && localResult.data.length > 0) {
        console.log('\nÉchantillon des premières annonces:');
        localResult.data.slice(0, 3).forEach((ann, index) => {
          console.log(`  ${index + 1}. ID: ${ann.id}, Ref: ${ann.reference}, Status: ${ann.status}`);
        });
      }
    } else {
      console.log('❌ API locale inaccessible (normal si serveur dev pas lancé)');
    }

  } catch (localError) {
    console.log('❌ API locale inaccessible (normal si serveur dev pas lancé)');
  }

  try {
    // Test API de production
    console.log('\n2️⃣ Test API de production...');
    const prodResponse = await fetch('https://partage.dodomove.fr/api/get-announcements');
    
    if (prodResponse.ok) {
      const prodResult = await prodResponse.json();
      console.log('✅ API de production fonctionne');
      console.log('Nombre d\'annonces:', prodResult.data?.length || 0);
      
      if (prodResult.data && prodResult.data.length > 0) {
        console.log('\nÉchantillon des premières annonces:');
        prodResult.data.slice(0, 5).forEach((ann, index) => {
          console.log(`  ${index + 1}. ID: ${ann.id}, Ref: ${ann.reference}, Status: ${ann.status}`);
          console.log(`      Départ: ${ann.departure}, Arrivée: ${ann.arrival}`);
        });
        
        // Test des URLs spécifiques mentionnées
        console.log('\n🎯 Test des IDs mentionnés:');
        const testIds = ['recPVmPFgV2VhxGEK', 'recvjKTaISYpAtkeb'];
        
        testIds.forEach(testId => {
          const found = prodResult.data.find(ann => ann.id === testId || ann.reference === testId);
          if (found) {
            console.log(`  ✅ ${testId} trouvé: ${found.reference} (${found.status})`);
          } else {
            console.log(`  ❌ ${testId} non trouvé dans les annonces`);
          }
        });
        
      } else {
        console.log('⚠️ Aucune annonce trouvée');
      }
      
    } else {
      console.log('❌ API de production en erreur:', prodResponse.status);
      const errorText = await prodResponse.text();
      console.log('Erreur:', errorText.substring(0, 200));
    }

  } catch (prodError) {
    console.error('❌ Erreur API de production:', prodError.message);
  }

  // Test direct du backend
  try {
    console.log('\n3️⃣ Test direct du backend...');
    const backendResponse = await fetch('https://web-production-7b738.up.railway.app/api/partage/get-announcements');
    
    if (backendResponse.ok) {
      const backendResult = await backendResponse.json();
      console.log('✅ Backend direct fonctionne');
      console.log('Nombre d\'annonces backend:', backendResult.data?.length || 0);
      
      if (backendResult.data && backendResult.data.length > 0) {
        console.log('\nStructure des données backend:');
        const sample = backendResult.data[0];
        console.log('Champs disponibles:', Object.keys(sample));
        console.log('Exemple:', {
          id: sample.id,
          reference: sample.reference,
          status: sample.status
        });
      }
      
    } else {
      console.log('❌ Backend direct en erreur:', backendResponse.status);
    }

  } catch (backendError) {
    console.error('❌ Erreur backend direct:', backendError.message);
  }
}

testGetAnnouncements(); 