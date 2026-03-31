"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

const geoEvents = [
  { title: "Iran–US/Israel Conflict", status: "ACTIVE", statusColor: "#f87171", desc: "Strait of Hormuz disrupted. QatarEnergy LNG halted. Brent $100+. TTF gas +57%.", date: "Since Feb 28, 2026" },
  { title: "EU Russian Gas Ban", status: "PHASING IN", statusColor: "#FBBF24", desc: "Stepwise ban began March 18, 2026. Full LNG ban by end 2026, pipeline gas by autumn 2027.", date: "Since Mar 18, 2026" },
  { title: "US–China Trade War", status: "ESCALATING", statusColor: "#FBBF24", desc: "New tariff rounds in 2026. Semiconductor export controls tightened. Rare earth retaliation risk.", date: "Ongoing" },
  { title: "Russia–Ukraine War", status: "ONGOING", statusColor: "#f87171", desc: "No ceasefire in sight. European defense spending accelerating. Energy supply restructuring continues.", date: "Since Feb 2022" },
];

export default function GeoClient({ macro, gdp }: { macro: any; gdp: any }) {
  const spread = macro?.yieldSpread ? parseFloat(macro.yieldSpread) : null;
  const spreadLabel = spread !== null ? (spread >= 0 ? "Normal" : "Inverted") : "";
  const spreadColor = spread !== null ? (spread >= 0 ? "#34d399" : "#f87171") : "rgba(255,255,255,0.3)";

  return (
    <MarketPageLayout title="Global Macro &" titleAccent="Policy Signals" accentColor="#8B2252" subtitle="Recession indicators, geopolitical risk, liquidity metrics, and macro policy signals. Data from FRED, Yahoo Finance & World Bank.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Yield Curve" value={macro?.yieldSpread ? macro.yieldSpread + "%" : "—"} color={spreadColor} subtitle={spreadLabel + " — recession signal"} />
        <KPICard label="M2 Money Supply" value={macro?.m2 ? "$" + (parseFloat(macro.m2) / 1e3).toFixed(1) + "T" : "—"} color="#5B4FA0" subtitle="Global liquidity driver" />
        <KPICard label="Dollar Index" value={macro?.dxy ?? "—"} color="#2D8F5E" subtitle="Trade-weighted" />
        <KPICard label="Active Crises" value={geoEvents.filter(e => e.status === "ACTIVE").length.toString()} color="#f87171" subtitle="Ongoing geopolitical events" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="GC=F" title="Gold (Geopolitical Hedge)" type="area" range="1y" color="#B8860B" />
        <TVChart symbol="CL=F" title="WTI Oil (Supply Risk)" type="area" range="6mo" color="#8B5E3C" />
        <TVChart symbol="DX-Y.NYB" title="Dollar Index" type="line" range="2y" color="#2D8F5E" />
        <TVChart symbol="^VIX" title="VIX (Market Fear)" type="area" range="6mo" color="#C0392B" />
      </div>

      {/* Active Geopolitical Events */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#8B2252", fontWeight: 600, textTransform: "uppercase" }}>Active Geopolitical Events</span>
        </div>
        {geoEvents.map((e, i) => (
          <div key={i} style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 auto" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.06em", color: e.statusColor, background: e.statusColor + "15", padding: "3px 8px", borderRadius: 3 }}>{e.status}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600, color: "#fff", marginBottom: 3 }}>{e.title}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{e.desc}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{e.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* World GDP Table */}
      {gdp && gdp.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#8B2252", fontWeight: 600, textTransform: "uppercase" }}>World GDP — Top Economies ({gdp[0]?.year || "2023"})</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0 }}>
            {gdp.sort((a: any, b: any) => (b.gdp || 0) - (a.gdp || 0)).map((c: any) => (
              <div key={c.code} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff", marginBottom: 2 }}>{c.country}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 500, color: "#8B2252" }}>${(c.gdp / 1e12).toFixed(2)}T</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CrossRef items={[
        { label: "Europe's Energy System, Decoded", href: "/research/europe-energy-decoded", type: "research" },
        { label: "Trump's 2026 Tariff Escalation", href: "/research/trump-tariff-escalation-2026", type: "research" },
        { label: "Commodities & Energy", href: "/markets/commodities", type: "market" },
        { label: "FX & Currencies", href: "/markets/fx", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
