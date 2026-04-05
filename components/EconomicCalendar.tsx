'use client';

// Key recurring economic events that move markets
const EVENTS = [
  { event: 'FOMC Rate Decision', flag: '🇺🇸', freq: 'Every 6 weeks', impact: 'high' },
  { event: 'US Non-Farm Payrolls', flag: '🇺🇸', freq: 'First Friday monthly', impact: 'high' },
  { event: 'US CPI Inflation', flag: '🇺🇸', freq: 'Monthly', impact: 'high' },
  { event: 'ECB Rate Decision', flag: '🇪🇺', freq: 'Every 6 weeks', impact: 'high' },
  { event: 'BOJ Rate Decision', flag: '🇯🇵', freq: 'Every 6 weeks', impact: 'high' },
  { event: 'US GDP (Quarterly)', flag: '🇺🇸', freq: 'Quarterly', impact: 'high' },
  { event: 'OPEC+ Meeting', flag: '🛢️', freq: 'Monthly', impact: 'high' },
  { event: 'BOE Rate Decision', flag: '🇬🇧', freq: 'Every 6 weeks', impact: 'high' },
  { event: 'US Retail Sales', flag: '🇺🇸', freq: 'Monthly', impact: 'medium' },
  { event: 'US Unemployment Rate', flag: '🇺🇸', freq: 'Monthly', impact: 'medium' },
];

export default function EconomicCalendar() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#3B6CB4', fontWeight: 600, textTransform: 'uppercase' }}>Key Economic Events</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>EVENT</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>FREQUENCY</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>IMPACT</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e, i) => (
              <tr key={i}>
                <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ marginRight: 8 }}>{e.flag}</span>{e.event}
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {e.freq}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
