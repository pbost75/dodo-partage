# Guide de développement - DodoPartage

Ce guide explique les conventions, bonnes pratiques et workflows de développement pour DodoPartage.

## Conventions de code

### Structure des fichiers

#### Nommage
- **Composants React** : PascalCase (`AnnouncementCard.tsx`)
- **Fichiers utilitaires** : camelCase (`apiHelpers.ts`)
- **Hooks personnalisés** : camelCase avec préfixe `use` (`useAnnouncements.ts`)
- **Types** : PascalCase (`Announcement.ts`)

#### Organisation des imports
```typescript
// 1. Imports externes (React, Next.js, etc.)
import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Imports internes (composants, utils, types)
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';
import type { Announcement } from '@/types/announcement';

// 3. Imports relatifs
import './styles.css';
```

### Conventions TypeScript

#### Définition des types
```typescript
// Utilisez des interfaces pour les objets
interface AnnouncementProps {
  announcement: Announcement;
  onContact: (id: string) => void;
  className?: string;
}

// Utilisez des types pour les unions et primitifs
type AnnouncementStatus = 'pending' | 'active' | 'expired' | 'deleted';
type VolumeUnit = 'm3' | 'cartons';
```

#### Props des composants
```typescript
// Toujours typer les props des composants
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

export function Component({ required, optional = 0, children }: ComponentProps) {
  // ...
}
```

### Conventions React

#### Composants fonctionnels
```typescript
// Structure recommandée d'un composant
import React from 'react';
import type { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks d'état
  const [state, setState] = useState<StateType>(initialValue);
  
  // 2. Hooks d'effet
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3. Handlers et fonctions
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Render early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 5. Render principal
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}
```

#### Hooks personnalisés
```typescript
// Préfixe "use" et logique réutilisable
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Logique du hook...
  
  return {
    announcements,
    loading,
    error,
    refreshAnnouncements,
  };
}
```

## Gestion d'état avec Zustand

### Structure d'un store
```typescript
// store/useAnnouncementStore.ts
import { create } from 'zustand';
import type { Announcement } from '@/types/announcement';

interface AnnouncementStore {
  // État
  announcements: Announcement[];
  filters: AnnouncementFilters;
  loading: boolean;
  
  // Actions
  setAnnouncements: (announcements: Announcement[]) => void;
  updateFilters: (filters: Partial<AnnouncementFilters>) => void;
  addAnnouncement: (announcement: Announcement) => void;
}

export const useAnnouncementStore = create<AnnouncementStore>((set, get) => ({
  // État initial
  announcements: [],
  filters: {},
  loading: false,
  
  // Actions
  setAnnouncements: (announcements) => set({ announcements }),
  updateFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),
  addAnnouncement: (announcement) => set(state => ({
    announcements: [...state.announcements, announcement]
  })),
}));
```

## Styling avec Tailwind CSS

### Classes utilitaires
```tsx
// Utilisez les classes Tailwind de manière cohérente
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Titre de l'annonce
  </h2>
  <p className="text-gray-600 text-sm">
    Description de l'annonce
  </p>
</div>
```

### Palette couleur Dodomove
```css
/* Couleurs principales de l'écosystème Dodomove */
:root {
  --dodomove-blue: #1e40af;
  --dodomove-blue-light: #3b82f6;
  --dodomove-orange: #f47d6c;
  --dodomove-gray: #6b7280;
  --dodomove-gray-light: #f3f4f6;
}
```

### Composants responsifs
```tsx
// Mobile-first approach
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  md:gap-6
">
  {/* Contenu responsive */}
</div>
```

## Gestion des APIs

