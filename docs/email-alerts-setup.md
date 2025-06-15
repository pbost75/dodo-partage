# 📧 Système d'Alertes Email - DodoPartage

Ce guide explique le système d'alertes email complet pour DodoPartage, utilisant le **backend centralisé Railway** avec **Airtable** et **Resend** pour une architecture cohérente avec l'écosystème Dodomove.

## 🏗️ Architecture Centralisée

```
Frontend DodoPartage (Next.js)
    ↓ (API calls via HTTPS)
Backend Centralisé Dodomove (Railway)
    ↓ (stockage + emails)
Airtable + Resend
```

**Avantages de cette approche :**
- 🔒 **Sécurité** : Clés API côté serveur uniquement
- 🎨 **Cohérence** : Emails avec le design Dodomove existant
- 🔧 **Maintenance** : Une seule configuration à gérer
- 📈 **Évolutivité** : Architecture centralisée

## 🎯 Fonctionnalités Complètes

Le système d'alertes email permet aux utilisateurs de :
- **Créer des alertes** pour des trajets spécifiques (départ → arrivée)
- **Définir un volume minimum** requis
- **Choisir le type** d'alerte ("offer" ou "request")
- **Recevoir des emails** via Resend avec design cohérent Dodomove
- **Se désabonner facilement** via un lien dans l'email
- **Validation automatique** des données avant création

## 📋 Configuration Airtable Détaillée

### 1. Table "DodoPartage - Email Alert"

**Informations de votre table :**
- **Base ID** : `appyuDiWXUzpy9DTT`
- **Table ID** : `tblVuVneCZTot07sB`
- **View ID** : `viw7ys2GOOVuk0qTD`

**Structure des colonnes :**

| Nom de la colonne | Type | Options | Description | Obligatoire |
|-------------------|------|---------|-------------|-------------|
| `type` | Single select | "offer", "request" | Type d'alerte | ✅ |
| `departure` | Single line text | - | Lieu de départ | ✅ |
| `arrival` | Single line text | - | Lieu d'arrivée | ✅ |
| `volume_min` | Number | - | Volume minimum en m³ | ✅ |
| `email` | Email | - | Email pour recevoir les alertes | ✅ |
| `status` | Single select | "Active", "Inactive" | Statut de l'alerte | ✅ |
| `created_at` | Date with time | - | Date de création | ✅ |
| `unsubscribe_token` | Single line text | - | Token de désabonnement unique | ✅ |

### 2. Mapping des Variables

**Frontend → Backend → Airtable :**
```javascript
// Données envoyées par le frontend
{
  type: "offer" | "request",
  departure: "France",
  arrival: "Martinique", 
  volume_min: 5,
  email: "user@example.com"
}

// Stockage dans Airtable (ajouts automatiques)
{
  type: "offer",
  departure: "France", 
  arrival: "Martinique",
  volume_min: 5,
  email: "user@example.com",
  status: "Active", // Par défaut
  created_at: "2024-01-15T10:30:00.000Z", // Auto
  unsubscribe_token: "unique-token-123" // Généré
}
```

## ⚙️ Configuration Technique

### 1. Variables d'environnement Frontend

**Fichier `.env.local` :**
```bash
# Configuration du backend centralisé
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
```

### 2. Configuration Backend (Railway)

**Variables déjà configurées sur Railway :**
```bash
AIRTABLE_API_KEY=pat_xxxxxxxxxx
AIRTABLE_BASE_ID=appyuDiWXUzpy9DTT
AIRTABLE_EMAIL_ALERTS_TABLE_ID=tblVuVneCZTot07sB
RESEND_API_KEY=re_xxxxxxxxxx
```

## 🔌 APIs Détaillées

### 1. Créer une Alerte - `POST /api/create-alert`

**Données requises :**
```json
{
  "type": "offer" | "request",
  "departure": "string (obligatoire)",
  "arrival": "string (obligatoire)", 
  "volume_min": "number (obligatoire, > 0)",
  "email": "string (format email valide)"
}
```

**Validation automatique :**
- ✅ Format email valide
- ✅ Volume minimum > 0
- ✅ Type dans ["offer", "request"]
- ✅ Departure et arrival non vides

