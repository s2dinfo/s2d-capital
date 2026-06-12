import { brandOg, OG_SIZE } from '@/lib/og';
import { getJourney, JOURNEYS } from '@/lib/journeys';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'S2D Interactive Journey';

export function generateStaticParams() {
  return JOURNEYS.map((j) => ({ slug: j.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const j = getJourney(params.slug);
  const first = j?.chapters[0].place ?? '';
  const last = j ? j.chapters[j.chapters.length - 1].place : '';
  return brandOg({
    title: j ? `${j.name.charAt(0) + j.name.slice(1).toLowerCase()}: ${first} → ${last}` : 'Interactive Journey',
    kicker: 'INTERACTIVE GLOBE BRIEFING',
    tags: j ? [`${j.chapters.length} chapters`, 'Live data', '3D globe'] : [],
  });
}
