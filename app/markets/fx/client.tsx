"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

export default function FxClient({ fx, macro }: { fx: any; macro: any }) {
  const inv = (v: number | undefined) => v ? (1 / v).toFixed(4) : "—";
  const fix = (v: number | undefined, d = 4) => v != null ? v.toFixed(d) : "—";

  const pairs = fx ? [
    { p: "EUR/USD", v: inv(fx.EUR), major: true },
    { p: "GBP/USD", v: inv(fx.GBP), major: true },
    { p: "USD/JPY", v: fix(fx.JPY, 2), major: true },
    { p: "USD/CHF", v: fix(fx.CHF), major: true },
    { p: "AUD/USD", v: inv(fx.AUD) },
    { p: "USD/CAD", v: fix(fx.CAD) },
    { p: "NZD/USD", v: inv(fx.NZD) },
    { p: "EUR/GBP", v: fx.GBP && fx.EUR ? (fx.GBP / fx.EUR).toFixed(4) : "—" },
    { p: "USD/CNY", v: fix(fx.CNY) },
    { p: "USD/TRY", v: fix(fx.TRY, 2) },
    { p: "USD/BRL", v: fix(fx.BRL) },
    { p: "USD/INR", v: fix(fx.INR, 2) },
  ] : [];

  const centralBanks = [
    { bank: "Federal Reserve", abbr: "Fed", rate: macro?.fedRate ? macro.fedRate + "%" : "—", color: "#3B6CB4" },
    { bank: "European Central Bank", abbr: "ECB", rate: "2.65%", color: "#B8860B" },
    { bank: "Bank of Japan", abbr: "BOJ", rate: "0.50%", color: "#C0392B" },
    { bank: "Bank of England", abbr: "BOE", rate: "4.50%", color: "#2D8F5E" },
    { bank: "Swiss National Bank", abbr: "SNB", rate: "0.25%", color: "#8B5E3C" },
  ];

  return (
    <MarketPageLayout title="FX &" titleAccent="Currencies" accentColor="#2D8F5E" subtitle="Live exchange rates, Dollar Index, and central bank rate comparison. Data from Open Exchange Rates & Yahoo Finance.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="EUR/USD" value={inv(fx?.EUR)} color="#B8860B" />
        <KPICard label="USD/JPY" value={fix(fx?.JPY, 2)} color="#C0392B" />
        <KPICard label="GBP/USD" value={inv(fx?.GBP)} color="#2D8F5E" />
        <KPICard label="DXY" value={macro?.dxy ?? "—"} color="#3B6CB4" subtitle="Trade-weighted dollar" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="EURUSD=X" title="EUR / USD" type="area" range="6mo" color="#B8860B" />
        <TVChart symbol="USDJPY=X" title="USD / JPY" type="area" range="6mo" color="#C0392B" />
        <TVChart symbol="GBPUSD=X" title="GBP / USD" type="area" range="6mo" color="#2D8F5E" />
        <TVChart symbol="DX-Y.NYB" title="Dollar Index (DXY)" type="line" range="1y" color="#3B6CB4" />
      </div>

      {/* FX Pairs Grid */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#2D8F5E", fontWeight: 600, textTransform: "uppercase" }}>Exchange Rates</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 0 }}>
          {pairs.map((f) => (
            <div key={f.p} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600, color: f.major ? "#fff" : "rgba(255,255,255,0.6)", marginBottom: 3 }}>{f.p}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 500, color: "#2D8F5E" }}>{f.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Central Bank Rates */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#2D8F5E", fontWeight: 600, textTransform: "uppercase" }}>Central Bank Policy Rates</span>
        </div>
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
      </div>

      <CrossRef items={[
        { label: "Stablecoins vs. SWIFT", href: "/research/stablecoins-vs-swift", type: "research" },
        { label: "Macro & Central Banks", href: "/markets/macro", type: "market" },
        { label: "Crypto & Digital Assets", href: "/markets/crypto", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
