'use client';
import dynamic from 'next/dynamic';

const AssetGallery = dynamic(() => import('@/components/AssetGallery'), { ssr: false });

export default function GalleryPage() {
  return <AssetGallery />;
}
