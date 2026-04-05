'use client';
import { useRef, useEffect } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}

export default function ScrollReveal({ children, delay = 0, y = 30 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use native IntersectionObserver for lightweight scroll reveal
    // This avoids importing heavy GSAP for simple fade-in effects
    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;
    el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, y]);

  return <div ref={ref}>{children}</div>;
}
