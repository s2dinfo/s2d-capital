"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface ArticleProgressProps {
  sections: { id: string; title: string; number: string }[];
}

export default function ArticleProgress({ sections }: ArticleProgressProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const lastScrollUpdate = useRef(0);

  // Throttled scroll listener for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollUpdate.current < 50) return;
      lastScrollUpdate.current = now;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver to detect current section
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const abbreviate = (title: string) =>
    title.length > 22 ? title.slice(0, 20) + "\u2026" : title;

  return (
    <>
      {/* Reading progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: "3px",
          background:
            "linear-gradient(90deg, var(--gold, #B8860B), var(--gold-light, #D4B85C))",
          zIndex: 999,
          transition: "width 0.15s linear",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Floating Table of Contents — desktop only */}
      <nav
        style={{
          position: "fixed",
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "200px",
          background: "rgba(15,15,35,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(184,134,11,0.15)",
          borderRadius: "10px",
          padding: "14px 16px",
          zIndex: 998,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
        className="article-progress-toc"
        aria-label="Table of contents"
      >
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                lineHeight: 1.45,
                color: isActive
                  ? "var(--gold, #B8860B)"
                  : "rgba(255,255,255,0.35)",
                transition: "color 0.25s ease",
                display: "flex",
                gap: "6px",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  opacity: isActive ? 1 : 0.6,
                  fontWeight: isActive ? 700 : 400,
                  minWidth: "18px",
                  transition: "opacity 0.25s ease, font-weight 0.25s ease",
                }}
              >
                {s.number}
              </span>
              <span>{abbreviate(s.title)}</span>
            </button>
          );
        })}
      </nav>

      {/* Hide TOC on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          .article-progress-toc {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
