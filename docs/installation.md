# Guide d'installation - DodoPartage

Ce guide vous accompagne pas à pas pour installer et faire fonctionner DodoPartage sur votre machine de développement.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### 1. Node.js (version 18 ou supérieure)
```bash
# Vérifiez votre version de Node.js
node --version

# Si vous n'avez pas Node.js, téléchargez-le depuis :
# https://nodejs.org/
```

### 2. Git
```bash
# Vérifiez votre version de Git
git --version

# Si vous n'avez pas Git, installez-le depuis :
# https://git-scm.com/
```

### 3. Un éditeur de code
Nous recommandons **Visual Studio Code** avec les extensions :
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

## Installation du projet

### Étape 1 : Cloner le repository
```bash
# Naviguez vers votre dossier de projets
cd ~/projets

# Clonez le projet
git clone [URL_DU_REPOSITORY] dodo-partage

# Entrez dans le dossier
cd dodo-partage
```

### Étape 2 : Installer les dépendances
```bash
# Installez toutes les dépendances du projet
npm install

# Cette commande peut prendre quelques minutes...
```

### Étape 3 : Configuration de l'environnement
```bash
# Copiez le fichier d'exemple des variables d'environnement
cp env.example .env.local

# Éditez le fichier .env.local avec vos valeurs
```

**Contenu minimal du fichier `.env.local` :**
```env
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Étape 4 : Démarrer le serveur de développement
```bash
# Démarrez l'application en mode développement
npm run dev
```

✅ **Succès !** Votre application devrait être accessible sur [http://localhost:3000](http://localhost:3000)

## Vérification de l'installation

### 1. Page d'accueil
- Allez sur `http://localhost:3000`
- Vous devriez voir la page de listing des annonces
- Le design doit être cohérent avec l'identité Dodomove

### 2. Console de développement
- Ouvrez les outils de développement (F12)
- Vérifiez qu'il n'y a pas d'erreurs dans la console
- Les requêtes API doivent fonctionner

### 3. Tests des composants
```bash
# Si vous voulez tester les composants individuellement
npm run lint
npm run build
```

## Commandes utiles

### Développement
```bash
npm run dev        # Démarre le serveur de développement
npm run lint       # Vérifie la qualité du code
npm run build      # Compile le projet pour la production
npm run start      # Démarre le serveur de production
```

### Gestion des dépendances
```bash
npm install <package>     # Ajoute une nouvelle dépendance
npm update               # Met à jour les dépendances
npm audit               # Vérifie les vulnérabilités
```

### Git et versioning
```bash
git status              # Vérifiez l'état de vos modifications
git add .               # Ajoutez tous les fichiers modifiés
git commit -m "message" # Créez un commit avec un message
git push               # Envoyez vos modifications
```

## Structure des dossiers expliquée

```
dodo-partage/
├── src/                    # Code source principal
│   ├── app/               # Pages Next.js (App Router)
│   ├── components/        # Composants React réutilisables
│   ├── store/            # Gestion d'état avec Zustand
│   ├── types/            # Définitions TypeScript
│   └── utils/            # Fonctions utilitaires
├── docs/                  # Documentation du projet
├── public/               # Fichiers statiques (images, favicon)
├── package.json          # Configuration npm et dépendances
├── tailwind.config.js    # Configuration Tailwind CSS
├── tsconfig.json         # Configuration TypeScript
└── next.config.ts        # Configuration Next.js
```

## Résolution des problèmes courants

### Erreur "Module not found"
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules
rm package-lock.json
npm install
```

### Erreur de port déjà utilisé
```bash
# Si le port 3000 est occupé, utilisez un autre port
npm run dev -- -p 3001
```

### Erreurs TypeScript
```bash
# Vérifiez et corrigez les erreurs TypeScript
npm run lint
```

### Problèmes de cache
```bash
# Videz le cache Next.js
rm -rf .next
npm run dev
```

## Prochaines étapes

Une fois l'installation terminée, consultez :

1. **[Architecture du projet](./architecture.md)** - Comprendre la structure technique
2. **[Guide de développement](./development-guide.md)** - Conventions et bonnes pratiques
3. **[Intégration backend](./backend-integration.md)** - Communication avec l'API

## Aide et support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console du navigateur
2. Consultez les logs du terminal où vous avez lancé `npm run dev`
3. Vérifiez que tous les prérequis sont installés
4. Consultez la documentation Next.js : [https://nextjs.org/docs](https://nextjs.org/docs)

## Variables d'environnement détaillées

### Variables obligatoires
- `NEXT_PUBLIC_BACKEND_URL` : URL du backend centralisé Dodomove
- `NEXT_PUBLIC_APP_URL` : URL de votre application (localhost en développement)

### Variables optionnelles
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` : ID Google Analytics
- `ADMIN_SECRET_KEY` : Clé secrète pour les actions d'administration
- `EMAIL_VALIDATION_SECRET` : Clé pour la validation des emails

### Variables gérées par le backend
Ces variables sont configurées dans le backend centralisé et n'ont pas besoin d'être définies localement :
- Configuration Airtable
- Configuration Resend (emails)
- Clés d'API externes 