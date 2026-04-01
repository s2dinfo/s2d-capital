"use client";

import Link from "next/link";
import { articles } from "@/lib/articles";
import { VERTICALS, VerticalKey } from "@/lib/verticals";

interface RelatedArticlesProps {
  currentSlug: string;
  tags: string[];
}

export default function RelatedArticles({ currentSlug, tags }: RelatedArticlesProps) {
  // Filter out current article, keep only published
  const candidates = articles.filter((a) => a.slug !== currentSlug && a.published);

  // Score by shared tags
  const scored = candidates.map((a) => {
    const shared = a.tags.filter((t) => tags.includes(t)).length;
    return { article: a, score: shared };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top 3; if fewer than 3 with score > 0, pad with others
  const top = scored.slice(0, 3);

  // If we have fewer than 3 total candidates, just use what we have
  const related = top.map((s) => s.article);

  if (related.length === 0) return null;

  const getVerticalColor = (tag: VerticalKey): string => {
    return VERTICALS[tag]?.hex || "#B8860B";
  };

  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px 0" }}>
      {/* Section header */}
      <div
        style={{
          fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
          fontSize: "0.62rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--gold, #b8860b)",
          marginBottom: 24,
        }}
      >
        Continue Reading
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {related.map((a) => {
          const borderColor = getVerticalColor(a.tags[0]);
          return (
            <Link
              key={a.slug}
              href={`/research/${a.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: "0 6px 6px 0",
                  padding: "20px 20px",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderLeftColor = borderColor;
                  el.style.filter = "brightness(1.15)";
                  el.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderLeftColor = borderColor;
                  el.style.filter = "none";
                  el.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {/* Tag pills */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {a.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                        fontSize: "0.52rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: VERTICALS[t]?.hex || "var(--gold-light, #D4B85C)",
                        background: `${VERTICALS[t]?.hex || "#B8860B"}15`,
                        padding: "3px 8px",
                        borderRadius: 3,
                      }}
                    >
                      {VERTICALS[t]?.labelShort || t}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--serif, 'Playfair Display', serif)",
                    fontSize: "1rem",
                    fontWeight: 400,
                    color: "#ffffff",
                    margin: "0 0 8px",
                    lineHeight: 1.3,
                  }}
                >
                  {a.title}
                </h3>

                {/* Excerpt - 2 line clamp */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.55,
                    margin: "0 0 12px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    flex: 1,
                  }}
                >
                  {a.excerpt}
                </p>

                {/* Read time + link */}
                <div
                  style={{
                    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.35)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{a.readTime}</span>
                  <span style={{ color: "var(--gold-light, #D4B85C)" }}>Read →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
