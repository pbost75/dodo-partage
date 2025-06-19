# 📊 Structure Airtable - DodoPartage

Ce document centralise toutes les informations sur les tables Airtable utilisées dans l'écosystème DodoPartage.

## 🏗️ Configuration Générale

**Base Airtable :** `DodoPartage`
- **Base ID :** `appyuDiWXUzpy9DTT`
- **URL :** `https://airtable.com/appyuDiWXUzpy9DTT`

## 📋 Tables et Structures

### 1. 📧 Table "DodoPartage - Email Alert"

**Informations de la table :**
- **Table ID :** `tblVuVneCZTot07sB`
- **View ID :** `viw7ys2GOOVuk0qTD`
- **Usage :** Système d'alertes email pour notifications automatiques

**Structure des colonnes :**

| Nom de la colonne | Type Airtable | Options/Valeurs | Description | Obligatoire | Auto-généré |
|-------------------|---------------|-----------------|-------------|-------------|-------------|
| `type` | Single select | "offer", "request" | Type d'alerte (offre ou demande) | ✅ | ❌ |
| `departure` | Single line text | - | Lieu de départ (ex: "France") | ✅ | ❌ |
| `arrival` | Single line text | - | Lieu d'arrivée (ex: "Martinique") | ✅ | ❌ |
| `volume_min` | Number | Entier positif | Volume minimum requis en m³ | ✅ | ❌ |
| `email` | Email | Format email valide | Email pour recevoir les alertes | ✅ | ❌ |
| `status` | Single select | "Active", "Inactive" | Statut de l'alerte | ✅ | ✅ (défaut: "Active") |
| `created_at` | Date with time | Format ISO | Date de création de l'alerte | ✅ | ✅ |
| `unsubscribe_token` | Single line text | Token unique | Token pour désabonnement | ✅ | ✅ |

**Exemple d'enregistrement :**
```json
{
  "type": "request",
  "departure": "France",
  "arrival": "Martinique",
  "volume_min": 5,
  "email": "user@example.com",
  "status": "Active",
  "created_at": "2024-01-15T10:30:00.000Z",
  "unsubscribe_token": "alert_abc123def456"
}
```

**Vues recommandées :**
- **Vue "Alertes Actives"** : Filtre `status = "Active"`, tri par `created_at` décroissant
- **Vue "Par Trajet"** : Groupé par `departure` puis `arrival`
- **Vue "Récentes"** : Tri par `created_at` décroissant (toutes alertes)
- **Vue "Désabonnées"** : Filtre `status = "Inactive"`

### 2. 📦 Table "DodoPartage - Announcements" (Supposée)

**Informations de la table :**
- **Table ID :** `[À définir]`
- **Usage :** Stockage des annonces de partage de conteneurs

**Structure supposée des colonnes :**

| Nom de la colonne | Type Airtable | Options/Valeurs | Description | Obligatoire |
|-------------------|---------------|-----------------|-------------|-------------|
| `id` | Autonumber | - | Identifiant unique de l'annonce | ✅ |
| `type` | Single select | "offer", "request" | Type d'annonce | ✅ |
| `departure` | Single line text | - | Lieu de départ | ✅ |
| `arrival` | Single line text | - | Lieu d'arrivée | ✅ |
| `volume_available` | Number | - | Volume disponible/requis en m³ | ✅ |
| `shipping_date` | Date | - | Date d'expédition prévue | ✅ |
| `contact_email` | Email | - | Email de contact | ✅ |
| `contact_phone` | Phone number | - | Téléphone de contact | ❌ |
| `description` | Long text | - | Description détaillée | ❌ |
| `price_per_m3` | Currency | EUR | Prix par m³ | ❌ |
| `status` | Single select | "Active", "Completed", "Cancelled" | Statut de l'annonce | ✅ |
| `created_at` | Date with time | - | Date de création | ✅ |
| `updated_at` | Date with time | - | Dernière modification | ✅ |

## 🔗 Relations entre Tables

### Alertes ↔ Annonces

**Logique de matching :**
```javascript
// Une alerte correspond à une annonce si :
alert.type === "request" && announcement.type === "offer" ||
alert.type === "offer" && announcement.type === "request"

// ET
alert.departure === announcement.departure &&
alert.arrival === announcement.arrival &&
alert.volume_min <= announcement.volume_available
```

## 🔧 Configuration des Champs

### Champs Single Select - Valeurs Standardisées

**Type (pour alertes et annonces) :**
- `"offer"` - Proposition de partage
- `"request"` - Demande de partage

**Status Alertes :**
- `"Active"` - Alerte active, reçoit des notifications
- `"Inactive"` - Alerte désactivée/désabonnée

**Status Annonces :**
- `"Active"` - Annonce visible et disponible
- `"Completed"` - Partage réalisé avec succès
- `"Cancelled"` - Annonce annulée

