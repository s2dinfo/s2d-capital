"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface ArticleProgressProps {
  sections: { id: string; title: string; number: string }[];
}

const GOLD = "#B8860B";
const GOLD_LIGHT = "#D4B85C";

// Journey-style chapter rail: the article's sections become numbered stops
// with done/active/upcoming states, like the globe journey timeline.
export default function ArticleProgress({ sections }: ArticleProgressProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [railVisible, setRailVisible] = useState(false);
  const lastScrollUpdate = useRef(0);
  const railRef = useRef<HTMLDivElement>(null);

  // Throttled scroll listener for reading progress + rail visibility
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollUpdate.current < 50) return;
      lastScrollUpdate.current = now;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
      setRailVisible(scrollTop > 480);
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
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  // Keep the active chapter visible inside the rail
  useEffect(() => {
    if (!railRef.current || !activeSection) return;
    const btn = railRef.current.querySelector(`[data-sec="${activeSection}"]`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSection]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90; // clear the rail
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const short = (t: string) => (t.length > 22 ? t.slice(0, 20).trimEnd() + "…" : t);

  return (
    <>
      {/* Reading progress bar */}
      <div
        style={{
          position: "fixed", top: 0, left: 0,
          width: `${progress}%`, height: "3px",
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
          zIndex: 999, transition: "width 0.15s linear", pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Chapter rail — appears once the reader is into the article */}
      <nav
        ref={railRef}
        aria-label="Article chapters"
        style={{
          position: "fixed", top: 3, left: 0, right: 0, zIndex: 90,
          display: "flex", gap: 4, alignItems: "stretch",
          padding: "0 16px",
          overflowX: "auto", scrollbarWidth: "none",
          background: "rgba(11,15,28,0.92)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(184,134,11,0.14)",
          transform: railVisible ? "translateY(0)" : "translateY(-110%)",
          opacity: railVisible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
        }}
      >
        <div style={{ display: "flex", gap: 4, margin: "0 auto" }}>
          {sections.map((s, i) => {
            const state = i === activeIdx ? "active" : activeIdx > -1 && i < activeIdx ? "done" : "todo";
            return (
              <button
                key={s.id}
                data-sec={s.id}
                onClick={() => scrollTo(s.id)}
                title={s.title}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "12px 12px", background: "none", border: "none",
                  borderBottom: state === "active" ? `2px solid ${GOLD_LIGHT}` : "2px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "all 0.25s",
                }}
              >
                <span
                  style={{
                    width: state === "active" ? 9 : 7, height: state === "active" ? 9 : 7,
                    borderRadius: "50%", flexShrink: 0,
                    background: state === "todo" ? "rgba(255,255,255,0.18)" : state === "active" ? GOLD_LIGHT : `${GOLD}B3`,
                    boxShadow: state === "active" ? `0 0 10px ${GOLD_LIGHT}99` : "none",
                    transition: "all 0.25s",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.07em",
                    fontWeight: state === "active" ? 700 : 400,
                    color: state === "active" ? GOLD_LIGHT : `rgba(255,255,255,${state === "done" ? 0.55 : 0.32})`,
                    transition: "color 0.25s",
                  }}
                >
                  {s.number.padStart(2, "0")} {short(s.title).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
