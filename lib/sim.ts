// BOTTLENECK — the AI supply chain as a flow game. Pure, no React.
// You allocate Capital each quarter to widen the binding link of the real 9-node
// chain. Compute delivered = the MINIMUM across the chain (Liebig's law), never the
// sum. A rising demand clock + a 6-quarter copper lead time + scripted shocks squeeze
// you. Both meter walls kill. Stage 0: prove the moving-bottleneck loop is fun.

export type NodeId = 'ASML' | 'TSMC' | 'Nvidia' | 'Copper' | 'Power' | 'Oil' | 'RareEarth';
export const FLOW_NODES: NodeId[] = ['ASML', 'TSMC', 'Nvidia', 'Copper', 'Power', 'Oil', 'RareEarth'];

export const NODE_META: Record<NodeId, { label: string; sub: string; leadTime: number; accent: string }> = {
  ASML: { label: 'ASML', sub: 'EUV machines', leadTime: 0, accent: '#ff9a3a' },
  TSMC: { label: 'TSMC', sub: 'the fabs', leadTime: 0, accent: '#3aa0ff' },
  Nvidia: { label: 'Nvidia', sub: 'the GPUs', leadTime: 0, accent: '#1affa0' },
  Power: { label: 'Power', sub: 'the grid', leadTime: 0, accent: '#ffd23a' },
  Copper: { label: 'Copper', sub: 'the metal · 6q lead', leadTime: 6, accent: '#e8843a' },
  Oil: { label: 'Oil & gas', sub: 'the fuel', leadTime: 0, accent: '#d4a23a' },
  RareEarth: { label: 'Rare earths', sub: 'the magnets', leadTime: 0, accent: '#e0483a' },
};

export type ShockEffect = { node?: NodeId; capMul?: number; capital?: number; demandStep?: number };
export type Shock = { id: string; label: string; detail: string; reality: string; effect: ShockEffect };

const SHOCKS: Record<string, Shock> = {
  taiwan: { id: 'taiwan', label: 'Taiwan Strait blockade', detail: 'TSMC fabs frozen — capacity halved.', reality: '~90% of advanced chips are made on one island; a blockade freezes the whole chain.', effect: { node: 'TSMC', capMul: 0.5 } },
  rareearth: { id: 'rareearth', label: 'China rare-earth export curb', detail: 'Rare-earth supply slashed.', reality: 'China refines ~90% of rare earths and has used export controls as leverage.', effect: { node: 'RareEarth', capMul: 0.45 } },
  grid: { id: 'grid', label: 'Virginia grid moratorium', detail: 'New power hookups paused — grid cut.', reality: 'Grids can’t keep up with datacenter demand; some regions paused new hookups.', effect: { node: 'Power', capMul: 0.7 } },
  copper: { id: 'copper', label: 'Chilean copper strike', detail: 'Copper supply disrupted.', reality: 'Chile produces ~a quarter of world copper; strikes and water disputes cut output.', effect: { node: 'Copper', capMul: 0.7 } },
  oil: { id: 'oil', label: 'Oil price shock', detail: 'Fuel costs spike; capital squeezed.', reality: 'Energy shocks ripple straight into the cost of running everything.', effect: { node: 'Oil', capMul: 0.75, capital: -6 } },
  breakthrough: { id: 'breakthrough', label: 'Efficiency breakthrough', detail: 'Models get cheaper to run — demand eases.', reality: 'Algorithmic efficiency gains can temporarily blunt the compute-demand curve.', effect: { demandStep: -1 } },
};

// shock telegraphed DURING this turn, fires when you commit it
const SCHEDULE: Record<number, string> = { 2: 'taiwan', 3: 'rareearth', 4: 'grid', 5: 'breakthrough', 6: 'copper', 8: 'oil' };

export const RUN_LENGTH = 10;
const CAP_PER_UNIT = 2;       // 1 capital -> +2 capacity
const DEMAND_GROWTH = 1.11;