### Champs Calculés Recommandés

**Pour la table Alertes :**
```javascript
// Champ "Days Active"
DATETIME_DIFF(NOW(), {created_at}, 'days')

// Champ "Route"
{departure} & " → " & {arrival}

// Champ "Alert Summary"
{type} & " | " & {departure} & " → " & {arrival} & " | " & {volume_min} & "m³"
```

**Pour la table Annonces :**
```javascript
// Champ "Days Since Posted"
DATETIME_DIFF(NOW(), {created_at}, 'days')

// Champ "Route"
{departure} & " → " & {arrival}

// Champ "Announcement Summary"
{type} & " | " & {route} & " | " & {volume_available} & "m³ | " & {shipping_date}
```

## 📊 Vues et Filtres Recommandés

### Table Alertes Email

**Vue "Dashboard Alertes" :**
- Champs visibles : `type`, `departure`, `arrival`, `volume_min`, `email`, `status`, `created_at`
- Filtre : `status = "Active"`
- Tri : `created_at` décroissant
- Groupé par : `departure`

**Vue "Alertes à Traiter" :**
- Filtre : `status = "Active"` ET `created_at` dans les dernières 24h
- Tri : `created_at` décroissant

**Vue "Statistiques" :**
- Tous les champs
- Pas de filtre
- Groupé par : `type` puis `status`

### Table Annonces (si elle existe)

**Vue "Annonces Actives" :**
- Filtre : `status = "Active"`
- Tri : `shipping_date` croissant

**Vue "Matching Alerts" :**
- Pour faciliter le matching manuel
- Champs : `type`, `departure`, `arrival`, `volume_available`, `shipping_date`

## 🔐 Permissions et Accès

### Niveaux d'Accès Recommandés

**Backend Railway (API) :**
- **Permissions :** Créer, Lire, Modifier, Supprimer
- **Usage :** Gestion complète des alertes et annonces

**Frontend DodoPartage :**
- **Permissions :** Aucune (passe par le backend)
- **Sécurité :** Pas d'accès direct à Airtable

**Équipe Admin :**
- **Permissions :** Créer, Lire, Modifier, Supprimer
- **Usage :** Gestion manuelle et monitoring

## 🚀 Évolutions Futures

### Tables Supplémentaires Possibles

**Table "User Preferences" :**
- Préférences utilisateur pour les alertes
- Fréquence de notification
- Types de trajets favoris

**Table "Email Logs" :**
- Historique des emails envoyés
- Taux d'ouverture
- Statistiques de performance

**Table "Matching History" :**
- Historique des correspondances trouvées
- Succès des mises en relation
- Métriques de performance

### Champs Supplémentaires

**Pour les Alertes :**
- `max_price` - Prix maximum accepté
- `flexible_dates` - Flexibilité sur les dates
- `notification_frequency` - Fréquence des notifications
- `last_notification_sent` - Dernière notification envoyée

**Pour les Annonces :**
- `container_type` - Type de conteneur
- `pickup_address` - Adresse de collecte
- `delivery_address` - Adresse de livraison
- `insurance_included` - Assurance incluse
- `tracking_number` - Numéro de suivi

## 📋 Checklist de Configuration

### ✅ Configuration Actuelle
- [x] Base Airtable créée
- [x] Table "Email Alert" configurée
- [x] Colonnes obligatoires définies
- [x] Types de données corrects
- [x] Vues de base créées

### ⏳ À Configurer
- [ ] Table "Announcements" (si nécessaire)
- [ ] Champs calculés
- [ ] Vues avancées avec filtres
- [ ] Permissions d'équipe
- [ ] Automatisations Airtable (optionnel)

## 🔍 Commandes de Vérification

### Vérifier la Structure via API

```bash
# Test de connexion à la table Alertes
curl -H "Authorization: Bearer YOUR_PAT_TOKEN" \
  "https://api.airtable.com/v0/appyuDiWXUzpy9DTT/tblVuVneCZTot07sB?maxRecords=1"

# Vérifier les champs de la table
curl -H "Authorization: Bearer YOUR_PAT_TOKEN" \
  "https://api.airtable.com/v0/meta/bases/appyuDiWXUzpy9DTT/tables"
```

### Validation des Données

```javascript
// Script de validation des types de données
const validateAlertRecord = (record) => {
  const required = ['type', 'departure', 'arrival', 'volume_min', 'email'];
  const validTypes = ['offer', 'request'];
  const validStatuses = ['Active', 'Inactive'];
  
  // Vérifications...
  return {
    isValid: true,
    errors: []
  };
};
```

---

**📝 Note :** Ce document doit être mis à jour à chaque modification de la structure Airtable. Gardez-le synchronisé avec vos tables réelles pour maintenir la cohérence de votre système.

**🔄 Dernière mise à jour :** Janvier 2024
**👤 Responsable :** Équipe DodoPartage 

