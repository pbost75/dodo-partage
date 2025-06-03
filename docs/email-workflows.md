# Workflows d'emails - DodoPartage

## Vue d'ensemble

DodoPartage utilise Resend (via le backend centralisé) pour tous les emails automatiques. Cette documentation détaille chaque workflow d'email, leurs déclencheurs et leurs templates.

## Configuration Resend

**Service** : Resend (déjà configuré dans le backend centralisé)  
**Domaine d'envoi** : `noreply@dodomove.fr` (cohérent avec l'écosystème)  
**Intégration** : Via backend centralisé Railway

## Types d'emails

### 1. Email de validation d'annonce

**Déclencheur** : Soumission d'une nouvelle annonce  
**Destinataire** : Créateur de l'annonce  
**Objectif** : Double opt-in pour validation

#### Workflow
1. Utilisateur soumet le formulaire d'annonce
2. Backend génère un `validationToken` unique
3. Annonce stockée avec status "pending"
4. Email envoyé immédiatement
5. Clic sur lien → API `/validate` → Status "active"

#### Template variables
```javascript
{
  contactName: "Jean",
  type: "offer", // ou "request"
  typeLabel: "Propose de la place", // ou "Cherche une place"
  departureCountry: "France",
  arrivalCountry: "Réunion",
  volume: 2.5,
  volumeUnit: "m³",
  date: "15 mars 2024",
  price: 150, // optionnel
  validationUrl: "https://partage.dodomove.fr/validation/TOKEN_UUID"
}
```

#### Expiration
- **Lien valide** : 24 heures
- **Action si non validé** : Suppression automatique de l'annonce

### 2. Email de confirmation (post-validation)

**Déclencheur** : Validation réussie d'une annonce  
**Destinataire** : Créateur de l'annonce  
**Objectif** : Confirmation + lien de gestion

#### Workflow
1. Clic sur lien de validation
2. Status annonce → "active"
3. Génération d'un `adminToken` unique
4. Email de confirmation envoyé
5. Annonce visible publiquement

#### Template variables
```javascript
{
  contactName: "Jean",
  announcementId: "uuid-123",
  adminUrl: "https://partage.dodomove.fr/gestion/ADMIN_TOKEN_UUID",
  expiresAt: "20 mars 2024",
  publicUrl: "https://partage.dodomove.fr?id=uuid-123"
}
```

### 3. Email de mise en relation

**Déclencheur** : Formulaire de contact rempli  
**Destinataire** : Propriétaire de l'annonce  
**Objectif** : Notification de contact avec coordonnées du demandeur

#### Workflow
1. Visiteur clique "Contacter" sur une annonce
2. Remplit formulaire de contact
3. Backend valide les données
4. Email envoyé au propriétaire de l'annonce
5. Log du contact dans Airtable

#### Template variables
```javascript
{
  // Propriétaire de l'annonce (destinataire)
  ownerName: "Jean",
  
  // Détails de l'annonce
  announcementType: "Propose de la place",
  departureCountry: "France",
  arrivalCountry: "Réunion",
  volume: 2.5,
  volumeUnit: "m³",
  date: "15 mars 2024",
  
  // Contacteur
  contactName: "Marie",
  contactEmail: "marie@example.com",
  contactMessage: "Bonjour, je suis intéressée par...",
  
  // Gestion
  adminUrl: "https://partage.dodomove.fr/gestion/ADMIN_TOKEN",
  replyToEmail: "marie@example.com"
}
```

### 4. Email de relance avant expiration

**Déclencheur** : 3 jours avant expiration de l'annonce  
**Destinataire** : Propriétaire de l'annonce  
**Objectif** : Proposer prolongation/modification/suppression

#### Workflow
1. Cron job quotidien vérifie les expirations
2. Annonces expirant dans 3 jours → Email de relance
3. Liens d'action dans l'email
4. Si aucune action → Expiration automatique

#### Template variables
```javascript
{
  contactName: "Jean",
  announcementType: "Propose de la place",
  departureCountry: "France",
  arrivalCountry: "Réunion",
  expiresAt: "18 janvier 2024",
  daysRemaining: 3,
  
  // Actions possibles
  extendUrl: "https://partage.dodomove.fr/gestion/TOKEN/extend",
  editUrl: "https://partage.dodomove.fr/gestion/TOKEN/edit",
  deleteUrl: "https://partage.dodomove.fr/gestion/TOKEN/delete",
  adminUrl: "https://partage.dodomove.fr/gestion/TOKEN"
}
```

