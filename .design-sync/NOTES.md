# design-sync notes — s2d-capital-insights

This repo is a **Next.js 14 app, not a component library** — there's no `dist/`,
no Storybook, no package `exports`. The sync runs in **synth-entry / package
shape** off the component `.tsx` source.

## Build invariants (how to reproduce)
- **Custom entry**: `.design-sync/pilot-entry.tsx` re-exports ONLY the
  standalone-clean components, passed via `--entry`. This is deliberate — the
  default synth entry would `export *` from every file in the source root and
  esbuild would choke on the 49 Next.js-coupled components (`next/link`,
  `next/navigation`, `@/lib/*`). To add a component to the sync, add it to BOTH
  `pilot-entry.tsx` and `componentSrcMap`.
- Build cmd: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry .design-sync/pilot-entry.tsx --out ./ds-bundle`
- `cssEntry` is **`styles/globals.css`** (the real dark-theme DS, 498 lines),
  NOT `app/globals.css` (a stale light-theme variant with different fonts —
  Outfit/Fira Code/Playfair — that triggers a false `[FONT_MISSING]`).

## Known render warns (triaged — not new)
- `[FONT_REMOTE]` for DM Sans / Cormorant Garamond / JetBrains Mono: the brand
  fonts load via a Google Fonts `@import` in `styles/globals.css`. They render
  at runtime in the claude.ai/design pane. Expected, non-blocking.

## Component-specific
- **AuroraShader**: raw-WebGL canvas. Headless Chromium (chromium-headless-shell)
  has **no WebGL**, so the capture shows the component's documented navy-fallback
  backdrop, not the animated aurora. It WILL animate in a real browser. The card
  is graded on the fallback (honest). Don't chase the missing animation.
- **CursorGlow**: interaction-only — a `position:fixed` cursor-follow glow that's
  invisible without mouse movement and can't be shown in a static card. Ships on
  the **floor card** by design. Authorable later only if a synthetic-pointer
  preview harness is worth it (probably not).
- **AnimatedNumber**: bare `<span>`; previews wrap it in dark stat tiles and pass
  `duration={1}` so the static capture shows the settled value, not a mid-tween.
- **KPICard**: semi-transparent dark glass — MUST be composed on a dark panel or
  it washes out to grey on the white card body.

## Re-sync risks (watch-list)
- The 4 components are app code with no type contract (`.d.ts` synthesized,
  weak). A refactor that adds `next/*` or `@/lib/*` imports to one of them will
  break its bundle — re-check after component edits.
- `pilot-entry.tsx` is hand-maintained; it won't auto-discover new components.
- This is a **pilot** (4 of ~53 components). Expanding scope means vetting each
  new component for standalone bundleability first.
