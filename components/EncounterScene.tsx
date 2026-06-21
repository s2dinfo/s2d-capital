'use client';
// ── Any encounter, played out INSIDE a real 3D space. ──
// The figure (a Grok-generated stylized likeness shown as a holographic projection)
// speaks his lines in his real ElevenLabs voice while the hologram glows in time with
// the audio; you make his decision standing in front of him; you see the outcome, the
// "what really happened" reveal, and the world meters shift. Choices persist to the
// shared store so the globe reflects them. Data-driven by ENCOUNTERS[id] + FIGURES[id].
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Sparkles, Billboard, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';
import { FIGURES, resolveFigureId, PRIOR } from '@/lib/figures';
import { useChoices } from '@/lib/choices';
import { useFade } from '@/lib/useFade';
import Fader from '@/components/Fader';
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
    <Billboard ref={billRef} position={[0, 1.82, 0]} lockX lockZ>
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

// Procedurally-placed server hall: two banks of instanced racks (one draw call each)
// receding into the fog, each studded with glowing server lights in varied colors.
function DataCenter({ accent }: { accent: string }) {
  const racks = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.InstancedMesh>(null);
  const { rackMats, lightMats, lightCols } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const rackMats: THREE.Matrix4[] = [];
    const lightMats: THREE.Matrix4[] = [];
    const lightCols: THREE.Color[] = [];
    const base = new THREE.Color(accent);
    const palette = [base.clone(), new THREE.Color('#39e0ff'), base.clone().multiplyScalar(1.7), new THREE.Color('#bdf7ff')];
    for (const side of [-1, 1]) {
      for (let zi = 0; zi < 14; zi++) {
        const z = 2.0 - zi * 1.5;
        for (let xi = 0; xi < 2; xi++) {
          const x = side * (3.6 + xi * 0.95);
          dummy.position.set(x, 1.2, z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(0.85, 2.4, 1.25);
          dummy.updateMatrix();
          rackMats.push(dummy.matrix.clone());
          const faceX = x - side * 0.46; // aisle-facing front
          for (let li = 0; li < 4; li++) {
            const y = 0.5 + li * 0.46 + (Math.random() - 0.5) * 0.12;
            dummy.position.set(faceX, y, z + (Math.random() - 0.5) * 0.35);
            dummy.scale.set(0.05, 0.18, 0.5);
            dummy.updateMatrix();
            lightMats.push(dummy.matrix.clone());
            lightCols.push(palette[(Math.random() * palette.length) | 0].clone().multiplyScalar(0.55 + Math.random() * 0.9));
          }
        }
      }
    }
    return { rackMats, lightMats, lightCols };
  }, [accent]);

  useEffect(() => {
    const rm = racks.current;
    const lm = lights.current;
    if (rm) { rackMats.forEach((m, i) => rm.setMatrixAt(i, m)); rm.instanceMatrix.needsUpdate = true; }
    if (lm) {
      lightMats.forEach((m, i) => lm.setMatrixAt(i, m));
      lightCols.forEach((c, i) => lm.setColorAt(i, c));
      lm.instanceMatrix.needsUpdate = true;
      if (lm.instanceColor) lm.instanceColor.needsUpdate = true;
    }
  }, [rackMats, lightMats, lightCols]);

  return (
    <group>
      {/* figure platform */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#0a1118" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color={accent} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={racks} args={[undefined as any, undefined as any, rackMats.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#10151f" metalness={0.7} roughness={0.45} emissive={accent} emissiveIntensity={0.05} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined as any, undefined as any, lightMats.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* glowing aisle strip */}
      <mesh position={[0, 0.02, -9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} toneMapped={false} />
      </mesh>
      {/* overhead cable trays */}
      {[-3.6, 3.6].map((x, i) => (
        <mesh key={i} position={[x, 4.7, -7]}>
          <boxGeometry args={[0.5, 0.12, 30]} />
          <meshStandardMaterial color="#0a0e16" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Procedurally-terraced open-pit copper mine descending behind the figure, with
// haul trucks parked on the benches and a warm fill light. Fully deterministic.
function AtacamaPit({ accent }: { accent: string }) {
  const cz = -9;
  const levels = 10;
  const benches = [] as { i: number; rOut: number; rIn: number; y: number; yNext: number }[];
  for (let i = 0; i < levels; i++) {
    const rIn = 2.6 + i * 1.5;
    const rOut = rIn + 1.5;
    const y = -0.4 + i * 0.95;          // terraces RISE going outward (far pit wall)
    const yNext = -0.4 + (i + 1) * 0.95;
    benches.push({ i, rOut, rIn, y, yNext });
  }
  const trucks = [{ i: 4, a: -1.2 }, { i: 6, a: -1.9 }, { i: 5, a: -2.5 }, { i: 7, a: -0.7 }];
  return (
    <group>
      {/* figure rim platform */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#2a1d14" metalness={0.25} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color={accent} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0, cz]}>
        {benches.map((b) => (
          <group key={b.i}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, b.y, 0]} receiveShadow>
              <ringGeometry args={[b.rIn, b.rOut, 96]} />
              <meshStandardMaterial color={b.i % 2 ? '#5c4231' : '#6b4d39'} roughness={0.97} metalness={0.04} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, (b.y + b.yNext) / 2, 0]}>
              <cylinderGeometry args={[b.rOut, b.rOut, b.yNext - b.y, 96, 1, true]} />
              <meshStandardMaterial color="#3c2a1d" roughness={1} metalness={0.04} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {trucks.map((t, k) => {
          const b = benches[t.i];
          const r = (b.rIn + b.rOut) / 2;
          return (
            <group key={`t${k}`} position={[r * Math.cos(t.a), b.y + 0.25, r * Math.sin(t.a)]} rotation={[0, -t.a, 0]}>
              <mesh><boxGeometry args={[0.9, 0.45, 0.5]} /><meshStandardMaterial color="#caa23a" roughness={0.7} metalness={0.3} /></mesh>
              <mesh position={[0.52, 0.08, 0]}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshBasicMaterial color="#fff6c8" toneMapped={false} /></mesh>
            </group>
          );
        })}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4 + levels * 0.95, 0]}>
          <ringGeometry args={[2.6 + levels * 1.5 - 0.15, 2.6 + levels * 1.5 + 0.1, 96]} />
          <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position={[0, 5, cz + 3]} intensity={150} color="#ffb066" distance={52} />
      <pointLight position={[7, 4, cz]} intensity={70} color="#ffd9a0" distance={42} />
      <pointLight position={[-7, 4, cz]} intensity={70} color="#ffd9a0" distance={42} />
      <spotLight position={[0, 14, cz - 2]} angle={1.0} penumbra={1} intensity={340} color="#fff0d8" distance={66} />
    </group>
  );
}

function Scene({ image, accent, env, target, minPolar, mouthRef, speaking }: { image: string; accent: string; env?: string; target: [number, number, number]; minPolar: number; mouthRef: React.MutableRefObject<number>; speaking: boolean }) {
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
      {env === 'datacenter' ? <DataCenter accent={accent} /> : env === 'minepit' ? <AtacamaPit accent={accent} /> : <Stage accent={accent} />}
      <Sparkles count={70} scale={[14, 7, 10]} position={[0, 3.5, -1]} size={2.2} speed={0.25} color={accent} opacity={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial blur={[300, 110]} resolution={1024} mixBlur={1} mixStrength={45} roughness={0.8} depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#060a11" metalness={0.75} />
      </mesh>
      <OrbitControls makeDefault enablePan={false} minDistance={2.8} maxDistance={11} minPolarAngle={minPolar} maxPolarAngle={1.56} autoRotate autoRotateSpeed={0.18} target={target} />
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
  const { go, out, label } = useFade();

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

  // the mine pit reads best from a higher angle looking down into it
  const isMine = fig.env === 'minepit';
  const camPos: [number, number, number] = isMine ? [0, 2.3, 6.6] : [0, 1.7, 5.4];
  const camTarget: [number, number, number] = isMine ? [0, 2.2, -3] : [0, 1.65, 0];
  const minPolar = isMine ? 0.5 : 0.6;

  return (
    <div className="es-stage">
      <Fader out={out} label={label} />
      <Canvas shadows dpr={[1, 2]} camera={{ position: camPos, fov: 44 }}>
        <Scene image={fig.image} accent={fig.accent} env={fig.env} target={camTarget} minPolar={minPolar} mouthRef={mouthRef} speaking={speaking} />
      </Canvas>

      <div className="es-ui">
        {/* identity (top-left) */}
        <div className="es-top">
          <button className="es-back" onClick={() => go('/world', 'returning to the world')}>← back to the world</button>
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
                <button className="es-done-btn es-done-secondary" onClick={() => go('/world', 'returning to the world')}>← back to the world</button>
                {next && <button className="es-done-btn" style={{ background: `linear-gradient(135deg, ${fig.accent}, ${fig.accent}bb)` }} onClick={() => go(`/meet/${next.node}`, `traveling onward`)}>{next.label}</button>}
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
        .es-back{pointer-events:auto;display:inline-block;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;color:rgba(255,255,255,0.5);text-decoration:none;margin-bottom:20px;background:none;border:none;cursor:pointer;padding:0}
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
        .es-done-btn{font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.1em;text-transform:uppercase;color:#04140d;padding:12px 22px;border-radius:999px;text-decoration:none;cursor:pointer;border:none}
        .es-done-secondary{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}
      ` }} />
    </div>
  );
}
