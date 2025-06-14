# Funnel "Je propose de la place" - Spécifications complètes

## 📋 Vue d'ensemble

### Objectif
Permettre aux utilisateurs possédant un conteneur avec de l'espace libre de publier rapidement une annonce de partage depuis mobile, en 2-3 minutes maximum.

### Utilisateur cible
**Marie, 34 ans, déménage vers les DOM-TOM**
- A déjà réservé un conteneur (20 ou 40 pieds)
- Veut rentabiliser l'espace libre
- Utilise principalement son mobile
- Manque de temps, veut une solution simple
- Souhaite se mettre en relation sans gérer les paiements

### Périmètre fonctionnel
- **MVP** : Outil de mise en relation gratuit
- **Pas de paiement** intégré dans la plateforme
- **Modification** possible après publication
- **Validation** par double opt-in email

---

## 🏗️ Architecture technique

### Structure des routes
```
/dodo-partage/src/app/funnel/propose/
├── layout.tsx                 # Layout commun avec progression
├── locations/
│   └── page.tsx              # Étape 1: Lieux départ/arrivée
├── shipping-date/
│   └── page.tsx              # Étape 2: Date d'expédition
├── container-details/
│   └── page.tsx              # Étape 3: Type conteneur + volumes
├── allowed-items/
│   └── page.tsx              # Étape 4: Marchandises autorisées
├── offer-type/
│   └── page.tsx              # Étape 5: Gratuit/Payant
├── announcement-text/
│   └── page.tsx              # Étape 6: Rédaction annonce
├── contact/
│   └── page.tsx              # Étape 7: Coordonnées
└── recap/
    └── page.tsx              # Récapitulatif final
```

### Store Zustand
```typescript
interface ProposeStore {
  // Données du formulaire
  departure: {
    country: string;
    city: string;
    postalCode: string;
    isComplete: boolean;
  };
  arrival: {
    country: string; 
    city: string;
    postalCode: string;
    isComplete: boolean;
  };
  shippingDate: string;
  containerType: '20' | '40';
  availableVolume: number;
  minimumVolume: number;
  allowedItems: string[];
  offerType: 'free' | 'paid';
  announcementText: string;
  contact: {
    firstName: string;
    email: string;
    phone?: string;
  };
  
  // Actions
  setDeparture: (data: Partial<DepartureData>) => void;
  setArrival: (data: Partial<ArrivalData>) => void;
  setShippingDate: (date: string) => void;
  setContainerDetails: (type: string, volume: number, minVolume: number) => void;
  setAllowedItems: (items: string[]) => void;
  setOfferType: (type: 'free' | 'paid') => void;
  setAnnouncementText: (text: string) => void;
  setContact: (contact: ContactData) => void;
  
  // Utilitaires
  getCurrentStep: () => number;
  isStepComplete: (step: number) => boolean;
  reset: () => void;
}
```

---

## 📍 Étape 1: Locations (D'où vers où ?)

### Interface utilisateur

#### Layout mobile-first
```
🌍 D'où part votre conteneur ?

[Dropdown] Pays de départ
┗━ France métropolitaine ✓

↓ [Animation slide-down + auto-scroll]

[Autocomplete] Ville de départ  
┗━ "Le Havre (76600)" ✓

↓ [Animation slide-down + auto-scroll] 

🎯 Vers quelle destination ?

[Dropdown] Pays d'arrivée
┗━ Réunion ✓

↓ [Animation slide-down + auto-scroll]

[Autocomplete] Ville d'arrivée
┗━ "Port-Est (97470)" ✓

[Bouton] Continuer →
```

### Logique d'apparition séquentielle

#### États des composants
```typescript
interface LocationStepState {
  showDepartureCountry: boolean;    // Toujours true
  showDepartureCity: boolean;       // true après sélection pays départ
  showArrivalCountry: boolean;      // true après sélection ville départ
  showArrivalCity: boolean;         // true après sélection pays arrivée
  showContinueButton: boolean;      // true quand tout est rempli
}
```

#### Animation & Auto-scroll
```typescript
// À chaque nouvelle apparition
const animateAndScroll = (elementId: string) => {
  // 1. Animation slide-down (300ms)
  animate(elementId, { opacity: [0, 1], y: [-20, 0] }, { duration: 0.3 });
  
  // 2. Auto-scroll vers l'élément (après 150ms)
  setTimeout(() => {
    document.getElementById(elementId)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }, 150);
};
```

