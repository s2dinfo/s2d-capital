'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { VERTICALS } from '@/lib/verticals';
import { articles } from '@/lib/articles';

// New enhanced components
import ParticleField from '@/components/ParticleField';
import AnimatedCounter from '@/components/AnimatedCounter';
import TVCandlestickChart, { generateMockCandles } from '@/components/TVCandlestickChart';
import FearGreedGauge from '@/components/FearGreedGauge';
import InteractiveVerticalCard from '@/components/InteractiveVerticalCard';

function Mini({ data, color, h = 40 }: { data: number[]; color: string; h?: number }) {
  if (!data || data.length < 5) return null;
  const sampled = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 30)) === 0);
  const chartData = sampled.map((v, i) => ({ t: i, v }));
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g${color.slice(1)})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

function fakeSparkline(base: number, volatility: number): number[] {
  return Array.from({ length: 30 }, (_, i) => base + Math.sin(i * 0.35) * volatility + (Math.random() - 0.5) * volatility * 0.6);
}

const domData = [
  { name: 'BTC', value: 56.2, color: '#C9A84C' },
  { name: 'ETH', value: 10.1, color: '#5B8BD4' },
  { name: 'Other', value: 33.7, color: '#1E1E30' },
];

function SparkCard({ name, val, color, prefix, dec, spark, delay: d }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#151528' : '#111120', border: `1px solid ${hovered ? color + '44' : '#1A1A2E'}`, padding: '12px 10px', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hovered ? `0 6px 20px ${color}12` : 'none', position: 'relative' as const, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}${hovered ? '15' : '00'} 0%, transparent 70%)`, transition: 'all 0.4s ease', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.44rem', letterSpacing: '0.1em', color }}>{name}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: color === '#E8453C' ? '#E8453C' : '#F0EDE6', marginBottom: 3 }}>
        <AnimatedCounter value={val} prefix={prefix || ''} decimals={dec || 0} className="" />
      </div>
      <Mini data={spark} color={color} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, width: hovered ? '100%' : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
    </motion.div>
  );
}

function MacroCard({ macro }: { macro: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#151528' : '#111120', border: `1px solid ${hovered ? '#5B8BD444' : '#1A1A2E'}`, padding: '12px 10px', flex: 1, transition: 'all 0.3s ease', transform: hovered ? 'translateY(-1px)' : 'translateY(0)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#5B8BD4', display: 'block', marginBottom: 8 }}>MACRO & CENTRAL BANKS</span>
      {[
        { l: 'Fed Rate', v: (macro?.fedRate || '-') + '%', c: '#5B8BD4' },
        { l: '10Y Yield', v: (macro?.t10y || '-') + '%', c: '#5B8BD4' },
        { l: 'CPI', v: macro?.cpi || '-', c: '#B87333' },
        { l: 'Unemployment', v: (macro?.unemp || '-') + '%', c: '#E8453C' },
        { l: 'Dollar (DXY)', v: macro?.dxy || '-', c: '#4CAF86' },
        { l: 'M2 Supply', v: macro?.m2 ? '$' + (parseFloat(macro.m2) / 1e3).toFixed(1) + 'T' : '-', c: '#5B8BD4' },
      ].map(m => (
        <div key={m.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
          <span style={{ fontSize: '0.65rem', color: '#666' }}>{m.l}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 500, color: m.c }}>{m.v}</span>
        </div>
      ))}
    </div>
  );
}

function FXCard({ fx }: { fx: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#151528' : '#111120', border: `1px solid ${hovered ? '#4CAF8644' : '#1A1A2E'}`, padding: '12px 10px', transition: 'all 0.3s ease', transform: hovered ? 'translateY(-1px)' : 'translateY(0)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#4CAF86', display: 'block', marginBottom: 8 }}>FX RATES</span>
      {fx && [
        { p: 'EUR/USD', v: (1 / fx.EUR).toFixed(4) },
        { p: 'GBP/USD', v: (1 / fx.GBP).toFixed(4) },
        { p: 'USD/JPY', v: fx.JPY?.toFixed(2) },
        { p: 'USD/CHF', v: fx.CHF?.toFixed(4) },
      ].map(f => (
        <div key={f.p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
          <span style={{ fontSize: '0.65rem', color: '#666' }}>{f.p}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 500, color: '#4CAF86' }}>{f.v}</span>
        </div>
      ))}
    </div>
  );
}

