import { MetadataRoute } from 'next'
import { generateAllDestinationCombinations } from '@/utils/destinations'

/**
 * 🌐 SITEMAP DYNAMIQUE DODOMOVE
 * 
 * Génère automatiquement le sitemap avec toutes les pages :
 * - Page d'accueil DodoPartage 
 * - 72 pages de catégories destinations (france-reunion, martinique-guadeloupe, etc.)
 * - Pages annexes (funnels, etc.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.dodomove.fr/partage'
  
  // 🏠 Page principale
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // 🗺️ Génération de toutes les pages de destinations
  const destinationCombinations = generateAllDestinationCombinations()
  
  destinationCombinations.forEach((route) => {
    routes.push({
      url: `${baseUrl}/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Les annonces changent quotidiennement
      priority: 0.8, // Priorité élevée pour les pages de catégories
    })
  })

  // 📋 Pages annexes importantes pour le SEO
  const additionalPages = [
    // Pages de funnel (importantes pour la conversion)
    '/funnel-choice/offer',
    '/funnel-choice/search',
    
    // Note: Les pages d'annonces individuelles ne sont PAS dans le sitemap
    // car elles ont robots: noindex (elles expirent automatiquement)
  ]

  additionalPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  })

  console.log(`🗺️ Sitemap généré avec ${routes.length} URLs :`)
  console.log(`- 1 page principale`)
  console.log(`- ${destinationCombinations.length} pages de destinations`) 
  console.log(`- ${additionalPages.length} pages annexes`)

  return routes
}
