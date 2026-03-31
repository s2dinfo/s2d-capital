"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import CrossRef from "@/components/CrossRef";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

const tip = { fontSize: "0.7rem", background: "#1e2240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "rgba(255,255,255,0.8)" };
const fB = (n: number) => { if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T"; if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B"; return "$" + (n / 1e6).toFixed(0) + "M"; };

export default function StructureClient({ global, defi, chains }: any) {
  return (
    <MarketPageLayout title="DeFi &" titleAccent="On-Chain Structure" accentColor="#5B4FA0" subtitle="DeFi TVL by chain, protocol metrics, and ecosystem data. Data from DefiLlama, CoinGecko & Yahoo Finance.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="DeFi TVL" value={defi?.current ? fB(defi.current) : "—"} color="#5B4FA0" subtitle="Total Value Locked" />
        <KPICard label="BTC Dominance" value={global?.btcDom ? global.btcDom.toFixed(1) + "%" : "—"} color="#B8860B" />
        <KPICard label="ETH Dominance" value={global?.ethDom ? global.ethDom.toFixed(1) + "%" : "—"} color="#3B6CB4" />
        <KPICard label="Active Cryptos" value={global?.active?.toLocaleString() ?? "—"} color="#5B4FA0" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="ETH-USD" title="Ethereum (DeFi Bellwether)" type="candlestick" range="3mo" color="#3B6CB4" />
        <TVChart symbol="SOL-USD" title="Solana (L1 Competitor)" type="area" range="3mo" color="#9945FF" />
      </div>

      {/* DeFi TVL Chart */}
      {defi?.chart && (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 6, marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#5B4FA0", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Total DeFi TVL — 30 Days</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={defi.chart}><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2} /><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => "$" + v + "B"} /><Tooltip contentStyle={tip} formatter={(v: number) => ["$" + v + "B", "TVL"]} /><Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#tg)" /></AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TVL by Chain */}
      {chains && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#5B4FA0", fontWeight: 600, textTransform: "uppercase" }}>TVL by Blockchain</span>
          </div>
          {chains.map((c: any, i: number) => (
            <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: "0.82rem", fontWeight: 500 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", width: 20 }}>#{i + 1}</span>
                {c.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600, color: "#5B4FA0" }}>{fB(c.tvl)}</span>
            </div>
          ))}
        </div>
      )}

      <CrossRef items={[
        { label: "The CLARITY Act", href: "/research/clarity-act", type: "research" },
        { label: "Morgan Stanley Digital Trust", href: "/research/morgan-stanley-digital-trust", type: "research" },
        { label: "Crypto & Digital Assets", href: "/markets/crypto", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
