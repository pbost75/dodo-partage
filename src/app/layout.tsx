import type { Metadata } from "next";
import { Roboto_Slab, Inter, Lato } from 'next/font/google'
import "./globals.css";
import { ToastProvider } from '@/contexts/ToastContext';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "DodoPartage - Groupage collaboratif DOM-TOM",
  description: "Plateforme de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM. Proposez ou cherchez de la place pour vos expéditions.",
  keywords: "groupage, conteneur, DOM-TOM, Réunion, Martinique, Guadeloupe, expédition, déménagement",
  authors: [{ name: "Dodomove" }],
  openGraph: {
    title: "DodoPartage - Groupage collaboratif DOM-TOM",
    description: "Partagez l'espace dans vos conteneurs de déménagement vers les DOM-TOM",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${robotoSlab.variable} ${inter.variable} ${lato.variable}`}>
      <body className="font-lato" suppressHydrationWarning={true}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
