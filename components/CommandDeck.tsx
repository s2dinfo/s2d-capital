'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, Landmark, Fuel, ArrowLeftRight, Globe2 } from 'lucide-react';
import JourneyGlobe from '@/components/JourneyGlobe';
import { JOURNEYS } from '@/lib/journeys';
import type { MarketDataResponse } from '@/hooks/useMarketData';

const GOLD_LIGHT = '#D4B85C';

// Each vertical is a place on Earth the globe flies to
const LENSES = [
  {
    key: 'crypto', label: 'Crypto', Icon: Bitcoin, color: '#B8860B',
    loc: [40.71, -74.0] as [number, number], locLabel: 'NEW YORK — WHERE THE ETF FLOWS LAND',
    href: '/markets/crypto',
    rows: (md: MarketDataResponse | null) => [
      { l: 'Bitcoin', v: md?.symbols?.BTC?.price ? '$' + md.symbols.BTC.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—', chg: md?.symbols?.BTC?.change },
      { l: 'Ethereum', v: md?.symbols?.ETH?.price ? '$' + md.symbols.ETH.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—', chg: md?.symbols?.ETH?.change },
      { l: 'Fear & Greed', v: md?.fearGreed ? `${md.fearGreed.value} · ${md.fearGreed.label}` : '—' },
    ],
  },
  {
    key: 'macro', label: 'Macro', Icon: Landmark, color: '#3B6CB4',
    loc: [38.9, -77.04] as [number, number], locLabel: 'WASHINGTON — WHERE THE COST OF MONEY IS SET',
    href: '/markets/macro',
    rows: (md: MarketDataResponse | null) => [
      { l: 'Fed Rate', v: md?.fedRate ? md.fedRate + '%' : '—' },
      { l: '10Y Yield', v: md?.symbols?.US10Y?.price ? md.symbols.US10Y.price.toFixed(2) + '%' : '—' },
      { l: 'S&P 500', v: md?.symbols?.SPX?.price ? md.symbols.SPX.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—', chg: md?.symbols?.SPX?.change },
    ],
  },
  {
    key: 'commodities', label: 'Commodities', Icon: Fuel, color: '#8B5E3C',
    loc: [26.6, 56.5] as [number, number], locLabel: 'STRAIT OF HORMUZ — WHERE A FIFTH OF OIL SQUEEZES THROUGH',
    href: '/markets/commodities',
    rows: (md: MarketDataResponse | null) => [
      { l: 'Gold', v: md?.symbols?.GOLD?.price ? '$' + md.symbols.GOLD.price.toFixed(0) : '—', chg: md?.symbols?.GOLD?.change },
      { l: 'WTI Oil', v: md?.symbols?.OIL?.price ? '$' + md.symbols.OIL.price.toFixed(2) : '—', chg: md?.symbols?.OIL?.change },
      { l: 'Nat Gas', v: md?.symbols?.NATGAS?.price ? '$' + md.symbols.NATGAS.price.toFixed(2) : '—', chg: md?.symbols?.NATGAS?.change },
    ],
  },
  {
    key: 'fx', label: 'FX', Icon: ArrowLeftRight, color: '#2D8F5E',
    loc: [51.5, -0.13] as [number, number], locLabel: 'LONDON — WHERE CURRENCIES CHANGE HANDS',
    href: '/markets/fx',
    rows: (md: MarketDataResponse | null) => [
      { l: 'EUR/USD', v: md?.symbols?.EURUSD?.price ? md.symbols.EURUSD.price.toFixed(4) : '—', chg: md?.symbols?.EURUSD?.change },
      { l: 'USD/JPY', v: md?.symbols?.USDJPY?.price ? md.symbols.USDJPY.price.toFixed(2) : '—', chg: md?.symbols?.USDJPY?.change },
      { l: 'Dollar (DXY)', v: md?.symbols?.DXY?.price ? md.symbols.DXY.price.toFixed(2) : '—', chg: md?.symbols?.DXY?.change },
    ],
  },
  {
    key: 'geopolitics', label: 'Geopolitics', Icon: Globe2, color: '#8B2252',
    loc: [25.03, 121.56] as [number, number], locLabel: 'TAIPEI — WHERE THE NEXT CRISIS HAS COORDINATES',
    href: '/markets/geopolitics',
    rows: (md: MarketDataResponse | null) => [
      { l: 'VIX', v: md?.symbols?.VIX?.price ? md.symbols.VIX.price.toFixed(1) : '—', chg: md?.symbols?.VIX?.change },
      { l: 'Gold (haven)', v: md?.symbols?.GOLD?.price ? '$' + md.symbols.GOLD.price.toFixed(0) : '—', chg: md?.symbols?.GOLD?.change },
      { l: 'Brent', v: md?.symbols?.BRENT?.price ? '$' + md.symbols.BRENT.price.toFixed(2) : '—', chg: md?.symbols?.BRENT?.change },
    ],
  },
];

function chgColor(c?: number | null) {
  if (c == null) return 'rgba(255,255,255,0.5)';
  return c >= 0 ? 'var(--green, #34d399)' : 'var(--red, #f87171)';
}

export default function CommandDeck({ md }: { md: MarketDataResponse | null }) {
  const [sel, setSel] = useState(0);
  const lens = LENSES[sel];

  return (
    <div style={{ width: '100%', maxWidth: 1160, margin: '0 auto' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .cd-grid{display:grid;grid-template-columns:1fr 0.9fr;gap:32px;align-items:center}
        .cd-globe{width:min(100%,520px);margin:0 auto}
        @media(max-width:860px){.cd-grid{grid-template-columns:1fr}.cd-globe{width:min(78vw,340px)}}
      `}} />

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 18, fontWeight: 500 }}>
        CHOOSE YOUR LENS — THE GLOBE FOLLOWS
      </p>

      {/* Lens chips */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
        {LENSES.map((l, i) => (
          <button key={l.key} onClick={() => setSel(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 6, cursor: 'pointer',
              background: i === sel ? `${l.color}1f` : 'rgba(17,25,40,0.6)',
              border: `1.5px solid ${i === sel ? l.color : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.25s', boxShadow: i === sel ? `0 0 24px ${l.color}33` : 'none',
            }}>
            <l.Icon size={15} strokeWidth={1.6} color={i === sel ? l.color : 'rgba(255,255,255,0.55)'} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 600, color: i === sel ? l.color : 'rgba(255,255,255,0.55)' }}>
              {l.label.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <div className="cd-grid">
        {/* Globe flies to the selected lens */}
        <div className="cd-globe">
          <JourneyGlobe
            markers={LENSES.map((l) => ({ location: l.loc, size: 0.05 }))}
            focus={lens.loc}
          />
        </div>

        {/* Live data panel for the selected lens */}
        <AnimatePresence mode="wait">
          <motion.div key={lens.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ background: 'rgba(17,25,40,0.65)', border: `1px solid ${lens.color}33`, borderRadius: 10, padding: '26px 26px 22px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', color: lens.color, fontWeight: 700, marginBottom: 16 }}>
              {lens.locLabel}
            </div>
            {lens.rows(md).map((r) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{r.l}</span>
                <span style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{r.v}</span>
                  {'chg' in r && r.chg != null && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, color: chgColor(r.chg) }}>
                      {r.chg >= 0 ? '+' : ''}{r.chg.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Link href={lens.href} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', padding: '11px 0', borderRadius: 4, background: lens.color, color: '#fff', textDecoration: 'none' }}>
                OPEN MARKETS
              </Link>
              <Link href="/research" style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', padding: '11px 0', borderRadius: 4, background: 'transparent', border: `1px solid ${lens.color}66`, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                READ RESEARCH
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Expeditions strip — the journeys as first-class homepage citizens ── */
export function ExpeditionsStrip() {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: 'center' }}>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg,transparent,var(--gold-light))' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: GOLD_LIGHT, fontWeight: 600 }}>EXPEDITIONS</span>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg,var(--gold-light),transparent)' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '0 auto 22px', maxWidth: 520, lineHeight: 1.7 }}>
        Our research as interactive globe briefings — travel a supply chain chapter by chapter with live data at every stop.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {JOURNEYS.map((j) => (
          <Link key={j.slug} href={`/journey/${j.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'relative', background: 'rgba(17,25,40,0.6)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 8, padding: '20px 20px 16px', height: '100%', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-mono)', fontSize: '0.46rem', letterSpacing: '0.12em', color: '#0D1322', background: GOLD_LIGHT, borderRadius: 3, padding: '3px 7px', fontWeight: 700 }}>
                INTERACTIVE
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.16em', color: GOLD_LIGHT, fontWeight: 700, marginBottom: 8 }}>
                {j.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
                {j.chapters[0].place} → {j.chapters[j.chapters.length - 1].place}
                <br />
                {j.chapters.length} CHAPTERS · LIVE DATA · 3D GLOBE
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
