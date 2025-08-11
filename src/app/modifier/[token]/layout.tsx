import { Metadata } from 'next';

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  
  return {
    title: 'Modifier l\'annonce | DodoPartage',
    description: 'Page de modification d\'annonce DodoPartage',
    
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

export default function ModifierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
