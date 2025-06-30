import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour l'expiration automatique des annonces
 * Destiné à être appelé par un webhook cron (Railway, Vercel Cron, etc.)
 * 
 * URL : GET /api/cron/expire-announcements
 * Authentification : Bearer token ou clé secrète
 */

// Vérification de l'authentification du cron
function isAuthorizedCron(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('⚠️ Aucune clé CRON_SECRET configurée - endpoint public');
    return true; // En développement, on autorise sans clé
  }
  
  // Vérification du token Bearer
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return token === cronSecret;
  }
  
  // Vérification du query parameter
  const urlToken = new URL(request.url).searchParams.get('token');
  if (urlToken === cronSecret) {
    return true;
  }
  
  return false;
}

/**
 * Fonction d'expiration importée du script
 */
async function runExpirationProcess() {
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
    throw new Error('Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  }

  let processedCount = 0;
  let expiredCount = 0;
  let errorCount = 0;

  try {
    // Récupération des annonces actives
    console.log('📋 Récupération des annonces actives...');
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements?filterByFormula=AND({status} = 'published', {expires_at} != '')&fields[]=id&fields[]=status&fields[]=request_type&fields[]=shipping_date&fields[]=created_at&fields[]=expires_at&fields[]=contact_first_name&fields[]=departure_country&fields[]=arrival_country`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.records.length} annonces actives trouvées`);
    
    const announcements = data.records;

    if (announcements.length === 0) {
      return { processedCount: 0, expiredCount: 0, errorCount: 0 };
    }

         // Traitement de chaque annonce
     for (const announcement of announcements) {
       processedCount++;
       const record = announcement.fields;
       const announcementId = announcement.id;
       
       // Vérification de l'ID avant traitement
       if (!announcementId) {
         console.error('❌ ID d\'annonce manquant');
         errorCount++;
         continue;
       }
       
       try {
         const expirationCheck = shouldExpire(announcement);
         
         if (expirationCheck.shouldExpire) {
           console.log(`⏰ Expiration détectée: ${announcementId}`);
           console.log(`   Type: ${record.request_type}`);
           console.log(`   Propriétaire: ${record.contact_first_name}`);
           console.log(`   Trajet: ${record.departure_country} → ${record.arrival_country}`);
           console.log(`   Raison: ${expirationCheck.reason}`);
           
           // Marquer comme expiré
           await expireAnnouncement(announcementId!, expirationCheck.reason || 'expiration_automatique');
           expiredCount++;
           
           console.log(`✅ Annonce ${announcementId} marquée comme expirée`);
         }
       } catch (error) {
         errorCount++;
         console.error(`❌ Erreur lors du traitement de ${announcementId}:`, error);
       }

      // Petite pause pour éviter de surcharger l'API
      if (processedCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { processedCount, expiredCount, errorCount };

  } catch (error) {
    console.error('❌ Erreur critique lors du processus d\'expiration:', error);
    throw error;
  }
}

/**
 * Vérifie si une annonce doit expirer
 */
function shouldExpire(announcement: any) {
  const now = new Date();
  const record = announcement.fields;
  
  // Vérification de l'expiration basée sur expires_at
  if (record.expires_at) {
    const expirationDate = new Date(record.expires_at);
    if (now >= expirationDate) {
      return {
        shouldExpire: true,
        reason: 'date_expiration_depassee',
        expirationDate: expirationDate.toISOString()
      };
    }
  }

  // Logique spécifique selon le type d'annonce
  const requestType = record.request_type;
  
  if (requestType === 'offer') {
    // Pour les offres : expiration le jour de la date de départ
    if (record.shipping_date) {
      const shippingDate = new Date(record.shipping_date);
      const dayAfterShipping = new Date(shippingDate);
      dayAfterShipping.setDate(dayAfterShipping.getDate() + 1); // Le lendemain du départ
      
      if (now >= dayAfterShipping) {
        return {
          shouldExpire: true,
          reason: 'date_depart_passee',
          shippingDate: shippingDate.toISOString()
        };
      }
    }
  } else if (requestType === 'search') {
    // Pour les demandes : expiration après 60 jours de création
    if (record.created_at) {
      const createdDate = new Date(record.created_at);
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + 60); // 60 jours après création
      
      if (now >= expirationDate) {
        return {
          shouldExpire: true,
          reason: 'delai_recherche_expire',
          createdDate: createdDate.toISOString(),
          calculatedExpiration: expirationDate.toISOString()
        };
      }
    }
  }

  return { shouldExpire: false, reason: 'non_expire' };
}

/**
 * Met à jour le statut d'une annonce vers "expired"
 */
async function expireAnnouncement(announcementId: string, reason: string) {
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements/${announcementId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            status: 'expired',
            expired_at: new Date().toISOString()
            // Note: expiration_reason supprimé car le champ n'existe pas dans Airtable
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur mise à jour: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur lors de l'expiration de ${announcementId}:`, error);
    throw error;
  }
}

/**
 * Endpoint GET pour déclencher l'expiration
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Vérification de l'authentification
    if (!isAuthorizedCron(request)) {
      console.error('❌ Tentative d\'accès non autorisé au cron d\'expiration');
      return NextResponse.json(
        { 
          error: 'Non autorisé',
          message: 'Token d\'authentification requis'
        },
        { status: 401 }
      );
    }

    console.log('🚀 Démarrage du processus d\'expiration automatique via API');
    console.log(`📅 Date/heure: ${new Date().toISOString()}`);
    console.log(`🔗 User-Agent: ${request.headers.get('user-agent')}`);
    
    // Exécution du processus d'expiration
    const results = await runExpirationProcess();
    
    const duration = Date.now() - startTime;
    
    console.log('\n📊 Résumé du processus d\'expiration:');
    console.log(`   • Annonces vérifiées: ${results.processedCount}`);
    console.log(`   • Annonces expirées: ${results.expiredCount}`);
    console.log(`   • Erreurs: ${results.errorCount}`);
    console.log(`   • Durée: ${duration}ms`);

    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Processus d\'expiration terminé',
      data: {
        processed: results.processedCount,
        expired: results.expiredCount,
        errors: results.errorCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('❌ Erreur critique lors du processus d\'expiration:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du processus d\'expiration',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint POST pour tests et déclenchement manuel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const isTestMode = body.test === true;
    
    if (!isAuthorizedCron(request)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (isTestMode) {
      console.log('🧪 Mode test - Simulation du processus d\'expiration');
      
      // Mode test : ne pas modifier les données, juste simuler
      const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DodoPartage%20Announcements?filterByFormula=AND({status} = 'published')&fields[]=id&fields[]=request_type&fields[]=shipping_date&fields[]=created_at&fields[]=expires_at`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      const announcements = data.records;
      
      let wouldExpireCount = 0;
      const wouldExpireList = [];
      
      for (const announcement of announcements) {
        const expirationCheck = shouldExpire(announcement);
        
                 if (expirationCheck.shouldExpire) {
           wouldExpireCount++;
           wouldExpireList.push({
             id: announcement.id || 'unknown',
             type: announcement.fields.request_type,
             reason: expirationCheck.reason || 'expiration_automatique'
           });
         }
      }
      
      return NextResponse.json({
        success: true,
        test: true,
        message: `${wouldExpireCount} annonces seraient expirées`,
        data: {
          total_checked: announcements.length,
          would_expire: wouldExpireCount,
          announcements: wouldExpireList
        }
      });
    } else {
      // Mode normal via POST
      return GET(request);
    }

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 