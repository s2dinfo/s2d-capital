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
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border, #E8E6E0)',
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
            color: 'var(--text-sec, #6B6B82)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 5,
            transition: 'all 0.2s',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--gold-dark, #8B6914)';
            e.currentTarget.style.background = 'var(--gold-tint, #FBF8F0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-sec, #6B6B82)';
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
