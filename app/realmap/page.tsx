'use client';
import dynamic from 'next/dynamic';

const RealMap = dynamic(() => import('@/components/RealMap'), { ssr: false });

export default function RealMapPage() {
  return <RealMap />;
}
