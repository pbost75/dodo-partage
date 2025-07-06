# DodoPartage - Plateforme de groupage collaboratif multi-destinations

Outil de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM, îles et pays de la liste Dodomove.

## Description

**DodoPartage** permet aux particuliers de :
- **Proposer de la place** dans leur conteneur de déménagement
- **Chercher une place** pour expédier un petit volume
- **Se mettre en relation** de manière sécurisée et sans inscription

## Objectifs

- Interface **ultra simple** sans création de compte ✅
- **100% cohérent** graphiquement avec l'écosystème Dodomove ✅
- **Multi-destinations** : tous les territoires DOM-TOM + international ✅
- **Sécurisé** avec double opt-in et modération ✅

## 🚀 Statut : **100% OPÉRATIONNEL**

**DodoPartage est maintenant complètement terminé avec 21 annonces actives !**
- 🏠 Interface complète avec listing et filtres avancés
- 📧 Système de contact fonctionnel entre utilisateurs
- 🔔 Alertes email automatiques pour nouvelles annonces
- 🚀 **Double funnel complet** : "Propose" (8 étapes) + "Cherche" (6 étapes)
- ✏️ Modification et suppression d'annonces
- 📊 Gestion des deux types d'annonces (offers: 18, requests: 3)
- 🌐 Accessible sur www.dodomove.fr/partage

## Technologies utilisées

