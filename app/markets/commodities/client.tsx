"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import CollapsibleSection from "@/components/CollapsibleSection";

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

function ChartGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>{children}</div>;
}

export default function CommClient({ commod }: { commod: any }) {
  const [specsOpen, setSpecsOpen] = useState(false);

  return (
    <MarketPageLayout title="Commodities &" titleAccent="Energy" accentColor="#8B5E3C" subtitle="Comprehensive coverage across precious metals, energy, base metals, agriculture, and livestock. Click any section to expand.">

      {/* KPI Cards — always visible summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginBottom: 20 }}>
        <KPICard label="WTI Crude" value={fmt(commod.oil)} change={commod.oilChg} color="#8B5E3C" subtitle="Light sweet crude" />
        <KPICard label="Brent Crude" value={fmt(commod.brent)} change={commod.brentChg} color="#C0392B" subtitle="Global benchmark" />
        <KPICard label="Gold" value={fmt(commod.gold, 0)} change={commod.goldChg} color="#B8860B" />
        <KPICard label="Silver" value={fmt(commod.silver)} change={commod.silverChg} color="#9CA3AF" />
        <KPICard label="Natural Gas" value={fmt(commod.natgas, 3)} change={commod.natgasChg} color="#D4A843" subtitle="Henry Hub" />
      </div>

      {/* Hint */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginBottom: 16, letterSpacing: '0.1em' }}>
        ▾ Click a section below to view charts
      </p>

      {/* Precious Metals */}
      <CollapsibleSection title="Precious Metals" subtitle="Gold, Silver, Platinum, Palladium" count={4} color="#B8860B" defaultOpen={true}>
        <ChartGrid>
          <TVChart symbol="GC=F" title="Gold" color="#B8860B" />
          <TVChart symbol="SI=F" title="Silver" color="#9CA3AF" />
          <TVChart symbol="PL=F" title="Platinum" color="#A0A0A0" />
          <TVChart symbol="PA=F" title="Palladium" color="#7B7B7B" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Energy */}
      <CollapsibleSection title="Energy" subtitle="Crude Oil, Natural Gas" count={3} color="#C0392B">
        <ChartGrid>
          <TVChart symbol="CL=F" title="WTI Crude Oil" color="#8B5E3C" />
          <TVChart symbol="BZ=F" title="Brent Crude" color="#C0392B" />
          <TVChart symbol="NG=F" title="Henry Hub Natural Gas" color="#D4A843" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Base Metals */}
      <CollapsibleSection title="Base & Industrial Metals" subtitle="Copper, Aluminum" count={2} color="#B87333">
        <ChartGrid>
          <TVChart symbol="HG=F" title="Copper" color="#B87333" />
          <TVChart symbol="ALI=F" title="Aluminum" color="#848484" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Grains */}
      <CollapsibleSection title="Grains" subtitle="Wheat, Corn, Soybeans, Oats" count={4} color="#DAA520">
        <ChartGrid>
          <TVChart symbol="ZW=F" title="Wheat" color="#DAA520" />
          <TVChart symbol="ZC=F" title="Corn" color="#E8B830" />
          <TVChart symbol="ZS=F" title="Soybeans" color="#6B8E23" />
          <TVChart symbol="ZO=F" title="Oats" color="#C4A35A" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Softs */}
      <CollapsibleSection title="Softs" subtitle="Coffee, Cocoa, Sugar, Cotton, Orange Juice" count={5} color="#6F4E37">
        <ChartGrid>
          <TVChart symbol="KC=F" title="Coffee" color="#6F4E37" />
          <TVChart symbol="CC=F" title="Cocoa" color="#7B3F00" />
          <TVChart symbol="SB=F" title="Sugar" color="#D4A843" />
          <TVChart symbol="CT=F" title="Cotton" color="#C4A35A" />
          <TVChart symbol="OJ=F" title="Orange Juice" color="#FFA500" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Livestock */}
      <CollapsibleSection title="Livestock" subtitle="Live Cattle, Lean Hogs" count={2} color="#8B4513">
        <ChartGrid>
          <TVChart symbol="LE=F" title="Live Cattle" color="#8B4513" />
          <TVChart symbol="HE=F" title="Lean Hogs" color="#CD853F" />
        </ChartGrid>
      </CollapsibleSection>

      {/* Other */}
      <CollapsibleSection title="Other" subtitle="Lumber" count={1} color="#A0522D">
        <TVChart symbol="LBS=F" title="Lumber" color="#A0522D" />
      </CollapsibleSection>

      {/* Contract Specifications */}
      <CollapsibleSection title="Contract Specifications" subtitle="Contract sizes, units, and exchanges for all commodities" count={21} color="#8B5E3C">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['COMMODITY', 'SYMBOL', 'CONTRACT SIZE', 'UNIT', 'EXCHANGE'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTRACT_SPECS.map(s => (
                <tr key={s.symbol}>
                  <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s.name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#8B5E3C', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s.symbol}</td>
                  <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s.size}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s.unit}</td>
                  <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CrossRef items={[
        { label: "Europe's Energy System, Decoded", href: "/research/europe-energy-decoded", type: "research" },
        { label: "Gold at $3,000: Safe Haven or Bubble?", href: "/research/gold-3000-safe-haven-or-bubble", type: "research" },
        { label: "Geopolitics", href: "/markets/geopolitics", type: "market" },
        { label: "Monetary Policy & Central Banks", href: "/markets/macro", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
