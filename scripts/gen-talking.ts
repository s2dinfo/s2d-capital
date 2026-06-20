// Turn a character IMAGE + an AUDIO clip into a lip-synced talking video
// (Replicate / SadTalker).  →  public/talking/<out>.mp4
//   npm run gen:talking -- --image copper-stylized.png --audio <id>.mp3 --out copper-talk
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fromEnvLocal(key: string): string {
  const p = resolve(ROOT, '.env.local');
  const txt = existsSync(p) ? readFileSync(p, 'utf8') : '';
  const m = txt.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return (m ? m[1] : process.env[key] || '').trim();
}
const arg = (n: string) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : undefined; };

const TOKEN = fromEnvLocal('REPLICATE_API_TOKEN');
if (!TOKEN) { console.error('Missing REPLICATE_API_TOKEN'); process.exit(1); }
const replicate = new Replicate({ auth: TOKEN });

async function main() {
  const img = arg('image'), aud = arg('audio'), out = arg('out') || 'talk';
  if (!img || !aud) { console.error('need --image <file in public/characters> --audio <file in public/audio>'); process.exit(1); }
  const imgPath = resolve(ROOT, 'public/characters', img);
  const audPath = resolve(ROOT, 'public/audio', aud);
  if (!existsSync(imgPath) || !existsSync(audPath)) { console.error('image or audio not found'); process.exit(1); }

  // downscale the image to keep the upload payload small
  const jpg = await sharp(imgPath).resize(512, 512, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
  const imageUri = 'data:image/jpeg;base64,' + jpg.toString('base64');
  const audioUri = 'data:audio/mpeg;base64,' + readFileSync(audPath).toString('base64');

  const MODEL = 'zsxkib/memo'; // diffusion-based, emotion-aware — much better lip-sync than SadTalker
  const meta: any = await fetch(`https://api.replicate.com/v1/models/${MODEL}`, { headers: { Authorization: `Bearer ${TOKEN}` } }).then((r) => r.json());
  const version = meta?.latest_version?.id;
  if (!version) throw new Error('could not resolve model version');
  console.log('rendering talking video (MEMO — higher quality, takes a few minutes)…');
  const output: any = await replicate.run(`${MODEL}:${version}`, {
    input: { image: imageUri, audio: audioUri, resolution: 512, fps: 25, max_audio_seconds: 8 },
  });
  const item = Array.isArray(output) ? output[0] : output;
  const url = typeof item === 'string' ? item : typeof item?.url === 'function' ? String(item.url()) : String(item);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const dir = resolve(ROOT, 'public/talking'); mkdirSync(dir, { recursive: true });
  const file = resolve(dir, out + '.mp4');
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log('✓ saved ' + file);
}
main().catch((e) => { console.error('✗ ' + (e?.message || e)); process.exit(1); });
