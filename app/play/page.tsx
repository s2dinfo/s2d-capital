'use client';
import dynamic from 'next/dynamic';

const BottleneckGame = dynamic(() => import('@/components/BottleneckGame'), { ssr: false });

export default function PlayPage() {
  return <BottleneckGame />;
}
