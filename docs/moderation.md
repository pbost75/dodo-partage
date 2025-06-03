# Système de modération - DodoPartage

## Vue d'ensemble

Le système de modération de DodoPartage est conçu pour maintenir un environnement sûr et de qualité tout en préservant la simplicité d'utilisation. Il combine filtrage automatique, limitations techniques et outils de signalement.

## Niveaux de protection

### 1. Protection préventive (avant publication)

#### Double opt-in obligatoire
- **Validation email** requise avant publication
- **Token unique** généré pour chaque annonce
- **Expiration automatique** si non validé (24h)

#### Validation des données
```javascript
const validationRules = {
  contactName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/, // Lettres, espaces, tirets, apostrophes
    blacklist: ['admin', 'test', 'spam']
  },
  contactEmail: {
    format: 'email',
    blacklist: [
      '@example.com',
      '@test.com',
      '@tempmail.org',
      '@guerrillamail.com'
    ]
  },
  objectTypes: {
    maxLength: 200,
    blacklist: FORBIDDEN_WORDS,
    requiresReview: REVIEW_WORDS
  },
  description: {
    maxLength: 500,
    blacklist: FORBIDDEN_WORDS,
    requiresReview: REVIEW_WORDS
  }
};
```

#### Liste noire de mots interdits
```javascript
const FORBIDDEN_WORDS = [
  // Coordonnées directes
  'tel', 'téléphone', 'mobile', 'appel', 'whatsapp', 'telegram',
  '06', '07', '+33', '+262', '+590', '+594', '+596', '+269',
  
  // Emails/réseaux sociaux
  '@', 'gmail', 'yahoo', 'hotmail', 'facebook', 'instagram',
  'messenger', 'signal', 'viber',
  
  // Objets illicites
  'drogue', 'cannabis', 'cocaïne', 'héroïne', 'stupéfiant',
  'arme', 'fusil', 'pistolet', 'munition', 'explosif',
  'contrefaçon', 'faux', 'copie', 'pirate',
  
  // Arnaques courantes
  'nigerian', 'inheritance', 'lottery', 'winner', 'million',
  'urgent', 'western union', 'moneygram', 'bitcoin',
  
  // Spam/promotion
  'viagra', 'casino', 'porn', 'sex', 'adulte',
  'promo', 'reduction', 'gratuit', 'cadeau',
  
  // Contournement
  'tel:', 'mailto:', 'http:', 'www.', '.com', '.fr'
];
```

#### Mots nécessitant révision manuelle
```javascript
const REVIEW_WORDS = [
  // Objets de valeur (risque d'arnaque)
  'or', 'bijoux', 'diamant', 'rolex', 'luxe', 'cher',
  'antique', 'collection', 'art', 'tableau',
  
  // Animaux (réglementation)
  'animal', 'chien', 'chat', 'oiseau', 'reptile',
  
  // Substances réglementées
  'medicament', 'pilule', 'sirop', 'alcool', 'tabac',
  'parfum', 'cosmetique', 'creme',
  
  // Transport dangereux
  'liquide', 'aerosol', 'gaz', 'batterie', 'pile',
  'produit chimique', 'peinture', 'essence'
];
```

### 2. Protection technique (rate limiting)

#### Limitations par IP
```javascript
const rateLimits = {
  // Soumission d'annonces
  'submit_announcement': {
    window: '1h',
    max: 3,
    message: 'Maximum 3 annonces par heure'
  },
  
  // Contacts
  'contact_announcer': {
    window: '1h', 
    max: 10,
    message: 'Maximum 10 contacts par heure'
  },
  
  // Consultation
  'view_announcements': {
    window: '1m',
    max: 60,
    message: 'Trop de requêtes, veuillez patienter'
  },
  
  // Validation
  'validate_announcement': {
    window: '1h',
    max: 5,
    message: 'Trop de tentatives de validation'
  }
};
```

#### Limitations par email
```javascript
const emailLimits = {
  // Annonces actives par email
  'active_announcements': {
    max: 5,
    message: 'Maximum 5 annonces actives par email'
  },
  
  // Nouvelles annonces par jour
  'daily_submissions': {
    window: '24h',
    max: 2,
    message: 'Maximum 2 nouvelles annonces par jour'
  }
};
```

### 3. Honeypot anti-bot

#### Champ invisible
```html
<!-- Champ caché pour détecter les bots -->
<div style="position: absolute; left: -9999px;">
  <label for="website">Site web (ne pas remplir)</label>
  <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
</div>
```

#### Validation côté serveur
```javascript
const validateHoneypot = (formData) => {
  // Si le champ honeypot est rempli = bot détecté
  if (formData.website && formData.website.trim() !== '') {
    return {
      isBot: true,
      action: 'block',
      message: 'Requête automatisée détectée'
    };
  }
  return { isBot: false };
};
```

### 4. Protection comportementale

