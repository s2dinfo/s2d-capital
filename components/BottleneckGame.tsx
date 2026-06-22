'use client';
// BOTTLENECK — Stage 0 playable. Read the chain, spend Capital to widen the binding
// link, survive the rising demand clock + telegraphed shocks. Both meter walls kill.
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createRun, invest, endQuarter, resolveFlow, pendingCapacity, NODE_META, FLOW_NODES, RUN_LENGTH, type RunState, type NodeId } from '@/lib/sim';
import { MeterBars } from '@/components/WorldReport';

const ORDER: NodeId[] = ['ASML', 'TSMC', 'Power', 'Oil', 'Copper', 'RareEarth', 'Nvidia'];
const STEP = 2; // capital per click

export default function BottleneckGame() {
  const [run, setRun] = useState<RunState>(() => createRun());
  const flow = useMemo(() => resolveFlow(run.cap), [run.cap]);
  const met = run.meters.output >= run.demand ? false : true; // shortfall?
  const shortfall = Math.max(0, run.demand - flow.delivered);

  const doInvest = (node: NodeId) => setRun((s) => invest(s, node, STEP));
  const end = () => setRun((s) => endQuarter(s));
  const restart = () => setRun(createRun());

  return (
    <div className="bn-stage">
      <header className="bn-top">
        <div className="bn-left">
          <Link href="/world" className="bn-back">← world</Link>
          <div className="bn-title">BOTTLENECK <span>· Q{run.turn}/{RUN_LENGTH}</span></div>
        </div>
        <div className={'bn-demand' + (shortfall > 0 ? ' bn-short' : '')}>
          <span className="bn-d-num">{Math.round(flow.delivered)}</span>
          <span className="bn-d-lbl">compute delivered</span>
          <span className="bn-d-sep">/</span>
          <span className="bn-d-num bn-dim">{Math.round(run.demand)}</span>
          <span className="bn-d-lbl">demand{shortfall > 0 ? ` · backlog ${Math.round(shortfall)}` : ' · met'}</span>
        </div>
        <div className="bn-meters"><MeterBars meters={run.meters} /></div>
      </header>

      <div className="bn-hint">Compute = the <b>weakest link</b>, not the sum. Find the <span className="bn-red">red bottleneck</span> and widen it — investing anywhere else does nothing.</div>

      <div className="bn-board">
        {ORDER.map((node) => {
          const m = NODE_META[node];
          const cap = run.cap[node];
          const thru = flow.t[node];
          const binding = flow.binding === node;
          const fill = Math.min(100, (thru / Math.max(cap, 1)) * 100);
          const queued = pendingCapacity(run, node);
          return (
            <div key={node} className={'bn-node' + (binding ? ' bn-binding' : '')} style={{ ['--acc' as any]: m.accent }}>
              {binding && <div className="bn-flag">◀ BOTTLENECK</div>}
              <div className="bn-node-name">{m.label}</div>
              <div className="bn-node-sub">{m.sub}</div>
              <div className="bn-bar"><div className="bn-bar-fill" style={{ width: fill + '%' }} /></div>
              <div className="bn-node-stat"><span>cap {Math.round(cap)}</span><span className="bn-thru">flow {Math.round(thru)}</span></div>
              {queued > 0 && <div className="bn-queued">+{Math.round(queued)} arriving</div>}
              <button className="bn-invest" disabled={run.capital < STEP || !!run.over} onClick={() => doInvest(node)}>
                + widen <span>({STEP}c → +{STEP * 2}{m.leadTime > 0 ? ` in ${m.leadTime}q` : ''})</span>
              </button>
            </div>
          );
        })}
      </div>

      <footer className="bn-foot">
        <div className="bn-capital">CAPITAL <b>{Math.round(run.capital)}</b><span>/{Math.round(run.budget)}</span></div>
        <div className={'bn-shock' + (run.pendingShock ? ' bn-shock-on' : '')}>
          {run.pendingShock ? <>⚠ NEXT QUARTER: <b>{run.pendingShock.label}</b> — {run.pendingShock.detail}</> : 'no shock telegraphed — invest for the future'}
        </div>
        <button className="bn-end" disabled={!!run.over} onClick={end}>END QUARTER →</button>
      </footer>

      <div className="bn-log">
        {run.log.slice(0, 4).map((l, i) => <div key={i} className="bn-log-line" style={{ opacity: 1 - i * 0.22 }}>{l}</div>)}
      </div>

      {run.over && (
        <div className="bn-over">
          <div className="bn-over-card">
            <div className={'bn-over-eyebrow' + (run.over.win ? ' bn-win' : '')}>{run.over.win ? '✦ RUN COMPLETE' : '✖ COLLAPSE · Q' + run.turn}</div>
            <h1 className="bn-over-title">{run.over.title}</h1>
            <p className="bn-over-reason">{run.over.reason}</p>
            {run.over.reality && <div className="bn-over-reality"><div className="bn-or-head">◆ what really happened</div><p>{run.over.reality}</p></div>}
            <div className="bn-over-score">COMPUTE SCORE · <b>{Math.round(run.score)}</b></div>
            <div className="bn-over-actions">
              <button className="bn-over-btn" onClick={restart}>↻ new run</button>
              <Link href="/world" className="bn-over-btn bn-over-sec">← back to the world</Link>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .bn-stage{position:fixed;inset:0;background:radial-gradient(120% 90% at 50% 0%,#0b1020,#05070e);color:#fff;display:flex;flex-direction:column;padding:64px 24px 16px;overflow:hidden;font-family:var(--font-sans)}
        .bn-top{display:flex;align-items:center;gap:24px;justify-content:space-between}
        .bn-left{display:flex;align-items:center;gap:16px}
        .bn-back{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(255,255,255,0.45);text-decoration:none}
        .bn-back:hover{color:#fff}
        .bn-title{font-family:var(--font-mono);font-size:0.78rem;letter-spacing:0.2em;color:#fff}
        .bn-title span{color:var(--gold-light,#D4B85C)}
        .bn-demand{display:flex;align-items:baseline;gap:7px;font-family:var(--font-mono)}
        .bn-d-num{font-size:1.5rem;font-weight:700;color:#3affb0}
        .bn-demand.bn-short .bn-d-num{color:#ff6b6b}
        .bn-d-num.bn-dim{color:rgba(255,255,255,0.6);font-size:1.1rem}
        .bn-d-lbl{font-size:0.56rem;letter-spacing:0.08em;color:rgba(255,255,255,0.5);text-transform:uppercase}
        .bn-d-sep{color:rgba(255,255,255,0.3);font-size:1.1rem}
        .bn-meters{width:230px}
        .bn-hint{font-family:var(--font-sans);font-size:0.8rem;color:rgba(255,255,255,0.6);text-align:center;margin:14px 0 6px}
        .bn-hint b{color:#fff}.bn-red{color:#ff6b6b}
        .bn-board{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:12px;align-items:stretch;padding:10px 0;min-height:0}
        .bn-node{position:relative;background:linear-gradient(160deg,rgba(20,25,42,0.8),rgba(12,15,28,0.85));border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 12px;display:flex;flex-direction:column;gap:7px}
        .bn-binding{border-color:#ff6b6b;box-shadow:0 0 0 1px #ff6b6b,0 0 30px rgba(255,107,107,0.35);animation:bnPulse 1.1s ease-in-out infinite}
        @keyframes bnPulse{0%,100%{box-shadow:0 0 0 1px #ff6b6b,0 0 22px rgba(255,107,107,0.3)}50%{box-shadow:0 0 0 1px #ff6b6b,0 0 40px rgba(255,107,107,0.6)}}
        .bn-flag{position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#ff6b6b;color:#0b0e16;font-family:var(--font-mono);font-size:0.5rem;letter-spacing:0.1em;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap}
        .bn-node-name{font-family:var(--font-mono);font-size:0.74rem;letter-spacing:0.06em;color:var(--acc)}
        .bn-node-sub{font-size:0.6rem;color:rgba(255,255,255,0.4)}
        .bn-bar{height:7px;border-radius:4px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:2px}
        .bn-bar-fill{height:100%;border-radius:4px;background:var(--acc);transition:width 0.3s}
        .bn-node-stat{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.6rem;color:rgba(255,255,255,0.55)}
        .bn-thru{color:#fff}
        .bn-queued{font-family:var(--font-mono);font-size:0.55rem;color:var(--acc);opacity:0.8}
        .bn-invest{margin-top:auto;background:rgba(255,255,255,0.06);border:1px solid var(--acc);color:#fff;border-radius:9px;padding:8px 6px;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.04em;cursor:pointer;transition:background 0.15s}
        .bn-invest span{display:block;color:rgba(255,255,255,0.5);font-size:0.52rem;margin-top:2px}
        .bn-invest:hover:not(:disabled){background:rgba(255,255,255,0.14)}
        .bn-invest:disabled{opacity:0.3;cursor:not-allowed}
        .bn-foot{display:flex;align-items:center;gap:20px;justify-content:space-between;padding-top:8px}
        .bn-capital{font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;color:var(--gold-light,#D4B85C)}
        .bn-capital b{font-size:1.1rem}.bn-capital span{color:rgba(255,255,255,0.4)}
        .bn-shock{flex:1;text-align:center;font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.04em;color:rgba(255,255,255,0.4)}
        .bn-shock-on{color:#ffb86b}.bn-shock-on b{color:#ffd23a}
        .bn-end{background:linear-gradient(135deg,#3affb0,#12c98a);color:#04140d;border:none;border-radius:999px;padding:13px 30px;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;font-weight:700;cursor:pointer;box-shadow:0 0 28px rgba(26,255,160,0.35)}
        .bn-end:hover:not(:disabled){transform:translateY(-1px)}.bn-end:disabled{opacity:0.4}
        .bn-log{font-family:var(--font-mono);font-size:0.6rem;color:rgba(255,255,255,0.45);margin-top:10px;height:62px;overflow:hidden}
        .bn-log-line{margin-bottom:3px}
        .bn-over{position:fixed;inset:0;z-index:30;background:rgba(5,7,14,0.82);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:24px}
        .bn-over-card{width:min(94vw,520px);background:linear-gradient(160deg,rgba(20,25,44,0.97),rgba(12,15,31,0.98));border:1px solid rgba(255,255,255,0.14);border-radius:18px;padding:32px;text-align:center}
        .bn-over-eyebrow{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.2em;color:#ff6b6b;margin-bottom:14px}
        .bn-over-eyebrow.bn-win{color:#3affb0}
        .bn-over-title{font-family:var(--font-serif);font-weight:400;font-size:2rem;margin:0 0 14px;color:#fff}
        .bn-over-reason{font-size:0.95rem;line-height:1.6;color:rgba(255,255,255,0.78);margin:0 0 18px}
        .bn-over-reality{background:rgba(91,141,239,0.08);border:1px solid rgba(91,141,239,0.28);border-left:3px solid #5B8DEF;border-radius:10px;padding:13px 15px;text-align:left;margin-bottom:18px}
        .bn-or-head{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.14em;color:#9bbcf5;margin-bottom:6px;text-transform:uppercase}
        .bn-over-reality p{font-size:0.84rem;line-height:1.55;color:rgba(255,255,255,0.82);margin:0}
        .bn-over-score{font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.1em;color:var(--gold-light,#D4B85C);margin-bottom:20px}
        .bn-over-score b{font-size:1.3rem}
        .bn-over-actions{display:flex;gap:12px;justify-content:center}
        .bn-over-btn{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.1em;text-transform:uppercase;background:linear-gradient(135deg,#3affb0,#12c98a);color:#04140d;border:none;padding:12px 22px;border-radius:999px;cursor:pointer;text-decoration:none}
        .bn-over-sec{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}
        @media (max-width:760px){.bn-board{grid-template-columns:repeat(2,1fr);overflow-y:auto}.bn-meters{display:none}.bn-top{flex-wrap:wrap}}
      ` }} />
    </div>
  );
}
