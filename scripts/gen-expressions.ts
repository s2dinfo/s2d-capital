// Edit a character portrait's facial expression while preserving everything else.
//   npm run gen:expressions -- --image copper-stylized.png --variant question
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'black-forest-labs/flux-kontext-pro';

const VARIANTS = {
  question:
    'Change only the facial expression to a thoughtful, questioning look: head tilted very slightly, one eyebrow raised a little, contemplative eyes with subtle curiosity. Keep the mouth fully closed. Keep the exact same man, face, hair, beard, skin, lighting, orange jacket, shirt, pose, framing, and blurred background unchanged for smooth cross-fade.',
  serious:
    'Change only the facial expression to a serious, concerned look: slight frown, brow slightly furrowed, steady direct gaze. Keep the mouth fully closed. Keep the exact same man, face, hair, beard, skin, lighting, orange jacket, shirt, pose, framing, and blurred background unchanged for smooth cross-fade.',
  resolved:
    'Change only the facial expression to a calm, knowing, slightly resolved look: faint understanding and quiet certainty in the eyes, relaxed settled brow without smiling. Keep the mouth fully closed. Keep the exact same man, face, hair, beard, skin, lighting, orange jacket, shirt, pose, framing, and blurred background unchanged for smooth cross-fade.',
} as const;

type Variant = keyof typeof VARIANTS;

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

async function editExpression(imagePath: string, variant: Variant, outPath: string) {
  const imageUri = 'data:image/png;base64,' + readFileSync(imagePath).toString('base64');
  process.stdout.write(`  … generating ${variant} `);
  const output: any = await replicate.run(MODEL as `${string}/${string}`, {
    input: {
      prompt: VARIANTS[variant],
      input_image: imageUri,
      aspect_ratio: 'match_input_image',
      output_format: 'png',
      safety_tolerance: 2,
      prompt_upsampling: false,
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
  const image = arg('image') || 'copper-stylized.png';
  const imagePath = resolve(ROOT, 'public/characters', image);
  if (!existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    process.exit(1);
  }

  const variantArg = arg('variant') as Variant | 'all' | undefined;
  const variants: Variant[] =
    !variantArg || variantArg === 'all'
      ? ['question', 'serious', 'resolved']
      : [variantArg];

  for (const v of variants) {
    if (!(v in VARIANTS)) {
      console.error(`Unknown variant: ${v}`);
      process.exit(1);
    }
    const outPath = resolve(ROOT, 'public/characters', `copper-${v}.png`);
    try {
      await editExpression(imagePath, v, outPath);
    } catch (e: any) {
      console.log(`  ✗ ${e.message}`);
      process.exit(1);
    }
  }
}

main();