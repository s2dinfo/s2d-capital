// components/LiveChart.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface LiveChartProps {
  symbol: string;
  label: string;
  height?: number;
  range?: string;
}

const RANGES = ["1wk", "1mo", "3mo", "6mo", "1y", "2y", "5y"];
const RANGE_LABELS: Record<string, string> = { "1wk": "1W", "1mo": "1M", "3mo": "3M", "6mo": "6M", "1y": "1Y", "2y": "2Y", "5y": "5Y" };

export default function LiveChart({
  symbol,
  label,
  height = 300,
  range = "2y",
}: LiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeRange, setActiveRange] = useState(range);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current) return;
      setLoading(true);
      setError(false);

      try {
        const { createChart, AreaSeries } = await import("lightweight-charts");

        const apiRange = activeRange === "1wk" ? "5d" : activeRange;
        const interval = activeRange === "1wk" ? "15m" : activeRange === "1mo" ? "1h" : activeRange === "3mo" ? "1d" : activeRange === "6mo" ? "1d" : activeRange === "1y" ? "1d" : activeRange === "2y" ? "1wk" : "1wk";
        const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&range=${apiRange}&interval=${interval}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const result = json?.chart?.result?.[0];

        if (!result || !mounted) { if (mounted) { setError(true); setLoading(false); } return; }

        const timestamps = result.timestamp;
        const quote = result.indicators?.quote?.[0];
        if (!timestamps || !quote) { if (mounted) { setError(true); setLoading(false); } return; }

        const isIntraday = activeRange === "1wk" || activeRange === "1mo";
        const candles: { time: any; value: number }[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          const c = quote.close?.[i];
          if (c == null) continue;
          const time = isIntraday ? timestamps[i] : new Date(timestamps[i] * 1000).toISOString().split("T")[0];
          candles.push({ time, value: c });
        }

        if (candles.length === 0 || !mounted) { if (mounted) { setError(true); setLoading(false); } return; }

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
            textColor: "rgba(255,255,255,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
          },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.05)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          crosshair: {
            vertLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 2 },
            horzLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 2 },
          },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
          timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: isIntraday },
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
          crosshairMarkerBackgroundColor: "#1A1A2E",
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
        if (mounted) { setError(true); setLoading(false); }
      }
    }

    init();
    return () => {
      mounted = false;
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    };
  }, [symbol, activeRange, height]);

  const isPositive = (priceChange ?? 0) >= 0;

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.02)", margin: "28px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.05em" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Timeframe selector */}
          <div style={{ display: "flex", gap: 2 }}>
            {RANGES.map(r => (
              <button key={r} onClick={() => setActiveRange(r)} style={{
                fontFamily: "var(--mono)", fontSize: "0.52rem", fontWeight: 600,
                padding: "3px 8px", borderRadius: 3, border: "none", cursor: "pointer",
                background: activeRange === r ? "rgba(184,134,11,0.25)" : "transparent",
                color: activeRange === r ? "#D4B85C" : "rgba(255,255,255,0.3)",
                transition: "all 0.15s", letterSpacing: "0.05em",
              }}>{RANGE_LABELS[r] || r.toUpperCase()}</button>
            ))}
          </div>
          {/* Price + change */}
          {currentPrice != null && (
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 500, color: "#ffffff", marginLeft: 8 }}>
              ${currentPrice.toLocaleString("en-US", { maximumFractionDigits: currentPrice > 100 ? 0 : 2 })}
            </span>
          )}
          {priceChange != null && (
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 600, color: isPositive ? "#34d399" : "#f87171", background: isPositive ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", padding: "3px 8px", borderRadius: 4 }}>
              {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", height }}>
        {loading && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>Loading chart data...</div>}
        {error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>Unable to load chart</div>}
        <div ref={containerRef} style={{ width: "100%", height }} />
      </div>
      <div style={{ padding: "8px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", fontFamily: "var(--mono)", fontSize: "0.56rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", display: "flex", justifyContent: "space-between" }}>
        <span>Source: Yahoo Finance</span>
        <span>S2D Capital Insights</span>
      </div>
    </div>
  );
}
