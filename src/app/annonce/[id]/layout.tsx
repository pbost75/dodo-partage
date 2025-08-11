import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

// Fonction pour récupérer les données de l'annonce pour les métadonnées
async function getAnnouncementData(id: string) {
  try {
    // En production, vous devriez utiliser l'URL complète
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/get-announcements`, {
      cache: 'no-store' // Toujours récupérer les données fraîches
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    if (!result.success) {
      return null;
    }
    
    return result.data.find((ann: any) => ann.id === id) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementData(id);
  
  if (!announcement) {
    return {
      title: 'Annonce non trouvée | DodoPartage',
      description: 'Cette annonce n\'existe pas ou a été supprimée.',
    };
  }

  const title = `${announcement.title} | DodoPartage`;
  const description = `Transport ${announcement.departure} → ${announcement.arrival} - ${announcement.volume} disponible. ${announcement.description.slice(0, 120)}...`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/annonce/${id}`;

  return {
    title,
    description,
    
    // 🚫 NOINDEX : Les annonces expirent automatiquement, on évite les 404 SEO toxiques
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      }
    },
    
    openGraph: {
      title,
      description,
      url,
      siteName: 'DodoPartage',
      type: 'article',
      images: [
        {
          url: '/images/dodopartage-og.png', // Vous devrez créer cette image
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/dodopartage-og.png'],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function AnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 