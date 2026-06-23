'use client';
import dynamic from 'next/dynamic';

const AssetViewer = dynamic(() => import('@/components/AssetViewer'), { ssr: false });

export default function AssetPage() {
  return <AssetViewer src="/models/character-walk.glb" />;
}
