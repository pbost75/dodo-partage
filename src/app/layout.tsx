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
  description: "Trouvez ou proposez une place dans un conteneur vers La Réunion et les DOM-TOM. Plateforme 100% gratuite, sans création de compte.",
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
    description: "Trouvez ou proposez une place dans un conteneur vers La Réunion et les DOM-TOM. Plateforme 100% gratuite, sans création de compte.",
    type: "website",
    locale: "fr_FR",
    url: "https://www.dodomove.fr/partage",
    siteName: "DodoPartage",
    images: [
      {
        url: 'https://www.dodomove.fr/wp-content/uploads/2025/07/Plateforme-DodoPartage.png',
        width: 1200,
        height: 630,
        alt: 'DodoPartage - Groupage collaboratif DOM-TOM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DodoPartage - Groupage collaboratif DOM-TOM",
    description: "Trouvez ou proposez une place dans un conteneur vers La Réunion et les DOM-TOM. Plateforme 100% gratuite, sans création de compte.",
    images: ['https://www.dodomove.fr/wp-content/uploads/2025/07/Plateforme-DodoPartage.png'],
    site: '@dodomove',
    creator: '@dodomove',
  },
  metadataBase: new URL('https://www.dodomove.fr'),
};

// Configuration GTM
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MRHKMB9Z';
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

// Configuration Canny pour le feedback utilisateur
const CANNY_APP_ID = process.env.NEXT_PUBLIC_CANNY_APP_ID;
const ENABLE_FEEDBACK = process.env.NEXT_PUBLIC_ENABLE_FEEDBACK === 'true';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${robotoSlab.variable} ${inter.variable} ${lato.variable} ${sunflower.variable}`}>
      <head>
        {ENABLE_ANALYTICS && <GoogleTagManager gtmId={GTM_ID} />}
        {/* Canny Feedback Widget - Seulement si App ID configuré */}
        {ENABLE_FEEDBACK && CANNY_APP_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");
                
                Canny('identify', {
                  appID: '${CANNY_APP_ID}',
                  user: {
                    id: 'anonymous_' + Math.random().toString(36).substr(2, 9),
                    name: 'Utilisateur anonyme',
                    email: null
                  }
                });
              `
            }}
          />
        )}
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
