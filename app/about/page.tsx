import { Metadata } from 'next';
import AboutClient from './client';

export const metadata: Metadata = { title: 'About – S2D Capital Insights', description: 'Independent financial intelligence across five interconnected market verticals.' };

export default function AboutPage() {
  return <AboutClient />;
}