### Données et validation

#### Options pays
```typescript
const countryOptions = [
  { value: 'france', label: 'France métropolitaine', emoji: '🇫🇷' },
  { value: 'reunion', label: 'Réunion', emoji: '🌺' },
  { value: 'martinique', label: 'Martinique', emoji: '🌴' },
  { value: 'guadeloupe', label: 'Guadeloupe', emoji: '🏝️' },
  { value: 'guyane', label: 'Guyane', emoji: '🌿' },
  { value: 'mayotte', label: 'Mayotte', emoji: '🐋' },
  { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie', emoji: '🏖️' }
];
```

#### API Autocomplete villes
```typescript
// Endpoint: /api/cities?country={country}&query={query}
interface CityResponse {
  cities: Array<{
    name: string;
    postalCode: string;
    displayName: string; // "Le Havre (76600)"
  }>;
}

// Logique de recherche
const searchCities = async (country: string, query: string) => {
  if (query.length < 2) return [];
  
  const response = await fetch(`/api/cities?country=${country}&query=${query}`);
  return response.json();
};
```

#### Validation
```typescript
const validateLocations = (departure: LocationData, arrival: LocationData) => {
  const errors: string[] = [];
  
  if (!departure.country) errors.push("Pays de départ requis");
  if (!departure.city) errors.push("Ville de départ requise");
  if (!arrival.country) errors.push("Pays d'arrivée requis");
  if (!arrival.city) errors.push("Ville d'arrivée requise");
  
  if (departure.country === arrival.country && departure.city === arrival.city) {
    errors.push("Le départ et l'arrivée ne peuvent pas être identiques");
  }
  
  return errors;
};
```

---

## 📅 Étape 2: Date d'expédition

### Interface utilisateur
```
📅 Quand part votre conteneur ?

[Date picker mobile optimisé]
┗━ 15 mars 2024 ✓

💡 Date approximative ? Pas de problème !
    Vous pourrez la préciser après publication.

[Bouton] Continuer →
```

### Configuration du Date Picker
```typescript
interface DatePickerConfig {
  minDate: Date;              // Aujourd'hui + 7 jours
  maxDate: Date;              // Aujourd'hui + 365 jours
  locale: 'fr-FR';
  format: 'dd/MM/yyyy';
  placeholder: 'Sélectionnez une date';
  weekStartsOn: 1;            // Lundi
}

// Validation
const validateShippingDate = (date: string) => {
  const selectedDate = new Date(date);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  
  if (selectedDate < minDate) {
    return "La date doit être dans au moins 7 jours";
  }
  
  return null;
};
```

---

## 📦 Étape 3: Détails du conteneur

### Interface utilisateur
```
📦 Parlez-nous de votre conteneur

[Radio Cards] Type de conteneur
┌─────────────────┐  ┌─────────────────┐
│  📦 20 pieds    │  │  📦 40 pieds    │
│  ~33 m³ total   │  │  ~67 m³ total   │
│       ✓         │  │                 │
└─────────────────┘  └─────────────────┘

↓ [Animation apparition]

📏 Espace disponible pour partage

[Input numérique + slider] Volume disponible
┗━ 2.5 m³ ✓

💡 Estimation : un frigo = ~1m³, un carton = ~0.1m³

↓ [Animation apparition]

📋 Volume minimum souhaité

[Radio buttons]
● Peu importe (à partir de 0.1 m³)
○ Au moins 0.5 m³  
○ Au moins 1 m³
○ Au moins 2 m³

💡 Pour éviter les petites demandes et simplifier l'organisation

[Bouton] Continuer →
```

### Données et contraintes
```typescript
interface ContainerData {
  type: '20' | '40';
  availableVolume: number;
  minimumVolume: number;
}

const containerSpecs = {
  '20': { totalVolume: 33, maxAvailable: 25 },
  '40': { totalVolume: 67, maxAvailable: 50 }
};

const minimumVolumeOptions = [
  { value: 0.1, label: 'Peu importe (à partir de 0.1 m³)' },
  { value: 0.5, label: 'Au moins 0.5 m³' },
  { value: 1.0, label: 'Au moins 1 m³' },
  { value: 2.0, label: 'Au moins 2 m³' }
];
```

