# 🚀 Intégration Backend Centralisé - Guide complet

## ✅ Ce qui a été fait

J'ai configuré ton projet DodoPartage pour utiliser le **backend centralisé Dodomove** hébergé sur Railway ! Cette approche est beaucoup plus cohérente avec l'architecture existante.

## 🏗️ Architecture mise en place

```
Frontend DodoPartage (Next.js)
    ↓ (API calls)
Backend Centralisé Dodomove (Railway)
    ↓ (stockage + emails)
Airtable + Resend
```

### 📁 Fichiers modifiés :

#### Backend centralisé (`dodomove-backend`)
- ✅ **Nouvelles routes ajoutées** :
  - `POST /api/partage/submit-announcement` - Soumission d'annonces
  - `GET /api/partage/test` - Test de configuration
- ✅ **Gestion Airtable** via les clés API Railway
- ✅ **Emails automatiques** via Resend (déjà configuré)

#### Frontend DodoPartage
- ✅ `src/app/api/submit-announcement/route.ts` - Modifié pour utiliser le backend
- ✅ `src/app/api/test-backend/route.ts` - Nouveau test de connexion
- ✅ Suppression des fichiers Airtable directs (plus cohérent)

## 🎯 Avantages de cette approche

### ✅ **Sécurité**
- Clés API Airtable et Resend **côté serveur uniquement**
- Pas d'exposition des secrets dans le frontend
- Gestion centralisée des accès

### ✅ **Cohérence**
- Même architecture que le funnel Dodomove principal
- Réutilisation de la configuration Railway existante
- Logs centralisés

### ✅ **Maintenance**
- Une seule configuration à maintenir
- Emails avec le même design que l'écosystème
- Évolutivité simplifiée

## 🧪 Tests disponibles

### 1. Test via le navigateur
```bash
# Démarre le frontend
npm run dev

# Teste la connexion backend
http://localhost:3000/api/test-backend
```

### 2. Test via ligne de commande
```bash
# Si tu as jq installé
npm run test:backend

# Sinon, test direct
curl http://localhost:3000/api/test-backend
```

### 3. Test du backend directement
```bash
# Test général du backend
curl https://web-production-7b738.up.railway.app/health

# Test spécifique DodoPartage
curl https://web-production-7b738.up.railway.app/api/partage/test
```

## 📊 Données gérées automatiquement

Quand quelqu'un termine le formulaire :

### 🔄 **Flux complet**
1. **Frontend** → Validation des données
2. **Backend centralisé** → Traitement et sauvegarde
3. **Airtable** → Stockage dans la table `DodoPartage - Announcement`
4. **Resend** → Email de confirmation automatique
5. **Réponse** → Confirmation à l'utilisateur

### 📋 **Données sauvegardées**
- **Contact** : Prénom, Email, Téléphone
- **Trajets** : Départ et arrivée complets
- **Conteneur** : Type, volumes, date d'expédition
- **Offre** : Type (gratuit/payant), description
- **Métadonnées** : Référence unique, statut, timestamps

### 📧 **Email automatique**
- Design cohérent avec l'écosystème Dodomove
- Récapitulatif complet de l'annonce
- Référence unique pour suivi
- Prochaines étapes expliquées

## ⚙️ Configuration Railway

Le backend centralisé utilise ces variables d'environnement (déjà configurées) :

```bash
# Airtable (déjà configuré sur Railway)
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
AIRTABLE_PARTAGE_TABLE_NAME=DodoPartage - Announcement

# Resend (déjà configuré sur Railway)
RESEND_API_KEY=re_...

# Autres variables système
NODE_ENV=production
PORT=8080
```

## 🗃️ Configuration Airtable

### Table utilisée : `DodoPartage - Announcement`

| Colonne | Type | Description |
|---------|------|-------------|
| `reference` | Single line text | Référence unique (PARTAGE-XXXXXX-XXXXXX) |
| `created_at` | Date | Date de création de l'annonce |
| `status` | Single select | pending_validation, published, expired |
| `contact_first_name` | Single line text | Prénom du contact |
| `contact_email` | Email | Email du contact |
| `contact_phone` | Phone number | Téléphone du contact |
| `departure_country` | Single line text | Pays de départ |
| `departure_city` | Single line text | Ville de départ |
| `departure_postal_code` | Single line text | Code postal de départ |
| `departure_display_name` | Single line text | Nom complet du lieu de départ |
| `arrival_country` | Single line text | Pays d'arrivée |
| `arrival_city` | Single line text | Ville d'arrivée |
| `arrival_postal_code` | Single line text | Code postal d'arrivée |
| `arrival_display_name` | Single line text | Nom complet du lieu d'arrivée |
| `shipping_date` | Date | Date prévue d'expédition |
| `shipping_date_formatted` | Single line text | Date formatée en français |
| `container_type` | Single line text | "20_feet" ou "40_feet" |
| `container_available_volume` | Number | Volume disponible dans le conteneur |
| `container_minimum_volume` | Number | Volume minimum pour partager |
| `offer_type` | Single select | "free" ou "paid" |
| `announcement_text` | Long text | Description détaillée de l'annonce |
| `announcement_text_length` | Number | Longueur du texte d'annonce |

## 🔍 Debugging et logs

### Frontend (Next.js)
```bash
# Logs dans le terminal où tu as lancé npm run dev
📥 Données reçues pour soumission: { email: "...", ... }
📤 Envoi vers le backend centralisé...
✅ Annonce soumise avec succès via le backend centralisé: PARTAGE-...
```

### Backend (Railway)
```bash
# Logs visibles dans Railway Dashboard
POST /api/partage/submit-announcement appelé
📤 Envoi vers Airtable...
✅ Annonce enregistrée dans Airtable: recXXXXXXXXXXXXXX
📧 Envoi de l'email de confirmation...
✅ Email envoyé avec succès: emailId
```

## 🚀 Déploiement

### Frontend (Vercel)
- Variables d'environnement nécessaires :
```bash
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
```

### Backend (Railway)
- ✅ Déjà déployé et configuré
- ✅ Variables Airtable et Resend déjà en place
- ✅ Nouvelles routes DodoPartage ajoutées

## 🎉 Résultat final

### ✅ **Fonctionnalités actives**
1. **Formulaire complet** → Toutes les 7 étapes fonctionnelles
2. **Sauvegarde automatique** → Données dans Airtable via Railway
3. **Email de confirmation** → Envoyé automatiquement via Resend
4. **Référence unique** → Générée pour chaque annonce
5. **Logs complets** → Traçabilité frontend + backend

### 🔄 **Workflow utilisateur**
1. Utilisateur remplit le formulaire (7 étapes)
2. Soumission → Frontend valide et envoie au backend
3. Backend → Sauvegarde dans Airtable + Email via Resend
4. Utilisateur → Reçoit confirmation avec référence unique
5. Admin → Voit l'annonce dans Airtable pour validation

## 📞 Support

### Tests rapides
```bash
# Test connexion backend
curl https://web-production-7b738.up.railway.app/api/partage/test

# Test depuis le frontend
http://localhost:3000/api/test-backend
```

### En cas de problème
1. **Vérifier les logs Railway** (Dashboard Railway)
2. **Tester la connexion** avec les URLs ci-dessus
3. **Vérifier Airtable** (table créée avec bonnes colonnes)
4. **Consulter les logs frontend** (terminal npm run dev)

Ton formulaire DodoPartage est maintenant **100% intégré** avec l'écosystème Dodomove ! 🎉 