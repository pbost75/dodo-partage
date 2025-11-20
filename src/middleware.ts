/**
 * 🔄 MIDDLEWARE NEXT.JS - REDIRECTION DES ANNONCES EXPIRÉES
 * 
 * Intercepte les requêtes vers /annonce/[id] et redirige intelligemment
 * les annonces expirées/supprimées vers les pages destinations correspondantes.
 * 
 * Évite les 404 SEO toxiques pour les annonces déjà indexées par Google.
 * 
 * 🚀 OPTIMISATION: Utilise la route backend dédiée /api/partage/get-announcement/:id
 * au lieu de faire 3 appels à la liste (plus rapide et fiable).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fonction pour normaliser les accents et caractères spéciaux en ASCII
function normalizeToAscii(text: string): string {
  return text
    .normalize('NFD') // Décompose les caractères accentués (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques (accents)
    .toLowerCase()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^a-z0-9-]/g, ''); // Supprime tout ce qui n'est pas alphanumérique ou tiret
}

export async function middleware(request: NextRequest) {
  // Intercepter uniquement les URLs d'annonces individuelles
  const url = request.nextUrl.clone();
  
  // 🔍 DEBUG: Log toutes les requêtes pour voir ce qui passe
  console.log(`🔍 Middleware: Requête reçue - ${request.method} ${url.pathname} (hostname: ${url.hostname})`);
  
  // Matcher les URLs du type /annonce/[id] avec ou sans slash final
  const announcementMatch = url.pathname.match(/^\/annonce\/([^\/]+)\/?$/);
  
  if (announcementMatch) {
    console.log(`✅ Middleware: Match trouvé pour ${url.pathname}`);
    const announcementId = announcementMatch[1];
    
    try {
      console.log(`🔍 Middleware: Vérification annonce ${announcementId}`);
      
      // 🚀 OPTIMISATION: Utiliser la route backend dédiée qui fonctionne pour tous les statuts
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
      
      // Timeout pour éviter de bloquer trop longtemps (compatible Edge Runtime)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes max
      
      const response = await fetch(`${backendUrl}/api/partage/get-announcement/${encodeURIComponent(announcementId)}`, {
        headers: {
          'User-Agent': 'DodoPartage-Middleware/1.0',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Si le backend ne répond pas correctement, rediriger vers homepage
      if (!response || !response.ok) {
        console.log(`⚠️ Middleware: Backend non disponible pour ${announcementId} (status: ${response?.status || 'no response'}) → homepage`);
        return NextResponse.redirect(new URL('/', request.url), 301);
      }
      
      const result = await response.json();
      
      // Si pas de données, rediriger vers homepage
      if (!result.success || !result.data) {
        console.log(`⚠️ Middleware: Backend OK mais pas de données pour ${announcementId} → homepage`);
        return NextResponse.redirect(new URL('/', request.url), 301);
      }
      
      const announcement = result.data;
      
      // 🔍 DEBUG: Log le statut de l'annonce
      console.log(`📊 Middleware: Annonce ${announcementId} trouvée avec statut: ${announcement.status}`);
      
      // Si l'annonce est expirée ou supprimée, rediriger vers la page destination
      if (announcement.status === 'expired' || announcement.status === 'deleted') {
        const departure = announcement.departure_country || announcement.departure;
        const arrival = announcement.arrival_country || announcement.arrival;
        
        if (departure && arrival) {
          // Normaliser les noms de destinations (minuscules, tirets, sans accents)
          const normalizedDeparture = normalizeToAscii(departure);
          const normalizedArrival = normalizeToAscii(arrival);
          
          // 🔧 SIMPLIFICATION: Utiliser une URL relative simple
          // Le worker Cloudflare la transfèrera correctement vers www.dodomove.fr/partage/...
          const destinationUrl = `/${normalizedDeparture}-${normalizedArrival}/`;
          const redirectUrl = new URL(destinationUrl, request.url);
          
          console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → ${redirectUrl.toString()}`);
          
          return NextResponse.redirect(redirectUrl, 301); // Redirection permanente
        } else {
          // Si pas de destination, rediriger vers homepage
          console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → homepage (pas de destination)`);
          return NextResponse.redirect(new URL('/', request.url), 301);
        }
      }
      
      // Si l'annonce est active (published, pending_validation, etc.), laisser passer
      console.log(`✅ Middleware: Annonce ${announcementId} active (${announcement.status}), passage normal`);
      return NextResponse.next();
      
    } catch (error) {
      // Gérer les erreurs de timeout ou réseau
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        console.error(`⏱️ Middleware: Timeout pour annonce ${announcementId} → homepage`);
      } else {
        console.error(`❌ Middleware: Erreur pour annonce ${announcementId}:`, error);
      }
      
      // En cas d'erreur, rediriger vers homepage plutôt que de laisser passer (évite les 404)
      console.log(`🔄 Middleware: Redirection erreur ${announcementId} → homepage`);
      return NextResponse.redirect(new URL('/', request.url), 301);
    }
  } else {
    // Pas de match - laisser passer
    console.log(`⏭️ Middleware: Pas de match pour ${url.pathname}, passage normal`);
  }
  
  // Pour toutes les autres URLs, laisser passer normalement
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Appliquer le middleware uniquement aux URLs d'annonces
    // Format Next.js 13+ : utiliser des patterns glob
    // Essayer avec et sans trailing slash
    '/annonce/:path*',
  ],
};
