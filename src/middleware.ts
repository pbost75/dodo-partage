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
  
  // Matcher les URLs du type /annonce/[id] avec ou sans slash final
  const announcementMatch = url.pathname.match(/^\/annonce\/([^\/]+)\/?$/);
  
  if (announcementMatch) {
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
              const destinationUrl = `/${normalizedDeparture}-${normalizedArrival}/`;
              
              console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → ${destinationUrl}`);
              
              return NextResponse.redirect(new URL(destinationUrl, request.url), 301); // Redirection permanente
            } else {
              // Si pas de destination, rediriger vers homepage
              console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → homepage (pas de destination)`);
              return NextResponse.redirect(new URL('/', request.url), 301);
            }
          }
          
          // Si l'annonce est active (published, pending_validation, etc.), laisser passer
          console.log(`✅ Middleware: Annonce ${announcementId} active (${announcement.status}), passage normal`);
          return NextResponse.next();
        }
      }
      
      // Si l'annonce n'existe pas (404) ou erreur, rediriger vers homepage
      if (response.status === 404) {
        console.log(`🔄 Middleware: Annonce ${announcementId} non trouvée (404) → homepage`);
      } else {
        console.log(`⚠️ Middleware: Erreur backend pour ${announcementId} (${response.status}) → homepage`);
      }
      
      return NextResponse.redirect(new URL('/', request.url), 301);
      
    } catch (error) {
      // Gérer les erreurs de timeout ou réseau
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.error(`⏱️ Middleware: Timeout pour annonce ${announcementId}`);
      } else {
        console.error(`❌ Middleware: Erreur pour annonce ${announcementId}:`, error);
      }
      
      // En cas d'erreur, rediriger vers homepage plutôt que de laisser passer (évite les 404)
      return NextResponse.redirect(new URL('/', request.url), 301);
    }
  }
  
  // Pour toutes les autres URLs, laisser passer normalement
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Appliquer le middleware uniquement aux URLs d'annonces
    '/annonce/:id*',
  ],
};
