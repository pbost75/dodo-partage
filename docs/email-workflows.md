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
  announcementType: "Propose de la place", // "Propose de la place" ou "Cherche une place"
  announcementTypeSlug: "offer", // "offer" ou "request"
  departureCountry: "France",
  arrivalCountry: "Réunion",
  volume: 2.5,
  volumeUnit: "m³",
  date: "15 mars 2024",
  
  // Contacteur
  contactName: "Marie",
  contactEmail: "marie@example.com",
  contactPhone: "+33612345678", // Nouveau - numéro WhatsApp (optionnel)
  contactMessage: "Bonjour, je suis intéressée par...",
  
  // Gestion
  adminUrl: "https://partage.dodomove.fr/gestion/ADMIN_TOKEN",
  replyToEmail: "marie@example.com",
  
  // WhatsApp (généré côté backend si contactPhone fourni)
  whatsappUrl: "https://wa.me/33612345678?text=...", // URL complète avec message pré-rempli
  hasWhatsApp: true // Boolean pour afficher/masquer le bouton
}
```

#### Génération de l'URL WhatsApp

Si un numéro WhatsApp est fourni (`contactPhone`), le backend doit générer l'URL avec un message pré-rempli :

**Pour une annonce "offer" (Propose de la place)** :
```javascript
const whatsappMessage = `Bonjour ${contactName}, je vous contacte suite à votre demande sur DodoPartage concernant mon annonce de partage de conteneur.`;
```

**Pour une annonce "request" (Cherche une place)** :
```javascript  
const whatsappMessage = `Bonjour ${contactName}, je vous contacte suite à votre message sur DodoPartage au sujet de votre recherche de place dans un conteneur.`;
```

**Construction finale de l'URL** :
```javascript
const cleanPhone = contactPhone.replace(/[^0-9]/g, ''); // Supprimer les caractères non numériques
const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
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
    .button-whatsapp {
      background: #25D366;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 15px;
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

### Template Email de Mise en Relation avec WhatsApp

```html
<!-- Template spécifique pour l'email de contact avec bouton WhatsApp -->
<div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
  <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">
    📬 Nouveau contact pour votre annonce
  </h2>
  <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">
    {{announcementType}} • {{departureCountry}} → {{arrivalCountry}} • {{volume}}{{volumeUnit}}
  </p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">
    Message de {{contactName}}
  </h3>
  <div style="background: white; border-left: 4px solid #F47D6C; padding: 20px; border-radius: 8px;">
    <p style="color: #374151; margin: 0; line-height: 1.6;">
      {{contactMessage}}
    </p>
  </div>
</div>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
  <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">
    Coordonnées de contact
  </h3>
  
  <div style="margin-bottom: 12px;">
    <strong style="color: #1f2937;">Email :</strong>
    <a href="mailto:{{contactEmail}}" style="color: #3b82f6; text-decoration: none; margin-left: 8px;">
      {{contactEmail}}
    </a>
  </div>
  
  {{#if hasWhatsApp}}
  <div style="margin-bottom: 12px;">
    <strong style="color: #1f2937;">WhatsApp :</strong>
    <span style="color: #64748b; margin-left: 8px;">{{contactPhone}}</span>
  </div>
  {{/if}}
</div>

<!-- Actions de réponse -->
<div style="text-align: center; margin: 30px 0;">
  <!-- Bouton email principal -->
  <a href="mailto:{{contactEmail}}?subject=Re: {{announcementType}} {{departureCountry}} → {{arrivalCountry}}" 
     class="button-primary" 
     style="margin-right: 15px;">
    ✉️ Répondre par email
  </a>
  
  {{#if hasWhatsApp}}
  <!-- Bouton WhatsApp (si numéro fourni) -->
  <a href="{{whatsappUrl}}" 
     class="button-whatsapp" 
     target="_blank">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
    </svg>
    Répondre via WhatsApp
  </a>
  {{/if}}
</div>

{{#if hasWhatsApp}}
<div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <p style="color: #065f46; margin: 0; font-size: 14px; text-align: center;">
    💡 <strong>Astuce :</strong> WhatsApp permet une communication plus rapide et directe avec {{contactName}}
  </p>
</div>
{{/if}}

<!-- Lien de gestion -->
<div style="text-align: center; margin-top: 30px;">
  <a href="{{adminUrl}}" style="color: #64748b; text-decoration: none; font-size: 14px;">
    🔧 Gérer mon annonce
  </a>
</div>
```

### Exemples d'URLs WhatsApp générées

#### Exemple 1 : Contact pour une annonce "Propose de la place"
```javascript
// Données d'entrée
const contactName = "Marie";
const contactPhone = "+33612345678";
const announcementTypeSlug = "offer";

// Message généré
const message = "Bonjour Marie, je vous contacte suite à votre demande sur DodoPartage concernant mon annonce de partage de conteneur.";

// URL finale
const whatsappUrl = "https://wa.me/33612345678?text=Bonjour%20Marie%2C%20je%20vous%20contacte%20suite%20%C3%A0%20votre%20demande%20sur%20DodoPartage%20concernant%20mon%20annonce%20de%20partage%20de%20conteneur.";
```

#### Exemple 2 : Contact pour une annonce "Cherche une place"
```javascript
// Données d'entrée  
const contactName = "Pierre";
const contactPhone = "+596596123456";
const announcementTypeSlug = "request";

// Message généré
const message = "Bonjour Pierre, je vous contacte suite à votre message sur DodoPartage au sujet de votre recherche de place dans un conteneur.";

// URL finale
const whatsappUrl = "https://wa.me/596596123456?text=Bonjour%20Pierre%2C%20je%20vous%20contacte%20suite%20%C3%A0%20votre%20message%20sur%20DodoPartage%20au%20sujet%20de%20votre%20recherche%20de%20place%20dans%20un%20conteneur.";
```

### Notes d'implémentation backend

Le backend centralisé doit :

1. **Recevoir le numéro de téléphone** dans la requête de contact
2. **Valider le format** du numéro (optionnel mais recommandé)
3. **Générer l'URL WhatsApp** avec le message adapté selon le type d'annonce
4. **Inclure les nouvelles variables** dans le template email
5. **Logger les contacts WhatsApp** pour analytics

Cette architecture d'emails garantit une expérience utilisateur fluide tout en maintenant la sécurité et la traçabilité nécessaires. 