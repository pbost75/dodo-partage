# ⚠️ DOCUMENTATION OBSOLÈTE

**Cette documentation est obsolète depuis l'intégration du backend centralisé.**

## ✅ Nouvelle architecture

DodoPartage utilise maintenant le **backend centralisé Dodomove** hébergé sur Railway pour gérer Airtable et les emails.

### 📄 Documentation à jour :
- **Architecture** : Voir `BACKEND-INTEGRATION.md`
- **Configuration** : Voir `env.local.example`
- **Tests** : Utiliser `npm run test:backend`

### 🔄 Migration effectuée

Cette approche offre :
- ✅ **Sécurité** : Clés API côté serveur uniquement
- ✅ **Cohérence** : Même architecture que l'écosystème Dodomove
- ✅ **Maintenance** : Configuration centralisée

### 🚀 Utilisation actuelle

```bash
# Test de connexion backend
npm run test:backend

# Test du formulaire complet
npm run dev
# Puis aller sur http://localhost:3000/funnel/propose/locations
```

Pour plus d'informations, consultez `BACKEND-INTEGRATION.md`. 