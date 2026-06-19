import type { Metadata } from 'next';
import ChipWorld from '@/components/ChipWorld';

export const metadata: Metadata = {
  title: 'The Chip World | S2D Capital Insights',
  description: 'Follow the chain that makes the AI era possible — ASML, TSMC, Nvidia — on an interactive globe.',
};

export default function WorldPage() {
  return <ChipWorld />;
}
