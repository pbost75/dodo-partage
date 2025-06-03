# DodoPartage - Plateforme de groupage collaboratif multi-destinations

Outil de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM, îles et pays de la liste Dodomove.

## Description

**DodoPartage** permet aux particuliers de :
- **Proposer de la place** dans leur conteneur de déménagement
- **Chercher une place** pour expédier un petit volume
- **Se mettre en relation** de manière sécurisée et sans inscription

## Objectifs

- Interface **ultra simple** sans création de compte
- **100% cohérent** graphiquement avec l'écosystème Dodomove
- **Multi-destinations** : tous les territoires DOM-TOM + international
- **Sécurisé** avec double opt-in et modération

## Technologies utilisées

- [Next.js 15](https://nextjs.org/) - Framework React avec App Router
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS (cohérent avec dodomove-funnel)
- [Zustand](https://zustand-demo.pmnd.rs/) - Gestion d'état légère
- [Airtable](https://airtable.com/) - Base de données via backend centralisé
- [Resend](https://resend.com/) - Emails transactionnels

## Fonctionnalités principales

### 🏠 Page d'accueil - Listing des annonces
- **Tableau responsive** avec toutes les annonces actives
- **Filtres dynamiques** par destination, volume, date, type d'objet
- **Types d'annonces** : "Propose de la place" / "Cherche de la place"
- **Contact sécurisé** sans affichage d'emails en clair

### 🔔 Système d'alertes email
- **Bouton alerte** avec icône cloche à côté du CTA principal
- **Configuration personnalisée** des critères de recherche
- **Notifications automatiques** par email pour les nouvelles annonces
- **Gestion des alertes** avec possibilité de modification/suppression
- **Pré-remplissage intelligent** avec les filtres de recherche actuels

### 📝 Dépôt d'annonce
- **Formulaire sans compte** inspiré du funnel Dodomove
- **Sélecteurs de destinations** identiques au funnel principal
- **Validation double opt-in** par email avec token unique
- **Gestion d'annonce** via lien d'administration personnel

### 🔄 Cycle de vie des annonces
- **Expiration automatique** selon la date de départ prévue
- **Relances automatiques** avant expiration
- **Modération** avec signalement et liste noire de mots interdits

### 🌍 Multi-destinations supportées
- **DOM-TOM** : Réunion, Martinique, Guadeloupe, Guyane, Mayotte
- **Collectivités** : Nouvelle-Calédonie, Polynésie française
- **International** : Maurice, France métropolitaine
- **Tous les couples** de territoires supportés (DOM-TOM ↔ Métropole, DOM-TOM ↔ DOM-TOM, etc.)

## Architecture technique

### Intégration écosystème Dodomove
```
partage.dodomove.fr (ce projet)
    ↓ (utilise)
dodomove-backend (backend centralisé)
    ↓ (stockage)
Airtable + Emails via Resend
```

### Cohérence graphique
- **Même design system** que dodomove-funnel
- **Polices** : Roboto Slab (titres) + Lato (corps de texte)
- **Palette couleur** : Bleus Dodomove + Orange signature (#F47D6C)
- **Composants UI** : FloatingSelect, CardRadioGroup, FloatingInput réutilisés

## Structure du projet

```
src/
├── app/                    # Pages et routes Next.js 15
│   ├── page.tsx           # Listing des annonces (accueil)
│   ├── deposer/           # Formulaire de dépôt d'annonce
│   ├── api/               # API routes (submit, validation, etc.)
│   └── globals.css        # Styles globaux (cohérents avec funnel)
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── partage/          # Composants spécifiques DodoPartage
│   └── layout/           # Header, Footer, Navigation
├── store/                # Gestion d'état Zustand
├── utils/                # Fonctions utilitaires
└── docs/                 # Documentation technique
```

## Installation et développement

```bash
# Cloner le repository
git clone [URL_DU_REPO]

# Accéder au répertoire
cd dodo-partage

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

## Variables d'environnement

```env
# Backend centralisé Dodomove
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app

# Intégration avec l'écosystème
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr

# Analytics (si nécessaire)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWE8386BQC
```

## Sécurité et modération

### Double opt-in
- ✅ **Validation email** obligatoire avant publication
- ✅ **Token unique** pour chaque annonce
- ✅ **Lien d'administration** personnel (modification/suppression)

### Modération automatique
- 🛡️ **Liste noire** de mots interdits
- 🛡️ **Limitation** du nombre d'annonces par IP/email
- 🛡️ **Bouton signalement** sur chaque annonce
- 🛡️ **Captcha/Honeypot** anti-spam

### RGPD et confidentialité
- 📋 **Case à cocher** obligatoire pour les CGU
- 📧 **Emails** uniquement pour la gestion d'annonce
- 🗑️ **Suppression** automatique après expiration
- 🔒 **Aucun contact direct** affiché publiquement

## Déploiement

### Développement local
```bash
npm run dev  # http://localhost:3000
```

### Production (Vercel)
- **Push sur git** → Déploiement automatique
- **Domaine** : `partage.dodomove.fr`
- **Configuration** : Vercel + sous-domaine

## Workflows utilisateur

### Déposer une annonce
1. Remplir le formulaire (pays départ/arrivée, volume, date, etc.)
2. Recevoir email de validation avec lien unique
3. Cliquer sur le lien → Annonce publiée
4. Gérer l'annonce via lien d'administration

### Contacter un annonceur
1. Parcourir les annonces avec filtres
2. Cliquer "Contacter" sur une annonce
3. Remplir formulaire de contact
4. Email automatique envoyé à l'annonceur
5. Réponse directe par email (hors plateforme)

### Expiration automatique
1. Relance email avant la date d'expiration
2. Proposition de prolonger/modifier/supprimer
3. Masquage automatique si aucune action

## Prochaines étapes

- [ ] Mise en place de l'interface de listing
- [ ] Développement du formulaire de dépôt
- [ ] Intégration avec le backend centralisé
- [ ] Système de filtrage avancé
- [ ] Workflows d'emails automatiques
- [ ] Tests utilisateurs et optimisations

## Documentation

Pour plus de détails techniques, consultez :
- [Guide d'installation](/docs/installation.md) - Instructions étape par étape
- [Documentation architecture](/docs/architecture.md) - Structure technique du projet
- [Guide de développement](/docs/development-guide.md) - Conventions et bonnes pratiques 
- [Guide de déploiement](/docs/deployment.md) - Processus de mise en production
- [Référence API](/docs/api-reference.md) - Documentation complète des endpoints
- [Guide de tests](/docs/testing.md) - Stratégie et exemples de tests
- [Système d'alertes email](/docs/alert-system.md) - Configuration et gestion des alertes
- [Guide backend intégration](/docs/backend-integration.md) - Communication avec l'API
- [Workflows emails](/docs/email-workflows.md) - Système d'emails automatiques
- [Système de modération](/docs/moderation.md) - Sécurité et modération

## Écosystème Dodomove

Ce projet fait partie de l'écosystème Dodomove :
- **dodomove.fr** - Site principal (WordPress/Breakdance)
- **devis.dodomove.fr** - Funnel de devis (Next.js)
- **dodomove-backend** - Backend centralisé (Express/Railway)
- **partage.dodomove.fr** - Plateforme de groupage (ce projet)

## Licence

Propriétaire - Tous droits réservés © Dodomove
