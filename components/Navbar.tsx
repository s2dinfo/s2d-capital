// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  lang?: string;
  onLangToggle?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_ITEMS = [
  { key: "dashboard", labelDe: "Dashboard", labelEn: "Dashboard", href: "/" },
  { key: "research", labelDe: "Research", labelEn: "Research", href: "/research" },
  { key: "newsletter", labelDe: "Newsletter", labelEn: "Newsletter", href: "#newsletter" },
  { key: "about", labelDe: "Über uns", labelEn: "About", href: "#about" },
];

export default function Navbar({
  lang = "de",
  onLangToggle,
  activeTab = "dashboard",
  onTabChange,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = (de: string, en: string) => (lang === "de" ? de : en);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        background: "var(--bg-primary, #fff)",
        borderBottom: "1px solid var(--border, #E8E6E0)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(255,255,255,0.92)",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
        {/* If you have the logo image in /public/logo.png, use Image. Otherwise text fallback. */}
        <div
          style={{
            fontFamily: "var(--serif, 'Playfair Display', serif)",
            fontSize: "1.1rem",
            fontWeight: 500,
            color: "var(--navy, #0f0f23)",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: "var(--gold, #b8860b)", fontWeight: 600 }}>S2D</span>{" "}
          Capital Insights
        </div>
      </Link>

      {/* Desktop nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          const isLink = item.href.startsWith("/") && item.href !== "/";

          if (isLink) {
            return (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted, #9C9CAF)",
                  textDecoration: "none",
                  padding: "4px 0",
                  transition: "color 0.2s",
                }}
              >
                {t(item.labelDe, item.labelEn)}
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => onTabChange?.(item.key)}
              style={{
                fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--navy, #0f0f23)" : "var(--text-muted, #9C9CAF)",
                borderBottom: isActive ? "2px solid var(--gold, #b8860b)" : "2px solid transparent",
                padding: "4px 0",
                transition: "all 0.2s",
              }}
            >
              {t(item.labelDe, item.labelEn)}
            </button>
          );
        })}

        {/* Language toggle */}
        <button
          onClick={onLangToggle}
          style={{
            fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
            fontSize: "0.6rem",
            padding: "4px 10px",
            border: "1px solid var(--border, #E8E6E0)",
            borderRadius: 3,
            background: "transparent",
            color: "var(--text-muted, #9C9CAF)",
            cursor: "pointer",
            letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}
        >
          {lang === "de" ? "EN" : "DE"}
        </button>
      </div>
    </nav>
  );
}
