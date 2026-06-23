// Rig a Meshy text-to-3d character; download the rigged GLB + the auto-returned walk/run anims.
// Usage: node scripts/rig-character.mjs --name character --task-id <refine_task_id> [--height 1.7]
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.MESHY_API_KEY;
if (!KEY) { console.error('MESHY_API_KEY not set'); process.exit(1); }
const BASE = 'https://api.meshy.ai/openapi/v1';
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const name = get('name', 'character');
const taskId = get('task-id', '');
const height = +get('height', '1.7');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cr = await fetch(`${BASE}/rigging`, { method: 'POST', headers: H, body: JSON.stringify({ input_task_id: taskId, height_meters: height }) });
const cj = await cr.json();
if (!cr.ok) throw new Error('rig create failed ' + cr.status + ': ' + JSON.stringify(cj));
const rigId = cj.result;
console.log('▸ rig task', rigId);
let res;
for (let i = 0; i < 180; i++) {
  const t = await (await fetch(`${BASE}/rigging/${rigId}`, { headers: H })).json();
  process.stdout.write(`\r  ${t.status} ${t.progress || 0}%      `);
  if (t.status === 'SUCCEEDED') { res = t.result; process.stdout.write('\n'); break; }
  if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error('\nrig ' + t.status + ': ' + JSON.stringify(t.task_error || {}));
  await sleep(5000);
}
if (!res) throw new Error('timeout');

await mkdir('public/models', { recursive: true });
async function dl(url, file) { if (!url) { console.log('  (no url) ' + file); return; } const b = Buffer.from(await (await fetch(url)).arrayBuffer()); await writeFile(`public/models/${file}`, b); console.log(`✓ ${file} (${(b.length / 1024) | 0} KB)`); }

await dl(res.rigged_character_glb_url, `${name}-rigged.glb`);
const ba = res.basic_animations;
let anims = [];
if (Array.isArray(ba)) anims = ba.map((a) => ({ n: a.name || a.action || a.type || 'anim', glb: a.glb_url || a.url || a.animation_glb_url }));
else if (ba && typeof ba === 'object') anims = Object.entries(ba).map(([k, v]) => ({ n: k, glb: typeof v === 'string' ? v : (v && (v.glb_url || v.url || v.glb)) }));
for (const a of anims) await dl(a.glb, `${name}-${a.n}.glb`);
console.log('basic_animations raw:', JSON.stringify(ba).slice(0, 600));
