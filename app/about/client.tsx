'use client';

import BackButton from '@/components/BackButton';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutClient() {
  const { t } = useLanguage();

  return (
    <main style={{ minHeight: '100vh' }}>
      <BackButton label={t('back.home')} href="/" />
      <div style={{ padding: '48px 24px 80px', maxWidth: 680, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', color: '#D4B85C', marginBottom: 16 }}>{t('about.title')}</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, color: '#ffffff', marginBottom: 24, lineHeight: 1.2 }}>S2D Capital <em style={{ fontStyle: 'italic', color: '#D4B85C' }}>Insights</em></h1>

      <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
        <p style={{ marginBottom: 16 }}>{t('about.p1')}</p>

        <p style={{ marginBottom: 16 }}>{t('about.p2')}</p>

        <p style={{ marginBottom: 16 }}>{t('about.p3')}</p>

        <p style={{ marginBottom: 24 }}>{t('about.p4')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Crypto', desc: 'Regulation, ETFs, DeFi' },
            { label: 'Macro', desc: 'Rates, yields, liquidity' },
            { label: 'Commodities', desc: 'Oil, gold, energy' },
            { label: 'FX', desc: 'Currencies, DXY, EM' },
            { label: 'Geopolitics', desc: 'Policy, trade, risk' },
            { label: 'Structure', desc: 'On-chain, flows, TVL' },
          ].map((v) => (
            <div key={v.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '14px 12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', color: '#D4B85C', fontWeight: 600, marginBottom: 4 }}>{v.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{v.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{t('about.contact')}: <a href="mailto:sami@s2d.info" style={{ color: '#D4B85C', textDecoration: 'none' }}>sami@s2d.info</a></p>
        </div>
      </div>
      </div>
    </main>
  );
}
