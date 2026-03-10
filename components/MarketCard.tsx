// components/MarketCard.tsx
"use client";

import { motion } from "framer-motion";

interface MarketCardProps {
  title: string;
  symbol: string;
  price: number | null;
  change: number | null;
  sparkline?: number[];
  icon?: string;
  sector?: string;
}

function MiniSparkline({
  data,
  color,
  width = 100,
  height = 32,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block", marginTop: 8 }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
    </svg>
  );
}

function formatPrice(price: number | null, symbol: string): string {
  if (price == null) return "—";
  if (["EURUSD", "GBPUSD", "USDCHF"].includes(symbol)) return price.toFixed(4);
  if (symbol === "USDJPY") return price.toFixed(2);
  if (["US10Y", "US2Y"].includes(symbol)) return price.toFixed(3) + "%";
  if (price >= 10000)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 100) return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return "$" + price.toFixed(2);
}

export default function MarketCard({
  title,
  symbol,
  price,
  change,
  sparkline = [],
  icon,
  sector,
}: MarketCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const changeColor = change == null ? "var(--text-muted, #9C9CAF)" : isPositive ? "#4ade80" : "#f87171";
  const changeBg = change == null ? "transparent" : isPositive ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "var(--bg-primary, #fff)",
        border: "1px solid var(--border, #E8E6E0)",
        borderRadius: 8,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        cursor: "default",
      }}
      whileHover={{
        borderColor: "var(--gold-wash, #d4a84333)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top row: icon + title + change badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
          <span
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted, #9C9CAF)",
            }}
          >
            {title}
          </span>
        </div>

        {/* % Change Badge — ALWAYS SHOWN */}
        <div
          style={{
            background: changeBg,
            borderRadius: 4,
            padding: "3px 8px",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: changeColor,
            }}
          >
            {change != null ? (
              <>
                {isPositive ? "▲" : "▼"}{" "}
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "var(--serif, 'Playfair Display', serif)",
          fontSize: "1.6rem",
          fontWeight: 500,
          color: "var(--navy, #0f0f23)",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        {formatPrice(price, symbol)}
      </div>

      {/* Sparkline */}
      {sparkline.length > 1 && (
        <MiniSparkline data={sparkline} color={changeColor} />
      )}

      {/* Sector tag */}
      {sector && (
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
            fontSize: "0.58rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "var(--gold, #b8860b)",
            opacity: 0.6,
          }}
        >
          {sector}
        </div>
      )}
    </motion.div>
  );
}
