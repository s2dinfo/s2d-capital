'use client';
import { useState } from 'react';

interface FixedEvent {
  date: string;
  event: string;
  flag: string;
  impact: 'high' | 'medium';
  previous: string;
  forecast: string;
  explain: string;
}

const EVENTS: FixedEvent[] = [
  // CPI
  { date: '2026-04-14', event: 'US CPI Inflation (Mar)', flag: '🇺🇸', impact: 'high', previous: '3.1%', forecast: '2.9%', explain: 'Measures how fast prices are rising for everyday goods and services. High CPI = inflation running hot, Fed likely to keep rates high. Low CPI = rate cuts more likely, stocks and crypto often rally. The single most watched inflation metric.' },
  { date: '2026-05-12', event: 'US CPI Inflation (Apr)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'Measures how fast prices are rising for everyday goods and services. High CPI = inflation running hot, Fed likely to keep rates high. Low CPI = rate cuts more likely, stocks and crypto often rally. The single most watched inflation metric.' },
  { date: '2026-06-10', event: 'US CPI Inflation (May)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'Measures how fast prices are rising for everyday goods and services. High CPI = inflation running hot, Fed likely to keep rates high. Low CPI = rate cuts more likely, stocks and crypto often rally. The single most watched inflation metric.' },
  { date: '2026-07-14', event: 'US CPI Inflation (Jun)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'Measures how fast prices are rising for everyday goods and services. High CPI = inflation running hot, Fed likely to keep rates high. Low CPI = rate cuts more likely, stocks and crypto often rally. The single most watched inflation metric.' },
  // ECB
  { date: '2026-04-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', previous: '2.65%', forecast: '2.50%', explain: 'The European Central Bank sets interest rates for the 20 eurozone countries. Affects EUR/USD, European stocks, and bond yields. A rate cut weakens the euro but boosts European exports. Lagarde\'s press conference often moves markets more than the decision itself.' },
  { date: '2026-06-04', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', previous: '—', forecast: '—', explain: 'The European Central Bank sets interest rates for the 20 eurozone countries. Affects EUR/USD, European stocks, and bond yields. A rate cut weakens the euro but boosts European exports. Lagarde\'s press conference often moves markets more than the decision itself.' },
  { date: '2026-07-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', previous: '—', forecast: '—', explain: 'The European Central Bank sets interest rates for the 20 eurozone countries. Affects EUR/USD, European stocks, and bond yields. A rate cut weakens the euro but boosts European exports. Lagarde\'s press conference often moves markets more than the decision itself.' },
  // BOJ
  { date: '2026-04-27', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', previous: '0.50%', forecast: '0.50%', explain: 'The Bank of Japan was the last major central bank to exit negative rates. Any change shocks USD/JPY and global bond markets. Japan\'s rate policy affects the "carry trade" — trillions of dollars borrowed in cheap yen to invest elsewhere.' },
  { date: '2026-06-15', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', previous: '—', forecast: '—', explain: 'The Bank of Japan was the last major central bank to exit negative rates. Any change shocks USD/JPY and global bond markets. Japan\'s rate policy affects the "carry trade" — trillions of dollars borrowed in cheap yen to invest elsewhere.' },
  // US GDP
  { date: '2026-04-29', event: 'US GDP Q1 (Advance)', flag: '🇺🇸', impact: 'high', previous: '2.4%', forecast: '2.1%', explain: 'The total output of the US economy. Two consecutive negative quarters = technical recession. This is the first estimate (revised twice later). GDP below expectations often triggers rate cut expectations and dollar weakness.' },
  { date: '2026-07-29', event: 'US GDP Q2 (Advance)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'The total output of the US economy. Two consecutive negative quarters = technical recession. This is the first estimate (revised twice later). GDP below expectations often triggers rate cut expectations and dollar weakness.' },
  { date: '2026-10-28', event: 'US GDP Q3 (Advance)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'The total output of the US economy. Two consecutive negative quarters = technical recession. This is the first estimate (revised twice later). GDP below expectations often triggers rate cut expectations and dollar weakness.' },
  // NFP
  { date: '2026-05-01', event: 'US Non-Farm Payrolls (Apr)', flag: '🇺🇸', impact: 'high', previous: '228K', forecast: '—', explain: 'Shows how many jobs the US economy added or lost last month (excluding farms). The most important monthly jobs report. Strong jobs = strong economy but delays rate cuts. Weak jobs = recession fears but rate cuts more likely. Released first Friday of every month at 8:30am ET.' },
  { date: '2026-06-05', event: 'US Non-Farm Payrolls (May)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'Shows how many jobs the US economy added or lost last month (excluding farms). The most important monthly jobs report. Strong jobs = strong economy but delays rate cuts. Weak jobs = recession fears but rate cuts more likely. Released first Friday of every month at 8:30am ET.' },
  { date: '2026-07-02', event: 'US Non-Farm Payrolls (Jun)', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'Shows how many jobs the US economy added or lost last month (excluding farms). The most important monthly jobs report. Strong jobs = strong economy but delays rate cuts. Weak jobs = recession fears but rate cuts more likely. Released first Friday of every month at 8:30am ET.' },
  // FOMC
  { date: '2026-05-06', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', previous: '4.25%', forecast: '4.25%', explain: 'The Federal Reserve decides whether to raise, lower, or hold US interest rates. This is the most important economic event globally. Higher rates = stronger dollar, harder to borrow, pressure on stocks and crypto. Lower rates = cheaper loans, risk assets rally. Powell\'s press conference 30 min after is often more impactful than the decision.' },
  { date: '2026-06-17', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'The Federal Reserve decides whether to raise, lower, or hold US interest rates. This is the most important economic event globally. Higher rates = stronger dollar, harder to borrow, pressure on stocks and crypto. Lower rates = cheaper loans, risk assets rally. Powell\'s press conference 30 min after is often more impactful than the decision.' },
  { date: '2026-07-29', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'The Federal Reserve decides whether to raise, lower, or hold US interest rates. This is the most important economic event globally. Higher rates = stronger dollar, harder to borrow, pressure on stocks and crypto. Lower rates = cheaper loans, risk assets rally. Powell\'s press conference 30 min after is often more impactful than the decision.' },
  { date: '2026-09-16', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', previous: '—', forecast: '—', explain: 'The Federal Reserve decides whether to raise, lower, or hold US interest rates. This is the most important economic event globally. Higher rates = stronger dollar, harder to borrow, pressure on stocks and crypto. Lower rates = cheaper loans, risk assets rally. Powell\'s press conference 30 min after is often more impactful than the decision.' },
  // BOE
  { date: '2026-05-07', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', previous: '4.50%', forecast: '4.25%', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Bailey\'s press conference provides forward guidance. The BOE tends to follow the Fed but with its own inflation dynamics.' },
  { date: '2026-06-18', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', previous: '—', forecast: '—', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Bailey\'s press conference provides forward guidance. The BOE tends to follow the Fed but with its own inflation dynamics.' },
];

function getUpcoming(days: number = 60) {
  const today = new Date().toISOString().split('T')[0];
  const cutoff = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
  return EVENTS.filter(e => e.date >= today && e.date <= cutoff).sort((a, b) => a.date.localeCompare(b.date));
}

function formatDate(d: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (d === today) return 'TODAY';
  if (d === tomorrow) return 'TOMORROW';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d + 'T12:00:00').getTime() - Date.now()) / 86400000);
}

export default function EconomicCalendar() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const events = getUpcoming(60);
  if (events.length === 0) return null;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#3B6CB4', fontWeight: 600, textTransform: 'uppercase' }}>Economic Calendar</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>Next 60 days</span>
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ width: 100, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>DATE</div>
        <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>EVENT</div>
        <div style={{ width: 55, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>PREV</div>
        <div style={{ width: 55, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>FCST</div>
        <div style={{ width: 48, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>IMPACT</div>
        <div style={{ width: 40, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>IN</div>
        <div style={{ width: 50, flexShrink: 0 }}/>
      </div>

      {events.map((e, i) => {
        const days = daysUntil(e.date);
        const isToday = days <= 0;
        const isSoon = days <= 3;
        const key = `${e.date}-${i}`;
        const isOpen = expanded === key;

        return (
          <div key={i}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: isToday ? 'rgba(184,134,11,0.08)' : isSoon ? 'rgba(255,255,255,0.01)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              {/* Date */}
              <div style={{ width: 100, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isToday ? '#D4B85C' : 'rgba(255,255,255,0.5)', fontWeight: isToday || isSoon ? 700 : 400 }}>
                {formatDate(e.date)}
              </div>
              {/* Event */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ flexShrink: 0 }}>{e.flag}</span>
                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.event}</span>
              </div>
              {/* Previous */}
              <div style={{ width: 55, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                {e.previous}
              </div>
              {/* Forecast */}
              <div style={{ width: 55, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: e.forecast !== '—' ? '#D4B85C' : 'rgba(255,255,255,0.25)', fontWeight: e.forecast !== '—' ? 600 : 400 }}>
                {e.forecast}
              </div>
              {/* Impact */}
              <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
                <span style={{
                  display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.06em',
                  color: e.impact === 'high' ? '#f87171' : '#FBBF24',
                  background: e.impact === 'high' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                  padding: '3px 6px', borderRadius: 3,
                }}>
                  {e.impact === 'high' ? 'HIGH' : 'MED'}
                </span>
              </div>
              {/* Countdown */}
              <div style={{ width: 40, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isToday ? '#D4B85C' : isSoon ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', fontWeight: isSoon ? 600 : 400 }}>
                {isToday ? 'NOW' : `${days}d`}
              </div>
              {/* Explain button */}
              <div style={{ width: 50, flexShrink: 0, textAlign: 'right' }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  style={{
                    background: isOpen ? 'rgba(59,108,180,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isOpen ? 'rgba(59,108,180,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 600,
                    color: isOpen ? '#6B9BD2' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s', letterSpacing: '0.05em',
                  }}
                >
                  {isOpen ? 'CLOSE' : 'WHY?'}
                </button>
              </div>
            </div>
            {/* Expandable explanation */}
            {isOpen && (
              <div style={{
                padding: '14px 16px 14px 116px', background: 'rgba(59,108,180,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '3px solid #3B6CB4',
                fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
              }}>
                {e.explain}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
