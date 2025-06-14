# 🗃️ Configuration Airtable pour DodoPartage

Ce guide t'explique comment configurer Airtable pour recevoir les données du formulaire de DodoPartage.

## 📋 Étape 1 : Créer une base Airtable

### 1.1 Créer un compte Airtable
1. Va sur [airtable.com](https://airtable.com)
2. Crée un compte gratuit (ou connecte-toi si tu en as déjà un)
3. Le plan gratuit permet jusqu'à 1 000 enregistrements par base (largement suffisant pour commencer)

### 1.2 Créer une nouvelle base
1. Clique sur **"Create a base"** ou **"Créer une base"**
2. Choisis **"Start from scratch"** ou **"Partir de zéro"**
3. Nomme ta base : `DodoPartage - Annonces`
4. Choisis une icône (par exemple 🚢 ou 📦)

### 1.3 Configurer la table
1. Renomme la table par défaut en **"Annonces"**
2. Supprime les colonnes par défaut
3. Crée les colonnes suivantes avec les types appropriés :

| Nom de la colonne | Type | Description |
|-------------------|------|-------------|
| `Prénom` | Single line text | Prénom du contact |
| `Email` | Email | Adresse email du contact |
| `Téléphone` | Phone number | Numéro de téléphone (optionnel) |
| `Départ - Pays` | Single line text | Pays de départ |
| `Départ - Ville` | Single line text | Ville de départ |
| `Départ - Code Postal` | Single line text | Code postal de départ |
| `Départ - Nom Complet` | Single line text | Nom complet du lieu de départ |
| `Arrivée - Pays` | Single line text | Pays d'arrivée |
| `Arrivée - Ville` | Single line text | Ville d'arrivée |
| `Arrivée - Code Postal` | Single line text | Code postal d'arrivée |
| `Arrivée - Nom Complet` | Single line text | Nom complet du lieu d'arrivée |
| `Date d'expédition` | Date | Date prévue d'expédition |
| `Type de conteneur` | Single select | Options: "20 pieds", "40 pieds" |
| `Volume disponible (m³)` | Number | Volume disponible en m³ |
| `Volume minimum (m³)` | Number | Volume minimum requis |
| `Type d'offre` | Single select | Options: "Gratuit", "Payant" |
| `Description de l'annonce` | Long text | Description détaillée |
| `Statut` | Single select | Options: "En attente de validation", "Publié", "Expiré" |
| `Date de création` | Date with time | Date et heure de création |
| `ID Temporaire` | Single line text | Identifiant temporaire |

## 🔑 Étape 2 : Obtenir les clés API

### 2.1 Obtenir l'API Key
1. Va dans ton profil Airtable (clique sur ton avatar en haut à droite)
2. Clique sur **"Developer hub"** ou **"Centre développeur"**
3. Clique sur **"Personal access tokens"**
4. Clique sur **"Create new token"**
5. Nomme ton token : `DodoPartage API`
6. Sélectionne les permissions :
   - **data.records:read** (pour lire les enregistrements)
   - **data.records:write** (pour créer des enregistrements)
7. Sélectionne ta base `DodoPartage - Annonces`
8. Clique sur **"Create token"**
9. **⚠️ IMPORTANT** : Copie immédiatement le token et sauvegarde-le (tu ne pourras plus le voir après)

### 2.2 Obtenir le Base ID
1. Va sur [airtable.com/api](https://airtable.com/api)
2. Clique sur ta base `DodoPartage - Annonces`
3. Dans l'URL ou dans la documentation, tu verras quelque chose comme :
   ```
   https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Annonces
   ```
4. Le Base ID est la partie `appXXXXXXXXXXXXXX`

## ⚙️ Étape 3 : Configuration du projet

### 3.1 Créer le fichier .env.local
Dans le dossier racine de `dodo-partage`, crée un fichier `.env.local` :

```bash
# Configuration du backend centralisé Dodomove
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app

# URLs de l'écosystème Dodomove
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr

# Configuration de l'application
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr

# Analytics et tracking (optionnel)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWE8386BQC

# Configuration du développement
NODE_ENV=development

# Sécurité et tokens
ADMIN_SECRET_KEY=your-admin-secret-key
EMAIL_VALIDATION_SECRET=your-email-validation-secret

# 🔑 Configuration Airtable - REMPLACE PAR TES VRAIES VALEURS
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Annonces

# Configuration Resend (optionnel pour les emails)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3.2 Remplacer les valeurs
1. Remplace `AIRTABLE_API_KEY` par ton token personnel
2. Remplace `AIRTABLE_BASE_ID` par ton Base ID
3. Garde `AIRTABLE_TABLE_NAME=Annonces` (ou change si tu as nommé ta table différemment)

## 🧪 Étape 4 : Tester la configuration

### 4.1 Démarrer le serveur de développement
```bash
cd dodo-partage
npm run dev
```

### 4.2 Tester la connexion Airtable
Ouvre ton navigateur et va sur :
```
http://localhost:3000/api/test-airtable
```

Tu devrais voir une réponse JSON comme :
```json
{
  "success": true,
  "message": "Connexion Airtable réussie !",
  "config": {
    "tableName": "Annonces",
    "hasApiKey": true,
    "hasBaseId": true
  },
  "timestamp": "2024-01-XX..."
}
```

### 4.3 Tester le formulaire complet
1. Va sur `http://localhost:3000/funnel/propose/locations`
2. Remplis tout le formulaire étape par étape
3. À la confirmation, les données devraient être envoyées vers Airtable
4. Vérifie dans ta base Airtable que l'enregistrement a bien été créé

## 🔍 Étape 5 : Vérification et debugging

### 5.1 Vérifier les logs
Dans la console de ton terminal (où tu as lancé `npm run dev`), tu devrais voir :
```
📥 Données reçues pour soumission: { email: "...", departure: "...", ... }
📤 Envoi vers Airtable: { url: "...", tableName: "Annonces", ... }
✅ Succès Airtable: { recordId: "recXXXXXXXXXXXXXX", createdTime: "..." }
```

### 5.2 En cas d'erreur
Si tu vois des erreurs comme :
- `❌ Variables d'environnement Airtable manquantes` → Vérifie ton fichier `.env.local`
- `❌ Erreur Airtable (401)` → Vérifie ton API Key
- `❌ Erreur Airtable (404)` → Vérifie ton Base ID et le nom de la table
- `❌ Erreur Airtable (422)` → Vérifie que les colonnes dans Airtable correspondent exactement aux noms dans le code

## 📊 Étape 6 : Personnalisation (optionnel)

### 6.1 Ajouter des vues dans Airtable
Tu peux créer des vues pour organiser tes données :
- **Vue "En attente"** : Filtre sur `Statut = "En attente de validation"`
- **Vue "Publié"** : Filtre sur `Statut = "Publié"`
- **Vue "Par destination"** : Groupé par `Départ - Pays`

### 6.2 Ajouter des formules
Tu peux ajouter des colonnes calculées :
- **Durée depuis création** : `DATETIME_DIFF(NOW(), {Date de création}, 'days')`
- **Nom complet du trajet** : `{Départ - Nom Complet} & " → " & {Arrivée - Nom Complet}`

## 🚀 Étape 7 : Mise en production

Quand tu déploies sur Vercel ou un autre hébergeur :
1. Ajoute les variables d'environnement dans les paramètres de ton hébergeur
2. **⚠️ JAMAIS** commiter le fichier `.env.local` dans Git
3. Utilise des variables d'environnement sécurisées pour la production

## 🆘 Aide et support

Si tu rencontres des problèmes :
1. Vérifie que toutes les colonnes Airtable sont créées avec les bons noms
2. Vérifie que ton API Key a les bonnes permissions
3. Regarde les logs dans la console du navigateur (F12) et dans le terminal
4. Teste d'abord avec l'API `/api/test-airtable`

## 📝 Résumé des fichiers modifiés

- ✅ `src/utils/airtable.ts` - Fonctions utilitaires pour Airtable
- ✅ `src/app/api/submit-announcement/route.ts` - API modifiée pour utiliser Airtable
- ✅ `src/app/api/test-airtable/route.ts` - API de test de connexion
- ⚠️ `.env.local` - À créer avec tes clés API (ne pas commiter)

Voilà ! Ton formulaire DodoPartage est maintenant connecté à Airtable ! 🎉 