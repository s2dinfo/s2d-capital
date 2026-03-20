'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      padding: '40px 32px 24px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-light, #D4B85C)' }}>S2D</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>Capital Insights</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} S2D Capital Insights
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 10, fontWeight: 600 }}>NAVIGATE</div>
            {[
              { l: 'Research', h: '/research' },
              { l: 'Markets', h: '/markets' },
              { l: 'Newsletter', h: '/newsletter' },
              { l: 'About', h: '/about' },
            ].map(n => (
              <Link key={n.l} href={n.h} style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                marginBottom: 6,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-light, #D4B85C)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                {n.l}
              </Link>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 10, fontWeight: 600 }}>LEGAL</div>
            {[
              { l: 'Impressum', h: '/impressum' },
              { l: 'Datenschutz', h: '/datenschutz' },
            ].map(n => (
              <Link key={n.l} href={n.h} style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                marginBottom: 6,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-light, #D4B85C)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                {n.l}
              </Link>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 10, fontWeight: 600 }}>CONTACT</div>
            <a href="mailto:business@s2d.info" style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              marginBottom: 6,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-light, #D4B85C)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              business@s2d.info
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.15)' }}>
          All content is for informational purposes only. Not financial advice.
        </span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/impressum" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Impressum</Link>
          <Link href="/datenschutz" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Datenschutz</Link>
        </div>
      </div>
    </footer>
  );
}
