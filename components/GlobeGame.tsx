'use client';
// BOTTLENECK, played ON the 3D globe. The supply chain flows across the Earth;
// the binding link pulses RED in 3D. Click the red node, widen it, watch the
// bottleneck jump. The strategy engine (lib/sim) drives the living globe.
import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createRun, invest, endQuarter, resolveFlow, pendingCapacity, NODE_META, FLOW_NODES, RUN_LENGTH, type RunState, type NodeId } from '@/lib/sim';
import { MeterBars } from '@/components/WorldReport';

const JourneyGlobeGL = dynamic(() => import('@/components/JourneyGlobeGL'), { ssr: false });

const LOC: Record<string, [number, number]> = {
  ASML: [51.42, 5.47], TSMC: [24.78, 120.99], Nvidia: [37.35, -121.95], Copper: [-24.27, -69.07],
  Power: [39.05, -77.55], Oil: [26.29, 50.15], RareEarth: [40.66, 109.84], OpenAI: [37.77, -122.42],
};
const EDGES: [string, string][] = [
  ['ASML', 'TSMC'], ['TSMC', 'Nvidia'], ['Oil', 'Power'], ['Copper', 'Power'],
  ['Copper', 'Nvidia'], ['RareEarth', 'Nvidia'], ['Power', 'Nvidia'], ['Nvidia', 'OpenAI'],
];
const BOARD = [...FLOW_NODES, 'OpenAI'];
const STEP = 2;

