# Système d'alertes email - DodoPartage

Ce guide explique le fonctionnement du système d'alertes par email qui permet aux utilisateurs d'être notifiés automatiquement lorsque de nouvelles annonces correspondent à leurs critères de recherche.

## Vue d'ensemble

Le système d'alertes permet aux utilisateurs de :
- ✅ **Configurer des alertes personnalisées** basées sur leurs critères de recherche
- ✅ **Recevoir des notifications par email** dès qu'une annonce correspond
- ✅ **Gérer leurs alertes** (modifier, supprimer, désactiver)
- ✅ **Filtrer précisément** (lieu, type, volume, etc.)

## Interface utilisateur

### Bouton d'alerte

Le bouton "🔔 Créer une alerte" se trouve à côté du CTA "Déposer une annonce" dans l'en-tête des annonces.

#### Caractéristiques visuelles :
- **Icône** : Cloche (Bell) de Lucide React
- **Style** : Bouton outline avec couleur primaire #F47D6C
- **Position** : À gauche du bouton "Déposer une annonce"
- **Responsive** : S'adapte sur mobile et desktop

#### Comportement :
```typescript
// Déclenchement de l'alerte avec filtres actuels
const handleCreateAlert = () => {
  const initialAlertFilters = {
    departure: appliedDeparture,
    destination: appliedDestination,
    type: filters.type === 'offer' ? 'offer' : filters.type === 'request' ? 'request' : 'all'
  };
  setIsAlertModalOpen(true);
};
```

### Modal de configuration

#### Structure du formulaire :

1. **Informations de base**
   - Nom de l'alerte (obligatoire)
   - Email de notification (obligatoire)

2. **Critères de recherche**
   - Lieu de départ
   - Destination
   - Type d'annonce (offres/demandes)
   - Volume min/max (optionnel)

3. **Validation**
   - Au moins le lieu (départ ET destination) requis
   - Format d'email valide
   - Nom d'alerte non vide

#### États de la modal :
- **Formulaire** : Saisie des critères
- **Succès** : Confirmation de création
- **Chargement** : Pendant l'enregistrement

## Architecture technique

### Composants

#### AlertModal.tsx
```typescript
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: {
    departure?: string;
    destination?: string;
    type?: string;
  };
}
```

**Fonctionnalités :**
- Formulaire multi-étapes avec validation
- Pré-remplissage avec filtres actuels
- Animations Framer Motion
- Gestion d'erreurs complète
- Interface responsive

#### Intégration dans HomePage
```typescript
// État de la modal
const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

// Pré-remplissage avec filtres actuels
const initialAlertFilters = {
  departure: appliedDeparture,
  destination: appliedDestination,
  type: filters.type
};
```

### Structure des données

#### Interface AlertFormData
```typescript
interface AlertFormData {
  email: string;           // Email de notification
  departure: string;       // Code pays de départ
  destination: string;     // Code pays de destination
  type: string;           // 'all' | 'offer' | 'request'
  volumeMin: string;      // Volume minimum (optionnel)
  volumeMax: string;      // Volume maximum (optionnel)
  alertName: string;      // Nom de l'alerte
}
```

## Backend et API

### Endpoint pour créer une alerte

```typescript
// POST /api/alerts
{
  "alertName": "Conteneur vers la Réunion",
  "email": "user@example.com",
  "criteria": {
    "departure": "france",
    "destination": "reunion",
    "type": "offer",
    "volumeMin": 1.0,
    "volumeMax": 5.0
  }
}
```

### Base de données