export type RunState = {
  turn: number;
  score: number;              // cumulative compute delivered
  capital: number;            // budget remaining this quarter
  budget: number;             // this quarter's starting budget
  demand: number;
  meters: { output: number; resilience: number; sustainability: number };
  cap: Record<NodeId, number>;
  queue: Record<NodeId, number[]>;   // queue[k] = capacity arriving in k quarters
  pendingShock: Shock | null;        // telegraphed; fires on commit
  log: string[];
  over: null | { win: boolean; title: string; reason: string; reality?: string };
};

export function createRun(): RunState {
  return {
    turn: 1,
    score: 0,
    capital: 16,
    budget: 16,
    demand: 30,
    meters: { output: 55, resilience: 62, sustainability: 60 },
    cap: { ASML: 42, TSMC: 40, Nvidia: 34, Power: 34, Copper: 38, Oil: 36, RareEarth: 50 },
    queue: { ASML: [], TSMC: [], Nvidia: [], Power: [], Copper: [], Oil: [], RareEarth: [] },
    pendingShock: SCHEDULE[1] ? SHOCKS[SCHEDULE[1]] : null,
    log: ['Q1 — the AI boom ignites. Keep the chain alive.'],
    over: null,
  };
}

const clamp = (x: number) => Math.max(0, Math.min(100, x));
const r1 = (x: number) => Math.round(x * 10) / 10;

// Liebig flow solver: each node ships min(own capacity, its inputs). One pass.
export function resolveFlow(cap: Record<NodeId, number>): { t: Record<NodeId, number>; delivered: number; binding: NodeId } {
  const t = {} as Record<NodeId, number>;
  t.ASML = cap.ASML;
  t.Copper = cap.Copper;
  t.Oil = cap.Oil;
  t.RareEarth = cap.RareEarth;
  t.TSMC = Math.min(cap.TSMC, t.ASML);                                  // fabs need EUV machines
  t.Power = Math.min(cap.Power, t.Oil, t.Copper);                        // grid needs fuel + copper
  t.Nvidia = Math.min(cap.Nvidia, t.TSMC, t.Power, t.Copper, t.RareEarth); // GPUs need it all
  const delivered = t.Nvidia;

  // root bottleneck: the most-upstream capacity-limited node whose throughput == delivered
  const inputs: Record<NodeId, number[]> = {
    ASML: [], Copper: [], Oil: [], RareEarth: [],
    TSMC: [t.ASML], Power: [t.Oil, t.Copper], Nvidia: [t.TSMC, t.Power, t.Copper, t.RareEarth],
  };
  const order: NodeId[] = ['ASML', 'Copper', 'Oil', 'RareEarth', 'TSMC', 'Power', 'Nvidia'];
  let binding: NodeId = 'Nvidia';
  for (const n of order) {
    const ins = inputs[n];
    const minIn = ins.length ? Math.min(...ins) : Infinity;
    if (cap[n] <= minIn + 0.001 && Math.abs(t[n] - delivered) < 0.001) { binding = n; break; }
  }
  return { t, delivered, binding };
}

// invest capital into a node — instant (leadTime 0) or queued (Copper = 6 quarters)
export function invest(s: RunState, node: NodeId, capitalSpent: number): RunState {
  if (s.over || capitalSpent <= 0 || s.capital < capitalSpent) return s;
  const next = clone(s);
  next.capital -= capitalSpent;
  const added = capitalSpent * CAP_PER_UNIT;
  const lt = NODE_META[node].leadTime;
  if (lt === 0) {
    next.cap[node] = r1(next.cap[node] + added);
  } else {
    while (next.queue[node].length < lt) next.queue[node].push(0);
    next.queue[node][lt - 1] = r1((next.queue[node][lt - 1] || 0) + added);
  }
  return next;
}

export function pendingCapacity(s: RunState, node: NodeId): number {
  return r1((s.queue[node] || []).reduce((a, b) => a + b, 0));
}

