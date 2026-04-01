"use client";
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/lib/LanguageContext';

const verticalsMeta = [
  { slug: 'crypto', labelKey: 'v.crypto', descKey: 'v.crypto.desc', color: '#B8860B', icon: '₿' },
  { slug: 'macro', labelKey: 'v.macro', descKey: 'v.macro.desc', color: '#3B6CB4', icon: '🏛' },
  { slug: 'commodities', labelKey: 'v.commodities', descKey: 'v.commodities.desc', color: '#8B5E3C', icon: '🛢' },
  { slug: 'fx', labelKey: 'v.fx', descKey: 'v.fx.desc', color: '#2D8F5E', icon: '💱' },
  { slug: 'geopolitics', labelKey: 'v.geopolitics', descKey: 'v.geopolitics.desc', color: '#8B2252', icon: '🌍' },
  { slug: 'structure', labelKey: 'v.structure', descKey: 'v.structure.desc', color: '#5B4FA0', icon: '⚙' },
];

export default function MarketsPage() {
  const { t } = useLanguage();
  return (
    <div style={{ background: 'var(--navy, #1A1A2E)', minHeight: '100vh', color: '#fff' }}>
      <BackButton label="Home" href="/" />
      <div style={{
        textAlign: 'center',
        padding: '48px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(184,134,11,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.05) 1px,transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold-light, #D4B85C)', marginBottom: 16 }}>
            S2D Capital Insights
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: '#fff', marginBottom: 14 }}>
            {t('markets.title')} <em style={{ fontStyle: 'italic', color: 'var(--gold-light, #D4B85C)' }}>{t('markets.titleAccent')}</em>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            {t('markets.subtitle')}
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="markets-grid" style={{ display: 'grid', gap: 16 }}>
          {verticalsMeta.map(v => (
            <Link key={v.slug} href={`/markets/${v.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '24px 20px',
                transition: 'all 0.3s',
                cursor: 'pointer',
                borderLeft: `3px solid ${v.color}`,
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                display: 'flex',
                flexDirection: 'column' as const,
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = v.color;
                  (e.currentTarget as HTMLElement).style.background = `${v.color}10`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${v.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.borderLeftColor = v.color;
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{v.icon}</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 500, color: '#fff', marginBottom: 6 }}>{t(v.labelKey)}</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, flex: 1 }}>{t(v.descKey)}</p>
                <span style={{ display: 'inline-block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: v.color, fontWeight: 600 }}>{t('markets.viewData')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .markets-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .markets-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px) { .markets-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