function FeaturedArticle({ featured, btc }: { featured: any; btc: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ padding: '0 24px 32px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.44rem', letterSpacing: '0.16em', color: '#444', marginBottom: 10 }}>LATEST RESEARCH</p>
      <Link href={`/research/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ background: hovered ? '#151528' : '#111120', border: `1px solid ${hovered ? '#C9A84C44' : '#1A1A2E'}`, padding: '24px 20px', borderLeft: '3px solid #C9A84C', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hovered ? '0 8px 24px rgba(201,168,76,0.08)' : 'none', position: 'relative' as const, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(201,168,76,${hovered ? '0.08' : '0'}) 0%, transparent 70%)`, transition: 'all 0.4s ease', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {featured.tags.map((t: string) => (
              <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', letterSpacing: '0.08em', padding: '2px 8px', background: `${VERTICALS[t].hex}18`, color: VERTICALS[t].hex }}>{VERTICALS[t].labelShort}</span>
            ))}
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: hovered ? '#F8F4EC' : '#F0EDE6', lineHeight: 1.3, marginBottom: 8, transition: 'color 0.2s' }}>{featured.title}</h3>
          <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6, maxWidth: 600 }}>{featured.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#444' }}>
            <div className="s2d-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF86' }} />
            <span>BTC ${btc?.usd?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-'}</span>
            <span style={{ color: btc?.usd_24h_change > 0 ? '#4CAF86' : '#E8453C' }}>{btc?.usd_24h_change > 0 ? '+' : ''}{btc?.usd_24h_change?.toFixed(1)}%</span>
            <span style={{ marginLeft: 'auto', color: '#C9A84C' }}>{featured.date} &middot; {featured.readTime}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', width: hovered ? '100%' : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </Link>
    </div>
  );
}

