"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import FearGreedGauge from "@/components/FearGreedGauge";
import CrossRef from "@/components/CrossRef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });
const CorrelationHeatmap = dynamic(() => import("@/components/CorrelationHeatmap"), { ssr: false });

const tip = { fontSize: "0.7rem", background: "#1e2240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "rgba(255,255,255,0.8)" };
const fP = (n: number) => { if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T"; if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B"; if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 }); if (n >= 1) return "$" + n.toFixed(2); return "$" + n.toFixed(4); };

/* ── Sector data ── */
const SECTORS = [
  { name: "DeFi", desc: "Decentralized finance protocols replacing traditional intermediaries.", info: "DeFi encompasses lending, borrowing, DEXs, yield farming, and stablecoins. Major protocols include Aave, Uniswap, and MakerDAO. TVL is the key metric for measuring DeFi adoption.", color: "#5B4FA0", url: "https://www.coingecko.com/en/categories/decentralized-finance-defi" },
  { name: "Layer 1", desc: "Base-layer blockchains that settle transactions natively.", info: "Layer 1 chains are the foundational networks like Ethereum, Solana, Avalanche, and Cardano. They provide consensus, security, and finality. Competition centers on throughput, fees, and developer ecosystems.", color: "#3B6CB4", url: "https://www.coingecko.com/en/categories/layer-1" },
  { name: "Layer 2", desc: "Scaling solutions built on top of Layer 1 networks.", info: "Layer 2 protocols (Arbitrum, Optimism, zkSync, StarkNet) batch or compress transactions off-chain before settling on L1. They dramatically reduce fees while inheriting base-layer security.", color: "#2D8F5E", url: "https://www.coingecko.com/en/categories/layer-2" },
  { name: "Gaming", desc: "Blockchain-based gaming and virtual worlds.", info: "GameFi combines play-to-earn mechanics with NFT ownership. Projects like Immutable X, Gala Games, and The Sandbox aim to give players true asset ownership. Adoption depends on gameplay quality, not just token incentives.", color: "#E07C24", url: "https://www.coingecko.com/en/categories/gaming" },
  { name: "AI & Big Data", desc: "Tokens powering decentralized AI and data networks.", info: "Projects like Fetch.ai, Ocean Protocol, and Render Network provide decentralized compute, data marketplaces, and AI inference. This sector surged alongside the broader AI narrative in 2023-2025.", color: "#9945FF", url: "https://www.coingecko.com/en/categories/artificial-intelligence" },
  { name: "Memecoins", desc: "Community-driven tokens with high speculation.", info: "Memecoins (DOGE, SHIB, PEPE, WIF) are driven by social sentiment rather than fundamentals. They serve as retail on-ramps but carry extreme volatility. Market cap can swing 50%+ in a single day.", color: "#FBBF24", url: "https://www.coingecko.com/en/categories/meme-token" },
  { name: "Real World Assets", desc: "Tokenized traditional assets on-chain.", info: "RWA protocols tokenize treasuries, real estate, credit, and commodities. Projects include Ondo Finance, Centrifuge, and Maple. Institutional interest is high as RWA bridges TradFi and DeFi.", color: "#B8860B", url: "https://www.coingecko.com/en/categories/real-world-assets-rwa" },
];

