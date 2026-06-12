'use client';
import { useRef, useEffect, ReactNode } from 'react';

interface ChartRevealProps {
  children: ReactNode;
}

export default function ChartReveal({ children }: ChartRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Clip the chart from left, revealing it as you scroll
    el.style.clipPath = 'inset(0 100% 0 0)';
    el.style.transition = 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)';

    const reveal = () => {
      el.style.clipPath = 'inset(0 0% 0 0)';
      observer.disconnect();
    };
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) reveal(); },
      // fire as soon as any part approaches the viewport — a clipped chart
      // still occupies layout, so a late reveal reads as a huge text gap
      { threshold: 0.01, rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(el);
    // fail-safe: never leave content invisible if the observer misfires
    const t = setTimeout(reveal, 2500);
    return () => { observer.disconnect(); clearTimeout(t); };
  }, []);

  return <div ref={ref}>{children}</div>;
}
