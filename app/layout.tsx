import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL("https://s2d.info"),
  title: 'S2D Capital Insights | Financial Intelligence',
  description: 'Institutional-grade research across crypto, macro, commodities, FX, geopolitics, and market structure. We connect the dots others miss.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{background:"#1A1A2E",color:"#e2e8f0",minHeight:"100vh"}}>{children}</main>
      </body>
    </html>
  );
}