- [Next.js 15](https://nextjs.org/) - Framework React avec App Router
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS (cohérent avec dodomove-funnel)
- [Zustand](https://zustand-demo.pmnd.rs/) - Gestion d'état légère
- [Airtable](https://airtable.com/) - Base de données via backend centralisé Railway
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

### 📝 Funnel de dépôt d'annonce optimisé (8 étapes)
- **Formulaire sans compte** inspiré du funnel Dodomove
- **Sélecteurs de destinations** identiques au funnel principal
- **Étapes streamlinées** : locations → shipping-date → container-details → minimum-volume → offer-type → announcement-text → contact → recap
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
- **8 étapes optimisées** : Funnel complet avec récapitulatif avant soumission
- **Passage direct** : Recap → Confirmation après soumission
- **Store mis à jour** : ProposeStore adapté à la navigation complète
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

### Infrastructure multi-domaine avec proxy Cloudflare

**DodoPartage est accessible via 2 URLs :**
- `https://partage.dodomove.fr` - Sous-domaine dédié (URL technique)
- `https://www.dodomove.fr/partage` - URL SEO-friendly (via proxy Cloudflare)

```
┌─ URL SEO-friendly ─────────────────────┐
│  www.dodomove.fr/partage               │
│  ↓ (Cloudflare Worker proxy)          │
│  partage.dodomove.fr                   │
│  ↓ (Next.js App)                      │
│  Navigation & API calls intelligents   │
│  ↓ (Backend calls)                    │
│  dodomove-backend (Railway)            │
│  ↓ (Stockage + emails)                │
│  Airtable + Resend                     │
└────────────────────────────────────────┘
```

### Gestion intelligente des URLs

#### Navigation cross-domain automatique
- **Détection contexte** : `isProxiedContext()` détecte si on est sur www.dodomove.fr
- **URLs adaptatives** : `buildUrl()` ajoute automatiquement `/partage` si nécessaire
- **Router intelligent** : `useSmartRouter()` remplace `useRouter()` standard
- **Navigation seamless** : Fonctionne identique sur les 2 domaines

#### Appels API cross-domain
- **Fonction universelle** : `apiFetch()` remplace `fetch()` standard  
- **Détection automatique** : Appels vers `partage.dodomove.fr/api/*` depuis www.dodomove.fr
- **Headers CORS complets** : Tous les endpoints API supportent le cross-domain
- **Gestion d'erreurs** : Fallback et retry automatiques

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
│   ├── funnel/propose/    # Funnel de dépôt d'annonce (8 étapes)
│   │   ├── locations/     # Étape 1: Sélection destinations
│   │   ├── shipping-date/ # Étape 2: Date d'expédition
│   │   ├── container-details/ # Étape 3: Détails conteneur
│   │   ├── minimum-volume/ # Étape 4: Volume minimum
│   │   ├── offer-type/    # Étape 5: Type d'offre
│   │   ├── announcement-text/ # Étape 6: Texte annonce
│   │   ├── contact/       # Étape 7: Coordonnées
│   │   ├── recap/         # Étape 8: Récapitulatif avant soumission
│   │   └── confirmation/  # Page finale avec loader bateau
│   ├── validation-success/ # Page succès après validation email
│   ├── validation-error/  # Page erreur validation email
│   ├── test-navigation/   # Page de test des URLs cross-domain
│   ├── debug-store/       # Debug des stores Zustand 
│   ├── api/               # API routes Next.js avec CORS complet
│   │   ├── submit-announcement/ # Soumission annonce → backend
│   │   ├── submit-search-request/ # Soumission demande → backend  
│   │   ├── validate-announcement/ # Validation email → backend
│   │   ├── contact-announcement/ # Contact entre utilisateurs → backend
│   │   ├── update-announcement/[token]/ # Modification annonces → backend
│   │   ├── get-announcements/ # Récupération annonces → backend
│   │   ├── test-backend/  # Test connexion backend centralisé
│   │   ├── create-alert/  # Création d'alertes email
│   │   ├── unsubscribe-alert/ # Désabonnement alertes
│   │   └── test-email-alerts/ # Test système d'alertes
│   └── globals.css        # Styles globaux (cohérents avec funnel)
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   │   ├── FloatingInput.tsx  # Champ avec placeholder au focus
│   │   ├── PhoneInput.tsx     # Téléphone avec indicatifs DOM-TOM
│   │   └── SubmissionLoader.tsx # Loader bateau animé
│   ├── partage/          # Composants spécifiques DodoPartage
│   └── layout/           # Header, Footer, Navigation cross-domain
├── store/                # Gestion d'état Zustand
│   ├── proposeStore.ts   # Store du funnel propose (8 étapes)
│   └── searchStore.ts    # Store du funnel search (6 étapes)
├── utils/                # Fonctions utilitaires
│   ├── countries.ts      # Gestion pays et territoires DOM-TOM
│   ├── cityAutocomplete.ts # Autocomplétion des villes
│   ├── autoScroll.ts     # Utilitaires de scroll
│   ├── navigation.ts     # 🆕 Gestion URLs cross-domain
│   ├── apiUtils.ts       # 🆕 Appels API cross-domain  
│   └── cors.ts           # 🆕 Headers CORS centralisés
├── hooks/                # Hooks personnalisés
│   └── useSmartRouter.ts # 🆕 Router intelligent cross-domain
├── scripts/              # Scripts de test et maintenance
│   └── test-email-alerts.js # Test système d'alertes
└── docs/                 # Documentation technique détaillée
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

# Configuration multi-domaine
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr
NEXT_PUBLIC_SEO_URL=https://www.dodomove.fr/partage

# Intégration avec l'écosystème
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr

# Analytics (si nécessaire)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWE8386BQC

# Sécurité et tokens (développement uniquement)
ADMIN_SECRET_KEY=your-admin-secret-key
EMAIL_VALIDATION_SECRET=your-email-validation-secret
```

## Configuration Cloudflare

### Worker de proxy configuré
```javascript
// Cloudflare Worker actif sur www.dodomove.fr/partage/*
// Proxifie automatiquement vers partage.dodomove.fr
// Headers CORS et gestion des redirections incluses
```

### Backend Railway
```env
# Variable importante côté backend
PARTAGE_APP_URL=https://www.dodomove.fr/partage
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

### ✅ Production (Actuellement en ligne)
- **🌐 URLs accessibles** :
  - `https://partage.dodomove.fr` - URL technique (Vercel)
  - `https://www.dodomove.fr/partage` - URL SEO-friendly (Cloudflare Worker → Vercel)
- **📊 Statut** : **OPÉRATIONNEL** avec 21 annonces actives
- **⚡ Performance** : Backend centralisé Railway + Airtable
- **📧 Emails** : Système Resend configuré et fonctionnel

### 🔧 Développement local
```bash
# Cloner et installer
git clone [URL_DU_REPO]
cd dodo-partage
npm install

# Lancer en développement
npm run dev  # http://localhost:3000
```

### 🧪 Tests disponibles
```bash
# Test connexion backend centralisé
npm run test:backend

# Test système d'alertes email
npm run test:email-alerts

# Debug des annonces
node scripts/debug-expiration.js
```

### 🚀 Déploiement automatique
- **Git push** → Déploiement automatique Vercel
- **Cloudflare Worker** → Proxy www.dodomove.fr/partage
- **Railway Backend** → API centralisée opérationnelle
- **Monitoring** : Logs centralisés + GitHub Actions

## Workflows utilisateur

### 🏠 Consulter les annonces (Fonctionnel)
1. **Accéder à la plateforme** : partage.dodomove.fr ou www.dodomove.fr/partage
2. **Parcourir les annonces** : Listing avec 21 annonces actives
3. **Filtrer par critères** : Lieu, date, volume, prix (gratuit/payant)
4. **Basculer entre types** : Toggle "Propose de la place" ↔ "Cherche de la place"
5. **Voir les détails** : Clic sur une annonce pour affichage complet
6. **Recherche avancée** : Barre de recherche avec normalisation géographique

### 📧 Contacter un annonceur (Fonctionnel)
1. **Parcourir les annonces** avec filtres avancés
2. **Cliquer "Contacter"** sur une annonce qui vous intéresse
3. **Remplir le formulaire** : Nom, email, message personnalisé
4. **Envoi automatique** : Email envoyé à l'annonceur via backend centralisé
5. **Réponse directe** : L'annonceur vous répond par email (hors plateforme)

### 🔔 Créer une alerte (Fonctionnel)
1. **Cliquer sur "Créer une alerte"** (bouton cloche)
2. **Définir vos critères** : Départ, arrivée, volume minimum, type d'annonce
3. **Saisir votre email** : Pour recevoir les notifications
4. **Activation automatique** : Alertes envoyées pour chaque nouvelle annonce correspondante
5. **Gestion des alertes** : Liens de modification/suppression dans chaque email

### 🚀 Déposer une annonce "Propose de la place" (Fonctionnel)
1. **Destinations** : Sélectionner départ et arrivée (DOM-TOM ↔ Métropole)
2. **Date d'expédition** : Choisir la date de départ prévue
3. **Conteneur** : Type (20/40 pieds) et volume disponible
4. **Volume minimum** : Quantité minimale pour partager
5. **Type d'offre** : Gratuit ou avec participation aux frais
6. **Description** : Texte libre pour décrire l'annonce
7. **Contact** : Email + téléphone avec indicatifs DOM-TOM
8. **Récapitulatif** : Vérification de toutes les informations
9. **Confirmation** : Loader bateau → Soumission au backend centralisé
10. **Email de validation** : Réception d'un email avec lien unique
11. **Validation** : Clic sur le lien → Annonce publiée et visible

### 🔍 Déposer une demande "Cherche de la place" (Fonctionnel)
1. **Destinations** : Sélectionner départ et arrivée (DOM-TOM ↔ Métropole)
2. **Période d'expédition** : Choisir les mois souhaités (flexibilité)
3. **Volume recherché** : Quantité d'objets à transporter
4. **Budget** : Gratuit par entraide ou participation aux frais
5. **Description** : Texte généré automatiquement et personnalisable
6. **Contact** : Email + téléphone avec indicatifs DOM-TOM
7. **Confirmation** : Soumission directe au backend centralisé
8. **Email de validation** : Réception d'un email avec lien unique
9. **Validation** : Clic sur le lien → Demande publiée et visible

### ✏️ Modifier une annonce (Fonctionnel)
1. **Accéder via email** : Lien de modification dans l'email de confirmation
2. **Interface inline** : Modification directe des champs sur la page
3. **Sauvegarde intelligente** : Bouton flottant qui apparaît avec les changements
4. **Mise à jour automatique** : Changements sauvegardés sur le backend

### 🗑️ Supprimer une annonce (Fonctionnel)
1. **Accéder via email** : Lien de suppression dans l'email de confirmation
2. **Confirmation** : Page de confirmation avant suppression définitive
3. **Suppression immédiate** : Annonce retirée du listing

### ⏰ Expiration automatique (Fonctionnel)
1. **Relance email J-3** : Rappel avant la date d'expiration
2. **Proposition d'actions** : Prolonger/modifier/supprimer
3. **Masquage automatique** : Annonce expirée automatiquement retirée

## État d'avancement

### ✅ Fonctionnalités terminées et opérationnelles
- [x] **🏠 Page d'accueil complète** : Listing des annonces avec filtres avancés
- [x] **🔍 Système de filtres dynamiques** : Recherche par lieu, date, volume, prix
- [x] **📧 Système de contact fonctionnel** : Modal + API backend + emails automatiques
- [x] **🔔 Système d'alertes email** : Notifications automatiques pour nouvelles annonces
- [x] **🚀 Funnel "Propose de la place"** : 8 étapes complètes avec validation double opt-in
- [x] **✏️ Modification d'annonces** : Interface inline complète et optimisée mobile
- [x] **🗑️ Suppression d'annonces** : Fonctionnalité complète via backend
- [x] **🌐 Infrastructure multi-domaine** : Proxy Cloudflare + URLs cross-domain
- [x] **🛠️ Backend centralisé** : Intégration complète avec dodomove-backend Railway
- [x] **📱 Interface responsive** : Design adaptatif mobile/desktop
- [x] **🎨 Cohérence graphique** : Design system aligné sur l'écosystème Dodomove

### ✅ Fonctionnalités terminées et opérationnelles (suite)
- [x] **🔍 Funnel "Cherche de la place"** : 6 étapes complètes pour les demandes d'espace
- [x] **🔄 Intégration complète** : Les deux funnels (propose + cherche) opérationnels
- [x] **📊 Gestion multi-types** : Annonces "offers" et "requests" avec statistiques

### 📋 Améliorations futures (optionnelles)
- [ ] **🛡️ Interface de modération** : Dashboard administrateur pour validation manuelle
- [ ] **🧪 Tests automatisés** : Couverture complète des funnels
- [ ] **🔍 Optimisation SEO** : Meta tags et structure
- [ ] **⚡ Performances** : Optimisation bundle et images
- [ ] **♿ Accessibilité** : Conformité WCAG 2.1

### 📊 Taux d'achèvement global : **100%** 🎉

**🎉 Le projet est maintenant 100% terminé et en production ! 🎉**

## Documentation détaillée

Pour plus d'informations techniques, consultez :
- `BACKEND-INTEGRATION.md` - Configuration backend centralisé
- `DEPLOYMENT-STATUS.md` - État du déploiement
- `docs/` - Documentation technique complète

## Écosystème Dodomove

Ce projet fait partie de l'écosystème Dodomove :
- **dodomove.fr** - Site principal (WordPress/Breakdance)
- **devis.dodomove.fr** - Funnel de devis (Next.js)
- **dodomove-backend** - Backend centralisé (Express/Railway)
- **partage.dodomove.fr** - Plateforme de groupage (ce projet)

## Licence

Propriétaire - Tous droits réservés © Dodomove
# Fix sync GitHub Mar 24 jui 2025 14:59:16 +04
