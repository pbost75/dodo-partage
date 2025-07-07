import type { Metadata } from "next";
import { Roboto_Slab, Inter, Lato, Sunflower } from 'next/font/google'
import "./globals.css";
import { ToastProvider } from '@/contexts/ToastContext';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';
import GTMNoScript from '@/components/analytics/GTMNoScript';

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

const sunflower = Sunflower({
  subsets: ['latin'],
  weight: ['300', '500', '700'],
  variable: '--font-sunflower',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "DodoPartage - Groupage collaboratif DOM-TOM",
  description: "Plateforme de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM. Proposez ou cherchez de la place pour vos expéditions.",
  keywords: "groupage, conteneur, DOM-TOM, Réunion, Martinique, Guadeloupe, expédition, déménagement",
  authors: [{ name: "Dodomove" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-dodomove-rouge-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-dodomove-rouge 512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/favicon-dodomove-rouge 512x512.png',
  },
  openGraph: {
    title: "DodoPartage - Groupage collaboratif DOM-TOM",
    description: "Plateforme de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM. Proposez ou cherchez de la place pour vos expéditions.",
    type: "website",
    locale: "fr_FR",
    url: "https://www.dodomove.fr/partage",
    siteName: "DodoPartage",
    images: [
      {
        url: '/images/dodopartage-og.png',
        width: 1200,
        height: 630,
        alt: 'DodoPartage - Groupage collaboratif DOM-TOM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DodoPartage - Groupage collaboratif DOM-TOM",
    description: "Plateforme de mise en relation pour le partage de conteneurs entre la France métropolitaine et les DOM-TOM",
    images: ['/images/dodopartage-og.png'],
    site: '@dodomove',
    creator: '@dodomove',
  },
  metadataBase: new URL('https://www.dodomove.fr'),
};

// Configuration GTM
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MRHKMB9Z';
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${robotoSlab.variable} ${inter.variable} ${lato.variable} ${sunflower.variable}`}>
      <head>
        {ENABLE_ANALYTICS && <GoogleTagManager gtmId={GTM_ID} />}
      </head>
      <body className="font-lato" suppressHydrationWarning={true}>
        {ENABLE_ANALYTICS && <GTMNoScript gtmId={GTM_ID} />}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
