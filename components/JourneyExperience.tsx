'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { JOURNEYS, type JourneyConfig, type JourneyChapter } from '@/lib/journeys';

// three.js-based globe is heavy — load it only on journey routes, client-only
const JourneyGlobeGL = dynamic(() => import('@/components/JourneyGlobeGL'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '70%', aspectRatio: '1', borderRadius: '50%', border: '1px solid rgba(184,134,11,0.2)', background: 'radial-gradient(circle, rgba(14,22,38,0.9), rgba(10,14,26,0.4))' }} />
    </div>
  ),
});

const GOLD = '#B8860B';
const GOLD_LIGHT = '#D4B85C';

function TickerChip({ chapter, publishDate }: { chapter: JourneyChapter; publishDate: string }) {
  const [data, setData] = useState<{ base: number; last: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setData(null);
    setFailed(false);
    (async () => {
      try {
        const pubSec = new Date(publishDate + 'T00:00:00Z').getTime() / 1000;
        const daysSince = (Date.now() / 1000 - pubSec) / 86400;
        const range = daysSince < 80 ? '3mo' : daysSince < 170 ? '6mo' : daysSince < 360 ? '1y' : '2y';
        const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(chapter.ticker.symbol)}&range=${range}&interval=1d`);
        if (!res.ok) throw new Error('api');
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        const ts: number[] = result?.timestamp ?? [];
        const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
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
  }, [chapter.ticker.symbol, publishDate]);

  const fmt = (v: number) =>
    chapter.ticker.currency + v.toLocaleString('en-US', { maximumFractionDigits: v >= 100 ? 0 : 2 });

  if (failed) return null;
  const pct = data ? ((data.last - data.base) / data.base) * 100 : null;
  const pubLabel = new Date(publishDate + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <div style={{ background: 'rgba(11,15,28,0.9)', border: `1px solid ${GOLD}40`, borderRadius: 6, padding: '14px 18px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: GOLD_LIGHT, opacity: 0.85, marginBottom: 7, fontWeight: 600 }}>
        THESIS TRACKER · SINCE PUBLICATION ({pubLabel})
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

export default function JourneyExperience({ config }: { config: JourneyConfig }) {
  const [active, setActive] = useState(0);
  const CHAPTERS = config.chapters;
  const ch = CHAPTERS[active];
  const last = CHAPTERS.length - 1;
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  // Scroll is the primary driver: whichever chapter section is crossing the
  // viewport centre becomes active and the globe flies to it.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        });
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [CHAPTERS.length]);

  const scrollToChapter = useCallback((i: number) => {
    const idx = Math.min(CHAPTERS.length - 1, Math.max(0, i));
    stepRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [CHAPTERS.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); scrollToChapter(active + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); scrollToChapter(active - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, scrollToChapter]);

  const isOrbit = !!config.orbitFinale && active === last;
  const groundStops = CHAPTERS.filter((c) => c.geoName !== null || !config.orbitFinale);
  const activeChokepoints = config.chokepoints.filter((c) => c.activeChapters.includes(ch.num));
  const progress = CHAPTERS.length > 1 ? active / last : 0;

  return (
    <div style={{ background: '#0D1322', color: '#fff', minHeight: '100vh' }}>
      {/* dangerouslySetInnerHTML: SSR escapes ">" in style text children (see home-client) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .jy-grid{display:grid;grid-template-columns:1.15fr 1fr}
        .jy-stage{position:sticky;top:60px;height:calc(100vh - 60px);display:flex;align-items:center;justify-content:center;background:#0A0E1A;overflow:hidden;border-right:1px solid rgba(184,134,11,0.12)}
        .jy-globe-inner{width:min(82%,560px)}
        .jy-steps{display:flex;flex-direction:column}
        .jy-step{min-height:100vh;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:64px 52px}
        .jy-timeline{display:flex;justify-content:space-between;gap:8px;padding:22px 40px 26px;border-top:1px solid rgba(184,134,11,0.12);background:#0B0F1C;overflow-x:auto}
        @media(max-width:900px){
          .jy-grid{grid-template-columns:1fr}
          .jy-stage{top:60px;height:46vh;border-right:none;border-bottom:1px solid rgba(184,134,11,0.12);z-index:50}
          .jy-globe-inner{width:min(64%,280px)}
          .jy-step{min-height:62vh;padding:32px 22px}
          .jy-timeline{padding:18px 16px 22px}
        }
      `}} />

      {/* Header strip + scroll progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '14px 40px', borderBottom: '1px solid rgba(184,134,11,0.1)', position: 'relative' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: GOLD_LIGHT, fontWeight: 600 }}>
          INTERACTIVE BRIEFING · {config.name}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
          CHAPTER {ch.num} / {String(CHAPTERS.length).padStart(2, '0')}
        </span>
        <div style={{ position: 'absolute', left: 0, bottom: -1, height: 2, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 10px ${GOLD_LIGHT}88` }} />
      </div>

      {/* Scrollytelling: sticky globe + scrolling chapter steps */}
      <div className="jy-grid">
        <div className="jy-stage">
          <div className="jy-globe-inner">
            <JourneyGlobeGL
              stops={groundStops.map((c) => ({ place: c.place, location: c.location, active: c.num === ch.num, index: CHAPTERS.indexOf(c) }))}
              arcs={groundStops.slice(0, -1).map((c, i) => ({ from: c.location, to: groundStops[i + 1].location }))}
              chokepoints={activeChokepoints.map((c) => ({ label: c.label, location: c.location }))}
              focus={ch.location}
              activeCountry={ch.geoName}
              zoomedOut={isOrbit}
              onStopClick={(i) => scrollToChapter(i)}
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
          {activeChokepoints.length > 0 && (
            <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ background: 'rgba(28,11,14,0.9)', border: '1px solid rgba(224,90,90,0.5)', borderRadius: 4, padding: '5px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', color: '#E07070', fontWeight: 600 }}>
                ⚠ CHOKEPOINT: {activeChokepoints.map((c) => c.label).join(' · ')}
              </span>
            </div>
          )}
          <span style={{ position: 'absolute', left: 28, bottom: 20, fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>
            SCROLL TO TRAVEL THE ROUTE ↓
          </span>
        </div>

        <div className="jy-steps">
          {CHAPTERS.map((c, i) => {
            const titleHead = c.title.slice(0, c.title.length - c.accent.length);
            const isActive = i === active;
            return (
              <section
                key={c.num}
                data-idx={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="jy-step"
                style={{ opacity: isActive ? 1 : 0.4, transition: 'opacity 0.5s ease' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: GOLD_LIGHT, fontWeight: 600 }}>
                  CHAPTER {c.num} — {c.place}, {c.country}
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem,3.4vw,2.7rem)', fontWeight: 500, lineHeight: 1.12, margin: 0, color: '#fff' }}>
                  {titleHead}
                  <span style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>{c.accent}</span>
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {c.body}
                </p>
                {c.stat && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '12px 18px', background: 'rgba(184,134,11,0.06)', borderLeft: `2px solid ${GOLD}`, borderRadius: '0 6px 6px 0' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: GOLD_LIGHT, fontStyle: 'italic' }}>{c.stat.v}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}>{c.stat.l}</span>
                  </div>
                )}
                <TickerChip chapter={c} publishDate={config.publishDate} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button onClick={() => scrollToChapter(i - 1)} disabled={i === 0}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.35 : 1 }}>
                    ← {i > 0 ? `${CHAPTERS[i - 1].num} ${CHAPTERS[i - 1].place}` : 'START'}
                  </button>
                  {i < last ? (
                    <button onClick={() => scrollToChapter(i + 1)}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(184,134,11,0.25)' }}>
                      {CHAPTERS[i + 1].num} {CHAPTERS[i + 1].place} →
                    </button>
                  ) : (
                    <Link href={`/research/${config.articleSlug}`}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', padding: '11px 18px', borderRadius: 4, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,134,11,0.25)' }}>
                      READ THE FULL REPORT →
                    </Link>
                  )}
                </div>
                <Link href={`/research/${config.articleSlug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>
                  Read this chapter in depth in the full article →
                </Link>
              </section>
            );
          })}
        </div>
      </div>

      {/* Journey timeline */}
      <div className="jy-timeline">
        {CHAPTERS.map((c, i) => {
          const state = i === active ? 'active' : i < active ? 'done' : 'todo';
          return (
            <button key={c.num} onClick={() => scrollToChapter(i)}
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

      {/* Other journeys */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, padding: '18px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>MORE JOURNEYS:</span>
        {JOURNEYS.filter((j) => j.slug !== config.slug).map((j) => (
          <Link key={j.slug} href={`/journey/${j.slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: GOLD_LIGHT, textDecoration: 'none', padding: '6px 14px', border: '1px solid rgba(184,134,11,0.3)', borderRadius: 4 }}>
            {j.name} →
          </Link>
        ))}
      </div>

      <Footer />
    </div>
  );
}
