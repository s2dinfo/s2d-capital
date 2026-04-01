'use client';

import BackButton from '@/components/BackButton';

export default function AboutClient() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <BackButton label="Home" href="/" />
      <div style={{ padding: '48px 24px 80px', maxWidth: 680, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', color: '#D4B85C', marginBottom: 16 }}>ABOUT</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, color: '#ffffff', marginBottom: 24, lineHeight: 1.2 }}>S2D Capital <em style={{ fontStyle: 'italic', color: '#D4B85C' }}>Insights</em></h1>

      <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
        <p style={{ marginBottom: 16 }}>S2D Capital Insights is an independent financial intelligence platform. We deliver institutional-grade research and live market data across six interconnected verticals: Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure.</p>

        <p style={{ marginBottom: 16 }}>Our mission is to connect the dots that others miss. A central bank decision moves currencies, which reprices commodities, which shifts capital flows into digital assets. We track these cascading effects in real time and distill them into actionable intelligence.</p>

        <p style={{ marginBottom: 16 }}>The platform combines automated data pipelines with original long-form analysis, giving readers both the numbers and the narrative. Every market page pulls live data from institutional sources; every research piece maps cross-market implications.</p>

        <p style={{ marginBottom: 24 }}>Founded by Sami Samii, S2D Capital Insights is built for investors, analysts, and decision-makers who need a unified view of global markets.</p>

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
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Contact: <a href="mailto:sami@s2d.info" style={{ color: '#D4B85C', textDecoration: 'none' }}>sami@s2d.info</a></p>
        </div>
      </div>
      </div>
    </main>
  );
}