### Structure des appels API
```typescript
// utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchAnnouncements(filters?: AnnouncementFilters): Promise<Announcement[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.country) queryParams.append('country', filters.country);
    if (filters?.type) queryParams.append('type', filters.type);
    
    const response = await fetch(`${API_BASE_URL}/api/announcements?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    throw error;
  }
}
```

### Gestion des erreurs
```typescript
// Composant avec gestion d'erreur
export function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadAnnouncements() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }
    
    loadAnnouncements();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {announcements.map(announcement => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}
```

## Tests et validation

### Validation des formulaires
```typescript
// utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAnnouncement(data: Partial<Announcement>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!data.contactName?.trim()) {
    errors.push({ field: 'contactName', message: 'Le nom est requis' });
  }
  
  if (!validateEmail(data.contactEmail || '')) {
    errors.push({ field: 'contactEmail', message: 'Email invalide' });
  }
  
  return errors;
}
```

### Débuggage
```typescript
// Utilisez les outils de développement React
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { announcements, filters });
}
```

## Workflows Git

### Branches
- **main** : Branch de production
- **develop** : Branch de développement
- **feature/nom-feature** : Branches pour nouvelles fonctionnalités
- **fix/nom-bug** : Branches pour corrections de bugs

### Commits
```bash
# Format des messages de commit
feat: ajouter le formulaire de dépôt d'annonce
fix: corriger l'affichage des dates sur mobile
docs: mettre à jour le guide d'installation
style: améliorer l'espacement des cartes d'annonces
refactor: simplifier la logique de filtrage
```

### Workflow de développement
```bash
# 1. Créer une nouvelle branch
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
npm run dev
npm run lint
npm run build

# 3. Commiter les changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 4. Pousser la branch
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request
```

## Performance et optimisation

### Lazy loading des composants
```typescript
// Chargement paresseux pour les composants lourds
import dynamic from 'next/dynamic';

const AnnouncementForm = dynamic(
  () => import('@/components/partage/AnnouncementForm'),
  {
    loading: () => <div>Chargement du formulaire...</div>,
    ssr: false
  }
);
```

### Optimisation des images
```tsx
import Image from 'next/image';

// Utilisez toujours le composant Image de Next.js
<Image
  src="/images/dodomove-logo.png"
  alt="Logo Dodomove"
  width={200}
  height={50}
  priority={true} // Pour les images above-the-fold
/>
```

### Mémorisation des composants
```typescript
import { memo, useMemo } from 'react';

// Mémorisation d'un composant coûteux
export const AnnouncementCard = memo(function AnnouncementCard({ announcement }: Props) {
  const formattedDate = useMemo(() => 
    formatDate(announcement.date), 
    [announcement.date]
  );
  
  return (
    <div>
      {/* Contenu du composant */}
    </div>
  );
});
```

## Sécurité

### Validation côté client
```typescript
// Toujours valider les données avant envoi
function submitAnnouncement(data: AnnouncementFormData) {
  const errors = validateAnnouncement(data);
  if (errors.length > 0) {
    setFormErrors(errors);
    return;
  }
  
  // Envoyer les données
  submitToAPI(data);
}
```

### Sanitisation des données
```typescript
// Échapper les caractères dangereux
import DOMPurify from 'dompurify';

function sanitizeDescription(html: string): string {
  return DOMPurify.sanitize(html);
}
```

## Déploiement

### Variables d'environnement
```bash
# Production
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr
NODE_ENV=production
```

### Build de production
```bash
# Test du build avant déploiement
npm run build
npm run start

# Vérification de la taille du bundle
npm run build -- --analyze
```

## Bonnes pratiques générales

1. **Toujours typer vos données** avec TypeScript
2. **Gérer les états de chargement** et d'erreur
3. **Valider les données** côté client ET serveur
4. **Optimiser les performances** avec lazy loading et mémorisation
5. **Tester sur mobile** régulièrement
6. **Suivre les conventions** de l'écosystème Dodomove
7. **Documenter les changements** importants
8. **Utiliser les outils de développement** (ESLint, Prettier)

## Ressources utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Zustand](https://zustand-demo.pmnd.rs/)
- [React DevTools](https://react.dev/learn/react-developer-tools) 