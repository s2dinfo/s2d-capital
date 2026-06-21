'use client';
import dynamic from 'next/dynamic';

// R3F must mount client-side only (no SSR / window access during render).
const NvidiaScene = dynamic(() => import('@/components/NvidiaScene'), { ssr: false });

export default function NvidiaPage() {
  return <NvidiaScene />;
}
