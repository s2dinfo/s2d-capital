import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JourneyExperience from '@/components/JourneyExperience';
import { JOURNEYS, getJourney } from '@/lib/journeys';

export const dynamicParams = false;

export function generateStaticParams() {
  return JOURNEYS.map((j) => ({ slug: j.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const j = getJourney(params.slug);
  if (!j) return {};
  return {
    title: j.pageTitle,
    description: j.description,
    alternates: { canonical: `https://s2d.info/journey/${j.slug}` },
    openGraph: {
      title: j.pageTitle,
      description: j.description,
      url: `https://s2d.info/journey/${j.slug}`,
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const config = getJourney(params.slug);
  if (!config) notFound();
  return <JourneyExperience config={config} />;
}
