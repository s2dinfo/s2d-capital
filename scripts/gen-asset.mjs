// Autonomous Meshy asset generator: text prompt -> 3D model -> downloaded GLB.
// Usage: node scripts/gen-asset.mjs --name car --prompt "low poly sedan" [--poly lowpoly|standard] [--pose t-pose] [--refine]
// Needs MESHY_API_KEY in env (load from .env.local before running).
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.MESHY_API_KEY;
if (!KEY) { console.error('MESHY_API_KEY not set'); process.exit(1); }
const BASE = 'https://api.meshy.ai/openapi';
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const name = get('name', 'asset');
const prompt = get('prompt', 'a low poly object');
const model_type = get('poly', 'lowpoly') === 'standard' ? 'standard' : 'lowpoly';
const pose_mode = get('pose', '');           // 't-pose' for characters meant for rigging
const doRefine = get('refine', false) !== false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function create(body) {
  const r = await fetch(`${BASE}/v2/text-to-3d`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error('create failed ' + r.status + ': ' + JSON.stringify(j));
  return j.result;
}
async function poll(id) {
  for (let i = 0; i < 150; i++) {
    const j = await (await fetch(`${BASE}/v2/text-to-3d/${id}`, { headers: H })).json();
    process.stdout.write(`\r  ${j.status} ${j.progress || 0}%      `);
    if (j.status === 'SUCCEEDED') { process.stdout.write('\n'); return j; }
    if (j.status === 'FAILED' || j.status === 'CANCELED') throw new Error('\ntask ' + j.status + ': ' + JSON.stringify(j.task_error || {}));
    await sleep(5000);
  }
  throw new Error('\ntimeout');
}

console.log(`▸ ${name}: "${prompt}"  [${model_type}${pose_mode ? ', ' + pose_mode : ''}${doRefine ? ', +refine' : ''}]`);
const previewId = await create({ mode: 'preview', prompt, model_type, pose_mode, should_remesh: true, target_formats: ['glb'], origin_at: 'bottom' });
console.log('  preview:', previewId);
let task = await poll(previewId);
if (doRefine) {
  console.log('  refine (texture):');
  const refineId = await create({ mode: 'refine', preview_task_id: previewId, target_formats: ['glb'] });
  task = await poll(refineId);
}
const glb = task.model_urls?.glb;
if (!glb) throw new Error('no glb in result: ' + JSON.stringify(task.model_urls || {}));
await mkdir('public/models', { recursive: true });
const buf = Buffer.from(await (await fetch(glb)).arrayBuffer());
await writeFile(`public/models/${name}.glb`, buf);
console.log(`✓ public/models/${name}.glb  (${(buf.length / 1024) | 0} KB, ${task.consumed_credits ?? '?'} credits)`);
