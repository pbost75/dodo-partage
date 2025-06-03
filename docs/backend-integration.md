# Intégration Backend - DodoPartage

## Vue d'ensemble

DodoPartage utilise le backend centralisé Dodomove existant pour assurer la cohérence de l'écosystème et éviter la duplication de code. Cette approche garantit une maintenance simplifiée et une sécurité renforcée.

## Backend centralisé existant

**URL** : `https://web-production-7b738.up.railway.app`  
**Technologies** : Express.js, Airtable, Resend  
**Déployé sur** : Railway

## Nouveaux endpoints à ajouter

### Structure des nouvelles routes

```javascript
// Routes DodoPartage à ajouter au backend centralisé
app.post('/api/dodo-partage/submit', submitAnnouncement);
app.get('/api/dodo-partage/announcements', getAnnouncements);
app.post('/api/dodo-partage/validate', validateAnnouncement);
app.post('/api/dodo-partage/contact', contactAnnouncer);
app.put('/api/dodo-partage/admin/:token', updateAnnouncement);
app.delete('/api/dodo-partage/admin/:token', deleteAnnouncement);
```

## API Endpoints détaillés

### 1. Soumission d'annonce
```http
POST /api/dodo-partage/submit
Content-Type: application/json

{
  "type": "offer",
  "contactName": "Jean",
  "contactEmail": "jean@example.com",
  "departureCountry": "France",
  "arrivalCountry": "Réunion",
  "volume": 2.5,
  "volumeUnit": "m3",
  "date": "2024-03-15",
  "isFlexibleDate": false,
  "objectTypes": "Mobilier, électroménager",
  "description": "Déménagement prévu, place disponible",
  "price": 150
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Annonce soumise avec succès. Vérifiez votre email pour la validation.",
  "announcementId": "uuid-generated"
}
```

### 2. Récupération des annonces
```http
GET /api/dodo-partage/announcements?departureCountry=France&arrivalCountry=Réunion&type=offer
```

**Réponse** :
```json
{
  "success": true,
  "announcements": [
    {
      "id": "uuid-1",
      "type": "offer",
      "contactName": "Jean",
      "departureCountry": "France",
      "arrivalCountry": "Réunion",
      "volume": 2.5,
      "volumeUnit": "m3",
      "date": "2024-03-15",
      "objectTypes": "Mobilier, électroménager",
      "description": "Déménagement prévu, place disponible",
      "price": 150,
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-03-20T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 3. Validation d'annonce
```http
POST /api/dodo-partage/validate
Content-Type: application/json

{
  "token": "validation-token-uuid"
}
```

### 4. Contact d'annonceur
```http
POST /api/dodo-partage/contact
Content-Type: application/json

{
  "announcementId": "uuid-1",
  "contactName": "Marie",
  "contactEmail": "marie@example.com",
  "message": "Bonjour, je suis intéressée par votre annonce..."
}
```

## Configuration Airtable

### Nouvelle base ou extension ?
**Recommandation** : Extension de la base Airtable existante avec nouvelles tables

### Tables à créer

#### Table "DodoPartage Announcements"
```javascript
const announcementFields = {
  'id': 'Auto Number',
  'uuid': 'Single line text',
  'type': {
    'type': 'Single select',
    'options': ['Propose place', 'Cherche place']
  },
  'contact_name': 'Single line text',
  'contact_email': 'Email',
  'departure_country': {
    'type': 'Single select',
    'options': ['France', 'Réunion', 'Martinique', 'Guadeloupe', 'Guyane', 'Mayotte', 'Nouvelle-Calédonie', 'Polynésie française', 'Maurice']
  },
  'arrival_country': {
    'type': 'Single select',
    'options': ['France', 'Réunion', 'Martinique', 'Guadeloupe', 'Guyane', 'Mayotte', 'Nouvelle-Calédonie', 'Polynésie française', 'Maurice']
  },
  'volume': 'Number',
  'volume_unit': {
    'type': 'Single select',
    'options': ['m³', 'cartons']
  },
  'date': 'Date',
  'is_flexible_date': 'Checkbox',
  'object_types': 'Long text',
  'description': 'Long text',
  'price': 'Currency',
  'status': {
    'type': 'Single select',
    'options': ['pending', 'active', 'expired', 'deleted']
  },
  'admin_token': 'Single line text',
  'validation_token': 'Single line text',
  'created_at': 'Date',
  'expires_at': 'Date',
  'last_contacted_at': 'Date'
};
```

#### Table "DodoPartage Contacts"
```javascript
const contactFields = {
  'id': 'Auto Number',
  'announcement_id': {
    'type': 'Link to another record',
    'linkedTableId': 'DodoPartage Announcements'
  },
  'contact_name': 'Single line text',
  'contact_email': 'Email',
  'message': 'Long text',
  'contacted_at': 'Date',
  'ip_address': 'Single line text'
};
```

## Templates d'emails

### Email de validation
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Validation de votre annonce - DodoPartage</title>
</head>
<body style="font-family: 'Lato', Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-family: 'Roboto Slab', serif; font-size: 24px; margin: 0;">
        DodoPartage
      </h1>
      <p style="color: #64748b; margin: 8px 0 0 0;">Groupage collaboratif multi-destinations</p>
    </div>
    
    <h2 style="color: #334155; font-size: 20px; margin-bottom: 20px;">
      Validez votre annonce
    </h2>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
      Bonjour <strong>{{contactName}}</strong>,
    </p>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
      Votre annonce de <strong>{{type}}</strong> pour un trajet 
      <strong>{{departureCountry}} → {{arrivalCountry}}</strong> a bien été reçue.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{validationUrl}}" 
         style="background: #F47D6C; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Valider mon annonce
      </a>
    </div>
    
    <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <h3 style="color: #334155; font-size: 16px; margin: 0 0 15px 0;">Récapitulatif de votre annonce :</h3>
      <ul style="color: #475569; margin: 0; padding-left: 20px;">
        <li><strong>Type :</strong> {{typeLabel}}</li>
        <li><strong>Trajet :</strong> {{departureCountry}} → {{arrivalCountry}}</li>
        <li><strong>Volume :</strong> {{volume}} {{volumeUnit}}</li>
        <li><strong>Date :</strong> {{date}}</li>
        {{#if price}}<li><strong>Tarif :</strong> {{price}}€</li>{{/if}}
      </ul>
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
      Une fois validée, votre annonce sera visible publiquement et vous recevrez un email avec un lien de gestion personnalisé.
    </p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
        Ce lien est valide 24h. Si vous n'avez pas demandé cette validation, ignorez cet email.
      </p>
    </div>
  </div>
</body>
</html>
```

