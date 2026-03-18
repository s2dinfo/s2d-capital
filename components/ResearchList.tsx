"use client";

import Link from "next/link";

const articles = [
  {
    slug: "clarity-act",
    title: "The CLARITY Act",
    subtitle: "How US regulation ushers in the next era of institutional crypto adoption",
    date: "March 2026",
    author: "Sami Samii",
    sector: "Crypto & Regulation",
    readTime: "15 min",
    featured: true,
  },
];

export default function ResearchList() {
  return (
    <main style={{ minHeight: "80vh" }}>
      <div style={{ textAlign: "center", padding: "72px 24px 48px", background: "linear-gradient(180deg, var(--gold-tint, #faf6ee) 0%, var(--bg-primary, #fff) 100%)", borderBottom: "1px solid var(--border, #E8E6E0)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold, #b8860b)", marginBottom: 16 }}>S2D Capital Insights</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "var(--navy, #0f0f23)", marginBottom: 14 }}>Research & <em style={{ fontStyle: "italic", color: "var(--gold, #b8860b)" }}>Analysis</em></h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary, #6B6B82)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7, fontWeight: 300 }}>In-depth briefings across crypto regulation, macro policy, commodities, FX, and geopolitics.</p>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        {articles.map((a) => (
          <Link key={a.slug} href={`/research/${a.slug}`} style={{ textDecoration: "none", display: "block" }}>
            <div style={{ border: "1px solid var(--border, #E8E6E0)", borderRadius: 8, padding: "28px 32px", marginBottom: 20, transition: "border-color 0.3s, box-shadow 0.3s", cursor: "pointer", position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-wash)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border, #E8E6E0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              {a.featured && <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "var(--gold, #b8860b)" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold, #b8860b)", background: "var(--gold-tint, #faf6ee)", padding: "3px 8px", borderRadius: 3 }}>{a.sector}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--text-muted, #9C9CAF)" }}>{a.date} · {a.readTime}</span>
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 400, color: "var(--navy, #0f0f23)", marginBottom: 8 }}>{a.title}</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary, #6B6B82)", lineHeight: 1.6, marginBottom: 12 }}>{a.subtitle}</p>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--text-muted, #9C9CAF)" }}>By {a.author}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