## 📊 Table principale : `DodoPartage - Announcement`

### 🗃️ Configuration actuelle de la base

**Base ID** : `appyuDiWXUzpy9DTT`  
**Table** : `DodoPartage - Announcement`  
**Environnement** : Production via backend centralisé Railway

## 📋 Colonnes et types de données

### Informations générales
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `reference` | Single line text | ✅ | Référence unique (PARTAGE-XXXXXX-XXXXXX) |
| `created_at` | Date | ✅ | Date de création de l'annonce |
| `status` | Single select | ✅ | pending_validation, published, expired |

### Contact
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `contact_first_name` | Single line text | ✅ | Prénom du contact |
| `contact_email` | Email | ✅ | Email du contact |
| `contact_phone` | Phone number | ❌ | Téléphone du contact |

### Localisation
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `departure_country` | Single line text | ✅ | Pays de départ |
| `departure_city` | Single line text | ✅ | Ville de départ |
| `departure_postal_code` | Single line text | ❌ | Code postal de départ |
| `arrival_country` | Single line text | ✅ | Pays d'arrivée |
| `arrival_city` | Single line text | ✅ | Ville d'arrivée |
| `arrival_postal_code` | Single line text | ❌ | Code postal d'arrivée |

### Transport
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `shipping_date` | Date | ✅ | Date prévue d'expédition |
| `container_type` | Single line text | ✅ | "20" ou "40" (pieds) |
| `container_available_volume` | Number | ✅ | Volume disponible dans le conteneur |
| `container_minimum_volume` | Number | ✅ | Volume minimum pour partager |

### Offre
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `offer_type` | Single select | ✅ | "free" ou "paid" |
| `announcement_text` | Long text | ✅ | Description détaillée de l'annonce |
| `announcement_text_length` | Number | ✅ | Longueur du texte d'annonce |

### Champs obsolètes supprimés
| Ancienne colonne | Raison de suppression | Alternative |
|------------------|----------------------|-------------|
| `departure_display_name` | ❌ Toujours vide | Reconstruction : `${city}, ${country}` |
| `arrival_display_name` | ❌ Toujours vide | Reconstruction : `${city}, ${country}` |
| `shipping_date_formatted` | ❌ Redondant | Formatage côté frontend/email |

## 🔄 Évolutions récentes

### ✅ Janvier 2024 - Suppression des champs display_name
- **Problème** : Les champs `departure_display_name` et `arrival_display_name` étaient systématiquement vides
- **Solution** : Suppression de ces champs d'Airtable
- **Impact** : Le nom complet du lieu est maintenant reconstruit dynamiquement :
  ```javascript
  // Frontend → Backend
  departureLocation = displayName || `${city}, ${country}`
  arrivalLocation = displayName || `${city}, ${country}`
  ```

### ⚙️ Configuration backend adaptée
Le backend Railway reconstruit automatiquement les noms de lieux pour :
- ✅ **Emails** : Affichage correct des trajets
- ✅ **Logs** : Traçabilité complète
- ✅ **API** : Réponses cohérentes

## 📧 Impact sur les emails

### Templates mis à jour
Les templates d'email utilisent maintenant :
```javascript
// Variables disponibles dans les emails
{
  departureLocation: "Paris, France",    // Reconstruit
  arrivalLocation: "Fort-de-France, Martinique", // Reconstruit
  
  // Détails séparés si nécessaire
  departureCountry: "France",
  departureCity: "Paris",
  arrivalCountry: "Martinique", 
  arrivalCity: "Fort-de-France"
}
```

## 🧪 Tests et validation

### Vérification de l'intégrité des données
```bash
# Test complet du flux
npm run test:validation

# Test spécifique backend
npm run test:backend
```

### Points de contrôle
- ✅ Aucun champ display_name envoyé vers Airtable
- ✅ Reconstruction correcte des noms de lieux
- ✅ Emails contiennent les bonnes informations
- ✅ Pas d'erreurs dans les logs Railway

## 🚀 Déploiement

Cette modification est **rétrocompatible** car :
- Les anciens champs étaient vides
- La reconstruction utilise les champs existants
- Aucun changement d'API publique

### Checklist de déploiement
- [x] Documentation mise à jour
- [x] Code frontend adapté 
- [x] Tests passants
- [x] Logs backend propres
- [x] Emails fonctionnels

## 📞 Support

### Vérification rapide
```bash
# Vérifier qu'aucune erreur liée aux display_name
curl -s http://localhost:3000/api/submit-announcement -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### En cas de problème
1. **Vérifier les logs Railway** (pas d'erreur sur les champs manquants)
2. **Tester la création d'annonce** (workflow complet)
3. **Vérifier l'email reçu** (lieux corrects)
4. **Consulter Airtable** (pas de colonnes vides)

---

**Dernière mise à jour** : Janvier 2024  
**Version** : 2.0 (suppression display_name) 