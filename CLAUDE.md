# S2D chip-world game — working notes

This repo's flagship is the **`/terrain` procedural walkable world** (`components/ProceduralTerrain.tsx`) — a 3D globe you click to zoom into and land in as a real character. Work happens on the **`chip-world-game`** branch; never merge to `main` (that auto-deploys to Vercel) and never deploy without the user asking. Full project state lives in memory (`s2d-game-master-plan`).

---

# 🔀 MODEL ROUTING LAYER — Opus vs local Ornith

A local model (**Ornith-1.0-9B**, runs free on this Mac via Ollama) handles cheap grunt work so Claude/Opus tokens go to the hard stuff. **Mechanism:** `node scripts/ornith.mjs [--fast] [--raw] "<prompt>"` (stdin is appended; `--fast` skips its `<think>` reasoning for speed; needs `brew services start ollama`).

**The principle: Ornith DRAFTS, Opus DECIDES + VERIFIES.** Nothing Ornith writes lands unread.

### ✅ Delegate to Ornith — mechanical · well-specified · verifiable-at-a-glance · low blast-radius
- Draft a commit message / changelog entry from a diff (`git diff | node scripts/ornith.mjs --fast "commit message:"`)
- Summarize a file / log / diff; explain what a function does
- Write docstrings / comments from existing code
- Generate test data, fixtures, simple boilerplate from a clear spec
- Mechanical transforms: rename, reformat, convert a data shape
- First-draft a single, well-specified utility function (then verify)

### 🧠 Keep in Opus (me) — judgment · load-bearing · multi-step
- Architecture & design decisions
- Debugging non-trivial bugs (the Bloom-NaN / invisible-car class)
- Anything touching the live game's correctness or the core loop (globe→zoom→land, the world)
- Multi-file refactors or reasoning across the codebase
- **Verifying + integrating anything Ornith produced — ALWAYS**

### Rules
1. **Ornith drafts, Opus verifies.** Never commit Ornith output unread.
2. **Default to Opus when unsure** — a wrong delegation costs more in rework than it saves.
3. Ornith is a slow reasoning model on a **fanless Air** → use `--fast` for quick tasks, batch grunt work, and **don't run it while rendering the 3D scene** (heat).
4. If Ornith's draft is wrong or it loops, just do it in Opus — don't fight it.
5. This is a 2-week bridge until the Mac mini runs it 24/7; the rubric stays the same there.
