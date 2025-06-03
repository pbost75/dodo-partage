# Guide de tests - DodoPartage

Ce guide explique comment tester efficacement DodoPartage pour garantir la qualité et la fiabilité de l'application.

## Types de tests

### 1. Tests unitaires (Composants)
Tests des composants React individuels pour vérifier leur comportement isolé.

### 2. Tests d'intégration
Tests des interactions entre composants et des flux de données.

### 3. Tests end-to-end (E2E)
Tests de l'expérience utilisateur complète depuis l'interface.

### 4. Tests de validation
Tests des formulaires et de la validation des données.

## Configuration des tests

### Installation des dépendances de test

```bash
# Installation des outils de test
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom
npm install --save-dev @types/jest

# Pour les tests E2E (optionnel)
npm install --save-dev playwright @playwright/test
```

### Configuration Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock des variables d'environnement
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
```

## Tests des composants UI

### Exemple : Test du composant Button

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#F47D6C]')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Exemple : Test du MonthPicker

```typescript
// src/components/ui/__tests__/MonthPicker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MonthPicker from '../MonthPicker'

describe('MonthPicker Component', () => {
  const mockOnMonthsChange = jest.fn()

  beforeEach(() => {
    mockOnMonthsChange.mockClear()
  })

  it('displays default placeholder', () => {
    render(
      <MonthPicker 
        selectedMonths={[]} 
        onMonthsChange={mockOnMonthsChange} 
      />
    )
    expect(screen.getByText('Peu importe')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    render(
      <MonthPicker 
        selectedMonths={[]} 
        onMonthsChange={mockOnMonthsChange} 
      />
    )
    
    fireEvent.click(screen.getByText('Peu importe'))
    expect(screen.getByText('Janvier')).toBeInTheDocument()
  })

  it('selects a month when clicked', () => {
    render(
      <MonthPicker 
        selectedMonths={[]} 
        onMonthsChange={mockOnMonthsChange} 
      />
    )
    
    fireEvent.click(screen.getByText('Peu importe'))
    fireEvent.click(screen.getByText('Mars'))
    
    expect(mockOnMonthsChange).toHaveBeenCalledWith(['Mars 2024'])
  })

  it('displays selected months correctly', () => {
    render(
      <MonthPicker 
        selectedMonths={['Mars 2024']} 
        onMonthsChange={mockOnMonthsChange} 
      />
    )
    expect(screen.getByText('Mars 2024')).toBeInTheDocument()
  })
})
```

## Tests des composants spécifiques

### Test du composant AnnouncementCard

```typescript
// src/components/partage/__tests__/AnnouncementCard.test.tsx
import { render, screen } from '@testing-library/react'
import AnnouncementCard from '../AnnouncementCard'

const mockAnnouncement = {
  id: '1',
  type: 'offer' as const,
  title: 'Conteneur vers la Réunion',
  departure: 'France métropolitaine',
  arrival: 'Réunion',
  volume: '2.5 m³',
  volumeCategory: '1-3' as const,
  date: '15 mars 2024',
  price: '150€',
  items: ['Mobilier', 'Électroménager'],
  author: 'Jean',
  publishedAt: 'Publié il y a 2 heures',
  description: 'Description test'
}

describe('AnnouncementCard', () => {
  it('renders announcement information', () => {
    render(<AnnouncementCard {...mockAnnouncement} />)
    
    expect(screen.getByText('Conteneur vers la Réunion')).toBeInTheDocument()
    expect(screen.getByText('France métropolitaine')).toBeInTheDocument()
    expect(screen.getByText('Réunion')).toBeInTheDocument()
    expect(screen.getByText('2.5 m³')).toBeInTheDocument()
    expect(screen.getByText('150€')).toBeInTheDocument()
  })

  it('displays correct offer/request styling', () => {
    const { rerender } = render(<AnnouncementCard {...mockAnnouncement} />)
    expect(screen.getByText('PROPOSE')).toBeInTheDocument()

    rerender(<AnnouncementCard {...mockAnnouncement} type="request" />)
    expect(screen.getByText('RECHERCHE')).toBeInTheDocument()
  })

  it('shows contact button', () => {
    render(<AnnouncementCard {...mockAnnouncement} />)
    expect(screen.getByText('Contacter')).toBeInTheDocument()
  })
})
```

## Tests d'intégration

### Test de la barre de recherche

```typescript
// src/app/__tests__/search.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HomePage from '../page'

// Mock du hook ou des APIs si nécessaire
jest.mock('@/utils/api', () => ({
  fetchAnnouncements: jest.fn(() => Promise.resolve([])),
}))

describe('Search Integration', () => {
  it('performs search without date selection', async () => {
    render(<HomePage />)
    
    // Sélectionner départ et destination
    const departureSelect = screen.getByText('Sélectionnez un départ')
    fireEvent.click(departureSelect)
    fireEvent.click(screen.getByText('France métropolitaine'))
    
    const destinationSelect = screen.getByText('Sélectionnez une destination')
    fireEvent.click(destinationSelect)
    fireEvent.click(screen.getByText('Réunion'))
    
    // Cliquer sur rechercher sans sélectionner de date
    const searchButton = screen.getByText('Rechercher')
    fireEvent.click(searchButton)
    
    // Vérifier que la recherche s'exécute
    await waitFor(() => {
      expect(screen.getByText(/annonce.*trouvée/)).toBeInTheDocument()
    })
  })

  it('shows "Peu importe" as default date placeholder', () => {
    render(<HomePage />)
    expect(screen.getByText('Peu importe')).toBeInTheDocument()
  })
})
```

## Tests de validation

### Test de validation d'email

```typescript
// src/utils/__tests__/validation.test.ts
import { validateEmail, validateAnnouncement } from '../validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
    })
  })

  describe('validateAnnouncement', () => {
    it('validates complete announcement data', () => {
      const validData = {
        contactName: 'Jean Dupont',
        contactEmail: 'jean@example.com',
        departureCountry: 'France',
        arrivalCountry: 'Réunion',
        volume: 2.5,
        date: new Date(),
        objectTypes: 'Mobilier',
        acceptTerms: true
      }

      const errors = validateAnnouncement(validData)
      expect(errors).toHaveLength(0)
    })

    it('returns errors for invalid data', () => {
      const invalidData = {
        contactName: '',
        contactEmail: 'invalid-email',
        volume: -1
      }

      const errors = validateAnnouncement(invalidData)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.field === 'contactName')).toBe(true)
      expect(errors.some(e => e.field === 'contactEmail')).toBe(true)
    })
  })
})
```

## Tests E2E avec Playwright

### Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Test E2E complet

```typescript
// e2e/search-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Search Flow', () => {
  test('user can search without selecting dates', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que "Peu importe" est affiché par défaut
    await expect(page.getByText('Peu importe')).toBeVisible()
    
    // Sélectionner départ
    await page.click('text=Sélectionnez un départ')
    await page.click('text=France métropolitaine')
    
    // Sélectionner destination
    await page.click('text=Sélectionnez une destination')
    await page.click('text=Réunion')
    
    // Cliquer sur rechercher
    await page.click('button:has-text("Rechercher")')
    
    // Vérifier que les résultats s'affichent
    await expect(page.getByText(/annonce.*trouvée/)).toBeVisible()
  })

  test('user can select dates and search', async ({ page }) => {
    await page.goto('/')
    
    // Cliquer sur le sélecteur de dates
    await page.click('text=Peu importe')
    
    // Sélectionner Mars dans le calendrier
    await page.click('text=Mars')
    
    // Vérifier que la date est sélectionnée
    await expect(page.getByText('Mars 2024')).toBeVisible()
    
    // Effectuer la recherche
    await page.click('button:has-text("Rechercher")')
    
    // Vérifier les résultats
    await expect(page.getByText(/annonce.*trouvée/)).toBeVisible()
  })
})
```

## Scripts de test

### Ajout dans package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Couverture de code

### Configuration de la couverture

```javascript
// jest.config.js (ajout)
module.exports = createJestConfig({
  // ... config existante
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
})
```

## Mocking et fixtures

### Mock des APIs

```typescript
// src/__mocks__/api.ts
export const mockAnnouncements = [
  {
    id: '1',
    type: 'offer',
    title: 'Test Announcement',
    departure: 'France',
    arrival: 'Réunion',
    // ... autres propriétés
  },
]