### Validation et warnings
```typescript
const validateContainer = (data: ContainerData) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Erreurs bloquantes
  if (data.availableVolume <= 0) {
    errors.push("Le volume disponible doit être supérieur à 0");
  }
  
  if (data.availableVolume > containerSpecs[data.type].maxAvailable) {
    errors.push(`Volume trop important pour un conteneur ${data.type} pieds`);
  }
  
  if (data.minimumVolume > data.availableVolume) {
    errors.push("Le volume minimum ne peut pas être supérieur au volume disponible");
  }
  
  // Warnings informatifs
  if (data.availableVolume > containerSpecs[data.type].totalVolume * 0.7) {
    warnings.push("⚠️ Volume important, êtes-vous sûr(e) ?");
  }
  
  if (data.minimumVolume >= 2 && data.availableVolume < 3) {
    warnings.push("💡 Volume minimum élevé pour l'espace disponible");
  }
  
  return { errors, warnings };
};
```

---

## ✅ Étape 4: Marchandises autorisées

### Interface utilisateur
```
✅ Que pouvez-vous transporter ?

💡 Pré-sélectionné selon votre volume disponible (2.5 m³)

[Sections par volume requis]

📦 PETIT VOLUME (toujours disponible)
┌─────────────────────────────────────┐
│ ✓ Cartons et effets personnels      │  📦 ~0.1 m³/carton
│ ✓ Livres et documents               │  📚 ~0.05 m³/carton  
│ ✓ Vêtements et textiles             │  👕 ~0.1 m³/sac
│ ✓ Matériel informatique             │  💻 ~0.2 m³/unité
│ ✓ Objets décoratifs fragiles        │  🏺 ~0.1 m³/objet
└─────────────────────────────────────┘

🔌 VOLUME MOYEN (selon espace disponible)
┌─────────────────────────────────────┐
│ ✓ Petit électroménager              │  🔌 ~0.3 m³/appareil
│ ✓ Gros électroménager               │  ❄️ ~1.5 m³/appareil
│ ✓ Mobilier léger                    │  🪑 ~1 m³/meuble
│ ✓ Matériel sportif                  │  ⚽ ~0.5 m³/équipement
└─────────────────────────────────────┘

🚫 GROS VOLUME (volume insuffisant)
┌─────────────────────────────────────┐
│ ✗ Véhicules (moto, scooter)         │  🏍️ ~3+ m³ 
│ ✗ Mobilier lourd/volumineux         │  🛏️ ~4+ m³ 
│ ✗ Matériel professionnel lourd      │  🔧 ~3+ m³ 
└─────────────────────────────────────┘

💡 Cliquez pour décocher ce que vous ne souhaitez pas transporter

[Bouton] Continuer →
```

