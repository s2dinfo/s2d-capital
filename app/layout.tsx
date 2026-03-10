import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'S2D Capital Insights | Financial Intelligence',
  description: 'Institutional-grade research across crypto, macro, commodities, FX, geopolitics, and market structure. We connect the dots others miss.',
  openGraph: {
    title: 'S2D Capital Insights',
    description: 'Financial Intelligence. Crypto. Macro. Commodities. FX. Geopolitics.',
    url: 'https://s2d.info',
    siteName: 'S2D Capital Insights',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S2D Capital Insights',
    description: 'Financial Intelligence across six verticals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
