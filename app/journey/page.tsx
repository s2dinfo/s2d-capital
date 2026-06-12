import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { JOURNEYS } from '@/lib/journeys';

export const metadata: Metadata = {
  title: 'Interactive Journeys | S2D Capital Insights',
  description:
    'Our research as interactive globe briefings — travel supply chains and market systems chapter by chapter, with live data at every stop.',
  alternates: { canonical: 'https://s2d.info/journey' },
};

export default function JourneyIndex() {
  return (
    <div style={{ background: '#0D1322', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '72px 24px 64px', flex: 1, width: '100%' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold-light, #D4B85C)', fontWeight: 600 }}>
          INTERACTIVE BRIEFINGS
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4.5vw,3rem)', fontWeight: 400, margin: '14px 0 10px' }}>
          Read by <em style={{ fontStyle: 'italic', color: 'var(--gold-light, #D4B85C)' }}>Traveling</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', maxWidth: 560, marginBottom: 40 }}>
          Each journey turns one of our research reports into a trip around a live 3D globe — chapter by chapter, stop by stop, with market data tracking the thesis at every location.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {JOURNEYS.map((j) => (
            <Link key={j.slug} href={`/journey/${j.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(17,25,40,0.6)', border: '1px solid rgba(184,134,11,0.18)', borderRadius: 8, padding: '26px 22px', height: '100%', transition: 'border-color 0.25s' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--gold-light, #D4B85C)', fontWeight: 700, marginBottom: 10 }}>
                  {j.name}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
                  {j.description}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
                  {j.chapters.length} CHAPTERS · {j.chapters[0].place} → {j.chapters[j.chapters.length - 1].place}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
