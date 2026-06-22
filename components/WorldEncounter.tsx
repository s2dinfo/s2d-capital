'use client';
// Shared "walk up to a person, they speak, you make their call" layer, reused by the
// procedural terrain and the WFC city. Figures stand IN the world as holographic beacons;
// proximity → press E → the figure's voiced intro → their real decision → consequence
// written to the shared choice store (so the globe's meters + report see it).
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Billboard, Html, useTexture } from '@react-three/drei';
import { FIGURES } from '@/lib/figures';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';

export type FieldEntry = { node: string; pos: [number, number]; fig: { image: string; accent: string }; enc: any };

// build a placed-figure list from node→position, dropping any without art/script
export function buildField(spots: { node: string; pos: [number, number] }[]): FieldEntry[] {
  return spots.filter((s) => FIGURES[s.node] && ENCOUNTERS[s.node]).map((s) => ({ ...s, fig: FIGURES[s.node], enc: ENCOUNTERS[s.node] }));
}

export const EYE = 1.7;

// first-person controller: pointer-lock look + WASD, ground-following, optional collision
export function FirstPerson({ sampleRef, pausedRef, blockedRef, spawn = [0, 0, 8], bound = 33 }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  pausedRef: { current: boolean };
  blockedRef?: { current: ((x: number, z: number) => boolean) | null };
  spawn?: [number, number, number];
  bound?: number;
}) {
  const camera = useThree((s) => s.camera);
  const keys = useRef<Record<string, boolean>>({});
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const g = sampleRef.current ? sampleRef.current(spawn[0], spawn[2]) : 0;
    camera.position.set(spawn[0], Math.max(g, 0) + EYE, spawn[2]);
    camera.lookAt(0, Math.max(g, 0) + EYE, 0);
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); keys.current = {}; };
    // spawn once when entering walk mode; spawn coords are read fresh inside
  }, [camera, sampleRef, spawn[0], spawn[1], spawn[2]]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (pausedRef.current) return;
    const k = keys.current;
    const sp = (k['ShiftLeft'] || k['ShiftRight'] ? 17 : 8.5) * Math.min(dt, 0.05);
    camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    right.crossVectors(fwd, camera.up).normalize();
    const ox = camera.position.x, oz = camera.position.z;
    if (k['KeyW'] || k['ArrowUp']) camera.position.addScaledVector(fwd, sp);
    if (k['KeyS'] || k['ArrowDown']) camera.position.addScaledVector(fwd, -sp);
    if (k['KeyD'] || k['ArrowRight']) camera.position.addScaledVector(right, sp);
    if (k['KeyA'] || k['ArrowLeft']) camera.position.addScaledVector(right, -sp);
    // collision: revert whichever axis walks into a blocked cell (lets you slide along walls)
    const blocked = blockedRef?.current;
    if (blocked) {
      if (blocked(camera.position.x, oz)) camera.position.x = ox;
      if (blocked(ox, camera.position.z)) camera.position.z = oz;
    }
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -bound, bound);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -bound, bound);
    const s = sampleRef.current;
    if (s) {
      const g = Math.max(s(camera.position.x, camera.position.z), -0.05);
      camera.position.y += (g + EYE - camera.position.y) * Math.min(1, dt * 12);
    }
  });
  return <PointerLockControls />;
}

function WorldHologram({ fig, enc, met, near, grpRef }: { fig: { image: string; accent: string }; enc: any; met: boolean; near: boolean; grpRef: (el: THREE.Group | null) => void }) {
  const tex = useTexture(fig.image);
  return (
    <group ref={grpRef}>
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 32, 8, 1, true]} />
        <meshBasicMaterial color={fig.accent} transparent opacity={met ? 0.07 : 0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[1.0, 1.35, 44]} />
        <meshBasicMaterial color={fig.accent} transparent opacity={near ? 0.95 : met ? 0.4 : 0.7} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Billboard follow lockX lockZ position={[0, 1.95, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.35, 2.95]} />
          <meshBasicMaterial color={fig.accent} transparent opacity={near ? 0.28 : 0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.0, 2.6]} />
          <meshBasicMaterial map={tex} transparent opacity={met ? 0.78 : 0.96} depthWrite={false} toneMapped={false} />
        </mesh>
      </Billboard>
      <Html position={[0, 3.4, 0]} center occlude={false} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="we-tag" style={{ borderColor: fig.accent }}>
          <b style={{ color: fig.accent }}>✦ {enc.name}</b>
          <span>{enc.role}</span>
          <em>{met ? '✓ spoken' : 'walk up · press E'}</em>
        </div>
      </Html>
    </group>
  );
}

