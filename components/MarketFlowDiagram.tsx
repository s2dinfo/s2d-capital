"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";

interface MarketFlowProps {
  data?: {
    fedRate?: string;
    dxy?: string;
    gold?: number;
    oil?: number;
    btc?: number;
    eurUsd?: string;
  };
}

/* ── node definitions ── */
const NODES = [
  { id: "fed",    label: "Fed Rate",  emoji: "🏛️", color: "#3B6CB4" },
  { id: "dxy",    label: "Dollar",    emoji: "💵", color: "#3B6CB4" },
  { id: "gold",   label: "Gold",      emoji: "🥇", color: "#8B5E3C" },
  { id: "oil",    label: "Oil",       emoji: "🛢️", color: "#8B5E3C" },
  { id: "eurusd", label: "EUR/USD",   emoji: "💱", color: "#2D8F5E" },
  { id: "btc",    label: "Bitcoin",   emoji: "₿",  color: "#B8860B" },
] as const;

type NodeId = (typeof NODES)[number]["id"];

/* ── edges ── */
const EDGES: { from: NodeId; to: NodeId; label?: string }[] = [
  { from: "fed",  to: "dxy" },
  { from: "dxy",  to: "gold" },
  { from: "dxy",  to: "oil" },
  { from: "dxy",  to: "eurusd" },
  { from: "gold", to: "btc" },
  { from: "oil",  to: "btc" },
];

/* ── grid positions (desktop col/row, mobile just vertical) ── */
const DESKTOP_POS: Record<NodeId, { col: number; row: number }> = {
  fed:    { col: 0, row: 1 },
  dxy:    { col: 1, row: 1 },
  gold:   { col: 2, row: 0 },
  oil:    { col: 2, row: 2 },
  eurusd: { col: 3, row: 1 },
  btc:    { col: 4, row: 1 },
};

const MOBILE_ORDER: NodeId[] = ["fed", "dxy", "gold", "oil", "eurusd", "btc"];

