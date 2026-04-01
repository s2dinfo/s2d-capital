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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      const results: Record<string, number | null> = {};

      await Promise.all(
        metrics.map(async (m) => {
          try {
            const res = await fetch(
              `/api/chart-data?symbol=${encodeURIComponent(m.symbol)}&range=1mo&interval=1d`
            );
            if (!res.ok) { results[m.symbol] = null; return; }
            const json = await res.json();
            const result = json?.chart?.result?.[0];
            const quote = result?.indicators?.quote?.[0];
            const closes = quote?.close;
            if (!closes || closes.length === 0) { results[m.symbol] = null; return; }
            // Get the last valid close
            for (let i = closes.length - 1; i >= 0; i--) {
              if (closes[i] != null) { results[m.symbol] = closes[i]; return; }
            }
            results[m.symbol] = null;
          } catch {
            results[m.symbol] = null;
          }
        })
      );

      if (mounted) {
        setCurrentValues(results);
        setLoading(false);
      }
    }

    fetchAll();
    return () => { mounted = false; };
  }, [metrics]);

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
          const pubNum = parsePublishValue(m.publishValue);
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
                  {m.publishValue}
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
