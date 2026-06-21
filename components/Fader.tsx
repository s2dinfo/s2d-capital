'use client';
// Cinematic screen fade: fades IN from black on mount (arrival) and OUT to black
// when `out` flips true (departure), so route changes feel like travel, not cuts.
import { useEffect, useState } from 'react';

export default function Fader({ out, label }: { out: boolean; label?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const opacity = out ? 1 : shown ? 0 : 1;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        background: '#04060b',
        zIndex: 90,
        pointerEvents: opacity > 0.02 ? 'auto' : 'none',
        opacity,
        transition: 'opacity 0.55s ease',
      }}
    >
      {label && out && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.28em',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
