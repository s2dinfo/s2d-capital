'use client';
import dynamic from 'next/dynamic';

const CityGenerator = dynamic(() => import('@/components/CityGenerator'), { ssr: false });

export default function CityPage() {
  return <CityGenerator />;
}
