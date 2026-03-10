"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface VerticalCardProps {
  title: string; subtitle: string; shortLabel: string;
  tags: string[]; color: string; href: string; index: number;
}

export default function InteractiveVerticalCard({ title, subtitle, shortLabel, tags, color, href, index }: VerticalCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: index * 0.08 }}>
      <Link href={href} className="block">
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          className="relative overflow-hidden rounded-xl p-5 cursor-pointer"
          style={{
            background: hovered ? "#181b22" : "#12141a",
            border: `1px solid ${hovered ? color + "44" : "#1e2028"}`,
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "translateY(-3px)" : "translateY(0)",
            boxShadow: hovered ? `0 8px 32px ${color}15, 0 0 0 1px ${color}22` : "none",
          }}>
          <div className="absolute pointer-events-none rounded-full" style={{ top: -40, right: -40, width: 100, height: 100, background: `radial-gradient(circle, ${color}${hovered ? "20" : "00"} 0%, transparent 70%)`, transition: "all 0.4s ease" }} />
          <div className="font-mono text-xs font-bold mb-2 tracking-wider" style={{ color, transition: "transform 0.3s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }}>{shortLabel}</div>
          <div className="font-mono text-sm font-semibold text-[#e8e6e3] mb-1">{title}</div>
          <div className="font-mono text-xs text-[#8a8d96] mb-3">{subtitle}</div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="font-mono text-[0.6rem] px-2 py-0.5 rounded" style={{ background: hovered ? `${color}18` : "rgba(255,255,255,0.04)", color: hovered ? color : "#8a8d96", transition: "all 0.25s ease" }}>{tag}</span>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, width: hovered ? "100%" : "0%", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
      </Link>
    </motion.div>
  );
}
