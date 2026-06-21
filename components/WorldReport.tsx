'use client';
import { motion, AnimatePresence } from 'framer-motion';

// ── The consequence engine: every decision across the world accumulates into
// "the world you built" — an outcome + an archetype. Turns isolated choices
// into a game with stakes and replayability. ──

export type Choices = Record<string, string>;

const NODES = ['Nvidia', 'TSMC', 'ASML', 'Copper', 'Power'] as const;
// the bold / accelerationist option at each node
const BOLD: Record<string, string> = { Nvidia: 'ai', TSMC: 'taiwan', ASML: 'sell', Copper: 'ramp', Power: 'rush' };

const LINES: Record<string, Record<string, string>> = {
  Nvidia: {
    ai: 'Nvidia bet the company on AI — and won the decade.',
    gaming: 'Nvidia played it safe with gaming — and let rivals take the AI crown.',
  },
  TSMC: {
    taiwan: 'TSMC kept everything in Taiwan — cheap, concentrated, one blockade from catastrophe.',
    spread: 'TSMC spread to Arizona & Japan — costlier, but the world no longer bets on one island.',
  },
  ASML: {
    sell: 'ASML kept selling to China — revenue secured, a tech cold war lit.',
    comply: 'ASML complied with the export bans — aligned with the West, China racing to replace it.',
  },
  Copper: {
    ramp: 'You ramped copper hard — the boom is fed, the desert and its towns pay the price.',
    restraint: 'You held copper back — the desert spared, the shortfall now everyone’s problem.',
  },
  Power: {
    rush: 'You energized the AI buildout at full tilt — the grid groans, the bills climb, the carbon with it.',
    pace: 'You paced the buildout to the grid — the lights stay stable, the AI timeline slips.',
  },
};

export function buildReport(choices: Choices) {
  const made = NODES.filter((n) => choices[n]);
  const bold = made.filter((n) => choices[n] === BOLD[n]).length;
  const ratio = made.length ? bold / made.length : 0;
  let archetype = 'The Pragmatist';
  let blurb =
    'You split the difference — bold bets hedged with caution. A world that mostly holds, with cracks where you compromised.';
  if (made.length === 0) {
    archetype = 'Unwritten';
    blurb = 'You haven’t made a single call yet. Travel the chain, meet the people who run it, and decide — the world is yours to build.';
  } else if (ratio >= 0.75) {
    archetype = 'The Accelerationist';
    blurb = 'You built a world running flat-out — maximum output, maximum risk. The AI boom is fed, and the whole machine balances on a knife’s edge.';
  } else if (ratio <= 0.25) {
    archetype = 'The Steward';
    blurb = 'You built a careful, resilient world — slower and costlier, but it won’t shatter. The AI buildout strains against your restraint.';
  }
  const decisions = made.map((n) => ({ node: n, line: LINES[n]?.[choices[n]] || '' }));
  const meters = worldMeters(choices);
  let warning = '';
  if (made.length >= 2) {
    if (meters.resilience <= 15) warning = 'Your world is dangerously fragile — one shock (a blockade, an export ban) and it shatters.';
    else if (meters.sustainability <= 15) warning = 'You’ve mortgaged the future — the environment, the workers, and the alliances are stretched to breaking.';
    else if (meters.output <= 15) warning = 'You’ve strangled output — safe, but the AI economy you were meant to feed is starving.';
    else if (meters.output >= 88 && meters.resilience <= 32) warning = 'Maxed for output, hollow on resilience — a flat-out world running on borrowed time.';
  }
  return { made: made.length, total: NODES.length, archetype, blurb, decisions, bold, meters, warning };
}

// ── Competing meters with double-bounded failure: each call trades Output vs.
// Resilience vs. Sustainability. You can't max one without breaking another. ──
const METER_DELTAS: Record<string, Record<string, { output: number; resilience: number; sustainability: number }>> = {
  Nvidia: { ai: { output: 22, resilience: -12, sustainability: 0 }, gaming: { output: -10, resilience: 12, sustainability: 4 } },
  TSMC: { taiwan: { output: 14, resilience: -22, sustainability: -4 }, spread: { output: -12, resilience: 22, sustainability: 4 } },
  ASML: { sell: { output: 14, resilience: -6, sustainability: -20 }, comply: { output: -14, resilience: 6, sustainability: 14 } },
  Copper: { ramp: { output: 20, resilience: 4, sustainability: -24 }, restraint: { output: -16, resilience: 6, sustainability: 20 } },
  Power: { rush: { output: 20, resilience: -14, sustainability: -22 }, pace: { output: -16, resilience: 12, sustainability: 14 } },
};
const clampM = (x: number) => Math.max(0, Math.min(100, Math.round(x)));
export function worldMeters(choices: Choices) {
  let output = 50, resilience = 50, sustainability = 50;
  for (const n of NODES) {
    const d = choices[n] ? METER_DELTAS[n]?.[choices[n]] : null;
    if (!d) continue;
    output += d.output; resilience += d.resilience; sustainability += d.sustainability;
  }
  return { output: clampM(output), resilience: clampM(resilience), sustainability: clampM(sustainability) };
}
const METERS = [
  { key: 'output', label: 'Output', color: '#D4B85C' },
  { key: 'resilience', label: 'Resilience', color: '#5B8DEF' },
  { key: 'sustainability', label: 'Sustainability', color: '#34d399' },
] as const;
export function MeterBars({ meters }: { meters: { output: number; resilience: number; sustainability: number } }) {
  return (
    <div className="mtr">
      {METERS.map((m) => {
        const v = meters[m.key];
        const danger = v <= 15 || v >= 90;
        return (
          <div className="mtr-row" key={m.key}>
            <span className="mtr-label">{m.label}</span>
            <span className="mtr-track"><span className="mtr-fill" style={{ width: v + '%', background: danger ? '#f87171' : m.color }} /></span>
          </div>
        );
      })}
      <style dangerouslySetInnerHTML={{ __html: `
        .mtr{display:flex;flex-direction:column;gap:7px}
        .mtr-row{display:flex;align-items:center;gap:9px}
        .mtr-label{flex:0 0 96px;font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.6)}
        .mtr-track{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden}
        .mtr-fill{display:block;height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1),background 0.4s}
      ` }} />
    </div>
  );
}