### 5. Email de récupération de lien d'administration

**Déclencheur** : Formulaire "Retrouver mon annonce"  
**Destinataire** : Propriétaire de l'annonce  
**Objectif** : Renvoyer le lien de gestion perdu

#### Workflow
1. Utilisateur clique "Retrouver mon annonce"
2. Saisit son email
3. Recherche des annonces actives pour cet email
4. Email avec liens de gestion

#### Template variables
```javascript
{
  contactName: "Jean",
  announcements: [
    {
      id: "uuid-123",
      type: "offer",
      typeLabel: "Propose de la place",
      departureCountry: "France",
      arrivalCountry: "Réunion",
      createdAt: "10 janvier 2024",
      expiresAt: "20 mars 2024",
      adminUrl: "https://partage.dodomove.fr/gestion/TOKEN_1"
    }
  ]
}
```

## Templates techniques

### Structure commune des emails

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}} - DodoPartage</title>
  <style>
    /* Styles cohérents avec Dodomove */
    .button-primary {
      background: #F47D6C;
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
    }
    .button-secondary {
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
    }
  </style>
</head>
<body style="font-family: 'Lato', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
  <!-- Header DodoPartage -->
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; font-family: 'Roboto Slab', serif; font-size: 24px; margin: 0;">
        DodoPartage
      </h1>
      <p style="color: #64748b; margin: 8px 0 0 0;">Groupage collaboratif multi-destinations</p>
    </div>
    
    <!-- Contenu spécifique -->
    {{content}}
    
    <!-- Footer -->
    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">
        <a href="https://dodomove.fr" style="color: #3b82f6; text-decoration: none;">
          Retour sur Dodomove.fr
        </a>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © 2024 Dodomove - Déménagement international DOM-TOM
      </p>
    </div>
  </div>
</body>
</html>
```

### Configuration technique

#### Paramètres Resend
```javascript
const emailConfig = {
  from: 'DodoPartage <noreply@dodomove.fr>',
  replyTo: 'contact@dodomove.fr', // Pour les emails de contact
  tags: ['dodo-partage', 'production'],
  headers: {
    'X-Entity-Ref-ID': 'dodo-partage-{{type}}-{{uuid}}'
  }
};
```

#### Gestion des erreurs
```javascript
const emailErrorHandling = {
  maxRetries: 3,
  retryDelay: 5000, // 5 secondes
  fallbackEmail: 'admin@dodomove.fr',
  logFailures: true,
  alertOnCriticalFailure: ['validation', 'contact']
};
```

## Monitoring et analytics

### Métriques à suivre
- **Taux d'ouverture** des emails de validation
- **Taux de clic** sur les liens de validation
- **Délai moyen** entre envoi et validation
- **Nombre de contacts** générés par annonce
- **Taux de récupération** de liens d'administration

### Logs Airtable
Chaque email envoyé doit être logué dans une table dédiée :

#### Table "DodoPartage Email Logs"
```javascript
const emailLogFields = {
  'id': 'Auto Number',
  'announcement_id': 'Link to another record',
  'email_type': {
    'type': 'Single select',
    'options': ['validation', 'confirmation', 'contact', 'reminder', 'recovery']
  },
  'recipient_email': 'Email',
  'sent_at': 'Date',
  'resend_id': 'Single line text',
  'status': {
    'type': 'Single select', 
    'options': ['sent', 'delivered', 'opened', 'clicked', 'failed']
  },
  'error_message': 'Long text'
};
```

## Tests des workflows

### Tests automatisés essentiels
1. **Validation email** : Génération token + envoi + validation
2. **Contact** : Formulaire → Email au propriétaire
3. **Relance** : Détection expiration → Email + actions
4. **Récupération** : Email → Recherche annonces → Envoi liens
5. **Rate limiting** : Protection contre spam

### Tests manuels
- Réception emails dans différents clients (Gmail, Outlook, Apple Mail)
- Liens fonctionnels sur mobile et desktop
- Cohérence graphique avec l'identité Dodomove
- Temps de livraison des emails

Cette architecture d'emails garantit une expérience utilisateur fluide tout en maintenant la sécurité et la traçabilité nécessaires. 