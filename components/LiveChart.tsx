// components/LiveChart.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface LiveChartProps {
  symbol: string;
  label: string;
  height?: number;
  range?: string;
}

export default function LiveChart({
  symbol,
  label,
  height = 300,
  range = "3mo",
}: LiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current) return;

      try {
        const { createChart, AreaSeries } = await import("lightweight-charts");

        // Fetch via our server-side proxy (avoids CORS)
        const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&range=${range}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const result = json?.chart?.result?.[0];

        if (!result || !mounted) { setError(true); setLoading(false); return; }

        const timestamps = result.timestamp;
        const quote = result.indicators?.quote?.[0];
        if (!timestamps || !quote) { setError(true); setLoading(false); return; }

        const candles: { time: string; value: number }[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          const c = quote.close?.[i];
          if (c == null) continue;
          const date = new Date(timestamps[i] * 1000);
          candles.push({ time: date.toISOString().split("T")[0], value: c });
        }

        if (candles.length === 0 || !mounted) { setError(true); setLoading(false); return; }

        const last = candles[candles.length - 1].value;
        const first = candles[0].value;
        setCurrentPrice(last);
        setPriceChange(((last - first) / first) * 100);

        if (chartRef.current) chartRef.current.remove();

        const chart = createChart(containerRef.current!, {
          width: containerRef.current!.clientWidth,
          height,
          layout: {
            background: { color: "transparent" },
            textColor: "#9C9CAF",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
          },
          grid: {
            vertLines: { color: "rgba(232,230,224,0.3)" },
            horzLines: { color: "rgba(232,230,224,0.3)" },
          },
          crosshair: {
            vertLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 2 },
            horzLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 2 },
          },
          rightPriceScale: { borderColor: "rgba(232,230,224,0.4)" },
          timeScale: { borderColor: "rgba(232,230,224,0.4)", timeVisible: false },
          handleScroll: { vertTouchDrag: false },
        });

        chartRef.current = chart;

        const series = chart.addSeries(AreaSeries, {
          topColor: "rgba(184,134,11,0.25)",
          bottomColor: "rgba(184,134,11,0.02)",
          lineColor: "#b8860b",
          lineWidth: 2,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: "#b8860b",
          crosshairMarkerBackgroundColor: "#fff",
        });

        series.setData(candles);
        chart.timeScale().fitContent();

        const ro = new ResizeObserver(() => {
          if (containerRef.current && mounted)
            chart.applyOptions({ width: containerRef.current.clientWidth });
        });
        ro.observe(containerRef.current!);

        setLoading(false);
        return () => ro.disconnect();
      } catch (e) {
        console.error("Chart error:", e);
        if (mounted) setError(true);
        setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    };
  }, [symbol, range, height]);

  const isPositive = (priceChange ?? 0) >= 0;

  return (
    <div style={{ border: "1px solid var(--border, #E8E6E0)", borderRadius: 8, overflow: "hidden", background: "var(--bg-primary, #fff)", margin: "28px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border, #E8E6E0)", background: "var(--bg-warm, #fdfcfa)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", fontWeight: 700, color: "var(--navy, #0f0f23)", letterSpacing: "0.05em" }}>{label}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", letterSpacing: "0.1em", color: "var(--text-muted, #9C9CAF)", textTransform: "uppercase" as const, background: "rgba(184,134,11,0.06)", padding: "2px 6px", borderRadius: 3 }}>LIVE · {range.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentPrice != null && (
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 500, color: "var(--navy, #0f0f23)" }}>
              ${currentPrice.toLocaleString("en-US", { maximumFractionDigits: currentPrice > 100 ? 0 : 2 })}
            </span>
          )}
          {priceChange != null && (
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 600, color: isPositive ? "#4ade80" : "#f87171", background: isPositive ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", padding: "3px 8px", borderRadius: 4 }}>
              {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", height }}>
        {loading && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>Loading chart data...</div>}
        {error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>Unable to load chart</div>}
        <div ref={containerRef} style={{ width: "100%", height }} />
      </div>
      <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border, #E8E6E0)", background: "var(--bg-warm, #fdfcfa)", fontFamily: "var(--mono)", fontSize: "0.56rem", color: "var(--text-muted)", letterSpacing: "0.08em", display: "flex", justifyContent: "space-between" }}>
        <span>Source: Yahoo Finance · Auto-refresh 60s</span>
        <span>S2D Capital Insights</span>
      </div>
    </div>
  );
}
