'use client';

import { useState } from 'react';
import BackButton from '@/components/BackButton';
import { VERTICALS } from '@/lib/verticals';
import { useLanguage } from '@/lib/LanguageContext';

export default function NewsletterClient() {
  const [email, setEmail] = useState('');
  const [picks, setPicks] = useState<string[]>(['crypto']);
  const [done, setDone] = useState(false);
  const { t } = useLanguage();

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
      <BackButton label={t('back.home')} href="/" />
      <section style={{ padding: '48px 24px 64px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>{t('nav.newsletter')}</p>
      <h1 className="section-title" style={{ marginBottom: 12 }}>
        {t('newsletter.title')} <em>{t('newsletter.titleAccent')}</em>
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-sec)', lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
        {t('newsletter.subtitle')}
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
          {done ? t('newsletter.thanks') : t('newsletter.subscribe')}
        </button>
      </div>
      <p style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {t('newsletter.free')} &middot; {t('newsletter.cancel')} &middot; {t('newsletter.weekly')}
      </p>

      {/* Selection summary */}
      {picks.length > 0 && (
        <div style={{
          marginTop: 28, padding: 18,
          background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)',
          textAlign: 'left', borderRadius: 2,
        }}>
          <div className="eyebrow" style={{ fontSize: '0.52rem', marginBottom: 6 }}>{t('newsletter.yourSelection')}</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            {picks.map((k) => VERTICALS[k as keyof typeof VERTICALS].labelShort).join(' / ')}
          </div>
        </div>
      )}

      {/* What You'll Get */}
      <div style={{ marginTop: 56 }}>
        <p className="eyebrow" style={{ marginBottom: 20 }}>{t('newsletter.whatYouGet')}</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14,
        }}>
          {/* Card 1 */}
          <div style={{
            padding: '22px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            textAlign: 'left',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>&#x1F4C8;</div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: '0.95rem',
              color: 'var(--text-pri)', marginBottom: 6, fontWeight: 500,
            }}>{t('newsletter.weeklyBrief')}</h3>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300,
            }}>
              {t('newsletter.weeklyBriefDesc')}
            </p>
          </div>
          {/* Card 2 */}
          <div style={{
            padding: '22px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            textAlign: 'left',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>&#x1F50D;</div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: '0.95rem',
              color: 'var(--text-pri)', marginBottom: 6, fontWeight: 500,
            }}>{t('newsletter.deepResearch')}</h3>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300,
            }}>
              {t('newsletter.deepResearchDesc')}
            </p>
          </div>
          {/* Card 3 */}
          <div style={{
            padding: '22px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            textAlign: 'left',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>&#x1F514;</div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: '0.95rem',
              color: 'var(--text-pri)', marginBottom: 6, fontWeight: 500,
            }}>{t('newsletter.dataAlerts')}</h3>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300,
            }}>
              {t('newsletter.dataAlertsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Last Issue Preview */}
      <div style={{ marginTop: 44 }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>{t('newsletter.lastIssue')}</p>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: 2,
          padding: '24px 22px',
          textAlign: 'left',
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
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              'Gold surged past $4,700/oz — safe-haven flows accelerate as Strait of Hormuz tensions escalate. We map the second-order effects across energy and FX.',
              'Fed holds at 4.25% but language shifts dovish. Markets now price two cuts by September. Our rate model disagrees — here\'s why.',
              'Brent crude spikes 8% intraweek on tanker route disruptions. Shadow fleet activity in the Gulf hits a 14-month high.',
              'BTC reclaims $94k as macro hedging narrative strengthens. On-chain data shows whale accumulation at levels not seen since Q4 2024.',
            ].map((item, i) => (
              <li key={i} style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300,
                paddingLeft: 14,
                position: 'relative',
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
    </div>
  );
}
