'use client';
import Link from 'next/link';

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = 'Back', href = '/' }: BackButtonProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(26,26,46,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(184,134,11,0.15)',
      padding: '10px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link
          href={href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 5,
            transition: 'all 0.2s',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--gold-light, #D4B85C)';
            e.currentTarget.style.background = 'rgba(184,134,11,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
          {label}
        </Link>
      </div>
    </div>
  );
}
