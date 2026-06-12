import { brandOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Russia’s Oil Machine, Exposed';

export default function Image() {
  return brandOg({
    title: 'Russia’s Oil Machine, Exposed: From the Wellhead to the Yuan Trap',
    kicker: 'INVESTOR BRIEFING',
    tags: ['Commodities', 'Geopolitics', '35 min'],
  });
}
