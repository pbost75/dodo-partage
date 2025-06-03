# Référence API - DodoPartage

Documentation complète des APIs et endpoints utilisés par DodoPartage.

## Vue d'ensemble

DodoPartage utilise une architecture hybride :
- **Backend centralisé Dodomove** pour les données et emails
- **API Routes Next.js** pour la logique métier frontend

## Base URLs

```
Production:  https://partage.dodomove.fr
Backend:     https://web-production-7b738.up.railway.app
Local:       http://localhost:3000
```

## Authentication

La plupart des endpoints sont publics. L'authentication se fait via des tokens UUID pour les actions sensibles.

```typescript
// Headers standard
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// Pour les actions administratives
{
  'Authorization': 'Bearer admin-token',
  'X-Admin-Token': 'admin-secret-key'
}
```

## Endpoints Frontend (Next.js API Routes)

### Gestion des annonces

#### GET /api/announcements

Récupère la liste des annonces avec filtres optionnels.

**Paramètres de requête :**
```typescript
interface AnnouncementsParams {
  type?: 'offer' | 'request';           // Type d'annonce
  country?: string;                     // Pays de départ ou arrivée
  departure?: string;                   // Pays de départ spécifique
  arrival?: string;                     // Pays d'arrivée spécifique
  volume_min?: number;                  // Volume minimum en m³
  volume_max?: number;                  // Volume maximum en m³
  date_from?: string;                   // Date au format ISO
  date_to?: string;                     // Date au format ISO
  page?: number;                        // Pagination (défaut: 1)
  limit?: number;                       // Limite par page (défaut: 20)
  sort?: 'date' | 'volume' | 'created'; // Tri
  order?: 'asc' | 'desc';               // Ordre de tri
}
```

**Réponse :**
```typescript
interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  filters_applied: AnnouncementsParams;
}
```

**Exemple :**
```bash
GET /api/announcements?type=offer&departure=France&limit=10
```

#### POST /api/announcements

Crée une nouvelle annonce (nécessite validation email).

**Body :**
```typescript
interface CreateAnnouncementRequest {
  type: 'offer' | 'request';
  contact_name: string;
  contact_email: string;
  departure_country: string;
  arrival_country: string;
  volume: number;
  volume_unit: 'm3' | 'cartons';
  date: string; // ISO date
  is_flexible_date: boolean;
  object_types: string;
  description?: string;
  price?: number;
  accept_terms: boolean;
}
```

**Réponse :**
```typescript
interface CreateAnnouncementResponse {
  success: boolean;
  data: {
    id: string;
    validation_token: string;
    admin_token: string;
    expires_at: string;
  };
  message: string;
}
```

#### GET /api/announcements/[id]

Récupère une annonce spécifique par son ID.

**Réponse :**
```typescript
interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
}
```

### Validation et gestion

#### POST /api/validate

Valide une annonce via le token reçu par email.

**Body :**
```typescript
interface ValidateRequest {
  token: string;
}
```

**Réponse :**
```typescript
interface ValidateResponse {
  success: boolean;
  data: {
    announcement_id: string;
    admin_token: string;
  };
  message: string;
}
```

#### POST /api/contact

Permet de contacter un annonceur.

**Body :**
```typescript
interface ContactRequest {
  announcement_id: string;
  contact_name: string;
  contact_email: string;
  message: string;
  phone?: string;
  captcha_token?: string; // Protection anti-spam
}
```

**Réponse :**
```typescript
interface ContactResponse {
  success: boolean;
  message: string;
  contact_id: string;
}
```

### Administration des annonces

#### PUT /api/admin/announcements/[id]

Modifie une annonce existante (nécessite admin_token).

**Headers :**
```typescript
{
  'X-Admin-Token': 'admin-token-from-creation'
}
```

**Body :** Même structure que la création, tous les champs optionnels.

#### DELETE /api/admin/announcements/[id]

Supprime une annonce (nécessite admin_token).

#### POST /api/admin/announcements/[id]/extend

Prolonge la durée de vie d'une annonce.

**Body :**
```typescript
interface ExtendRequest {
  days: number; // Nombre de jours d'extension (max 30)
}
```

### Utilitaires

#### GET /api/health

Vérification de l'état de santé de l'API.

**Réponse :**
```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    backend: boolean;
    email: boolean;
  };
  version: string;
}
```

#### GET /api/countries

Liste des pays supportés pour les destinations.

**Réponse :**
```typescript
interface CountriesResponse {
  success: boolean;
  data: Country[];
}

interface Country {
  code: string;        // Code ISO
  name: string;        // Nom français
  flag: string;        // Emoji drapeau
  region: string;      // DOM-TOM, Métropole, International
  shipping_zones: string[]; // Zones de livraison
}
```

#### GET /api/stats

Statistiques publiques de la plateforme.

**Réponse :**
```typescript
interface StatsResponse {
  success: boolean;
  data: {
    total_announcements: number;
    active_announcements: number;
    total_contacts: number;
    popular_routes: {
      departure: string;
      arrival: string;
      count: number;
    }[];
    volume_stats: {
      average: number;
      total: number;
    };
  };
}
```

## Endpoints Backend Centralisé

### Base: `/api/dodo-partage/`

#### POST /api/dodo-partage/submit

Stockage d'une nouvelle annonce dans Airtable.

**Body :** Données de l'annonce validées côté frontend.

