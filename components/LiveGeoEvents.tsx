'use client';
import { useEffect, useState } from 'react';

interface GeoEvent {
  title: string;
  url: string;
  source: string;
  date: string;
  sourcecountry: string;
}

export default function LiveGeoEvents() {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/geopolitical')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
      Loading live geopolitical events...
    </div>
  );

  if (events.length === 0) return null;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#8B2252', fontWeight: 600, textTransform: 'uppercase' }}>Live Global Events</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>Via GDELT · Updates every 15 min</span>
      </div>
      {events.slice(0, 12).map((e, i) => (
        <a
          key={i}
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            textDecoration: 'none', transition: 'background 0.15s',
          }}
          onMouseEnter={(ev: any) => { ev.currentTarget.style.background = 'rgba(139,34,82,0.06)'; }}
          onMouseLeave={(ev: any) => { ev.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
            {e.title}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>
            <span>{e.source}</span>
            {e.date && <span>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        </a>
      ))}
    </div>
  );
}