### Logique métier
```typescript
interface ItemCategory {
  id: string;
  label: string;
  icon: string;
  minVolume: number;
  volumeInfo: string;
  defaultChecked: boolean;
  category: 'small' | 'medium' | 'large';
}

const itemCategories: ItemCategory[] = [
  // Petit volume - toujours disponible
  { 
    id: 'cartons', 
    label: 'Cartons et effets personnels', 
    icon: '📦', 
    minVolume: 0.1, 
    volumeInfo: '~0.1 m³/carton',
    defaultChecked: true,
    category: 'small'
  },
  { 
    id: 'livres', 
    label: 'Livres et documents', 
    icon: '📚', 
    minVolume: 0.05, 
    volumeInfo: '~0.05 m³/carton',
    defaultChecked: true,
    category: 'small'
  },
  { 
    id: 'vetements', 
    label: 'Vêtements et textiles', 
    icon: '👕', 
    minVolume: 0.1, 
    volumeInfo: '~0.1 m³/sac',
    defaultChecked: true,
    category: 'small'
  },
  { 
    id: 'informatique', 
    label: 'Matériel informatique', 
    icon: '💻', 
    minVolume: 0.2, 
    volumeInfo: '~0.2 m³/unité',
    defaultChecked: true,
    category: 'small'
  },
  { 
    id: 'decoratif', 
    label: 'Objets décoratifs fragiles', 
    icon: '🏺', 
    minVolume: 0.1, 
    volumeInfo: '~0.1 m³/objet',
    defaultChecked: true,
    category: 'small'
  },
  
  // Volume moyen
  { 
    id: 'petit_electromenager', 
    label: 'Petit électroménager', 
    icon: '🔌', 
    minVolume: 0.3, 
    volumeInfo: '~0.3 m³/appareil',
    defaultChecked: true,
    category: 'medium'
  },
  { 
    id: 'gros_electromenager', 
    label: 'Gros électroménager', 
    icon: '❄️', 
    minVolume: 1.5, 
    volumeInfo: '~1.5 m³/appareil',
    defaultChecked: true,
    category: 'medium'
  },
  { 
    id: 'mobilier_leger', 
    label: 'Mobilier léger', 
    icon: '🪑', 
    minVolume: 1.0, 
    volumeInfo: '~1 m³/meuble',
    defaultChecked: true,
    category: 'medium'
  },
  { 
    id: 'sport', 
    label: 'Matériel sportif', 
    icon: '⚽', 
    minVolume: 0.5, 
    volumeInfo: '~0.5 m³/équipement',
    defaultChecked: true,
    category: 'medium'
  },
  
  // Gros volume
  { 
    id: 'vehicules', 
    label: 'Véhicules (moto, scooter)', 
    icon: '🏍️', 
    minVolume: 3.0, 
    volumeInfo: '~3+ m³',
    defaultChecked: false,
    category: 'large'
  },
  { 
    id: 'mobilier_lourd', 
    label: 'Mobilier lourd/volumineux', 
    icon: '🛏️', 
    minVolume: 4.0, 
    volumeInfo: '~4+ m³',
    defaultChecked: false,
    category: 'large'
  },
  { 
    id: 'materiel_pro', 
    label: 'Matériel professionnel lourd', 
    icon: '🔧', 
    minVolume: 3.0, 
    volumeInfo: '~3+ m³',
    defaultChecked: false,
    category: 'large'
  }
];

// Logique d'activation/désactivation
const getItemsAvailability = (availableVolume: number) => {
  return itemCategories.map(item => ({
    ...item,
    isAvailable: availableVolume >= item.minVolume,
    isChecked: availableVolume >= item.minVolume ? item.defaultChecked : false,
    isDisabled: availableVolume < item.minVolume
  }));
};
```

### États visuels CSS
```css
/* Item disponible et coché */
.item-available-checked {
  border: 2px solid #10B981;
  background: #ECFDF5;
  cursor: pointer;
}

/* Item disponible mais décoché */
.item-available-unchecked {
  border: 2px solid #E5E7EB;
  background: white;
  cursor: pointer;
}

/* Item non disponible (volume insuffisant) */
.item-disabled {
  border: 2px solid #F3F4F6;
  background: #F9FAFB;
  opacity: 0.6;
  cursor: not-allowed;
}

.item-disabled .checkbox {
  opacity: 0.3;
}

.item-disabled .text {
  color: #9CA3AF;
  text-decoration: line-through;
}
```

---

## 💰 Étape 5: Type d'offre

### Interface utilisateur
```
💰 Votre partage est-il ?

[Radio Cards]
┌─────────────────────────────────────┐
│  🆓 GRATUIT                         │
│  Je rends service, sans contrepartie│
│                                     │
│  💡 Parfait pour dépanner quelqu'un │
│       ○                             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💸 PAYANT                          │
│  Je souhaite partager les frais     │
│                                     │
│  💡 Vous préciserez le tarif dans   │
│     votre annonce                   │
│       ✓                             │
└─────────────────────────────────────┘

[Bouton] Continuer →
```

### Données
```typescript
type OfferType = 'free' | 'paid';

interface OfferTypeData {
  type: OfferType;
}

const offerTypeOptions = [
  {
    value: 'free',
    label: 'Gratuit',
    icon: '🆓',
    description: 'Je rends service, sans contrepartie',
    tip: 'Parfait pour dépanner quelqu\'un'
  },
  {
    value: 'paid',
    label: 'Payant',
    icon: '💸',
    description: 'Je souhaite partager les frais',
    tip: 'Vous préciserez le tarif dans votre annonce'
  }
];
```

---

## ✍️ Étape 6: Rédaction de l'annonce