**Exemple de réponse succès :**
```json
{
  "success": true,
  "message": "Alerte email créée avec succès !",
  "data": {
    "alertId": "rec123456789",
    "email": "user@example.com",
    "type": "request",
    "departure": "France",
    "arrival": "Martinique",
    "volume_min": 5,
    "confirmationEmailSent": true,
    "unsubscribeToken": "unique-token-abc123"
  },
  "backend": {
    "used": "centralized",
    "url": "https://web-production-7b738.up.railway.app"
  }
}
```

**Exemple de réponse erreur :**
```json
{
  "success": false,
  "error": "Email invalide",
  "details": {
    "field": "email",
    "value": "invalid-email",
    "expected": "Format email valide"
  }
}
```

### 2. Test de Connexion - `GET /api/test-email-alerts`

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion aux alertes email réussie via le backend centralisé !",
  "backend": {
    "url": "https://web-production-7b738.up.railway.app",
    "accessible": true,
    "config": {
      "airtable": "configured",
      "resend": "configured"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Désabonnement - `GET /api/unsubscribe-alert?token=XXXXX`

**Paramètres :**
- `token` : Token de désabonnement unique

**Réponse :** Page HTML de confirmation avec design Dodomove

## 📁 Fichiers Implémentés

### Routes API Frontend (✅ Créées)
```
src/app/api/
├── create-alert/route.ts      # Création d'alertes via backend
├── test-email-alerts/route.ts # Test de connexion
└── unsubscribe-alert/route.ts # Désabonnement avec page HTML
```

### Scripts et Configuration (✅ Créés)
```
scripts/
└── test-email-alerts.js       # Script de test complet

package.json                   # Script "test:email-alerts" ajouté
```

### Routes Backend (⏳ À implémenter sur Railway)
```
Backend Railway - Routes nécessaires :
├── POST /api/partage/create-alert      # Création d'alertes
├── GET /api/partage/test-alerts        # Test de configuration  
└── POST /api/partage/unsubscribe-alert # Désabonnement
```

## 🧪 Tests et Validation

### 1. Test Automatique Complet

```bash
# Démarrez le serveur de développement
npm run dev

# Lancez le script de test complet
npm run test:email-alerts
```

**Le script teste :**
- ✅ Connexion au backend centralisé
- ✅ Création d'alerte avec données valides
- ✅ Validation des erreurs (email invalide, volume négatif)
- ✅ Test de désabonnement
- ✅ Vérification des réponses JSON

### 2. Tests Manuels

**Test de connexion :**
```
http://localhost:3000/api/test-email-alerts
```

**Test de création d'alerte :**
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "request",
    "departure": "France",
    "arrival": "Martinique",
    "volume_min": 5,
    "email": "test@example.com"
  }'
```

**Test de désabonnement :**
```
http://localhost:3000/api/unsubscribe-alert?token=test-token
```

## 🚀 Intégration Frontend

### 1. Formulaire de Création d'Alerte

```tsx
const handleCreateAlert = async (formData: {
  type: 'offer' | 'request';
  departure: string;
  arrival: string;
  volume_min: number;
  email: string;
}) => {
  try {
    const response = await fetch('/api/create-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // ✅ Succès - Afficher confirmation
      console.log('Alerte créée !', result.data);
      // Rediriger vers page de confirmation
      // Afficher toast de succès
    } else {
      // ❌ Erreur - Afficher message d'erreur
      console.error('Erreur:', result.error);
      // Afficher message d'erreur à l'utilisateur
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    // Gérer erreur de connexion
  }
};
```

### 2. Composant Formulaire Complet

```tsx
import { useState } from 'react';

export default function AlertForm() {
  const [formData, setFormData] = useState({
    type: 'request' as 'offer' | 'request',
    departure: '',
    arrival: '',
    volume_min: 1,
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Alerte créée avec succès !');
        // Reset form
        setFormData({
          type: 'request',
          departure: '',
          arrival: '',
          volume_min: 1,
          email: ''
        });
      } else {
        setMessage(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Champs du formulaire */}
      <div>
        <label>Type d'alerte :</label>
        <select 
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as 'offer' | 'request'})}
        >
          <option value="request">Je cherche (demande)</option>
          <option value="offer">Je propose (offre)</option>
        </select>
      </div>
      
      {/* Autres champs... */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Créer l\'alerte'}
      </button>
      
      {message && <p>{message}</p>}
    </form>
  );
}
```

## 🔧 Dépannage Détaillé

### Erreurs Courantes et Solutions

**1. "Configuration backend manquante"**
```bash
# Vérifiez votre .env.local
cat .env.local | grep NEXT_PUBLIC_BACKEND_URL

