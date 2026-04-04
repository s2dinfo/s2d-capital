import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL("https://s2d.info"),
  title: 'S2D Capital Insights | Financial Intelligence',
  description: 'Institutional-grade research across crypto, macro, commodities, FX, geopolitics, and market structure. We connect the dots others miss.',
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
    canonical: 'https://s2d.info',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'S2D Capital Insights',
    description: 'Financial Intelligence. Crypto. Macro. Commodities. FX. Geopolitics. Market Structure.',
    url: 'https://s2d.info',
    siteName: 'S2D Capital Insights',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S2D Capital Insights',
    description: 'Financial Intelligence across six verticals.',
    images: ['/og-image.png'],
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="S2D Capital Insights" href="https://s2d.info/feed.xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A1A2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "S2D Capital Insights",
              "url": "https://s2d.info",
              "logo": "https://s2d.info/og-image.png",
              "description": "Independent financial intelligence platform covering Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure.",
              "founder": {
                "@type": "Person",
                "name": "Sami Samii"
              },
              "sameAs": []
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "S2D Capital Insights",
              "url": "https://s2d.info",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://s2d.info/research?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <Navbar />
        <main id="main-content" style={{ overflowX: 'hidden' }}>{children}</main>
      </body>
    </html>
  );
}
