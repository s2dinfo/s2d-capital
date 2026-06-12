'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyGlobe from '@/components/JourneyGlobe';
import Footer from '@/components/Footer';

const PUBLISH_DATE = '2026-05-13';

interface Chapter {
  num: string;
  place: string;
  country: string;
  stage: string;
  location: [number, number];
  title: string;
  accent: string; // trailing part of title rendered in italic gold
  body: string;
  ticker: { label: string; symbol: string; currency: string };
}

const CHAPTERS: Chapter[] = [
  {
    num: '01', place: 'SANTA CLARA', country: 'USA', stage: 'DESIGN', location: [37.35, -121.95],
    title: 'Where Chips Are Imagined', accent: 'Imagined',
    body: 'NVIDIA and AMD design the most complex objects humans have ever made — processors with tens of billions of transistors — yet they manufacture nothing. The fabless model concentrated America’s edge in pure design and pushed everything physical across the Pacific. Every chapter that follows exists because of that trade.',
    ticker: { label: 'NVIDIA', symbol: 'NVDA', currency: '$' },
  },
  {
    num: '02', place: 'VELDHOVEN', country: 'NETHERLANDS', stage: 'LITHOGRAPHY', location: [51.42, 5.4],
    title: 'The Machine That Prints Reality', accent: 'Prints Reality',
    body: 'One company in a Dutch town builds the only machines on Earth that can print the most advanced chips. Inside each EUV system a tin droplet is hit by a laser 50,000 times per second, making plasma glow at 13.5 nanometres. A single High-NA tool costs roughly $380M. No EUV, no NVIDIA — this is the narrowest chokepoint in the entire supply chain.',
    ticker: { label: 'ASML', symbol: 'ASML', currency: '$' },
  },
  {
    num: '03', place: 'TOKYO', country: 'JAPAN', stage: 'PHOTORESIST', location: [35.68, 139.69],
    title: 'The Invisible Chemistry', accent: 'Chemistry',
    body: 'Lithography is nothing without the light-sensitive chemicals it exposes. Japan dominates advanced photoresists and specialty materials — JSR, Tokyo Ohka, Shin-Etsu — a quiet oligopoly refined over decades. When a single resist plant has an accident, the ripple reaches every fab on the planet within weeks.',
    ticker: { label: 'SHIN-ETSU', symbol: '4063.T', currency: '¥' },
  },
  {
    num: '04', place: 'SEOUL', country: 'SOUTH KOREA', stage: 'MEMORY', location: [37.56, 126.97],
    title: 'The Memory Duopoly', accent: 'Duopoly',
    body: 'AI accelerators are only as fast as the memory feeding them. Samsung and SK Hynix control the high-bandwidth memory that sits millimetres from every AI GPU — and HBM capacity has been effectively sold out since the boom began. Korea turned commodity DRAM into a strategic chokepoint of its own.',
    ticker: { label: 'SK HYNIX', symbol: '000660.KS', currency: '₩' },
  },
  {
    num: '05', place: 'HSINCHU', country: 'TAIWAN', stage: 'FABRICATION', location: [24.81, 120.97],
    title: 'The Foundry at the Center of the World', accent: 'Center of the World',
    body: 'TSMC manufactures roughly 60% of the world’s foundry output and nearly all of its leading-edge chips. Everything funnels here: Californian designs, Dutch machines, Japanese chemistry, Korean memory. One science park in Taiwan is the single point of failure for the digital economy — the “silicon shield.”',
    ticker: { label: 'TSMC', symbol: 'TSM', currency: '$' },
  },
  {
    num: '06', place: 'PENANG', country: 'MALAYSIA', stage: 'PACKAGING', location: [5.41, 100.33],
    title: 'The Quiet Middle', accent: 'Quiet Middle',
    body: 'A finished wafer is not a product. Chips are cut, stacked, bonded and tested across Southeast Asia — and advanced packaging has quietly become the new bottleneck, because gluing chiplets together now matters as much as shrinking them. The unglamorous middle of the chain is where delays are born.',
    ticker: { label: 'AMKOR', symbol: 'AMKR', currency: '$' },
  },
  {
    num: '07', place: 'ASHBURN', country: 'USA', stage: 'DEPLOYMENT', location: [39.04, -77.49],
    title: 'Where Silicon Goes to Work', accent: 'Work',
    body: 'The journey ends where it began — in America, in windowless halls along Data Center Alley. Hyperscalers are committing over a trillion dollars of cumulative AI capex through 2027, and the binding constraint is no longer chips but megawatts. Power, not silicon, is becoming the new scarcity.',
    ticker: { label: 'MICROSOFT', symbol: 'MSFT', currency: '$' },
  },
  {
    num: '08', place: 'ORBIT', country: 'LOW EARTH ORBIT', stage: 'WHAT’S NEXT', location: [0, -150],
    title: 'The Next Frontier Is Up', accent: 'Up',
    body: 'If power is the constraint, the next data centers may not be built on Earth at all. SpaceX, NVIDIA and Google are exploring solar-powered compute in orbit — chips above the atmosphere, fed by uninterrupted sunlight. The supply chain that spans the planet is starting to leave it.',
    ticker: { label: 'ALPHABET', symbol: 'GOOGL', currency: '$' },
  },
];

