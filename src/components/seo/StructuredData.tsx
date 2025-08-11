/**
 * 🌟 COMPOSANT STRUCTURED DATA JSON-LD 2025
 * 
 * Intègre les données structurées optimales pour le SEO des pages destinations :
 * - Service (marketplace transport)
 * - BreadcrumbList (navigation)
 * - FAQPage (rich snippets)
 * - WebPage (métadonnées)
 */

import { generateJsonLD } from '@/utils/destinations';

interface StructuredDataProps {
  departure: string;
  arrival: string;
}

export default function StructuredData({ departure, arrival }: StructuredDataProps) {
  const structuredData = generateJsonLD(departure, arrival);
  
  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0) // Pas d'indentation pour minimiser la taille
          }}
        />
      ))}
    </>
  );
}
