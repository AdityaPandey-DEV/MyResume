import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://adityapandeydev.vercel.app'),
  title: {
    default: 'Aditya Pandey | Full Stack Developer & Software Engineer',
    template: '%s | Aditya Pandey',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    interactiveWidget: 'resizes-content', // CRITICAL: Ensures 100dvh reacts to keyboard
  },
  description: 'Portfolio of Aditya Pandey, a B.Tech CSE student and Full Stack Developer specializing in AI, Web Development, and Software Engineering. Explore projects, skills, and career insights.',
  keywords: [
    'aditya', 'adityapandey', 'pandeyaditya', 'pandeyji', 'pandey',
    'aditya pande', 'aditya pande dev', 'tech', 'software engineer',
    'full stack developer', 'web developer', 'AI engineer', 'react developer',
    'next.js developer', 'portfolio'
  ],
  authors: [{ name: 'Aditya Pandey', url: 'https://adityapandeydev.vercel.app' }],
  creator: 'Aditya Pandey',
  publisher: 'Aditya Pandey',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://adityapandeydev.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://adityapandeydev.vercel.app',
    title: 'Aditya Pandey | Full Stack Developer',
    description: 'Portfolio of Aditya Pandey - Full Stack Developer & AI Enthusiast.',
    siteName: 'Aditya Pandey Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aditya Pandey | Full Stack Developer',
    description: 'Explore the portfolio of Aditya Pandey, utilizing AI and modern web tech.',
    creator: '@adityapandey',
    images: ['/opengraph-image'], // Point to dynamic image
  },
  verification: {
    google: 'UR_Y_1at0EsezO21DXKn0x9NwST0G1mKMjh4fm1Qxdc',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aditya Pandey Portfolio',
    alternateName: ['Aditya Pandey Dev', 'Aditya Pandey'],
    url: 'https://adityapandeydev.vercel.app',
  }

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aditya Pandey',
    url: 'https://adityapandeydev.vercel.app',
    jobTitle: 'Full Stack Developer',
    sameAs: [
      'https://linkedin.com/in/adityapandeydev', // Adjust if known
      'https://github.com/AdityaPandey-DEV',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

