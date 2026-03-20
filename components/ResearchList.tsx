"use client";

import Link from "next/link";
import BackButton from "@/components/BackButton";
import { articles } from "@/lib/articles";

export default function ResearchList() {
  const published = articles.filter((a) => a.published);
  const upcoming = articles.filter((a) => !a.published);

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy, #1A1A2E)", color: "#fff" }}>
      <BackButton label="Home" href="/" />
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(184,134,11,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.05) 1px,transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-light, #D4B85C)", marginBottom: 16 }}>
            S2D Capital Insights
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#fff", marginBottom: 14 }}>
            Research &{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold-light, #D4B85C)" }}>Analysis</em>
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            In-depth briefings across crypto regulation, macro policy, commodities, FX, and geopolitics.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 80px" }}>
        {published.length > 0 && (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-light, #D4B85C)", marginBottom: 16, fontWeight: 600 }}>
              Published Research
            </div>
            {published.map((a) => (
              <Link key={a.slug} href={`/research/${a.slug}`} style={{ textDecoration: "none", display: "block", color: "inherit" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: "28px 32px",
                    marginBottom: 16,
                    transition: "all 0.3s",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,134,11,0.3)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(184,134,11,0.04)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(184,134,11,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {a.featured && (
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "var(--gold, #b8860b)" }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.tags.map((t) => (
                        <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-light, #D4B85C)", background: "rgba(184,134,11,0.1)", padding: "3px 8px", borderRadius: 3 }}>{t}</span>
                      ))}
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>{a.date} · {a.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400, color: "#fff", marginBottom: 8 }}>{a.title}</h2>
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 12 }}>{a.excerpt}</p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gold-light, #D4B85C)", fontWeight: 500 }}>Read Article →</span>
                </div>
              </Link>
            ))}
          </>
        )}
        {upcoming.length > 0 && (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 40, marginBottom: 16, fontWeight: 600 }}>Coming Soon</div>
            {upcoming.map((a) => (
              <div key={a.slug} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: "24px 32px", marginBottom: 12, opacity: 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {a.tags.map((t) => (
                      <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 3 }}>{t}</span>
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--gold-light, #D4B85C)", background: "rgba(184,134,11,0.1)", padding: "3px 10px", borderRadius: 3, fontWeight: 600 }}>Coming Soon</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>{a.title}</h2>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{a.excerpt}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
