/**
 * Utilitaires pour la gestion des pages destinations SEO
 */

import { COUNTRIES, getCountryByValue, type Country } from './countries';

export interface DestinationRoute {
  departure: string;
  arrival: string;
  departureLabel: string;
  arrivalLabel: string;
  slug: string;
}

export interface DestinationContent {
  hero: string;
  intro: string;
  faq: Array<{ q: string; a: string }>;
  ports: { departure: string[]; arrival: string[] };
  stats: { avgVolume: string; avgDelay: string; avgCost: string };
}

/**
 * Génère toutes les combinaisons de destinations possibles
 */
export function generateAllDestinationCombinations(): DestinationRoute[] {
  const routes: DestinationRoute[] = [];
  
  for (const departure of COUNTRIES) {
    for (const arrival of COUNTRIES) {
      // Exclure les boucles sur soi-même
      if (departure.value !== arrival.value) {
        routes.push({
          departure: departure.value,
          arrival: arrival.value,
          departureLabel: departure.label,
          arrivalLabel: arrival.label,
          slug: `${departure.value}-${arrival.value}`
        });
      }
    }
  }
  
  return routes;
}

/**
 * Valide qu'une combinaison de destinations est correcte
 */
export function validateDestinationRoute(departure: string, arrival: string): boolean {
  const validDeparture = getCountryByValue(departure);
  const validArrival = getCountryByValue(arrival);
  
  return !!(validDeparture && validArrival && departure !== arrival);
}

/**
 * Génère les métadonnées SEO pour une destination
 */
export function getDestinationMetadata(departure: string, arrival: string) {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) {
    return {
      title: 'Destination non trouvée | DodoPartage',
      description: 'Cette combinaison de destinations n\'est pas supportée.',
      keywords: ''
    };
  }
  
  const baseUrl = `https://www.dodomove.fr/partage/${departure}-${arrival}`;
  
  return {
    title: `Partage de conteneur ${dep.label} → ${arr.label} | DodoPartage`,
    description: `Trouvez ou proposez une place dans un conteneur de déménagement entre ${dep.label} et ${arr.label}. Économisez sur vos frais de transport maritime DOM-TOM.`,
    keywords: [
      'déménagement', 'conteneur', 'partage', 'groupage',
      dep.label.toLowerCase().replace(/\s+/g, '-'),
      arr.label.toLowerCase().replace(/\s+/g, '-'),
      'DOM-TOM', 'transport maritime', 'outre-mer'
    ].join(','),
    alternates: {
      canonical: baseUrl
    },
    openGraph: {
      title: `Partage de conteneur ${dep.label} → ${arr.label} | DodoPartage`,
      description: `Trouvez ou proposez une place dans un conteneur de déménagement entre ${dep.label} et ${arr.label}. Économisez sur vos frais de transport maritime DOM-TOM.`,
      url: baseUrl,
      siteName: 'DodoPartage',
      type: 'website',
      images: [
        {
          url: 'https://www.dodomove.fr/partage/images/dodopartage-og.png',
          width: 1200,
          height: 630,
          alt: `Partage de conteneur ${dep.label} vers ${arr.label}`
        }
      ]
    }
  };
}

/**
 * Génère le contenu unique pour une destination (>70% différent)
 */
export function generateUniqueContent(departure: string, arrival: string): DestinationContent {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) {
    throw new Error(`Destination non trouvée: ${departure} → ${arrival}`);
  }
  
  // Contenu spécialisé par route
  return generateRouteSpecificContent(dep, arr);
}

/**
 * Génère le contenu spécifique à une route géographique
 */
