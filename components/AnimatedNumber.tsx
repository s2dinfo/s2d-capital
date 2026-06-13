'use client';
import { useEffect, useRef, useState } from 'react';

// Pulls the first numeric token out of a pre-formatted value ("$64,087",
// "4.49%", "13 · Extreme Fear") so we can tween just the number and re-inject
// the prefix/suffix. Returns null for values with no number (e.g. "—").
const NUM_RE = /-?[\d,]*\.?\d+/;

function parseValue(s: string) {
  const m = s.match(NUM_RE);
  if (!m || m.index == null) return null;
  const raw = m[0];
  const num = parseFloat(raw.replace(/,/g, ''));
  if (!isFinite(num)) return null;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  const useGrouping = raw.includes(',');
  return { num, decimals, useGrouping, prefix: s.slice(0, m.index), suffix: s.slice(m.index + raw.length) };
}

function render(n: number, decimals: number, useGrouping: boolean, prefix: string, suffix: string) {
  return prefix + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping }) + suffix;
}

// Counts the number up to its target on mount and tweens to each new value
// when it changes — a live "ticker" feel for the data panel.
export default function AnimatedNumber({ value, duration = 750 }: { value: string; duration?: number }) {
  const p0 = parseValue(value);
  const [display, setDisplay] = useState(() => (p0 ? render(0, p0.decimals, p0.useGrouping, p0.prefix, p0.suffix) : value));
  const fromRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const p = parseValue(value);
    if (!p) { setDisplay(value); return; }
    const from = fromRef.current;
    const to = p.num;
    if (from === to) { setDisplay(render(to, p.decimals, p.useGrouping, p.prefix, p.suffix)); return; }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(render(from + (to - from) * eased, p.decimals, p.useGrouping, p.prefix, p.suffix));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{display}</span>;
}
