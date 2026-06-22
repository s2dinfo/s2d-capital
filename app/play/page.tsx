'use client';
import dynamic from 'next/dynamic';

const GlobeGame = dynamic(() => import('@/components/GlobeGame'), { ssr: false });

export default function PlayPage() {
  return <GlobeGame />;
}
