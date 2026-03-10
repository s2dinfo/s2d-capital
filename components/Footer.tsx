// components/Footer.tsx
"use client";

import Link from "next/link";

export default function Footer({ lang = "de" }: { lang?: string }) {
  const t = (de: string, en: string) => (lang === "de" ? de : en);

  return (
    <footer
      style={{
        padding: "48px 48px 32px",
        background: "var(--navy, #0f0f23)",
        color: "rgba(255,255,255,0.65)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: "var(--serif, 'Playfair Display', serif)",
              fontSize: "1.1rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 10,
            }}
          >
            <span style={{ color: "var(--gold-light, #d4a843)" }}>S2D</span> Capital Insights
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.35)",
              maxWidth: 260,
              lineHeight: 1.6,
            }}
          >
            {t(
              "Finanzielle Intelligenz über Krypto, Makro, Rohstoffe, Devisen und Geopolitik.",
              "Financial intelligence across crypto, macro, commodities, FX, and geopolitics."
            )}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div>
            <h4
              style={{
                fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold-light, #d4a843)",
                marginBottom: 12,
              }}
            >
              {t("Verticals", "Verticals")}
            </h4>
            {[
              "Crypto & Digital Assets",
              "Macro & Central Banks",
              "Commodities & Energy",
              "FX & Currencies",
              "Geopolitics & Policy",
              "Market Structure",
            ].map((v) => (
              <div
                key={v}
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 8,
                }}
              >
                {v}
              </div>
            ))}
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold-light, #d4a843)",
                marginBottom: 12,
              }}
            >
              {t("Plattform", "Platform")}
            </h4>
            {[
              { label: "Dashboard", href: "/" },
              { label: "Research", href: "/research" },
              { label: "Newsletter", href: "#newsletter" },
              { label: t("Kontakt", "Contact"), href: "mailto:sami@s2d.info" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  marginBottom: 8,
                  transition: "color 0.3s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.25)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span>© {new Date().getFullYear()} S2D Capital Insights. {t("Alle Rechte vorbehalten.", "All rights reserved.")}</span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="https://x.com/s2dcapital" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.3s" }}>𝕏</a>
          <a href="https://linkedin.com" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.3s" }}>LinkedIn</a>
          <a href="mailto:sami@s2d.info" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.3s" }}>Email</a>
        </div>
      </div>
    </footer>
  );
}
