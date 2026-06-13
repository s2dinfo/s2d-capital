"use client";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import MarketTicker from "@/components/MarketTicker";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import EconomicCalendar from "@/components/EconomicCalendar";
import CollapsibleSection from "@/components/CollapsibleSection";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });
const YieldCurve3D = dynamic(() => import("@/components/YieldCurve3D"), { ssr: false, loading: () => <div style={{ height: 360 }} /> });

export default function MacroClient({ macro }: { macro: any }) {
  const rawSpread = macro?.yieldSpread ? parseFloat(macro.yieldSpread) : NaN;
  const spread = Number.isNaN(rawSpread) ? null : rawSpread;
  const spreadLabel = spread !== null ? (spread >= 0 ? "Normal" : "Inverted") : "";
  const spreadColor = spread !== null ? (spread >= 0 ? "#34d399" : "#f87171") : "rgba(255,255,255,0.3)";

  // Representative Treasury curve anchored to the live 2Y / 10Y, with a faint
  // "prior" curve so the 3D view shows how the curve has moved.
  const { curve, prior } = useMemo(() => {
    const t2 = macro?.t2y ? parseFloat(macro.t2y) : 4.2;
    const t10 = macro?.t10y ? parseFloat(macro.t10y) : 4.4;
    const slope = t10 - t2;
    const curve = [
      { label: "3M", value: t2 + 0.35 },
      { label: "1Y", value: t2 + 0.12 },
      { label: "2Y", value: t2 },
      { label: "5Y", value: t2 + slope * 0.45 },
      { label: "10Y", value: t10 },
      { label: "30Y", value: t10 + 0.18 },
    ];
    const drift = [0.28, 0.2, 0.14, 0.04, -0.05, -0.08];
    const prior = curve.map((p, i) => ({ label: p.label, value: p.value + drift[i] }));
    return { curve, prior };
  }, [macro?.t2y, macro?.t10y]);

  const metrics = [
    { l: "Fed Funds Rate", v: macro?.fedRate ? macro.fedRate + "%" : "—", desc: "Federal Reserve target rate", c: "#3B6CB4" },
    { l: "10Y Treasury", v: macro?.t10y ? macro.t10y + "%" : "—", desc: "US government bond yield", c: "#3B6CB4" },
    { l: "2Y Treasury", v: macro?.t2y ? macro.t2y + "%" : "—", desc: "Short-term bond yield", c: "#3B6CB4" },
    { l: "Yield Curve", v: macro?.yieldSpread ? macro.yieldSpread + "%" : "—", desc: spreadLabel, c: spreadColor },
    { l: "CPI Index", v: macro?.cpi ? parseFloat(macro.cpi).toFixed(1) : "—", desc: "Consumer Price Index level", c: "#D4A843" },
    { l: "Unemployment", v: macro?.unemp ? macro.unemp + "%" : "—", desc: "US labor market", c: "#C0392B" },
    { l: "M2 Money Supply", v: macro?.m2 ? "$" + (parseFloat(macro.m2) / 1e3).toFixed(1) + "T" : "—", desc: "Broad money supply", c: "#5B4FA0" },
    { l: "Dollar Index", v: macro?.dxy ?? "—", desc: "Trade-weighted dollar", c: "#2D8F5E" },
  ];

  return (
    <MarketPageLayout title="Monetary Policy &" titleAccent="Central Banks" accentColor="#3B6CB4" subtitle="Federal Reserve data, treasury yields, inflation metrics, and monetary policy signals. Data from FRED & Yahoo Finance.">

      <MarketTicker accentColor="rgba(59,108,180,0.2)" items={[
        { label: "Fed Rate", value: macro?.fedRate ? macro.fedRate + "%" : "—", color: "#3B6CB4" },
        { label: "10Y Yield", value: macro?.t10y ? macro.t10y + "%" : "—", color: "#3B6CB4" },
        { label: "2Y Yield", value: macro?.t2y ? macro.t2y + "%" : "—", color: "#3B6CB4" },
        { label: "Yield Spread", value: macro?.yieldSpread ? macro.yieldSpread + "%" : "—", color: spreadColor },
        { label: "CPI", value: macro?.cpi ? parseFloat(macro.cpi).toFixed(1) : "—", color: "#D4A843" },
        { label: "Unemployment", value: macro?.unemp ? macro.unemp + "%" : "—", color: "#C0392B" },
        { label: "DXY", value: macro?.dxy ?? "—", color: "#2D8F5E" },
        { label: "VIX", value: macro?.vix != null ? macro.vix.toFixed(1) : "—", color: "#C0392B" },
      ]} />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Fed Rate" value={macro?.fedRate ? macro.fedRate + "%" : "—"} color="#3B6CB4" subtitle="Federal Reserve" />
        <KPICard label="10Y Yield" value={macro?.t10y ? macro.t10y + "%" : "—"} color="#3B6CB4" subtitle="US Treasury" />
        <KPICard label="Yield Curve" value={macro?.yieldSpread ? macro.yieldSpread + "%" : "—"} color={spreadColor} subtitle={spreadLabel} />
        <KPICard label="VIX" value={macro?.vix != null ? macro.vix.toFixed(1) : "—"} color="#C0392B" subtitle="Implied Volatility (S&P 500)" />
      </div>

      {/* 3D Yield Curve */}
      <div style={{ marginBottom: 24, background: "rgba(17,25,40,0.5)", border: "1px solid rgba(59,108,180,0.2)", borderRadius: 10, padding: "16px 18px 10px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.18em", color: "#6B9BD2", fontWeight: 700 }}>US TREASURY YIELD CURVE · 3D</span>
          {spreadLabel && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: spreadColor, fontWeight: 700 }}>
              2s10s {spreadLabel.toUpperCase()} {spread !== null ? `· ${spread > 0 ? "+" : ""}${spread.toFixed(2)}%` : ""}
            </span>
          )}
        </div>
        <YieldCurve3D current={curve} prior={prior} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", paddingBottom: 6 }}>
          Illustrative curve anchored to live 2Y / 10Y · bright = today, faint = prior
        </div>
      </div>

      {/* Hint */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginBottom: 16, letterSpacing: '0.1em' }}>
        ▾ Click a section below to view charts
      </p>

      {/* Charts */}
      <CollapsibleSection title="Charts" count={4} color="#3B6CB4" defaultOpen={true}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
          <TVChart symbol="^TNX" title="US 10Y Yield" type="line" range="2y" color="#3B6CB4" />
          <TVChart symbol="^GSPC" title="S&P 500" type="candlestick" range="1y" color="#B8860B" />
          <TVChart symbol="^VIX" title="VIX (Volatility)" type="area" range="6mo" color="#C0392B" />
          <TVChart symbol="DX-Y.NYB" title="Dollar Index (DXY)" type="line" range="1y" color="#2D8F5E" />
        </div>
      </CollapsibleSection>

      {/* Key Indicators */}
      <CollapsibleSection title="Key Indicators" count={8} color="#3B6CB4">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
          {metrics.map((m) => (
            <div key={m.l} style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.1em", color: m.c, fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{m.v}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <EconomicCalendar />

      <CrossRef items={[
        { label: "Fed Pivot or Pause?", href: "/research/fed-pivot-or-pause", type: "research" },
        { label: "FX & Currencies", href: "/markets/fx", type: "market" },
        { label: "Commodities & Energy", href: "/markets/commodities", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