/* ── format helpers ── */
function fmt(id: NodeId, data?: MarketFlowProps["data"]): string {
  if (!data) return "\u2014";
  switch (id) {
    case "fed":    return data.fedRate ? `${data.fedRate}%` : "\u2014";
    case "dxy":    return data.dxy ?? "\u2014";
    case "gold":   return data.gold != null ? `$${data.gold.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "\u2014";
    case "oil":    return data.oil != null ? `$${data.oil.toFixed(2)}` : "\u2014";
    case "eurusd": return data.eurUsd != null ? Number(data.eurUsd).toFixed(4) : "\u2014";
    case "btc":    return data.btc != null ? `$${data.btc.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "\u2014";
  }
}

/* ── component ── */
export default function MarketFlowDiagram({ data }: MarketFlowProps) {
  const uid = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; from: NodeId; to: NodeId; label?: string }[]
  >([]);

  /* responsive */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* compute SVG line endpoints from node positions */
  const computeLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const next: typeof lines = [];
    for (const edge of EDGES) {
      const fromEl = nodeRefs.current[edge.from];
      const toEl = nodeRefs.current[edge.to];
      if (!fromEl || !toEl) continue;
      const fR = fromEl.getBoundingClientRect();
      const tR = toEl.getBoundingClientRect();
      next.push({
        x1: fR.left + fR.width / 2 - cRect.left,
        y1: fR.top + fR.height / 2 - cRect.top,
        x2: tR.left + tR.width / 2 - cRect.left,
        y2: tR.top + tR.height / 2 - cRect.top,
        from: edge.from,
        to: edge.to,
        label: edge.label,
      });
    }
    setLines(next);
  }, []);

  useEffect(() => {
    // initial + recompute on resize
    const raf = requestAnimationFrame(computeLines);
    window.addEventListener("resize", computeLines);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", computeLines);
    };
  }, [computeLines, isMobile]);

  /* recompute after layout settles */
  useEffect(() => {
    const t = setTimeout(computeLines, 100);
    return () => clearTimeout(t);
  }, [computeLines, isMobile, data]);

  /* which edges connect to hovered node */
  const isEdgeActive = (from: NodeId, to: NodeId) =>
    hoveredNode != null && (from === hoveredNode || to === hoveredNode);
  const isNodeActive = (id: NodeId) =>
    hoveredNode == null ||
    id === hoveredNode ||
    EDGES.some((e) => (e.from === hoveredNode && e.to === id) || (e.to === hoveredNode && e.from === id));

  return (
    <section style={{ padding: "48px 0 32px", position: "relative" }}>
      {/* eyebrow + title */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold-light, #D4B85C)",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          S2D Capital Insights
        </div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.3rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          How Markets Connect
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.35)",
            marginTop: 8,
            letterSpacing: "0.04em",
          }}
        >
          Fed rate decision &rarr; Dollar &rarr; Gold &amp; Oil &rarr; EM Currencies &rarr; Crypto allocation
        </p>
      </div>

      {/* flow diagram container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          maxWidth: 960,
          margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 24px",
        }}
      >
        {/* SVG overlay for lines */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <defs>
            <marker
              id={`${uid}-arrow`}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill="rgba(184,134,11,0.5)" />
            </marker>
            <marker
              id={`${uid}-arrow-active`}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill="rgba(184,134,11,0.9)" />
            </marker>
          </defs>
          {lines.map((ln, i) => {
            const active = isEdgeActive(ln.from, ln.to);
            const midX = (ln.x1 + ln.x2) / 2;
            const midY = (ln.y1 + ln.y2) / 2;
            return (
              <g key={i}>
                <line
                  x1={ln.x1}
                  y1={ln.y1}
                  x2={ln.x2}
                  y2={ln.y2}
                  stroke={active ? "rgba(184,134,11,0.8)" : "rgba(184,134,11,0.3)"}
                  strokeWidth={active ? 2 : 1.5}
                  strokeDasharray="6 4"
                  markerEnd={`url(#${uid}-arrow${active ? "-active" : ""})`}
                  style={{
                    transition: "stroke 0.3s, stroke-width 0.3s",
                    animation: "flowDash 1.5s linear infinite",
                    filter: active ? "drop-shadow(0 0 4px rgba(184,134,11,0.5))" : "none",
                  }}
                />
                {ln.label && (
                  <text
                    x={midX}
                    y={midY - 8}
                    textAnchor="middle"
                    fill={active ? "rgba(212,184,92,0.9)" : "rgba(255,255,255,0.2)"}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    style={{ transition: "fill 0.3s" }}
                  >
                    {ln.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Node grid */}
        <div
          style={
            isMobile
              ? {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                }
              : {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gridTemplateRows: "repeat(3, auto)",
                  gap: "24px 20px",
                  alignItems: "center",
                }
          }
        >
          {(isMobile ? MOBILE_ORDER : NODES.map((n) => n.id)).map((nodeId) => {
            const node = NODES.find((n) => n.id === nodeId)!;
            const pos = DESKTOP_POS[nodeId];
            const active = isNodeActive(nodeId);
            const isHovered = hoveredNode === nodeId;

            return (
              <div
                key={nodeId}
                ref={(el) => { nodeRefs.current[nodeId] = el; }}
                onMouseEnter={() => setHoveredNode(nodeId)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  ...(isMobile
                    ? { width: "100%", maxWidth: 280 }
                    : {
                        gridColumn: pos.col + 1,
                        gridRow: pos.row + 1,
                      }),
                  position: "relative",
                  zIndex: 2,
                  background: isHovered
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: 8,
                  borderLeft: `3px solid ${node.color}`,
                  border: `1px solid ${isHovered ? node.color + "55" : "rgba(255,255,255,0.06)"}`,
                  borderLeftWidth: 3,
                  borderLeftColor: node.color,
                  padding: "14px 16px",
                  cursor: "default",
                  transition: "all 0.3s ease",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  opacity: active ? 1 : 0.4,
                  boxShadow: isHovered
                    ? `0 8px 24px ${node.color}18`
                    : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: "1rem", lineHeight: 1 }}>{node.emoji}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.52rem",
                      letterSpacing: "0.1em",
                      color: node.color,
                      fontWeight: 500,
                      textTransform: "uppercase",
                    }}
                  >
                    {node.label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.1,
                  }}
                >
                  {fmt(nodeId, data)}
                </div>
                {/* accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    borderRadius: "0 0 0 8px",
                    background: `linear-gradient(90deg, ${node.color}, transparent)`,
                    width: isHovered ? "100%" : "0%",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* dash animation keyframes */}
      <style>{`
        @keyframes flowDash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </section>
  );
}
