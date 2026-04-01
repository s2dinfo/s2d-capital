'use client';

import { useState, useRef, useEffect } from 'react';

interface TermProps {
  children: React.ReactNode;
  definition: string;
  href?: string;
}

export default function Term({ children, definition, href }: TermProps) {
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
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle); };
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline' }}>
      <span
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          cursor: 'help',
          borderBottom: '1px dotted var(--gold, #B8860B)',
          transition: 'color 0.2s',
        }}
      >
        {children}
      </span>
      {open && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            maxWidth: 320,
            minWidth: 200,
            width: 'max-content',
            background: 'rgba(20,20,40,0.98)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(184,134,11,0.3)',
            borderRadius: 6,
            padding: '14px 16px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'termFadeIn 0.18s ease-out',
            display: 'block',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--gold-light, #D4B85C)', marginBottom: 6, fontWeight: 700,
          }}>{children}</span>
          <span style={{
            display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.6, fontFamily: 'var(--font-sans)',
          }}>{definition}</span>
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', marginTop: 10, fontSize: '0.72rem',
              fontFamily: 'var(--font-sans)', color: 'var(--gold, #B8860B)',
              textDecoration: 'none', fontWeight: 600,
            }}>Learn more &rarr;</a>
          )}
        </span>
      )}
      <style>{`@keyframes termFadeIn{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </span>
  );
}
