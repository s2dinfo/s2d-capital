// Autonomous Meshy image-to-3D: a local portrait PNG -> a real, textured 3D character GLB.
// This is how the chip-chain figures become REAL 3D characters (not holograms): each
// Grok portrait is turned into a standing 3D model with the person's likeness.
// Usage: node scripts/gen-from-image.mjs --name jensen --image public/characters/jensen-figure.png [--out public/models/figures]
// Needs MESHY_API_KEY in env (load from .env.local before running).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname } from 'node:path';

const KEY = process.env.MESHY_API_KEY;
if (!KEY) { console.error('MESHY_API_KEY not set'); process.exit(1); }
const BASE = 'https://api.meshy.ai/openapi';
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const name = get('name', 'figure');
const image = get('image');
const outDir = get('out', 'public/models/figures');
if (!image) { console.error('--image <path> required'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ext = extname(image).toLowerCase();
const mime = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/png';
const dataUri = `data:${mime};base64,${(await readFile(image)).toString('base64')}`;

async function create() {
  const body = { image_url: dataUri, enable_pbr: false, should_remesh: true, should_texture: true, target_formats: ['glb'] };
  const r = await fetch(`${BASE}/v1/image-to-3d`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error('create failed ' + r.status + ': ' + JSON.stringify(j));
  return j.result;
}
async function poll(id) {
  for (let i = 0; i < 180; i++) {
    const j = await (await fetch(`${BASE}/v1/image-to-3d/${id}`, { headers: H })).json();
    process.stdout.write(`\r  ${j.status} ${j.progress || 0}%      `);
    if (j.status === 'SUCCEEDED') { process.stdout.write('\n'); return j; }
    if (j.status === 'FAILED' || j.status === 'CANCELED') throw new Error('\ntask ' + j.status + ': ' + JSON.stringify(j.task_error || {}));
    await sleep(5000);
  }
  throw new Error('\ntimeout');
}

console.log(`▸ image-to-3D  ${name}  <-  ${image}`);
const id = await create();
console.log('  task:', id);
const task = await poll(id);
const glb = task.model_urls?.glb;
if (!glb) throw new Error('no glb in result: ' + JSON.stringify(task.model_urls || {}));
await mkdir(outDir, { recursive: true });
const buf = Buffer.from(await (await fetch(glb)).arrayBuffer());
await writeFile(`${outDir}/${name}.glb`, buf);
console.log(`✓ ${outDir}/${name}.glb  (${(buf.length / 1024) | 0} KB, ${task.consumed_credits ?? '?'} credits, task ${id})`);
