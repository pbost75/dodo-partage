# 🚀 Intégration Airtable - Guide rapide

## ✅ Ce qui a été fait

J'ai configuré ton projet DodoPartage pour envoyer automatiquement toutes les données du formulaire vers Airtable ! Voici ce qui a été mis en place :

### 📁 Fichiers créés/modifiés :
- ✅ `src/utils/airtable.ts` - Fonctions pour communiquer avec Airtable
- ✅ `src/app/api/submit-announcement/route.ts` - API modifiée pour utiliser Airtable
- ✅ `src/app/api/test-airtable/route.ts` - API pour tester la connexion
- ✅ `scripts/test-airtable.js` - Script de test en ligne de commande
- ✅ `docs/airtable-setup.md` - Guide détaillé de configuration

## 🎯 Prochaines étapes (à faire maintenant)

### 1. Créer ton compte Airtable
1. Va sur [airtable.com](https://airtable.com) et crée un compte gratuit
2. Crée une nouvelle base appelée `DodoPartage - Annonces`
3. Configure la table avec les colonnes exactes (voir le guide détaillé)

### 2. Obtenir tes clés API
1. Crée un Personal Access Token dans Airtable
2. Récupère ton Base ID depuis l'API documentation
3. Note bien ces informations (tu en auras besoin)

### 3. Configurer ton projet
Crée un fichier `.env.local` à la racine du projet avec :

```bash
# Configuration Airtable - REMPLACE PAR TES VRAIES VALEURS
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Annonces

# Autres variables (garde les valeurs par défaut)
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr
NODE_ENV=development
```

### 4. Tester la configuration

#### Option A : Script en ligne de commande
```bash
npm run test:airtable
```

#### Option B : Via le navigateur
1. Démarre le serveur : `npm run dev`
2. Va sur : `http://localhost:3000/api/test-airtable`

### 5. Tester le formulaire complet
1. Va sur : `http://localhost:3000/funnel/propose/locations`
2. Remplis tout le formulaire étape par étape
3. À la confirmation, vérifie que les données apparaissent dans Airtable

## 📊 Données envoyées vers Airtable

Quand quelqu'un remplit le formulaire, ces informations sont automatiquement sauvegardées :

### 👤 Contact
- Prénom
- Email  
- Téléphone (optionnel)

### 📍 Localisation
- Départ : Pays, Ville, Code postal, Nom complet
- Arrivée : Pays, Ville, Code postal, Nom complet

### 📦 Conteneur
- Date d'expédition
- Type de conteneur (20 ou 40 pieds)
- Volume disponible (m³)
- Volume minimum requis (m³)

### 💰 Offre
- Type d'offre (Gratuit/Payant)
- Description détaillée de l'annonce

### 🔧 Métadonnées
- Statut (En attente de validation)
- Date de création
- ID temporaire unique

## 🔍 Debugging

Si ça ne marche pas :

1. **Vérifie les logs** dans ton terminal (où tu as lancé `npm run dev`)
2. **Teste la connexion** avec `npm run test:airtable`
3. **Vérifie les colonnes** dans Airtable (noms exacts requis)
4. **Consulte le guide détaillé** : `docs/airtable-setup.md`

## 🎉 Résultat attendu

Une fois configuré, à chaque fois que quelqu'un termine le formulaire :
1. ✅ Les données sont automatiquement envoyées vers Airtable
2. ✅ Un nouvel enregistrement apparaît dans ta base
3. ✅ Tu peux voir toutes les annonces dans un tableau organisé
4. ✅ Tu peux créer des vues, filtres, et analyses dans Airtable

## 📞 Besoin d'aide ?

Si tu rencontres des problèmes :
1. Regarde d'abord le guide détaillé : `docs/airtable-setup.md`
2. Utilise le script de test : `npm run test:airtable`
3. Vérifie les logs dans la console de ton navigateur (F12)

Ton formulaire est maintenant prêt à envoyer des données vers Airtable ! 🚀 