export function endQuarter(s: RunState): RunState {
  if (s.over) return s;
  const n = clone(s);
  const fired = n.pendingShock;

  // 1. the telegraphed shock fires
  if (fired) {
    const e = fired.effect;
    if (e.node && e.capMul != null) n.cap[e.node] = r1(n.cap[e.node] * e.capMul);
    if (e.capital) n.budget = Math.max(4, n.budget + e.capital);
    if (e.demandStep) n.demand = r1(n.demand * Math.pow(DEMAND_GROWTH, e.demandStep));
    n.log.unshift(`⚠ ${fired.label} — ${fired.detail}`);
  }

  // 2. lead-time queues advance (front arrives, rest shift down)
  for (const node of FLOW_NODES) {
    const q = n.queue[node];
    if (q.length) {
      const arrived = q.shift() || 0;
      if (arrived > 0) { n.cap[node] = r1(n.cap[node] + arrived); n.log.unshift(`✓ +${arrived} ${node} capacity came online.`); }
    }
  }

  // 3. resolve the chain
  const { delivered, binding } = resolveFlow(n.cap);
  const demand = n.demand;
  const shortfall = Math.max(0, demand - delivered);
  n.score = r1(n.score + delivered);

  // 4. meters drift
  n.meters.output = clamp(n.meters.output + (delivered - demand) * 0.45);
  n.meters.resilience = clamp(n.meters.resilience - shortfall * 0.6 + (shortfall === 0 ? 1.5 : 0));
  const fossil = Math.max(0, n.cap.Oil - 30) * 0.14 + Math.max(0, n.cap.Copper - 30) * 0.06 + Math.max(0, n.cap.Power - 34) * 0.05;
  n.meters.sustainability = clamp(n.meters.sustainability - fossil + (fossil < 0.5 ? 1 : 0));
  for (const k of ['output', 'resilience', 'sustainability'] as const) n.meters[k] = r1(n.meters[k]);

  n.log.unshift(`Q${n.turn} — delivered ${r1(delivered)} / demand ${r1(demand)}${shortfall > 0 ? ` · backlog ${r1(shortfall)}` : ' · met'} · bottleneck: ${binding}`);

  // 5. death checks (both walls)
  const death = checkDeath(n, binding);
  if (death) { n.over = death; return n; }

  // 6. win check
  if (n.turn >= RUN_LENGTH) {
    n.over = { win: true, title: 'The boom matured.', reason: `You kept the AI era alive for ${RUN_LENGTH} quarters without it starving or collapsing under its own weight.` };
    return n;
  }

  // 7. next quarter
  n.turn += 1;
  n.demand = r1(n.demand * DEMAND_GROWTH);
  n.budget = r1(15 + n.turn);
  n.capital = n.budget;
  n.pendingShock = SCHEDULE[n.turn] ? SHOCKS[SCHEDULE[n.turn]] : null;
  return n;
}

function checkDeath(n: RunState, binding: NodeId): RunState['over'] {
  const m = n.meters;
  if (m.resilience <= 0) return { win: false, title: 'THE CHAIN SHATTERED', reason: `Resilience hit zero. A backlog spiral broke the chain — the bottleneck was ${binding}.`, reality: 'The AI economy ships at the rate of its single weakest link. Yours snapped.' };
  if (m.output <= 0) return { win: false, title: 'THE BOOM COLLAPSED', reason: 'Output hit zero — you couldn’t feed the demand, and the capital fled.', reality: 'Starve the boom of compute and the whole edifice of valuations unwinds.' };
  if (m.sustainability <= 0) return { win: false, title: 'THE REVOLT', reason: 'Sustainability hit zero — the grid strain, emissions and water costs triggered a political backlash that shut you down.', reality: 'There is no AI build-out without a license to operate from the people and the planet.' };
  if (m.output >= 96) return { win: false, title: 'THE CAPEX BUBBLE POPPED', reason: 'Output overshot the ceiling — you inflated a compute bubble, and it repriced violently.', reality: 'Overbuilding kills as surely as starving. The market punishes hubris.' };
  return null;
}

function clone(s: RunState): RunState {
  return {
    ...s,
    meters: { ...s.meters },
    cap: { ...s.cap },
    queue: Object.fromEntries(FLOW_NODES.map((k) => [k, [...s.queue[k]]])) as Record<NodeId, number[]>,
    log: [...s.log],
    over: s.over ? { ...s.over } : null,
  };
}
