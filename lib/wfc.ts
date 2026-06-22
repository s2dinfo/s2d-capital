// Minimal Wave Function Collapse over a grid. Each tile has 4 edge "sockets"
// [N, E, S, W]; two tiles fit edge-to-edge when the touching sockets match.
// Collapse the lowest-entropy cell, propagate the constraints, repeat. On a
// contradiction, restart with a fresh seed offset.
import alea from 'alea';

export type WfcTile = { name: string; sockets: [string, string, string, string]; weight: number };

const DIRS: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, E, S, W
const OPP = [2, 3, 0, 1];

function compatible(a: WfcTile, dir: number, b: WfcTile) {
  return a.sockets[dir] === b.sockets[OPP[dir]];
}

function solve(W: number, H: number, tiles: WfcTile[], rng: () => number): number[] {
  const all = tiles.map((_, i) => i);
  const grid: Set<number>[] = Array.from({ length: W * H }, () => new Set(all));
  const idx = (x: number, y: number) => y * W + x;

  function propagate(start: number) {
    const stack = [start];
    while (stack.length) {
      const c = stack.pop()!;
      const cx = c % W, cy = (c / W) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = idx(nx, ny);
        const before = grid[n].size;
        for (const t of [...grid[n]]) {
          let ok = false;
          for (const s of grid[c]) { if (compatible(tiles[s], d, tiles[t])) { ok = true; break; } }
          if (!ok) grid[n].delete(t);
        }
        if (grid[n].size === 0) throw new Error('contradiction');
        if (grid[n].size < before) stack.push(n);
      }
    }
  }

  function collapse(): boolean {
    let best = -1, bestE = Infinity;
    for (let i = 0; i < W * H; i++) { const s = grid[i].size; if (s > 1 && s < bestE) { bestE = s; best = i; } }
    if (best < 0) return false; // fully collapsed
    const opts = [...grid[best]];
    let total = 0; for (const t of opts) total += tiles[t].weight;
    let r = rng() * total, pick = opts[0];
    for (const t of opts) { r -= tiles[t].weight; if (r <= 0) { pick = t; break; } }
    grid[best] = new Set([pick]);
    propagate(best);
    return true;
  }

  while (collapse()) { /* keep collapsing */ }
  return grid.map((s) => [...s][0]);
}

export function generateWFC(W: number, H: number, tiles: WfcTile[], seed: string): number[] {
  for (let attempt = 0; attempt < 30; attempt++) {
    try { return solve(W, H, tiles, alea(seed + '_' + attempt)); } catch { /* contradiction — retry */ }
  }
  return new Array(W * H).fill(0); // fallback: all first tile
}
