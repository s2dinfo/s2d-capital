"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

function fmt(v: number | null | undefined, dec = 2) { return v != null ? "$" + v.toFixed(dec) : "—"; }
function pct(v: number | null | undefined) { if (v == null) return "—"; return (v > 0 ? "+" : "") + v.toFixed(1) + "%"; }
function pctC(v: number | null | undefined) { if (!v) return "rgba(255,255,255,0.35)"; return v > 0 ? "#34d399" : "#f87171"; }

const commodities = [
  { l: "WTI Crude Oil", sym: "CL=F", unit: "/bbl" },
  { l: "Brent Crude Oil", sym: "BZ=F", unit: "/bbl" },
  { l: "Gold", sym: "GC=F", unit: "/oz" },
  { l: "Silver", sym: "SI=F", unit: "/oz" },
  { l: "Natural Gas", sym: "NG=F", unit: "/MMBtu" },
  { l: "Copper", sym: "HG=F", unit: "/lb" },
  { l: "Platinum", sym: "PL=F", unit: "/oz" },
];

export default function CommClient({ commod }: { commod: any }) {
  return (
    <MarketPageLayout title="Commodities &" titleAccent="Energy" accentColor="#8B5E3C" subtitle="Oil, gold, natural gas, and energy markets. Live data from Yahoo Finance futures.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="WTI Crude" value={fmt(commod.oil)} change={commod.oilChg} color="#8B5E3C" subtitle="Light sweet crude" />
        <KPICard label="Gold" value={fmt(commod.gold, 0)} change={commod.goldChg} color="#B8860B" subtitle="Spot futures" />
        <KPICard label="Natural Gas" value={fmt(commod.natgas, 3)} change={commod.natgasChg} color="#D4A843" subtitle="Henry Hub" />
        <KPICard label="Silver" value={"—"} color="#9CA3AF" subtitle="Spot futures" />
      </div>

      {/* Charts — 2x2 TradingView grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="CL=F" title="WTI Crude Oil" type="candlestick" range="6mo" color="#8B5E3C" />
        <TVChart symbol="GC=F" title="Gold" type="candlestick" range="6mo" color="#B8860B" />
        <TVChart symbol="NG=F" title="Natural Gas" type="area" range="6mo" color="#D4A843" />
        <TVChart symbol="BZ=F" title="Brent Crude" type="line" range="6mo" color="#C0392B" />
      </div>

      {/* Commodity Prices Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#8B5E3C", fontWeight: 600, textTransform: "uppercase" }}>All Commodities</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>COMMODITY</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>SYMBOL</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>UNIT</th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((c) => (
              <tr key={c.sym}>
                <td style={{ padding: "10px 16px", color: "#fff", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.l}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#8B5E3C", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.sym}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context: Energy article callout */}
      <div style={{ background: "linear-gradient(135deg, rgba(139,94,60,0.08), rgba(184,134,11,0.04))", border: "1px solid rgba(139,94,60,0.2)", borderLeft: "3px solid #8B5E3C", borderRadius: "0 6px 6px 0", padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.2em", color: "#8B5E3C", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Featured Research</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#fff", marginBottom: 6 }}>Europe&apos;s Energy System, Decoded</div>
        <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 10 }}>From the grid to the trading floor — how renewables, regulation, and geopolitics are reshaping Europe&apos;s energy future. The merit order, OTC trading, EU ETS, and the Iran shock.</div>
        <a href="/research/europe-energy-decoded" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#D4B85C", textDecoration: "none", fontWeight: 500 }}>Read Article →</a>
      </div>

      <CrossRef items={[
        { label: "Europe's Energy System, Decoded", href: "/research/europe-energy-decoded", type: "research" },
        { label: "Gold at $3,000: Safe Haven or Bubble?", href: "/research/gold-3000-safe-haven-or-bubble", type: "research" },
        { label: "Global Macro & Policy Signals", href: "/markets/geopolitics", type: "market" },
        { label: "Macro & Central Banks", href: "/markets/macro", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
