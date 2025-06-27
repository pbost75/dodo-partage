# Infrastructure Proxy Cloudflare - DodoPartage

## Vue d'ensemble

DodoPartage est accessible via **2 URLs distinctes** grâce à une infrastructure proxy Cloudflare :

- 🔗 **URL technique** : `https://partage.dodomove.fr` (Vercel)
- 🎯 **URL SEO-friendly** : `https://www.dodomove.fr/partage` (Cloudflare Worker → Vercel)

Cette architecture permet d'offrir une **URL cohérente avec le site principal** tout en conservant la **flexibilité technique** du sous-domaine dédié.

## Architecture technique

```
┌─── Client (navigateur) ──────────────────────────┐
│                                                  │
│  🌐 www.dodomove.fr/partage                     │
│  ↓                                              │
│  🔄 Cloudflare Worker (proxy)                   │
│  ↓                                              │  
│  🚀 partage.dodomove.fr (Vercel)                │
│  ↓                                              │
│  📱 Next.js App (navigation intelligente)       │
│  ↓                                              │
│  🔌 API calls cross-domain automatiques         │
│  ↓                                              │
│  🖥️ dodomove-backend (Railway)                  │
│  ↓                                              │
│  📊 Airtable + 📧 Resend                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Configuration Cloudflare

### Worker de proxy

Le **Cloudflare Worker** configuré sur `www.dodomove.fr` intercepte toutes les requêtes vers `/partage/*` et les proxifie vers `partage.dodomove.fr`.

**Fonctionnalités du Worker :**
- ✅ **Proxy transparent** : Réécriture des URLs
- ✅ **Headers CORS** : Support cross-domain  
- ✅ **Gestion redirections** : Préservation du contexte
- ✅ **Cache intelligent** : Optimisation performances

### DNS et domaines

**Configuration DNS chez Hostinger :**
```
dodomove.fr         A    [IP Hostinger]
www.dodomove.fr     A    [IP Hostinger] 
partage.dodomove.fr CNAME  cname.vercel-dns.com
```

**Cloudflare en mode proxy :**
- 🟠 `dodomove.fr` - Proxied (orange cloud)
- 🟠 `www.dodomove.fr` - Proxied (orange cloud)  
- 🟠 `partage.dodomove.fr` - Proxied (orange cloud)

## Gestion cross-domain côté Next.js

### Navigation intelligente

**Détection automatique du contexte :**
```typescript
// src/utils/navigation.ts
export function isProxiedContext(): boolean {
  return typeof window !== 'undefined' && 
         window.location.hostname === 'www.dodomove.fr';
}

export function buildUrl(path: string): string {
  if (isProxiedContext()) {
    return `/partage${path}`;  // Ajoute /partage pour www.dodomove.fr
  }
  return path;  // URL normale pour partage.dodomove.fr
}
```

**Router intelligent :**
```typescript
// src/hooks/useSmartRouter.ts
export function useSmartRouter() {
  const router = useRouter();
  
  return {
    push: (path: string) => {
      const url = buildUrl(path);
      router.push(url);
    },
    // ... autres méthodes
  };
}
```

### Appels API cross-domain

**Fonction universelle pour les appels API :**
```typescript
// src/utils/apiUtils.ts
export async function apiFetch(path: string, options?: RequestInit) {
  let url: string;
  
  if (isProxiedContext()) {
    // Depuis www.dodomove.fr → appel vers partage.dodomove.fr
    url = `https://partage.dodomove.fr${path}`;
  } else {
    // Depuis partage.dodomove.fr → appel local
    url = path;
  }
  
  return fetch(url, options);
}
```

**Headers CORS sur toutes les routes API :**
```typescript
// src/utils/cors.ts
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Appliqué sur TOUTES les réponses API (success + error)
```

## Workflows utilisateur

### Navigation seamless

**Depuis www.dodomove.fr/partage :**
1. ✅ Page d'accueil → `/partage/`
2. ✅ Funnel propose → `/partage/funnel/propose/locations`
3. ✅ Détails annonce → `/partage/annonce/123`
4. ✅ Modification → `/partage/modifier/abc123`

**Depuis partage.dodomove.fr :**
1. ✅ Page d'accueil → `/`
2. ✅ Funnel propose → `/funnel/propose/locations`
3. ✅ Détails annonce → `/annonce/123`
4. ✅ Modification → `/modifier/abc123`

### Appels API transparents

**Depuis les 2 domaines :**
- ✅ `apiFetch('/api/submit-announcement')` → Fonctionne
- ✅ `apiFetch('/api/get-announcements')` → Fonctionne  
- ✅ `apiFetch('/api/contact-announcement')` → Fonctionne
- ✅ Tous les endpoints avec headers CORS complets

## Configuration Backend Railway

### Variables d'environnement

**Variable cruciale côté backend :**
```env
PARTAGE_APP_URL=https://www.dodomove.fr/partage
```

Cette variable est utilisée par le backend pour :
- 📧 **Génération des liens** dans les emails
- 🔗 **Redirections** après validation
- 📱 **URLs callback** dans les notifications

### Endpoints backend adaptés

Le backend Railway gère automatiquement les 2 contextes :
- ✅ **Emails avec liens** vers `www.dodomove.fr/partage/*`
- ✅ **Validation tokens** compatibles cross-domain
- ✅ **Callback URLs** adaptées au contexte

## Avantages de cette architecture

### 🎯 SEO et UX
- **URL cohérente** : `www.dodomove.fr/partage` intégré au site principal
- **Pas de redirection** : Expérience utilisateur fluide
- **Crawl SEO** : Google voit une seule arborescence

### ⚡ Performance
- **Cache Cloudflare** : Mise en cache intelligente
- **Edge computing** : Traitement à la périphérie
- **CDN global** : Diffusion mondiale optimisée

### 🔧 Flexibilité technique
- **Déploiement séparé** : DodoPartage reste autonome sur Vercel
- **Scaling indépendant** : Peut gérer sa propre charge
- **Développement agile** : Cycle de release séparé

### 🛡️ Sécurité et maintenance
- **Isolation** : Panne sur un service n'affecte pas l'autre
- **Backup URL** : `partage.dodomove.fr` reste accessible en fallback
- **Monitoring séparé** : Métriques dédiées par service

## Tests et debugging

### Pages de debug incluses

**Page test navigation :**
- 🔗 URL : `/test-navigation`
- 🧪 **Fonction** : Teste la génération d'URLs selon le contexte
- 📊 **Affiche** : URLs générées pour chaque domaine

**Page debug store :**
- 🔗 URL : `/debug-store`  
- 🧪 **Fonction** : Inspecte l'état des stores Zustand
- 🔄 **Actions** : Reset, diagnostic localStorage

### Commandes de test

```bash
# Test URLs cross-domain
curl -H "Host: www.dodomove.fr" https://partage.dodomove.fr/test-navigation

# Test API CORS
curl -H "Origin: https://www.dodomove.fr" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://partage.dodomove.fr/api/submit-announcement

# Test backend connectivity
curl https://partage.dodomove.fr/api/test-backend
```

## Monitoring et métriques

### Cloudflare Analytics
- 📊 **Trafic proxy** : Requêtes traitées par le Worker
- ⚡ **Performance** : Latence edge computing
- 🌍 **Géolocalisation** : Répartition géographique

### Vercel Analytics  
- 📈 **Core Web Vitals** : Performance Next.js
- 🔍 **Pages populaires** : Funnel analytics
- 🚨 **Erreurs** : Monitoring en temps réel

### Backend Railway
- 🖥️ **API calls** : Volume et latence
- 📧 **Emails sent** : Taux de délivrance  
- 💾 **Database** : Performance Airtable

## Troubleshooting

### Problèmes courants

**1. Erreurs CORS :**
```
❌ Access-Control-Allow-Origin header missing
✅ Vérifier que toutes les réponses API incluent CORS_HEADERS
```

**2. Navigation cassée :**
```
❌ URLs sans préfixe /partage sur www.dodomove.fr
✅ Utiliser useSmartRouter() au lieu de useRouter()
```

**3. Appels API en échec :**
```
❌ fetch('/api/...') depuis www.dodomove.fr
✅ Utiliser apiFetch('/api/...') 
```

### Commandes de diagnostic

```bash
# Vérifier la config DNS
dig partage.dodomove.fr

# Tester le proxy Cloudflare  
curl -H "Host: www.dodomove.fr" https://partage.dodomove.fr/

# Valider les headers CORS
curl -I -H "Origin: https://www.dodomove.fr" \
     https://partage.dodomove.fr/api/get-announcements
```

## Migration et déploiement

### Checklist avant déploiement

- [x] ✅ **Cloudflare Worker** configuré et actif
- [x] ✅ **DNS** pointant correctement  
- [x] ✅ **Variables backend** `PARTAGE_APP_URL` mise à jour
- [x] ✅ **Headers CORS** sur toutes les routes API
- [x] ✅ **Navigation** utilise `useSmartRouter()`
- [x] ✅ **API calls** utilisent `apiFetch()`
- [x] ✅ **Tests** navigation et API fonctionnels

### Rollback plan

En cas de problème :
1. 🔄 **Désactiver le Worker** Cloudflare temporairement
2. ↩️ **Rediriger** www.dodomove.fr/partage vers partage.dodomove.fr
3. 📧 **Informer** les utilisateurs du changement temporaire
4. 🔧 **Corriger** le problème côté Next.js
5. ✅ **Réactiver** le proxy une fois fixé

---

## Résumé

Cette infrastructure proxy Cloudflare permet à **DodoPartage** d'être accessible via une **URL SEO-friendly** tout en conservant sa **flexibilité technique**. 

**L'application fonctionne de manière identique** sur les 2 domaines grâce à :
- 🧠 **Navigation intelligente** avec détection automatique du contexte
- 🌐 **API calls cross-domain** transparents
- 🔗 **Headers CORS complets** sur tous les endpoints
- 🛠️ **Outils de debug** intégrés pour le troubleshooting

Cette approche offre le **meilleur des deux mondes** : **expérience utilisateur unifiée** et **architecture technique robuste**. 