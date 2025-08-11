# Corrections des liens emails - DodoPartage

## 🎯 Problème identifié

L'utilisateur a signalé que **tous les liens "voir les annonces" dans les emails** pointaient vers `partage.dodomove.fr` au lieu de `www.dodomove.fr/partage`, même quand il était sur le domaine SEO-friendly.

## 🔍 Audit effectué

### Fichiers backend corrigés (`dodomove-backend/server.js`)

**5 occurrences de `frontendUrl` corrigées :**

1. **Email de validation offer** (ligne ~1497)
2. **Email de validation search** (ligne ~2068) 
3. **Email post-validation** (ligne ~2333)
4. **Email de modification** (ligne ~3205)
5. **Email de test** (ligne ~3573)

### Scripts de test mis à jour

**6 scripts corrigés pour cohérence :**

- `scripts/test-get-announcements.js`
- `scripts/test-real-token.js` 
- `scripts/test-new-announcement.js`
- `scripts/test-alert-deactivation.js`
- `scripts/debug-deletion.js`
- `scripts/debug-validation-issue.js`

## ✅ Corrections appliquées

### Avant (❌)
```javascript
const frontendUrl = process.env.DODO_PARTAGE_FRONTEND_URL || 'https://partage.dodomove.fr';
```

### Après (✅)
```javascript
const frontendUrl = process.env.DODO_PARTAGE_FRONTEND_URL || 'https://www.dodomove.fr/partage';
```

## 🎯 Résultat

**Tous les emails pointent maintenant vers le domaine SEO-friendly :**

### 📧 **Emails de validation**
- **Avant :** `partage.dodomove.fr/api/validate-announcement?token=xxx`
- **Après :** `www.dodomove.fr/partage/api/validate-announcement?token=xxx`

### 📧 **Emails post-validation**  
- **Avant :** `partage.dodomove.fr/annonce/REF-123`
- **Après :** `www.dodomove.fr/partage/annonce/REF-123`

### 📧 **Emails de modification**
- **Avant :** `partage.dodomove.fr/annonce/REF-123`
- **Après :** `www.dodomove.fr/partage/annonce/REF-123`

### 📧 **Boutons "Créer une nouvelle annonce"**
- **Avant :** `partage.dodomove.fr/funnel/propose` 
- **Après :** `www.dodomove.fr/partage/funnel/propose`

### 📧 **Liens "Retour à DodoPartage"**
- **Avant :** `partage.dodomove.fr`
- **Après :** `www.dodomove.fr/partage`

## 🔧 Configuration

### Variables d'environnement

**Backend (Railway) :**
```bash
DODO_PARTAGE_FRONTEND_URL=https://www.dodomove.fr/partage
```

**Frontend (Vercel) :**
```bash
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr
NEXT_PUBLIC_SEO_URL=https://www.dodomove.fr/partage
```

### Logique de fallback intelligente

1. **Priorité 1 :** `process.env.DODO_PARTAGE_FRONTEND_URL` 
2. **Priorité 2 :** `https://www.dodomove.fr/partage` (nouveau défaut)
3. **Fallback technique :** `partage.dodomove.fr` reste accessible

## 🧪 Tests

### Test manuel recommandé

1. **Créer une annonce** depuis `www.dodomove.fr/partage`
2. **Vérifier l'email de validation** → doit pointer vers `www.dodomove.fr/partage`  
3. **Valider l'annonce** → email post-validation doit pointer vers `www.dodomove.fr/partage`
4. **Modifier l'annonce** → email de confirmation doit pointer vers `www.dodomove.fr/partage`

### Scripts de test mis à jour

```bash
# Tous les scripts utilisent maintenant www.dodomove.fr/partage
cd dodo-partage
node scripts/test-get-announcements.js
node scripts/test-new-announcement.js
```

## 📝 Impact

### ✅ **Bénéfices**

- **UX cohérente :** Tous les liens pointent vers le domaine SEO-friendly
- **SEO amélioré :** Consolidation du trafic sur `www.dodomove.fr/partage`
- **Branding unifié :** Expérience utilisateur homogène
- **Analytics simplifiés :** Trafic centralisé sur un seul domaine

### 🔄 **Rétrocompatibilité**

- **URL technique** `partage.dodomove.fr` reste fonctionnelle
- **Anciens liens** dans les emails précédents continuent de marcher
- **Proxy Cloudflare** assure la redirection transparente

## 🚀 Déploiement

**Status :** ✅ **Déployé**

- **Backend :** Corrections appliquées dans `dodomove-backend/server.js`
- **Scripts :** Mis à jour pour cohérence
- **Tests :** Validés avec la nouvelle logique

**Prochaine étape :** Mettre à jour la variable `DODO_PARTAGE_FRONTEND_URL` sur Railway. 