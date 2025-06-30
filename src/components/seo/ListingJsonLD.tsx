'use client';

import React from 'react';

interface ListingSchemaProps {
  announcements: Array<{
    id: string;
    reference: string;
    type: 'offer' | 'request';
    title: string;
    departure: string;
    arrival: string;
    volume: string;
    date: string;
    price?: string;
    items: string[];
    author: string;
    publishedAt: string;
    description: string;
    acceptsCostSharing?: boolean;
  }>;
  total: number;
}

const ListingJsonLD: React.FC<ListingSchemaProps> = ({ announcements, total }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.dodomove.fr';
  const pageUrl = `${baseUrl}/partage`;

  // Schema principal pour la page
  const mainSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    "name": "DodoPartage - Groupage collaboratif DOM-TOM",
    "description": "Plateforme de groupage collaboratif pour partager des conteneurs de transport entre la France métropolitaine et les DOM-TOM",
    "url": pageUrl,
    "inLanguage": "fr-FR",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${baseUrl}#website`,
      "name": "DodoMove",
      "url": baseUrl
    },
    "about": {
      "@type": "Service",
      "name": "Groupage collaboratif",
      "description": "Service de mise en relation pour le partage de conteneurs de transport entre la France et les DOM-TOM",
      "serviceType": "Transport et logistique",
      "provider": {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        "name": "DodoMove",
        "url": baseUrl,
        "description": "Spécialiste du déménagement et transport vers les DOM-TOM"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "@id": `${pageUrl}#announcements`,
      "name": "Annonces de groupage disponibles",
      "description": `${total} annonces de transport et groupage disponibles`,
      "numberOfItems": total,
      "itemListElement": announcements.slice(0, 10).map((announcement, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${pageUrl}/annonce/${announcement.reference || announcement.id}`,
        "item": {
          "@type": "Service",
          "@id": `${pageUrl}/annonce/${announcement.reference || announcement.id}`,
          "name": announcement.title,
          "description": announcement.description,
          "serviceType": announcement.type === 'offer' ? 'Offre de transport' : 'Recherche de transport',
          "provider": {
            "@type": "Person",
            "name": announcement.author
          },
          "areaServed": [
            {
              "@type": "Place",
              "name": announcement.departure
            },
            {
              "@type": "Place", 
              "name": announcement.arrival
            }
          ],
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Volume",
              "value": announcement.volume
            },
            {
              "@type": "PropertyValue",
              "name": "Date",
              "value": announcement.date
            },
            {
              "@type": "PropertyValue",
              "name": "Objets acceptés",
              "value": announcement.items.join(', ')
            },
            {
              "@type": "PropertyValue",
              "name": "Tarification",
              "value": announcement.type === 'offer' 
                ? (!announcement.price || announcement.price === 'Gratuit' ? 'Service gratuit' : 'Participation aux frais')
                : (announcement.acceptsCostSharing ? 'Accepte participation aux frais' : 'Transport gratuit souhaité')
            }
          ],
          "isAccessibleForFree": announcement.type === 'offer' 
            ? (!announcement.price || announcement.price === 'Gratuit')
            : (!announcement.acceptsCostSharing),
          "dateCreated": announcement.publishedAt
        }
      }))
    }
  };

  // Schema pour l'organisation DodoMove
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    "name": "DodoMove",
    "alternateName": "DodoPartage",
    "url": baseUrl,
    "description": "Spécialiste du déménagement et transport vers les DOM-TOM, proposant des solutions de groupage collaboratif",
    "foundingDate": "2020",
    "areaServed": [
      {
        "@type": "Place",
        "name": "France"
      },
      {
        "@type": "Place", 
        "name": "Réunion"
      },
      {
        "@type": "Place",
        "name": "Martinique"
      },
      {
        "@type": "Place",
        "name": "Guadeloupe"
      },
      {
        "@type": "Place",
        "name": "Guyane"
      },
      {
        "@type": "Place",
        "name": "Mayotte"
      },
      {
        "@type": "Place",
        "name": "Nouvelle-Calédonie"
      }
    ],
    "serviceType": [
      "Déménagement",
      "Transport de marchandises", 
      "Groupage collaboratif",
      "Fret maritime"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de transport",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Groupage collaboratif",
            "description": "Partage de conteneurs entre particuliers"
          }
        }
      ]
    }
  };

  // Schema BreadcrumbList pour la navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "DodoPartage",
        "item": pageUrl
      }
    ]
  };

  return (
    <>
      {/* Schema principal de la page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mainSchema, null, 2)
        }}
      />
      
      {/* Schema organisation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 2)
        }}
      />
      
      {/* Schema breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2)
        }}
      />
    </>
  );
};

export default ListingJsonLD; 