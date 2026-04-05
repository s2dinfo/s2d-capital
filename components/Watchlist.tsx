"use client";

import { useState, useEffect, useRef } from "react";

interface WatchlistProps {
  data?: Record<string, { label: string; value: string; color: string }>;
}

const STORAGE_KEY = "s2d-watchlist";
const MAX_ITEMS = 8;

const INDICATOR_GROUPS: { vertical: string; color: string; items: { key: string; label: string }[] }[] = [
  {
    vertical: "Crypto",
    color: "#f7931a",
    items: [
      { key: "BTC", label: "BTC" },
      { key: "ETH", label: "ETH" },
      { key: "SOL", label: "SOL" },
      { key: "XRP", label: "XRP" },
    ],
  },
  {
    vertical: "Macro",
    color: "#6366f1",
    items: [
      { key: "SPX", label: "S&P 500" },
      { key: "FEDR", label: "Fed Rate" },
      { key: "T10Y", label: "10Y Yield" },
      { key: "VIX", label: "VIX" },
    ],
  },
  {
    vertical: "Commodities",
    color: "#b8860b",
    items: [
      { key: "GOLD", label: "Gold" },
      { key: "OIL", label: "Oil (WTI)" },
      { key: "BRENT", label: "Brent Crude" },
      { key: "NATGAS", label: "Natural Gas" },
      { key: "SILVER", label: "Silver" },
    ],
  },
  {
    vertical: "FX",
    color: "#14b8a6",
    items: [
      { key: "EURUSD", label: "EUR/USD" },
      { key: "GBPUSD", label: "GBP/USD" },
      { key: "USDJPY", label: "USD/JPY" },
      { key: "DXY", label: "DXY" },
    ],
  },
];

function getColorForKey(key: string): string {
  for (const group of INDICATOR_GROUPS) {
    if (group.items.some((item) => item.key === key)) return group.color;
  }
  return "#888";
}

function getLabelForKey(key: string): string {
  for (const group of INDICATOR_GROUPS) {
    const found = group.items.find((item) => item.key === key);
    if (found) return found.label;
  }
  return key;
}

export default function Watchlist({ data }: WatchlistProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSelected(parsed.slice(0, MAX_ITEMS));
      }
    } catch {}
    setMounted(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected, mounted]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  function addIndicator(key: string) {
    if (selected.includes(key) || selected.length >= MAX_ITEMS) return;
    setSelected((prev) => [...prev, key]);
  }

  function removeIndicator(key: string) {
    setSelected((prev) => prev.filter((k) => k !== key));
  }

  if (!mounted) return null;

  const isEmpty = selected.length === 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: "14px 16px",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isEmpty ? 0 : 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
          }}
        >
          Your Watchlist
        </span>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: "0.52rem",
            letterSpacing: "0.08em",
            color: "#b8860b",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textTransform: "uppercase",
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          Customize
        </button>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 0 6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Add indicators to your watchlist
          </span>
          <button
            onClick={() => setDropdownOpen(true)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid rgba(184,134,11,0.4)",
              background: "none",
              color: "#b8860b",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(184,134,11,0.1)";
              e.currentTarget.style.borderColor = "rgba(184,134,11,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "rgba(184,134,11,0.4)";
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Cards row */}
      {!isEmpty && (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 2,
            scrollbarWidth: "none",
          }}
        >
          {selected.map((key) => {
            const entry = data?.[key];
            const color = entry?.color ?? getColorForKey(key);
            const label = entry?.label ?? getLabelForKey(key);
            const value = entry?.value ?? "\u2014";

            return <WatchlistCard key={key} label={label} value={value} color={color} onRemove={() => removeIndicator(key)} />;
          })}

          {/* Add button inline */}
          {selected.length < MAX_ITEMS && (
            <button
              onClick={() => setDropdownOpen(true)}
              style={{
                minWidth: 40,
                height: 58,
                borderRadius: 6,
                border: "1px dashed rgba(184,134,11,0.3)",
                background: "none",
                color: "#b8860b",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(184,134,11,0.06)";
                e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.borderColor = "rgba(184,134,11,0.3)";
              }}
            >
              +
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          style={{
            marginTop: 10,
            background: "rgba(15,15,25,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "12px 14px",
            backdropFilter: "blur(16px)",
          }}
        >
          {INDICATOR_GROUPS.map((group) => (
            <div key={group.vertical} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: group.color,
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                {group.vertical}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {group.items.map((item) => {
                  const isSelected = selected.includes(item.key);
                  const isFull = selected.length >= MAX_ITEMS;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        if (isSelected) removeIndicator(item.key);
                        else addIndicator(item.key);
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        fontSize: "0.58rem",
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: `1px solid ${isSelected ? group.color + "66" : "rgba(255,255,255,0.08)"}`,
                        background: isSelected ? group.color + "18" : "transparent",
                        color: isSelected ? group.color : "rgba(255,255,255,0.45)",
                        cursor: !isSelected && isFull ? "not-allowed" : "pointer",
                        opacity: !isSelected && isFull ? 0.35 : 1,
                        transition: "all 0.15s",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {isSelected ? "✓ " : ""}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {selected.length >= MAX_ITEMS && (
            <div
              style={{
                fontFamily: "var(--font-sans, sans-serif)",
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
                paddingTop: 4,
              }}
            >
              Maximum {MAX_ITEMS} indicators reached
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Mini card component ---------- */

function WatchlistCard({
  label,
  value,
  color,
  onRemove,
}: {
  label: string;
  value: string;
  color: string;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        minWidth: 84,
        maxWidth: 100,
        padding: "8px 10px",
        borderRadius: 6,
        border: `1px solid ${hovered ? color + "40" : "rgba(255,255,255,0.06)"}`,
        background: hovered ? color + "0a" : "rgba(255,255,255,0.02)",
        transition: "all 0.2s ease",
        flexShrink: 0,
        cursor: "default",
      }}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          position: "absolute",
          top: 3,
          right: 3,
          width: 16,
          height: 16,
          borderRadius: 3,
          border: "none",
          background: hovered ? "rgba(255,255,255,0.08)" : "transparent",
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.6rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: "0.5rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color,
          fontWeight: 600,
          marginBottom: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 1.5,
          borderRadius: "0 0 6px 6px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          width: hovered ? "100%" : "0%",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
