"use client";
import Link from "next/link";

interface CrossRefProps {
  items: { label: string; href: string; type: "research" | "market" }[];
}

export default function CrossRef({ items }: CrossRefProps) {
  return (
    <div style={{ marginTop: 32, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginBottom: 12, textTransform: "uppercase", fontWeight: 600 }}>
        Related
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.04em",
            padding: "8px 14px", borderRadius: 4, textDecoration: "none",
            background: item.type === "research" ? "rgba(184,134,11,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${item.type === "research" ? "rgba(184,134,11,0.2)" : "rgba(255,255,255,0.06)"}`,
            color: item.type === "research" ? "#D4B85C" : "rgba(255,255,255,0.5)",
            transition: "all 0.2s",
          }}>
            <span>{item.type === "research" ? "📝" : "📊"}</span>
            {item.label}
            <span style={{ opacity: 0.5 }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
