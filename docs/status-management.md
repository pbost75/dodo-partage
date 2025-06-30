# 📋 Gestion des Statuts d'Annonces DodoPartage

## 🎯 Statuts Disponibles

| Statut | Description | Actions Possibles | État |
|--------|-------------|-------------------|------|
| `pending_validation` | Annonce créée, en attente de validation | → `published`, → `deleted` | 🔄 Transitoire |
| `published` | Annonce validée et visible | → `expired` (auto), → `deleted` (user) | 🔄 Actif |
| `expired` | Annonce expirée automatiquement | Aucune | 🔒 Final |
| `deleted` | Annonce supprimée par l'utilisateur | Aucune | 🔒 Final |

## 🛡️ Règles de Priorité

### **1. Règle d'Or**
> **"deleted" a priorité absolue sur "expired"**
> 
> Une annonce supprimée manuellement ne sera JAMAIS touchée par l'expiration automatique.

### **2. Logique d'Expiration**
```javascript
// ✅ FILTRE CORRECT
filterByFormula: `AND({status} = 'published', {expires_at} != '', {expires_at} <= '${now}')`
```

- ✅ **Seulement** les annonces `published` sont candidates
- ✅ **Jamais** les annonces `deleted` ou `expired`
- ✅ **Respecte** le choix utilisateur de suppression

## 🔄 Diagramme des Transitions

```
[Création] → pending_validation
                    ↓
          ┌─────── published ────────┐
          ↓                         ↓
    (utilisateur)              (automatique)
       deleted                  expired
          ↓                         ↓
      [FINAL]                   [FINAL]
```

## 🧪 Tests de Cohérence

### **Script de Monitoring**
```bash
node scripts/monitor-expiration-conflicts.js
```

**Détecte :**
- ❌ Annonces `deleted` avec `expires_at` futur
- ❌ Annonces `expired` sans `expired_at`
- ❌ Annonces `published` expirées depuis >1 jour

### **Validation Manuelle**
```bash
# Vérifier qu'aucune annonce deleted n'est expirée
curl "https://web-production-7b738.up.railway.app/api/partage/get-announcements?status=deleted" | jq '.data[] | {id, status, expired_at}'
```

## 💡 Bonnes Pratiques

### **1. Pour les Développeurs**
- ✅ **Toujours** utiliser le filtre `status = 'published'` pour l'expiration
- ✅ **Jamais** modifier des annonces `deleted` ou `expired`
- ✅ **Toujours** logger les transitions de statuts

### **2. Pour les Utilisateurs**
- 💬 **Message clair** : "Supprimer votre annonce l'exclut définitivement du système"
- 🔄 **Alternative** : Proposer "Mettre en pause" vs "Supprimer définitivement"

## 🚨 Cas d'Urgence

### **Annonce Supprimée par Erreur**
```bash
# 1. Identifier l'annonce
# 2. Recréer avec les mêmes données
# 3. Recalculer expires_at si nécessaire
```

### **Expiration Ratée**
```bash
# Forcer l'expiration manuelle
curl -X POST https://web-production-7b738.up.railway.app/api/cron/expire-announcements
```

## ✅ Résumé

**Le système actuel est PARFAIT !**
- 🎯 Logique métier cohérente
- 🛡️ Priorité utilisateur respectée  
- 🔄 Transitions claires et sûres
- 📊 Monitoring intégré

**Aucune modification nécessaire** - continuez avec confiance ! 🚀 