function generateRouteSpecificContent(dep: Country, arr: Country): DestinationContent {
  // Exemple détaillé pour Métropole → Réunion
  if (dep.value === 'france' && arr.value === 'reunion') {
    return {
      hero: "Partage de conteneur France métropolitaine → Réunion",
      intro: `Trouvez facilement de la place dans un conteneur entre la France métropolitaine et la Réunion. Le partage de conteneur permet de réduire significativement les coûts de transport maritime.`,
      faq: [
        {
          q: "Combien coûte l'expédition d'un conteneur complet vers la Réunion ?",
          a: "Le coût varie entre 2 800€ et 4 500€ selon la saison et le port de départ. Le partage permet de diviser ces frais selon le volume utilisé."
        },
        {
          q: "Quels sont les délais d'acheminement métropole-Réunion ?",
          a: "Comptez 21 jours en moyenne depuis Le Havre, 18 jours depuis Marseille. Ces délais incluent les opérations portuaires et les formalités douanières."
        },
        {
          q: "Quelles sont les contraintes douanières pour la Réunion ?",
          a: "En tant que département français, la Réunion bénéficie d'un régime douanier simplifié. Les résidents peuvent importer leurs effets personnels en franchise."
        },
        {
          q: "Puis-je bénéficier des avantages DOM-TOM pour la Réunion ?",
          a: "Oui, les résidents justifiés peuvent bénéficier de franchises douanières et d'aides au transport selon leur situation."
        }
      ],
      ports: {
        departure: ["Le Havre", "Marseille"],
        arrival: ["Port-Est"]
      },
      stats: {
        avgVolume: "15m³",
        avgDelay: "21 jours",
        avgCost: "3 200€"
      }
    };
  }
  
  // Exemple pour Réunion → Métropole (contenu >70% différent)
  if (dep.value === 'reunion' && arr.value === 'france') {
    return {
      hero: "Partage de conteneur Réunion → France métropolitaine",
      intro: `Expédiez vos affaires de la Réunion vers la France métropolitaine en partageant un conteneur. Une solution économique pour optimiser vos coûts de transport maritime.`,
      faq: [
        {
          q: "Quels sont les délais depuis la Réunion vers la métropole ?",
          a: "Les rotations régulières permettent des délais de 18-21 jours selon la destination finale en métropole."
        },
        {
          q: "Peut-on expédier des produits locaux réunionnais ?",
          a: "Oui, sous réserve du respect des réglementations sanitaires et douanières pour les produits alimentaires."
        },
        {
          q: "Comment optimiser les coûts depuis la Réunion ?",
          a: "Le groupage permet de partager les frais fixes du transport maritime, particulièrement intéressant pour les volumes partiels."
        }
      ],
      ports: {
        departure: ["Port-Est"],
        arrival: ["Le Havre", "Marseille", "Bordeaux"]
      },
      stats: {
        avgVolume: "12m³",
        avgDelay: "19 jours",
        avgCost: "2 900€"
      }
    };
  }
  
  // Contenu générique pour les autres combinaisons (à développer)
  return generateGenericContent(dep, arr);
}

/**
 * Génère un contenu générique pour les combinaisons non-spécialisées
 */
function generateGenericContent(dep: Country, arr: Country): DestinationContent {
  const isDomTomRoute = dep.type === 'dom-tom' || arr.type === 'dom-tom';
  const isInternational = dep.type === 'international' || arr.type === 'international';
  
  return {
    hero: `Partage de conteneur ${dep.label} → ${arr.label}`,
    intro: `Trouvez ou proposez de la place dans un conteneur entre ${dep.label} et ${arr.label}. Le partage de conteneur permet d'optimiser les coûts de transport maritime.`,
    faq: [
      {
        q: `Quels sont les délais de transport ${dep.label} → ${arr.label} ?`,
        a: `Les délais varient selon les rotations maritimes disponibles. Contactez les annonceurs pour connaître les prochains départs prévus.`
      },
      {
        q: `Comment fonctionne le partage de conteneur pour cette destination ?`,
        a: `Le groupage permet de partager les frais de transport selon le volume utilisé par chaque expéditeur, réduisant significativement les coûts.`
      }
    ],
    ports: {
      departure: ["Port principal"],
      arrival: ["Port de destination"]
    },
    stats: {
      avgVolume: "10m³",
      avgDelay: "15-25 jours",
      avgCost: "Variable"
    }
  };
}

/**
 * Obtient les destinations populaires pour les liens internes
 */