### Interface utilisateur
```
✍️ Décrivez votre offre

[Textarea avec placeholder intelligent]
┗━ "Bonjour ! Je fais un déménagement vers Saint-Denis de la Réunion..."

[Compteur de caractères] 145/2000

💡 Conseils pour une bonne annonce :
• Expliquez votre situation (déménagement, retour, etc.)
• Précisez le volume disponible et type d'objets acceptés
• Mentionnez vos conditions (récupération, flexibilité dates)
• Restez courtois et précis

[Boutons suggestions rapides]
[+ Ajouter volume]  [+ Conditions récupération]  [+ Flexibilité dates]

💡 Vous pourrez modifier ce texte après publication

[Bouton] Continuer →
```

### Génération automatique du texte
```typescript
const generateAnnouncementText = (formData: ProposeFormData): string => {
  const { departure, arrival, shippingDate, containerType, availableVolume, 
          minimumVolume, allowedItems, offerType } = formData;
  
  // Template de base
  let text = `Bonjour ! Je fais un déménagement de ${departure.city} vers ${arrival.city}`;
  
  // Informations conteneur
  text += ` et j'ai de la place disponible dans mon conteneur ${containerType} pieds.\n\n`;
  
  // Date
  const dateFormatted = new Date(shippingDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  text += `Mon conteneur part le ${dateFormatted}`;
  
  // Volume
  text += ` et j'ai ${availableVolume} m³ de disponible`;
  if (minimumVolume > 0.1) {
    text += ` (minimum ${minimumVolume} m³)`;
  }
  text += '.\n\n';
  
  // Type d'offre
  if (offerType === 'paid') {
    text += 'Je souhaite partager les frais. ';
  } else {
    text += 'Je rends service gratuitement. ';
  }
  
  // Objets acceptés (seulement les cochés)
  const acceptedItems = allowedItems.filter(id => 
    itemCategories.find(cat => cat.id === id)
  ).map(id => 
    itemCategories.find(cat => cat.id === id)?.label
  );
  
  if (acceptedItems.length > 0) {
    text += `\n\nJe peux prendre : ${acceptedItems.join(', ')}.`;
  }
  
  text += '\n\nN\'hésitez pas à me contacter pour plus d\'informations !';
  
  return text;
};
```

### Boutons de suggestion rapide
```typescript
const suggestionButtons = [
  {
    label: '+ Ajouter volume',
    insertion: `\n\nVolume disponible : ${availableVolume} m³`
  },
  {
    label: '+ Conditions récupération',
    insertion: '\n\nRécupération possible à [lieu] ou livraison directe au port.'
  },
  {
    label: '+ Flexibilité dates',
    insertion: '\n\nJe suis flexible sur les dates si besoin.'
  },
  {
    label: '+ Matériel protection',
    insertion: '\n\nTout sera bien protégé avec film plastique et sangles.'
  },
  {
    label: '+ Expérience',
    insertion: '\n\nJ\'ai déjà fait plusieurs expéditions sans problème.'
  }
];
```

### Validation
```typescript
const validateAnnouncementText = (text: string) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Erreurs
  if (text.length < 50) {
    errors.push("L'annonce doit faire au moins 50 caractères");
  }
  
  if (text.length > 2000) {
    errors.push("L'annonce ne peut pas dépasser 2000 caractères");
  }
  
  // Warnings
  if (text.length < 100) {
    warnings.push("💡 Une annonce plus détaillée attire plus de réponses");
  }
  
  if (!text.toLowerCase().includes('volume') && !text.includes('m³')) {
    warnings.push("💡 Pensez à mentionner le volume disponible");
  }
  
  return { errors, warnings };
};
```

---

## 👤 Étape 7: Contact

### Interface utilisateur
```
👤 Comment vous contacter ?

[Input] Votre prénom *
┗━ Marie

[Input] Email *
┗━ marie@email.com

[Input] Téléphone (optionnel)
┗━ 06 12 34 56 78

🔒 Vos coordonnées ne seront visibles que par 
   les personnes intéressées par votre offre

💡 Un email de confirmation vous sera envoyé
   pour valider votre annonce

[Bouton] Publier mon annonce →
```

### Données et validation
```typescript
interface ContactData {
  firstName: string;
  email: string;
  phone?: string;
}