### Email de confirmation (post-validation)
```html
<!DOCTYPE html>
<html>
<body style="font-family: 'Lato', Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-family: 'Roboto Slab', serif; font-size: 24px; margin: 0;">
        DodoPartage
      </h1>
      <div style="background: #dcfce7; color: #166534; padding: 12px 20px; border-radius: 8px; margin-top: 20px;">
        ✅ Votre annonce est maintenant en ligne !
      </div>
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
      Bonjour <strong>{{contactName}}</strong>,
    </p>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
      Parfait ! Votre annonce est maintenant publiée sur DodoPartage et visible par tous les utilisateurs.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{adminUrl}}" 
         style="background: #3b82f6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Gérer mon annonce
      </a>
    </div>
    
    <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">🔒 Lien de gestion important</h3>
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        Conservez précieusement ce lien pour modifier ou supprimer votre annonce à tout moment.
        Votre annonce expirera automatiquement le <strong>{{expiresAt}}</strong>.
      </p>
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
      Vous recevrez une notification par email lorsque quelqu'un souhaitera vous contacter via votre annonce.
    </p>
  </div>
</body>
</html>
```

## Variables d'environnement

### Côté frontend (Next.js)
```env
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr
```

### Côté backend (à ajouter)
```env
# Airtable DodoPartage (tables supplémentaires)
AIRTABLE_DODO_PARTAGE_TABLE_ID=tbl...
AIRTABLE_DODO_PARTAGE_CONTACTS_TABLE_ID=tbl...

# Frontend DodoPartage
DODO_PARTAGE_FRONTEND_URL=http://localhost:3000  # ou https://partage.dodomove.fr
```

## Rate limiting et sécurité

### Limitations par endpoint
```javascript
// Rate limiting recommandé
const rateLimits = {
  '/api/dodo-partage/submit': '3 per hour per IP',
  '/api/dodo-partage/contact': '10 per hour per IP',
  '/api/dodo-partage/announcements': '60 per minute per IP'
};
```

### Validation côté serveur
```javascript
// Validation des données d'annonce
const announcementSchema = {
  type: ['offer', 'request'],
  contactName: { type: 'string', minLength: 2, maxLength: 50 },
  contactEmail: { type: 'email' },
  departureCountry: { type: 'string', enum: DODOMOVE_COUNTRIES },
  arrivalCountry: { type: 'string', enum: DODOMOVE_COUNTRIES },
  volume: { type: 'number', min: 0.1, max: 100 },
  date: { type: 'date', min: 'today' }
};
```

## Tests d'intégration

### Points de test essentiels
1. **Soumission d'annonce** → Stockage Airtable correct
2. **Email de validation** → Réception et liens fonctionnels
3. **Activation d'annonce** → Changement de statut
4. **Récupération filtrée** → API performante
5. **Mise en relation** → Emails de contact corrects
6. **Expiration automatique** → Cron job fonctionnel

Cette intégration garantit la cohérence avec l'écosystème Dodomove tout en maintenant une séparation claire des responsabilités. 