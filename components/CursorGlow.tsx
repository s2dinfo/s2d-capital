'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on mobile/touch devices
    if ('ontouchstart' in window) return;

    const handler = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.setProperty('--glow-x', `${e.clientX}px`);
        ref.current.style.setProperty('--glow-y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'radial-gradient(600px circle at var(--glow-x, -1000px) var(--glow-y, -1000px), rgba(184,134,11,0.07), transparent 60%)',
        transition: 'background 0.15s ease',
      }}
    />
  );
}
