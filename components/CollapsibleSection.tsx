'use client';
import { useState, useRef, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  count?: number;
  color?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  subtitle,
  count,
  color = '#8B5E3C',
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
      // After animation, set to auto so it can resize naturally
      const timer = setTimeout(() => setHeight('auto'), 400);
      return () => clearTimeout(timer);
    } else {
      // Read current height before collapsing
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
        // Force a reflow, then set to 0
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setHeight(0));
        });
      }
    }
  }, [open]);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          background: open ? 'rgba(17,25,40,0.65)' : 'rgba(255,255,255,0.02)',
          backdropFilter: open ? 'blur(12px)' : 'none',
          border: `1px solid ${open ? color + '33' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: open ? '8px 8px 0 0' : 8,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'left',
        }}
      >
        {/* Accent bar */}
        <div style={{
          width: 4, height: 24, background: color, borderRadius: 2,
          flexShrink: 0, transition: 'height 0.2s',
        }} />

        {/* Title + subtitle */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em',
            color: open ? color : 'rgba(255,255,255,0.6)',
            fontWeight: 700, textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.35)', marginTop: 2,
            }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Count badge */}
        {count != null && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)',
            padding: '3px 8px', borderRadius: 10,
          }}>
            {count} {count === 1 ? 'chart' : 'charts'}
          </span>
        )}

        {/* Arrow */}
        <div style={{
          fontSize: '0.7rem', color: open ? color : 'rgba(255,255,255,0.3)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s',
          flexShrink: 0,
        }}>
          ▾
        </div>
      </button>

      {/* Content — animated height */}
      <div
        style={{
          overflow: 'hidden',
          height: typeof height === 'number' ? height : 'auto',
          transition: typeof height === 'number' ? 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          background: open ? 'rgba(17,25,40,0.35)' : 'transparent',
          border: open ? `1px solid ${color}22` : '1px solid transparent',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <div ref={contentRef} style={{ padding: open ? '16px' : '0 16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
