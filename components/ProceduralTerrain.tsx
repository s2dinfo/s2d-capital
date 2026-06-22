'use client';
// Procedural 3D WORLD — FBM Simplex noise sculpts the land; a second moisture-noise
// layer paints biomes (desert / savanna / forest / snow); shader water ripples; clouds
// drift; trees, rocks and cacti scatter by a jittered (Poisson-ish) grid. All live.
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, Sky, Clouds, Cloud, Billboard, Html, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { FIGURES } from '@/lib/figures';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';
import { useChoices } from '@/lib/choices';
import { worldMeters, MeterBars } from '@/components/WorldReport';

const SIZE = 70;
const SEG = 170;

function fbm(n: (x: number, y: number) => number, x: number, y: number, oct: number, freq: number) {
  let amp = 1, f = freq, sum = 0, norm = 0;
  for (let o = 0; o < oct; o++) { sum += amp * n(x * f, y * f); norm += amp; amp *= 0.5; f *= 2; }
  return sum / norm;
}

const C = {
  sand: new THREE.Color('#d8c896'), desert: new THREE.Color('#dcae62'), savanna: new THREE.Color('#a9a155'),
  grass: new THREE.Color('#4f7d3e'), forest: new THREE.Color('#33602c'), rock: new THREE.Color('#70675b'),
  rockLight: new THREE.Color('#8b8377'), snow: new THREE.Color('#eef4f8'),
  bank: new THREE.Color('#c2a86f'), riverbed: new THREE.Color('#5b5038'),
};
const RIVER_BED = -0.5;
const LAND_BIAS = 0.17;   // lift the land so more sits above sea level — rivers read as channels, not coastline
const sstep = THREE.MathUtils.smoothstep;
function biomeColor(h: number, moist: number, amp: number): THREE.Color {
  const t = h / amp;
  if (t < 0.03) return C.sand;
  if (t > 0.72) return moist > 0 ? C.snow : C.rockLight;
  if (t > 0.46) return C.rock;
  if (moist < -0.28) return C.desert;
  if (moist < 0.05) return C.savanna;
  if (moist < 0.4) return C.grass;
  return C.forest;
}

function Water({ dayRef }: { dayRef: { current: number } }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame((s) => { if (ref.current) { ref.current.uniforms.uTime.value = s.clock.elapsedTime; ref.current.uniforms.uDay.value = dayRef.current; } });
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDay: { value: 0.5 } }), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[SIZE * 1.6, SIZE * 1.6, 90, 90]} />
      <shaderMaterial ref={ref} transparent uniforms={uniforms}
        vertexShader={`
          varying vec3 vW; uniform float uTime;
          void main(){
            vec3 p = position;
            p.z += sin(p.x*0.35 + uTime)*0.14 + cos(p.y*0.3 + uTime*0.8)*0.11;
            vec4 wp = modelMatrix * vec4(p,1.0); vW = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`}
        fragmentShader={`
          varying vec3 vW; uniform float uTime; uniform float uDay;
          void main(){
            vec3 deep = vec3(0.08,0.30,0.48); vec3 shallow = vec3(0.24,0.58,0.72);
            float r = (sin(vW.x*1.4 + uTime*1.4)*0.5+0.5) * (sin(vW.z*1.2 - uTime*1.1)*0.5+0.5);
            vec3 col = mix(deep, shallow, r*0.7);
            col += pow(r, 7.0) * 0.35;
            float up = max(0.0, sin(uDay*6.28318 - 1.5708));        // 0 night, 1 noon
            col *= 0.16 + up*0.84;                                   // dim at night
            col += vec3(0.02,0.05,0.11) * (1.0-up);                 // faint moonlit blue
            gl_FragColor = vec4(col, 0.84);
          }`} />
    </mesh>
  );
}

function rngAng(n: number) { return ((Math.sin(n * 127.1) * 43758.5453) % 1) * Math.PI * 2; }

