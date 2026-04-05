'use client';
import { useEffect, useState } from 'react';

// ── Known 2026 central bank + macro event dates ──
// These are scheduled well in advance and don't change
const FIXED_EVENTS: { date: string; event: string; flag: string; impact: 'high' | 'medium'; category: string }[] = [
  // FOMC 2026
  { date: '2026-01-28', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-03-18', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-05-06', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-06-17', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-07-29', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-09-16', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-11-04', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-12-16', event: 'FOMC Rate Decision', flag: '🇺🇸', impact: 'high', category: 'macro' },
  // ECB 2026
  { date: '2026-01-22', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-03-05', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-04-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-06-04', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-07-16', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-09-10', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-10-22', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  { date: '2026-12-10', event: 'ECB Rate Decision', flag: '🇪🇺', impact: 'high', category: 'macro' },
  // BOJ 2026
  { date: '2026-01-23', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-03-13', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-04-27', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-06-15', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-07-16', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-09-17', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-10-29', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  { date: '2026-12-17', event: 'BOJ Rate Decision', flag: '🇯🇵', impact: 'high', category: 'fx' },
  // BOE 2026
  { date: '2026-02-05', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-03-19', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-05-07', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-06-18', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-08-06', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-09-17', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-11-05', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  { date: '2026-12-17', event: 'BOE Rate Decision', flag: '🇬🇧', impact: 'high', category: 'fx' },
  // US CPI (typically mid-month)
  { date: '2026-04-14', event: 'US CPI Inflation (Mar)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-05-12', event: 'US CPI Inflation (Apr)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-06-10', event: 'US CPI Inflation (May)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-07-14', event: 'US CPI Inflation (Jun)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-08-12', event: 'US CPI Inflation (Jul)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-09-11', event: 'US CPI Inflation (Aug)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-10-13', event: 'US CPI Inflation (Sep)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-11-10', event: 'US CPI Inflation (Oct)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-12-10', event: 'US CPI Inflation (Nov)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  // US NFP (first Friday)
  { date: '2026-04-03', event: 'US Non-Farm Payrolls (Mar)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-05-01', event: 'US Non-Farm Payrolls (Apr)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-06-05', event: 'US Non-Farm Payrolls (May)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-07-02', event: 'US Non-Farm Payrolls (Jun)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-08-07', event: 'US Non-Farm Payrolls (Jul)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-09-04', event: 'US Non-Farm Payrolls (Aug)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-10-02', event: 'US Non-Farm Payrolls (Sep)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-11-06', event: 'US Non-Farm Payrolls (Oct)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-12-04', event: 'US Non-Farm Payrolls (Nov)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  // US GDP
  { date: '2026-04-29', event: 'US GDP Q1 (Advance)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-07-29', event: 'US GDP Q2 (Advance)', flag: '🇺🇸', impact: 'high', category: 'macro' },
  { date: '2026-10-28', event: 'US GDP Q3 (Advance)', flag: '🇺🇸', impact: 'high', category: 'macro' },
];

function getUpcomingEvents(days: number = 30) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return FIXED_EVENTS
    .filter(e => e.date >= today && e.date <= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'TODAY';
  if (dateStr === tomorrowStr) return 'TOMORROW';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr + 'T12:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export default function EconomicCalendar() {
  const events = getUpcomingEvents(45);

  if (events.length === 0) return null;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#3B6CB4', fontWeight: 600, textTransform: 'uppercase' }}>Upcoming Economic Events</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>Next 45 days</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>DATE</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>EVENT</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>IMPACT</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>IN</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => {
              const days = daysUntil(e.date);
              const isToday = days === 0;
              const isSoon = days <= 3;
              return (
                <tr key={i} style={{ background: isToday ? 'rgba(184,134,11,0.08)' : isSoon ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isToday ? '#D4B85C' : 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap', fontWeight: isToday ? 700 : 400 }}>
                    {formatDate(e.date)}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ marginRight: 8 }}>{e.flag}</span>{e.event}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.06em',
                      color: e.impact === 'high' ? '#f87171' : '#FBBF24',
                      background: e.impact === 'high' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                      padding: '3px 8px', borderRadius: 3,
                    }}>
                      {e.impact === 'high' ? 'HIGH' : 'MEDIUM'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isToday ? '#D4B85C' : isSoon ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: isSoon ? 600 : 400 }}>
                    {isToday ? 'TODAY' : `${days}d`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