#### POST /api/dodo-partage/validate-email

Envoi de l'email de validation.

#### POST /api/dodo-partage/contact-email

Envoi de l'email de mise en relation.

#### GET /api/dodo-partage/announcements

Récupération des annonces depuis Airtable avec filtres.

## Types TypeScript

### Modèle principal

```typescript
interface Announcement {
  id: string;
  uuid: string;
  type: 'offer' | 'request';
  
  // Contact
  contact_name: string;
  contact_email: string;
  
  // Destinations
  departure_country: string;
  arrival_country: string;
  
  // Transport
  volume: number;
  volume_unit: 'm3' | 'cartons';
  date: Date;
  is_flexible_date: boolean;
  
  // Contenu
  object_types: string;
  description?: string;
  price?: number;
  
  // État
  status: 'pending' | 'active' | 'expired' | 'deleted';
  admin_token: string;
  validation_token?: string;
  
  // Métadonnées
  created_at: Date;
  expires_at: Date;
  last_contacted_at?: Date;
  contact_count: number;
}
```

### Filtres et recherche

```typescript
interface AnnouncementFilters {
  type?: 'offer' | 'request';
  departure_country?: string;
  arrival_country?: string;
  volume_min?: number;
  volume_max?: number;
  date_from?: Date;
  date_to?: Date;
  object_types?: string[];
  price_max?: number;
  is_flexible_date?: boolean;
}
```

### Erreurs API

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Codes d'erreur communs
type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'BACKEND_UNAVAILABLE'
  | 'EMAIL_FAILED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID';
```

## Gestion des erreurs

### Codes de statut HTTP

- **200** - Succès
- **201** - Créé avec succès
- **400** - Erreur de validation
- **401** - Non autorisé
- **404** - Ressource non trouvée
- **429** - Trop de requêtes (rate limiting)
- **500** - Erreur serveur
- **502** - Backend indisponible

### Format des erreurs

```typescript
// Erreur de validation
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": {
      "contact_email": "Email invalide",
      "volume": "Doit être supérieur à 0"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Erreur serveur
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Une erreur interne est survenue"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting

### Limites par endpoint

- **GET /api/announcements** : 100 req/min
- **POST /api/announcements** : 5 req/hour par IP
- **POST /api/contact** : 10 req/hour par IP
- **POST /api/validate** : 20 req/hour par IP

### Headers de réponse

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642158600
```

## Exemples d'utilisation

### Créer une annonce complète

```typescript
// 1. Créer l'annonce
const response = await fetch('/api/announcements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'offer',
    contact_name: 'Jean Dupont',
    contact_email: 'jean@example.com',
    departure_country: 'France',
    arrival_country: 'Réunion',
    volume: 2.5,
    volume_unit: 'm3',
    date: '2024-02-15T00:00:00Z',
    is_flexible_date: true,
    object_types: 'Mobilier, cartons',
    description: 'Déménagement partiel, meubles et affaires personnelles',
    price: 500,
    accept_terms: true
  })
});

const { data } = await response.json();

// 2. L'utilisateur reçoit un email avec le lien de validation
// 3. Clic sur le lien déclenche la validation
const validateResponse = await fetch('/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: data.validation_token
  })
});

// 4. L'annonce devient active
```

### Rechercher et contacter

```typescript
// 1. Rechercher des annonces
const searchResponse = await fetch(
  '/api/announcements?type=offer&departure=France&arrival=Réunion&volume_min=1'
);
const { data: announcements } = await searchResponse.json();

// 2. Contacter un annonceur
const contactResponse = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    announcement_id: announcements[0].id,
    contact_name: 'Marie Martin',
    contact_email: 'marie@example.com',
    message: 'Bonjour, je suis intéressée par votre annonce...',
    phone: '+33123456789'
  })
});
```

### Gérer son annonce

```typescript
// 1. Modifier une annonce
const updateResponse = await fetch(`/api/admin/announcements/${announcementId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Token': adminToken
  },
  body: JSON.stringify({
    description: 'Description mise à jour',
    price: 600
  })
});

// 2. Prolonger l'annonce
const extendResponse = await fetch(`/api/admin/announcements/${announcementId}/extend`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Token': adminToken
  },
  body: JSON.stringify({
    days: 15
  })
});

// 3. Supprimer l'annonce
const deleteResponse = await fetch(`/api/admin/announcements/${announcementId}`, {
  method: 'DELETE',
  headers: {
    'X-Admin-Token': adminToken
  }
});
```

## SDK JavaScript (Helper)

```typescript
// utils/api-client.ts
class DodoPartageAPI {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async getAnnouncements(filters?: AnnouncementFilters) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await fetch(`${this.baseURL}/announcements?${params}`);
    return this.handleResponse(response);
  }

  async createAnnouncement(data: CreateAnnouncementRequest) {
    const response = await fetch(`${this.baseURL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async validateAnnouncement(token: string) {
    const response = await fetch(`${this.baseURL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return this.handleResponse(response);
  }

  async contactAnnouncer(data: ContactRequest) {
    const response = await fetch(`${this.baseURL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
      throw new APIError(data.error.code, data.error.message, data.error.details);
    }
    return data;
  }
}

export const apiClient = new DodoPartageAPI();
```

Cette documentation couvre l'ensemble des APIs de DodoPartage. Référez-vous à cette documentation lors du développement de nouvelles fonctionnalités ou de l'intégration avec le frontend. 