#### Détection de patterns suspects
```javascript
const suspiciousPatterns = {
  // Même contenu répété
  duplicateContent: {
    check: (announcement, existingAnnouncements) => {
      const similarity = calculateSimilarity(
        announcement.description,
        existingAnnouncements.map(a => a.description)
      );
      return similarity > 0.8;
    },
    action: 'review'
  },
  
  // Soumissions trop rapides
  rapidSubmission: {
    check: (formData, submissionTime) => {
      // Temps minimum pour remplir le formulaire
      return submissionTime < 30000; // 30 secondes
    },
    action: 'delay'
  },
  
  // Coordonnées déguisées
  hiddenContacts: {
    patterns: [
      /\b0\s*6\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\b/, // "0 6 12 34 56 78"
      /\bsix\s*zéro\s*\d+/, // "six zéro 123456"
      /\b\w+\s*arobase\s*\w+/, // "jean arobase gmail"
      /\b\w+\s*at\s*\w+\s*dot\s*\w+/ // "jean at gmail dot com"
    ],
    action: 'block'
  }
};
```

## Système de signalement

### Interface de signalement
```html
<!-- Bouton discret sur chaque annonce -->
<button class="text-gray-400 hover:text-red-500 text-sm" 
        onclick="openReportModal('{{announcementId}}')">
  🚨 Signaler
</button>
```

### Modal de signalement
```html
<div id="reportModal" class="modal">
  <div class="modal-content">
    <h3>Signaler cette annonce</h3>
    <form id="reportForm">
      <input type="hidden" name="announcementId" value="">
      
      <label>Motif du signalement :</label>
      <select name="reason" required>
        <option value="">Sélectionnez un motif</option>
        <option value="inappropriate_content">Contenu inapproprié</option>
        <option value="contact_info">Coordonnées en clair</option>
        <option value="illegal_items">Objets illicites</option>
        <option value="spam">Spam/Publicité</option>
        <option value="scam">Arnaque suspectée</option>
        <option value="duplicate">Annonce en double</option>
        <option value="other">Autre</option>
      </select>
      
      <label>Détails (optionnel) :</label>
      <textarea name="details" maxlength="500" 
                placeholder="Précisez le problème rencontré"></textarea>
      
      <div class="form-actions">
        <button type="button" onclick="closeReportModal()">Annuler</button>
        <button type="submit">Signaler</button>
      </div>
    </form>
  </div>
</div>
```

### Traitement des signalements

#### Table Airtable "DodoPartage Reports"
```javascript
const reportFields = {
  'id': 'Auto Number',
  'announcement_id': 'Link to another record',
  'reporter_ip': 'Single line text',
  'reason': {
    'type': 'Single select',
    'options': [
      'inappropriate_content',
      'contact_info', 
      'illegal_items',
      'spam',
      'scam',
      'duplicate',
      'other'
    ]
  },
  'details': 'Long text',
  'reported_at': 'Date',
  'status': {
    'type': 'Single select',
    'options': ['pending', 'reviewed', 'action_taken', 'dismissed']
  },
  'reviewer_notes': 'Long text',
  'action_taken': {
    'type': 'Single select',
    'options': ['none', 'warning', 'content_edit', 'suspension', 'deletion']
  }
};
```

#### Workflow de traitement
1. **Signalement reçu** → Stockage dans Airtable
2. **Seuil critique** (3 signalements) → Suspension automatique temporaire
3. **Notification admin** → Email d'alerte pour révision
4. **Révision manuelle** → Décision et action
5. **Notification propriétaire** → Email d'information

## Back-office de modération

### Dashboard admin
- **Annonces en attente** de révision
- **Signalements récents** par priorité
- **Statistiques** de modération
- **Logs d'actions** prises

### Actions possibles
```javascript
const moderationActions = {
  'approve': 'Approuver l\'annonce',
  'edit': 'Modifier le contenu',
  'suspend': 'Suspendre temporairement',
  'delete': 'Supprimer définitivement',
  'blacklist_email': 'Blacklister l\'email',
  'blacklist_ip': 'Blacklister l\'IP'
};
```

### Notifications automatiques
```javascript
const moderationNotifications = {
  // Alerte immédiate
  'critical_keywords': {
    words: ['arme', 'drogue', 'arnaque'],
    action: 'immediate_suspension',
    notify: 'admin@dodomove.fr'
  },
  
  // Révision dans les 24h
  'review_needed': {
    triggers: ['multiple_reports', 'suspicious_pattern'],
    deadline: '24h',
    notify: 'moderation@dodomove.fr'
  }
};
```

## Métriques de modération

### KPIs à suivre
- **Taux de validation** des nouvelles annonces
- **Délai moyen** de traitement des signalements
- **Taux de faux positifs** (annonces légitimes supprimées)
- **Évolution** des tentatives de spam
- **Satisfaction utilisateur** après modération

### Tableau de bord
```javascript
const moderationMetrics = {
  daily: {
    submitted: 0,
    validated: 0,
    rejected: 0,
    reported: 0,
    processed: 0
  },
  
  quality: {
    spam_detection_rate: 0,
    false_positive_rate: 0,
    user_satisfaction: 0
  }
};
```

## Évolution et améliorations

### Machine Learning (futur)
- **Classification automatique** des contenus suspects
- **Détection d'anomalies** comportementales
- **Score de confiance** pour chaque annonce

### Modération communautaire
- **Système de karma** pour les utilisateurs réguliers
- **Modérateurs bénévoles** avec privilèges limités
- **Votes de confiance** de la communauté

Cette approche multicouche garantit un équilibre entre sécurité et facilité d'utilisation, tout en évitant la surmodération qui pourrait nuire à l'expérience utilisateur. 