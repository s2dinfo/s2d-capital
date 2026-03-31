"use client";
import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface KPICardProps {
  label: string;
  value: string;
  change?: number | null;
  subtitle?: string;
  color?: string;
  sparkline?: number[];
}

export default function KPICard({ label, value, change, subtitle, color = "#B8860B", sparkline }: KPICardProps) {
  const [h, setH] = useState(false);
  const hasChange = change !== null && change !== undefined;
  const isPos = (change ?? 0) >= 0;

  const sparkData = sparkline?.length ? sparkline.filter((_, i) => i % Math.max(1, Math.floor(sparkline.length / 20)) === 0).map((v, i) => ({ t: i, v })) : null;

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${h ? color + "33" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 6,
        padding: "16px 14px",
        transition: "all 0.3s ease",
        transform: h ? "translateY(-2px)" : "translateY(0)",
        boxShadow: h ? `0 8px 24px ${color}12` : "none",
        position: "relative",
        overflow: "hidden",
        minHeight: 100,
      }}
    >
      {/* Label */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", color, fontWeight: 500, textTransform: "uppercase" }}>{label}</span>
        {hasChange && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", fontWeight: 600, color: isPos ? "#34d399" : "#f87171" }}>
            {isPos ? "+" : ""}{change!.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: subtitle ? 2 : sparkData ? 6 : 0, lineHeight: 1.1 }}>
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", marginBottom: sparkData ? 6 : 0, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      )}

      {/* Sparkline */}
      {sparkData && (
        <div style={{ marginTop: "auto" }}>
          <ResponsiveContainer width="100%" height={36}>
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`kpi-${label.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#kpi-${label.replace(/\W/g, "")})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom accent line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, width: h ? "100%" : "0%", transition: "width 0.5s ease" }} />
    </div>
  );
}