function Terrain({ amp, freq, octaves, seed, dayRef, sampleRef }: { amp: number; freq: number; octaves: number; seed: number; dayRef: { current: number }; sampleRef: { current: ((x: number, z: number) => number) | null } }) {
  const elev = useMemo(() => createNoise2D(alea('e' + seed)), [seed]);
  const moist = useMemo(() => createNoise2D(alea('m' + seed)), [seed]);
  const river = useMemo(() => createNoise2D(alea('r' + seed)), [seed]);

  // a winding river runs where the river-noise crosses zero, but only carves through
  // the lowlands (so it reads as water flowing to the sea, not a slot canyon up high)
  const riverMask = (px: number, py: number, h0: number) => {
    const a = Math.abs(fbm(river, px, py, 3, freq * 0.7));
    const lowland = 1 - sstep(h0, amp * 0.04, amp * 0.42);
    return (1 - sstep(a, 0.0, 0.055)) * lowland;
  };

  // ground-height sampler in WORLD coords (the plane is rotated -90° about X, so world
  // z = -planeY). The first-person walker reads this to follow the terrain.
  useMemo(() => {
    sampleRef.current = (wx: number, wz: number) => {
      const px = wx, py = -wz;
      const h0 = fbm(elev, px, py, octaves, freq) * amp + amp * LAND_BIAS;
      return THREE.MathUtils.lerp(h0, RIVER_BED, riverMask(px, py, h0));
    };
  }, [elev, river, amp, freq, octaves]); // eslint-disable-line react-hooks/exhaustive-deps

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const h0 = fbm(elev, px, py, octaves, freq) * amp + amp * LAND_BIAS;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      const rt = riverMask(px, py, h0);
      const h = THREE.MathUtils.lerp(h0, RIVER_BED, rt);   // carve the channel down to the bed
      pos.setZ(i, h);
      const c = rt > 0.45 ? C.riverbed : rt > 0.12 ? C.bank : biomeColor(h0, mo, amp);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [elev, moist, river, amp, freq, octaves]);

  const scatter = useMemo(() => {
    const rng = alea('s' + seed);
    const trees: any[] = [], rocks: any[] = [], cacti: any[] = [];
    const cells = 54, cell = SIZE / cells;
    for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
      const px = -SIZE / 2 + (i + 0.15 + rng() * 0.7) * cell;
      const py = -SIZE / 2 + (j + 0.15 + rng() * 0.7) * cell;
      const h = fbm(elev, px, py, octaves, freq) * amp + amp * LAND_BIAS;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      const t = h / amp;
      if (t < 0.04 || t > 0.85) continue;
      if (riverMask(px, py, h) > 0.2) continue;   // don't plant in the river
      const w: any = [px, h, -py, 0.5 + rng() * 0.7];
      if (mo > 0.35 && rng() > 0.3) trees.push(w);
      else if (mo > 0.0 && rng() > 0.62) trees.push(w);
      else if (mo < -0.3 && rng() > 0.58) cacti.push(w);
      else if (rng() > 0.82) rocks.push(w);
    }
    return { trees, rocks, cacti };
  }, [elev, moist, river, amp, freq, octaves, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const make = (geom: THREE.BufferGeometry, mat: THREE.Material, list: any[], yOff: number, rotY: boolean) => {
    const m = new THREE.InstancedMesh(geom, mat, Math.max(1, list.length));
    list.forEach((r, i) => { dummy.position.set(r[0], r[1] + yOff, r[2]); dummy.scale.setScalar(r[3]); dummy.rotation.set(rotY ? 0 : rngAng(i), rngAng(i + 1), rotY ? 0 : rngAng(i + 2)); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.instanceMatrix.needsUpdate = true; m.castShadow = true;
    return m;
  };
  const treeGeo = useMemo(() => { const g = new THREE.ConeGeometry(0.55, 1.9, 7); g.translate(0, 0.95, 0); return g; }, []);
  const cactusGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8); g.translate(0, 0.7, 0); return g; }, []);
  const trees = useMemo(() => make(treeGeo, new THREE.MeshStandardMaterial({ color: '#2f5d2e', flatShading: true, roughness: 1 }), scatter.trees, 0, true), [scatter, treeGeo]);
  const rocks = useMemo(() => make(new THREE.DodecahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: '#5a5650', flatShading: true, roughness: 1 }), scatter.rocks, 0.12, false), [scatter]);
  const cacti = useMemo(() => make(cactusGeo, new THREE.MeshStandardMaterial({ color: '#3f7a4a', flatShading: true, roughness: 1 }), scatter.cacti, 0, true), [scatter, cactusGeo]);

  return (
    <group>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
      </mesh>
      <primitive object={trees} />
      <primitive object={rocks} />
      <primitive object={cacti} />
      <Water dayRef={dayRef} />
    </group>
  );
}

