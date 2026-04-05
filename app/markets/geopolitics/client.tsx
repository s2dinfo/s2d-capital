"use client";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import LiveGeoEvents from "@/components/LiveGeoEvents";

const geoEvents = [
  { title: "Iran–US/Israel Conflict", status: "ACTIVE", statusColor: "#f87171", desc: "Strait of Hormuz disrupted. QatarEnergy LNG halted. Brent $100+. TTF gas +57%.", date: "Since Feb 28, 2026" },
  { title: "EU Russian Gas Ban", status: "PHASING IN", statusColor: "#FBBF24", desc: "Stepwise ban began March 18, 2026. Full LNG ban by end 2026, pipeline gas by autumn 2027.", date: "Since Mar 18, 2026" },
  { title: "US–China Trade War", status: "ESCALATING", statusColor: "#FBBF24", desc: "New tariff rounds in 2026. Semiconductor export controls tightened. Rare earth retaliation risk.", date: "Ongoing" },
  { title: "Russia–Ukraine War", status: "ONGOING", statusColor: "#f87171", desc: "No ceasefire in sight. European defense spending accelerating. Energy supply restructuring continues.", date: "Since Feb 2022" },
];

export default function GeoClient({ macro, gdp }: { macro: any; gdp: any }) {
  const rawSpread = macro?.yieldSpread ? parseFloat(macro.yieldSpread) : NaN;
  const spread = Number.isNaN(rawSpread) ? null : rawSpread;
  const spreadLabel = spread !== null ? (spread >= 0 ? "Normal" : "Inverted") : "";
  const spreadColor = spread !== null ? (spread >= 0 ? "#34d399" : "#f87171") : "rgba(255,255,255,0.3)";

  return (
    <MarketPageLayout title="Geopolitics" titleAccent="" accentColor="#8B2252" subtitle="Geopolitical risk, conflict zones, sanctions, trade wars, and their market impact. Data from FRED, Yahoo Finance & World Bank.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Yield Curve" value={macro?.yieldSpread ? macro.yieldSpread + "%" : "—"} color={spreadColor} subtitle={spreadLabel + " — recession signal"} />
        <KPICard label="M2 Money Supply" value={macro?.m2 ? "$" + (parseFloat(macro.m2) / 1e3).toFixed(1) + "T" : "—"} color="#5B4FA0" subtitle="Global liquidity driver" />
        <KPICard label="Dollar Index" value={macro?.dxy ?? "—"} color="#2D8F5E" subtitle="Trade-weighted" />
        <KPICard label="Active Crises" value={geoEvents.filter(e => e.status === "ACTIVE").length.toString()} color="#f87171" subtitle="Ongoing geopolitical events" />
      </div>

      {/* Active Geopolitical Events */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#8B2252", fontWeight: 600, textTransform: "uppercase" }}>Active Geopolitical Events</span>
        </div>
        {geoEvents.map((e) => (
          <div key={e.title} style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
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

      {/* Live GDELT Events */}
      <LiveGeoEvents />

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
