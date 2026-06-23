// Apply a Meshy library animation to a rigged character; download the animated GLB.
// Usage: node scripts/anim-character.mjs --rig-task-id <id> --action-id 0 --name character --label idle
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.MESHY_API_KEY;
if (!KEY) { console.error('MESHY_API_KEY not set'); process.exit(1); }
const BASE = 'https://api.meshy.ai/openapi/v1';
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const rig = get('rig-task-id', '');
const action = parseInt(get('action-id', '0'), 10);
const name = get('name', 'character');
const label = get('label', 'anim');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cr = await fetch(`${BASE}/animations`, { method: 'POST', headers: H, body: JSON.stringify({ rig_task_id: rig, action_id: action }) });
const cj = await cr.json();
if (!cr.ok) throw new Error('create failed ' + cr.status + ': ' + JSON.stringify(cj));
const id = cj.result;
console.log('▸ animation task', id, '(action', action + ')');
let res;
for (let i = 0; i < 180; i++) {
  const t = await (await fetch(`${BASE}/animations/${id}`, { headers: H })).json();
  process.stdout.write(`\r  ${t.status} ${t.progress || 0}%      `);
  if (t.status === 'SUCCEEDED') { res = t.result || t; process.stdout.write('\n'); break; }
  if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error('\n' + t.status + ': ' + JSON.stringify(t.task_error || {}));
  await sleep(5000);
}
const url = res.animation_glb_url || res.model_urls?.glb;
if (!url) throw new Error('no glb url: ' + JSON.stringify(res).slice(0, 300));
await mkdir('public/models', { recursive: true });
const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
await writeFile(`public/models/${name}-${label}.glb`, buf);
console.log(`✓ public/models/${name}-${label}.glb (${(buf.length / 1024) | 0} KB)`);
