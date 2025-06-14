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

### 📝 Funnel de dépôt d'annonce optimisé (7 étapes)
- **Formulaire sans compte** inspiré du funnel Dodomove
- **Sélecteurs de destinations** identiques au funnel principal
- **Étapes streamlinées** : locations → shipping-date → container-details → minimum-volume → offer-type → announcement-text → contact
- **Interface contact épurée** avec composant téléphone professionnel
- **Indicatifs DOM-TOM** : Support complet France, Réunion, Guadeloupe, Martinique, Guyane, Mayotte, Nouvelle-Calédonie, Polynésie française
- **Validation double opt-in** par email avec token unique
- **Loader bateau animé** pendant la soumission (cohérent avec Dodomove)
- **Page de confirmation moderne** avec feedback utilisateur optimisé

### 🔄 Cycle de vie des annonces
- **Expiration automatique** selon la date de départ prévue
- **Relances automatiques** avant expiration
- **Modération** avec signalement et liste noire de mots interdits

### 🌍 Multi-destinations supportées
- **DOM-TOM** : Réunion, Martinique, Guadeloupe, Guyane, Mayotte
- **Collectivités** : Nouvelle-Calédonie, Polynésie française
- **International** : Maurice, France métropolitaine
- **Tous les couples** de territoires supportés (DOM-TOM ↔ Métropole, DOM-TOM ↔ DOM-TOM, etc.)

### 🔧 Améliorations techniques récentes

#### Interface contact optimisée
- **Suppression des éléments superflus** : Aperçu profil, engagement, informations d'utilisation
- **CTA unique** : Un seul bouton "Finaliser mon annonce" pour éviter la confusion
- **Messages de validation épurés** : Suppression des "✓ Parfait !" et "✓ Email valide"
- **Titre cohérent** : Alignement avec le design Dodomove

#### Composant téléphone professionnel
- **Indicatifs DOM-TOM complets** : France (+33), Réunion (+262), Guadeloupe (+590), Martinique (+596), Guyane (+594), Mayotte (+262), Nouvelle-Calédonie (+687), Polynésie française (+689)
- **Formatage automatique** : Adaptation selon le pays sélectionné
- **Validation patterns** : Contrôles spécifiques par territoire
- **Dropdown intelligent** : Auto-scroll et positionnement adaptatif
- **Conversion internationale** : Format +33612345678 pour l'envoi

#### Résolution erreurs d'hydratation
- **Gestion côté serveur/client** : États `isMounted` pour éviter les différences de rendu
- **Placeholders contextuels** : Affichage uniquement au focus pour FloatingInput
- **Rendu fallback** : Version désactivée côté serveur pour PhoneInput

#### Navigation streamlinée
- **7 étapes optimisées** : Suppression de l'étape récap redondante
- **Passage direct** : Contact → Confirmation sans étape intermédiaire
- **Store mis à jour** : ProposeStore adapté à la nouvelle navigation
- **Loader maritime** : Bateau animé pendant la soumission (identique Dodomove)

#### Système de soumission via backend centralisé
- **API de soumission** : `/api/submit-announcement` utilise le backend Railway
- **Backend centralisé** : Routes `/api/partage/*` sur dodomove-backend
- **Sauvegarde Airtable** : Table `DodoPartage - Annonces` via Railway
- **Emails automatiques** : Confirmation via Resend (backend Railway)
- **Références uniques** : Génération automatique `PARTAGE-XXXXXX-XXXXXX`
- **Logs centralisés** : Traçabilité complète frontend + backend
- **Sécurité** : Clés API côté serveur uniquement

## Architecture technique

### Intégration écosystème Dodomove
```
partage.dodomove.fr (ce projet)
    ↓ (API calls)
dodomove-backend (backend centralisé Railway)
    ↓ (stockage + emails)
Airtable + Resend
```

