'use client';

import React from 'react';

interface AnnouncementSchemaProps {
  announcement: {
    id: string;
    reference: string;
    type: 'offer' | 'request';
    title: string;
    departure: string;
    departureCity: string;
    arrival: string;
    arrivalCity: string;
    volume: string;
    volumeCategory: string;
    date: string;
    year: string;
    price?: string;
    items: string[];
    author: string;
    publishedAt: string;
    description: string;
    status: string;
    acceptsCostSharing?: boolean;
    periodFormatted?: string;
  };
}

const AnnouncementJsonLD: React.FC<AnnouncementSchemaProps> = ({ announcement }) => {
  // Générer l'URL canonique de l'annonce
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.dodomove.fr';
  const announcementUrl = `${baseUrl}/partage/annonce/${announcement.reference || announcement.id}`;

  // Déterminer le type de service selon offer/request
  const serviceType = announcement.type === 'offer' 
    ? 'Transport de marchandises - Place disponible'
    : 'Recherche de transport - Demande de place';

  // Déterminer si le service est gratuit
  const isFreeService = () => {
    if (announcement.type === 'offer') {
      return !announcement.price || announcement.price === 'Gratuit';
    } else {
      return !announcement.acceptsCostSharing;
    }
  };

  // Obtenir le label de tarification
  const getPricingLabel = () => {
    if (announcement.type === 'offer') {
      return !announcement.price || announcement.price === 'Gratuit' 
        ? 'Service gratuit' 
        : 'Participation aux frais';
    } else {
      return announcement.acceptsCostSharing 
        ? 'Accepte participation aux frais' 
        : 'Transport gratuit souhaité';
    }
  };

  // Déterminer la disponibilité
  const availability = announcement.status === 'published' ? 'InStock' : 'OutOfStock';

  // Créer le schema JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": announcementUrl,
    "name": announcement.title,
    "description": announcement.description,
    "url": announcementUrl,
    "serviceType": serviceType,
    "category": "Transport et Logistique",
    
    // Informations sur le fournisseur
    "provider": {
      "@type": "Person",
      "name": announcement.author,
      "memberOf": {
        "@type": "Organization",
        "name": "DodoPartage",
        "url": `${baseUrl}/partage`,
        "description": "Plateforme de groupage collaboratif pour le transport entre la France métropolitaine et les DOM-TOM"
      }
    },

    // Zone géographique couverte
    "areaServed": [
      {
        "@type": "Place",
        "name": announcement.departure,
        "addressLocality": announcement.departureCity
      },
      {
        "@type": "Place", 
        "name": announcement.arrival,
        "addressLocality": announcement.arrivalCity
      }
    ],

    // Détails du service - Propriétés additionnelles
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Volume",
        "value": announcement.volume
      },
      {
        "@type": "PropertyValue", 
        "name": "Catégorie de volume",
        "value": announcement.volumeCategory
      },
      {
        "@type": "PropertyValue",
        "name": "Types d'objets acceptés",
        "value": announcement.items.join(', ')
      },
      {
        "@type": "PropertyValue",
        "name": "Type d'annonce",
        "value": announcement.type === 'offer' ? 'Offre de transport' : 'Recherche de transport'
      },
      {
        "@type": "PropertyValue",
        "name": "Tarification",
        "value": getPricingLabel()
      }
    ],

    // Disponibilité et dates
    "validFrom": announcement.publishedAt,
    "validThrough": announcement.date,
    "availabilityStarts": announcement.type === 'offer' ? announcement.date : undefined,
    
    // Offre commerciale si applicable - Seulement pour les offres avec prix
    ...(announcement.type === 'offer' && !isFreeService() && {
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "description": getPricingLabel()
        },
        "availability": `https://schema.org/${availability}`,
        "validFrom": announcement.publishedAt,
        "validThrough": announcement.date,
        "seller": {
          "@type": "Person",
          "name": announcement.author
        },
        "itemOffered": {
          "@type": "Service",
          "name": `Transport ${announcement.departure} → ${announcement.arrival}`,
          "description": `${announcement.volume} disponible`
        }
      }
    }),

    // Données spécifiques aux recherches
    ...(announcement.type === 'request' && {
      "seeks": {
        "@type": "Service",
        "name": `Transport ${announcement.departure} → ${announcement.arrival}`,
        "description": `Recherche ${announcement.volume} pour ${announcement.items.join(', ')}`,
        "serviceType": "Service de transport"
      }
    }),

    // Métadonnées techniques
    "dateCreated": announcement.publishedAt,
    "dateModified": announcement.publishedAt,
    "inLanguage": "fr-FR",
    "isAccessibleForFree": isFreeService(),
    
    // Mots-clés pour le référencement
    "keywords": [
      "transport",
      "groupage", 
      "conteneur",
      "dom-tom",
      "france métropolitaine",
      announcement.departure.toLowerCase(),
      announcement.arrival.toLowerCase(),
      announcement.volumeCategory.toLowerCase(),
      ...announcement.items.map(item => item.toLowerCase())
    ].join(', ')
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  );
};

export default AnnouncementJsonLD; 