// renders every placed figure, grounds them via sampleRef each frame, and reports the
// nearest within range (only while walking) without re-rendering every frame
export function WorldFigures({ field, sampleRef, walking, choices, nearRef, setNear, radius = 6 }: {
  field: FieldEntry[];
  sampleRef: { current: ((x: number, z: number) => number) | null };
  walking: boolean;
  choices: Record<string, string>;
  nearRef: { current: number };
  setNear: (n: number) => void;
  radius?: number;
}) {
  const camera = useThree((s) => s.camera);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    let nearest = -1, nd = radius * radius;
    for (let i = 0; i < field.length; i++) {
      const g = groups.current[i]; if (!g) continue;
      const [x, z] = field[i].pos;
      const gy = sampleRef.current ? Math.max(sampleRef.current(x, z), 0) : 0;
      g.position.set(x, gy, z);
      if (walking) { const dx = camera.position.x - x, dz = camera.position.z - z; const d2 = dx * dx + dz * dz; if (d2 < nd) { nd = d2; nearest = i; } }
    }
    if (nearest !== nearRef.current) { nearRef.current = nearest; setNear(nearest); }
  });
  return (
    <Suspense fallback={null}>
      {field.map((f, i) => (
        <WorldHologram key={f.node} fig={f.fig} enc={f.enc} met={!!choices[f.node]} near={nearRef.current === i} grpRef={(el) => { groups.current[i] = el; }} />
      ))}
    </Suspense>
  );
}

export type Portal = { pos: [number, number]; dest: string; title: string; label: string; color: string };

function WorldPortal({ portal, grpRef }: { portal: Portal; grpRef: (el: THREE.Group | null) => void }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((s) => { if (spin.current) { spin.current.rotation.y = s.clock.elapsedTime * 0.6; spin.current.position.y = 1.4 + Math.sin(s.clock.elapsedTime * 1.5) * 0.5; } });
  return (
    <group ref={grpRef}>
      {/* column of light you walk into */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 6, 32, 1, true]} />
        <meshBasicMaterial color={portal.color} transparent opacity={0.16} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 16, 8, 1, true]} />
        <meshBasicMaterial color={portal.color} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* bright base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[1.3, 1.75, 48]} />
        <meshBasicMaterial color={portal.color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* a halo ring that bobs + spins */}
      <group ref={spin}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.05, 8, 40]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
      <Html position={[0, 4.4, 0]} center occlude={false} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="we-portal" style={{ borderColor: portal.color }}>
          <b style={{ color: portal.color }}>▸ {portal.title}</b>
          <span>walk through</span>
        </div>
      </Html>
    </group>
  );
}

// places gateways in the world; walking into one (within ~2 units) fires onEnter once
export function WorldPortals({ portals, sampleRef, walking, onEnter }: {
  portals: Portal[];
  sampleRef: { current: ((x: number, z: number) => number) | null };
  walking: boolean;
  onEnter: (p: Portal) => void;
}) {
  const camera = useThree((s) => s.camera);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const fired = useRef(false);
  useFrame(() => {
    for (let i = 0; i < portals.length; i++) {
      const g = groups.current[i]; if (!g) continue;
      const [x, z] = portals[i].pos;
      const gy = sampleRef.current ? Math.max(sampleRef.current(x, z), 0) : 0;
      g.position.set(x, gy, z);
      if (walking && !fired.current) {
        const dx = camera.position.x - x, dz = camera.position.z - z;
        if (dx * dx + dz * dz < 4.2) { fired.current = true; onEnter(portals[i]); }
      }
    }
  });
  return <>{portals.map((p, i) => <WorldPortal key={p.dest + i} portal={p} grpRef={(el) => { groups.current[i] = el; }} />)}</>;
}

