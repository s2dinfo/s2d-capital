# S2D Capital Insights — design system conventions

A **dark-theme** financial-intelligence UI. Components are React, styled with
**CSS custom properties + inline styles** — there is no utility-class framework
(no Tailwind) and no theme provider to wrap. The one hard rule: these components
are built for a **dark navy surface**, not a white page.

## Setup
No provider/wrapper is required — every component is self-contained. But render
them on a **dark background** (`--navy`, `#1A1A2E`). `KPICard` in particular is a
semi-transparent glass tile that washes out to grey on a light surface.

## Styling idiom — CSS variables (defined in `styles.css`)
Style with `var(--*)` and inline styles. The real token vocabulary:

**Color**
- `--gold` `#B8860B` (primary accent), `--gold-light` `#D4B85C`, `--gold-wash`, `--gold-tint`
- `--navy` `#1A1A2E` (page bg), `--navy-light` `#2D2D4A`, `--bg-section` `#171b30`
- `--text-h` `#fff`, `--text-body` `rgba(255,255,255,.75)`, `--text-sec` `rgba(255,255,255,.5)`, `--text-muted` `rgba(255,255,255,.35)`
- `--green` `#34d399` (up), `--red` `#f87171` (down)
- Vertical accents: `--v-crypto` `#B8860B`, `--v-macro` `#3B6CB4`, `--v-commodities` `#8B5E3C`, `--v-fx` `#2D8F5E`, `--v-geopolitics` `#8B2252`, `--v-structure` `#5B4FA0`
- Borders: `--border` `rgba(255,255,255,.1)`, `--border-lt` `rgba(255,255,255,.06)`

**Type**
- `--font-display` Space Grotesk (headings), `--font-sans` DM Sans (body),
  `--font-mono` JetBrains Mono (numbers/labels — use `font-variant-numeric: tabular-nums`),
  `--font-serif` Cormorant Garamond (editorial)

## Components in this library
- **KPICard** — a metric tile: gold uppercase label, large white mono value,
  optional `change` (±%, green/red) and `sparkline` (`number[]`). Compose on a
  dark panel. Props in `KPICard.d.ts`, usage in `KPICard.prompt.md`.
- **AnimatedNumber** — counts a preformatted value up on mount (`"$64,087"`,
  `"+4.49%"`, `"13 · Extreme Fear"`). A bare span — set the font/size/color on a
  wrapper. The data-panel "ticker" feel.
- **AuroraShader** — full-bleed WebGL aurora for hero backdrops; degrades to a
  navy backdrop where WebGL is absent. Place absolutely behind hero copy.
- **CursorGlow** — fixed, page-level gold cursor-follow glow. Mount once at the
  app root; purely ambient.

## Read before styling
`styles.css` (and its `@import` closure) is the source of truth for tokens and
fonts; each component's `.prompt.md` and `.d.ts` carry its API and usage.

## Idiomatic snippet
```tsx
<div style={{ background: 'var(--navy)', padding: 24, fontFamily: 'var(--font-sans)' }}>
  <KPICard
    label="BTC / USD" value="$64,087" change={4.49}
    subtitle="24h volume $38.2B" color="var(--gold)"
    sparkline={[63800, 64600, 64100, 65200, 64087]}
  />
</div>
```
