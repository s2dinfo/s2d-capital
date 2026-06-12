import { brandOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Europe’s Energy System, Decoded';

export default function Image() {
  return brandOg({
    title: 'Europe’s Energy System, Decoded: From the Grid to the Trading Floor',
    kicker: 'INVESTOR BRIEFING',
    tags: ['Commodities', 'Geopolitics', '30 min'],
  });
}
