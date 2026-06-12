import { brandOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Silicon: The World’s Most Strategic Commodity';

export default function Image() {
  return brandOg({
    title: 'Silicon: The World’s Most Strategic Commodity',
    kicker: 'INVESTOR BRIEFING',
    tags: ['Geopolitics', 'Commodities', '30 min'],
  });
}