export default function HomeClient({ prices, macro, commod, fx, fg, global, indices }: any) {
  const [time, setTime] = useState('');
  const [btcCandles] = useState(() => generateMockCandles(84500, 90, 1800));
  const [ethCandles] = useState(() => generateMockCandles(2150, 90, 80));

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    return () => clearInterval(iv);
  }, []);

  const fgVal = fg?.current?.value ?? 50;
  const fgLabel = fg?.current?.label ?? 'Neutral';
  const vixVal = indices?.vix?.val;
  const vixCol = vixVal ? (vixVal > 30 ? '#E8453C' : vixVal > 20 ? '#E88A3C' : '#4CAF86') : '#888';
  const btc = prices?.bitcoin;
  const featured = articles.find((a: any) => a.featured);

  const marqueeItems = [
    { l: 'S&P 500', v: indices?.sp500?.val?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-' },
    { l: 'DOW', v: indices?.djia?.val?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-' },
    { l: 'NASDAQ', v: indices?.nasdaq?.val?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-' },
    { l: 'NIKKEI', v: indices?.nikkei?.val?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-' },
    { l: 'VIX', v: vixVal?.toFixed(1) || '-', c: vixCol },
    { l: 'BTC', v: '$' + (btc?.usd?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '-'), c: btc?.usd_24h_change > 0 ? '#4CAF86' : '#E8453C' },
    { l: 'GOLD', v: '$' + (commod?.gold?.toFixed(0) || '-') },
    { l: 'OIL', v: '$' + (commod?.oil?.toFixed(2) || '-') },
    { l: 'EUR/USD', v: fx ? (1 / fx.EUR).toFixed(4) : '-' },
    { l: 'FED', v: (macro?.fedRate || '-') + '%' },
  ];

  return (
    <div style={{ background: '#0D0D14', color: '#E8E8F0', minHeight: '100vh' }}>
      <style>{`
        @keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}
        @keyframes s2d-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .s2d-pulse{animation:s2d-pulse 2s infinite}
      `}</style>

      {/* SCROLLING MARQUEE */}
      <div style={{ background: '#111120', borderBottom: '1px solid #1E1E30', overflow: 'hidden', whiteSpace: 'nowrap', height: 32 }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-flex', alignItems: 'center', height: 32 }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 28, fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}>
              <span style={{ color: '#555' }}>{item.l}</span>
              <span style={{ color: item.c || '#bbb', fontWeight: 500 }}>{item.v}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* HERO WITH PARTICLES */}
      <div style={{ padding: '44px 40px 20px', textAlign: 'center', position: 'relative', minHeight: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><ParticleField /></div>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 55%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Image src="/logo-hero.png" alt="S2D" width={240} height={160} style={{ filter: 'brightness(1.4) drop-shadow(0 4px 20px rgba(201,168,76,0.15))', marginBottom: 16 }} priority />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.2 }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.4em', color: '#C9A84C', marginBottom: 14 }}>FINANCIAL INTELLIGENCE</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,4.5vw,3.2rem)', fontWeight: 400, lineHeight: 1.1, color: '#F0EDE6', marginBottom: 12 }}>
            Where Markets Meet <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>Clarity</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ fontSize: '0.82rem', color: '#555', maxWidth: 420, margin: '0 auto 26px', lineHeight: 1.7, fontWeight: 300 }}>
            Six verticals. One picture. Live data from global equities, crypto, macro, commodities, FX, and geopolitics.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/markets" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', padding: '11px 28px', background: 'linear-gradient(135deg,#C9A84C,#A08030)', color: '#0D0D14', fontWeight: 700, textTransform: 'uppercase' as const, textDecoration: 'none' }}>Live Markets &rarr;</Link>
            <Link href="/research" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', padding: '11px 28px', background: 'transparent', color: '#777', border: '1px solid #2A2A3E', textTransform: 'uppercase' as const, textDecoration: 'none' }}>Research</Link>
          </motion.div>
        </div>
      </div>

      {/* MARKET PULSE */}
      <Section>
        <div style={{ padding: '8px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <div className="s2d-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF86', boxShadow: '0 0 6px rgba(76,175,134,0.4)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', letterSpacing: '0.18em', color: '#4CAF86' }}>MARKET PULSE</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: '#333' }}>{time}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr', gap: 8 }}>
            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {[
                  { name: 'S&P 500', val: indices?.sp500?.val || 6796, color: '#C9A84C', spark: fakeSparkline(6700, 150) },
                  { name: 'BITCOIN', val: btc?.usd || 68980, color: '#C9A84C', prefix: '$', spark: fakeSparkline(67000, 2500) },
                  { name: 'GOLD', val: commod?.gold || 5103, color: '#B87333', prefix: '$', spark: fakeSparkline(5000, 150) },
                  { name: 'VIX', val: vixVal || 29.5, color: '#E8453C', dec: 1, spark: fakeSparkline(24, 4) },
                ].map((card, i) => <SparkCard key={card.name} {...card} delay={0.1 * i} />)}
              </div>
              {/* TradingView Candlestick Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                <TVCandlestickChart data={btcCandles} title="BTC / USD" height={200} />
                <TVCandlestickChart data={ethCandles} title="ETH / USD" height={200} />
              </div>
            </div>
            {/* MIDDLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <MacroCard macro={macro} />
              <FXCard fx={fx} />
            </div>
            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '14px 10px', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#C9A84C', display: 'block', marginBottom: 8 }}>FEAR & GREED INDEX</span>
                <FearGreedGauge value={fgVal} label={fgLabel} />
              </div>
              <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#C9A84C', display: 'block', marginBottom: 4 }}>BTC DOMINANCE</span>
                <div style={{ width: 85, margin: '0 auto' }}>
                  <ResponsiveContainer width="100%" height={85}>
                    <PieChart><Pie data={domData.map((d, i) => ({ ...d, value: i === 0 ? (global?.btcDom || 56.2) : i === 1 ? (global?.ethDom || 10.1) : 100 - (global?.btcDom || 56.2) - (global?.ethDom || 10.1) }))} cx="50%" cy="50%" innerRadius={26} outerRadius={38} dataKey="value" strokeWidth={0}>{domData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: '#C9A84C' }}>
                  <AnimatedCounter value={global?.btcDom || 56.2} suffix="%" decimals={1} className="" />
                </span>
              </div>
              <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#7B6FAF', display: 'block', marginBottom: 7 }}>YIELD CURVE SIGNAL</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: parseFloat(macro?.yieldSpread || '1') < 0 ? '#E8453C' : '#4CAF86', textAlign: 'center' }}>{macro?.yieldSpread || '-'}%</div>
                <p style={{ fontSize: '0.5rem', color: '#555', textAlign: 'center', marginTop: 2 }}>{parseFloat(macro?.yieldSpread || '1') < 0 ? 'INVERTED — Recession signal' : 'Positive — Normal'}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* VERTICALS */}
      <Section delay={0.1}>
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.44rem', letterSpacing: '0.16em', color: '#444', marginBottom: 10 }}>EXPLORE VERTICALS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { shortLabel: 'Crypto', title: 'Crypto & Digital Assets', subtitle: 'Regulation, ETFs, Tokenization, DeFi', tags: ['CLARITY', 'ETFs', 'BTC', 'DeFi'], color: '#C9A84C', href: '/markets/crypto' },
              { shortLabel: 'Macro', title: 'Macro & Central Banks', subtitle: 'Fed, ECB, BOJ, Rates, Liquidity', tags: ['Fed', 'ECB', 'Rates', 'CPI'], color: '#5B8BD4', href: '/markets/macro' },
              { shortLabel: 'Commodities', title: 'Commodities & Energy', subtitle: 'Oil, Gold, Agriculture, Supply Chains', tags: ['Gold', 'Oil', 'Copper'], color: '#B87333', href: '/markets/commodities' },
              { shortLabel: 'FX', title: 'FX & Currencies', subtitle: 'Dollar, EUR/USD, EM Currencies, Stablecoins', tags: ['DXY', 'EUR', 'Stablecoins'], color: '#4CAF86', href: '/markets/fx' },
              { shortLabel: 'Geopolitics', title: 'Geopolitics & Policy', subtitle: 'Trade Wars, Sanctions, Elections', tags: ['Tariffs', 'Sanctions', 'EU'], color: '#9B3A5A', href: '/markets/geopolitics' },
              { shortLabel: 'Structure', title: 'Market Structure', subtitle: 'Institutional Flows, ETF Architecture, TradFi', tags: ['ETF Flows', 'OCC', 'Wall St'], color: '#7B6FAF', href: '/markets/structure' },
            ].map((v, i) => <InteractiveVerticalCard key={v.shortLabel} index={i} {...v} />)}
          </div>
        </div>
      </Section>

      {/* FEATURED ARTICLE */}
      {featured && (
        <Section delay={0.15}>
          <FeaturedArticle featured={featured} btc={btc} />
        </Section>
      )}
    </div>
  );
}
