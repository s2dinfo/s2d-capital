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
          className="nav-hamburger"
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            gap: 5,
            width: 28,
            height: 28,
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

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15,15,35,0.98)",
            backdropFilter: "blur(8px)", zIndex: 200,
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Close button — top left */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              position: "absolute", top: 16, left: 16,
              background: "none", border: "none", cursor: "pointer",
              color: "var(--gold-light, #D4B85C)", fontSize: "1.5rem",
              width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 201,
            }}
          >
            ✕
          </button>

          <div style={{ paddingTop: 72, paddingBottom: 32 }}>
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
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
            <div style={{ padding: "20px 32px 8px", display: "flex", gap: 16 }}>
              <Link href="/impressum" onClick={() => setMobileOpen(false)} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                color: "rgba(255,255,255,0.3)", textDecoration: "none",
              }}>Impressum</Link>
              <Link href="/datenschutz" onClick={() => setMobileOpen(false)} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                color: "rgba(255,255,255,0.3)", textDecoration: "none",
              }}>Datenschutz</Link>
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
