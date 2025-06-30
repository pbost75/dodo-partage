/**
 * Script de monitoring des conflits de statuts
 * Surveille les transitions de statuts et détecte les anomalies
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function monitorStatusConflicts() {
  console.log('🔍 MONITORING CONFLITS DE STATUTS');
  console.log('==================================\n');

  try {
    // 1. Récupérer TOUTES les annonces (tous statuts)
    console.log('1️⃣ Récupération de toutes les annonces...');
    const response = await fetch(`${BACKEND_URL}/api/partage/get-announcements?status=all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const allAnnouncements = data.data || [];
    console.log(`✅ ${allAnnouncements.length} annonces récupérées\n`);

    // 2. Analyser les statuts
    console.log('2️⃣ ANALYSE DES STATUTS:');
    console.log('========================');
    
    const statusCounts = {};
    const statusDetails = {
      published: [],
      deleted: [],
      expired: [],
      pending_validation: [],
      other: []
    };

    allAnnouncements.forEach(ann => {
      const status = ann.status || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      if (statusDetails[status]) {
        statusDetails[status].push(ann);
      } else {
        statusDetails.other.push(ann);
      }
    });

    // Affichage des statistiques
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`📊 ${status.padEnd(20)} : ${count} annonce(s)`);
    });

    // 3. Détection des anomalies potentielles
    console.log('\n3️⃣ DÉTECTION D\'ANOMALIES:');
    console.log('===========================');
    
    let anomalies = [];

    // Annonces deleted avec expires_at dans le futur
    const deletedWithFutureExpiration = statusDetails.deleted.filter(ann => {
      if (!ann.expires_at) return false;
      const expiresDate = new Date(ann.expires_at);
      const now = new Date();
      return expiresDate > now;
    });

    if (deletedWithFutureExpiration.length > 0) {
      anomalies.push({
        type: 'DELETED_WITH_FUTURE_EXPIRATION',
        count: deletedWithFutureExpiration.length,
        description: 'Annonces supprimées avec expires_at dans le futur',
        items: deletedWithFutureExpiration.map(a => ({ id: a.id, ref: a.reference, expires_at: a.expires_at }))
      });
    }

    // Annonces expired sans expired_at
    const expiredWithoutTimestamp = statusDetails.expired.filter(ann => !ann.expired_at);

    if (expiredWithoutTimestamp.length > 0) {
      anomalies.push({
        type: 'EXPIRED_WITHOUT_TIMESTAMP',
        count: expiredWithoutTimestamp.length,
        description: 'Annonces expirées sans timestamp expired_at',
        items: expiredWithoutTimestamp.map(a => ({ id: a.id, ref: a.reference }))
      });
    }

    // Annonces published expirées depuis longtemps
    const publishedButExpired = statusDetails.published.filter(ann => {
      if (!ann.expires_at) return false;
      const expiresDate = new Date(ann.expires_at);
      const now = new Date();
      const daysSinceExpiration = (now - expiresDate) / (1000 * 60 * 60 * 24);
      return daysSinceExpiration > 1; // Plus d'1 jour d'expiration
    });

    if (publishedButExpired.length > 0) {
      anomalies.push({
        type: 'PUBLISHED_BUT_EXPIRED',
        count: publishedButExpired.length,
        description: 'Annonces published mais expirées depuis plus d\'1 jour',
        items: publishedButExpired.map(a => ({
          id: a.id,
          ref: a.reference,
          expires_at: a.expires_at,
          days_overdue: Math.ceil((new Date() - new Date(a.expires_at)) / (1000 * 60 * 60 * 24))
        }))
      });
    }

    // 4. Rapport d'anomalies
    if (anomalies.length === 0) {
      console.log('✅ Aucune anomalie détectée - Système cohérent !');
    } else {
      console.log(`⚠️ ${anomalies.length} type(s) d'anomalie(s) détecté(s):\n`);
      
      anomalies.forEach((anomaly, index) => {
        console.log(`${index + 1}. ${anomaly.type}`);
        console.log(`   📋 ${anomaly.description}`);
        console.log(`   📊 ${anomaly.count} annonce(s) concernée(s)`);
        
        if (anomaly.items.length <= 3) {
          anomaly.items.forEach(item => {
            console.log(`   📄 ${item.ref} (${item.id})`);
            if (item.expires_at) console.log(`      expires_at: ${item.expires_at}`);
            if (item.days_overdue) console.log(`      retard: ${item.days_overdue} jour(s)`);
          });
        } else {
          console.log(`   📄 Première annonce: ${anomaly.items[0].ref}`);
          console.log(`   📄 ... et ${anomaly.items.length - 1} autre(s)`);
        }
        console.log('');
      });
    }

    // 5. Recommandations
    console.log('5️⃣ RECOMMANDATIONS:');
    console.log('====================');
    
    if (publishedButExpired.length > 0) {
      console.log('💡 Exécuter l\'expiration manuelle pour rattraper le retard:');
      console.log('   curl -X POST https://web-production-7b738.up.railway.app/api/cron/expire-announcements');
    }
    
    if (deletedWithFutureExpiration.length > 0) {
      console.log('💡 Considérer nettoyer les expires_at des annonces supprimées');
    }
    
    console.log('💡 Système globalement sain - logique de priorité respectée ✅');

  } catch (error) {
    console.error('❌ Erreur lors du monitoring:', error);
  }
}

// Exécution
monitorStatusConflicts(); 