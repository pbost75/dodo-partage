/**
 * 🔄 MIDDLEWARE NEXT.JS - REDIRECTION DES ANNONCES EXPIRÉES
 * 
 * Intercepte les requêtes vers /annonce/[id] et redirige intelligemment
 * les annonces expirées/supprimées vers les pages destinations correspondantes.
 * 
 * Évite les 404 SEO toxiques pour les annonces déjà indexées par Google.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Intercepter uniquement les URLs d'annonces individuelles
  const url = request.nextUrl.clone();
  
  // Matcher les URLs du type /annonce/[id]
  const announcementMatch = url.pathname.match(/^\/annonce\/([^\/]+)$/);
  
  if (announcementMatch) {
    const announcementId = announcementMatch[1];
    
    try {
      console.log(`🔍 Middleware: Vérification annonce ${announcementId}`);
      
      // Appel au backend centralisé via l'API locale qui gère les statuts expired/deleted
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
      
      // D'abord essayer avec les annonces expirées
      let response = await fetch(`${backendUrl}/api/partage/get-announcements?status=expired`, {
        headers: {
          'User-Agent': 'DodoPartage-Middleware/1.0',
        },
      });
      
      let announcement = null;
      
      if (response.ok) {
        const result = await response.json();
        announcement = result.data?.find((ann: any) => ann.id === announcementId || ann.reference === announcementId);
      }
      
      // Si pas trouvé dans expired, essayer deleted
      if (!announcement) {
        response = await fetch(`${backendUrl}/api/partage/get-announcements?status=deleted`, {
          headers: {
            'User-Agent': 'DodoPartage-Middleware/1.0',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          announcement = result.data?.find((ann: any) => ann.id === announcementId || ann.reference === announcementId);
        }
      }
      
      // Si pas trouvé dans expired/deleted, essayer published (annonce active)
      if (!announcement) {
        response = await fetch(`${backendUrl}/api/partage/get-announcements?status=published`, {
          headers: {
            'User-Agent': 'DodoPartage-Middleware/1.0',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          announcement = result.data?.find((ann: any) => ann.id === announcementId || ann.reference === announcementId);
        }
      }
      
      if (announcement) {
        
        // Si l'annonce est expirée ou supprimée, rediriger vers la page destination
        if (announcement.status === 'expired' || announcement.status === 'deleted') {
          const departure = announcement.departure || announcement.departure_country;
          const arrival = announcement.arrival || announcement.arrival_country;
          
          if (departure && arrival) {
            const destinationUrl = `/${departure}-${arrival}/`;
            console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → ${destinationUrl}`);
            
            return NextResponse.redirect(new URL(destinationUrl, request.url), 301); // Redirection permanente
          } else {
            // Si pas de destination, rediriger vers homepage
            console.log(`🔄 Middleware: Redirection ${announcementId} (${announcement.status}) → homepage`);
            return NextResponse.redirect(new URL('/', request.url), 301);
          }
        }
        
        // Si l'annonce est active, laisser passer
        console.log(`✅ Middleware: Annonce ${announcementId} active, passage normal`);
        return NextResponse.next();
        
      } else {
        // Si l'annonce n'existe pas du tout, rediriger vers homepage
        console.log(`🔄 Middleware: Annonce ${announcementId} non trouvée → homepage`);
        return NextResponse.redirect(new URL('/', request.url), 301);
      }
      
    } catch (error) {
      console.error(`❌ Middleware: Erreur pour annonce ${announcementId}:`, error);
      // En cas d'erreur, laisser passer pour éviter de casser le site
      return NextResponse.next();
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
