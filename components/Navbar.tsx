"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  const links = [
    { label: "Research", href: "/research" },
    { label: "Markets", href: "/markets" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "About", href: "/about" },
  ];

  // Don't render navbar on homepage (it has its own hamburger menu)
  if (isHome) return null;

  return (
    <>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 60,
        background: "rgba(15,15,35,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(184,134,11,0.12)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--gold-light, #D4B85C)",
          }}>S2D</span>
          <span style={{
            fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
            fontSize: "0.85rem",
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
          }}>Capital Insights</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
          {links.map((l) => {
            const isActive = pathname.startsWith(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  color: isActive ? "var(--gold-light, #D4B85C)" : "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  padding: "4px 0",
                  borderBottom: isActive ? "1.5px solid var(--gold, #b8860b)" : "1.5px solid transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/newsletter" style={{
            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "8px 20px",
            background: "linear-gradient(135deg, var(--gold, #b8860b), var(--gold-dark, #8B6914))",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
            transition: "all 0.3s",
            boxShadow: "0 2px 12px rgba(184,134,11,0.2)",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(184,134,11,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(184,134,11,0.2)";
            }}
          >
            Subscribe
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="nav-hamburger"
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            gap: 5,
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span style={{
            display: "block", width: 20, height: 2, background: "var(--gold-light, #D4B85C)",
            borderRadius: 1, transition: "all 0.3s",
            transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none",
          }} />
          <span style={{
            display: "block", width: 20, height: 2, background: "var(--gold-light, #D4B85C)",
            borderRadius: 1, transition: "all 0.3s",
            opacity: mobileOpen ? 0 : 1,
          }} />
          <span style={{
            display: "block", width: 20, height: 2, background: "var(--gold-light, #D4B85C)",
            borderRadius: 1, transition: "all 0.3s",
            transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none",
          }} />
        </button>
      </nav>

      {/* Mobile menu — sits below the sticky nav so the hamburger/X stays clickable */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", top: 60, left: 0, right: 0, bottom: 0,
            background: "rgba(10,10,28,0.99)",
            zIndex: 99,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ paddingTop: 8, paddingBottom: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 48,
                  padding: "18px 32px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ padding: "16px 32px" }}>
              <Link href="/newsletter" onClick={() => setMobileOpen(false)} style={{
                display: "block", textAlign: "center",
                fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                padding: "12px 20px",
                background: "linear-gradient(135deg, var(--gold, #b8860b), var(--gold-dark, #8B6914))",
                color: "#fff", textDecoration: "none", borderRadius: 4,
              }}>Subscribe</Link>
            </div>
            <div style={{ padding: "8px 32px 8px", display: "flex", gap: 16 }}>
              <Link href="/impressum" onClick={() => setMobileOpen(false)} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                color: "rgba(255,255,255,0.3)", textDecoration: "none",
              }}>Impressum</Link>
              <Link href="/datenschutz" onClick={() => setMobileOpen(false)} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                color: "rgba(255,255,255,0.3)", textDecoration: "none",
              }}>Datenschutz</Link>
            </div>
            <div style={{ padding: "12px 32px 0" }}>
              <a href="https://x.com/s2dinfo" target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                color: "rgba(255,255,255,0.35)", textDecoration: "none",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @s2dinfo
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
