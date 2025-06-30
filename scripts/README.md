# 🛠️ Scripts DodoPartage

## 📋 Organisation des Scripts

Ce dossier contient tous les **scripts utilitaires** pour la maintenance et le debugging de DodoPartage.

## 📚 Documentation Officielle

**➡️ Pour la documentation complète du système d'expiration :**
**[`../docs/expiration-system.md`](../docs/expiration-system.md)**

## 🔧 Scripts Disponibles

### **🕐 Expiration des Annonces**
| Script | Usage | Description |
|--------|-------|-------------|
| `debug-expiration.js` | Diagnostic | État global du système d'expiration |
| `monitor-expiration-conflicts.js` | Monitoring | Détection d'anomalies et conflits |
| `migrate-expires-at.js` | Migration | Calcul des dates manquantes |

### **📧 Notifications d'Expiration**
| Script | Usage | Description |
|--------|-------|-------------|
| `send-expiration-reminders.js` | Email J-3 | Rappels avant expiration (3 jours) |
| `send-post-expiration-notifications.js` | Email post | Notifications après expiration |

### **🔍 Debugging et Analyse**  
| Script | Usage | Description |
|--------|-------|-------------|
| `debug-airtable-columns.js` | Diagnostic | Analyse des colonnes Airtable |
| `debug-specific-announcement.js` | Debugging | Analyse d'une annonce spécifique |
| `analyze-expired-announcements.js` | Analyse | Rapport des annonces expirées |
| `fix-wrongly-expired.js` | Correction | Réparer les erreurs d'expiration |

### **🧪 Tests et Validation**
| Script | Usage | Description |
|--------|-------|-------------|
| `test-*.js` | Tests | Scripts de test des fonctionnalités |
| `debug-validation-issue.js` | Debug | Problèmes de validation |
| `debug-deletion.js` | Debug | Processus de suppression |

### **⚙️ Migration et Maintenance**
| Script | Usage | Description |
|--------|-------|-------------|
| `migrate-tokens*.js` | Migration | Ajout/mise à jour des tokens |
| `add-tokens-to-existing.js` | Migration | Tokens sur annonces existantes |

## 🚀 Usage Typique

### **Diagnostic Quotidien**
```bash
# État du système d'expiration
node scripts/debug-expiration.js

# Monitoring des anomalies  
node scripts/monitor-expiration-conflicts.js
```

### **Emails d'Expiration** ⭐ *Nouveau*
```bash
# Rappels 3 jours avant expiration
node scripts/send-expiration-reminders.js

# Notifications post-expiration  
node scripts/send-post-expiration-notifications.js
```

### **Migration et Maintenance**
```bash
# Migration initiale (une seule fois)
node scripts/migrate-expires-at.js

# Test d'une annonce spécifique
node scripts/debug-specific-announcement.js
```

## 📍 Variables d'Environnement

Les scripts utilisent les variables du projet principal :
```env
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
AIRTABLE_API_KEY=key***
AIRTABLE_BASE_ID=app***
```

## 🔄 Automatisation Recommandée

### **Configuration Cron Quotidienne**
```yaml
# .github/workflows/daily-maintenance.yml
schedule:
  - cron: '0 5 * * *'  # 5h UTC - Rappels J-3
  - cron: '0 6 * * *'  # 6h UTC - Expiration automatique  
  - cron: '0 7 * * *'  # 7h UTC - Notifications post-expiration
```

### **Workflow Complet**
1. **5h** → Rappels avant expiration
2. **6h** → Expiration automatique (existant)  
3. **7h** → Notifications post-expiration

## 🔗 Liens Utiles

- **[📚 Documentation Complète](../docs/README.md)** - Index de toute la documentation
- **[🕐 Système d'Expiration](../docs/expiration-system.md)** - Documentation détaillée expiration
- **[📊 Gestion des Statuts](../docs/status-management.md)** - Transitions et priorités
- **[🏗️ Architecture](../docs/architecture.md)** - Vue d'ensemble technique

---

💡 **Tip :** Utilisez `node scripts/[nom-script].js` depuis la racine du projet 