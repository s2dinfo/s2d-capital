'use client';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const AssetViewer = dynamic(() => import('@/components/AssetViewer'), { ssr: false });

function Inner() {
  const sp = useSearchParams();
  return <AssetViewer src={sp.get('src') || '/models/character-walk.glb'} />;
}

export default function AssetPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
