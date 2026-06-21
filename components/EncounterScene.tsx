'use client';
// ── Any encounter, played out INSIDE a real 3D space. ──
// The figure (a Grok-generated stylized likeness shown as a holographic projection)
// speaks his lines in his real ElevenLabs voice while the hologram glows in time with
// the audio; you make his decision standing in front of him; you see the outcome, the
// "what really happened" reveal, and the world meters shift. Choices persist to the
// shared store so the globe reflects them. Data-driven by ENCOUNTERS[id] + FIGURES[id].
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Sparkles, Billboard, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';
import { FIGURES, resolveFigureId, PRIOR } from '@/lib/figures';
import { useChoices } from '@/lib/choices';
import { worldMeters, MeterBars } from '@/components/WorldReport';

const VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG = `
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform float uTime;
  uniform float uSpeaking;
  uniform float uAmp;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    uv.x += sin(uv.y * 150.0 + uTime * 9.0) * 0.0013 * (0.4 + uAmp);
    vec4 tex = texture2D(uMap, uv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 holo = mix(uTint * 0.7, mix(uTint, vec3(1.0), 0.6), lum);
    vec3 col = mix(tex.rgb * 1.12, holo, 0.4);
    col *= 0.84 + 0.16 * sin(uv.y * 900.0 - uTime * 7.0);
    float bar = abs(fract(uv.y - uTime * 0.10) - 0.5);
    col += smoothstep(0.5, 0.46, bar) * uTint * 0.35;
    col *= 1.0 + 0.32 * uAmp * sin(uTime * 22.0) + 0.10 * uSpeaking;
    float keyed = smoothstep(0.02, 0.17, lum);
    vec2 e = smoothstep(0.0, 0.07, vUv) * smoothstep(0.0, 0.07, 1.0 - vUv);
    float alpha = keyed * e.x * e.y * (0.88 + 0.12 * uSpeaking);
    gl_FragColor = vec4(col, alpha);
  }
`;

