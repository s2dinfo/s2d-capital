'use client';
// Cinematic screen fade: fades IN on mount (arrival) and OUT when `out` flips (departure),
// so route changes feel like travel, not cuts. `inTone`/`outTone` pick the colour — 'dark'
// (default) or 'cloud' (a bright atmosphere flash). Arrival and departure can differ, so the
// globe→world dive can fade OUT to cloud and the world fades IN from cloud (one white punch
// through the atmosphere) while every other transition stays dark.
import { useEffect, useState } from 'react';

const BG = { dark: '#04060b', cloud: 'radial-gradient(circle at 50% 42%, #ffffff, #cfe0f0)' };
const LABEL = { dark: 'rgba(255,255,255,0.85)', cloud: 'rgba(20,40,70,0.85)' };

export default function Fader({ out, label, inTone = 'dark', outTone = 'dark' }: {
  out: boolean; label?: string; inTone?: 'dark' | 'cloud'; outTone?: 'dark' | 'cloud';
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const opacity = out ? 1 : shown ? 0 : 1;
  const tone = out ? outTone : inTone;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        background: BG[tone],
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
            color: LABEL[outTone],
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
