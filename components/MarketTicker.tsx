'use client';
import { useRef, useState, useEffect } from 'react';

interface TickerItem {
  label: string;
  value: string;
  color?: string;
  image?: string;
}

export default function MarketTicker({ items, accentColor = 'rgba(184,134,11,0.2)' }: { items: TickerItem[]; accentColor?: string }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (measureRef.current) {
      setSetWidth(measureRef.current.scrollWidth);
    }
  }, [items]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const copies = setWidth > 0 ? Math.max(2, Math.ceil((vw * 2) / setWidth) + 1) : 3;
  const speed = 30;
  const duration = setWidth > 0 ? setWidth / speed : 30;

  const renderSet = (key: string) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginRight: 32, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {item.image && <img src={item.image} alt="" width={16} height={16} style={{ borderRadius: '50%', flexShrink: 0 }} />}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{item.label}</span>
          <span style={{ color: item.color || 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{item.value}</span>
          <span style={{ color: 'rgba(255,255,255,0.08)', marginLeft: 4, fontSize: '0.5rem' }}>│</span>
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${accentColor}`, overflow: 'hidden', whiteSpace: 'nowrap', height: 34, position: 'relative', marginBottom: 16 }}>
      {/* Hidden measure element */}
      <div ref={measureRef} style={{ position: 'absolute', left: 0, top: 0, visibility: 'hidden', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginRight: 32, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item.image && <span style={{ width: 16 }} />}
            <span>{item.label}</span><span>{item.value}</span><span style={{ marginLeft: 4 }}>│</span>
          </span>
        ))}
      </div>
      {setWidth > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', height: 34, animation: `mticker ${duration}s linear infinite`, willChange: 'transform' }}>
          {Array.from({ length: copies }, (_, i) => renderSet(`set-${i}`))}
        </div>
      )}
      <style>{`@keyframes mticker{from{transform:translateX(0)}to{transform:translateX(-${setWidth}px)}}`}</style>
    </div>
  );
}
