'use client';
import { useState } from 'react';

interface FixedEvent {
  date: string;
  event: string;
  flag: string;
  impact: 'high' | 'medium';
  explain: string;
}

// 2026 central bank + macro dates with layman explanations
const FIXED_EVENTS: FixedEvent[] = [
  // FOMC
  { date: '2026-01-28', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-03-18', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-05-06', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-06-17', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-07-29', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-09-16', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-11-04', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  { date: '2026-12-16', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', explain: 'The Federal Reserve decides whether to raise, lower, or hold interest rates. Higher rates = stronger dollar, harder to borrow. Lower rates = cheaper loans, stocks often rally.' },
  // ECB
  { date: '2026-04-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  { date: '2026-06-04', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  { date: '2026-07-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  { date: '2026-09-10', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  { date: '2026-10-22', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  { date: '2026-12-10', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', explain: 'The European Central Bank sets rates for the eurozone. Affects EUR/USD exchange rate, European stocks, and bond yields. A hawkish ECB strengthens the euro.' },
  // BOJ
  { date: '2026-04-27', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  { date: '2026-06-15', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  { date: '2026-07-16', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  { date: '2026-09-17', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  { date: '2026-10-29', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  { date: '2026-12-17', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', explain: 'The Bank of Japan sets monetary policy. Japan kept rates near zero for decades. Any change shocks USD/JPY and global bond markets.' },
  // BOE
  { date: '2026-05-07', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  { date: '2026-06-18', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  { date: '2026-08-06', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  { date: '2026-09-17', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  { date: '2026-11-05', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  { date: '2026-12-17', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', explain: 'The Bank of England sets UK interest rates. Directly impacts GBP/USD, UK mortgage rates, and London stock market. Key for FX traders.' },
  // CPI
  { date: '2026-04-14', event: 'US CPI Inflation (Mar)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-05-12', event: 'US CPI Inflation (Apr)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-06-10', event: 'US CPI Inflation (May)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-07-14', event: 'US CPI Inflation (Jun)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-08-12', event: 'US CPI Inflation (Jul)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-09-11', event: 'US CPI Inflation (Aug)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-10-13', event: 'US CPI Inflation (Sep)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-11-10', event: 'US CPI Inflation (Oct)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  { date: '2026-12-10', event: 'US CPI Inflation (Nov)', flag: '🇺🇸', impact: 'high', explain: 'Measures how fast prices are rising for consumers. High CPI = inflation running hot = Fed likely to keep rates high. Low CPI = rate cuts more likely = markets rally.' },
  // NFP
  { date: '2026-05-01', event: 'US Non-Farm Payrolls (Apr)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-06-05', event: 'US Non-Farm Payrolls (May)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-07-02', event: 'US Non-Farm Payrolls (Jun)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-08-07', event: 'US Non-Farm Payrolls (Jul)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-09-04', event: 'US Non-Farm Payrolls (Aug)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-10-02', event: 'US Non-Farm Payrolls (Sep)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-11-06', event: 'US Non-Farm Payrolls (Oct)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  { date: '2026-12-04', event: 'US Non-Farm Payrolls (Nov)', flag: '🇺🇸', impact: 'high', explain: 'Shows how many jobs the US economy added last month. Strong jobs = strong economy but may delay rate cuts. Weak jobs = recession fears but rate cuts more likely.' },
  // GDP
  { date: '2026-04-29', event: 'US GDP Q1 (Advance)', flag: '🇺🇸', impact: 'high', explain: 'The total output of the US economy. Two consecutive negative quarters = recession. This is the first estimate and often moves markets significantly.' },
  { date: '2026-07-29', event: 'US GDP Q2 (Advance)', flag: '🇺🇸', impact: 'high', explain: 'The total output of the US economy. Two consecutive negative quarters = recession. This is the first estimate and often moves markets significantly.' },
  { date: '2026-10-28', event: 'US GDP Q3 (Advance)', flag: '🇺🇸', impact: 'high', explain: 'The total output of the US economy. Two consecutive negative quarters = recession. This is the first estimate and often moves markets significantly.' },
];

function getUpcoming(days: number = 45) {
  const today = new Date().toISOString().split('T')[0];
  const cutoff = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
  return FIXED_EVENTS.filter(e => e.date >= today && e.date <= cutoff).sort((a, b) => a.date.localeCompare(b.date));
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
  const events = getUpcoming(45);
  if (events.length === 0) return null;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#3B6CB4', fontWeight: 600, textTransform: 'uppercase' }}>Upcoming Economic Events</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>Next 45 days · tap event for details</span>
      </div>
      {events.map((e, i) => {
        const days = daysUntil(e.date);
        const isToday = days <= 0;
        const isSoon = days <= 3;
        const isOpen = expanded === `${e.date}-${e.event}`;
        const key = `${e.date}-${e.event}`;
        return (
          <div key={i}>
            <div
              onClick={() => setExpanded(isOpen ? null : key)}
              style={{
                display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: isToday ? 'rgba(184,134,11,0.08)' : isSoon ? 'rgba(255,255,255,0.01)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {/* Date */}
              <div style={{ width: 100, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isToday ? '#D4B85C' : 'rgba(255,255,255,0.5)', fontWeight: isToday ? 700 : 400 }}>
                {formatDate(e.date)}
              </div>
              {/* Event */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{e.flag}</span>
                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500 }}>{e.event}</span>
              </div>
              {/* Impact */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.06em',
                color: e.impact === 'high' ? '#f87171' : '#FBBF24',
                background: e.impact === 'high' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                padding: '3px 8px', borderRadius: 3, marginRight: 12, flexShrink: 0,
              }}>
                {e.impact === 'high' ? 'HIGH' : 'MED'}
              </span>
              {/* Countdown */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isToday ? '#D4B85C' : isSoon ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', fontWeight: isSoon ? 600 : 400, width: 40, textAlign: 'right', flexShrink: 0 }}>
                {isToday ? 'NOW' : `${days}d`}
              </span>
              {/* Info button */}
              <span style={{ marginLeft: 10, fontSize: '0.7rem', color: isOpen ? '#D4B85C' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s', flexShrink: 0 }}>
                {isOpen ? '▾' : 'ⓘ'}
              </span>
            </div>
            {/* Expandable explanation */}
            {isOpen && (
              <div style={{
                padding: '12px 16px 12px 116px', background: 'rgba(59,108,180,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
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
