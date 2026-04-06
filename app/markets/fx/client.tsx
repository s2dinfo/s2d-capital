"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import CollapsibleSection from "@/components/CollapsibleSection";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

/* ── Central bank rate data ── */
const centralBanks = [
  { bank: "Federal Reserve", abbr: "Fed", rate: "4.25%", color: "#3B6CB4" },
  { bank: "European Central Bank", abbr: "ECB", rate: "2.65%", color: "#B8860B" },
  { bank: "Bank of England", abbr: "BOE", rate: "4.50%", color: "#2D8F5E" },
  { bank: "Bank of Japan", abbr: "BOJ", rate: "0.50%", color: "#C0392B" },
  { bank: "People's Bank of China", abbr: "PBOC", rate: "3.10%", color: "#D4611E" },
  { bank: "Swiss National Bank", abbr: "SNB", rate: "0.25%", color: "#8B5E3C" },
  { bank: "Reserve Bank of Australia", abbr: "RBA", rate: "4.10%", color: "#7B3FA0" },
  { bank: "Bank of Canada", abbr: "BOC", rate: "2.75%", color: "#2980B9" },
];

/* ── Interest Rate Ticker / Marquee ── */
function RatesTicker() {
  const setRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    if (setRef.current) {
      const w = setRef.current.offsetWidth;
      setDuration(Math.max(20, w / 50));
    }
  }, []);

  const renderItems = (copy: number) =>
    centralBanks.map((cb, i) => (
      <span
        key={`${cb.abbr}-${copy}`}
        style={{ display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}
      >
        {i > 0 && (
          <span style={{ color: "rgba(255,255,255,0.12)", marginRight: 4, fontSize: "0.75rem" }}>│</span>
        )}
        <span style={{ color: cb.color, fontWeight: 700, letterSpacing: "0.03em" }}>{cb.abbr}</span>
        <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{cb.rate}</span>
      </span>
    ));

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
        marginBottom: 24,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 48, height: "100%", background: "linear-gradient(90deg, rgba(15,15,35,1), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 48, height: "100%", background: "linear-gradient(-90deg, rgba(15,15,35,1), transparent)", zIndex: 2, pointerEvents: "none" }} />

      <div className="fx-rate-track" style={{ animationDuration: `${duration}s` }}>
        <div className="fx-rate-set" ref={setRef}>{renderItems(0)}</div>
        <div className="fx-rate-set">{renderItems(1)}</div>
      </div>

      <style>{`
        .fx-rate-track {
          display: flex;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 0.72rem;
          animation: fxRateScroll 40s linear infinite;
          will-change: transform;
        }
        .fx-rate-set {
          display: flex;
          gap: 24px;
          padding-right: 24px;
          flex-shrink: 0;
        }
        @keyframes fxRateScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ── Currency pair chart definitions ── */
const fxCharts = [
  { symbol: "EURUSD=X", title: "EUR / USD" },
  { symbol: "GBPUSD=X", title: "GBP / USD" },
  { symbol: "USDJPY=X", title: "USD / JPY" },
  { symbol: "USDCHF=X", title: "USD / CHF" },
  { symbol: "AUDUSD=X", title: "AUD / USD" },
  { symbol: "USDCAD=X", title: "USD / CAD" },
  { symbol: "NZDUSD=X", title: "NZD / USD" },
  { symbol: "DX-Y.NYB", title: "Dollar Index (DXY)" },
];

export default function FxClient({ fx, macro }: { fx: any; macro: any }) {
  const inv = (v: number | undefined) => v ? (1 / v).toFixed(4) : "—";
  const fix = (v: number | undefined, d = 4) => v != null ? v.toFixed(d) : "—";

  return (
    <MarketPageLayout title="FX &" titleAccent="Currencies" accentColor="#2D8F5E" subtitle="Live exchange rates, Dollar Index, and central bank rate comparison. Data from Open Exchange Rates & Yahoo Finance.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="EUR/USD" value={inv(fx?.EUR)} color="#B8860B" />
        <KPICard label="USD/JPY" value={fix(fx?.JPY, 2)} color="#C0392B" />
        <KPICard label="GBP/USD" value={inv(fx?.GBP)} color="#2D8F5E" />
        <KPICard label="DXY" value={macro?.dxy ?? "—"} color="#3B6CB4" subtitle="Trade-weighted dollar" />
      </div>

      {/* Interest Rate Ticker */}
      <RatesTicker />

      {/* Hint */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginBottom: 16, letterSpacing: '0.1em' }}>
        ▾ Click a section below to view charts
      </p>

      {/* Currency Pair Charts */}
      <CollapsibleSection title="Currency Pairs" subtitle="Major and cross pairs" count={8} color="#2D8F5E" defaultOpen={true}>
        <div className="chart-grid-resp" style={{ gap: 12 }}><style>{`.chart-grid-resp{display:grid;grid-template-columns:repeat(2,1fr)}@media(max-width:640px){.chart-grid-resp{grid-template-columns:1fr}}`}</style>
          {fxCharts.map((c) => (
            <TVChart key={c.symbol} symbol={c.symbol} title={c.title} type="candlestick" range="2y" />
          ))}
        </div>
      </CollapsibleSection>

      {/* Central Bank Policy Rates Table */}
      <CollapsibleSection title="Central Bank Policy Rates" subtitle="Current rates for 8 major central banks" count={8} color="#2D8F5E">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>CENTRAL BANK</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>RATE</th>
            </tr>
          </thead>
          <tbody>
            {centralBanks.map((cb) => (
              <tr key={cb.abbr}>
                <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500, fontSize: "0.82rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: cb.color, fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, marginRight: 8 }}>{cb.abbr}</span>
                  {cb.bank}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 600, color: cb.color, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cb.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsibleSection>

      <CrossRef items={[
        { label: "Stablecoins vs. SWIFT", href: "/research/stablecoins-vs-swift", type: "research" },
        { label: "Macro & Central Banks", href: "/markets/macro", type: "market" },
        { label: "Crypto & Digital Assets", href: "/markets/crypto", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
