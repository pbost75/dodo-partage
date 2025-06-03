# Architecture - DodoPartage

## Vue d'ensemble

DodoPartage est conçu comme une extension naturelle de l'écosystème Dodomove, réutilisant les mêmes technologies et patterns pour garantir une cohérence maximale.

## Stack technique

### Frontend
- **Next.js 15** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling (palette Dodomove)
- **Zustand** pour la gestion d'état légère
- **Framer Motion** pour les animations (cohérence avec funnel)

### Backend & Services
- **Backend centralisé Dodomove** (Express/Railway)
- **Airtable** pour le stockage des annonces
- **Resend** pour tous les emails automatiques

## Architecture des données

### Modèle d'annonce
```typescript
interface Announcement {
  id: string;                    // UUID unique
  type: 'offer' | 'request';     // Type d'annonce
  
  // Informations de contact
  contactName: string;           // Prénom/pseudo
  contactEmail: string;          // Email (non affiché publiquement)
  
  // Destinations
  departureCountry: string;      // Pays de départ
  arrivalCountry: string;        // Pays d'arrivée
  
  // Détails du transport
  volume: number;                // Volume en m³
  volumeUnit: 'm3' | 'cartons';  // Unité de mesure
  date: Date;                    // Date de départ/disponibilité
  isFlexibleDate: boolean;       // Date flexible ou fixe
  
  // Description
  objectTypes: string;           // Types d'objets acceptés/recherchés
  description?: string;          // Message complémentaire
  price?: number;                // Tarif indicatif (optionnel)
  
  // Gestion
  status: 'pending' | 'active' | 'expired' | 'deleted';
  adminToken: string;            // Token pour gestion par propriétaire
  validationToken?: string;      // Token pour validation email
  
  // Métadonnées
  createdAt: Date;
  expiresAt: Date;
  lastContactedAt?: Date;
}
```

### Tables Airtable

#### Table principale : "DodoPartage Announcements"
- **id** (Auto Number) - ID unique Airtable
- **uuid** (Single line text) - UUID pour URLs publiques
- **type** (Single select) - "Propose place" / "Cherche place"
- **contact_name** (Single line text) - Prénom/pseudo
- **contact_email** (Email) - Email de contact (privé)
- **departure_country** (Single select) - Liste des pays Dodomove
- **arrival_country** (Single select) - Liste des pays Dodomove
- **volume** (Number) - Volume en m³
- **volume_unit** (Single select) - "m³" / "cartons"
- **date** (Date) - Date de départ/disponibilité
- **is_flexible_date** (Checkbox) - Date flexible
- **object_types** (Long text) - Types d'objets
- **description** (Long text) - Description optionnelle
- **price** (Currency) - Tarif indicatif
- **status** (Single select) - "pending", "active", "expired", "deleted"
- **admin_token** (Single line text) - Token de gestion
- **validation_token** (Single line text) - Token de validation
- **created_at** (Date) - Date de création
- **expires_at** (Date) - Date d'expiration
- **last_contacted_at** (Date) - Dernière mise en relation

#### Table de logs : "DodoPartage Contacts"
- **announcement_id** (Link to record) - Lien vers l'annonce
- **contact_name** (Single line text) - Nom du contacteur
- **contact_email** (Email) - Email du contacteur
- **message** (Long text) - Message envoyé
- **contacted_at** (Date) - Date du contact
- **ip_address** (Single line text) - IP pour anti-spam

## Structure du projet

```
src/
├── app/                          # App Router Next.js 15
│   ├── page.tsx                 # Page d'accueil (listing)
│   ├── deposer/                 # Dépôt d'annonce
│   │   └── page.tsx
│   ├── validation/              # Validation email
│   │   └── [token]/page.tsx
│   ├── gestion/                 # Gestion d'annonce
│   │   └── [token]/page.tsx
│   ├── contact/                 # Contact annonceur
│   │   └── [id]/page.tsx
│   ├── api/                     # API Routes
│   │   ├── announcements/       # CRUD annonces
│   │   ├── submit/              # Soumission nouvelle annonce
│   │   ├── validate/            # Validation email
│   │   ├── contact/             # Mise en relation
│   │   └── admin/               # Actions admin
│   ├── layout.tsx               # Layout principal
│   └── globals.css              # Styles Dodomove
├── components/
│   ├── ui/                      # Composants UI réutilisables
│   │   ├── FloatingSelect.tsx   # Copié du funnel
│   │   ├── FloatingInput.tsx    # Copié du funnel
│   │   ├── CardRadioGroup.tsx   # Copié du funnel
│   │   └── Button.tsx           # Cohérent avec Dodomove
│   ├── partage/                 # Composants spécifiques
│   │   ├── AnnouncementCard.tsx # Carte d'annonce
│   │   ├── AnnouncementFilters.tsx # Filtres de recherche
│   │   ├── AnnouncementForm.tsx # Formulaire de dépôt
│   │   └── ContactForm.tsx      # Formulaire de contact
│   └── layout/
│       ├── Header.tsx           # En-tête avec lien Dodomove
│       └── Footer.tsx           # Pied de page avec mentions
├── store/
│   ├── useAnnouncementStore.ts  # État des annonces
│   └── useFilterStore.ts        # État des filtres
├── utils/
│   ├── api.ts                   # Helpers API
│   ├── validation.ts            # Validation formulaires
│   ├── countries.ts             # Liste des pays Dodomove
│   └── email-templates.ts       # Templates d'emails
└── types/
    └── announcement.ts          # Types TypeScript
```

## Flux de données

### Création d'annonce
1. **Formulaire** → Validation côté client
2. **API /submit** → Validation serveur + token génération
3. **Airtable** → Stockage avec status "pending"
4. **Email validation** → Envoi via backend centralisé
5. **Clic validation** → API /validate → Status "active"

### Affichage des annonces
1. **Page d'accueil** → Chargement des annonces actives
2. **Filtres** → Requête dynamique vers API
3. **Airtable** → Récupération filtrée
4. **Client** → Affichage responsive

### Mise en relation
1. **Bouton contact** → Formulaire de contact
2. **API /contact** → Validation + envoi email
3. **Backend centralisé** → Email via Resend
4. **Log Airtable** → Traçabilité des contacts

## Intégration avec l'écosystème

### Backend centralisé
```
POST /api/dodo-partage/submit
POST /api/dodo-partage/validate
POST /api/dodo-partage/contact
GET  /api/dodo-partage/announcements
```

### Cohérence graphique
- **Palette couleurs** : Variables CSS du funnel
- **Composants UI** : Copie directe des composants funnel
- **Animations** : Même bibliothèque Framer Motion
- **Responsive** : Mêmes breakpoints Tailwind

## Sécurité

### Double opt-in
- **Token UUID** généré côté serveur
- **Email validation** obligatoire
- **Expiration token** après 24h

### Modération
- **Liste noire** de mots interdits
- **Rate limiting** par IP
- **Honeypot** anti-bot
- **Validation RGPD** obligatoire

### Protection données
- **Emails masqués** publiquement
- **Tokens uniques** pour chaque action
- **Logs d'audit** dans Airtable
- **Expiration automatique** des annonces 