export default function WorldReport({ choices, open, onClose }: { choices: Choices; open: boolean; onClose: () => void }) {
  const r = buildReport(choices);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="wr-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="wr-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="wr-close" onClick={onClose} aria-label="Close">×</button>
            <div className="wr-eyebrow">THE WORLD YOU BUILT · {r.made}/{r.total} CALLS MADE</div>
            <h2 className="wr-title">{r.archetype}</h2>
            <p className="wr-blurb">{r.blurb}</p>
            {r.made > 0 && (
              <div className="wr-meters">
                <MeterBars meters={r.meters} />
                {r.warning && <p className="wr-warning">⚠ {r.warning}</p>}
              </div>
            )}
            {r.decisions.length > 0 && (
              <div className="wr-list">
                {r.decisions.map((d) => (
                  <div key={d.node} className="wr-row">
                    <span className="wr-node">{d.node}</span>
                    <span className="wr-line">{d.line}</span>
                  </div>
                ))}
              </div>
            )}
            {r.made < r.total && (
              <p className="wr-hint">{r.total - r.made} more {r.total - r.made === 1 ? 'call' : 'calls'} to make. Visit the nodes you haven’t yet.</p>
            )}
            {r.made === r.total && (
              <p className="wr-complete">The chain is complete — wafer to wire. This is the world your calls built. <span>Was it worth it?</span></p>
            )}
          </motion.div>

          <style dangerouslySetInnerHTML={{ __html: `
            .wr-backdrop{position:fixed;inset:0;z-index:55;background:rgba(6,9,18,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px}
            .wr-card{position:relative;width:min(94vw,560px);background:linear-gradient(160deg,rgba(20,25,44,0.97),rgba(12,15,31,0.98));border:1px solid rgba(212,184,92,0.28);border-radius:18px;padding:32px 32px 26px;box-shadow:0 30px 90px rgba(0,0,0,0.6)}
            .wr-close{position:absolute;top:14px;right:18px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:26px;line-height:1;cursor:pointer}
            .wr-close:hover{color:#fff}
            .wr-eyebrow{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.22em;color:var(--gold-light,#D4B85C);margin-bottom:12px}
            .wr-title{font-family:var(--font-serif);font-weight:400;font-size:2.2rem;color:#fff;line-height:1.05;margin:0 0 14px}
            .wr-blurb{font-family:var(--font-sans);font-size:1rem;color:rgba(255,255,255,0.78);line-height:1.7;margin:0 0 22px}
            .wr-meters{margin:0 0 22px;padding:16px 16px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px}
            .wr-warning{font-family:var(--font-sans);font-size:0.82rem;color:#fca5a5;line-height:1.5;margin:14px 0 0;padding-top:12px;border-top:1px solid rgba(248,113,113,0.18)}
            .wr-list{display:flex;flex-direction:column;gap:12px;border-top:1px solid rgba(255,255,255,0.08);padding-top:18px}
            .wr-row{display:flex;gap:14px;align-items:baseline}
            .wr-node{flex:0 0 64px;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-light,#D4B85C);padding-top:2px}
            .wr-line{font-family:var(--font-sans);font-size:0.88rem;color:rgba(255,255,255,0.72);line-height:1.55}
            .wr-hint{font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.04em;color:rgba(255,255,255,0.4);margin:18px 0 0}
            .wr-complete{font-family:var(--font-serif);font-size:1.02rem;color:rgba(255,255,255,0.7);line-height:1.6;margin:20px 0 0;padding-top:16px;border-top:1px solid rgba(212,184,92,0.2)}
            .wr-complete span{color:var(--gold-light,#D4B85C);font-style:italic}
          ` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
