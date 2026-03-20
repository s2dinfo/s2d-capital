"use client";

import Link from "next/link";
import BackButton from "@/components/BackButton";
import { articles } from "@/lib/articles";

export default function ResearchList() {
  const published = articles.filter((a) => a.published);
  const upcoming = articles.filter((a) => !a.published);

  return (
    <main style={{ minHeight: "80vh" }}>
      <BackButton label="Home" href="/" />
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px 40px",
          background:
            "linear-gradient(180deg, var(--gold-tint, #faf6ee) 0%, var(--bg-primary, #fff) 100%)",
          borderBottom: "1px solid var(--border, #E8E6E0)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold, #b8860b)",
            marginBottom: 16,
          }}
        >
          S2D Capital Insights
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--navy, #0f0f23)",
            marginBottom: 14,
          }}
        >
          Research &{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold, #b8860b)" }}>
            Analysis
          </em>
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-secondary, #6B6B82)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          In-depth briefings across crypto regulation, macro policy,
          commodities, FX, and geopolitics.
        </p>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 40px" }}>
        {published.length > 0 && (
          <>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold, #b8860b)",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              Published Research
            </div>
            {published.map((a) => (
              <Link
                key={a.slug}
                href={`/research/${a.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    border: "1px solid var(--border, #E8E6E0)",
                    borderRadius: 8,
                    padding: "28px 32px",
                    marginBottom: 16,
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-wash)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border, #E8E6E0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {a.featured && (
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "var(--gold, #b8860b)" }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.tags.map((t) => (
                        <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold, #b8860b)", background: "var(--gold-tint, #faf6ee)", padding: "3px 8px", borderRadius: 3 }}>{t}</span>
                      ))}
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted, #9C9CAF)" }}>{a.date} · {a.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400, color: "var(--navy, #0f0f23)", marginBottom: 8 }}>{a.title}</h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary, #6B6B82)", lineHeight: 1.6, marginBottom: 12 }}>{a.excerpt}</p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gold, #b8860b)", fontWeight: 500 }}>Read Article →</span>
                </div>
              </Link>
            ))}
          </>
        )}
        {upcoming.length > 0 && (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted, #9C9CAF)", marginTop: 40, marginBottom: 16, fontWeight: 600 }}>Coming Soon</div>
            {upcoming.map((a) => (
              <div key={a.slug} style={{ border: "1px solid var(--border, #E8E6E0)", borderRadius: 8, padding: "24px 32px", marginBottom: 12, opacity: 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {a.tags.map((t) => (
                      <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted, #9C9CAF)", background: "var(--bg-section, #F7F5F0)", padding: "3px 8px", borderRadius: 3 }}>{t}</span>
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--gold, #b8860b)", background: "var(--gold-tint, #faf6ee)", padding: "3px 10px", borderRadius: 3, fontWeight: 600 }}>Coming Soon</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--navy, #0f0f23)", marginBottom: 6 }}>{a.title}</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #6B6B82)", lineHeight: 1.6 }}>{a.excerpt}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