const validateContact = (contact: ContactData) => {
  const errors: string[] = [];
  
  // Prénom
  if (!contact.firstName.trim()) {
    errors.push("Le prénom est obligatoire");
  }
  if (contact.firstName.length < 2) {
    errors.push("Le prénom doit faire au moins 2 caractères");
  }
  
  // Email
  if (!contact.email.trim()) {
    errors.push("L'email est obligatoire");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact.email)) {
    errors.push("Format d'email invalide");
  }
  
  // Téléphone (optionnel mais validé si rempli)
  if (contact.phone && contact.phone.trim()) {
    const phoneRegex = /^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/;
    if (!phoneRegex.test(contact.phone.replace(/[\s\-\.]/g, ''))) {
      errors.push("Format de téléphone invalide");
    }
  }
  
  return errors;
};
```

---

## 📋 Étape 8: Récapitulatif

### Interface utilisateur
```
✅ Récapitulatif de votre annonce

📍 TRAJET
Le Havre (76600) → Port-Est (97470)
📅 15 mars 2024

📦 CONTENEUR
Type : 20 pieds
Volume disponible : 2.5 m³ (min. 1 m³)

✅ OBJETS ACCEPTÉS
Cartons, Électroménager, Mobilier léger...
❌ Véhicules, Mobilier volumineux

💰 TARIF
Payant (à discuter)

👤 CONTACT
Marie - marie@email.com - 06 12 34 56 78

📝 ANNONCE
"Bonjour ! Je fais un déménagement vers Saint-Denis..."

[Bouton] ← Modifier  [Bouton] Publier définitivement →

💡 Après publication :
• Vous recevrez un email de confirmation
• Votre annonce sera visible après validation
• Vous pourrez la modifier à tout moment
```

### Données finale et soumission
```typescript
interface FinalAnnouncementData {
  // Informations de base
  id?: string;
  type: 'offer';
  status: 'draft' | 'pending' | 'published' | 'expired';
  
  // Trajet
  departure: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  shippingDate: string;
  
  // Conteneur
  containerType: '20' | '40';
  availableVolume: number;
  minimumVolume: number;
  allowedItems: string[];
  
  // Offre
  offerType: 'free' | 'paid';
  announcementText: string;
  
  // Contact
  contact: {
    firstName: string;
    email: string;
    phone?: string;
  };
  
  // Métadonnées
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  validationToken: string;
  adminToken: string;
}

// Soumission finale
const submitAnnouncement = async (data: FinalAnnouncementData) => {
  try {
    // 1. Validation finale côté client
    const validation = validateFullAnnouncement(data);
    if (validation.errors.length > 0) {
      throw new Error(validation.errors.join(', '));
    }
    
    // 2. Génération des tokens
    data.validationToken = generateToken();
    data.adminToken = generateToken();
    data.createdAt = new Date().toISOString();
    
    // 3. Calcul de la date d'expiration (30 jours après date de départ)
    const shippingDate = new Date(data.shippingDate);
    const expirationDate = new Date(shippingDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    data.expiresAt = expirationDate.toISOString();
    
    // 4. Envoi au backend
    const response = await fetch('/api/announcements/propose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la publication');
    }
    
    const result = await response.json();
    
    // 5. Redirection vers page de confirmation
    router.push(`/confirmation/${result.id}?token=${data.validationToken}`);
    
  } catch (error) {
    console.error('Erreur publication:', error);
    throw error;
  }
};
```

---

## 🎨 Guidelines UX/UI

### Design System
```typescript
// Couleurs principales
const colors = {
  primary: '#F47D6C',      // Orange Dodomove
  primaryHover: '#e66b5a',
  blue: '#243163',         // Bleu Dodomove
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    600: '#4B5563',
    900: '#111827'
  }
};

// Typography
const typography = {
  fontFamily: {
    title: 'Roboto Slab',
    body: 'Lato'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px'
  }
};
```

### Responsive breakpoints
```css
/* Mobile first */
.mobile { /* 0-767px */ }
.tablet { /* 768-1023px */ }  
.desktop { /* 1024px+ */ }

/* Optimisation mobile critique */
@media (max-width: 767px) {
  .container { padding: 16px; }
  .button { min-height: 44px; }
  .input { min-height: 44px; }
  .touch-target { min-width: 44px; min-height: 44px; }
}
```

### Animations
```typescript
// Transitions standards
const transitions = {
  fast: '150ms ease-out',
  normal: '300ms ease-out',
  slow: '500ms ease-out'
};

// Animations Framer Motion
const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  }
};
```

---

## 🔧 Aspects techniques

### Performance
```typescript
// Lazy loading des étapes
const LazyStep = lazy(() => import('./StepComponent'));

