'use client';

import { useState } from 'react';
import BackButton from '@/components/BackButton';

export default function NewsletterClient() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.includes('@')) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
        setEmail('');
        setTimeout(() => setDone(false), 5000);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '80vh' }}>
      <BackButton label="Home" href="/" />
      <section style={{ padding: '48px 24px 64px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>

      <p className="eyebrow" style={{ marginBottom: 12 }}>Newsletter</p>
      <h1 className="section-title" style={{ marginBottom: 12 }}>
        Weekly Market <em>Intelligence</em>
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-sec)', lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
        One email per week. The most important moves across Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure — and how they connect. No spam, only substance.
      </p>

      {/* Email input */}
      <div className="newsletter-form" style={{
        display: 'flex',
        border: `1.5px solid ${done ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: 3, overflow: 'hidden', transition: 'border-color 0.3s',
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
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
          disabled={submitting}
          style={{ borderRadius: 0, boxShadow: 'none', padding: '15px 24px', minHeight: 48, opacity: submitting ? 0.6 : 1 }}
        >
          {done ? 'You\'re in!' : submitting ? '...' : 'Subscribe'}
        </button>
      </div>
      <p style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Free &middot; Cancel anytime &middot; Every Monday
      </p>
      {error && <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--red, #f87171)' }}>{error}</p>}

      {/* What you get */}
      <div style={{ marginTop: 48, textAlign: 'left' }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>What you get</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { title: 'The Week in Markets', desc: 'Key moves across all six verticals. What happened, why it matters, and what to watch next.' },
            { title: 'Cross-Market Analysis', desc: 'How a Fed decision moved the dollar, which repriced gold, which shifted crypto flows. We connect the dots.' },
            { title: 'Research Highlights', desc: 'Early access to our long-form research — from sanctions architecture to energy policy to crypto regulation.' },
          ].map((item) => (
            <div key={item.title} style={{
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: '0 4px 4px 0',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#fff', marginBottom: 4, fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-sec)', lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample issue */}
      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>Sample issue</p>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: 2,
          padding: '24px 22px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: 'var(--text-muted)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            March 28, 2026
          </div>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.05rem',
            color: 'var(--gold)', marginBottom: 16, fontWeight: 500, lineHeight: 1.5,
          }}>
            S2D Weekly: Gold Breaks $4,700 as Hormuz Crisis Deepens
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Gold surged past $4,700/oz — safe-haven flows accelerate as Strait of Hormuz tensions escalate.',
              'Fed holds at 4.25% but language shifts dovish. Markets now price two cuts by September.',
              'Brent crude spikes 8% intraweek on tanker route disruptions. Shadow fleet activity hits 14-month high.',
              'BTC reclaims $94k as macro hedging narrative strengthens. Whale accumulation at Q4 2024 levels.',
            ].map((item, i) => (
              <li key={i} style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300,
                paddingLeft: 14, position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: 0, top: '0.35em',
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--gold)', display: 'inline-block',
                }} />
                {item}
              </li>
            ))}
          </ul>
          <div style={{
            marginTop: 18, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: 'var(--text-muted)', letterSpacing: '0.04em',
          }}>
            S2D Capital &middot; Research &amp; Intelligence
          </div>
        </div>
      </div>

      </section>
      <style>{`
        @media (max-width: 400px) {
          .newsletter-form { flex-direction: column !important; }
          .newsletter-form .btn-gold { width: 100%; }
        }
      `}</style>
    </div>
  );
}
