import type { Metadata } from 'next';
import SiliconJourneyClient from './client';

export const metadata: Metadata = {
  title: 'The Silicon Journey — Interactive Briefing | S2D Capital Insights',
  description:
    'Travel the semiconductor supply chain in eight chapters — from chip design in Santa Clara to EUV lithography in Veldhoven, fabrication in Taiwan, and data centers in orbit. An interactive way to read our Silicon research.',
  alternates: { canonical: 'https://s2d.info/journey/silicon' },
  openGraph: {
    title: 'The Silicon Journey — Interactive Briefing',
    description:
      'Eight chapters across the globe: how a chip goes from idea to orbit. Interactive supply-chain briefing by S2D Capital Insights.',
    url: 'https://s2d.info/journey/silicon',
  },
};

export default function Page() {
  return <SiliconJourneyClient />;
}
