"use client";
import { useState, useEffect } from "react";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import CollapsibleSection from "@/components/CollapsibleSection";

const geoEvents = [
  { title: "Iran–US/Israel Conflict", status: "ACTIVE", statusColor: "#f87171", desc: "Strait of Hormuz disrupted. QatarEnergy LNG halted. Brent $100+. TTF gas +57%.", date: "Since Feb 28, 2026" },
  { title: "EU Russian Gas Ban", status: "PHASING IN", statusColor: "#FBBF24", desc: "Stepwise ban began March 18, 2026. Full LNG ban by end 2026, pipeline gas by autumn 2027.", date: "Since Mar 18, 2026" },
  { title: "US–China Trade War", status: "ESCALATING", statusColor: "#FBBF24", desc: "New tariff rounds in 2026. Semiconductor export controls tightened. Rare earth retaliation risk.", date: "Ongoing" },
  { title: "Russia–Ukraine War", status: "ONGOING", statusColor: "#f87171", desc: "No ceasefire in sight. European defense spending accelerating. Energy supply restructuring continues.", date: "Since Feb 2022" },
  { title: "India–Pakistan Border Tensions", status: "ESCALATING", statusColor: "#C0392B", desc: "Renewed military posturing along the Line of Control following the Pahalgam terror attack. India suspended the Indus Waters Treaty.", date: "Apr 2025 – present" },
  { title: "Sudan Civil War", status: "ONGOING", statusColor: "#E88A3C", desc: "RSF and SAF continue fighting. Humanitarian crisis with 10M+ displaced. International mediation stalled.", date: "Apr 2023 – present" },
  { title: "South China Sea Disputes", status: "ACTIVE", statusColor: "#C0392B", desc: "Increased Chinese coast guard activity near Philippine-claimed reefs. US freedom of navigation ops continue.", date: "Ongoing" },
  { title: "EU Green Deal Industrial Policy", status: "IN EFFECT", statusColor: "#2D8F5E", desc: "Carbon Border Adjustment Mechanism (CBAM) transitional phase. Affecting steel, cement, aluminum imports.", date: "Oct 2023 – present" },
  { title: "OPEC+ Production Cuts", status: "EXTENDING", statusColor: "#E88A3C", desc: "Saudi-led voluntary cuts of 2.2M bpd extended through Q2 2026. Balancing market amid weak Chinese demand.", date: "Nov 2023 – present" },
];

export default function GeoClient({ macro, gdp }: { macro: any; gdp: any }) {
  const [headlines, setHeadlines] = useState<{title:string;url:string;date:string;source:string}[]>([]);
  useEffect(() => {
    fetch('/api/geopolitical').then(r=>r.json()).then(d=>{
      if (d.headlines) setHeadlines(d.headlines);
    }).catch(()=>{});
  }, []);

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

      {/* Hint */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginBottom: 16, letterSpacing: '0.1em' }}>
        ▾ Click a section below to view charts
      </p>

      {/* Active Geopolitical Events */}
      <CollapsibleSection title="Active Geopolitical Events" count={geoEvents.length} color="#8B2252" defaultOpen={true}>
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
      </CollapsibleSection>

      {/* Live Headlines from GDELT */}
      {headlines.length > 0 && (
        <CollapsibleSection title="Live Headlines" subtitle="Auto-updated from global news via GDELT" count={headlines.length} color="#8B2252">
          {headlines.map((h, i) => (
            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,34,82,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 4 }}>{h.title}</div>
              <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: 'rgba(255,255,255,0.25)' }}>
                <span>{h.source}</span>
                {h.date && <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
              </div>
            </a>
          ))}
        </CollapsibleSection>
      )}

      {/* World GDP Table */}
      {gdp && gdp.length > 0 && (
        <CollapsibleSection title={`World GDP — Top Economies (${gdp[0]?.year || "2023"})`} color="#8B2252">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0 }}>
            {gdp.sort((a: any, b: any) => (b.gdp || 0) - (a.gdp || 0)).map((c: any) => (
              <div key={c.code} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff", marginBottom: 2 }}>{c.country}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 500, color: "#8B2252" }}>${(c.gdp / 1e12).toFixed(2)}T</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <CrossRef items={[
        { label: "Europe's Energy System, Decoded", href: "/research/europe-energy-decoded", type: "research" },
        { label: "Trump's 2026 Tariff Escalation", href: "/research", type: "research" },
        { label: "Commodities & Energy", href: "/markets/commodities", type: "market" },
        { label: "FX & Currencies", href: "/markets/fx", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