// first-person walk — click to capture the mouse (look around), WASD to move, Shift to
// run, Esc to release. The camera follows the ground so you walk up and over the hills.
const EYE = 1.7;
function FirstPerson({ sampleRef, pausedRef }: { sampleRef: { current: ((x: number, z: number) => number) | null }; pausedRef: { current: boolean } }) {
  const camera = useThree((s) => s.camera);
  const keys = useRef<Record<string, boolean>>({});
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const s = sampleRef.current;
    const g = s ? s(0, 8) : 2;
    camera.position.set(0, g + EYE, 8);             // spawn near the middle, on the ground
    camera.lookAt(0, g + EYE, 0);
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); keys.current = {}; };
  }, [camera, sampleRef]);

  useFrame((_, dt) => {
    if (pausedRef.current) return;   // frozen while an encounter is open
    const k = keys.current;
    const sp = (k['ShiftLeft'] || k['ShiftRight'] ? 17 : 8.5) * Math.min(dt, 0.05);
    camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    right.crossVectors(fwd, camera.up).normalize();
    if (k['KeyW'] || k['ArrowUp']) camera.position.addScaledVector(fwd, sp);
    if (k['KeyS'] || k['ArrowDown']) camera.position.addScaledVector(fwd, -sp);
    if (k['KeyD'] || k['ArrowRight']) camera.position.addScaledVector(right, sp);
    if (k['KeyA'] || k['ArrowLeft']) camera.position.addScaledVector(right, -sp);
    const lim = SIZE / 2 - 1.5;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -lim, lim);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -lim, lim);
    const s = sampleRef.current;
    if (s) {
      const g = Math.max(s(camera.position.x, camera.position.z), -0.05); // don't sink below the water line
      camera.position.y += (g + EYE - camera.position.y) * Math.min(1, dt * 12); // smooth step over terrain
    }
  });
  return <PointerLockControls />;
}

// ── The people who run the chip world, standing out IN the world. Walk up to one
// and their real decision triggers in-scene; your call moves the live world-meters. ──
const FIELD = ([
  { node: 'Nvidia', pos: [0, -20] },
  { node: 'TSMC', pos: [18, -11] },
  { node: 'Copper', pos: [21, 8] },
  { node: 'Power', pos: [5, 21] },
  { node: 'Oil', pos: [-17, 14] },
  { node: 'RareEarth', pos: [-21, -6] },
] as { node: string; pos: [number, number] }[])
  .filter((f) => FIGURES[f.node] && ENCOUNTERS[f.node])
  .map((f) => ({ ...f, fig: FIGURES[f.node], enc: ENCOUNTERS[f.node] }));

function WorldHologram({ fig, enc, met, near, grpRef }: { fig: { image: string; accent: string }; enc: any; met: boolean; near: boolean; grpRef: (el: THREE.Group | null) => void }) {
  const tex = useTexture(fig.image);
  return (
    <group ref={grpRef}>
      {/* beacon — a column of light so you can see them from across the world */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 32, 8, 1, true]} />
        <meshBasicMaterial color={fig.accent} transparent opacity={met ? 0.07 : 0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* base ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[1.0, 1.35, 44]} />
        <meshBasicMaterial color={fig.accent} transparent opacity={near ? 0.95 : met ? 0.4 : 0.7} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* portrait hologram, billboarded upright */}
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
      <Html position={[0, 3.5, 0]} center distanceFactor={16} occlude={false} pointerEvents="none">
        <div className="pt-fig-tag" style={{ borderColor: fig.accent, color: '#fff' }}>
          <b style={{ color: fig.accent }}>✦ {enc.name}</b>
          <span>{enc.role}</span>
          <em>{met ? '✓ spoken' : 'walk up · press E'}</em>
        </div>
      </Html>
    </group>
  );
}

