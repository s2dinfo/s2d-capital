'use client';

import { useState, useRef, useEffect } from 'react';

interface FootnoteProps {
  id: number;
  source: string;
  detail?: string;
  href?: string;
}

export default function Footnote({ id, source, detail, href }: FootnoteProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handle);
      document.addEventListener('touchstart', handle);
    }, 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline' }}>
      <span
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          fontSize: '0.65em',
          color: 'var(--gold, #B8860B)',
          cursor: 'help',
          verticalAlign: 'super',
          lineHeight: 1,
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          fontWeight: 600,
          userSelect: 'none',
        }}
      >
        [{id}]
      </span>
      {open && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            maxWidth: 300,
            minWidth: 180,
            width: 'max-content',
            background: 'rgba(20,20,40,0.98)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(184,134,11,0.3)',
            borderRadius: 6,
            padding: '14px 16px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'footnoteFadeIn 0.18s ease-out',
            display: 'block',
            textAlign: 'left' as const,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: '#ffffff',
              fontWeight: 700,
              fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
              lineHeight: 1.4,
              marginBottom: detail ? 4 : 0,
            }}
          >
            {source}
          </span>
          {detail && (
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
                lineHeight: 1.5,
              }}
            >
              {detail}
            </span>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 10,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
                color: 'var(--gold, #B8860B)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              View source &rarr;
            </a>
          )}
        </span>
      )}
      <style>{`@keyframes footnoteFadeIn{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </span>
  );
}