export default function GlobeGame() {
  const [run, setRun] = useState<RunState>(() => createRun());
  const [sel, setSel] = useState<NodeId | null>(null);
  const flow = useMemo(() => resolveFlow(run.cap), [run.cap]);
  const binding = flow.binding;
  const shortfall = Math.max(0, run.demand - flow.delivered);

  const stops = useMemo(() =>
    BOARD.map((p, i) => ({ place: p, location: LOC[p], active: sel === p, index: i, binding: p === binding })),
    [sel, binding]);

  const arcs = useMemo(() => EDGES.map(([a, b]) => {
    const red = a === binding || b === binding;
    return {
      from: LOC[a], to: LOC[b],
      color: red
        ? ['rgba(224,70,70,0.3)', '#ff5a5a', 'rgba(224,70,70,0.3)']
        : ['rgba(58,160,255,0.14)', 'rgba(130,205,255,0.65)', 'rgba(58,160,255,0.14)'],
      stroke: red ? 1.05 : 0.5,
      animate: red ? 650 : 2600,
    };
  }), [binding]);

  const doInvest = (node: NodeId) => setRun((s) => invest(s, node, STEP));
  const end = () => { setRun((s) => endQuarter(s)); setSel(null); };
  const restart = () => { setRun(createRun()); setSel(null); };

  return (
    <div className="gg-stage">
      <JourneyGlobeGL
        stops={stops as any}
        arcs={arcs as any}
        chokepoints={[]}
        focus={(sel ? LOC[sel] : LOC[binding]) as [number, number]}
        activeCountry={null}
        accent="#3aa0ff"
        arcStyle="comet"
        arcEnergy={0.7}
        zoomedOut
        fill
        enableZoom
        showCountries={false}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        onStopClick={(i: number) => { const p = BOARD[i]; if (FLOW_NODES.includes(p as NodeId)) setSel(p as NodeId); }}
      />

      {/* HUD */}
      <div className="gg-top">
        <div className="gg-left">
          <Link href="/world" className="gg-back">← world</Link>
          <div className="gg-title">BOTTLENECK <span>· Q{run.turn}/{RUN_LENGTH}</span></div>
        </div>
        <div className={'gg-demand' + (shortfall > 0 ? ' gg-short' : '')}>
          <span className="gg-num">{Math.round(flow.delivered)}</span>
          <span className="gg-lbl">delivered</span>
          <span className="gg-sep">/</span>
          <span className="gg-num gg-dim">{Math.round(run.demand)}</span>
          <span className="gg-lbl">demand{shortfall > 0 ? ` · backlog ${Math.round(shortfall)}` : ' · met'}</span>
        </div>
        <div className="gg-meters"><MeterBars meters={run.meters} /></div>
      </div>

      <div className="gg-hint">The chain ships at its <b>weakest link</b>. Click the <span className="gg-red">red node</span> on the globe and widen it — anything else does nothing.</div>

      {/* node control strip — the globe shows the chain in 3D, this widens the links */}
      <div className="gg-strip">
        {FLOW_NODES.map((node) => {
          const m = NODE_META[node];
          const isBind = node === binding;
          const q = pendingCapacity(run, node);
          return (
            <div key={node} className={'gg-chip' + (isBind ? ' gg-chip-bind' : '') + (sel === node ? ' gg-chip-sel' : '')} style={{ ['--acc' as any]: m.accent }} onClick={() => setSel(node)}>
              <div className="gg-chip-name">{m.label}{isBind && <span className="gg-chip-dot"> ●</span>}</div>
              <div className="gg-chip-stat">{Math.round(flow.t[node])}/{Math.round(run.cap[node])}{q > 0 ? ` ·+${Math.round(q)}` : ''}{m.leadTime > 0 ? ' ·6q' : ''}</div>
              <button className="gg-chip-btn" disabled={run.capital < STEP || !!run.over} onClick={(e) => { e.stopPropagation(); doInvest(node); }}>+ widen</button>
            </div>
          );
        })}
      </div>

      <div className="gg-foot">
        <div className="gg-capital">CAPITAL <b>{Math.round(run.capital)}</b><span>/{Math.round(run.budget)}</span></div>
        <div className={'gg-shock' + (run.pendingShock ? ' gg-shock-on' : '')}>
          {run.pendingShock ? <>⚠ NEXT QUARTER: <b>{run.pendingShock.label}</b> — {run.pendingShock.detail}</> : 'no shock telegraphed — invest ahead'}
        </div>
        <button className="gg-end" disabled={!!run.over} onClick={end}>END QUARTER →</button>
      </div>

      {run.over && (
        <div className="gg-over">
          <div className="gg-over-card">
            <div className={'gg-over-eye' + (run.over.win ? ' gg-win' : '')}>{run.over.win ? '✦ RUN COMPLETE' : '✖ COLLAPSE · Q' + run.turn}</div>
            <h1 className="gg-over-title">{run.over.title}</h1>
            <p className="gg-over-reason">{run.over.reason}</p>
            {run.over.reality && <div className="gg-over-reality"><div className="gg-or-head">◆ what really happened</div><p>{run.over.reality}</p></div>}
            <div className="gg-over-score">COMPUTE SCORE · <b>{Math.round(run.score)}</b></div>
            <div className="gg-over-actions">
              <button className="gg-over-btn" onClick={restart}>↻ new run</button>
              <Link href="/world" className="gg-over-btn gg-over-sec">← world</Link>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .gg-stage{position:fixed;inset:0;background:#04060e;overflow:hidden}
        .gg-stage canvas{display:block}
        .gg-top{position:absolute;top:60px;left:0;right:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:0 28px;pointer-events:none}
        .gg-left{display:flex;align-items:center;gap:14px}
        .gg-back{pointer-events:auto;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(255,255,255,0.5);text-decoration:none}
        .gg-back:hover{color:#fff}
        .gg-title{font-family:var(--font-mono);font-size:0.76rem;letter-spacing:0.2em;color:#fff}
        .gg-title span{color:var(--gold-light,#D4B85C)}
        .gg-demand{display:flex;align-items:baseline;gap:7px;font-family:var(--font-mono)}
        .gg-num{font-size:1.5rem;font-weight:700;color:#3affb0}
        .gg-demand.gg-short .gg-num{color:#ff6b6b}
        .gg-num.gg-dim{color:rgba(255,255,255,0.6);font-size:1.1rem}
        .gg-lbl{font-size:0.55rem;letter-spacing:0.08em;color:rgba(255,255,255,0.5);text-transform:uppercase}
        .gg-sep{color:rgba(255,255,255,0.3);font-size:1.1rem}
        .gg-meters{width:220px}
        .gg-hint{position:absolute;top:120px;left:0;right:0;z-index:5;text-align:center;font-family:var(--font-sans);font-size:0.8rem;color:rgba(255,255,255,0.62);pointer-events:none}
        .gg-hint b{color:#fff}.gg-red{color:#ff6b6b}
        .gg-strip{position:absolute;bottom:74px;left:0;right:0;z-index:6;display:flex;gap:8px;justify-content:center;padding:0 16px;flex-wrap:wrap}
        .gg-chip{width:104px;background:rgba(12,16,30,0.72);border:1px solid rgba(255,255,255,0.1);border-radius:11px;padding:8px 9px;cursor:pointer;backdrop-filter:blur(8px);transition:border-color 0.2s,transform 0.15s}
        .gg-chip:hover{transform:translateY(-2px);border-color:var(--acc)}
        .gg-chip-sel{border-color:var(--acc)}
        .gg-chip-bind{border-color:#ff6b6b;box-shadow:0 0 18px rgba(255,107,107,0.35);animation:ggPulse 1.1s ease-in-out infinite}
        @keyframes ggPulse{0%,100%{box-shadow:0 0 12px rgba(255,107,107,0.3)}50%{box-shadow:0 0 24px rgba(255,107,107,0.6)}}
        .gg-chip-name{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.04em;color:var(--acc);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .gg-chip-dot{color:#ff6b6b}
        .gg-chip-stat{font-family:var(--font-mono);font-size:0.56rem;color:rgba(255,255,255,0.6);margin:2px 0 6px}
        .gg-chip-btn{width:100%;background:var(--acc);color:#04140d;border:none;border-radius:7px;padding:5px;font-family:var(--font-mono);font-size:0.56rem;font-weight:700;letter-spacing:0.04em;cursor:pointer}
        .gg-chip-btn:disabled{opacity:0.3;cursor:not-allowed}
        .gg-foot{position:absolute;bottom:20px;left:0;right:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:0 28px;gap:20px}
        .gg-capital{pointer-events:none;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.1em;color:var(--gold-light,#D4B85C)}
        .gg-capital b{font-size:1.05rem}.gg-capital span{color:rgba(255,255,255,0.4)}
        .gg-shock{pointer-events:none;flex:1;text-align:center;font-family:var(--font-mono);font-size:0.64rem;color:rgba(255,255,255,0.4)}
        .gg-shock-on{color:#ffb86b}.gg-shock-on b{color:#ffd23a}
        .gg-end{pointer-events:auto;background:linear-gradient(135deg,#3affb0,#12c98a);color:#04140d;border:none;border-radius:999px;padding:13px 30px;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;font-weight:700;cursor:pointer;box-shadow:0 0 28px rgba(26,255,160,0.35)}
        .gg-end:disabled{opacity:0.4}
        .gg-over{position:fixed;inset:0;z-index:30;background:rgba(5,7,14,0.82);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:24px}
        .gg-over-card{width:min(94vw,520px);background:linear-gradient(160deg,rgba(20,25,44,0.97),rgba(12,15,31,0.98));border:1px solid rgba(255,255,255,0.14);border-radius:18px;padding:32px;text-align:center}
        .gg-over-eye{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.2em;color:#ff6b6b;margin-bottom:14px}
        .gg-over-eye.gg-win{color:#3affb0}
        .gg-over-title{font-family:var(--font-serif);font-weight:400;font-size:2rem;margin:0 0 14px;color:#fff}
        .gg-over-reason{font-size:0.95rem;line-height:1.6;color:rgba(255,255,255,0.78);margin:0 0 18px}
        .gg-over-reality{background:rgba(91,141,239,0.08);border:1px solid rgba(91,141,239,0.28);border-left:3px solid #5B8DEF;border-radius:10px;padding:13px 15px;text-align:left;margin-bottom:18px}
        .gg-or-head{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.14em;color:#9bbcf5;margin-bottom:6px;text-transform:uppercase}
        .gg-over-reality p{font-size:0.84rem;line-height:1.55;color:rgba(255,255,255,0.82);margin:0}
        .gg-over-score{font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.1em;color:var(--gold-light,#D4B85C);margin-bottom:20px}
        .gg-over-score b{font-size:1.3rem}
        .gg-over-actions{display:flex;gap:12px;justify-content:center}
        .gg-over-btn{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.1em;text-transform:uppercase;background:linear-gradient(135deg,#3affb0,#12c98a);color:#04140d;border:none;padding:12px 22px;border-radius:999px;cursor:pointer;text-decoration:none}
        .gg-over-sec{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}
      ` }} />
    </div>
  );
}
