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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.clipPath = 'inset(0 0% 0 0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
