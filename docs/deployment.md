# Guide de déploiement - DodoPartage

Ce guide explique comment déployer DodoPartage en production sur différentes plateformes.

## Vue d'ensemble

DodoPartage est conçu pour être déployé sur **Vercel** avec le sous-domaine `partage.dodomove.fr`, en s'intégrant parfaitement à l'écosystème Dodomove existant.

## Plateformes de déploiement

### Option 1 : Vercel (Recommandé)

Vercel est la plateforme idéale pour les projets Next.js, offrant un déploiement automatique et une excellente performance.

#### Configuration Vercel

1. **Connexion du repository**
```bash
# Installez Vercel CLI
npm i -g vercel

# Connectez votre projet
vercel

# Suivez les instructions pour lier votre repository GitHub
```

2. **Configuration des variables d'environnement**
```bash
# Ajoutez les variables via l'interface Vercel ou CLI
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_DODOMOVE_URL production
```

3. **Configuration du domaine personnalisé**
- Aller dans Project Settings > Domains
- Ajouter `partage.dodomove.fr`
- Configurer les DNS chez votre registraire

#### Fichier de configuration Vercel
```json
{
  "version": 2,
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "redirects": [
    {
      "source": "/admin",
      "destination": "/gestion",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Option 2 : Netlify

Si vous préférez Netlify, voici la configuration :

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Option 3 : Docker (Auto-hébergement)

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## Variables d'environnement

### Variables de production obligatoires

```env
# Backend et APIs
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_APP_URL=https://partage.dodomove.fr

# Écosystème Dodomove
NEXT_PUBLIC_DODOMOVE_URL=https://dodomove.fr
NEXT_PUBLIC_FUNNEL_URL=https://devis.dodomove.fr

# Configuration de production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Variables optionnelles

```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWE8386BQC

# Sécurité et administration
ADMIN_SECRET_KEY=secure-random-string-here
EMAIL_VALIDATION_SECRET=another-secure-random-string

# Monitoring (optionnel)
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=your-analytics-id
```

## Processus de déploiement

### 1. Préparation du déploiement

```bash
# Vérifiez que tout fonctionne localement
npm run lint
npm run build
npm run start

# Testez en mode production local
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

### 2. Tests pré-déploiement

```bash
# Vérifiez les types TypeScript
npx tsc --noEmit

# Vérifiez la taille du bundle
npm run build
du -sh .next

# Testez les API endpoints
curl http://localhost:3000/api/health
```

### 3. Déploiement automatique

```bash
# Avec Vercel
git push origin main  # Déploiement automatique

# Avec déploiement manuel
vercel --prod
```

### 4. Vérification post-déploiement

- ✅ Page d'accueil charge correctement
- ✅ Formulaires fonctionnent 
- ✅ APIs répondent
- ✅ Emails se déclenchent
- ✅ Design responsive sur mobile
- ✅ Performance (Lighthouse score > 90)

## Configuration DNS

### Chez votre registraire DNS

```dns
# Configuration pour partage.dodomove.fr
Type: CNAME
Name: partage
Value: cname.vercel-dns.com
TTL: 300

# Ou pour une IP statique
Type: A
Name: partage  
Value: 76.76.19.123
TTL: 300
```

### Vérification DNS

```bash
# Testez la résolution DNS
dig partage.dodomove.fr
nslookup partage.dodomove.fr

# Testez le certificat SSL
curl -I https://partage.dodomove.fr
```

## Monitoring et surveillance

### Métriques importantes

1. **Performance**
   - Core Web Vitals (LCP, FID, CLS)
   - Time to First Byte (TTFB)
   - Bundle size

2. **Disponibilité**
   - Uptime de l'application
   - Réponse des APIs
   - Temps de réponse

3. **Erreurs**
   - Erreurs JavaScript
   - Erreurs de build
   - Erreurs d'API

### Configuration Sentry (Optionnel)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### Logs d'application

```typescript
// utils/logger.ts
export function logError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Envoi vers service de monitoring
    console.error('Production Error:', error, context);
  } else {
    console.error('Dev Error:', error, context);
  }
}
```

## Sauvegardes et récupération

### Données importantes à sauvegarder

1. **Code source** : Repository Git
2. **Variables d'environnement** : Documentation sécurisée
3. **Configuration** : Fichiers de config Vercel/Netlify
4. **Données Airtable** : Gérées par le backend centralisé

### Plan de récupération

```bash
# En cas de problème, rollback rapide
vercel rollback [deployment-url]

# Ou redéploiement depuis une version stable
git checkout v1.0.0
vercel --prod
```

## Optimisations de production

### 1. Performance

```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['dodomove.fr'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
```

### 2. Bundle analysis

```bash
# Analysez la taille du bundle
npm install --save-dev @next/bundle-analyzer

# Ajoutez dans package.json
"analyze": "ANALYZE=true npm run build"

# Exécutez l'analyse
npm run analyze
```

### 3. Caching

```javascript
// Headers de cache appropriés
const securityHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  },
];
```

## Checklist de déploiement

### Avant le déploiement

- [ ] Tests passent localement
- [ ] Build de production réussit
- [ ] Variables d'environnement configurées
- [ ] DNS configuré
- [ ] Certificats SSL en place

### Après le déploiement

- [ ] Page d'accueil accessible
- [ ] Formulaires fonctionnent
- [ ] APIs répondent correctement
- [ ] Emails se déclenchent
- [ ] Performance optimale (Lighthouse)
- [ ] Responsive design vérifié
- [ ] Analytics configurés

### Monitoring continu

- [ ] Alertes de monitoring configurées
- [ ] Logs d'erreurs surveillés
- [ ] Performance monitorée
- [ ] Sauvegardes programmées

## Dépannage

### Problèmes courants

#### 1. Erreur de build
```bash
# Vérifiez les types TypeScript
npx tsc --noEmit

# Nettoyez le cache
rm -rf .next node_modules
npm install
npm run build
```

#### 2. Variables d'environnement
```bash
# Vérifiez dans la console Vercel
vercel env ls

# Ajoutez les variables manquantes
vercel env add VARIABLE_NAME production
```

#### 3. Problème de domaine
```bash
# Vérifiez la configuration DNS
dig partage.dodomove.fr

# Vérifiez les certificats
openssl s_client -connect partage.dodomove.fr:443
```

#### 4. Performance lente
```bash
# Analysez le bundle
npm run analyze

# Vérifiez les Core Web Vitals
lighthouse https://partage.dodomove.fr
```

## Sécurité en production

### Headers de sécurité

```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Protection CSRF et rate limiting

```typescript
// Gérée par le backend centralisé
// Pas de configuration spécifique nécessaire côté frontend
```

## Maintenance

### Mises à jour régulières

```bash
# Mettez à jour les dépendances mensuellement
npm update
npm audit
npm run build

# Testez et déployez
```

### Surveillance des performances

- Vérifiez mensuellement les Core Web Vitals
- Surveillez la taille du bundle
- Optimisez les images et assets
- Mettez à jour Next.js régulièrement

Ce guide couvre tous les aspects du déploiement de DodoPartage. Suivez ces étapes pour un déploiement réussi et maintenez votre application en production. 