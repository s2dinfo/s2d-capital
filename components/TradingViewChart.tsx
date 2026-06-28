'use client';
// Live price chart for a desk's commodity, via TradingView's advanced-chart embed widget.
// Client-only: it injects TradingView's script into a container on mount. TradingView forces its
// own container to height:100%, so an OUTER wrapper owns the fixed height for it to fill.
import { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol, height = 380 }: { symbol: string; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    host.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    widget.style.width = '100%';
    host.appendChild(widget);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      autosize: true,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      hide_side_toolbar: true,
      allow_symbol_change: true,
      backgroundColor: 'rgba(10,14,23,1)',
      gridColor: 'rgba(36,50,80,0.35)',
    });
    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, [symbol]);

  return (
    <div
      style={{
        height,
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #1c2740',
      }}
    >
      <div ref={containerRef} className="tradingview-widget-container" style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
