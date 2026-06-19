import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dive · Cesium PoC | S2D Capital Insights',
};

// Cesium is client-only (WebGL + web workers) — never SSR it.
const FabDive = dynamic(() => import('@/components/FabDive'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0d1a', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.2em', fontSize: '0.75rem' }}>
      LOADING EARTH…
    </div>
  ),
});

export default function DivePage() {
  return <FabDive />;
}
