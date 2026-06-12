"use client";

import { useEffect, useState } from "react";

interface ThesisTrackerProps {
  publishDate: string;
  metrics: {
    label: string;
    publishValue: string;
    symbol: string;
    format?: "price" | "percent" | "number";
  }[];
}

function formatValue(raw: number, format: "price" | "percent" | "number"): string {
  if (format === "price") {
    if (raw >= 10000) return `$${raw.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (raw >= 100) return `$${raw.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return `$${raw.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (format === "percent") {
    return `${raw.toFixed(2)}%`;
  }
  // number
  if (raw >= 1000) return raw.toLocaleString("en-US", { maximumFractionDigits: 1 });
  return raw.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

function parsePublishValue(str: string): number {
  return parseFloat(str.replace(/[$,%]/g, "").replace(/,/g, ""));
}

export default function ThesisTracker({ publishDate, metrics }: ThesisTrackerProps) {
  const [currentValues, setCurrentValues] = useState<Record<string, number | null>>({});
  // Baseline derived from the actual market close on the publish date — the
  // hand-written publishValue is only a fallback when the API has no data.
  const [baseValues, setBaseValues] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      const results: Record<string, number | null> = {};
      const bases: Record<string, number | null> = {};

      const pubMs = Date.parse(publishDate);
      const pubSec = isNaN(pubMs) ? null : pubMs / 1000;
      const daysSince = pubSec ? (Date.now() / 1000 - pubSec) / 86400 : 0;
      const range = daysSince < 80 ? '3mo' : daysSince < 170 ? '6mo' : daysSince < 360 ? '1y' : daysSince < 720 ? '2y' : '5y';

      await Promise.all(
        metrics.map(async (m) => {
          try {
            const res = await fetch(
              `/api/chart-data?symbol=${encodeURIComponent(m.symbol)}&range=${range}&interval=1d`
            );
            if (!res.ok) { results[m.symbol] = null; bases[m.symbol] = null; return; }
            const json = await res.json();
            const result = json?.chart?.result?.[0];
            const ts: number[] = result?.timestamp ?? [];
            const closes = result?.indicators?.quote?.[0]?.close;
            if (!closes || closes.length === 0) { results[m.symbol] = null; bases[m.symbol] = null; return; }
            // Baseline: first valid close on/after the publish date
            bases[m.symbol] = null;
            if (pubSec) {
              for (let i = 0; i < ts.length; i++) {
                if (ts[i] >= pubSec && closes[i] != null) { bases[m.symbol] = closes[i]; break; }
              }
            }
            // Current: last valid close
            results[m.symbol] = null;
            for (let i = closes.length - 1; i >= 0; i--) {
              if (closes[i] != null) { results[m.symbol] = closes[i]; break; }
            }
          } catch {
            results[m.symbol] = null;
            bases[m.symbol] = null;
          }
        })
      );

      if (mounted) {
        setCurrentValues(results);
        setBaseValues(bases);
        setLoading(false);
      }
    }

    fetchAll();
    return () => { mounted = false; };
  }, [metrics, publishDate]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderTop: "2px solid #D4AF37",
        borderRadius: "0 0 8px 8px",
        padding: "16px 20px",
        marginBottom: "32px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#D4AF37",
            textTransform: "uppercase",
          }}
        >
          Thesis Tracker
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          · Since publication ({publishDate})
        </span>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {metrics.map((m) => {
          const current = currentValues[m.symbol];
          const marketBase = baseValues[m.symbol];
          const pubNum = marketBase ?? parsePublishValue(m.publishValue);
          const fmt = m.format || "number";
          const isUp = current != null ? current >= pubNum : null;

          return (
            <div
              key={m.symbol}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "8px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {marketBase != null ? formatValue(marketBase, fmt) : m.publishValue}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  →
                </span>
                {loading ? (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ...
                  </span>
                ) : current != null ? (
                  <>
                    <span
                      style={{
                        fontSize: "10px",
                        color: isUp ? "#22c55e" : "#ef4444",
                        lineHeight: 1,
                      }}
                    >
                      {isUp ? "▲" : "▼"}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {formatValue(current, fmt)}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    N/A
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
