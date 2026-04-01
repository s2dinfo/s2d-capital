'use client';

import { useState } from 'react';
import BackButton from '@/components/BackButton';
import { VERTICALS } from '@/lib/verticals';

export default function NewsletterClient() {
  const [email, setEmail] = useState('');
  const [picks, setPicks] = useState<string[]>(['crypto']);
  const [done, setDone] = useState(false);

  const toggle = (k: string) => {
    setPicks((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);
  };

  const submit = () => {
    if (email.includes('@') && picks.length > 0) {
      // TODO: Connect to Beehiiv API
      setDone(true);
      setEmail('');
      setTimeout(() => setDone(false), 4000);
    }
  };

  return (
    <div style={{ minHeight: '80vh' }}>
      <BackButton label="Home" href="/" />
      <section style={{ padding: '48px 24px 64px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Newsletter</p>
      <h1 className="section-title" style={{ marginBottom: 12 }}>
        Choose Your <em>Topics</em>
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-sec)', lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
        Personalized market intelligence. Only the topics you care about.
        No spam, only substance.
      </p>

      {/* Topic picker */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {Object.entries(VERTICALS).map(([key, v]) => {
          const on = picks.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={on}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 500,
                padding: '8px 18px', borderRadius: 20,
                border: `1px solid ${on ? v.hex : 'var(--border)'}`,
                background: on ? `${v.hex}12` : 'transparent',
                color: on ? v.hex : 'var(--text-sec)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
            >
              {on ? '* ' : ''}{v.labelShort}
            </button>
          );
        })}
      </div>

      {/* Email input */}
      <div style={{
        display: 'flex',
        border: `1.5px solid ${done ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: 3, overflow: 'hidden', transition: 'border-color 0.3s',
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          style={{
            flex: 1, padding: '15px 20px',
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            border: 'none', outline: 'none',
            background: 'rgba(255,255,255,0.05)', color: '#fff',
          }}
        />
        <button
          onClick={submit}
          className="btn-gold"
          aria-label="Subscribe to newsletter"
          style={{ borderRadius: 0, boxShadow: 'none', padding: '15px 24px' }}
        >
          {done ? 'Thanks!' : 'Subscribe'}
        </button>
      </div>
      <p style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Free &middot; Cancel anytime &middot; Weekly analysis
      </p>

      {/* Selection summary */}
      {picks.length > 0 && (
        <div style={{
          marginTop: 28, padding: 18,
          background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)',
          textAlign: 'left', borderRadius: 2,
        }}>
          <div className="eyebrow" style={{ fontSize: '0.52rem', marginBottom: 6 }}>Your Selection</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            {picks.map((k) => VERTICALS[k as keyof typeof VERTICALS].labelShort).join(' / ')}
          </div>
        </div>
      )}
    </section>
    </div>
  );
}
