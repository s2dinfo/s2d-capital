'use client';
import dynamic from 'next/dynamic';

const ProceduralTerrain = dynamic(() => import('@/components/ProceduralTerrain'), { ssr: false });

export default function TerrainPage() {
  return <ProceduralTerrain />;
}
