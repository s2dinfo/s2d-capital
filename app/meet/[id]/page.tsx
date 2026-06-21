'use client';
import dynamic from 'next/dynamic';

// R3F mounts client-side only (no SSR / window access during render).
const EncounterScene = dynamic(() => import('@/components/EncounterScene'), { ssr: false });

export default function MeetPage({ params }: { params: { id: string } }) {
  return <EncounterScene id={params.id} />;
}
