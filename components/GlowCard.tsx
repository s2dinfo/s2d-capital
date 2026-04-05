'use client';
import { useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlowCard({ children, color = 'rgba(184,134,11,0.4)', className, style, onClick }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--card-glow-x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--card-glow-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        borderRadius: 10,
        padding: 1,
        background: `radial-gradient(350px circle at var(--card-glow-x, -1000px) var(--card-glow-y, -1000px), ${color}, transparent 60%)`,
        transition: 'background 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{
        borderRadius: 9,
        background: 'rgba(17,25,40,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        height: '100%',
      }}>
        {children}
      </div>
    </div>
  );
}