# Doit contenir :
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
```

**2. "Backend error: 404"**
- ❌ **Cause** : Routes backend pas encore implémentées
- ✅ **Solution** : Implémenter les routes sur Railway

**3. "Backend error: 500"**
- ❌ **Cause** : Erreur côté backend centralisé
- ✅ **Solution** : Vérifier les logs Railway

**4. "Email invalide"**
- ❌ **Cause** : Format email incorrect
- ✅ **Solution** : Valider côté frontend avant envoi

**5. "Volume minimum invalide"**
- ❌ **Cause** : Volume ≤ 0
- ✅ **Solution** : Valider volume > 0

### Logs de Débogage

**Frontend (Console) :**
```javascript
// Logs automatiques dans les routes API
console.log('📧 Création d\'alerte demandée');
console.log('📤 Envoi vers backend centralisé');
console.log('✅ Alerte créée avec succès');
console.log('❌ Erreur:', error);
```

**Backend (Railway) :**
```javascript
// Logs à ajouter côté backend
console.log('📧 Réception demande création alerte');
console.log('💾 Sauvegarde dans Airtable');
console.log('📨 Envoi email de confirmation');
```

## 📊 Monitoring et Analytics

### Vues Airtable Recommandées

**1. Vue "Alertes Actives"**
- Filtre : `status = "Active"`
- Tri : `created_at` décroissant

**2. Vue "Par Trajet"**
- Groupé par : `departure`
- Puis groupé par : `arrival`

**3. Vue "Statistiques"**
- Champs calculés pour métriques

### Métriques à Surveiller

- 📈 **Nombre d'alertes créées par jour**
- 📉 **Taux de désabonnement**
- 🗺️ **Trajets les plus demandés**
- 📦 **Volume moyen des alertes**
- 📧 **Taux d'ouverture des emails**

## 🎉 Prochaines Étapes

### Côté Backend (Railway) - À Implémenter

**Routes à ajouter dans dodomove-backend :**

```javascript
// 1. Création d'alerte
app.post('/api/partage/create-alert', async (req, res) => {
  // Validation des données
  // Génération token de désabonnement
  // Sauvegarde dans Airtable
  // Envoi email de confirmation via Resend
});

// 2. Test de configuration
app.get('/api/partage/test-alerts', async (req, res) => {
  // Vérification connexion Airtable
  // Vérification connexion Resend
  // Retour statut configuration
});

// 3. Désabonnement
app.post('/api/partage/unsubscribe-alert', async (req, res) => {
  // Recherche par token
  // Mise à jour status = "Inactive"
  // Confirmation désabonnement
});
```

### Côté Frontend - Prêt ✅

Une fois les routes backend ajoutées :

1. **✅ Système complet fonctionnel**
2. **✅ Tests automatisés passent**
3. **✅ Interface utilisateur intégrable**
4. **✅ Gestion d'erreurs complète**

### Fonctionnalités Avancées (Futures)

- 🔔 **Notifications push** en plus des emails
- 📅 **Alertes avec dates d'expiration**
- 💰 **Filtres par prix maximum**
- 📱 **Interface mobile optimisée**
- 📊 **Dashboard utilisateur** pour gérer ses alertes

## ✅ Récapitulatif Final

**✅ Côté Frontend (Terminé) :**
- Routes API créées et testées
- Validation des données
- Gestion d'erreurs complète
- Scripts de test automatisés
- Documentation complète

**⏳ Côté Backend (À faire) :**
- Implémenter 3 routes sur Railway
- Tester l'intégration complète
- Configurer l'envoi d'emails automatique

**🎯 Résultat Final :**
Un système d'alertes email professionnel, sécurisé et évolutif, parfaitement intégré à l'écosystème Dodomove ! 🚀 