export const fetchAnnouncements = jest.fn(() => 
  Promise.resolve(mockAnnouncements)
)
```

### Fixtures de test

```typescript
// src/__fixtures__/announcements.ts
export const createMockAnnouncement = (overrides = {}) => ({
  id: '1',
  type: 'offer' as const,
  title: 'Conteneur test',
  departure: 'France métropolitaine',
  arrival: 'Réunion',
  volume: '2.5 m³',
  volumeCategory: '1-3' as const,
  date: '15 mars 2024',
  items: ['Test'],
  author: 'Testeur',
  publishedAt: 'Test',
  description: 'Test description',
  ...overrides,
})
```

## Commandes de test

```bash
# Exécuter tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E avec interface
npm run test:e2e:ui

# Tous les tests
npm run test:all
```

## Bonnes pratiques

1. **Écrire des tests lisibles** avec des noms descriptifs
2. **Tester les comportements** plutôt que l'implémentation
3. **Utiliser des fixtures** pour les données de test
4. **Mocker les dépendances** externes
5. **Tester les cas d'erreur** autant que les cas de succès
6. **Maintenir une couverture** de code élevée
7. **Tests d'accessibilité** avec les rôles ARIA
8. **Tests responsive** sur différentes tailles d'écran

Cette stratégie de tests garantit la qualité et la fiabilité de DodoPartage tout en facilitant la maintenance et l'évolution du code. 