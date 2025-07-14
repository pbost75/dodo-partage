// Script pour débugger et lister les tables Airtable disponibles
require('dotenv').config({ path: '.env.local' });

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Variables d\'environnement manquantes: AIRTABLE_BASE_ID et AIRTABLE_TOKEN');
  process.exit(1);
}

console.log('🔍 Configuration Airtable:');
console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
console.log(`Token: ${AIRTABLE_TOKEN.substring(0, 10)}...`);

/**
 * Liste toutes les tables de la base
 */
async function listTables() {
  try {
    console.log('\n📋 Récupération des tables disponibles...');
    
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📡 Statut API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', errorText);
      throw new Error(`Erreur API Airtable: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n✅ Tables trouvées:');
    console.log('='.repeat(50));
    
    data.tables.forEach((table, index) => {
      console.log(`${index + 1}. 📊 ${table.name}`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Description: ${table.description || 'Aucune'}`);
      console.log('');
    });
    
    console.log(`📈 Total: ${data.tables.length} table(s) trouvée(s)`);
    
    return data.tables;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tables:', error);
    throw error;
  }
}

/**
 * Teste l'accès à une table spécifique
 */
async function testTableAccess(tableName) {
  try {
    console.log(`\n🧪 Test d'accès à la table: "${tableName}"`);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=1`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📡 Statut: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Accès OK - ${data.records.length} enregistrement(s) visible(s)`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Accès refusé: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test d\'accès:', error);
    return false;
  }
}

/**
 * Fonction principale
 */
async function debugAirtable() {
  console.log('🚀 Démarrage du debug Airtable...\n');
  
  try {
    // 1. Lister toutes les tables
    const tables = await listTables();
    
    // 2. Tester l'accès aux tables probables pour les contacts
    const probableContactTables = [
      'DodoPartage - Contacts',
      'DodoPartage Contacts', 
      'Contacts',
      'DodoPartage - Contact',
      'DodoPartage Contact'
    ];
    
    console.log('\n🔍 Test d\'accès aux tables de contacts probables:');
    console.log('='.repeat(55));
    
    for (const tableName of probableContactTables) {
      await testTableAccess(tableName);
    }
    
    // 3. Tester les tables trouvées qui contiennent "contact"
    const contactTables = tables.filter(table => 
      table.name.toLowerCase().includes('contact')
    );
    
    if (contactTables.length > 0) {
      console.log('\n📞 Tables contenant "contact":');
      console.log('='.repeat(35));
      
      for (const table of contactTables) {
        await testTableAccess(table.name);
      }
    }
    
    console.log('\n✅ Debug terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution
if (require.main === module) {
  debugAirtable();
} 