function HoloFigure({ image, accent, mouthRef, speaking }: { image: string; accent: string; mouthRef: React.MutableRefObject<number>; speaking: boolean }) {
  const tex = useTexture(image);
  tex.colorSpace = THREE.SRGBColorSpace;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const billRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uMap: { value: tex }, uTint: { value: new THREE.Color(accent) }, uTime: { value: 0 }, uSpeaking: { value: 0 }, uAmp: { value: 0 } }),
    [tex, accent],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = t;
      u.uSpeaking.value += ((speaking ? 1 : 0) - u.uSpeaking.value) * 0.08;
      u.uAmp.value += (mouthRef.current - u.uAmp.value) * 0.4;
    }
    if (billRef.current) billRef.current.position.y = 1.82 + Math.sin(t * 1.1) * 0.03;
  });
  return (
    <Billboard ref={billRef} position={[0, 1.82, 0]}>
      <mesh>
        <planeGeometry args={[2.35, 3.13]} />
        <shaderMaterial ref={matRef} transparent depthWrite={false} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function Stage({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#0a1118" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color={accent} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {[-6, -4.4, -2.8, 2.8, 4.4, 6].map((x, i) => (
        <mesh key={i} position={[x, 3.2, -6.5]}>
          <boxGeometry args={[0.1, 6.4, 0.1]} />
          <meshStandardMaterial color="#08120c" emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 3, -7]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#060a10" metalness={0.3} roughness={0.9} />
      </mesh>
      {[-2.2, 0, 2.2].map((x, i) => (
        <mesh key={`o${i}`} position={[x, 6.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.08, 4, 0.08]} />
          <meshStandardMaterial color="#08120c" emissive="#39e0ff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ image, accent, mouthRef, speaking }: { image: string; accent: string; mouthRef: React.MutableRefObject<number>; speaking: boolean }) {
  return (
    <>
      <color attach="background" args={['#04060b']} />
      <fog attach="fog" args={['#04060b', 8, 26]} />
      <hemisphereLight args={['#2a3340', '#000', 0.5]} />
      <ambientLight intensity={0.18} />
      <spotLight position={[2.5, 7, 5]} angle={0.55} penumbra={0.9} intensity={400} color="#eaf6ff" distance={40} />
      <spotLight position={[-4, 4, -2]} angle={0.7} penumbra={1} intensity={120} color={accent} distance={28} />
      <pointLight position={[3.5, 2, 3]} intensity={26} color="#39e0ff" distance={22} />
      <Suspense fallback={null}>
        <HoloFigure image={image} accent={accent} mouthRef={mouthRef} speaking={speaking} />
      </Suspense>
      <Stage accent={accent} />
      <Sparkles count={70} scale={[14, 7, 10]} position={[0, 3.5, -1]} size={2.2} speed={0.25} color={accent} opacity={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial blur={[300, 110]} resolution={1024} mixBlur={1} mixStrength={45} roughness={0.8} depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#060a11" metalness={0.75} />
      </mesh>
      <OrbitControls makeDefault enablePan={false} minDistance={2.8} maxDistance={9} minPolarAngle={0.6} maxPolarAngle={1.56} autoRotate autoRotateSpeed={0.18} target={[0, 1.65, 0]} />
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.4} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.3} darkness={0.92} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </>
  );
}

type Stage = 'intro' | 'decide' | 'result' | 'outro' | 'done';

export default function EncounterScene({ id }: { id: string }) {
  const key = resolveFigureId(id);
  const script = ENCOUNTERS[key];
  const fig = FIGURES[key];
  const [choices, setChoice] = useChoices();

  const priorChoice = PRIOR[key] ? choices[PRIOR[key]] : null;
  const introLines = useMemo(() => {
    const base = [...script.intro];
    const pr = priorChoice && script.priorReactions ? script.priorReactions[priorChoice] : null;
    if (pr) base.unshift({ who: 'speaker' as const, text: pr });
    return base;
  }, [script, priorChoice]);

  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState<Stage>('intro');
  const [idx, setIdx] = useState(0);
  const [choice, setChoiceState] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const mouthRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const line = stage === 'intro' ? introLines[idx] : stage === 'outro' ? script.outro[idx] : null;
  const currentText = !started ? ''
    : line ? line.text
    : stage === 'result' && choice ? `${script.outcomes[choice].verdict}. ${script.outcomes[choice].text}`
    : stage === 'done' ? `${script.done.verdict}. ${script.done.text}`
    : '';

  const playLine = useCallback((text: string) => {
    if (!text) return;
    if (audioElRef.current) audioElRef.current.pause();
    const audio = new Audio(`/audio/${lineAudioId(script.voiceId || '', text)}.mp3`);
    audioElRef.current = audio;
    let ctx = ctxRef.current;
    if (!ctx) { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); ctxRef.current = ctx; }
    let analyser: AnalyserNode | null = null;
    let data: Uint8Array | null = null;
    try {
      const s = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      s.connect(analyser);
      analyser.connect(ctx.destination);
      data = new Uint8Array(analyser.fftSize);
    } catch {}
    setSpeaking(true);
    const tick = () => {
      if (audio.paused || audio.ended) { mouthRef.current = 0; return; }
      if (analyser && data) {
        analyser.getByteTimeDomainData(data);
        let su = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; su += v * v; }
        mouthRef.current = Math.min(1, Math.sqrt(su / data.length) * 3.4);
      }
      requestAnimationFrame(tick);
    };
    audio.onended = () => { setSpeaking(false); mouthRef.current = 0; };
    audio.onerror = () => { setSpeaking(false); mouthRef.current = 0; };
    ctx.resume().then(() => audio.play()).then(() => tick()).catch(() => setSpeaking(false));
  }, [script.voiceId]);

  // speak each line as it appears
  useEffect(() => { if (started && currentText) playLine(currentText); /* eslint-disable-next-line */ }, [started, stage, idx, choice]);

  const advance = () => {
    if (stage === 'intro') { if (idx < introLines.length - 1) setIdx(idx + 1); else setStage('decide'); }
    else if (stage === 'result') { setStage('outro'); setIdx(0); }
    else if (stage === 'outro') { if (idx < script.outro.length - 1) setIdx(idx + 1); else setStage('done'); }
  };
  const pick = (optId: string) => { setChoice(key, optId); setChoiceState(optId); setStage('result'); };

  const firstName = script.name.split(' ')[0];
  const meters = worldMeters({ ...choices, ...(choice ? { [key]: choice } : {}) });
  const next = script.next;

  return (
    <div className="es-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.7, 5.4], fov: 44 }}>
        <Scene image={fig.image} accent={fig.accent} mouthRef={mouthRef} speaking={speaking} />
      </Canvas>

      <div className="es-ui">
        {/* identity (top-left) */}
        <div className="es-top">
          <Link href="/world" className="es-back">← back to the world</Link>
          <div className="es-eyebrow" style={{ color: fig.accent, textShadow: `0 0 16px ${fig.accent}88` }}>{script.locationTag}</div>
          <h1 className="es-name">{script.name}</h1>
          <div className="es-role">{script.role} — stylized, dramatized from public statements</div>
        </div>

        {/* dialogue + gameplay (bottom) */}
        <div className="es-panel-wrap">
          {!started && (
            <button className="es-cta" style={{ background: `linear-gradient(135deg, ${fig.accent}, ${fig.accent}bb)` }} onClick={() => { setStarted(true); setStage('intro'); setIdx(0); }}>
              ▶ speak with {firstName}
            </button>
          )}

          {started && (stage === 'intro' || stage === 'outro') && line && (
            <div className="es-card">
              {line.who === 'speaker'
                ? <div className="es-speaker" style={{ color: fig.accent }}>{script.tag}</div>
                : <div className="es-speaker es-narr">NARRATION</div>}
              <p className={'es-line' + (line.who === 'narration' ? ' es-italic' : '')}>{line.text}</p>
              <button className="es-next" style={{ borderColor: fig.accent, color: fig.accent }} onClick={advance}>Continue →</button>
            </div>
          )}

          {started && stage === 'decide' && (
            <div className="es-card es-decide">
              <p className="es-prompt">{script.decision.prompt}</p>
              <div className="es-options">
                {script.decision.options.map((o) => (
                  <button key={o.id} className="es-option" style={{ borderColor: `${fig.accent}66` }} onClick={() => pick(o.id)}>
                    <span className="es-opt-label" style={{ color: fig.accent }}>{o.label}</span>
                    <span className="es-opt-sub">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {started && stage === 'result' && choice && (
            <div className="es-card">
              <div className="es-verdict" style={{ color: fig.accent }}>{script.outcomes[choice].verdict}</div>
              <p className="es-line">{script.outcomes[choice].text}</p>
              {script.reality?.[choice] && (
                <div className="es-reality">
                  <div className="es-reality-head">◆ What really happened</div>
                  <p className="es-reality-text">{script.reality[choice]}</p>
                </div>
              )}
              <div className="es-meters"><div className="es-meters-head">THE WORLD · LIVE STATE</div><MeterBars meters={meters} /></div>
              <button className="es-next" style={{ borderColor: fig.accent, color: fig.accent }} onClick={advance}>Continue →</button>
            </div>
          )}

          {started && stage === 'done' && (
            <div className="es-card">
              <div className="es-verdict" style={{ color: fig.accent }}>{script.done.verdict}</div>
              <p className="es-line">{script.done.text}</p>
              <div className="es-done-actions">
                <Link href="/world" className="es-done-btn es-done-secondary">← back to the world</Link>
                {next && <Link href={`/meet/${next.node}`} className="es-done-btn" style={{ background: `linear-gradient(135deg, ${fig.accent}, ${fig.accent}bb)` }}>{next.label}</Link>}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .es-stage{position:fixed;inset:0;background:#04060b}
        .es-stage canvas{display:block;width:100%;height:100%}
        .es-ui{position:absolute;inset:0;pointer-events:none;padding:28px 32px;display:flex;flex-direction:column;justify-content:space-between}
        .es-top{max-width:55%}
        .es-back{pointer-events:auto;display:inline-block;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;color:rgba(255,255,255,0.5);text-decoration:none;margin-bottom:20px}
        .es-back:hover{color:#fff}
        .es-eyebrow{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.24em;margin-bottom:10px}
        .es-name{font-family:var(--font-serif);font-weight:400;font-size:clamp(1.8rem,3.6vw,2.8rem);color:#fff;margin:0 0 8px;line-height:1}
        .es-role{font-family:var(--font-sans);font-size:0.8rem;color:rgba(255,255,255,0.5)}
        .es-panel-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}
        .es-cta{pointer-events:auto;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#04140d;border:none;padding:14px 30px;border-radius:999px;cursor:pointer;transition:transform 0.2s}
        .es-cta:hover{transform:translateY(-2px)}
        .es-card{pointer-events:auto;width:min(94vw,620px);background:linear-gradient(160deg,rgba(16,20,34,0.86),rgba(9,12,24,0.9));border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px 22px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 60px rgba(0,0,0,0.5)}
        .es-speaker{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.18em;margin-bottom:9px}
        .es-narr{color:rgba(255,255,255,0.4)}
        .es-line{font-family:var(--font-sans);font-size:0.98rem;line-height:1.65;color:rgba(255,255,255,0.9);margin:0 0 14px}
        .es-italic{font-style:italic;color:rgba(255,255,255,0.68)}
        .es-next{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.1em;background:transparent;border:1px solid;padding:9px 20px;border-radius:999px;cursor:pointer;transition:background 0.2s}
        .es-next:hover{background:rgba(255,255,255,0.06)}
        .es-prompt{font-family:var(--font-serif);font-size:1.1rem;color:#fff;margin:0 0 14px;line-height:1.4}
        .es-options{display:flex;flex-direction:column;gap:10px}
        .es-option{display:flex;flex-direction:column;gap:3px;text-align:left;background:rgba(255,255,255,0.03);border:1px solid;border-radius:12px;padding:13px 16px;cursor:pointer;transition:background 0.2s,transform 0.15s}
        .es-option:hover{background:rgba(255,255,255,0.08);transform:translateX(3px)}
        .es-opt-label{font-family:var(--font-sans);font-size:0.95rem;font-weight:600}
        .es-opt-sub{font-family:var(--font-sans);font-size:0.8rem;color:rgba(255,255,255,0.55)}
        .es-verdict{font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px}
        .es-reality{margin:14px 0 0;padding:13px 15px;background:rgba(91,141,239,0.08);border:1px solid rgba(91,141,239,0.28);border-left:3px solid #5B8DEF;border-radius:10px}
        .es-reality-head{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#9bbcf5;margin-bottom:7px}
        .es-reality-text{font-family:var(--font-sans);font-size:0.85rem;color:rgba(255,255,255,0.82);line-height:1.6;margin:0}
        .es-meters{margin-top:14px;padding:13px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:11px}
        .es-meters-head{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.16em;color:rgba(255,255,255,0.5);margin-bottom:9px}
        .es-card .es-next{margin-top:16px}
        .es-done-actions{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
        .es-done-btn{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.1em;text-transform:uppercase;color:#04140d;padding:12px 22px;border-radius:999px;text-decoration:none;cursor:pointer}
        .es-done-secondary{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}
      ` }} />
    </div>
  );
}
