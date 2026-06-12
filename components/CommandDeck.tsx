'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, Landmark, Fuel, ArrowLeftRight, Globe2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// same engine as the expeditions — country shapes, glowing city labels,
// lightning arcs. Lazy + client-only so the homepage still paints instantly.
const JourneyGlobeGL = dynamic(() => import('@/components/JourneyGlobeGL'), {
  ssr: false,
  loading: () => (
    <div aria-label="Loading globe" style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '72%', aspectRatio: '1', borderRadius: '50%', border: '1px solid rgba(184,134,11,0.2)', background: 'radial-gradient(circle, rgba(14,22,38,0.9), rgba(10,14,26,0.4))' }} />
    </div>
  ),
});
import { JOURNEYS } from '@/lib/journeys';
import type { MarketDataResponse } from '@/hooks/useMarketData';

const GOLD_LIGHT = '#D4B85C';

// Each vertical is a place on Earth the globe flies to
const LENSES = [
  {
    key: 'crypto', label: 'Crypto', Icon: Bitcoin, color: '#B8860B',
    loc: [40.71, -74.0] as [number, number], locLabel: 'NEW YORK — WHERE THE ETF FLOWS LAND',
    spots: [{ name: 'NEW YORK · ETF FLOWS', loc: [40.71, -74.0] }, { name: 'LONDON', loc: [51.5, -0.13] }, { name: 'ZUG · CRYPTO VALLEY', loc: [47.17, 8.52] }, { name: 'SINGAPORE', loc: [1.35, 103.82] }, { name: 'HONG KONG', loc: [22.32, 114.17] }] as { name: string; loc: [number, number] }[],
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
    spots: [{ name: 'WASHINGTON · FED', loc: [38.9, -77.04] }, { name: 'FRANKFURT · ECB', loc: [50.11, 8.68] }, { name: 'LONDON · BOE', loc: [51.5, -0.13] }, { name: 'TOKYO · BOJ', loc: [35.68, 139.69] }, { name: 'BEIJING · PBOC', loc: [39.9, 116.4] }] as { name: string; loc: [number, number] }[],
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
    spots: [{ name: 'STRAIT OF HORMUZ', loc: [26.6, 56.5] }, { name: 'HOUSTON', loc: [29.76, -95.36] }, { name: 'ROTTERDAM', loc: [51.95, 4.05] }, { name: 'GENEVA · TRADING', loc: [46.2, 6.14] }, { name: 'SINGAPORE', loc: [1.35, 103.82] }] as { name: string; loc: [number, number] }[],
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
    spots: [{ name: 'LONDON · FX CAPITAL', loc: [51.5, -0.13] }, { name: 'NEW YORK', loc: [40.71, -74.0] }, { name: 'TOKYO', loc: [35.68, 139.69] }, { name: 'ZURICH', loc: [47.38, 8.54] }, { name: 'SYDNEY', loc: [-33.87, 151.21] }] as { name: string; loc: [number, number] }[],
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
    spots: [{ name: 'TAIPEI', loc: [25.03, 121.56] }, { name: 'WASHINGTON', loc: [38.9, -77.04] }, { name: 'MOSCOW', loc: [55.75, 37.62] }, { name: 'TEHRAN', loc: [35.69, 51.39] }, { name: 'BRUSSELS', loc: [50.85, 4.35] }] as { name: string; loc: [number, number] }[],
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
  const [spot, setSpot] = useState<[number, number] | null>(null);
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
          <button key={l.key} onClick={() => { setSel(i); setSpot(null); }}
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
          <JourneyGlobeGL
            key={lens.key}
            stops={lens.spots.map((sp, i) => ({ place: sp.name, location: sp.loc, active: (spot ?? lens.loc).join() === sp.loc.join(), index: i }))}
            arcs={lens.spots.slice(1).map((sp) => ({ from: lens.spots[0].loc, to: sp.loc }))}
            focus={spot ?? lens.loc}
            activeCountry={null}
            onStopClick={(i) => setSpot(lens.spots[i].loc)}
          />
        </div>

        {/* Live data panel for the selected lens */}
        <AnimatePresence mode="wait">
          <motion.div key={lens.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ background: 'rgba(17,25,40,0.65)', border: `1px solid ${lens.color}33`, borderRadius: 10, padding: '26px 26px 22px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', color: lens.color, fontWeight: 700, marginBottom: 8 }}>
              {lens.locLabel}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'baseline', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>FLY TO:</span>
              {lens.spots.map((sp) => {
                const isHere = (spot ?? lens.loc).join() === sp.loc.join();
                return (
                  <button key={sp.name} onClick={() => setSpot(sp.loc)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 3, cursor: 'pointer', background: isHere ? `${lens.color}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${isHere ? lens.color : 'rgba(255,255,255,0.1)'}`, color: isHere ? lens.color : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', fontWeight: isHere ? 700 : 400 }}>
                    {sp.name}
                  </button>
                );
              })}
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
              <Link href={lens.href}
                style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', padding: '11px 0', borderRadius: 4, background: lens.color, color: '#fff', textDecoration: 'none', transition: 'all 0.25s', boxShadow: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#D4B85C'; e.currentTarget.style.color = '#0D1322'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(212,184,92,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = lens.color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                OPEN MARKETS
              </Link>
              <Link href="/research"
                style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', padding: '11px 0', borderRadius: 4, background: 'transparent', border: `1px solid ${lens.color}66`, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'all 0.25s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = lens.color; e.currentTarget.style.borderColor = lens.color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 6px 30px ${lens.color}77`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${lens.color}66`; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                READ RESEARCH
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Expeditions strip — sell the experience, not the metadata ── */
const TAGLINES: Record<string, string> = {
  silicon: 'Fly the chip supply chain — from a Californian design lab to machines that print atoms, and on to data centers in orbit.',
  'russia-oil': 'Chase one sanctioned barrel through ghost tankers with their transponders dark, all the way into the yuan trap.',
  'europe-energy': 'Ride the molecules keeping Europe lit — from North Sea platforms to the Amsterdam screen where the price is set.',
};

export function ExpeditionsStrip() {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, justifyContent: 'center' }}>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg,transparent,var(--gold-light))' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: GOLD_LIGHT, fontWeight: 600 }}>EXPEDITIONS</span>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg,var(--gold-light),transparent)' }} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 400, color: '#fff', textAlign: 'center', margin: '0 0 28px' }}>
        Don&apos;t read the report. <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>Travel it.</em>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {JOURNEYS.map((j) => (
          <Link key={j.slug} href={`/journey/${j.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{ position: 'relative', background: 'rgba(17,25,40,0.65)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 10, padding: '24px 22px 20px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,184,92,0.7)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(184,134,11,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--font-mono)', fontSize: '0.46rem', letterSpacing: '0.12em', color: '#0D1322', background: GOLD_LIGHT, borderRadius: 3, padding: '3px 7px', fontWeight: 700 }}>
                INTERACTIVE 3D
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.18em', color: GOLD_LIGHT, fontWeight: 700 }}>
                {j.name}
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', margin: 0, flex: 1 }}>
                {TAGLINES[j.slug] ?? j.description}
              </p>
              {/* route line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {j.chapters.map((c, i) => (
                  <span key={c.num} style={{ display: 'flex', alignItems: 'center', flex: i < j.chapters.length - 1 ? 1 : 'none' }}>
                    <span style={{ width: i === 0 || i === j.chapters.length - 1 ? 7 : 5, height: i === 0 || i === j.chapters.length - 1 ? 7 : 5, borderRadius: '50%', background: GOLD_LIGHT, opacity: i === 0 ? 1 : 0.55, flexShrink: 0 }} />
                    {i < j.chapters.length - 1 && <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,184,92,0.5), rgba(212,184,92,0.15))' }} />}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
                  {j.chapters[0].place} → {j.chapters[j.chapters.length - 1].place}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0D1322', background: `linear-gradient(135deg, ${GOLD_LIGHT}, #B8860B)`, padding: '8px 16px', borderRadius: 4 }}>
                  LAUNCH →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
