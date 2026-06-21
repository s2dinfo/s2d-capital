'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import WorldReport, { worldMeters, MeterBars } from '@/components/WorldReport';
import Fader from '@/components/Fader';
import { ENCOUNTERS } from '@/lib/encounters';
import { useChoices } from '@/lib/choices';
import { useFade } from '@/lib/useFade';

// Reuse the existing Three.js globe (ssr:false — it needs the DOM/WebGL).
const JourneyGlobeGL = dynamic(() => import('@/components/JourneyGlobeGL'), {
  ssr: false,
  loading: () => (
    <div style={{ aspectRatio: '1', width: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em' }}>
      LOADING THE WORLD…
    </div>
  ),
});

// ── The chip chain: real entities, real geography, the story of each link. ──
type Node = {
  place: string;
  location: [number, number]; // [lat, lng]
  eyebrow: string;
  stat: string;
  statLabel: string;
  title: string;
  body: string;
  href?: string;
};

const NODES: Node[] = [
  {
    place: 'ASML',
    location: [51.42, 5.47],
    eyebrow: 'Veldhoven · Netherlands',
    stat: '100%',
    statLabel: 'of the world\'s EUV machines',
    title: 'The bottleneck of the modern world',
    body: 'ASML is the only company on earth that makes EUV lithography machines — the ~$200M devices that print the smallest transistors. Every frontier AI chip begins as a pattern burned by an ASML machine. The entire AI boom funnels through one company in one Dutch town.',
    href: '/research/silicon-the-strategic-commodity',
  },
  {
    place: 'TSMC',
    location: [24.78, 120.99],
    eyebrow: 'Hsinchu · Taiwan',
    stat: '~90%',
    statLabel: 'of advanced chips, one island',
    title: 'Where the chips are actually made',
    body: "TSMC fabricates ~90% of the world's most advanced chips — on a single island. Nvidia, Apple and AMD design; TSMC builds, using ASML's EUV machines. It is the physical heart of the AI era, and it sits 110 miles from mainland China.",
    href: '/research/silicon-the-strategic-commodity',
  },
  {
    place: 'Nvidia',
    location: [37.35, -121.95],
    eyebrow: 'Santa Clara · USA',
    stat: '0',
    statLabel: 'factories it owns',
    title: 'Designs the brains, owns no factories',
    body: "Nvidia designs the GPUs the AI boom runs on — but manufactures nothing physical. It sends blueprints to TSMC, which prints them with ASML's machines. Three companies on three continents, one chip. The whole AI economy rides this single triangle.",
    href: '/research/silicon-the-strategic-commodity',
  },
  {
    place: 'Copper',
    location: [-24.27, -69.07],
    eyebrow: 'Atacama Desert · Chile',
    stat: '2×',
    statLabel: 'the copper we must mine by ~2040',
    title: 'The metal the AI era is built on',
    body: 'Chips get the headlines, but AI runs on copper — the datacenters, the grid, the wiring that feeds it all. The richest ore is gone, the biggest mines sit in the driest desert on earth, and you cannot conjure a new copper mine in under a decade. Copper, not silicon, may be the real bottleneck.',
  },
  {
    place: 'Power',
    location: [39.05, -77.55],
    eyebrow: 'Data Center Alley · Virginia',
    stat: '1 city',
    statLabel: 'of power, per AI datacenter',
    title: 'The wire under the whole AI era',
    body: 'Chips and copper get the headlines, but the real 2024–26 bottleneck is electricity. A single AI datacenter can draw as much power as a small city — and they are being built faster than grids can be rebuilt. In Northern Virginia, the world\'s densest datacenter hub, utilities are firing up gas and delaying coal retirements just to keep up. The slowest clock in the AI race is the grid.',
  },
  {
    place: 'OpenAI',
    location: [37.77, -122.42],
    eyebrow: 'OpenAI · San Francisco',
    stat: '∞',
    statLabel: 'compute it could absorb',
    title: 'The demand the whole chain feeds',
    body: 'Everything else on this map is supply. OpenAI is the demand — the appetite for compute that pulls every wafer, gigawatt, and dollar toward itself. The AI labs racing to build intelligence are now the single largest force shaping the chip, energy, and capital markets on earth. The chip, the machine, the metal, the power: they are the runway. This is the plane.',
  },
  {
    place: 'Microsoft',
    location: [47.64, -122.13],
    eyebrow: 'Microsoft · Redmond',
    stat: '$80B+',
    statLabel: 'a year on AI datacenters',
    title: 'The capital behind the cloud',
    body: 'The labs dream it; the cloud giants pay for it. Microsoft, Amazon and Google are pouring record capital — tens of billions a quarter — into the datacenters, chips and power the AI race runs on, and Microsoft is the financial spine behind OpenAI. This is where ambition becomes a balance sheet the size of an economy.',
  },
  {
    place: 'Oil',
    location: [26.29, 50.15],
    eyebrow: 'Saudi Aramco · Dhahran',
    stat: '#1',
    statLabel: 'most profitable company on earth',
    title: 'The old power under the new',
    body: 'The AI age was supposed to be post-oil. Instead, surging electricity demand — including from datacenters — revived gas, and global oil demand keeps hitting records. Saudi Aramco sits on the cheapest, largest reserves on earth. Beneath the economy of chips and clouds still runs the old one of barrels and BTUs.',
  },
  {
    place: 'RareEarth',
    location: [40.66, 109.84],
    eyebrow: 'Rare Earths · Baotou, China',
    stat: '~90%',
    statLabel: 'of rare earths refined in China',
    title: 'The chokepoint beneath everything',
    body: 'Before the chip, before the magnet, before the motor: rare earths. The West can mine some ore, but China refines roughly 85–90% of the world\'s rare earths — and has used that grip as strategic leverage. It is the deepest chokepoint of all: technology is geology, plus the will to process it.',
  },
];

const CHOKEPOINTS = [{ label: 'Taiwan Strait', location: [24.5, 119.5] as [number, number] }];
// Each arc is a real supply link. `ends` = the two figures it connects; the arc
// is DISCOVERED (drawn) only once you've met both — the chain assembles itself
// across the globe as you understand it.
const ARCS = [
  { from: NODES[0].location, to: NODES[1].location, ends: ['ASML', 'TSMC'] },
  { from: NODES[1].location, to: NODES[2].location, ends: ['TSMC', 'Nvidia'] },
  { from: NODES[3].location, to: NODES[2].location, ends: ['Copper', 'Nvidia'] }, // copper (Chile) → the AI infrastructure
  { from: NODES[3].location, to: NODES[4].location, ends: ['Copper', 'Power'] },  // copper → the grid (wire, busbar, transformers)
  { from: NODES[4].location, to: NODES[2].location, ends: ['Power', 'Nvidia'] },  // the grid → the datacenters running the AI
  { from: NODES[2].location, to: NODES[5].location, ends: ['Nvidia', 'OpenAI'] }, // Nvidia's chips → the AI lab that buys them all (demand)
  { from: NODES[6].location, to: NODES[5].location, ends: ['Microsoft', 'OpenAI'] }, // the cloud's capital backs the lab
  { from: NODES[7].location, to: NODES[4].location, ends: ['Oil', 'Power'] },         // oil & gas still fuel the grid
  { from: NODES[8].location, to: NODES[2].location, ends: ['RareEarth', 'Nvidia'] },  // refined rare earths → the electronics
];

// Which prior stop's choice the next encounter reacts to (the quest memory).
export default function ChipWorld() {
  const { go, out, label } = useFade();
  const [active, setActive] = useState<number | null>(null);
  const [choices] = useChoices(); // shared store — reflects decisions made in the 3D scenes
  const [reportOpen, setReportOpen] = useState(false);
  const [started, setStarted] = useState(false); // false = cinematic Chapter-One opening
  const callsMade = NODES.filter((n) => choices[n.place]).length;
  // the supply links you've earned by meeting both figures — the chain draws itself
  const discoveredArcs = ARCS.filter((a) => a.ends.every((p) => choices[p]));
  const node = active != null ? NODES[active] : null;

  const stops = NODES.map((n, i) => ({ place: n.place, location: n.location, active: i === active, index: i }));
  const focus: [number, number] = node ? node.location : [38, 60];

  // Climactic close: the moment all calls are made, surface "the world you built"
  // once — the "was it worth it?" beat that bookends the Chapter-One opening.
  const climaxShown = useRef(false);
  useEffect(() => {
    if (callsMade === NODES.length && !climaxShown.current) {
      climaxShown.current = true;
      const t = setTimeout(() => setReportOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [callsMade]);

  // "Begin the journey" — travel in to meet Jensen in his 3D space.
  const beginJourney = () => go('/meet/Nvidia', 'entering nvidia');

  return (
    <section className="cw-stage">
      <Fader out={out} label={label} />
      {/* ── Immersive background: animated glows + grid + vignette ── */}
      <div className="cw-bg" aria-hidden>
        <div className="cw-stars" />
        <div className="cw-glow cw-glow-gold" />
        <div className="cw-glow cw-glow-blue" />
        <div className="cw-grid-overlay" />
        <div className="cw-vignette" />
      </div>

      {/* ── Cinematic Chapter-One opening — frames the journey, guides the first step ── */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="cw-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <motion.div
              className="cw-intro-card"
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="cw-intro-eyebrow">THE CHIP · CHAPTER ONE</div>
              <h1 className="cw-intro-title">
                Trace the AI era<br />from a <span className="gradient-text" style={{ fontStyle: 'italic' }}>wafer to a wire</span>.
              </h1>
              <p className="cw-intro-sub">
                Five people. One chain. Every chip, every datacenter, every grid — and the real
                decisions that built them. You make the calls. The world remembers.
              </p>
              <div className="cw-intro-actions">
                <button className="cw-intro-go" onClick={beginJourney}>Begin the journey&nbsp;&nbsp;→</button>
                <button className="cw-intro-skip" onClick={() => setStarted(true)}>or explore the map freely</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Title overlay (top) — only once the journey has begun ── */}
      {started && (
        <div className="cw-title">
          <div className="cw-eyebrow">THE CHIP · CHAPTER ONE</div>
          <h1 className="cw-h1">
            The world that makes the <span className="gradient-text" style={{ fontStyle: 'italic' }}>AI era</span> possible
          </h1>
        </div>
      )}

      {/* ── Live world meters — the consequence dashboard. Every call trades
           Output vs. Resilience vs. Sustainability; you can't max one. ── */}
      {started && (
        <div className="cw-meters">
          <div className="cw-meters-head">THE WORLD · LIVE STATE</div>
          <MeterBars meters={worldMeters(choices)} />
          <div className="cw-meters-foot">{callsMade === 0 ? 'Meet the people to map the chain.' : `${callsMade}/${NODES.length} calls · ${discoveredArcs.length}/${ARCS.length} routes mapped`}</div>
        </div>
      )}

      {/* ── Node selector (reliable — globe labels are small/rotating) ── */}
      {started && (
        <div className="cw-pills">
          {NODES.map((n, i) => (
            <button key={n.place} className={'cw-pill' + (i === active ? ' cw-pill-on' : '')} onClick={() => setActive(i)}>
              {n.place}
            </button>
          ))}
        </div>
      )}

      {/* ── The globe — fills the whole stage (immersive zoom, no box clip) ── */}
      <div className="cw-globe-fill">
        <JourneyGlobeGL
          stops={stops}
          arcs={discoveredArcs}
          chokepoints={CHOKEPOINTS}
          focus={focus}
          activeCountry={null}
          accent="#D4B85C"
          arcStyle="comet"
          arcEnergy={0.85}
          zoomedOut={node == null}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          showCountries={false}
          enableZoom
          fill
          onStopClick={(i) => setActive(i)}
        />
      </div>

      {/* ── HUD: coordinate readout (bottom-right) ── */}
      <div className="cw-hud">
        <span className="cw-hud-dot" />
        {node
          ? `LAT ${node.location[0].toFixed(2)} · LNG ${node.location[1].toFixed(2)} — ${node.place.toUpperCase()}`
          : 'ASML · TSMC · NVIDIA — SELECT A NODE'}
      </div>

      {/* ── Floating dossier (bottom-left), animates in on select ── */}
      <AnimatePresence mode="wait">
        {node ? (
          <motion.aside
            key={active}
            className="cw-dossier"
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="cw-close" onClick={() => setActive(null)} aria-label="Close">×</button>
            <div className="cw-d-eyebrow">{node.eyebrow}</div>
            <div className="cw-d-name">{node.place}</div>
            <div className="cw-d-stat">
              <span className="cw-d-stat-num">{node.stat}</span>
              <span className="cw-d-stat-label">{node.statLabel}</span>
            </div>
            <h2 className="cw-d-title">{node.title}</h2>
            <p className="cw-d-body">{node.body}</p>
            {ENCOUNTERS[node.place] && (
              <button className="cw-d-meet" onClick={() => go(`/meet/${node.place}`, `entering ${node.place}`)}>▶&nbsp;&nbsp;MEET {ENCOUNTERS[node.place].name.toUpperCase()}</button>
            )}
            {node.href && (
              <Link href={node.href} className="cw-d-link">READ THE FULL STORY →</Link>
            )}
          </motion.aside>
        ) : (
          <motion.div key="hint" className="cw-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
            Click <strong>ASML</strong>, <strong>TSMC</strong> or <strong>Nvidia</strong> on the globe →
          </motion.div>
        )}
      </AnimatePresence>

      {/* corner brackets */}
      <span className="cw-bracket cw-bracket-tl" aria-hidden />
      <span className="cw-bracket cw-bracket-br" aria-hidden />

      {/* The world you built — consequence report (accumulates your decisions) */}
      <button className="cw-report-btn" onClick={() => setReportOpen(true)}>
        ⚖ The world you built · {callsMade}/{NODES.length}
      </button>
      <WorldReport choices={choices} open={reportOpen} onClose={() => setReportOpen(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        .cw-stage{position:relative;min-height:100vh;overflow:hidden;background:#0c0f1f;display:flex;flex-direction:column}
        .cw-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .cw-stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 40px 50px,#fff,transparent),radial-gradient(1px 1px at 130px 90px,rgba(255,255,255,0.75),transparent),radial-gradient(1px 1px at 210px 160px,rgba(255,255,255,0.85),transparent),radial-gradient(1.2px 1.2px at 90px 210px,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 250px 40px,rgba(255,255,255,0.7),transparent);background-size:280px 280px;animation:cwTwinkle 7s ease-in-out infinite}
        @keyframes cwTwinkle{0%,100%{opacity:0.45}50%{opacity:0.8}}
        .cw-glow{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.9}
        .cw-glow-gold{width:760px;height:760px;top:-18%;left:-12%;background:radial-gradient(circle,rgba(184,134,11,0.20),transparent 65%);animation:cwFloat1 24s ease-in-out infinite}
        .cw-glow-blue{width:620px;height:620px;bottom:-20%;right:-10%;background:radial-gradient(circle,rgba(59,108,180,0.16),transparent 65%);animation:cwFloat2 30s ease-in-out infinite}
        .cw-grid-overlay{position:absolute;inset:0;background-image:linear-gradient(rgba(184,134,11,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.035) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%)}
        .cw-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 38%,#0c0f1f 100%)}
        @keyframes cwFloat1{0%,100%{transform:translate(0,0)}33%{transform:translate(50px,-30px)}66%{transform:translate(-30px,25px)}}
        @keyframes cwFloat2{0%,100%{transform:translate(0,0)}33%{transform:translate(-40px,35px)}66%{transform:translate(25px,-20px)}}

        .cw-title{position:relative;z-index:3;text-align:center;padding:54px 24px 0;pointer-events:none}
        .cw-eyebrow{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.4em;color:var(--gold-light,#D4B85C);margin-bottom:14px}
        .cw-h1{font-family:var(--font-serif);font-weight:400;font-size:clamp(1.9rem,4.6vw,3.4rem);color:#fff;line-height:1.08;margin:0;letter-spacing:-0.01em}

        .cw-pills{position:relative;z-index:3;display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap}
        .cw-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.72);font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.08em;padding:10px 20px;border-radius:999px;cursor:pointer;transition:all 0.2s}
        .cw-pill:hover{border-color:rgba(212,184,92,0.5);color:#fff;transform:translateY(-1px)}
        .cw-pill-on{background:var(--gold-light,#D4B85C);color:#1A1A2E;border-color:var(--gold-light,#D4B85C);font-weight:700}

        .cw-globe-fill{position:absolute;inset:0;z-index:1}

        .cw-intro{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:28px;text-align:center;background:radial-gradient(120% 90% at 50% 45%,rgba(8,11,22,0.62) 0%,rgba(6,9,18,0.9) 70%,rgba(5,7,14,0.97) 100%);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
        .cw-intro-card{max-width:640px}
        .cw-intro-eyebrow{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.32em;color:var(--gold-light,#D4B85C);margin-bottom:26px}
        .cw-intro-title{font-family:var(--font-serif);font-weight:400;font-size:clamp(2.4rem,5.4vw,3.9rem);line-height:1.06;color:#fff;margin:0 0 22px;letter-spacing:-0.01em}
        .cw-intro-sub{font-family:var(--font-sans);font-size:clamp(0.95rem,1.4vw,1.08rem);line-height:1.75;color:rgba(255,255,255,0.62);max-width:500px;margin:0 auto 38px}
        .cw-intro-actions{display:flex;flex-direction:column;align-items:center;gap:16px}
        .cw-intro-go{font-family:var(--font-mono);font-size:0.74rem;letter-spacing:0.14em;text-transform:uppercase;color:#0b0e16;background:linear-gradient(135deg,#E8CE7A,#C9A84F);border:none;padding:15px 34px;border-radius:999px;cursor:pointer;box-shadow:0 12px 36px rgba(201,168,79,0.34);transition:transform 0.2s,box-shadow 0.2s}
        .cw-intro-go:hover{transform:translateY(-2px);box-shadow:0 18px 48px rgba(201,168,79,0.5)}
        .cw-intro-skip{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;color:rgba(255,255,255,0.4);background:none;border:none;cursor:pointer;transition:color 0.2s}
        .cw-intro-skip:hover{color:rgba(255,255,255,0.75)}
        .cw-meters{position:absolute;top:96px;left:24px;z-index:6;width:248px;padding:14px 16px 12px;background:linear-gradient(160deg,rgba(20,25,44,0.82),rgba(12,15,31,0.86));border:1px solid rgba(255,255,255,0.08);border-radius:14px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 14px 40px rgba(0,0,0,0.35)}
        .cw-meters-head{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.18em;color:var(--gold-light,#D4B85C);margin-bottom:11px}
        .cw-meters-foot{font-family:var(--font-mono);font-size:0.54rem;letter-spacing:0.04em;color:rgba(255,255,255,0.38);margin-top:11px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.06)}
        @media (max-width:720px){.cw-meters{display:none}}
        .cw-report-btn{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:6;background:rgba(212,184,92,0.12);border:1px solid rgba(212,184,92,0.4);color:var(--gold-light,#D4B85C);font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.08em;padding:10px 20px;border-radius:999px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s}
        .cw-report-btn:hover{background:rgba(212,184,92,0.22);color:#fff;transform:translateX(-50%) translateY(-1px)}
        .cw-hud{position:absolute;bottom:22px;right:24px;z-index:3;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.16em;color:rgba(255,255,255,0.45);display:flex;align-items:center;gap:8px}
        .cw-hud-dot{width:6px;height:6px;border-radius:50%;background:var(--gold-light,#D4B85C);box-shadow:0 0 8px var(--gold-light,#D4B85C);animation:cwPulse 2s ease-in-out infinite}
        @keyframes cwPulse{0%,100%{opacity:0.4}50%{opacity:1}}

        .cw-dossier{position:absolute;z-index:4;left:32px;bottom:56px;width:min(90vw,380px);background:rgba(14,18,32,0.72);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(212,184,92,0.22);border-radius:16px;padding:24px 24px 26px;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
        .cw-close{position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;line-height:1;cursor:pointer}
        .cw-close:hover{color:#fff}
        .cw-d-eyebrow{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold-light,#D4B85C);margin-bottom:6px}
        .cw-d-name{font-family:var(--font-mono);font-size:1.05rem;font-weight:700;color:#fff;margin-bottom:14px}
        .cw-d-stat{display:flex;align-items:baseline;gap:10px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.08)}
        .cw-d-stat-num{font-family:var(--font-mono);font-size:2.4rem;font-weight:700;color:#fff;line-height:1;letter-spacing:-0.02em}
        .cw-d-stat-label{font-family:var(--font-sans);font-size:0.72rem;color:rgba(255,255,255,0.5);line-height:1.3;max-width:140px}
        .cw-d-title{font-family:var(--font-serif);font-weight:400;font-size:1.3rem;color:#fff;line-height:1.25;margin:0 0 12px}
        .cw-d-body{font-family:var(--font-sans);font-size:0.86rem;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 18px}
        .cw-d-meet{display:block;width:100%;margin-bottom:14px;background:var(--gold-light,#D4B85C);color:#1A1A2E;border:none;border-radius:10px;padding:12px;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.1em;font-weight:700;cursor:pointer;transition:filter 0.2s}
        .cw-d-meet:hover{filter:brightness(1.1)}
        .cw-d-link{font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.08em;color:var(--gold-light,#D4B85C);text-decoration:none}
        .cw-d-link:hover{color:#fff}

        .cw-hint{position:absolute;z-index:4;left:32px;bottom:64px;font-family:var(--font-sans);font-size:0.85rem;color:rgba(255,255,255,0.55)}
        .cw-hint strong{color:#fff;font-weight:600}

        .cw-bracket{position:absolute;width:34px;height:34px;z-index:3;border-color:rgba(212,184,92,0.4);pointer-events:none}
        .cw-bracket-tl{top:20px;left:22px;border-top:1px solid;border-left:1px solid}
        .cw-bracket-br{bottom:20px;right:22px;border-bottom:1px solid;border-right:1px solid}

        @media(max-width:880px){
          .cw-dossier{left:50%;transform:translateX(-50%);right:auto}
          .cw-hint{left:50%;transform:translateX(-50%);text-align:center;width:90%}
          .cw-hud{display:none}
        }
      ` }} />
    </section>
  );
}
