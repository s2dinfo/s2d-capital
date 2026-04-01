import { Metadata } from 'next';
import NewsletterClient from './client';

export const metadata: Metadata = {
  title: 'Newsletter – S2D Capital Insights',
  description: 'Subscribe to personalized market intelligence across Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure. Free weekly analysis.',
};

export default function NewsletterPage() {
  return <NewsletterClient />;
}
