'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BackButton({ label = 'Back to Research', href = '/research' }: { label?: string; href?: string }) {
  const router = useRouter();

  return (
    <div style={{
      maxWidth: 780,
      margin: '0 auto',
      padding: '20px 24px 0',
    }}>
      <Link
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          color: 'var(--text-muted, #9C9CAF)',
          textDecoration: 'none',
          padding: '8px 14px',
          borderRadius: 6,
          border: '1px solid var(--border, #E8E6E0)',
          transition: 'all 0.2s',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold, #b8860b)';
          e.currentTarget.style.color = 'var(--gold, #b8860b)';
          e.currentTarget.style.background = 'var(--gold-tint, #faf6ee)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border, #E8E6E0)';
          e.currentTarget.style.color = 'var(--text-muted, #9C9CAF)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>←</span>
        {label}
      </Link>
    </div>
  );
}
