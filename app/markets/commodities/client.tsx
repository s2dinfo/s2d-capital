"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

function fmt(v: number | null | undefined, dec = 2) { return v != null ? "$" + v.toFixed(dec) : "—"; }

const CONTRACT_SPECS = [
  { name: 'Gold', symbol: 'GC=F', size: '100 troy oz', unit: 'USD/oz', exchange: 'COMEX' },
  { name: 'Silver', symbol: 'SI=F', size: '5,000 troy oz', unit: 'USD/oz', exchange: 'COMEX' },
  { name: 'Platinum', symbol: 'PL=F', size: '50 troy oz', unit: 'USD/oz', exchange: 'NYMEX' },
  { name: 'Palladium', symbol: 'PA=F', size: '100 troy oz', unit: 'USD/oz', exchange: 'NYMEX' },
  { name: 'Copper', symbol: 'HG=F', size: '25,000 lbs', unit: 'USD/lb', exchange: 'COMEX' },
  { name: 'Aluminum', symbol: 'ALI=F', size: '44,000 lbs', unit: 'USD/lb', exchange: 'COMEX' },
  { name: 'WTI Crude', symbol: 'CL=F', size: '1,000 barrels', unit: 'USD/bbl', exchange: 'NYMEX' },
  { name: 'Brent Crude', symbol: 'BZ=F', size: '1,000 barrels', unit: 'USD/bbl', exchange: 'ICE' },
  { name: 'Natural Gas', symbol: 'NG=F', size: '10,000 MMBtu', unit: 'USD/MMBtu', exchange: 'NYMEX' },
  { name: 'Wheat', symbol: 'ZW=F', size: '5,000 bushels', unit: 'USD/bu', exchange: 'CBOT' },
  { name: 'Corn', symbol: 'ZC=F', size: '5,000 bushels', unit: 'USD/bu', exchange: 'CBOT' },
  { name: 'Soybeans', symbol: 'ZS=F', size: '5,000 bushels', unit: 'USD/bu', exchange: 'CBOT' },
  { name: 'Oats', symbol: 'ZO=F', size: '5,000 bushels', unit: 'USD/bu', exchange: 'CBOT' },
  { name: 'Coffee', symbol: 'KC=F', size: '37,500 lbs', unit: 'USD/lb', exchange: 'ICE' },
  { name: 'Cocoa', symbol: 'CC=F', size: '10 metric tons', unit: 'USD/ton', exchange: 'ICE' },
  { name: 'Sugar', symbol: 'SB=F', size: '112,000 lbs', unit: 'USD/lb', exchange: 'ICE' },
  { name: 'Cotton', symbol: 'CT=F', size: '50,000 lbs', unit: 'USD/lb', exchange: 'ICE' },
  { name: 'Orange Juice', symbol: 'OJ=F', size: '15,000 lbs', unit: 'USD/lb', exchange: 'ICE' },
  { name: 'Live Cattle', symbol: 'LE=F', size: '40,000 lbs', unit: 'USD/lb', exchange: 'CME' },
  { name: 'Lean Hogs', symbol: 'HE=F', size: '40,000 lbs', unit: 'USD/lb', exchange: 'CME' },
  { name: 'Lumber', symbol: 'LBS=F', size: '27,500 bd ft', unit: 'USD/bd ft', exchange: 'CME' },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 24 }}>
      <div style={{ width: 4, height: 20, background: '#8B5E3C', borderRadius: 2 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#8B5E3C', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

function ChartGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {children}
    </div>
  );
}

