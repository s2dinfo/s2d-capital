#!/usr/bin/env node
// ── The routing layer's MECHANISM ──────────────────────────────────────────────
// Delegate a grunt-work task to the LOCAL Ornith model (free, runs on this Mac) instead of
// spending Claude/Opus tokens. Claude calls this when a sub-task is mechanical + verifiable.
//
//   node scripts/ornith.mjs "summarise what this function does: <code>"
//   git diff | node scripts/ornith.mjs --fast "write a one-line commit message for this diff:"
//
// Flags:
//   --fast          append /no_think to skip the model's <think> reasoning (faster, cooler)
//   --raw           keep the <think> block in the output (default: stripped)
//   --system "..."  override the system prompt
//
// Always-verify rule: whatever Ornith returns, Claude/Opus REVIEWS before it lands. Ornith
// drafts; Opus decides. See the routing rubric in CLAUDE.md.
import { argv, stdin, stdout, exit } from 'node:process';
import { fstatSync } from 'node:fs';

const API = 'http://localhost:11434/api/chat';
const MODEL = 'ornith';

const args = argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); if (i >= 0) { args.splice(i, 1); return true; } return false; };
const opt = (f, d) => { const i = args.indexOf(f); if (i >= 0) { const v = args[i + 1]; args.splice(i, 2); return v; } return d; };
const fast = flag('--fast');
const raw = flag('--raw');
const system = opt('--system', 'You are a fast, precise coding assistant. Answer directly and concisely. Output ONLY what is asked — no preamble, no sign-off.');
let prompt = args.join(' ').trim();

// append piped stdin (a file, a diff, a log) — ONLY when stdin is a real pipe (FIFO).
// Checking isTTY alone hangs forever in a non-TTY background shell waiting for an EOF that
// never comes; fstat→isFIFO is true only when something is actually piped in.
let hasPipe = false;
try { hasPipe = fstatSync(0).isFIFO(); } catch {}
if (hasPipe) {
  const piped = await new Promise((r) => { let d = ''; stdin.setEncoding('utf8'); stdin.on('data', (c) => (d += c)); stdin.on('end', () => r(d)); });
  if (piped.trim()) prompt = (prompt ? prompt + '\n\n' : '') + piped.trim();
}
if (!prompt) { console.error('usage: node scripts/ornith.mjs [--fast] [--raw] [--system "..."] "<prompt>"  (stdin is appended)'); exit(1); }
if (fast) prompt += ' /no_think';

const body = { model: MODEL, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: false, options: { temperature: 0.4, num_predict: 1400 } };

let res;
try {
  res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
} catch {
  console.error('✗ ornith unreachable — start it with: brew services start ollama'); exit(2);
}
if (!res.ok) { console.error('✗ ornith error ' + res.status + ': ' + (await res.text()).slice(0, 200)); exit(2); }
const j = await res.json();
let text = j?.message?.content ?? '';
if (!raw) text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();   // drop the reasoning, keep the answer
stdout.write(text + '\n');
