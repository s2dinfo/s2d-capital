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
      <div className="mpl-content" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <style>{`.mpl-content{padding:28px 48px 64px}@media(max-width:768px){.mpl-content{padding:20px 16px 48px}}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: accentColor, borderRadius: 2 }} />
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 400, color: "#fff" }}>
          {title} <span style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontStyle: "italic", color: accentColor }}>{titleAccent}</span>
        </h1>
      </div>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", fontWeight: 300, marginBottom: 28, maxWidth: 600, lineHeight: 1.7 }}>
        {subtitle}
      </p>
      {children}
      </div>
    </div>
  );
}