export function getPopularRoutes(currentDep: string, currentArr: string): DestinationRoute[] {
  const allRoutes = generateAllDestinationCombinations();
  
  // Exclure la route actuelle
  const filteredRoutes = allRoutes.filter(
    r => !(r.departure === currentDep && r.arrival === currentArr)
  );
  
  // Prioriser les routes Métropole ↔ DOM-TOM
  const prioritizedRoutes = filteredRoutes.sort((a, b) => {
    const aScore = getRoutePopularityScore(a.departure, a.arrival);
    const bScore = getRoutePopularityScore(b.departure, b.arrival);
    return bScore - aScore;
  });
  
  // Retourner les 9 plus populaires (grille 3x3)
  return prioritizedRoutes.slice(0, 9);
}

/**
 * Calcule un score de popularité pour prioriser les routes
 */
function getRoutePopularityScore(departure: string, arrival: string): number {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) return 0;
  
  let score = 0;
  
  // Bonus pour les routes Métropole ↔ DOM-TOM (plus populaires)
  if ((dep.type === 'mainland' && arr.type === 'dom-tom') || 
      (dep.type === 'dom-tom' && arr.type === 'mainland')) {
    score += 100;
  }
  
  // Bonus pour les destinations DOM-TOM populaires
  const popularDestinations = ['reunion', 'martinique', 'guadeloupe'];
  if (popularDestinations.includes(departure) || popularDestinations.includes(arrival)) {
    score += 50;
  }
  
  // Bonus pour la France métropolitaine
  if (departure === 'france' || arrival === 'france') {
    score += 25;
  }
  
  return score;
}

/**
 * 🌟 GÉNÈRE LES STRUCTURED DATA JSON-LD 2025
 * 
 * Implémente uniquement les schémas vraiment utiles et compatibles :
 * - Service (transport/groupage)
 * - BreadcrumbList (navigation SEO)
 * - FAQPage (rich snippets)
 * - WebPage (métadonnées de base)
 */
export function generateJsonLD(departure: string, arrival: string) {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) return [];
  
  const baseUrl = `https://www.dodomove.fr/partage/${departure}-${arrival}`;
  const uniqueContent = generateUniqueContent(departure, arrival);
  
  const structuredData = [];
  
  // 1. 🚢 Service Schema - Le plus important pour votre marketplace transport
  structuredData.push({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Partage de conteneur ${dep.label} → ${arr.label}`,
    "description": `Service de groupage et partage de conteneurs de déménagement entre ${dep.label} et ${arr.label}. Trouvez ou proposez une place dans un conteneur pour économiser sur vos frais de transport maritime.`,
    "provider": {
      "@type": "Organization",
      "name": "DodoPartage",
      "url": "https://www.dodomove.fr/partage",
      "logo": "https://www.dodomove.fr/partage/images/dodopartage-og.png"
    },
    "areaServed": [
      {
        "@type": "Place",
        "name": dep.label
      },
      {
        "@type": "Place", 
        "name": arr.label
      }
    ],
    "serviceType": "Groupage de conteneurs de déménagement",
    "category": "Transport maritime",
    "url": baseUrl
  });
  
  // 2. 🍞 BreadcrumbList Schema - Navigation SEO
  structuredData.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://www.dodomove.fr"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Partage",
        "item": "https://www.dodomove.fr/partage"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${dep.label} → ${arr.label}`,
        "item": baseUrl
      }
    ]
  });
  
  // 3. ❓ FAQPage Schema - Rich snippets pour votre FAQ existante
  if (uniqueContent.faq && uniqueContent.faq.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": uniqueContent.faq.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    });
  }
  
  // 4. 🌐 WebPage Schema - Métadonnées de base
  structuredData.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Partage de conteneur ${dep.label} → ${arr.label}`,
    "description": `Page dédiée au partage de conteneurs de déménagement entre ${dep.label} et ${arr.label}. Trouvez des annonces ou proposez de la place disponible.`,
    "url": baseUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "DodoPartage",
      "url": "https://www.dodomove.fr/partage"
    },
    "about": {
      "@type": "Service",
      "name": "Groupage de conteneurs",
      "category": "Transport maritime DOM-TOM"
    }
  });
  
  return structuredData;
}
