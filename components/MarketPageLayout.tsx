"use client";
import BackButton from "@/components/BackButton";

interface MarketPageLayoutProps {
  title: string;
  titleAccent: string;
  accentColor: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function MarketPageLayout({ title, titleAccent, accentColor, subtitle, children }: MarketPageLayoutProps) {
  return (
    <div style={{ minHeight: "80vh", overflowX: "hidden" }}>
      <BackButton label="All Markets" href="/markets" />
      <div style={{ padding: "28px 48px 64px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 5, height: 32, background: accentColor, borderRadius: 2 }} />
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 400, color: "#fff" }}>
          {title} <em style={{ fontStyle: "italic", color: accentColor }}>{titleAccent}</em>
        </h1>
      </div>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: 28, maxWidth: 600 }}>
        {subtitle}
      </p>
      {children}
      </div>
    </div>
  );
}