function WorldFigures({ sampleRef, walking, choices, nearRef, setNear }: { sampleRef: { current: ((x: number, z: number) => number) | null }; walking: boolean; choices: Record<string, string>; nearRef: { current: number }; setNear: (n: number) => void }) {
  const camera = useThree((s) => s.camera);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    let nearest = -1, nd = 36; // within 6 units
    for (let i = 0; i < FIELD.length; i++) {
      const g = groups.current[i]; if (!g) continue;
      const [x, z] = FIELD[i].pos;
      const gy = sampleRef.current ? Math.max(sampleRef.current(x, z), 0) : 0;
      g.position.set(x, gy, z);
      if (walking) { const dx = camera.position.x - x, dz = camera.position.z - z; const d2 = dx * dx + dz * dz; if (d2 < nd) { nd = d2; nearest = i; } }
    }
    if (nearest !== nearRef.current) { nearRef.current = nearest; setNear(nearest); }
  });
  return (
    <Suspense fallback={null}>
      {FIELD.map((f, i) => (
        <WorldHologram key={f.node} fig={f.fig} enc={f.enc} met={!!choices[f.node]} near={nearRef.current === i} grpRef={(el) => { groups.current[i] = el; }} />
      ))}
    </Suspense>
  );
}

// cinematic drone flyover — sweeps low across the world, banking, looking ahead
function CinematicFly() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.1;
    const R = 32 + Math.sin(t * 0.5) * 8;
    const y = 10 + Math.sin(t * 0.85) * 6;
    const cam = state.camera;
    cam.position.set(Math.cos(t) * R, y, Math.sin(t) * R);
    const ahead = t + 0.5;
    cam.lookAt(Math.cos(ahead) * (R * 0.35), 2, Math.sin(ahead) * (R * 0.35));
  });
  return null;
}

// drives a full day/night cycle — the sun arcs overhead, light warms at dawn/dusk,
// the sky + fog shift toward night, and the day value is published to dayRef so the
// water can dim in step. day: 0/1 = midnight, 0.25 = dawn, 0.5 = noon, 0.75 = dusk.
function Sun({ auto, manual, dayRef }: { auto: boolean; manual: number; dayRef: { current: number } }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<any>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const dayCol = useMemo(() => new THREE.Color('#fff3da'), []);
  const duskCol = useMemo(() => new THREE.Color('#ff7327'), []);
  const dayFog = useMemo(() => new THREE.Color('#c3d7e8'), []);
  const nightFog = useMemo(() => new THREE.Color('#0a1424'), []);
  const sunPos = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((s) => {
    const day = auto ? (s.clock.elapsedTime * 0.03) % 1 : manual;
    dayRef.current = day;
    const ang = day * Math.PI * 2 - Math.PI / 2;            // noon (day .5) -> straight up
    const sy = Math.sin(ang), sx = Math.cos(ang);
    sunPos.set(sx * 60, sy * 60, 28);
    const up = Math.max(0, sy);                              // 0 night .. 1 noon
    const horizon = Math.max(0, 1 - Math.abs(sy) * 3);       // peaks at dawn/dusk
    if (light.current) {
      light.current.position.copy(sunPos);
      light.current.intensity = 0.06 + up * 2.6;
      light.current.color.copy(tmp.copy(dayCol).lerp(duskCol, horizon * 0.85));
    }
    if (sky.current) sky.current.material.uniforms.sunPosition.value.copy(sunPos);
    if (hemi.current) hemi.current.intensity = 0.12 + up * 0.7;
    if (amb.current) amb.current.intensity = 0.05 + up * 0.22;
    const fog = s.scene.fog as THREE.Fog | null;
    if (fog) fog.color.copy(nightFog).lerp(dayFog, 0.12 + up * 0.88);
  });
  return (
    <>
      <Sky ref={sky} sunPosition={[50, 22, 30]} turbidity={6} rayleigh={2.2} mieCoefficient={0.006} />
      <ambientLight ref={amb} intensity={0.22} />
      <hemisphereLight ref={hemi} args={['#dcebf7', '#3a4a34', 0.7]} />
      <directionalLight ref={light} position={[50, 44, 26]} intensity={2.4} color="#fff3da" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={160} />
    </>
  );
}

const TIME_LABEL = (d: number) => (d < 0.2 || d > 0.82 ? 'night' : d < 0.32 ? 'dawn' : d < 0.68 ? 'day' : 'dusk');

