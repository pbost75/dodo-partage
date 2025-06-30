/**
 * Script de migration pour remplir expires_at
 * Calcule et met à jour les dates d'expiration pour toutes les annonces existantes
 * 
 * Logique d'expiration :
 * - OFFERS: lendemain de shipping_date
 * - SEARCHES: lendemain du 1er jour du mois suivant shipping_period_end
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';

async function migrateExpiresAt() {
  console.log('🚀 MIGRATION EXPIRES_AT');
  console.log('==============================\n');

  try {
    // 1. Récupérer toutes les annonces published
    console.log('1️⃣ Récupération des annonces published...');
    const response = await fetch(`${BACKEND_URL}/api/partage/get-announcements?status=published`, {
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
    console.log(`✅ ${allAnnouncements.length} annonces published récupérées\n`);

    // 2. Filtrer celles sans expires_at
    const announcementsToMigrate = allAnnouncements.filter(ann => !ann.expires_at);
    console.log(`🔍 ${announcementsToMigrate.length} annonces à migrer (sans expires_at)\n`);

    if (announcementsToMigrate.length === 0) {
      console.log('✅ Aucune annonce à migrer - toutes ont déjà expires_at');
      return;
    }

    // 3. Calculer expires_at pour chaque annonce
    let migratedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const announcement of announcementsToMigrate) {
      try {
        console.log(`\n📄 Migration ${announcement.id} - ${announcement.contact_first_name} (${announcement.request_type})`);
        
        let expiresAt = null;
        let calculationReason = '';

        if (announcement.request_type === 'offer') {
          // OFFERS: lendemain de shipping_date
          if (announcement.shipping_date) {
            const shippingDate = new Date(announcement.shipping_date);
            const dayAfterShipping = new Date(shippingDate);
            dayAfterShipping.setDate(dayAfterShipping.getDate() + 1);
            expiresAt = dayAfterShipping.toISOString();
            calculationReason = `lendemain de shipping_date (${announcement.shipping_date})`;
          } else {
            console.log(`   ⚠️ SKIP: Pas de shipping_date`);
            skippedCount++;
            continue;
          }
        } else if (announcement.request_type === 'search') {
          // SEARCHES: lendemain du 1er jour du mois suivant shipping_period_end
          if (announcement.shipping_period_end) {
            const endDate = new Date(announcement.shipping_period_end);
            // Aller au 1er jour du mois suivant
            const nextMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
            // Le lendemain du 1er jour du mois suivant
            const dayAfter = new Date(nextMonth);
            dayAfter.setDate(dayAfter.getDate() + 1);
            expiresAt = dayAfter.toISOString();
            calculationReason = `lendemain du 1er jour du mois suivant shipping_period_end (${announcement.shipping_period_end})`;
          } else {
            // Fallback pour les anciennes demandes sans shipping_period_end
            const createdDate = new Date(announcement.created_at);
            const fallbackDate = new Date(createdDate);
            fallbackDate.setDate(fallbackDate.getDate() + 60); // 60 jours après création
            expiresAt = fallbackDate.toISOString();
            calculationReason = `fallback 60j après création (${announcement.created_at})`;
          }
        } else {
          console.log(`   ⚠️ SKIP: Type inconnu ${announcement.request_type}`);
          skippedCount++;
          continue;
        }

        console.log(`   📅 Calcul: ${calculationReason}`);
        console.log(`   ✅ expires_at: ${expiresAt}`);

        // 4. Mettre à jour via API backend
        const updateResponse = await fetch(`${BACKEND_URL}/api/partage/update-expires-at`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recordId: announcement.id,
            expiresAt: expiresAt,
            reason: calculationReason
          })
        });

        if (updateResponse.ok) {
          migratedCount++;
          console.log(`   ✅ Mise à jour réussie`);
        } else {
          const errorText = await updateResponse.text();
          console.log(`   ❌ Erreur mise à jour: ${updateResponse.status} - ${errorText}`);
          errorCount++;
        }

        // Pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Erreur traitement ${announcement.id}:`, error.message);
      }
    }

    // 5. Résumé final
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION:');
    console.log('==========================');
    console.log(`📋 Annonces à traiter: ${announcementsToMigrate.length}`);
    console.log(`✅ Migrées avec succès: ${migratedCount}`);
    console.log(`⚠️ Ignorées: ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migration terminée ! Le système d\'expiration est maintenant opérationnel.');
      console.log('💡 Vous pouvez maintenant réactiver le cron d\'expiration.');
    }

  } catch (error) {
    console.error('❌ Erreur critique lors de la migration:', error);
  }
}

// Exécution
migrateExpiresAt(); 