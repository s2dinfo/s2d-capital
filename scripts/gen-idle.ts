// Subtle portrait idle clip from a still (Replicate / xai/grok-imagine-video).
//   npm run gen:idle -- --image copper-question.png --out copper-question-idle
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'xai/grok-imagine-video';

const IDLE_PROMPT =
  'Very subtle idle portrait animation. The man holds a perfectly steady, calm gaze directly at the camera. His mouth stays fully closed the entire time. Almost no blinking — at most one slow, gentle blink, or none at all. Motion is limited to barely perceptible breathing in the chest and shoulders, and an extremely slight natural head sway. Keep his exact appearance, expression, clothing, lighting, and framing from the source image unchanged.';

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
if (!TOKEN) {
  console.error('Missing REPLICATE_API_TOKEN in .env.local');
  process.exit(1);
}

const replicate = new Replicate({ auth: TOKEN });

async function generateIdle(imagePath: string, outPath: string) {
  const imageUri = 'data:image/png;base64,' + readFileSync(imagePath).toString('base64');
  process.stdout.write(`  … generating ${outPath} `);
  const output: any = await replicate.run(MODEL as `${string}/${string}`, {
    input: {
      prompt: IDLE_PROMPT,
      image: imageUri,
      duration: 6,
      resolution: '720p',
      aspect_ratio: 'auto',
    },
  });
  const item = Array.isArray(output) ? output[0] : output;
  const url =
    typeof item === 'string'
      ? item
      : typeof item?.url === 'function'
        ? String(item.url())
        : String(item);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  console.log('✓ saved');
}

async function main() {
  const image = arg('image');
  const out = arg('out');
  if (!image || !out) {
    console.error('need --image <file in public/characters> --out <basename without .mp4>');
    process.exit(1);
  }
  const imagePath = resolve(ROOT, 'public/characters', image);
  const outPath = resolve(ROOT, 'public/characters', out + '.mp4');
  if (!existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    process.exit(1);
  }
  try {
    await generateIdle(imagePath, outPath);
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`);
    process.exit(1);
  }
}

main();