#### Table : alerts
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  alert_name VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_notification_at TIMESTAMP,
  total_notifications INTEGER DEFAULT 0
);
```

#### Table : alert_notifications
```sql
CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id),
  announcement_id UUID NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  email_status VARCHAR(50) DEFAULT 'sent'
);
```

### Logique de matching

#### Algorithme de correspondance :
```typescript
function matchesAlert(announcement: Announcement, alert: Alert): boolean {
  const criteria = alert.criteria;
  
  // Vérifier le départ (si spécifié)
  if (criteria.departure && 
      normalizeLocation(announcement.departure) !== criteria.departure) {
    return false;
  }
  
  // Vérifier la destination (si spécifiée)
  if (criteria.destination && 
      normalizeLocation(announcement.arrival) !== criteria.destination) {
    return false;
  }
  
  // Vérifier le type
  if (criteria.type !== 'all' && announcement.type !== criteria.type) {
    return false;
  }
  
  // Vérifier le volume (si spécifié)
  if (criteria.volumeMin || criteria.volumeMax) {
    const announcementVolume = parseFloat(announcement.volume);
    if (criteria.volumeMin && announcementVolume < criteria.volumeMin) {
      return false;
    }
    if (criteria.volumeMax && announcementVolume > criteria.volumeMax) {
      return false;
    }
  }
  
  return true;
}
```

## Workflow des notifications

### 1. Création d'annonce
```typescript
// Lors de la publication d'une nouvelle annonce
async function onNewAnnouncement(announcement: Announcement) {
  // Trouver les alertes correspondantes
  const matchingAlerts = await findMatchingAlerts(announcement);
  
  // Envoyer les notifications
  for (const alert of matchingAlerts) {
    await sendAlertNotification(alert, announcement);
  }
}
```

### 2. Template d'email
```html
<!-- Template email d'alerte -->
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #243163, #1e2951); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🔔 Nouvelle annonce trouvée !</h1>
    <p style="color: #ccc; margin: 10px 0 0 0;">DodoPartage</p>
  </div>
  
  <div style="padding: 30px; background: white;">
    <h2 style="color: #243163; margin-top: 0;">{{announcement.title}}</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📍 Trajet :</strong> {{announcement.departure}} → {{announcement.arrival}}</p>
      <p><strong>📦 Volume :</strong> {{announcement.volume}}</p>
      <p><strong>📅 Date :</strong> {{announcement.date}}</p>
      {{#if announcement.price}}
      <p><strong>💰 Prix :</strong> {{announcement.price}}</p>
      {{/if}}
    </div>
    
    <p>{{announcement.description | truncate: 200}}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{announcement.url}}" 
         style="background: #F47D6C; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Voir l'annonce
      </a>
    </div>
  </div>
  
  <div style="padding: 20px; background: #f8f9fa; text-align: center; color: #666;">
    <p>Cette alerte : <strong>{{alert.alertName}}</strong></p>
    <p>
      <a href="{{unsubscribeUrl}}">Gérer mes alertes</a> | 
      <a href="{{unsubscribeUrl}}">Me désabonner</a>
    </p>
  </div>
</div>
```

### 3. Gestion des envois
```typescript
async function sendAlertNotification(alert: Alert, announcement: Announcement) {
  try {
    // Vérifier si déjà notifié pour cette annonce
    const alreadyNotified = await checkIfAlreadyNotified(alert.id, announcement.id);
    if (alreadyNotified) return;
    
    // Préparer l'email
    const emailData = {
      to: alert.user_email,
      subject: `🔔 Nouvelle annonce : ${announcement.title}`,
      template: 'alert-notification',
      data: {
        alert,
        announcement,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/alerts/unsubscribe/${alert.id}`
      }
    };
    
    // Envoyer via Resend
    await sendEmail(emailData);
    
    // Enregistrer la notification
    await createNotificationRecord(alert.id, announcement.id);
    
    // Mettre à jour les statistiques
    await updateAlertStats(alert.id);
    
  } catch (error) {
    console.error('Erreur envoi notification:', error);
  }
}
```

## Gestion des alertes

### Page de gestion des alertes

#### Route : `/alerts/manage/:token`
- Liste des alertes actives
- Possibilité de modifier/supprimer
- Statistiques (nb notifications reçues)
- Historique des annonces notifiées

#### Fonctionnalités :
```typescript
// Actions possibles sur les alertes
interface AlertActions {
  pause(): void;        // Mettre en pause
  resume(): void;       // Reprendre
  edit(): void;         // Modifier les critères
  delete(): void;       // Supprimer définitivement
  duplicate(): void;    // Dupliquer avec nouveaux critères
}
```

### Désabonnement

#### Lien de désabonnement sécurisé
```typescript
// Token JWT avec expiration
const unsubscribeToken = jwt.sign(
  { alertId: alert.id, action: 'unsubscribe' },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/alerts/unsubscribe/${unsubscribeToken}`;
```

## Performance et optimisation

### Indexation base de données
```sql
-- Index pour recherche rapide des alertes actives
CREATE INDEX idx_alerts_active ON alerts(is_active) WHERE is_active = true;

-- Index pour les critères de recherche
CREATE INDEX idx_alerts_criteria ON alerts USING GIN(criteria);

-- Index pour éviter les doublons de notification
CREATE UNIQUE INDEX idx_alert_notifications_unique 
ON alert_notifications(alert_id, announcement_id);
```

### Cache et rate limiting
```typescript
// Cache des alertes actives (Redis)
const CACHE_KEY = 'active_alerts';
const CACHE_TTL = 300; // 5 minutes

// Rate limiting par email
const RATE_LIMIT = {
  maxNotificationsPerHour: 10,
  maxNotificationsPerDay: 50
};
```

## Monitoring et analytics

### Métriques importantes
- Nombre d'alertes créées/jour
- Taux d'ouverture des emails
- Taux de clic vers les annonces
- Taux de désabonnement
- Performance des critères (quels filtres génèrent le plus de matches)

### Logs et debugging
```typescript
// Logging structuré
logger.info('Alert notification sent', {
  alertId: alert.id,
  announcementId: announcement.id,
  userEmail: alert.user_email,
  matchingCriteria: criteria,
  notificationId: notification.id
});
```

## Sécurité

### Protection des données
- ✅ Emails hashés en base
- ✅ Tokens JWT pour les actions sensibles
- ✅ Rate limiting anti-spam
- ✅ Validation stricte des critères
- ✅ RGPD compliant (consentement, suppression)

### Anti-spam
```typescript
// Validation des critères d'alerte
function validateAlertCriteria(criteria: AlertCriteria): boolean {
  // Empêcher les alertes trop larges
  if (!criteria.departure && !criteria.destination && criteria.type === 'all') {
    throw new Error('Critères trop larges - veuillez préciser au moins un filtre');
  }
  
  // Limiter le nombre d'alertes par email
  const maxAlertsPerEmail = 5;
  // ...
  
  return true;
}
```

## Tests

### Tests unitaires
```typescript
describe('Alert System', () => {
  it('should match announcement with alert criteria', () => {
    const announcement = createMockAnnouncement({
      departure: 'France métropolitaine',
      arrival: 'Réunion',
      type: 'offer'
    });
    
    const alert = createMockAlert({
      criteria: {
        departure: 'france',
        destination: 'reunion',
        type: 'offer'
      }
    });
    
    expect(matchesAlert(announcement, alert)).toBe(true);
  });
});
```

### Tests d'intégration
```typescript
describe('Alert Notifications E2E', () => {
  it('should send email when new matching announcement is created', async () => {
    // Créer une alerte
    const alert = await createAlert(mockAlertData);
    
    // Publier une annonce correspondante
    const announcement = await createAnnouncement(mockAnnouncementData);
    
    // Vérifier qu'un email a été envoyé
    await waitFor(() => {
      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: alert.user_email,
          subject: expect.stringContaining(announcement.title)
        })
      );
    });
  });
});
```

Ce système d'alertes améliore significativement l'expérience utilisateur en permettant une veille automatique des annonces correspondant aux besoins spécifiques de chaque utilisateur. 