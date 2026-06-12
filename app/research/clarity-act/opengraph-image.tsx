import { brandOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'The CLARITY Act and Institutional Crypto';

export default function Image() {
  return brandOg({
    title: 'The CLARITY Act: The Next Era of Institutional Crypto Adoption',
    kicker: 'INVESTOR BRIEFING',
    tags: ['Crypto', 'Regulation', '25 min'],
  });
}
