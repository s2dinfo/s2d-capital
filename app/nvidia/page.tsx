'use client';
import dynamic from 'next/dynamic';

const EncounterScene = dynamic(() => import('@/components/EncounterScene'), { ssr: false });

export default function NvidiaPage() {
  return <EncounterScene id="Nvidia" />;
}
