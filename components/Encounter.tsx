'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { lineAudioId, type EncounterScript, type Line } from '@/lib/encounters';

// ── The encounter engine: drives any EncounterScript. Meet a figure, hear their
// real (public) problem, make the decision they faced, see the consequence,
// then travel onward. Core loop: travel → meet → DECIDE → learn. ──

type Stage = 'intro' | 'decide' | 'result' | 'outro' | 'done';

export default function Encounter({
  script,
  priorChoice = null,
  onClose,
  onDecision,
  onNext,
}: {
  script: EncounterScript;
  priorChoice?: string | null;
  onClose: () => void;
  onDecision?: (choiceId: string) => void;
  onNext?: (node: string) => void;
}) {
  const [stage, setStage] = useState<Stage>('intro');
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [sound, setSound] = useState(true);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null); // keep a ref so Chrome doesn't GC the utterance mid-speech
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Prepend the figure's reaction to what you decided at the previous stop.
  const intro: Line[] = useMemo(() => {
    const react = priorChoice && script.priorReactions?.[priorChoice];
    return react ? [{ who: 'speaker', text: react } as Line, ...script.intro] : script.intro;
  }, [script, priorChoice]);

  const pick = (c: string) => { setChoice(c); setStage('result'); onDecision?.(c); };
  const line = stage === 'intro' ? intro[idx] : stage === 'outro' ? script.outro[idx] : null;
  const adv = (arr: Line[], nextStage: Stage) => () => (idx < arr.length - 1 ? setIdx(idx + 1) : (setIdx(0), setStage(nextStage)));

  // Voice: a generic (non-cloned) TTS reads the actual encounter lines aloud as
  // they appear — the video supplies the moving mouth, this supplies the words.
  const speakText = line
    ? line.text
    : stage === 'decide'
    ? script.decision.prompt
    : stage === 'result' && choice
    ? `${script.outcomes[choice].verdict}. ${script.outcomes[choice].text}`
    : stage === 'done'
    ? `${script.done.verdict}. ${script.done.text}`
    : '';
  // Stop whatever is currently playing (audio clip and/or browser TTS).
  const stopVoice = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try { window.speechSynthesis?.cancel(); } catch {}
  };
  useEffect(() => {
    stopVoice();
    if (!sound || !speakText) return;
    const speakTTS = () => {
      const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(speakText);
      u.rate = 0.98;
      uttRef.current = u;
      synth.speak(u);
    };
    // Play the pre-rendered ElevenLabs clip; fall back to browser TTS if it's
    // missing (line not generated yet) or playback is blocked.
    if (script.voiceId) {
      const audio = new Audio(`/audio/${lineAudioId(script.voiceId, speakText)}.mp3`);
      audioRef.current = audio;
      let fellBack = false;
      const fallback = () => { if (fellBack) return; fellBack = true; speakTTS(); };
      audio.addEventListener('error', fallback, { once: true });
      audio.play().catch(fallback);
      return () => stopVoice();
    }
    const t = setTimeout(speakTTS, 80);
    return () => { clearTimeout(t); stopVoice(); };
  }, [speakText, sound]);
  useEffect(() => () => stopVoice(), []);

  return (
    <motion.div className="enc-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="enc-scene"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="enc-sound" onClick={() => setSound((s) => !s)} aria-label="Toggle voice">{sound ? '🔊' : '🔇'}</button>
        <button className="enc-close" onClick={() => { stopVoice(); onClose(); }} aria-label="Leave">×</button>

        <div className="enc-row">
        {/* Character portrait — drop a stylised image at script.portrait */}
        <div className="enc-portrait">
          {script.portrait && !imgError ? (
            /\.(mp4|webm|m4v)$/i.test(script.portrait) ? (
              <video src={script.portrait} className="enc-portrait-img" autoPlay loop muted playsInline onError={() => setImgError(true)} />
            ) : (
              <img src={script.portrait} alt={script.name} className="enc-portrait-img" onError={() => setImgError(true)} />
            )
          ) : (
            <div className="enc-portrait-ph" aria-hidden>
              <svg viewBox="0 0 64 64" className="enc-ph-bust"><path d="M32 34c7 0 12-6 12-13S39 8 32 8 20 14 20 21s5 13 12 13zm0 4c-11 0-20 6-20 14v4h40v-4c0-8-9-14-20-14z" /></svg>
              <span className="enc-ph-initial">{script.name.charAt(0)}</span>
            </div>
          )}
          <span className="enc-portrait-cap">{script.tag}</span>
        </div>

        <div className="enc-main">
        <div className="enc-plate">
          <div className="enc-place">{script.locationTag}</div>
          <div className="enc-name">{script.name}</div>
          <div className="enc-role">{script.role}</div>
        </div>

        <div className="enc-body">
          <AnimatePresence mode="wait">
            {line && (
              <motion.div key={stage + idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                {line.who === 'narration'
                  ? <p className="enc-narration">{line.text}</p>
                  : <p className="enc-says"><span className="enc-tag">{script.tag}</span>{line.text}</p>}
              </motion.div>
            )}

            {stage === 'decide' && (
              <motion.div key="decide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <p className="enc-prompt">{script.decision.prompt}</p>
                <div className="enc-choices">
                  {script.decision.options.map((o) => (
                    <button key={o.id} className="enc-choice" onClick={() => pick(o.id)}>
                      <span className="enc-choice-h">{o.label}</span>
                      <span className="enc-choice-s">{o.sub}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === 'result' && choice && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="enc-verdict">{script.outcomes[choice].verdict}</div>
                <p className="enc-result-text">{script.outcomes[choice].text}</p>
              </motion.div>
            )}

            {stage === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="enc-verdict">{script.done.verdict}</div>
                <p className="enc-result-text">{script.done.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="enc-foot">
          {stage === 'intro' && <button className="enc-next" onClick={adv(intro, 'decide')}>Continue →</button>}
          {stage === 'result' && <button className="enc-next" onClick={() => { setIdx(0); setStage('outro'); }}>Continue →</button>}
          {stage === 'outro' && <button className="enc-next" onClick={adv(script.outro, 'done')}>Continue →</button>}
          {stage === 'done' && (
            <div className="enc-end">
              {script.next && onNext && (
                <button className="enc-go" onClick={() => onNext(script.next!.node)}>{script.next.label}</button>
              )}
              {script.article && <Link href={script.article} className="enc-read">Read the full story →</Link>}
              <button className="enc-return" onClick={onClose}>Return to the world</button>
            </div>
          )}
          <div className="enc-disclaimer">Dramatized from public statements · facts based on public record</div>
        </div>
        </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .enc-backdrop{position:fixed;inset:0;z-index:60;background:rgba(6,9,18,0.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px}
        .enc-scene{position:relative;width:min(95vw,760px);background:linear-gradient(160deg,rgba(20,25,44,0.96),rgba(12,15,31,0.97));border:1px solid rgba(212,184,92,0.22);border-radius:20px;padding:28px 30px 22px;box-shadow:0 30px 90px rgba(0,0,0,0.6)}
        .enc-row{display:flex;gap:24px;align-items:flex-start}
        .enc-main{flex:1;min-width:0;display:flex;flex-direction:column}
        .enc-portrait{flex:0 0 172px;display:flex;flex-direction:column;align-items:center;gap:10px}
        .enc-portrait-img,.enc-portrait-ph{width:172px;height:228px;border-radius:14px;border:1px solid rgba(212,184,92,0.38);object-fit:cover;background:radial-gradient(circle at 50% 28%,#262c54,#0d1120)}
        .enc-portrait-ph{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .enc-ph-bust{position:absolute;bottom:-8px;width:150px;height:150px;fill:rgba(255,255,255,0.07)}
        .enc-ph-initial{font-family:var(--font-serif);font-size:3.6rem;color:rgba(212,184,92,0.9);position:relative}
        .enc-portrait-cap{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.2em;color:rgba(255,255,255,0.42)}
        @media(max-width:620px){.enc-row{flex-direction:column;align-items:center}.enc-portrait{flex-direction:row;gap:14px;flex:none}.enc-portrait-img,.enc-portrait-ph{width:90px;height:116px}.enc-ph-initial{font-size:2.2rem}.enc-ph-bust{width:80px;height:80px}}
        .enc-close{position:absolute;top:14px;right:18px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:26px;line-height:1;cursor:pointer}
        .enc-sound{position:absolute;top:16px;right:50px;background:none;border:none;font-size:15px;line-height:1;cursor:pointer;opacity:0.7}
        .enc-sound:hover{opacity:1}
        .enc-close:hover{color:#fff}
        .enc-plate{border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;margin-bottom:20px}
        .enc-place{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.22em;color:var(--gold-light,#D4B85C);margin-bottom:8px}
        .enc-name{font-family:var(--font-serif);font-size:1.7rem;color:#fff;line-height:1}
        .enc-role{font-family:var(--font-sans);font-size:0.78rem;color:rgba(255,255,255,0.5);margin-top:4px}
        .enc-body{min-height:150px;display:flex;align-items:center}
        .enc-narration{font-family:var(--font-serif);font-style:italic;font-size:1.05rem;color:rgba(255,255,255,0.62);line-height:1.6;margin:0}
        .enc-says{font-family:var(--font-sans);font-size:1.02rem;color:rgba(255,255,255,0.92);line-height:1.7;margin:0}
        .enc-tag{display:block;font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.2em;color:var(--gold-light,#D4B85C);margin-bottom:8px}
        .enc-prompt{font-family:var(--font-serif);font-size:1.15rem;color:#fff;margin:0 0 16px}
        .enc-choices{display:flex;flex-direction:column;gap:10px}
        .enc-choice{text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 16px;cursor:pointer;transition:all 0.2s}
        .enc-choice:hover{border-color:rgba(212,184,92,0.5);background:rgba(212,184,92,0.06);transform:translateY(-1px)}
        .enc-choice-h{display:block;font-family:var(--font-sans);font-weight:600;color:#fff;font-size:0.95rem;margin-bottom:3px}
        .enc-choice-s{display:block;font-family:var(--font-sans);font-size:0.78rem;color:rgba(255,255,255,0.5)}
        .enc-verdict{font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold-light,#D4B85C);margin-bottom:12px}
        .enc-result-text{font-family:var(--font-sans);font-size:0.98rem;color:rgba(255,255,255,0.85);line-height:1.7;margin:0}
        .enc-foot{margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)}
        .enc-next,.enc-go{background:var(--gold-light,#D4B85C);color:#1A1A2E;border:none;border-radius:10px;padding:11px 22px;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.06em;font-weight:600;cursor:pointer;transition:filter 0.2s}
        .enc-next:hover,.enc-go:hover{filter:brightness(1.1)}
        .enc-end{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
        .enc-read{font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.06em;color:var(--gold-light,#D4B85C);text-decoration:none;background:rgba(212,184,92,0.1);border:1px solid rgba(212,184,92,0.35);border-radius:10px;padding:10px 16px}
        .enc-read:hover{background:rgba(212,184,92,0.18)}
        .enc-return{background:none;border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:10px 16px;font-family:var(--font-mono);font-size:0.7rem;color:rgba(255,255,255,0.65);cursor:pointer}
        .enc-return:hover{color:#fff;border-color:rgba(255,255,255,0.3)}
        .enc-disclaimer{font-family:var(--font-mono);font-size:0.52rem;letter-spacing:0.08em;color:rgba(255,255,255,0.28);margin-top:14px}
        @media(max-width:560px){.enc-scene{padding:24px 20px}.enc-name{font-size:1.4rem}}
      ` }} />
    </motion.div>
  );
}