### Cohérence graphique
- **Même design system** que dodomove-funnel
- **Polices** : Roboto Slab (titres) + Lato (corps de texte)
- **Palette couleur** : Bleus Dodomove + Orange signature (#F47D6C)
- **Composants UI** : FloatingSelect, CardRadioGroup, FloatingInput, PhoneInput réutilisés
- **Loader maritime** : Bateau animé identique au funnel Dodomove
- **Interface épurée** : Suppression des éléments superflus pour une UX optimale

## Structure du projet

```
src/
├── app/                    # Pages et routes Next.js 15
│   ├── page.tsx           # Listing des annonces (accueil)
│   ├── funnel/propose/    # Funnel de dépôt d'annonce (7 étapes)
│   │   ├── locations/     # Étape 1: Sélection destinations
│   │   ├── shipping-date/ # Étape 2: Date d'expédition
│   │   ├── container-details/ # Étape 3: Détails conteneur
│   │   ├── minimum-volume/ # Étape 4: Volume minimum
│   │   ├── offer-type/    # Étape 5: Type d'offre
│   │   ├── announcement-text/ # Étape 6: Texte annonce
│   │   ├── contact/       # Étape 7: Coordonnées (épurée)
│   │   └── confirmation/  # Page finale avec loader bateau
│   ├── validation-success/ # Page succès après validation email
│   ├── validation-error/  # Page erreur validation email
│   ├── api/               # API routes Next.js
│   │   ├── submit-announcement/ # Soumission annonce → backend
│   │   └── validate-announcement/ # Validation email → backend
│   └── globals.css        # Styles globaux (cohérents avec funnel)
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   │   ├── FloatingInput.tsx  # Champ avec placeholder au focus
│   │   ├── PhoneInput.tsx     # Téléphone avec indicatifs DOM-TOM
│   │   └── SubmissionLoader.tsx # Loader bateau animé
│   ├── partage/          # Composants spécifiques DodoPartage
│   └── layout/           # Header, Footer, Navigation
├── store/                # Gestion d'état Zustand
│   └── proposeStore.ts   # Store du funnel (7 étapes)
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

### Déposer une annonce (Funnel optimisé 7 étapes + validation)
1. **Destinations** : Sélectionner départ et arrivée (DOM-TOM ↔ Métropole)
2. **Date d'expédition** : Choisir la date de départ prévue
3. **Conteneur** : Type (20/40 pieds) et volume disponible
4. **Volume minimum** : Quantité minimale pour partager
5. **Type d'offre** : Gratuit ou avec participation aux frais
6. **Description** : Texte libre pour décrire l'annonce
7. **Contact** : Email + téléphone avec indicatifs DOM-TOM
8. **Confirmation** : Loader bateau → Soumission au backend centralisé
9. **Email de validation** : Réception d'un email avec lien unique
10. **Validation** : Clic sur le lien → Annonce publiée et visible

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

## État d'avancement

### ✅ Fonctionnalités terminées
- [x] **Funnel de dépôt d'annonce** : 7 étapes optimisées et fonctionnelles
- [x] **Interface contact épurée** : Suppression des éléments superflus
- [x] **Composant téléphone professionnel** : Indicatifs DOM-TOM complets
- [x] **Loader bateau animé** : Cohérent avec l'écosystème Dodomove
- [x] **Page de confirmation moderne** : Feedback utilisateur optimisé
- [x] **Navigation fluide** : Suppression de l'étape récap, passage direct à confirmation
- [x] **Gestion d'état Zustand** : Store proposeStore avec 7 étapes
- [x] **Cohérence graphique** : Design system aligné sur Dodomove
- [x] **Backend centralisé** : Intégration complète avec dodomove-backend Railway
- [x] **Sauvegarde Airtable** : Table `DodoPartage - Annonces` via backend
- [x] **Emails automatiques** : Confirmation via Resend avec design cohérent
- [x] **Références uniques** : Génération et traçabilité des annonces

### 🚧 Prochaines étapes
- [ ] Mise en place de l'interface de listing des annonces
- [ ] Intégration avec le backend centralisé Dodomove
- [ ] Système de filtrage avancé pour les annonces
- [ ] Workflows d'emails automatiques (validation, notifications)
- [ ] Tests utilisateurs et optimisations UX
- [ ] Système d'alertes email pour les utilisateurs

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
