// Script d'automatisation Airtable pour expirer les annonces
// À copier-coller dans l'automation Airtable

const backendUrl = 'https://web-production-7b738.up.railway.app';
const endpoint = '/api/cron/expire-announcements';

console.log('🚀 Démarrage de l\'expiration automatique des annonces...');

try {
  // Appel du backend centralisé
  const response = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Airtable-Automation',
      'X-Source': 'airtable-automation'
    },
    body: JSON.stringify({
      source: 'airtable-automation',
      timestamp: new Date().toISOString()
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`✅ Expiration réussie: ${result.expired} annonce(s) expirée(s)`);
    console.log(`📊 Durée: ${result.duration}`);
    console.log(`📈 Annonces actives restantes: ${result.remaining_published}`);
    
    if (result.details && result.details.length > 0) {
      console.log('📋 Détails des annonces expirées:');
      result.details.forEach(detail => {
        console.log(`   - ${detail.name}: ${detail.route}`);
      });
    }
  } else {
    console.error('❌ Erreur lors de l\'expiration:', result.error);
    console.error('💡 Message:', result.message);
  }
  
  // Retourner le résultat pour Airtable
  return {
    success: result.success,
    expired: result.expired || 0,
    message: result.message,
    timestamp: result.timestamp
  };

} catch (error) {
  console.error('❌ Erreur lors de l\'appel du backend:', error.message);
  
  // Retourner l'erreur pour Airtable
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  };
} 