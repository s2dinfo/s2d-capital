'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';

const INDICES = [
  { name: 'S&P 500', val: 6796, prev: 6740 },
  { name: 'DOW', val: 47741, prev: 47502 },
  { name: 'NASDAQ', val: 22388, prev: 22200 },
  { name: 'NIKKEI', val: 52729, prev: 55621 },
  { name: 'VIX', val: 29.5, prev: 23.8 },
];

const MACRO = [
  { l: 'Fed Rate', v: '3.64%', c: '#5B8BD4' },
  { l: '10Y Yield', v: '4.13%', c: '#5B8BD4' },
  { l: 'CPI', v: '326.6', c: '#B87333' },
  { l: 'Unemployment', v: '4.4%', c: '#E8453C' },
  { l: 'Dollar (DXY)', v: '117.8', c: '#4CAF86' },
  { l: 'M2 Supply', v: '$22.4T', c: '#5B8BD4' },
];

const FX = [
  { p: 'EUR/USD', v: '1.1545' }, { p: 'GBP/USD', v: '1.3323' },
  { p: 'USD/JPY', v: '158.33' }, { p: 'USD/CHF', v: '0.7807' },
];

const CHAINS = [
  { name: 'Ethereum', tvl: 55.9 }, { name: 'Solana', tvl: 6.6 },
  { name: 'BSC', tvl: 5.9 }, { name: 'Bitcoin', tvl: 4.5 }, { name: 'Tron', tvl: 4.1 },
];

const domData = [
  { name: 'BTC', value: 56.2, color: '#C9A84C' },
  { name: 'ETH', value: 10.1, color: '#5B8BD4' },
  { name: 'Other', value: 33.7, color: '#2A2A3E' },
];

const spark = (base: number, vol: number) =>
  Array.from({ length: 30 }, (_, i) => ({ t: i, v: base + Math.sin(i * 0.4) * vol + Math.random() * vol * 0.5 }));

function Tick({ value, dec = 0 }: { value: number; dec?: number }) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const iv = setInterval(() => setD(v => v + (Math.random() - 0.48) * value * 0.0003), 2000);
    return () => clearInterval(iv);
  }, [value]);
  return <>{dec > 0 ? d.toFixed(dec) : d.toLocaleString('en-US', { maximumFractionDigits: 0 })}</>;
}

