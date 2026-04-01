"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { articles } from "@/lib/articles";
import { VERTICALS, VerticalKey } from "@/lib/verticals";

const ALL_TAGS: VerticalKey[] = ["crypto", "macro", "commodities", "fx", "geopolitics", "structure"];

type SortOrder = "newest" | "oldest";

export default function ResearchList() {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<VerticalKey[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const toggleTag = (tag: VerticalKey) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return articles.filter((a) => {
      if (q && !a.title.toLowerCase().includes(q) && !a.excerpt.toLowerCase().includes(q)) return false;
      if (activeTags.length > 0 && !a.tags.some((t) => activeTags.includes(t))) return false;
      return true;
    });
  }, [search, activeTags]);

  const sorted = useMemo(() => {
    const dateOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const parseDate = (d: string) => {
      if (d === "Coming Soon") return sortOrder === "newest" ? -Infinity : Infinity;
      const parts = d.split(" ");
      const month = dateOrder.indexOf(parts[0]);
      const year = parseInt(parts[1] || "2026", 10);
      return year * 12 + month;
    };
    return [...filtered].sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [filtered, sortOrder]);

  const published = sorted.filter((a) => a.published);
  const upcoming = sorted.filter((a) => !a.published);
  const totalCount = articles.length;
  const filteredCount = filtered.length;
  const isFiltered = search.trim() !== "" || activeTags.length > 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy, #1A1A2E)", color: "#fff" }}>
      <BackButton label="Home" href="/" />

      {/* Hero section */}
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

      {/* Filters section */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 28,
          padding: "20px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
        }}>
          {/* Search + Sort row */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 36px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(184,134,11,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <span style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.3)",
                pointerEvents: "none",
              }}>
                &#x2315;
              </span>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{
                padding: "10px 14px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                paddingRight: 28,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              <option value="newest" style={{ background: "#1A1A2E" }}>Newest first</option>
              <option value="oldest" style={{ background: "#1A1A2E" }}>Oldest first</option>
            </select>
          </div>

          {/* Tag pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {ALL_TAGS.map((tag) => {
              const v = VERTICALS[tag];
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1px solid ${active ? v.hex : "rgba(255,255,255,0.12)"}`,
                    background: active ? `${v.hex}18` : "transparent",
                    color: active ? v.hex : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: active ? 600 : 400,
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = `${v.hex}80`;
                      e.currentTarget.style.color = v.hex;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  {v.labelShort}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "5px 10px",
                  borderRadius: 20,
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Article count */}
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.35)",
          }}>
            {isFiltered
              ? `${filteredCount} of ${totalCount} articles`
              : `${totalCount} articles`}
          </div>
        </div>
      </div>

      {/* Article cards */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
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
                        <span key={t} style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.52rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: VERTICALS[t]?.hex || "var(--gold-light, #D4B85C)",
                          background: `${VERTICALS[t]?.hex || "#B8860B"}15`,
                          padding: "3px 8px",
                          borderRadius: 3,
                        }}>{VERTICALS[t]?.labelShort || t}</span>
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
                      <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 3 }}>{VERTICALS[t]?.labelShort || t}</span>
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

        {published.length === 0 && upcoming.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 24px",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
          }}>
            No articles match your filters.
          </div>
        )}
      </div>
    </main>
  );
}
