import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// The brain behind a sector expert. Grounds an LLM in three layers of S2D knowledge and answers
// in character as that sector's desk:
//   1. the shared house doctrine (research/_house.md) — the S2D lens, on every desk
//   2. the sector's base article  (research/<sector>.md) — the facts
//   3. an optional per-sector opinion (research/<sector>.house.md) — S2D's specific view, if written
//
// Brain selection (first key wins):
//   - GROQ_API_KEY set       → Groq (FREE tier, fast, Llama-3.3-70B). Works on a deployed site.
//   - ANTHROPIC_API_KEY set  → Claude (paid, highest quality).
//   - otherwise              → local Ornith via Ollama (free, laptop-bound + slow; local testing only).
// Override models via EXPERT_GROQ_MODEL / EXPERT_ANTHROPIC_MODEL / EXPERT_MODEL.
export const runtime = 'nodejs';

const OLLAMA = process.env.OLLAMA_URL || 'http://localhost:11434';
const ORNITH_MODEL = process.env.EXPERT_MODEL || 'ornith';
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.EXPERT_GROQ_MODEL || 'llama-3.3-70b-versatile';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.EXPERT_ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

// Free-tier models have a tokens-per-minute budget; a full ~6,000-word article is ~8k tokens and
// blows it in two questions. Cap the base article per request. (Proper fix later: retrieve only the
// relevant passage per question.)
const ARTICLE_MAX = Number(process.env.RESEARCH_MAX_CHARS || 10000);

type Msg = { role: 'user' | 'assistant'; content: string };

async function tryRead(file: string): Promise<string> {
  try {
    return await readFile(path.join(process.cwd(), 'research', file), 'utf8');
  } catch {
    return '';
  }
}

function systemPrompt(sector: string, grounding: string) {
  return `You are the S2D Capital ${sector} Desk — the firm's resident expert analyst on ${sector}, part of a research house covering commodities, the chip/semiconductor industry, AI, technology, and FX.

How you answer:
- Explain the market accurately from the BASE KNOWLEDGE below, then read it through the S2D HOUSE DOCTRINE and say what S2D thinks — lead with the connection, not the textbook.
- Connect dots across the AI / chip / commodity / FX world.
- State opinion as opinion, never as fact; never invent numbers that aren't in the research.
- Always be willing to give the bear case / what kills the thesis.
- Be concise and concrete — talk like a sharp desk analyst.
- If the research doesn't cover something, say so rather than bluffing.
/no_think

${grounding}`;
}

async function askGroq(system: string, messages: Msg[]) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 800,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error('The desk is busy (free-tier rate limit) — give it ~30 seconds and ask again.');
    throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  return { content: text.trim(), model: GROQ_MODEL };
}

async function askAnthropic(system: string, messages: Msg[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_KEY as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = (data.content || [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('')
    .trim();
  return { content: text, model: ANTHROPIC_MODEL };
}

async function askOrnith(system: string, messages: Msg[]) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ORNITH_MODEL,
      stream: false,
      messages: [{ role: 'system', content: system }, ...messages],
      options: { temperature: 0.4, num_predict: 1400 },
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  let c: string = data?.message?.content ?? '';
  c = c.replace(/<think>[\s\S]*?<\/think>/g, '');
  if (c.includes('<think>')) c = c.split('<think>')[0];
  return { content: c.trim(), model: ORNITH_MODEL };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawSector = typeof body.sector === 'string' ? body.sector : 'copper';
    const safe = rawSector
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const messages: Msg[] = Array.isArray(body.messages) ? body.messages : [];

    const article = await tryRead(`${safe}.md`);
    if (!article) {
      return NextResponse.json(
        { error: `No research yet for "${safe}". Add research/${safe}.md and the desk goes live.` },
        { status: 404 },
      );
    }

    const sectorTitle = safe
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const doctrine = await tryRead('_house.md');
    const opinion = await tryRead(`${safe}.house.md`);
    const cappedArticle =
      article.length > ARTICLE_MAX
        ? `${article.slice(0, ARTICLE_MAX)}\n\n[…further sections of the full S2D article omitted to stay within the free-tier token budget…]`
        : article;

    const grounding = [
      doctrine && `=== S2D HOUSE DOCTRINE (your lens — apply it) ===\n${doctrine}`,
      `=== BASE KNOWLEDGE: ${sectorTitle.toUpperCase()} (ground your facts here) ===\n${cappedArticle}`,
      opinion && `=== S2D ${sectorTitle.toUpperCase()} HOUSE VIEW (our specific stance — defer to this) ===\n${opinion}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const sys = systemPrompt(sectorTitle, grounding);

    const brain = GROQ_KEY ? 'groq-free' : ANTHROPIC_KEY ? 'anthropic' : 'ornith-local';
    const { content, model } = GROQ_KEY
      ? await askGroq(sys, messages)
      : ANTHROPIC_KEY
        ? await askAnthropic(sys, messages)
        : await askOrnith(sys, messages);

    return NextResponse.json({
      content: content || '(the desk went quiet — try rephrasing)',
      sector: safe,
      model,
      brain,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
