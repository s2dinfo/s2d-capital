---
type: schema
title: Chip-World Wiki — Schema
tags: [chip-world, meta]
---

# Chip-World Wiki — schema & conventions

The **content brain** for the S2D chip-world game (`/terrain`). Follows the LLM-Wiki pattern (Karpathy): **raw sources → this LLM-maintained wiki → the game derives from it.** *You read it (open this folder as an Obsidian vault); the LLM writes it.*

## Structure
- **[[Home]]** — the supply-chain spine + index of every node.
- **Entity pages (9)** — one per chip-world node: [[Nvidia]] · [[TSMC]] · [[ASML]] · [[Copper]] · [[Power]] · [[OpenAI]] · [[Microsoft]] · [[Oil]] · [[RareEarth]]. Each = role in the chain, key facts, the person, sources.
- The `[[Entity]]` cross-links **are** the supply chain — open Obsidian's **graph view** to see it draw itself.

## Frontmatter convention (so the game can read these files)
```yaml
type: entity
node: Nvidia            # matches the FIELD/FIGURES key in lib/figures.ts
person: Jensen Huang
role: Founder & CEO, Nvidia
commodity: GPUs / AI compute
locale: Santa Clara, USA
accent: "#1affa0"       # the node's theme colour in the game
status: stub | draft | solid
```

## Operations (Karpathy's ingest / query / lint)
- **Ingest** — drop a link/article under an entity's `## Sources`; the LLM reads it and updates that page **plus any it cross-references** (relationships, facts). *Summarizing a raw source = grunt work → route to local Ornith (`scripts/ornith.mjs`); Opus curates + writes the synthesis.*
- **Query** — ask a question against the wiki; a good answer becomes a new note, so knowledge compounds.
- **Lint** — periodic health check: contradictions, stale claims, orphan pages, missing sources. (This is the fix for the stale-fact problem.)

## How the game uses it (the payoff)
Today the codex facts / "DID YOU KNOW" cards / encounters are hand-coded in `lib/figures.ts`. The goal: **generate them from these pages' `## Key facts` + relationships**, so the game's content *compounds* every time a source is ingested instead of being frozen. Keep each entity's `node` + `accent` in frontmatter matching `lib/figures.ts` so a generator can map them 1:1.
