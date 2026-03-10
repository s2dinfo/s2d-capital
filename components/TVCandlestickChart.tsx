"use client";

import { useEffect, useRef } from "react";

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function generateMockCandles(basePrice: number, days: number, volatility: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const time = date.toISOString().split("T")[0];
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    candles.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    price = close;
  }
  return candles;
}

interface TVCandlestickChartProps {
  data: CandleData[];
  title: string;
  height?: number;
}

export default function TVCandlestickChart({ data, title, height = 280 }: TVCandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chart: any = null;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    import("lightweight-charts").then((mod) => {
      if (cancelled || !containerRef.current) return;
      const { createChart, CandlestickSeries, CrosshairMode } = mod;

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          background: { color: "#111318" },
          textColor: "#4a4d56",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "rgba(201,168,76,0.3)", width: 1, style: 3, labelBackgroundColor: "#c9a84c" },
          horzLine: { color: "rgba(201,168,76,0.3)", width: 1, style: 3, labelBackgroundColor: "#c9a84c" },
        },
        rightPriceScale: { borderColor: "#1e2028", scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderColor: "#1e2028", timeVisible: false },
        handleScroll: { vertTouchDrag: false },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e", downColor: "#ef4444",
        borderUpColor: "#22c55e", borderDownColor: "#ef4444",
        wickUpColor: "rgba(34,197,94,0.5)", wickDownColor: "rgba(239,68,68,0.5)",
      });
      series.setData(data);
      chart.timeScale().fitContent();

      ro = new ResizeObserver((entries) => {
        if (chart && entries[0]) chart.applyOptions({ width: entries[0].contentRect.width });
      });
      ro.observe(containerRef.current);
    });

    return () => { cancelled = true; ro?.disconnect(); if (chart) { chart.remove(); chart = null; } };
  }, [data, height]);

  return (
    <div className="bg-[#111318] rounded-[10px] border border-[#1e2028] overflow-hidden">
      <div className="px-3.5 pt-3 pb-2 flex justify-between items-center">
        <span className="font-mono text-xs font-semibold text-[#e8e6e3] tracking-wide">{title}</span>
        <span className="font-mono text-[0.6rem] text-[#4a4d56]">90D</span>
      </div>
      <div ref={containerRef} style={{ width: "100%", height }} />
      <div className="px-3.5 pb-1.5 text-right font-mono text-[0.5rem] text-[#4a4d56]">Powered by TradingView</div>
    </div>
  );
}