export default function ProceduralTerrain() {
  const [amp, setAmp] = useState(10);
  const [freq, setFreq] = useState(0.05);
  const [octaves, setOctaves] = useState(5);
  const [seed, setSeed] = useState(1);
  const [mode, setMode] = useState<'orbit' | 'fly' | 'walk'>('orbit');
  const [timeAuto, setTimeAuto] = useState(true);
  const [timeManual, setTimeManual] = useState(0.5);
  const dayRef = useRef(0.5);
  const sampleRef = useRef<((x: number, z: number) => number) | null>(null);

  // in-world encounters
  const [choices, setChoice] = useChoices();
  const [near, setNear] = useState(-1);
  const nearRef = useRef(-1);
  const [active, setActive] = useState(-1);       // index of the open encounter, -1 = none
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = active >= 0; }, [active]);
  const walking = mode === 'walk';
  const metCount = FIELD.filter((f) => choices[f.node]).length;
  const meters = worldMeters(choices);

  // press E near a figure to speak; Esc closes the panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { setActive(-1); return; }
      if (e.code === 'KeyE' && walking && active < 0 && nearRef.current >= 0) {
        setActive(nearRef.current);
        if (typeof document !== 'undefined' && document.exitPointerLock) document.exitPointerLock();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [walking, active]);

  return (
    <div className="pt-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [42, 28, 42], fov: 42 }}>
        <fog attach="fog" args={['#c3d7e8', 80, 175]} />
        <Sun auto={timeAuto} manual={timeManual} dayRef={dayRef} />
        <Clouds material={THREE.MeshBasicMaterial} limit={60}>
          <Cloud seed={seed} segments={30} bounds={[40, 4, 40]} volume={9} color="#ffffff" opacity={0.55} position={[0, 30, -10]} />
          <Cloud seed={seed + 5} segments={24} bounds={[30, 3, 30]} volume={7} color="#eef4ff" opacity={0.45} position={[-20, 26, 20]} />
        </Clouds>
        <Terrain amp={amp} freq={freq} octaves={octaves} seed={seed} dayRef={dayRef} sampleRef={sampleRef} />
        <WorldFigures sampleRef={sampleRef} walking={walking && active < 0} choices={choices} nearRef={nearRef} setNear={setNear} />
        {mode === 'walk' ? <FirstPerson sampleRef={sampleRef} pausedRef={pausedRef} />
          : mode === 'fly' ? <CinematicFly />
          : <OrbitControls makeDefault enablePan={false} minDistance={22} maxDistance={110} maxPolarAngle={1.52} autoRotate autoRotateSpeed={0.2} target={[0, 2, 0]} />}
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.75} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.65} />
        </EffectComposer>
      </Canvas>

      <div className="pt-ui">
        <div className="pt-top">
          <Link href="/world" className="pt-back">← world</Link>
          <div className="pt-title">PROCEDURAL WORLD</div>
          <div className="pt-sub">FBM terrain · biomes · carved rivers · day/night · walk it in first person</div>
        </div>
        <div className="pt-panel">
          <Slider label="Amplitude" v={amp} min={3} max={18} step={0.5} onChange={setAmp} hint="height of the mountains" />
          <Slider label="Frequency" v={freq} min={0.018} max={0.095} step={0.002} onChange={setFreq} hint="ruggedness of the land" fmt={(x) => x.toFixed(3)} />
          <Slider label="Octaves" v={octaves} min={1} max={6} step={1} onChange={(x) => setOctaves(Math.round(x))} hint="layers of detail" />
          <Slider label="Time of day" v={timeManual} min={0} max={1} step={0.01} disabled={timeAuto}
            onChange={(x) => { setTimeAuto(false); setTimeManual(x); }} hint={timeAuto ? 'cycling automatically' : 'drag to set the sun'}
            fmt={() => (timeAuto ? 'auto ☀→🌙' : TIME_LABEL(timeManual))} />
          <button className="pt-seed" style={{ width: '100%' }} onClick={() => setSeed((s) => s + 1)}>↻ generate a new world</button>
          <div className="pt-modes">
            {(['orbit', 'fly', 'walk'] as const).map((m) => (
              <button key={m} className={'pt-mode' + (mode === m ? ' pt-mode-on' : '')} onClick={() => setMode(m)}>
                {m === 'orbit' ? '⊙ orbit' : m === 'fly' ? '🎥 fly' : '🚶 walk'}
              </button>
            ))}
          </div>
          <button className={'pt-fly' + (timeAuto ? ' pt-fly-on' : '')} style={{ width: '100%' }} onClick={() => setTimeAuto((a) => !a)}>{timeAuto ? '🌗 day/night: auto' : '🌗 day/night: manual'}</button>
        </div>
      </div>

      {mode === 'walk' && (
        <div className="pt-walkhint">click to look around · <b>WASD</b> to move · <b>shift</b> to run · <b>esc</b> to release</div>
      )}

      {/* objective + the live world you're building, on foot */}
      {walking && (
        <div className="pt-quest">
          <div className="pt-quest-head">THE WORLD · LIVE STATE</div>
          <MeterBars meters={meters} />
          <div className="pt-quest-foot">{metCount === FIELD.length ? '✓ every call made — this is the world you built' : `${metCount}/${FIELD.length} spoken · find them by their beacons`}</div>
        </div>
      )}

      {/* proximity prompt */}
      {walking && active < 0 && near >= 0 && (
        <div className="pt-prompt"><span className="pt-key">E</span> speak with <b style={{ color: FIELD[near].fig.accent }}>{FIELD[near].enc.name}</b> — {FIELD[near].enc.role}</div>
      )}

      {/* the in-scene decision */}
      {active >= 0 && (
        <EncounterPanel f={FIELD[active]} prior={choices[FIELD[active].node]} onPick={(id) => setChoice(FIELD[active].node, id)} onClose={() => setActive(-1)} />
      )}

      {/* finished the chain on foot */}
      {walking && active < 0 && metCount === FIELD.length && (
        <Link href="/world" className="pt-complete">⚖ You walked the whole chain — see the world you built →</Link>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .pt-stage{position:fixed;inset:0;background:#c3d7e8}
        .pt-ui{position:absolute;inset:0;pointer-events:none;padding:60px 28px 24px;display:flex;flex-direction:column;justify-content:space-between}
        .pt-back{pointer-events:auto;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(20,30,45,0.6);text-decoration:none}
        .pt-back:hover{color:#0b1422}
        .pt-title{font-family:var(--font-mono);font-size:0.85rem;letter-spacing:0.22em;color:#0b1422;margin-top:14px}
        .pt-sub{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.05em;color:rgba(20,30,45,0.6);margin-top:5px}
        .pt-panel{pointer-events:auto;align-self:flex-start;width:282px;background:rgba(10,16,28,0.74);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px;backdrop-filter:blur(12px);display:flex;flex-direction:column;gap:14px}
        .pt-row label{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.06em;color:#fff;margin-bottom:5px}
        .pt-row label span{color:#7fd0ff}
        .pt-row input{width:100%;accent-color:#3affb0}
        .pt-row .pt-hint{font-family:var(--font-sans);font-size:0.6rem;color:rgba(255,255,255,0.42);margin-top:3px}
        .pt-btns{display:flex;gap:8px;margin-top:2px}
        .pt-seed{flex:1;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.05em;color:#04140d;background:linear-gradient(135deg,#3affb0,#12c98a);border:none;border-radius:9px;padding:10px;cursor:pointer}
        .pt-fly{flex:1;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.05em;color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:9px;padding:10px;cursor:pointer}
        .pt-fly-on{background:#7fd0ff;color:#04140d;border-color:#7fd0ff}
        .pt-modes{display:flex;gap:8px}
        .pt-mode{flex:1;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.04em;color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:9px;padding:10px 4px;cursor:pointer;transition:all 0.18s}
        .pt-mode:hover{border-color:rgba(127,208,255,0.6)}
        .pt-mode-on{background:#7fd0ff;color:#04140d;border-color:#7fd0ff;font-weight:700}
        .pt-walkhint{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);z-index:5;pointer-events:none;font-family:var(--font-mono);font-size:0.64rem;letter-spacing:0.06em;color:#fff;background:rgba(10,16,28,0.6);border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 18px;backdrop-filter:blur(8px)}
        .pt-walkhint b{color:#7fd0ff}

        .pt-fig-tag{display:flex;flex-direction:column;align-items:center;gap:1px;white-space:nowrap;font-family:var(--font-mono);background:rgba(8,12,22,0.6);border:1px solid;border-radius:8px;padding:5px 11px;backdrop-filter:blur(4px)}
        .pt-fig-tag b{font-size:0.82rem;letter-spacing:0.04em}
        .pt-fig-tag span{font-size:0.6rem;color:rgba(255,255,255,0.62)}
        .pt-fig-tag em{font-size:0.56rem;font-style:normal;letter-spacing:0.12em;color:rgba(255,255,255,0.5);margin-top:2px}

        .pt-quest{position:absolute;top:90px;right:24px;z-index:6;width:240px;padding:14px 16px 12px;background:linear-gradient(160deg,rgba(20,25,44,0.85),rgba(12,15,31,0.9));border:1px solid rgba(255,255,255,0.1);border-radius:14px;backdrop-filter:blur(10px);box-shadow:0 14px 40px rgba(0,0,0,0.4)}
        .pt-quest-head{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.18em;color:#7fd0ff;margin-bottom:10px}
        .pt-quest-foot{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.03em;color:rgba(255,255,255,0.5);margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.08)}

        .pt-prompt{position:absolute;bottom:74px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.04em;color:#fff;background:rgba(10,16,28,0.78);border:1px solid rgba(127,208,255,0.4);border-radius:999px;padding:11px 20px;backdrop-filter:blur(8px);box-shadow:0 8px 30px rgba(0,0,0,0.4)}
        .pt-prompt .pt-key{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:9px;border-radius:5px;background:#7fd0ff;color:#04140d;font-weight:700;font-size:0.66rem;vertical-align:middle}

        .pt-complete{position:absolute;bottom:74px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:auto;text-decoration:none;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.04em;color:#04140d;background:linear-gradient(135deg,#7fd0ff,#3affb0);border-radius:999px;padding:12px 22px;box-shadow:0 10px 34px rgba(127,208,255,0.4)}

        .pt-enc{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(120% 90% at 50% 50%,rgba(6,9,18,0.55),rgba(5,7,14,0.86));backdrop-filter:blur(3px)}
        .pt-enc-card{position:relative;width:min(94vw,460px);background:rgba(13,18,32,0.92);border:1px solid;border-radius:18px;padding:26px 26px 24px;box-shadow:0 30px 80px rgba(0,0,0,0.6)}
        .pt-enc-x{position:absolute;top:12px;right:15px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;line-height:1;cursor:pointer}
        .pt-enc-x:hover{color:#fff}
        .pt-enc-loc{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px}
        .pt-enc-name{font-family:var(--font-mono);font-size:1.15rem;font-weight:700;color:#fff}
        .pt-enc-role{font-family:var(--font-sans);font-size:0.74rem;color:rgba(255,255,255,0.55);margin-bottom:18px}
        .pt-enc-speak{float:right;font-family:var(--font-mono);font-size:0.52rem;letter-spacing:0.16em;animation:ptSpeak 1.1s ease-in-out infinite}
        @keyframes ptSpeak{0%,100%{opacity:0.35}50%{opacity:1}}
        .pt-enc-line{font-family:var(--font-serif);font-size:1.16rem;line-height:1.5;color:#fff;margin-bottom:20px;min-height:84px}
        .pt-enc-narr{font-style:italic;font-size:0.92rem;color:rgba(255,255,255,0.6)}
        .pt-enc-introbar{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .pt-enc-skip{background:none;border:none;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(255,255,255,0.4);cursor:pointer}
        .pt-enc-skip:hover{color:rgba(255,255,255,0.8)}
        .pt-enc-dots{display:flex;gap:5px}
        .pt-enc-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.2)}
        .pt-enc-dot.on{transform:scale(1.25)}
        .pt-enc-next{border:none;border-radius:9px;padding:10px 16px;font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.06em;font-weight:700;color:#04140d;cursor:pointer;transition:filter 0.2s}
        .pt-enc-next:hover{filter:brightness(1.1)}
        .pt-enc-prompt{font-family:var(--font-serif);font-size:1.12rem;line-height:1.4;color:#fff;margin-bottom:18px}
        .pt-enc-opts{display:flex;flex-direction:column;gap:10px}
        .pt-enc-opt{text-align:left;background:rgba(255,255,255,0.04);border:1px solid;border-radius:12px;padding:13px 15px;cursor:pointer;transition:all 0.18s;display:flex;flex-direction:column;gap:3px}
        .pt-enc-opt:hover{background:rgba(255,255,255,0.09);transform:translateY(-1px)}
        .pt-enc-opt b{font-family:var(--font-mono);font-size:0.82rem;color:#fff;letter-spacing:0.02em}
        .pt-enc-opt span{font-family:var(--font-sans);font-size:0.72rem;color:rgba(255,255,255,0.58);line-height:1.4}
        .pt-enc-verdict{font-family:var(--font-mono);font-size:0.95rem;font-weight:700;margin-bottom:12px;letter-spacing:0.02em}
        .pt-enc-text{font-family:var(--font-sans);font-size:0.85rem;line-height:1.65;color:rgba(255,255,255,0.78);margin-bottom:20px}
        .pt-enc-go{width:100%;border:none;border-radius:10px;padding:13px;font-family:var(--font-mono);font-size:0.74rem;letter-spacing:0.08em;font-weight:700;color:#04140d;cursor:pointer;transition:filter 0.2s}
        .pt-enc-go:hover{filter:brightness(1.1)}
      ` }} />
    </div>
  );
}

function Slider({ label, v, min, max, step, onChange, hint, fmt, disabled }: { label: string; v: number; min: number; max: number; step: number; onChange: (n: number) => void; hint: string; fmt?: (n: number) => string; disabled?: boolean }) {
  return (
    <div className="pt-row" style={disabled ? { opacity: 0.55 } : undefined}>
      <label>{label} <span>{fmt ? fmt(v) : v}</span></label>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div className="pt-hint">{hint}</div>
    </div>
  );
}

// The diegetic encounter — the figure speaks (their real voice), then makes their call.
// Choosing writes the shared choice store (so the globe's meters + report see it) and
// reveals what actually happened. Walking up to someone now feels like meeting them.
function EncounterPanel({ f, prior, onPick, onClose }: { f: { node: string; fig: { accent: string }; enc: any }; prior?: string; onPick: (id: string) => void; onClose: () => void }) {
  const enc = f.enc;
  const intro: { who: string; text: string }[] = enc.intro || [];
  // already decided → skip straight to the reveal; otherwise play the intro first
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

  // speak each intro line as it appears; stop on close/unmount
  useEffect(() => { if (stage === 'intro' && intro[idx]) play(intro[idx].text); return stopAudio; /* eslint-disable-next-line */ }, [stage, idx]);

  const nextLine = () => { if (idx < intro.length - 1) setIdx(idx + 1); else { stopAudio(); setStage('decide'); } };
  const choose = (id: string) => { stopAudio(); onPick(id); setPicked(id); setStage('result'); };
  const close = () => { stopAudio(); onClose(); };
  const out = picked ? enc.outcomes?.[picked] : null;
  const reveal = picked ? (enc.reality?.[picked] || out?.text) : null;
  const line = intro[idx];

  return (
    <div className="pt-enc" onClick={close}>
      <div className="pt-enc-card" style={{ borderColor: f.fig.accent + '66' }} onClick={(e) => e.stopPropagation()}>
        <button className="pt-enc-x" onClick={close} aria-label="Close">×</button>
        <div className="pt-enc-loc" style={{ color: f.fig.accent }}>
          {enc.locationTag}
          {speaking && <span className="pt-enc-speak" style={{ color: f.fig.accent }}>● speaking</span>}
        </div>
        <div className="pt-enc-name">{enc.name}</div>
        <div className="pt-enc-role">{enc.role}</div>

        {stage === 'intro' ? (
          <>
            <div className={'pt-enc-line' + (line?.who === 'narration' ? ' pt-enc-narr' : '')}>{line?.who === 'narration' ? line.text : `“${line?.text}”`}</div>
            <div className="pt-enc-introbar">
              <button className="pt-enc-skip" onClick={() => { stopAudio(); setStage('decide'); }}>skip ▸▸</button>
              <div className="pt-enc-dots">{intro.map((_, i) => <span key={i} className={'pt-enc-dot' + (i === idx ? ' on' : '')} style={i === idx ? { background: f.fig.accent } : undefined} />)}</div>
              <button className="pt-enc-next" style={{ background: f.fig.accent }} onClick={nextLine}>{idx < intro.length - 1 ? 'next ▸' : 'the call ▸'}</button>
            </div>
          </>
        ) : stage === 'decide' ? (
          <>
            <div className="pt-enc-prompt">{enc.decision.prompt}</div>
            <div className="pt-enc-opts">
              {enc.decision.options.map((o: any) => (
                <button key={o.id} className="pt-enc-opt" style={{ borderColor: f.fig.accent + '55' }} onClick={() => choose(o.id)}>
                  <b>{o.label}</b><span>{o.sub}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="pt-enc-verdict" style={{ color: f.fig.accent }}>{out?.verdict}</div>
            <div className="pt-enc-text">{reveal}</div>
            <button className="pt-enc-go" style={{ background: f.fig.accent }} onClick={close}>walk on&nbsp;&nbsp;→</button>
          </>
        )}
      </div>
    </div>
  );
}
