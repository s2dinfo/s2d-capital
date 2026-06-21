'use client';
import { motion, AnimatePresence } from 'framer-motion';

// ── The consequence engine: every decision across the world accumulates into
// "the world you built" — an outcome + an archetype. Turns isolated choices
// into a game with stakes and replayability. ──

export type Choices = Record<string, string>;

const NODES = ['Nvidia', 'TSMC', 'ASML', 'Copper'] as const;
// the bold / accelerationist option at each node
const BOLD: Record<string, string> = { Nvidia: 'ai', TSMC: 'taiwan', ASML: 'sell', Copper: 'ramp' };

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
  return { made: made.length, total: NODES.length, archetype, blurb, decisions, bold };
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
          </motion.div>

          <style dangerouslySetInnerHTML={{ __html: `
            .wr-backdrop{position:fixed;inset:0;z-index:55;background:rgba(6,9,18,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px}
            .wr-card{position:relative;width:min(94vw,560px);background:linear-gradient(160deg,rgba(20,25,44,0.97),rgba(12,15,31,0.98));border:1px solid rgba(212,184,92,0.28);border-radius:18px;padding:32px 32px 26px;box-shadow:0 30px 90px rgba(0,0,0,0.6)}
            .wr-close{position:absolute;top:14px;right:18px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:26px;line-height:1;cursor:pointer}
            .wr-close:hover{color:#fff}
            .wr-eyebrow{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.22em;color:var(--gold-light,#D4B85C);margin-bottom:12px}
            .wr-title{font-family:var(--font-serif);font-weight:400;font-size:2.2rem;color:#fff;line-height:1.05;margin:0 0 14px}
            .wr-blurb{font-family:var(--font-sans);font-size:1rem;color:rgba(255,255,255,0.78);line-height:1.7;margin:0 0 22px}
            .wr-list{display:flex;flex-direction:column;gap:12px;border-top:1px solid rgba(255,255,255,0.08);padding-top:18px}
            .wr-row{display:flex;gap:14px;align-items:baseline}
            .wr-node{flex:0 0 64px;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-light,#D4B85C);padding-top:2px}
            .wr-line{font-family:var(--font-sans);font-size:0.88rem;color:rgba(255,255,255,0.72);line-height:1.55}
            .wr-hint{font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.04em;color:rgba(255,255,255,0.4);margin:18px 0 0}
          ` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
