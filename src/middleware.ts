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
        const forwardedHost = request.headers.get('x-forwarded-host');
        const originalUrl = request.headers.get('x-original-url');
        
        let homepageUrl: URL;
        if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
          homepageUrl = new URL('https://www.dodomove.fr/partage/');
        } else {
          homepageUrl = new URL('/', request.url);
        }
        
        console.log(`⚠️ Middleware: Backend non disponible pour ${announcementId} (status: ${response?.status || 'no response'}) → homepage → ${homepageUrl.toString()}`);
        return NextResponse.redirect(homepageUrl, 301);
      }
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const announcement = result.data;
          
          // Si l'annonce est expirée ou supprimée, rediriger vers la page destination
          if (announcement.status === 'expired' || announcement.status === 'deleted') {
            const departure = announcement.departure_country || announcement.departure;
            const arrival = announcement.arrival_country || announcement.arrival;
            
            if (departure && arrival) {
              // Normaliser les noms de destinations (minuscules, tirets)
              const normalizedDeparture = departure.toLowerCase().replace(/\s+/g, '-');
              const normalizedArrival = arrival.toLowerCase().replace(/\s+/g, '-');
              
              // 🔧 FIX: Détecter le contexte proxy via les headers
              const forwardedHost = request.headers.get('x-forwarded-host');
              const originalUrl = request.headers.get('x-original-url');
              
              // Construire l'URL de redirection
              // Si on est dans un contexte proxy (www.dodomove.fr), utiliser URL absolue
              // Sinon, utiliser URL relative (sera résolue par Next.js)
              let redirectUrl: URL;
              if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
                // Contexte proxy : URL absolue vers www.dodomove.fr/partage
                redirectUrl = new URL(`https://www.dodomove.fr/partage/${normalizedDeparture}-${normalizedArrival}/`);
                console.log(`🔄 Middleware: Redirection PROXY ${announcementId} (${announcement.status}) → ${redirectUrl.toString()}`);
              } else {
                // Contexte direct : URL relative (le worker la transfèrera si nécessaire)
                redirectUrl = new URL(`/${normalizedDeparture}-${normalizedArrival}/`, request.url);
                console.log(`🔄 Middleware: Redirection DIRECTE ${announcementId} (${announcement.status}) → ${redirectUrl.toString()}`);
              }
              
              console.log(`   Headers: forwardedHost=${forwardedHost}, originalUrl=${originalUrl}`);
              console.log(`   Request URL: ${request.url}, Hostname: ${url.hostname}`);
              
              return NextResponse.redirect(redirectUrl, 301); // Redirection permanente
            } else {
              // Si pas de destination, rediriger vers homepage
              const forwardedHost = request.headers.get('x-forwarded-host');
              const originalUrl = request.headers.get('x-original-url');
              
              let homepageUrl: URL;
              if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
                homepageUrl = new URL('https://www.dodomove.fr/partage/');
              } else {
                homepageUrl = new URL('/', request.url);
              }
              
              console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → homepage (pas de destination) → ${homepageUrl.toString()}`);
              return NextResponse.redirect(homepageUrl, 301);
            }
          }
          
          // Si l'annonce est active (published, pending_validation, etc.), laisser passer
          console.log(`✅ Middleware: Annonce ${announcementId} active (${announcement.status}), passage normal`);
          return NextResponse.next();
        } else {
          // Backend a répondu mais pas de données - rediriger vers homepage
          console.log(`⚠️ Middleware: Backend OK mais pas de données pour ${announcementId} → homepage`);
          const forwardedHost = request.headers.get('x-forwarded-host');
          const originalUrl = request.headers.get('x-original-url');
          
          let homepageUrl: URL;
          if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
            homepageUrl = new URL('https://www.dodomove.fr/partage/');
          } else {
            homepageUrl = new URL('/', request.url);
          }
          
          return NextResponse.redirect(homepageUrl, 301);
        }
      } else {
        // Response pas OK - déjà géré plus haut, mais au cas où
        console.log(`⚠️ Middleware: Response pas OK pour ${announcementId} (status: ${response.status})`);
      }
      
      // Si l'annonce n'existe pas (404) ou erreur, rediriger vers homepage
      const forwardedHost = request.headers.get('x-forwarded-host');
      const originalUrl = request.headers.get('x-original-url');
      
      let homepageUrl: URL;
      if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
        homepageUrl = new URL('https://www.dodomove.fr/partage/');
      } else {
        homepageUrl = new URL('/', request.url);
      }
      
      if (response.status === 404) {
        console.log(`🔄 Middleware: Annonce ${announcementId} non trouvée (404) → homepage → ${homepageUrl.toString()}`);
      } else {
        console.log(`⚠️ Middleware: Erreur backend pour ${announcementId} (${response.status}) → homepage → ${homepageUrl.toString()}`);
      }
      
      return NextResponse.redirect(homepageUrl, 301);
      
    } catch (error) {
      // Gérer les erreurs de timeout ou réseau
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        console.error(`⏱️ Middleware: Timeout pour annonce ${announcementId}`);
      } else {
        console.error(`❌ Middleware: Erreur pour annonce ${announcementId}:`, error);
      }
      
      // En cas d'erreur, rediriger vers homepage plutôt que de laisser passer (évite les 404)
      const forwardedHost = request.headers.get('x-forwarded-host');
      const originalUrl = request.headers.get('x-original-url');
      
      let homepageUrl: URL;
      if (forwardedHost === 'www.dodomove.fr' || originalUrl?.includes('www.dodomove.fr')) {
        homepageUrl = new URL('https://www.dodomove.fr/partage/');
      } else {
        homepageUrl = new URL('/', request.url);
      }
      
      console.log(`🔄 Middleware: Redirection erreur ${announcementId} → homepage → ${homepageUrl.toString()}`);
      return NextResponse.redirect(homepageUrl, 301);
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
    '/annonce/:path*',
  ],
};
