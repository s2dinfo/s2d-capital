// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S2D Capital Insights — Financial Intelligence",
  description:
    "In-depth research and real-time data across crypto, macro, commodities, FX, and geopolitics.",
  openGraph: {
    title: "S2D Capital Insights",
    description: "Financial intelligence across six verticals.",
    siteName: "S2D Capital Insights",
    url: "https://s2d.info",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "S2D Capital Insights",
    description: "Financial intelligence across crypto, macro, commodities, FX, and geopolitics.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