// Preload de l'étape suivante
const preloadNextStep = (currentStep: number) => {
  const nextStep = currentStep + 1;
  if (nextStep <= 7) {
    import(`./Step${nextStep}Component`);
  }
};

// Sauvegarde automatique
const autoSave = debounce((data: any) => {
  localStorage.setItem('propose-draft', JSON.stringify(data));
}, 1000);
```

### SEO et Meta tags
```typescript
// Métadonnées par étape
const stepMetadata = {
  1: {
    title: 'Créer une annonce - Lieux | DodoPartage',
    description: 'Indiquez les lieux de départ et d\'arrivée de votre conteneur'
  },
  2: {
    title: 'Créer une annonce - Date | DodoPartage', 
    description: 'Précisez la date de départ de votre conteneur'
  },
  // ... etc
};
```

### Analytics et tracking
```typescript
// Événements GA4
const trackStepCompletion = (step: number, data: any) => {
  gtag('event', 'step_completed', {
    event_category: 'funnel_propose',
    event_label: `step_${step}`,
    step_number: step,
    user_data: hashUserData(data)
  });
};

const trackFormAbandonment = (step: number, timeSpent: number) => {
  gtag('event', 'form_abandon', {
    event_category: 'funnel_propose',
    event_label: `step_${step}`,
    time_spent: timeSpent
  });
};
```

---

## 🔄 Intégrations

### API Backend
```typescript
// Endpoints requis
interface APIEndpoints {
  // Sauvegarde brouillon
  saveDraft: 'POST /api/announcements/draft';
  
  // Publication finale  
  publish: 'POST /api/announcements/propose';
  
  // Validation email
  validate: 'GET /api/announcements/validate/:token';
  
  // Gestion annonce
  update: 'PUT /api/announcements/:id/:adminToken';
  delete: 'DELETE /api/announcements/:id/:adminToken';
  
  // Recherche villes
  searchCities: 'GET /api/cities?country={country}&query={query}';
}
```

### Email templates
```html
<!-- Email de validation -->
<h2>Confirmez votre annonce DodoPartage</h2>
<p>Bonjour {firstName},</p>
<p>Votre annonce "{title}" est prête à être publiée.</p>
<a href="{validationLink}">Confirmer et publier</a>

<!-- Email de gestion -->
<h2>Gérez votre annonce</h2>
<p>Votre annonce est maintenant publiée !</p>
<a href="{adminLink}">Modifier ou supprimer</a>
```

### Double opt-in workflow
```typescript
const emailValidationWorkflow = {
  1: 'Utilisateur soumet le formulaire',
  2: 'Annonce sauvée avec status "pending"',
  3: 'Email de validation envoyé',
  4: 'Utilisateur clique sur le lien',
  5: 'Status passe à "published"',
  6: 'Annonce visible publiquement',
  7: 'Email de confirmation + lien admin envoyé'
};
```

---

## 📊 Métriques et KPIs

### Objectifs de performance
```typescript
const performanceTargets = {
  // Temps de complétion
  averageCompletionTime: '< 3 minutes',
  
  // Taux de conversion
  startToCompletion: '> 70%',
  stepByStepDropoff: '< 5% par étape',
  
  // Technique
  loadTime: '< 2 secondes',
  mobileUsability: '> 95%',
  
  // Qualité
  validationEmailClick: '> 80%',
  announcementQuality: '> 90% sans modération'
};
```

### Points de mesure
```typescript
const trackingPoints = [
  'funnel_started',
  'step_1_completed',
  'step_2_completed', 
  'step_3_completed',
  'step_4_completed',
  'step_5_completed',
  'step_6_completed',
  'step_7_completed',
  'form_submitted',
  'email_validated',
  'announcement_published'
];
```

---

## 🚀 Roadmap et évolutions

### Phase 1 (MVP)
- [ ] Structure de base du funnel
- [ ] Étapes 1-7 fonctionnelles
- [ ] Validation email
- [ ] Publication basique

### Phase 2 (Améliorations)
- [ ] Sauvegarde automatique
- [ ] Templates d'annonces
- [ ] Photos d'illustration
- [ ] Notifications push

### Phase 3 (Optimisations)
- [ ] A/B testing des étapes
- [ ] IA pour améliorer les annonces
- [ ] Intégration calendrier
- [ ] Matching automatique

---

*Dernière mise à jour : {date}*
*Version : 1.0* 