// the diegetic encounter card: the figure speaks (real voice), then makes their call
export function EncounterPanel({ f, prior, onPick, onClose }: { f: FieldEntry; prior?: string; onPick: (id: string) => void; onClose: () => void }) {
  const enc = f.enc;
  const intro: { who: string; text: string }[] = enc.intro || [];
  const [stage, setStage] = useState<'intro' | 'decide' | 'result'>(prior ? 'result' : intro.length ? 'intro' : 'decide');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(prior ?? null);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => { const a = audioRef.current; if (a) { a.onended = null; a.onerror = null; try { a.pause(); } catch {} } audioRef.current = null; setSpeaking(false); };
  const play = (text: string) => {
    stopAudio();
    if (!enc.voiceId || !text) return;
    const audio = new Audio(`/audio/${lineAudioId(enc.voiceId, text)}.mp3`);
    audioRef.current = audio;
    setSpeaking(true);
    audio.onended = () => { if (audioRef.current === audio) { audioRef.current = null; setSpeaking(false); } };
    audio.onerror = () => { if (audioRef.current === audio) { audioRef.current = null; setSpeaking(false); } };
    audio.play().catch(() => {});
  };
  useEffect(() => { if (stage === 'intro' && intro[idx]) play(intro[idx].text); return stopAudio; /* eslint-disable-next-line */ }, [stage, idx]);

  const nextLine = () => { if (idx < intro.length - 1) setIdx(idx + 1); else { stopAudio(); setStage('decide'); } };
  const choose = (id: string) => { stopAudio(); onPick(id); setPicked(id); setStage('result'); };
  const close = () => { stopAudio(); onClose(); };
  const out = picked ? enc.outcomes?.[picked] : null;
  const reveal = picked ? (enc.reality?.[picked] || out?.text) : null;
  const line = intro[idx];

  return (
    <div className="we-enc" onClick={close}>
      <div className="we-card" style={{ borderColor: f.fig.accent + '66' }} onClick={(e) => e.stopPropagation()}>
        <button className="we-x" onClick={close} aria-label="Close">×</button>
        <div className="we-loc" style={{ color: f.fig.accent }}>
          {enc.locationTag}
          {speaking && <span className="we-speak" style={{ color: f.fig.accent }}>● speaking</span>}
        </div>
        <div className="we-name">{enc.name}</div>
        <div className="we-role">{enc.role}</div>

        {stage === 'intro' ? (
          <>
            <div className={'we-line' + (line?.who === 'narration' ? ' we-narr' : '')}>{line?.who === 'narration' ? line.text : `“${line?.text}”`}</div>
            <div className="we-introbar">
              <button className="we-skip" onClick={() => { stopAudio(); setStage('decide'); }}>skip ▸▸</button>
              <div className="we-dots">{intro.map((_, i) => <span key={i} className={'we-dot' + (i === idx ? ' on' : '')} style={i === idx ? { background: f.fig.accent } : undefined} />)}</div>
              <button className="we-next" style={{ background: f.fig.accent }} onClick={nextLine}>{idx < intro.length - 1 ? 'next ▸' : 'the call ▸'}</button>
            </div>
          </>
        ) : stage === 'decide' ? (
          <>
            <div className="we-prompt">{enc.decision.prompt}</div>
            <div className="we-opts">
              {enc.decision.options.map((o: any) => (
                <button key={o.id} className="we-opt" style={{ borderColor: f.fig.accent + '55' }} onClick={() => choose(o.id)}>
                  <b>{o.label}</b><span>{o.sub}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="we-verdict" style={{ color: f.fig.accent }}>{out?.verdict}</div>
            <div className="we-text">{reveal}</div>
            <button className="we-go" style={{ background: f.fig.accent }} onClick={close}>walk on&nbsp;&nbsp;→</button>
          </>
        )}
      </div>
    </div>
  );
}

// the shared CSS for the figure tags + encounter card (injected once where used)
export const ENCOUNTER_CSS = `
  .we-tag{display:flex;flex-direction:column;align-items:center;gap:1px;white-space:nowrap;font-family:var(--font-mono);background:rgba(8,12,22,0.6);border:1px solid;border-radius:8px;padding:5px 11px;backdrop-filter:blur(4px)}
  .we-tag b{font-size:0.82rem;letter-spacing:0.04em}
  .we-tag span{font-size:0.6rem;color:rgba(255,255,255,0.62)}
  .we-tag em{font-size:0.56rem;font-style:normal;letter-spacing:0.12em;color:rgba(255,255,255,0.5);margin-top:2px}
  .we-portal{display:flex;flex-direction:column;align-items:center;gap:1px;white-space:nowrap;font-family:var(--font-mono);background:rgba(8,12,22,0.7);border:1px solid;border-radius:8px;padding:6px 13px;backdrop-filter:blur(4px)}
  .we-portal b{font-size:0.78rem;letter-spacing:0.08em}
  .we-portal span{font-size:0.55rem;letter-spacing:0.14em;color:rgba(255,255,255,0.5);text-transform:uppercase}
  .we-enc{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(120% 90% at 50% 50%,rgba(6,9,18,0.55),rgba(5,7,14,0.86));backdrop-filter:blur(3px)}
  .we-card{position:relative;width:min(94vw,460px);background:rgba(13,18,32,0.92);border:1px solid;border-radius:18px;padding:26px 26px 24px;box-shadow:0 30px 80px rgba(0,0,0,0.6)}
  .we-x{position:absolute;top:12px;right:15px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;line-height:1;cursor:pointer}
  .we-x:hover{color:#fff}
  .we-loc{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px}
  .we-speak{float:right;font-size:0.52rem;letter-spacing:0.16em;animation:weSpeak 1.1s ease-in-out infinite}
  @keyframes weSpeak{0%,100%{opacity:0.35}50%{opacity:1}}
  .we-name{font-family:var(--font-mono);font-size:1.15rem;font-weight:700;color:#fff}
  .we-role{font-family:var(--font-sans);font-size:0.74rem;color:rgba(255,255,255,0.55);margin-bottom:18px}
  .we-line{font-family:var(--font-serif);font-size:1.16rem;line-height:1.5;color:#fff;margin-bottom:20px;min-height:84px}
  .we-narr{font-style:italic;font-size:0.92rem;color:rgba(255,255,255,0.6)}
  .we-introbar{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .we-skip{background:none;border:none;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(255,255,255,0.4);cursor:pointer}
  .we-skip:hover{color:rgba(255,255,255,0.8)}
  .we-dots{display:flex;gap:5px}
  .we-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.2)}
  .we-dot.on{transform:scale(1.25)}
  .we-next{border:none;border-radius:9px;padding:10px 16px;font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.06em;font-weight:700;color:#04140d;cursor:pointer;transition:filter 0.2s}
  .we-next:hover{filter:brightness(1.1)}
  .we-prompt{font-family:var(--font-serif);font-size:1.12rem;line-height:1.4;color:#fff;margin-bottom:18px}
  .we-opts{display:flex;flex-direction:column;gap:10px}
  .we-opt{text-align:left;background:rgba(255,255,255,0.04);border:1px solid;border-radius:12px;padding:13px 15px;cursor:pointer;transition:all 0.18s;display:flex;flex-direction:column;gap:3px}
  .we-opt:hover{background:rgba(255,255,255,0.09);transform:translateY(-1px)}
  .we-opt b{font-family:var(--font-mono);font-size:0.82rem;color:#fff;letter-spacing:0.02em}
  .we-opt span{font-family:var(--font-sans);font-size:0.72rem;color:rgba(255,255,255,0.58);line-height:1.4}
  .we-verdict{font-family:var(--font-mono);font-size:0.95rem;font-weight:700;margin-bottom:12px;letter-spacing:0.02em}
  .we-text{font-family:var(--font-sans);font-size:0.85rem;line-height:1.65;color:rgba(255,255,255,0.78);margin-bottom:20px}
  .we-go{width:100%;border:none;border-radius:10px;padding:13px;font-family:var(--font-mono);font-size:0.74rem;letter-spacing:0.08em;font-weight:700;color:#04140d;cursor:pointer;transition:filter 0.2s}
  .we-go:hover{filter:brightness(1.1)}
`;
