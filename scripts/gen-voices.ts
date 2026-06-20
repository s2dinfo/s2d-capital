// Pre-render every encounter line to an ElevenLabs audio file.
//   public/audio/<lineAudioId>.mp3
// Idempotent: only generates lines that don't already exist. Re-run after
// editing dialogue or adding a character.  →  npm run gen:voices
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENCOUNTERS, collectSpeakable, lineAudioId } from '../lib/encounters';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fromEnvLocal(key: string): string {
  const p = resolve(ROOT, '.env.local');
  const txt = existsSync(p) ? readFileSync(p, 'utf8') : '';
  const m = txt.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return (m ? m[1] : process.env[key] || '').trim();
}

const API_KEY = fromEnvLocal('ELEVENLABS_API_KEY');
if (!API_KEY) { console.error('Missing ELEVENLABS_API_KEY in .env.local'); process.exit(1); }

const MODEL = 'eleven_multilingual_v2';
const OUT = resolve(ROOT, 'public/audio');
mkdirSync(OUT, { recursive: true });

async function tts(voiceId: string, text: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
let made = 0, skipped = 0, errs = 0, chars = 0;
for (const [id, script] of Object.entries(ENCOUNTERS)) {
  const voiceId = script.voiceId;
  if (!voiceId) { console.log(`- ${id}: no voiceId — skipped`); continue; }
  const texts = collectSpeakable(script);
  console.log(`\n${id} — ${script.name} (voice ${voiceId}) · ${texts.length} lines`);
  for (const text of texts) {
    const fid = lineAudioId(voiceId, text);
    const file = resolve(OUT, fid + '.mp3');
    if (existsSync(file)) { skipped++; continue; }
    try {
      writeFileSync(file, await tts(voiceId, text));
      made++; chars += text.length;
      console.log(`  ✓ ${fid}.mp3  "${text.slice(0, 46)}${text.length > 46 ? '…' : ''}"`);
    } catch (e: any) { errs++; console.log(`  ✗ ${fid}: ${e.message}`); }
  }
}
console.log(`\nDone — ${made} generated, ${skipped} existed, ${errs} errors · ~${chars} characters used.`);
}
main();
