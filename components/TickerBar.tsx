// components/TickerBar.tsx
"use client";

import { useEffect, useState, useRef } from "react";

interface TickerItem {
  key: string;
  label: string;
  price: number | null;
  change: number | null;
  sector: string;
  isSpecial?: boolean;
  specialLabel?: string;
}

const SECTOR_DIVIDER = "│";

function formatPrice(price: number | null, key: string): string {
  if (price == null) return "—";
  // FX pairs: 4 decimal places
  if (["EURUSD", "GBPUSD", "USDCHF"].includes(key)) return price.toFixed(4);
  // JPY pairs: 2
  if (key === "USDJPY") return price.toFixed(2);
  // Bonds: yield %
  if (["US10Y", "US2Y"].includes(key)) return price.toFixed(3) + "%";
  // VIX: 2 decimals
  if (key === "VIX") return price.toFixed(2);
  // Large numbers
  if (price >= 10000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 100) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function formatChange(change: number | null): string {
  if (change == null) return "";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function changeColor(change: number | null): string {
  if (change == null) return "rgba(255,255,255,0.35)";
  if (change > 0) return "#4ade80";
  if (change < 0) return "#f87171";
  return "rgba(255,255,255,0.5)";
}

export default function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/market-data");
        if (!res.ok) return;
        const data = await res.json();

        // Build ordered ticker items by sector
        const ordered: TickerItem[] = [];

        // Crypto
        ["BTC", "ETH", "SOL", "XRP"].forEach((k) => {
          if (data[k]) ordered.push({ key: k, label: k, ...data[k] });
        });

        // Separator + Commodities
        ["GOLD", "OIL", "SILVER"].forEach((k) => {
          if (data[k]) ordered.push({ key: k, label: data[k].label, ...data[k] });
        });

        // Separator + FX
        ["EURUSD", "GBPUSD", "USDJPY"].forEach((k) => {
          if (data[k]) ordered.push({ key: k, label: data[k].label, ...data[k] });
        });

        // Separator + Macro
        ["SPX", "NDX", "VIX"].forEach((k) => {
          if (data[k]) ordered.push({ key: k, label: data[k].label, ...data[k] });
        });

        // CLARITY Act special
        ordered.push({
          key: "CLARITY",
          label: "CLARITY Act",
          price: null,
          change: null,
          sector: "policy",
          isSpecial: true,
          specialLabel: "Senate — Pending",
        });

        setItems(ordered);
      } catch {
        // Silently fail, keep whatever we have
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  const renderItems = (copy: number) =>
    items.map((item, i) => {
      const prevSector = i > 0 ? items[i - 1]?.sector : (copy > 0 ? items[items.length - 1]?.sector : null);
      const showDivider = prevSector && prevSector !== item.sector && !item.isSpecial;

      return (
        <span
          key={`${item.key}-${copy}-${i}`}
          style={{ display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}
        >
          {showDivider && (
            <span style={{ color: "rgba(255,255,255,0.12)", marginRight: 8, fontSize: "0.8rem" }}>
              {SECTOR_DIVIDER}
            </span>
          )}
          {item.isSpecial ? (
            <>
              <span style={{ color: "var(--gold-light, #d4a843)", fontWeight: 600, letterSpacing: "0.02em" }}>{item.label}</span>
              <span style={{ color: "var(--gold, #b8860b)", opacity: 0.8 }}>{item.specialLabel}</span>
            </>
          ) : (
            <>
              <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 600, letterSpacing: "0.02em" }}>{item.label}</span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{item.key === "VIX" ? "" : "$"}{formatPrice(item.price, item.key)}</span>
              {item.change != null && (
                <span style={{ color: changeColor(item.change), fontWeight: 500 }}>{formatChange(item.change)}</span>
              )}
            </>
          )}
        </span>
      );
    });

  return (
    <div
      style={{
        background: "var(--navy, #0f0f23)",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 60, height: "100%", background: "linear-gradient(90deg, var(--navy, #0f0f23), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: "100%", background: "linear-gradient(-90deg, var(--navy, #0f0f23), transparent)", zIndex: 2, pointerEvents: "none" }} />

      <div ref={containerRef} className="ticker-track">
        <div className="ticker-set">{renderItems(0)}</div>
        <div className="ticker-set">{renderItems(1)}</div>
      </div>

      <style>{`
        .ticker-track {
          display: flex;
          width: max-content;
          font-family: var(--mono, 'JetBrains Mono', monospace);
          font-size: 0.7rem;
          animation: tickerScroll 50s linear infinite;
        }
        .ticker-set {
          display: flex;
          gap: 28px;
          padding-right: 28px;
          flex-shrink: 0;
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
