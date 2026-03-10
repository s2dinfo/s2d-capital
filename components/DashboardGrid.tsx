// components/DashboardGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MarketCard from "./MarketCard";

interface MarketData {
  [key: string]: {
    label: string;
    sector: string;
    price: number | null;
    change: number | null;
    sparkline: number[];
  };
}

const SECTOR_CONFIG: Record<string, { title: string; titleDe: string; keys: string[]; icons: Record<string, string> }> = {
  crypto: {
    title: "Crypto & Digital Assets",
    titleDe: "Krypto & Digitale Assets",
    keys: ["BTC", "ETH", "SOL", "XRP"],
    icons: { BTC: "₿", ETH: "Ξ", SOL: "◎", XRP: "✕" },
  },
  commodities: {
    title: "Commodities & Energy",
    titleDe: "Rohstoffe & Energie",
    keys: ["GOLD", "OIL", "SILVER", "NATGAS"],
    icons: { GOLD: "🥇", OIL: "🛢️", SILVER: "🥈", NATGAS: "⛽" },
  },
  fx: {
    title: "FX & Currencies",
    titleDe: "Devisen & Währungen",
    keys: ["EURUSD", "GBPUSD", "USDJPY", "USDCHF"],
    icons: { EURUSD: "€", GBPUSD: "£", USDJPY: "¥", USDCHF: "₣" },
  },
  macro: {
    title: "Macro & Indices",
    titleDe: "Makro & Indizes",
    keys: ["SPX", "NDX", "DJI", "VIX"],
    icons: { SPX: "📊", NDX: "💻", DJI: "🏛️", VIX: "📈" },
  },
};

export default function DashboardGrid({ lang = "de" }: { lang?: string }) {
  const [data, setData] = useState<MarketData>({});
  const [isLive, setIsLive] = useState(false);
  const [activeSector, setActiveSector] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/market-data");
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
        // Check if we have real data
        const hasData = Object.values(json).some((v: any) => v.price != null);
        setIsLive(hasData);
      } catch {
        // Silently fail
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  const t = (de: string, en: string) => (lang === "de" ? de : en);

  const sectorsToShow = activeSector
    ? { [activeSector]: SECTOR_CONFIG[activeSector] }
    : SECTOR_CONFIG;

  return (
    <div>
      {/* Sector filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setActiveSector(null)}
          style={{
            fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${!activeSector ? "var(--gold, #b8860b)" : "var(--border, #E8E6E0)"}`,
            background: !activeSector ? "var(--gold-tint, #faf6ee)" : "transparent",
            color: !activeSector ? "var(--gold, #b8860b)" : "var(--text-muted, #9C9CAF)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {t("Alle", "All")}
        </button>
        {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveSector(activeSector === key ? null : key)}
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 4,
              border: `1px solid ${activeSector === key ? "var(--gold, #b8860b)" : "var(--border, #E8E6E0)"}`,
              background: activeSector === key ? "var(--gold-tint, #faf6ee)" : "transparent",
              color: activeSector === key ? "var(--gold, #b8860b)" : "var(--text-muted, #9C9CAF)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t(cfg.titleDe, cfg.title)}
          </button>
        ))}
      </div>

      {/* Data status */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
          fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          color: "var(--text-muted, #9C9CAF)",
        }}
      >
        {isLive ? (
          <span>
            <span style={{ color: "#4ade80" }}>●</span> {t("Live-Daten", "Live Data")} ·{" "}
            {new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : (
          <span>{t("Lade Marktdaten...", "Loading market data...")}</span>
        )}
      </div>

      {/* Sector grids */}
      {Object.entries(sectorsToShow).map(([sectorKey, cfg]) => (
        <div key={sectorKey} style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: "0.58rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--gold, #b8860b)",
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: "1px solid var(--border, #E8E6E0)",
            }}
          >
            {t(cfg.titleDe, cfg.title)}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {cfg.keys.map((key, i) => {
              const item = data[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <MarketCard
                    title={item?.label ?? key}
                    symbol={key}
                    price={item?.price ?? null}
                    change={item?.change ?? null}
                    sparkline={item?.sparkline ?? []}
                    icon={cfg.icons[key]}
                    sector={sectorKey}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
