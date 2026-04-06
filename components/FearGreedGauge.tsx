"use client";
import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

interface Props {
  value?: number;
  label?: string;
}

export default function FearGreedGauge({ value = 50, label = "Neutral" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const spring = useSpring(0, { stiffness: 30, damping: 15 });
  const rotation = useTransform(spring, [0, 100], [-135, 135]);
  const displayVal = useTransform(spring, (v: number) => Math.round(v));

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  const color =
    value <= 25
      ? "#C0392B"
      : value <= 45
        ? "#E88A3C"
        : value <= 55
          ? "#B8860B"
          : value <= 75
            ? "#2D8F5E"
            : "#1A8A7A";

  // Arc geometry
  const cx = 90;
  const cy = 105;
  const r = 75;
  const startAngle = -225; // degrees (maps to left side)
  const endAngle = 45; // degrees (maps to right side)
  const sweep = endAngle - startAngle; // 270 degrees

  // Helper: angle in degrees to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Helper: get x,y on arc for a given 0-100 value
  const posOnArc = (pct: number, radius: number) => {
    const angle = startAngle + (pct / 100) * sweep;
    const rad = toRad(angle);
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  // Tick marks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100];

  // Labels along the arc
  const labels: { pct: number; text: string }[] = [
    { pct: 5, text: "Extreme" },
    { pct: 10, text: "Fear" },
    { pct: 28, text: "Fear" },
    { pct: 50, text: "Neutral" },
    { pct: 72, text: "Greed" },
    { pct: 90, text: "Extreme" },
    { pct: 95, text: "Greed" },
  ];

  return (
    <motion.div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div style={{ position: "relative", width: 180, height: 110 }}>
        <svg
          width="180"
          height="110"
          viewBox="0 0 180 120"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Main arc gradient */}
            <linearGradient id="fgGaugeGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B83230" />
              <stop offset="20%" stopColor="#D4603A" />
              <stop offset="40%" stopColor="#E88A3C" />
              <stop offset="50%" stopColor="#C9A832" />
              <stop offset="65%" stopColor="#3DA06A" />
              <stop offset="85%" stopColor="#1E9E8A" />
              <stop offset="100%" stopColor="#148577" />
            </linearGradient>

            {/* Glow filter for the needle */}
            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for the center pivot */}
            <radialGradient id="pivotGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#d0d0e0" />
              <stop offset="100%" stopColor="#8888a0" />
            </radialGradient>

            {/* Subtle shadow for needle */}
            <filter id="needleShadow" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(255,255,255,0.3)" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={`M ${posOnArc(0, r).x} ${posOnArc(0, r).y} A ${r} ${r} 0 1 1 ${posOnArc(100, r).x} ${posOnArc(100, r).y}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d={`M ${posOnArc(0, r).x} ${posOnArc(0, r).y} A ${r} ${r} 0 1 1 ${posOnArc(100, r).x} ${posOnArc(100, r).y}`}
            fill="none"
            stroke="url(#fgGaugeGrad2)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const inner = posOnArc(tick, r - 9);
            const outer = posOnArc(tick, r + 9);
            return (
              <line
                key={tick}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(180,180,200,0.45)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Text labels along the arc */}
          {labels.map((l, i) => {
            const pos = posOnArc(l.pct, r + 22);
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(160,160,180,0.7)"
                fontSize="6.5"
                fontFamily="var(--font-mono)"
                fontWeight="500"
                letterSpacing="0.03em"
              >
                {l.text}
              </text>
            );
          })}
        </svg>

        {/* Needle with glow */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 15,
            left: "50%",
            width: 2.5,
            height: 56,
            background:
              "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.15) 85%, transparent)",
            transformOrigin: "bottom center",
            rotate: rotation,
            marginLeft: -1.25,
            borderRadius: 2,
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.25))",
          }}
        />

        {/* Center pivot - gradient dot */}
        <div
          style={{
            position: "absolute",
            bottom: 9,
            left: "50%",
            width: 12,
            height: 12,
            background: "radial-gradient(circle at 40% 35%, #ffffff, #c0c0d0 50%, #7878a0)",
            borderRadius: "50%",
            transform: "translateX(-50%)",
            boxShadow:
              "0 0 8px rgba(255,255,255,0.35), 0 0 3px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
          }}
        />
      </div>

      {/* Value and label below */}
      <div style={{ textAlign: "center", marginTop: -2 }}>
        <motion.div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color,
            lineHeight: 1.1,
          }}
        >
          {displayVal}
        </motion.div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            fontWeight: 600,
            marginTop: 2,
            opacity: 0.9,
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
}
