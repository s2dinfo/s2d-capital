"use client";
import dynamic from "next/dynamic";
import MarketPageLayout from "@/components/MarketPageLayout";
import KPICard from "@/components/KPICard";
import FearGreedGauge from "@/components/FearGreedGauge";
import CrossRef from "@/components/CrossRef";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

const TVChart = dynamic(() => import("@/components/TVChart"), { ssr: false, loading: () => <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} /> });

const tip = { fontSize: "0.7rem", background: "#1e2240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "rgba(255,255,255,0.8)" };
const fP = (n: number) => { if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T"; if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B"; if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 }); if (n >= 1) return "$" + n.toFixed(2); return "$" + n.toFixed(4); };

function Spark({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 10) return null;
  const s = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 40)) === 0);
  const mn = Math.min(...s), mx = Math.max(...s), rg = mx - mn || 1;
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * 100},${32 - ((v - mn) / rg) * 32}`).join(" ");
  return <svg width={90} height={28} viewBox="0 0 100 32"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export default function CryptoClient({ coins, global, fg, trending, defi }: any) {
  const fgVal = fg?.current?.value ?? 50;
  const fgLbl = fg?.current?.label ?? "Neutral";

  return (
    <MarketPageLayout title="Crypto &" titleAccent="Digital Assets" accentColor="#B8860B" subtitle="Live prices, charts, sentiment, and trending coins. Data from CoinGecko, Alternative.me & Yahoo Finance.">

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Total Market Cap" value={global ? fP(global.totalMcap) : "—"} change={global?.mcapChg} color="#B8860B" />
        <KPICard label="24h Volume" value={global ? fP(global.vol24h) : "—"} color="#B8860B" />
        <KPICard label="BTC Dominance" value={global?.btcDom ? global.btcDom.toFixed(1) + "%" : "—"} color="#B8860B" subtitle="Bitcoin market share" />
        <KPICard label="Fear & Greed" value={fgVal.toString()} color={fgVal <= 25 ? "#f87171" : fgVal <= 45 ? "#FBBF24" : fgVal <= 55 ? "#B8860B" : "#34d399"} subtitle={fgLbl} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12, marginBottom: 24 }}>
        <TVChart symbol="BTC-USD" title="Bitcoin / USD" type="candlestick" range="3mo" color="#B8860B" />
        <TVChart symbol="ETH-USD" title="Ethereum / USD" type="candlestick" range="3mo" color="#3B6CB4" />
        <TVChart symbol="SOL-USD" title="Solana / USD" type="area" range="3mo" color="#9945FF" />
        <TVChart symbol="XRP-USD" title="XRP / USD" type="area" range="3mo" color="#2D8F5E" />
      </div>

      {/* Coin Cards */}
      {coins && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
          {coins.map((c: any) => {
            const sp = c.sparkline_in_7d?.price || [];
            const up = c.price_change_percentage_24h > 0;
            const col = up ? "#34d399" : "#f87171";
            return (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 14px", borderRadius: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {c.image && <img src={c.image} alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />}
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", display: "block", lineHeight: 1.1 }}>{c.symbol?.toUpperCase()}</span>
                      <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.35)" }}>{c.name}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, color: col }}>{up ? "+" : ""}{c.price_change_percentage_24h?.toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>{fP(c.current_price)}</span>
                  <Spark data={sp} color={col} />
                </div>
                <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.35)" }}>MCap {fP(c.market_cap)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Fear & Greed + DeFi TVL row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 24 }}>
        {/* Fear & Greed */}
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
        {/* DeFi TVL */}
        {defi?.chart && (
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#5B4FA0", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Total DeFi TVL</div>
            {defi.current && <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>${(defi.current / 1e9).toFixed(1)}B</div>}
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={defi.chart}><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2} /><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="date" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => "$" + v + "B"} /><Tooltip contentStyle={tip} /><Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#dg)" /></AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Trending */}
      {trending && (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 6, marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.15em", color: "#B8860B", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Trending on CoinGecko</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 6 }}>
            {trending.map((t: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#fff" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "rgba(255,255,255,0.35)", width: 14 }}>{i + 1}</span>
                  {t.thumb && <img src={t.thumb} alt="" style={{ width: 16, height: 16, borderRadius: "50%" }} />}
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
