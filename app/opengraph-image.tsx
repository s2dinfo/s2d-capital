import { brandOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'S2D Capital Insights — Where Markets Meet Clarity';

export default function Image() {
  return brandOg({
    title: 'Where Markets Meet Clarity',
    kicker: 'FINANCIAL INTELLIGENCE',
    tags: ['Crypto', 'Macro', 'Geopolitics'],
  });
}
