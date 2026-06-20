// Generate stylised character portraits with Replicate (Flux).
//   public/characters/<id>.png
// Two modes:
//   npm run gen:visuals                         → every encounter with an imagePrompt
//   npm run gen:visuals -- --prompt "…" --out x → one-off, saved as <x>.png
// Idempotent: skips a character whose image already exists (unless --force).
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';
import { ENCOUNTERS } from '../lib/encounters';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'black-forest-labs/flux-1.1-pro'; // top-quality; swap to flux-dev for cheaper

// Shared art direction so every generated character matches (stylised 3D
// game-character look, NOT photoreal). imagePrompt / --prompt hold only the SUBJECT.
const STYLE_PRE = 'Stylized 3D character render in the style of a high-end animated film and AAA game cinematic — clearly a CGI character, not a photograph, not a real person, slightly stylized friendly proportions, soft subsurface skin shading, smooth detailed 3D look: ';
const STYLE_POST = '. Warm gold rim lighting, deep navy studio backdrop, cinematic depth of field, vertical 3:4 portrait, head and shoulders.';
const buildPrompt = (subject: string) => STYLE_PRE + subject + STYLE_POST;

function fromEnvLocal(key: string): string {
  const p = resolve(ROOT, '.env.local');
  const txt = existsSync(p) ? readFileSync(p, 'utf8') : '';
  const m = txt.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return (m ? m[1] : process.env[key] || '').trim();
}
function arg(name: string): string | undefined {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const TOKEN = fromEnvLocal('REPLICATE_API_TOKEN');
if (!TOKEN) { console.error('Missing REPLICATE_API_TOKEN in .env.local'); process.exit(1); }
const replicate = new Replicate({ auth: TOKEN });
const OUT = resolve(ROOT, 'public/characters');
mkdirSync(OUT, { recursive: true });

async function generate(prompt: string, outName: string) {
  const file = resolve(OUT, outName + '.png');
  if (existsSync(file) && arg('force') === undefined && !process.argv.includes('--force')) {
    console.log(`  • ${outName}.png exists — skipping (use --force to redo)`);
    return;
  }
  process.stdout.write(`  … generating ${outName}.png `);
  const output: any = await replicate.run(MODEL as `${string}/${string}`, {
    input: { prompt, aspect_ratio: '3:4', output_format: 'png', prompt_upsampling: true, safety_tolerance: 2 },
  });
  // Replicate returns either a URL string, a FileOutput (.url()), or an array of those.
  const item = Array.isArray(output) ? output[0] : output;
  const url = typeof item === 'string' ? item : typeof item?.url === 'function' ? String(item.url()) : String(item);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ saved`);
}

async function main() {
  const p = arg('prompt');
  if (p) { await generate(process.argv.includes('--raw') ? p : buildPrompt(p), arg('out') || 'output'); return; }
  let any = false;
  for (const [id, s] of Object.entries(ENCOUNTERS)) {
    const subject = (s as any).imagePrompt as string | undefined;
    if (!subject) continue;
    any = true;
    console.log(`${id} — ${s.name}`);
    try { await generate(buildPrompt(subject), id.toLowerCase()); } catch (e: any) { console.log(`  ✗ ${e.message}`); }
  }
  if (!any) console.log('No encounters have an imagePrompt, and no --prompt given. Nothing to do.');
}
main();
