"use client";
import { useEffect, useRef, useState } from "react";

const spinKeyframes = <style>{`@keyframes tvchart-spin{to{transform:rotate(360deg)}}`}</style>;

interface TVChartProps {
  symbol: string;
  title: string;
  type?: "area" | "candlestick" | "line" | "histogram";
  range?: "1wk" | "1mo" | "3mo" | "6mo" | "1y" | "2y";
  height?: number;
  color?: string;
  showPrice?: boolean;
  showVolume?: boolean;
}

export default function TVChart({
  symbol,
  title,
  type = "area",
  range = "3mo",
  height = 280,
  color = "#B8860B",
  showPrice = true,
}: TVChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeRange, setActiveRange] = useState(range);
  const ranges: ("1wk" | "1mo" | "3mo" | "6mo" | "1y" | "2y")[] = ["1wk", "1mo", "3mo", "6mo", "1y", "2y"];

  useEffect(() => {
    let mounted = true;
    let ro: ResizeObserver | null = null;

    async function init() {
      if (!containerRef.current) return;
      try {
        const mod = await import("lightweight-charts");
        const { createChart, CandlestickSeries, AreaSeries, LineSeries, HistogramSeries, CrosshairMode } = mod;

        const apiRange = activeRange === "1wk" ? "5d" : activeRange;
        const interval = activeRange === "1wk" ? "15m" : activeRange === "1mo" ? "1d" : activeRange === "3mo" ? "1d" : activeRange === "6mo" ? "1d" : "1wk";
        const res = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&range=${apiRange}&interval=${interval}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (!result || !mounted) { if (mounted) { setError(true); setLoading(false); } return; }

        const timestamps = result.timestamp;
        const quote = result.indicators?.quote?.[0];
        if (!timestamps || !quote) { if (mounted) { setError(true); setLoading(false); } return; }

        // Build data
        const areaData: { time: string; value: number }[] = [];
        const candleData: { time: string; open: number; high: number; low: number; close: number }[] = [];

        const isIntraday = activeRange === "1wk";
        for (let i = 0; i < timestamps.length; i++) {
          const c = quote.close?.[i];
          if (c == null) continue;
          const time = isIntraday ? timestamps[i] as any : new Date(timestamps[i] * 1000).toISOString().split("T")[0];
          areaData.push({ time, value: c });
          candleData.push({
            time,
            open: quote.open?.[i] ?? c,
            high: quote.high?.[i] ?? c,
            low: quote.low?.[i] ?? c,
            close: c,
          });
        }

        if (areaData.length === 0 || !mounted) { if (mounted) { setError(true); setLoading(false); } return; }

        const last = areaData[areaData.length - 1].value;
        const first = areaData[0].value;
        setPrice(last);
        setChange(((last - first) / first) * 100);

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
            vertLines: { color: "rgba(255,255,255,0.04)" },
            horzLines: { color: "rgba(255,255,255,0.04)" },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 3, labelBackgroundColor: "#B8860B" },
            horzLine: { color: "rgba(184,134,11,0.3)", width: 1, style: 3, labelBackgroundColor: "#B8860B" },
          },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.06)", scaleMargins: { top: 0.1, bottom: 0.1 } },
          timeScale: { borderColor: "rgba(255,255,255,0.06)", timeVisible: isIntraday },
          handleScroll: { vertTouchDrag: false },
        });
        chartRef.current = chart;

        if (type === "candlestick") {
          const series = chart.addSeries(CandlestickSeries, {
            upColor: "#2D8F5E", downColor: "#C0392B",
            borderUpColor: "#2D8F5E", borderDownColor: "#C0392B",
            wickUpColor: "rgba(45,143,94,0.5)", wickDownColor: "rgba(192,57,43,0.5)",
          });
          series.setData(candleData);
        } else if (type === "line") {
          const series = chart.addSeries(LineSeries, {
            color, lineWidth: 2,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: color,
            crosshairMarkerBackgroundColor: "#1A1A2E",
          });
          series.setData(areaData);
        } else if (type === "histogram") {
          const series = chart.addSeries(HistogramSeries, {
            color, base: 0,
          });
          series.setData(areaData);
        } else {
          // area (default)
          const series = chart.addSeries(AreaSeries, {
            topColor: color + "40",
            bottomColor: color + "05",
            lineColor: color,
            lineWidth: 2,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: color,
            crosshairMarkerBackgroundColor: "#1A1A2E",
          });
          series.setData(areaData);
        }

        chart.timeScale().fitContent();

        ro = new ResizeObserver(() => {
          if (containerRef.current && mounted)
            chart.applyOptions({ width: containerRef.current.clientWidth });
        });
        ro.observe(containerRef.current!);
        setLoading(false);
      } catch (e) {
        console.error("TVChart error:", e);
        if (mounted) { setError(true); setLoading(false); }
      }
    }

    init();
    return () => { mounted = false; ro?.disconnect(); if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; } };
  }, [symbol, type, activeRange, height, color, showPrice]);

  const isPos = (change ?? 0) >= 0;


  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px 8px", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 600, color: "#fff", letterSpacing: "0.04em" }}>{title}</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {ranges.map(r => (
            <button key={r} onClick={() => setActiveRange(r)} style={{
              fontFamily: "var(--font-mono)", fontSize: "0.5rem", fontWeight: 600,
              padding: "3px 8px", borderRadius: 3, border: "none", cursor: "pointer",
              background: activeRange === r ? color + "33" : "transparent",
              color: activeRange === r ? color : "rgba(255,255,255,0.3)",
              transition: "all 0.15s",
              letterSpacing: "0.05em",
            }}>{r === '1wk' ? '1W' : r.toUpperCase()}</button>
          ))}
        </div>
        {showPrice && price != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
              {price >= 1000 ? price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : price >= 1 ? price.toFixed(2) : price.toFixed(4)}
            </span>
            {change != null && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600, color: isPos ? "#34d399" : "#f87171", background: isPos ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", padding: "2px 6px", borderRadius: 3 }}>
                {isPos ? "+" : ""}{change.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>
      {/* Chart */}
      <div style={{ position: "relative", height }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div role="status" aria-label="Loading chart" style={{ width: 24, height: 24, border: "2px solid rgba(184,134,11,0.3)", borderTopColor: "#B8860B", borderRadius: "50%", animation: "tvchart-spin 0.8s linear infinite" }} />
          </div>
        )}
        {error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>Unable to load data</div>}
        <div ref={containerRef} style={{ width: "100%", height }} />
      </div>
      {/* Footer */}
      <div style={{ padding: "4px 16px 6px", fontFamily: "var(--font-mono)", fontSize: "0.45rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", display: "flex", justifyContent: "space-between" }}>
        <span>Yahoo Finance</span>
        <span>S2D Capital Insights</span>
      </div>
      {spinKeyframes}
    </div>
  );
}