const GOLD = '#B8860B';
const GOLD_LIGHT = '#D4B85C';

function TickerChip({ chapter }: { chapter: Chapter }) {
  const [data, setData] = useState<{ base: number; last: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setData(null);
    setFailed(false);
    (async () => {
      try {
        const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(chapter.ticker.symbol)}&range=3mo&interval=1d`);
        if (!res.ok) throw new Error('api');
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        const ts: number[] = result?.timestamp ?? [];
        const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
        const pubSec = new Date(PUBLISH_DATE + 'T00:00:00Z').getTime() / 1000;
        let base: number | null = null;
        for (let i = 0; i < ts.length; i++) {
          if (ts[i] >= pubSec && closes[i] != null) { base = closes[i]!; break; }
        }
        let last: number | null = null;
        for (let i = closes.length - 1; i >= 0; i--) {
          if (closes[i] != null) { last = closes[i]!; break; }
        }
        if (mounted && base && last) setData({ base, last });
        else if (mounted) setFailed(true);
      } catch {
        if (mounted) setFailed(true);
      }
    })();
    return () => { mounted = false; };
  }, [chapter.ticker.symbol]);

  const fmt = (v: number) =>
    chapter.ticker.currency + v.toLocaleString('en-US', { maximumFractionDigits: v >= 100 ? 0 : 2 });

  if (failed) return null;
  const pct = data ? ((data.last - data.base) / data.base) * 100 : null;

  return (
    <div style={{ background: 'rgba(11,15,28,0.9)', border: `1px solid ${GOLD}40`, borderRadius: 6, padding: '14px 18px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: GOLD_LIGHT, opacity: 0.85, marginBottom: 7, fontWeight: 600 }}>
        THESIS TRACKER · SINCE PUBLICATION (MAY 13, 2026)
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: '#fff', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600 }}>{chapter.ticker.label}</span>
        {data ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{fmt(data.base)} → {fmt(data.last)}</span>
            <span style={{ color: pct! >= 0 ? 'var(--green, #34d399)' : 'var(--red, #f87171)', fontWeight: 600 }}>
              {pct! >= 0 ? '▲' : '▼'} {pct! >= 0 ? '+' : ''}{pct!.toFixed(1)}%
            </span>
          </>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>loading…</span>
        )}
      </div>
    </div>
  );
}

export default function SiliconJourneyClient() {
  const [active, setActive] = useState(0);
  const ch = CHAPTERS[active];

  const go = useCallback((dir: number) => {
    setActive((a) => Math.min(CHAPTERS.length - 1, Math.max(0, a + dir)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const titleHead = ch.title.slice(0, ch.title.length - ch.accent.length);

  return (
    <div style={{ background: '#0D1322', color: '#fff', minHeight: '100vh' }}>
      {/* SSR escapes ">" in style text children — keep dangerouslySetInnerHTML (see home-client) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .jy-split{display:flex;min-height:640px}
        .jy-globe{flex:1.15;position:relative;background:#0A0E1A;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .jy-panel{flex:1;border-left:1px solid rgba(184,134,11,0.12);background:#111928;padding:56px 48px;display:flex;flex-direction:column;gap:20px;justify-content:center}
        .jy-globe-inner{width:min(86%,620px)}
        .jy-timeline{display:flex;justify-content:space-between;gap:8px;padding:22px 40px 26px;border-top:1px solid rgba(184,134,11,0.12);background:#0B0F1C;overflow-x:auto}
        @media(max-width:900px){
          .jy-split{flex-direction:column;min-height:0}
          .jy-globe{min-height:340px;padding:16px 0}
          .jy-globe-inner{width:min(88%,360px)}
          .jy-panel{border-left:none;border-top:1px solid rgba(184,134,11,0.12);padding:32px 20px}
          .jy-timeline{padding:18px 16px 22px}
        }
      `}} />

      {/* Header strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '14px 40px', borderBottom: '1px solid rgba(184,134,11,0.1)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: GOLD_LIGHT, fontWeight: 600 }}>
          INTERACTIVE BRIEFING · THE SILICON JOURNEY
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
          CHAPTER {ch.num} / {String(CHAPTERS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Main split */}
      <div className="jy-split">
        <div className="jy-globe">
          <div className="jy-globe-inner">
            <JourneyGlobe
              markers={CHAPTERS.filter((c) => c.num !== '08').map((c) => ({ location: c.location, size: 0.05 }))}
              arcs={CHAPTERS.slice(0, 6).map((c, i) => ({ from: c.location, to: CHAPTERS[i + 1].location }))}
              focus={ch.location}
            />
          </div>
          <div style={{ position: 'absolute', top: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div key={ch.num} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ background: 'rgba(11,15,28,0.92)', border: `1px solid ${GOLD}66`, borderRadius: 4, padding: '7px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', color: GOLD_LIGHT, fontWeight: 600 }}>
                {ch.num} · {ch.place}, {ch.country} — {ch.ticker.label}
              </motion.div>
            </AnimatePresence>
          </div>
          <span style={{ position: 'absolute', left: 28, bottom: 20, fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>
            ← → OR TAP A STOP BELOW TO TRAVEL
          </span>
        </div>

        <div className="jy-panel">
          <AnimatePresence mode="wait">
            <motion.div key={ch.num} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: GOLD_LIGHT, fontWeight: 600 }}>
                CHAPTER {ch.num} — {ch.place}, {ch.country}
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem,3.4vw,2.7rem)', fontWeight: 500, lineHeight: 1.12, margin: 0, color: '#fff' }}>
                {titleHead}
                <span style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>{ch.accent}</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {ch.body}
              </p>
              <TickerChip chapter={ch} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <button onClick={() => go(-1)} disabled={active === 0}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', cursor: active === 0 ? 'default' : 'pointer', opacity: active === 0 ? 0.35 : 1 }}>
                  ← {active > 0 ? `${CHAPTERS[active - 1].num} ${CHAPTERS[active - 1].place}` : 'START'}
                </button>
                {active < CHAPTERS.length - 1 ? (
                  <button onClick={() => go(1)}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(184,134,11,0.25)' }}>
                    {CHAPTERS[active + 1].num} {CHAPTERS[active + 1].place} →
                  </button>
                ) : (
                  <Link href="/research/silicon-the-strategic-commodity"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,134,11,0.25)' }}>
                    READ THE FULL REPORT →
                  </Link>
                )}
              </div>
              <Link href="/research/silicon-the-strategic-commodity" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>
                Read this chapter in depth in the full article →
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Journey timeline */}
      <div className="jy-timeline">
        {CHAPTERS.map((c, i) => {
          const state = i === active ? 'active' : i < active ? 'done' : 'todo';
          return (
            <button key={c.num} onClick={() => setActive(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', minWidth: 86, flexShrink: 0 }}>
              <span style={{
                width: state === 'active' ? 12 : 8, height: state === 'active' ? 12 : 8, borderRadius: '50%',
                background: state === 'todo' ? 'rgba(255,255,255,0.18)' : state === 'active' ? GOLD_LIGHT : `${GOLD}B3`,
                boxShadow: state === 'active' ? `0 0 12px ${GOLD_LIGHT}99` : 'none',
                transition: 'all 0.3s',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.08em', fontWeight: state === 'active' ? 600 : 400, color: state === 'active' ? GOLD_LIGHT : `rgba(255,255,255,${state === 'done' ? 0.55 : 0.3})`, whiteSpace: 'nowrap' }}>
                {c.num} {c.place}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.46rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap' }}>
                {c.stage}
              </span>
            </button>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
