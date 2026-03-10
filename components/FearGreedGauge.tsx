"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

interface FearGreedGaugeProps { value?: number; label?: string; }

export default function FearGreedGauge({ value = 50, label = "Neutral" }: FearGreedGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const spring = useSpring(0, { stiffness: 30, damping: 15 });
  const rotation = useTransform(spring, [0, 100], [-135, 135]);
  const displayVal = useTransform(spring, (v: number) => Math.round(v));

  useEffect(() => { if (isInView) spring.set(value); }, [isInView, value, spring]);

  const color = value <= 25 ? "#ef4444" : value <= 45 ? "#fb923c" : value <= 55 ? "#facc15" : value <= 75 ? "#22c55e" : "#22d3ee";

  return (
    <motion.div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 180, height: 110 }}>
        <svg width="180" height="110" viewBox="0 0 180 110" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="fgGaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="fgGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path d="M 15 100 A 75 75 0 0 1 165 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 15 100 A 75 75 0 0 1 165 100" fill="none" stroke="url(#fgGaugeGrad)" strokeWidth="8" strokeLinecap="round" filter="url(#fgGlow)" opacity="0.8" />
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (-135 + (tick / 100) * 270) * (Math.PI / 180);
            return (<line key={tick} x1={90 + 80 * Math.cos(angle)} y1={100 + 80 * Math.sin(angle)} x2={90 + 86 * Math.cos(angle)} y2={100 + 86 * Math.sin(angle)} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />);
          })}
        </svg>
        <motion.div className="absolute" style={{ bottom: 10, left: "50%", width: 2, height: 58, background: "linear-gradient(to top, #e8e6e3, transparent)", transformOrigin: "bottom center", rotate: rotation, marginLeft: -1, borderRadius: 1, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))" }} />
        <div className="absolute rounded-full" style={{ bottom: 5, left: "50%", width: 10, height: 10, background: "#e8e6e3", transform: "translateX(-50%)", boxShadow: "0 0 8px rgba(255,255,255,0.3)" }} />
      </div>
      <div className="text-center -mt-1">
        <motion.div className="font-mono text-2xl font-bold" style={{ color }}>{displayVal}</motion.div>
        <div className="font-mono text-[0.65rem] uppercase tracking-widest" style={{ color }}>{label}</div>
      </div>
    </motion.div>
  );
}
