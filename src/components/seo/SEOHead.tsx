'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getCanonicalUrl, shouldIndexPage } from '@/utils/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string; // URL canonical personnalisée (optionnel)
}

/**
 * Composant pour gérer les balises SEO (canonical, robots, etc.)
 * À utiliser dans chaque page pour éviter le duplicate content
 */
export function SEOHead({ title, description, canonical }: SEOHeadProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Supprimer /partage du pathname si présent (pour construire la canonical)
    const cleanPathname = pathname.replace(/^\/partage/, '') || '/';
    
    // Générer l'URL canonical
    const canonicalUrl = canonical || getCanonicalUrl(cleanPathname);
    
    // Déterminer si on doit indexer cette page
    const shouldIndex = shouldIndexPage();
    
    // Gérer la balise canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // Gérer les balises robots
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    
    if (shouldIndex) {
      robotsMeta.setAttribute('content', 'index, follow');
    } else {
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    }
    
    // Gérer le title si fourni
    if (title) {
      document.title = title;
    }
    
    // Gérer la description si fournie
    if (description) {
      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.setAttribute('name', 'description');
        document.head.appendChild(descriptionMeta);
      }
      descriptionMeta.setAttribute('content', description);
    }
    
    // Debug en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SEO Debug:', {
        pathname,
        cleanPathname,
        canonicalUrl,
        shouldIndex,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
      });
    }
    
  }, [pathname, title, description, canonical]);
  
  // Ce composant ne rend rien visuellement
  return null;
} 