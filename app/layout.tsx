import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import LanguageToggle from '@/components/LanguageToggle';
import { LanguageProvider } from '@/lib/LanguageContext';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('s2d-lang');}catch(e){}})();`,
          }}
        />
      </head>
      <body style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
        <LanguageProvider>
          <Navbar />
          <LanguageToggle />
          <main style={{ overflowX: 'hidden' }}>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