function SectorCard({ sector }: { sector: typeof SECTORS[number] }) {
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hover ? sector.color + "33" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 6,
        padding: "14px 14px 12px",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, color: sector.color }}>{sector.name}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: expanded ? sector.color + "22" : "rgba(255,255,255,0.06)",
            border: `1px solid ${expanded ? sector.color + "44" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 3,
            padding: "2px 6px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.48rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: expanded ? sector.color : "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
          }}
        >
          {expanded ? "CLOSE" : "INFO"}
        </button>
      </div>
      <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: expanded ? 10 : 0 }}>{sector.desc}</div>
      {expanded && (
        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, padding: "10px 0 4px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8 }}>
          {sector.info}
          <div style={{ marginTop: 8 }}>
            <a href={sector.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: sector.color, textDecoration: "none", letterSpacing: "0.05em" }}>
              View on CoinGecko &rarr;
            </a>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: `linear-gradient(90deg, transparent, ${sector.color}, transparent)`, width: hover ? "100%" : "0%", transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function CryptoClient({ coins, global, fg, trending }: any) {
  const fgVal = fg?.current?.value ?? 50;
  const fgLbl = fg?.current?.label ?? "Neutral";

  return (
    <MarketPageLayout title="Crypto &" titleAccent="Digital Assets" accentColor="#B8860B" subtitle="Live prices, charts, sentiment, and trending coins. Data from CoinGecko, Alternative.me & Yahoo Finance.">

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPICard label="Total Market Cap" value={global ? fP(global.totalMcap) : "—"} change={global?.mcapChg} color="#B8860B" />
        <KPICard label="24h Volume" value={global ? fP(global.vol24h) : "—"} color="#B8860B" />
        <KPICard label="BTC Dominance" value={global?.btcDom ? global.btcDom.toFixed(1) + "%" : "—"} color="#B8860B" subtitle="Bitcoin market share" />
        <KPICard label="Fear & Greed" value={fgVal.toString()} color={fgVal <= 25 ? "#f87171" : fgVal <= 45 ? "#FBBF24" : fgVal <= 55 ? "#B8860B" : "#34d399"} subtitle={fgLbl} />
      </div>

      {/* ── Fear & Greed Gauge ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 6, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#B8860B", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Fear & Greed Index</div>
          <FearGreedGauge value={fgVal} label={fgLbl} />
          {fg?.history && (
            <div style={{ marginTop: 16 }}>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={fg.history}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="date" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} domain={[0, 100]} /><Tooltip contentStyle={tip} /><Bar dataKey="value" radius={[2, 2, 0, 0]} fill="#B8860B" /></BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Core Charts (2-col, no gaps) ── */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#B8860B", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Core Charts</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, marginBottom: 12 }}>
        <TVChart symbol="BTC-USD" title="Bitcoin / USD" type="candlestick" range="2y" color="#B8860B" />
        <TVChart symbol="ETH-USD" title="Ethereum / USD" type="candlestick" range="2y" color="#3B6CB4" />
        <TVChart symbol="TOTAL-USD" title="Total Crypto Market Cap" type="candlestick" range="2y" color="#6366f1" />
        <TVChart symbol="ETH-BTC" title="ETH / BTC" type="candlestick" range="2y" color="#8B5CF6" />
        <TVChart symbol="SOL-USD" title="Solana / USD" type="candlestick" range="2y" color="#9945FF" />
        <TVChart symbol="XRP-USD" title="XRP / USD" type="candlestick" range="2y" color="#2D8F5E" />
      </div>

      {/* ── Correlation Heatmap ── */}
      <CorrelationHeatmap />

      {/* ── Sector Coverage ── */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#B8860B", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Sector Coverage</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 12 }}>
        {SECTORS.map((s) => <SectorCard key={s.name} sector={s} />)}
      </div>

      {/* ── Trending ── */}
      {trending && trending.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 6, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#B8860B", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Trending Coins</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 6 }}>
            {trending.map((t: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "#fff" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "rgba(255,255,255,0.35)", width: 14 }}>{i + 1}</span>
                  {t.name} <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.35)" }}>{t.symbol}</span>
                </span>
                {t.chg != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 500, color: t.chg > 0 ? "#34d399" : "#f87171" }}>{t.chg > 0 ? "+" : ""}{t.chg.toFixed(1)}%</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <CrossRef items={[
        { label: "The CLARITY Act", href: "/research/clarity-act", type: "research" },
        { label: "Morgan Stanley Digital Trust", href: "/research/morgan-stanley-digital-trust", type: "research" },
        { label: "DeFi & On-Chain Structure", href: "/markets/structure", type: "market" },
        { label: "Macro & Central Banks", href: "/markets/macro", type: "market" },
      ]} />
    </MarketPageLayout>
  );
}
