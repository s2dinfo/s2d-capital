"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

export default function MacroClient({ macro }: { macro: any }) {
  const rawSpread = macro?.yieldSpread ? parseFloat(macro.yieldSpread) : NaN;
  const spread = Number.isNaN(rawSpread) ? null : rawSpread;
  const spreadLabel = spread !== null ? (spread >= 0 ? "Normal" : "Inverted") : "";
  const spreadColor = spread !== null ? (spread >= 0 ? "#34d399" : "#f87171") : "rgba(255,255,255,0.3)";

  const metrics = [
    { l: "Fed Funds Rate", v: macro?.fedRate ? macro.fedRate + "%" : "—", desc: "Federal Reserve target rate", c: "#3B6CB4" },
    { l: "10Y Treasury", v: macro?.t10y ? macro.t10y + "%" : "—", desc: "US government bond yield", c: "#3B6CB4" },
    { l: "2Y Treasury", v: macro?.t2y ? macro.t2y + "%" : "—", desc: "Short-term bond yield", c: "#3B6CB4" },
    { l: "Yield Curve", v: macro?.yieldSpread ? macro.yieldSpread + "%" : "—", desc: spreadLabel, c: spreadColor },
    { l: "CPI Index", v: macro?.cpi ?? "—", desc: "Consumer Price Index", c: "#D4A843" },
    { l: "Unemployment", v: macro?.unemp ? macro.unemp + "%" : "—", desc: "US labor market", c: "#C0392B" },
    { l: "M2 Money Supply", v: macro?.m2 ? "$" + (parseFloat(macro.m2) / 1e3).toFixed(1) + "T" : "—", desc: "Broad money supply", c: "#5B4FA0" },
    { l: "Dollar Index", v: macro?.dxy ?? "—", desc: "Trade-weighted dollar", c: "#2D8F5E" },
  ];

  return (
    <MarketPageLayout title="Macro &" titleAccent="Central Banks" accentColor="#3B6CB4" subtitle="Federal Reserve data, treasury yields, inflation metrics, and recession indicators. Data from FRED & Yahoo Finance.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Fed Rate" value={macro?.fedRate ? macro.fedRate + "%" : "—"} color="#3B6CB4" subtitle="Federal Reserve" />
        <KPICard label="10Y Yield" value={macro?.t10y ? macro.t10y + "%" : "—"} color="#3B6CB4" subtitle="US Treasury" />
        <KPICard label="Yield Curve" value={macro?.yieldSpread ? macro.yieldSpread + "%" : "—"} color={spreadColor} subtitle={spreadLabel} />
        <KPICard label="VIX" value={macro?.vix != null ? macro.vix.toFixed(1) : "—"} color="#C0392B" subtitle="Fear index" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="^TNX" title="US 10Y Yield" type="line" range="2y" color="#3B6CB4" />
        <TVChart symbol="^GSPC" title="S&P 500" type="candlestick" range="1y" color="#B8860B" />
        <TVChart symbol="^VIX" title="VIX (Volatility)" type="area" range="6mo" color="#C0392B" />
        <TVChart symbol="DX-Y.NYB" title="Dollar Index (DXY)" type="line" range="1y" color="#2D8F5E" />
      </div>

      {/* Macro Data Table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#3B6CB4", fontWeight: 600, textTransform: "uppercase" }}>Key Indicators</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
          {metrics.map((m) => (
            <div key={m.l} style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.1em", color: m.c, fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{m.v}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <CrossRef items={[
        { label: "Fed Pivot or Pause?", href: "/research/fed-pivot-or-pause", type: "research" },
        { label: "FX & Currencies", href: "/markets/fx", type: "market" },
        { label: "Commodities & Energy", href: "/markets/commodities", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