export default function CommClient({ commod }: { commod: any }) {
  const [specsOpen, setSpecsOpen] = useState(false);

  return (
    <MarketPageLayout title="Commodities &" titleAccent="Energy" accentColor="#8B5E3C" subtitle="Oil, gold, natural gas, and energy markets. Live data from Yahoo Finance futures.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="WTI Crude" value={fmt(commod.oil)} change={commod.oilChg} color="#8B5E3C" subtitle="Light sweet crude" />
        <KPICard label="Brent Crude" value={fmt(commod.brent)} change={commod.brentChg} color="#C0392B" subtitle="Global benchmark" />
        <KPICard label="Gold" value={fmt(commod.gold, 0)} change={commod.goldChg} color="#B8860B" subtitle="Spot futures" />
        <KPICard label="Silver" value={fmt(commod.silver)} change={commod.silverChg} color="#9CA3AF" />
        <KPICard label="Natural Gas" value={fmt(commod.natgas, 3)} change={commod.natgasChg} color="#D4A843" subtitle="Henry Hub" />
      </div>

      {/* Precious Metals */}
      <SectionHeader label="Precious Metals" />
      <ChartGrid>
        <TVChart symbol="GC=F" title="Gold" type="candlestick" range="2y" color="#B8860B" />
        <TVChart symbol="SI=F" title="Silver" type="candlestick" range="2y" color="#9CA3AF" />
        <TVChart symbol="PL=F" title="Platinum" type="candlestick" range="2y" color="#A0A0A0" />
        <TVChart symbol="PA=F" title="Palladium" type="candlestick" range="2y" color="#7B7B7B" />
      </ChartGrid>

      {/* Energy */}
      <SectionHeader label="Energy" />
      <ChartGrid>
        <TVChart symbol="CL=F" title="WTI Crude Oil" type="candlestick" range="2y" color="#8B5E3C" />
        <TVChart symbol="BZ=F" title="Brent Crude" type="candlestick" range="2y" color="#C0392B" />
        <TVChart symbol="NG=F" title="Henry Hub Natural Gas" type="candlestick" range="2y" color="#D4A843" />
      </ChartGrid>

      {/* Base Metals */}
      <SectionHeader label="Base Metals" />
      <ChartGrid>
        <TVChart symbol="HG=F" title="Copper" type="candlestick" range="2y" color="#B87333" />
        <TVChart symbol="ALI=F" title="Aluminum" type="candlestick" range="2y" color="#848484" />
      </ChartGrid>

      {/* Grains */}
      <SectionHeader label="Grains" />
      <ChartGrid>
        <TVChart symbol="ZW=F" title="Wheat" type="candlestick" range="2y" color="#DAA520" />
        <TVChart symbol="ZC=F" title="Corn" type="candlestick" range="2y" color="#E8B830" />
        <TVChart symbol="ZS=F" title="Soybeans" type="candlestick" range="2y" color="#6B8E23" />
        <TVChart symbol="ZO=F" title="Oats" type="candlestick" range="2y" color="#C4A35A" />
      </ChartGrid>

      {/* Softs */}
      <SectionHeader label="Softs" />
      <ChartGrid>
        <TVChart symbol="KC=F" title="Coffee" type="candlestick" range="2y" color="#6F4E37" />
        <TVChart symbol="CC=F" title="Cocoa" type="candlestick" range="2y" color="#7B3F00" />
        <TVChart symbol="SB=F" title="Sugar" type="candlestick" range="2y" color="#F5F5DC" />
        <TVChart symbol="CT=F" title="Cotton" type="candlestick" range="2y" color="#E8D5B7" />
        <TVChart symbol="OJ=F" title="Orange Juice" type="candlestick" range="2y" color="#FFA500" />
      </ChartGrid>

      {/* Livestock */}
      <SectionHeader label="Livestock" />
      <ChartGrid>
        <TVChart symbol="LE=F" title="Live Cattle" type="candlestick" range="2y" color="#8B4513" />
        <TVChart symbol="HE=F" title="Lean Hogs" type="candlestick" range="2y" color="#CD853F" />
      </ChartGrid>

      {/* Other */}
      <SectionHeader label="Other" />
      <ChartGrid>
        <TVChart symbol="LBS=F" title="Lumber" type="candlestick" range="2y" color="#A0522D" />
      </ChartGrid>

      {/* Contract Specifications */}
      <div style={{ marginTop: 32, marginBottom: 24 }}>
        <button
          onClick={() => setSpecsOpen(!specsOpen)}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: "12px 18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "#8B5E3C", fontWeight: 600, textTransform: "uppercase" }}>Contract Specifications</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginLeft: "auto" }}>{specsOpen ? "▲" : "▼"}</span>
        </button>
        {specsOpen && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  {["NAME", "SYMBOL", "CONTRACT SIZE", "UNIT", "EXCHANGE"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTRACT_SPECS.map((c) => (
                  <tr key={c.symbol}>
                    <td style={{ padding: "10px 16px", color: "#fff", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>{c.name}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#8B5E3C", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.symbol}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>{c.size}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.unit}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c.exchange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
