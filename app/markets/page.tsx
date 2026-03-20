"use client";
import Link from 'next/link';
import BackButton from '@/components/BackButton';

const verticals = [
  { slug: 'crypto', label: 'Crypto & Digital Assets', desc: 'Regulation, ETFs, Tokenization, DeFi', color: '#B8860B' },
  { slug: 'macro', label: 'Macro & Central Banks', desc: 'Fed, ECB, BOJ, Rates, Liquidity', color: '#3B6CB4' },
  { slug: 'commodities', label: 'Commodities & Energy', desc: 'Oil, Gold, Agriculture, Supply Chains', color: '#8B5E3C' },
  { slug: 'fx', label: 'FX & Currencies', desc: 'Dollar, EUR/USD, EM Currencies, Stablecoins', color: '#2D8F5E' },
  { slug: 'geopolitics', label: 'Geopolitics & Policy', desc: 'Trade Wars, Sanctions, Elections', color: '#8B2252' },
  { slug: 'structure', label: 'Market Structure', desc: 'Institutional Flows, ETF Architecture, TradFi', color: '#5B4FA0' },
];

export default function MarketsPage() {
  return (
    <>
      <BackButton label="Home" href="/" />
      <div style={{ textAlign: 'center', padding: '48px 24px 32px', background: 'linear-gradient(180deg, var(--gold-tint, #faf6ee) 0%, var(--bg, #fff) 100%)', borderBottom: '1px solid var(--border, #E8E6E0)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold, #b8860b)', marginBottom: 16 }}>S2D Capital Insights</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--navy, #1A1A2E)', marginBottom: 14 }}>
          Markets & <em style={{ fontStyle: 'italic', color: 'var(--gold, #b8860b)' }}>Data</em>
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-sec, #6B6B82)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Live data and analysis across six verticals. Choose your market.
        </p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {verticals.map(v => (
            <Link key={v.slug} href={`/markets/${v.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid var(--border, #E8E6E0)',
                borderRadius: 8,
                padding: '24px 20px',
                transition: 'all 0.3s',
                cursor: 'pointer',
                borderLeft: `3px solid ${v.color}`,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = v.color; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #E8E6E0)'; }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 500, color: 'var(--navy, #1A1A2E)', marginBottom: 6 }}>{v.label}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sec, #6B6B82)', lineHeight: 1.6 }}>{v.desc}</p>
                <span style={{ display: 'inline-block', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: v.color, fontWeight: 600 }}>View Data →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