function Mini({ data, color, h = 40 }: { data: any[]; color: string; h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g${color.slice(1)})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Gauge({ value }: { value: number }) {
  const color = value <= 25 ? '#E8453C' : value <= 45 ? '#E88A3C' : value <= 55 ? '#E8D13C' : '#4CAF86';
  const angle = (value / 100) * 180 - 90;
  return (
    <div style={{ position: 'relative', width: 130, height: 75, margin: '0 auto' }}>
      <svg viewBox="0 0 130 75" style={{ width: '100%', height: '100%' }}>
        <path d="M10,70 A55,55 0 0,1 120,70" fill="none" stroke="#1E1E30" strokeWidth="8" strokeLinecap="round" />
        <path d="M10,70 A55,55 0 0,1 120,70" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * 173} 173`} />
        <line x1="65" y1="68" x2={65 + Math.cos((angle * Math.PI) / 180) * 40} y2={68 - Math.sin((angle * Math.PI) / 180) * 40} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="65" cy="68" r="3" fill={color} />
      </svg>
      <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  );
}

export default function TestPage() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(iv);
  }, []);

  const spD = spark(6600, 200);
  const btcD = spark(66000, 3000);
  const goldD = spark(4800, 200);
  const vixD = spark(22, 5);
  const oilD = spark(68, 4);

  return (
    <div style={{ background: '#0D0D14', color: '#E8E8F0', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif" }}>
      {/* TOP BAR */}
      <div style={{ background: '#111120', borderBottom: '1px solid #1E1E30', padding: '6px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6rem', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'serif', fontSize: '0.85rem', fontWeight: 600, color: '#C9A84C' }}>S2D</span>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontFamily: 'monospace', color: '#555', letterSpacing: '0.08em', fontSize: '0.5rem' }}>CAPITAL INSIGHTS</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontFamily: 'monospace', color: '#555', flexShrink: 0 }}>
          {INDICES.map(idx => {
            const chg = ((idx.val - idx.prev) / idx.prev) * 100;
            return (
              <span key={idx.name} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ color: '#666' }}>{idx.name}</span>
                <span style={{ color: '#bbb' }}>{idx.val.toLocaleString('en-US', { maximumFractionDigits: idx.val < 100 ? 1 : 0 })}</span>
                <span style={{ color: chg > 0 ? '#4CAF86' : '#E8453C', fontSize: '0.5rem' }}>{chg > 0 ? '+' : ''}{chg.toFixed(1)}%</span>
              </span>
            );
          })}
          <span style={{ color: '#444' }}>{time}</span>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '40px 40px 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 160, background: 'radial-gradient(ellipse,rgba(201,168,76,0.06),transparent 60%)', pointerEvents: 'none' }} />
        <p style={{ fontFamily: 'monospace', fontSize: '0.52rem', letterSpacing: '0.4em', color: '#C9A84C', marginBottom: 12, opacity: 0.7 }}>FINANCIAL INTELLIGENCE</p>
        <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 400, lineHeight: 1.1, color: '#F0EDE6', marginBottom: 10 }}>
          Where Markets Meet <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>Clarity</em>
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#555', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6, fontWeight: 300 }}>
          Six verticals. One picture. Live data from 8 APIs across global equities, crypto, macro, commodities, FX, and geopolitics.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a href="/markets" style={{ fontFamily: 'monospace', fontSize: '0.62rem', letterSpacing: '0.1em', padding: '11px 28px', background: 'linear-gradient(135deg,#C9A84C,#A08030)', color: '#0D0D14', border: 'none', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none' }}>Live Markets →</a>
          <a href="/research" style={{ fontFamily: 'monospace', fontSize: '0.62rem', letterSpacing: '0.1em', padding: '11px 28px', background: 'transparent', color: '#777', border: '1px solid #2A2A3E', textTransform: 'uppercase', textDecoration: 'none' }}>Research</a>
        </div>
      </div>

      {/* DASHBOARD */}
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF86', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(76,175,134,0.4)' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.48rem', letterSpacing: '0.18em', color: '#4CAF86' }}>MARKET PULSE — LIVE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr', gap: 8 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { name: 'S&P 500', val: 6796, data: spD, color: '#C9A84C', chg: '+0.83%', chgCol: '#4CAF86' },
                { name: 'BITCOIN', val: 68980, data: btcD, color: '#C9A84C', chg: '+3.3%', chgCol: '#4CAF86', prefix: '$' },
                { name: 'GOLD', val: 5103, data: goldD, color: '#B87333', chg: '-1.2%', chgCol: '#E8453C', prefix: '$' },
                { name: 'VIX', val: 29.5, data: vixD, color: '#E8453C', chg: '+24%', chgCol: '#E8453C', dec: 1 },
              ].map(card => (
                <div key={card.name} style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.1em', color: card.color }}>{card.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.46rem', color: card.chgCol }}>{card.chg}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600, color: card.color === '#E8453C' ? '#E8453C' : '#F0EDE6', marginBottom: 3 }}>{card.prefix || ''}<Tick value={card.val} dec={card.dec || 0} /></div>
                  <Mini data={card.data} color={card.color} />
                </div>
              ))}
            </div>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.1em', color: '#B87333' }}>WTI CRUDE OIL — 30 DAYS</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#F0EDE6' }}>$71.13</span>
              </div>
              <Mini data={oilD} color="#B87333" h={55} />
            </div>
          </div>

          {/* MIDDLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px', flex: 1 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#5B8BD4', display: 'block', marginBottom: 8 }}>MACRO & CENTRAL BANKS</span>
              {MACRO.map(m => (
                <div key={m.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666' }}>{m.l}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 500, color: m.c }}>{m.v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#4CAF86', display: 'block', marginBottom: 8 }}>FX RATES</span>
              {FX.map(f => (
                <div key={f.p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666' }}>{f.p}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 500, color: '#4CAF86' }}>{f.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '14px 10px', textAlign: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#E8453C', display: 'block', marginBottom: 8 }}>FEAR & GREED INDEX</span>
              <Gauge value={8} />
              <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', color: '#E8453C', marginTop: 6, fontWeight: 600 }}>Extreme Fear</p>
            </div>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px', textAlign: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#C9A84C', display: 'block', marginBottom: 4 }}>BTC DOMINANCE</span>
              <div style={{ width: 90, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={90}>
                  <PieChart><Pie data={domData} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="value" strokeWidth={0}>{domData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600, color: '#C9A84C' }}>56.2%</span>
            </div>
            <div style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '12px 10px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: '#7B6FAF', display: 'block', marginBottom: 7 }}>DEFI TVL BY CHAIN</span>
              {CHAINS.map(c => (
                <div key={c.name} style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', marginBottom: 1 }}>
                    <span style={{ color: '#777' }}>{c.name}</span>
                    <span style={{ fontFamily: 'monospace', color: '#7B6FAF' }}>${c.tvl}B</span>
                  </div>
                  <div style={{ height: 3, background: '#1A1A2E', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: '#7B6FAF', borderRadius: 2, width: `${(c.tvl / 55.9) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VERTICALS */}
        <div style={{ marginTop: 14 }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.44rem', letterSpacing: '0.16em', color: '#444', marginBottom: 10 }}>EXPLORE VERTICALS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {[
              { name: 'Crypto', color: '#C9A84C', val: '$68,980', sub: 'BTC', href: '/markets/crypto' },
              { name: 'Macro', color: '#5B8BD4', val: '3.64%', sub: 'Fed Rate', href: '/markets/macro' },
              { name: 'Commodities', color: '#B87333', val: '$71.13', sub: 'Oil', href: '/markets/commodities' },
              { name: 'FX', color: '#4CAF86', val: '1.1545', sub: 'EUR/USD', href: '/markets/fx' },
              { name: 'Geopolitics', color: '#9B3A5A', val: '0.59%', sub: 'Yield Curve', href: '/markets/geopolitics' },
              { name: 'Structure', color: '#7B6FAF', val: '$97B', sub: 'DeFi TVL', href: '/markets/structure' },
            ].map(v => (
              <a key={v.name} href={v.href} style={{ background: '#111120', border: '1px solid #1A1A2E', padding: '14px 10px', textDecoration: 'none', color: 'inherit', borderTop: `2px solid ${v.color}`, transition: 'all 0.3s', display: 'block' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.4rem', letterSpacing: '0.1em', color: v.color, display: 'block', marginBottom: 5 }}>{v.name.toUpperCase()}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600, color: '#F0EDE6', display: 'block', lineHeight: 1.2 }}>{v.val}</span>
                <span style={{ fontSize: '0.55rem', color: '#555' }}>{v.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}`}</style>
    </div>
  );
}
