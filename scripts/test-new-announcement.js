// Test du processus complet : création + validation + suppression
// Utilisation du fetch natif de Node.js 18+

async function testFullProcess() {
  console.log('🚀 Test du processus complet DodoPartage\n');
  
  try {
    // 1. Créer une nouvelle annonce
    console.log('1️⃣ Création d\'une nouvelle annonce...');
    
    const announcementData = {
      contact: {
        firstName: 'TestSuppression',
        email: 'test-suppression@example.com',
        phone: '+33123456789'
      },
      departure: {
        country: 'France',
        city: 'Paris',
        postalCode: '75001',
        displayName: 'Paris, France'
      },
      arrival: {
        country: 'Martinique',
        city: 'Fort-de-France',
        postalCode: '97200',
        displayName: 'Fort-de-France, Martinique'
      },
      shippingDate: '2024-12-20',
      container: {
        type: '20',
        availableVolume: 15,
        minimumVolume: 2
      },
      offerType: 'free',
      announcementText: 'Test de suppression - Annonce créée pour tester la fonctionnalité de suppression. Cette description contient le minimum de caractères requis.'
    };
    
    const createResponse = await fetch('https://partage.dodomove.fr/api/submit-announcement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(announcementData)
    });
    
    const createResult = await createResponse.json();
    console.log('Résultat création:', createResult);
    
    if (!createResult.success) {
      throw new Error('Erreur de création: ' + createResult.error);
    }
    
    const validationToken = createResult.data.validationToken;
    const reference = createResult.data.reference;
    
    console.log(`✅ Annonce créée: ${reference}`);
    console.log(`🔑 Token de validation: ${validationToken}\n`);
    
    // 2. Valider l'annonce (cela va générer les tokens edit/delete)
    console.log('2️⃣ Validation de l\'annonce...');
    
    const validateResponse = await fetch('https://partage.dodomove.fr/api/validate-announcement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: validationToken
      })
    });
    
    const validateResult = await validateResponse.json();
    console.log('Résultat validation:', validateResult);
    
    if (!validateResult.success) {
      throw new Error('Erreur de validation: ' + validateResult.error);
    }
    
    const editToken = validateResult.data.editToken;
    const deleteToken = validateResult.data.deleteToken;
    
    console.log(`✅ Annonce validée !`);
    console.log(`🔑 Edit token: ${editToken}`);
    console.log(`🔑 Delete token: ${deleteToken}\n`);
    
    // 3. Tester la récupération pour suppression
    console.log('3️⃣ Test récupération pour suppression...');
    
    const getDeleteResponse = await fetch(`https://web-production-7b738.up.railway.app/api/partage/delete-form/${deleteToken}`);
    const getDeleteResult = await getDeleteResponse.json();
    console.log('Données pour suppression:', getDeleteResult);
    
    if (!getDeleteResult.success) {
      throw new Error('Erreur récupération: ' + getDeleteResult.error);
    }
    
    console.log('✅ Données récupérées avec succès\n');
    
    // 4. Effectuer la suppression
    console.log('4️⃣ Test de suppression...');
    
    const deleteResponse = await fetch('https://web-production-7b738.up.railway.app/api/partage/confirm-deletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deleteToken: deleteToken,
        reason: 'found_solution'
      })
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('Résultat suppression:', deleteResult);
    
    if (!deleteResult.success) {
      throw new Error('Erreur de suppression: ' + deleteResult.error);
    }
    
    console.log('✅ Annonce supprimée avec succès ! 🎉\n');
    
    // 5. Vérifier que l'annonce est bien supprimée
    console.log('5️⃣ Vérification de la suppression...');
    
    const verifyResponse = await fetch(`https://web-production-7b738.up.railway.app/api/partage/delete-form/${deleteToken}`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResponse.status === 404) {
      console.log('✅ Confirmation: L\'annonce n\'est plus accessible (token supprimé)');
    } else {
      console.log('⚠️ L\'annonce semble toujours accessible');
    }
    
    console.log('\n🎯 Test complet terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  }
}

testFullProcess(); 