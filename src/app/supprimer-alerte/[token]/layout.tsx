import { Metadata } from 'next';

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  
  return {
    title: 'Supprimer l\'alerte | DodoPartage',
    description: 'Page de suppression d\'alerte email DodoPartage',
    
    // 🚫 NOINDEX : Page administrative temporaire qui ne doit pas être indexée
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      }
    },
  };
}

export default function SupprimerAlerteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
