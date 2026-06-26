'use client';
// Procedural 3D WORLD — FBM Simplex noise sculpts the land; a second moisture-noise
// layer paints biomes (desert / savanna / forest / snow); shader water ripples; clouds
// drift; trees, rocks and cacti scatter by a jittered (Poisson-ish) grid. All live.
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Clouds, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { useChoices } from '@/lib/choices';
import { FACTS } from '@/lib/figures';
import { useFade } from '@/lib/useFade';
import Fader from '@/components/Fader';
import { worldMeters, MeterBars } from '@/components/WorldReport';
import { FirstPerson, WorldFigures, WorldPortals, EncounterPanel, buildField, ENCOUNTER_CSS, type Portal } from '@/components/WorldEncounter';
import WorldModels, { worldColliders } from '@/components/WorldModels';
import PlayWorld from '@/components/PlayWorld';
import NPCs from '@/components/NPCs';
import Birds from '@/components/Birds';
import Traffic from '@/components/Traffic';

const SIZE = 100;  // a bigger world to roam (the walk bounds follow SIZE/2)
const SEG = 150;   // terrain resolution — kept moderate for perf (fewer verts to shade + shadow)

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

// Each commodity territory is themed as its real-world place — ground palette + what grows
// there — so crossing the world feels like traveling between regions, and diving into a
// place drops you into that locale (Pillar ③: real distinct locations).
const LOCALE: Record<string, { ground: string; veg: 'forest' | 'temperate' | 'sparse' | 'desert'; fog: string }> = {
  Nvidia:    { ground: '#7a7d4e', veg: 'temperate', fog: '#cdd6cf' }, // Santa Clara — dry California gold-green
  TSMC:      { ground: '#3f6b3a', veg: 'forest',    fog: '#bcd8d2' }, // Hsinchu, Taiwan — lush subtropical
  ASML:      { ground: '#5c7449', veg: 'sparse',    fog: '#c4ccd4' }, // Veldhoven, NL — flat cool overcast
  Copper:    { ground: '#b27a4a', veg: 'desert',    fog: '#e0c89e' }, // Atacama, Chile — arid red rock, dusty haze
  Power:     { ground: '#6a7158', veg: 'sparse',    fog: '#c3cdd0' }, // grid country — industrial temperate
  OpenAI:    { ground: '#5d6b6a', veg: 'sparse',    fog: '#c0cccd' }, // datacenter — cool tech
  Microsoft: { ground: '#3f5e4a', veg: 'forest',    fog: '#bccbd2' }, // Redmond — evergreen PNW mist
  Oil:       { ground: '#c2a368', veg: 'desert',    fog: '#e6d3a6' }, // Saudi Aramco — sand haze
  RareEarth: { ground: '#8a6f4a', veg: 'desert',    fog: '#d2c4a8' }, // China processing — arid industrial smog
};
const LOCALE_COL: Record<string, THREE.Color> = {};
for (const k of Object.keys(LOCALE)) LOCALE_COL[k] = new THREE.Color(LOCALE[k].ground);
function nearestFieldIdx(wx: number, wz: number): number {
  let best = 0, bd = Infinity;
  for (let k = 0; k < FIELD.length; k++) { const dx = wx - FIELD[k].pos[0], dz = wz - FIELD[k].pos[1]; const d = dx * dx + dz * dz; if (d < bd) { bd = d; best = k; } }
  return best;
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

// Bridson Poisson-disc sampling — scatter points with a guaranteed minimum spacing r, so
// trees/rocks place naturally (never overlapping, never gridded). Returns points in [0,w]×[0,h].
function poissonDisc(w: number, h: number, r: number, k: number, rng: () => number): [number, number][] {
  const cell = r / Math.SQRT2;
  const gw = Math.ceil(w / cell), gh = Math.ceil(h / cell);
  const grid: number[] = new Array(gw * gh).fill(-1);
  const pts: [number, number][] = [];
  const active: number[] = [];
  const add = (p: [number, number]) => { grid[((p[1] / cell) | 0) * gw + ((p[0] / cell) | 0)] = pts.length; active.push(pts.length); pts.push(p); };
  add([rng() * w, rng() * h]);
  while (active.length) {
    const ai = (rng() * active.length) | 0, p = pts[active[ai]];
    let placed = false;
    for (let i = 0; i < k; i++) {
      const ang = rng() * Math.PI * 2, rad = r * (1 + rng());
      const nx = p[0] + Math.cos(ang) * rad, ny = p[1] + Math.sin(ang) * rad;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const gx = (nx / cell) | 0, gy = (ny / cell) | 0;
      let ok = true;
      for (let yy = Math.max(0, gy - 2); yy <= Math.min(gh - 1, gy + 2) && ok; yy++)
        for (let xx = Math.max(0, gx - 2); xx <= Math.min(gw - 1, gx + 2) && ok; xx++) {
          const idx = grid[yy * gw + xx];
          if (idx >= 0) { const q = pts[idx], dx = q[0] - nx, dy = q[1] - ny; if (dx * dx + dy * dy < r * r) ok = false; }
        }
      if (ok) { add([nx, ny]); placed = true; break; }
    }
    if (!placed) active.splice(ai, 1);
  }
  return pts;
}

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
    // Voronoi commodity territories: each company owns the ground nearest to it; tint the
    // land faintly toward that company's accent so the world divides into the commodities.
    const terr = FIELD.map((f) => new THREE.Color(f.fig.accent));
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const h0 = fbm(elev, px, py, octaves, freq) * amp + amp * LAND_BIAS;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      const rt = riverMask(px, py, h0);
      const h = THREE.MathUtils.lerp(h0, RIVER_BED, rt);   // carve the channel down to the bed
      pos.setZ(i, h);
      const base = rt > 0.45 ? C.riverbed : rt > 0.12 ? C.bank : biomeColor(h0, mo, amp);
      tmp.copy(base);
      if (rt <= 0.12 && terr.length) {                     // land only — wash with its territory accent
        const wz = -py; let best = 0, bd = Infinity, second = Infinity;
        for (let k = 0; k < FIELD.length; k++) { const dx = px - FIELD[k].pos[0], dz = wz - FIELD[k].pos[1]; const d = dx * dx + dz * dz; if (d < bd) { second = bd; bd = d; best = k; } else if (d < second) { second = d; } }
        // each territory takes on its real-world locale's ground palette (desert / lush /
        // polder…) so the regions read as distinct places, with a faint accent on top
        const edge = sstep(Math.sqrt(second) - Math.sqrt(bd), 0, 6); // 0 at the border, 1 deep inside
        const loc = LOCALE_COL[FIELD[best].node];
        if (loc) tmp.lerp(loc, 0.2 + edge * 0.34);
        tmp.lerp(terr[best], 0.05 + edge * 0.07);
      }
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [elev, moist, river, amp, freq, octaves]);

  const scatter = useMemo(() => {
    const rng = alea('s' + seed);
    const trees: any[] = [], rocks: any[] = [], cacti: any[] = [];
    // Poisson-disc candidate positions (min spacing 1.9) → natural, non-overlapping scatter
    for (const p of poissonDisc(SIZE, SIZE, 1.9, 22, rng)) {
      const px = p[0] - SIZE / 2, py = p[1] - SIZE / 2;
      const h = fbm(elev, px, py, octaves, freq) * amp + amp * LAND_BIAS;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      const t = h / amp;
      if (t < 0.04 || t > 0.85) continue;
      if (riverMask(px, py, h) > 0.2) continue;   // don't plant in the river
      const w: any = [px, h, -py, 0.5 + rng() * 0.7];
      // what grows here is governed by the nearest territory's locale, not just moisture
      const veg = LOCALE[FIELD[nearestFieldIdx(px, -py)].node]?.veg || 'temperate';
      if (veg === 'desert') { if (rng() > 0.45) cacti.push(w); else if (rng() > 0.6) rocks.push(w); }
      else if (veg === 'forest') { if (rng() > 0.14) trees.push(w); }
      else if (veg === 'temperate') { if (rng() > (mo > 0.1 ? 0.3 : 0.55)) trees.push(w); else if (rng() > 0.72) rocks.push(w); }
      else { if (rng() > 0.66) trees.push(w); else if (rng() > 0.76) rocks.push(w); } // sparse
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

// ── The people who run the chip world, standing out IN the world (walk up + press E).
// Figures, hologram rendering, proximity and the encounter card all live in WorldEncounter. ──
const FIELD = buildField([
  { node: 'Nvidia', pos: [0, -20] },
  { node: 'TSMC', pos: [18, -11] },
  { node: 'ASML', pos: [-9, -18] },
  { node: 'Copper', pos: [22, 9] },
  { node: 'Power', pos: [6, 22] },
  { node: 'Oil', pos: [-18, 15] },
  { node: 'RareEarth', pos: [-23, -7] },
  { node: 'OpenAI', pos: [13, 20] },
  { node: 'Microsoft', pos: [-26, 4] },
]);

// gateway out of the landscape and into the datacenter city — walk through it
const TERRAIN_PORTALS: Portal[] = [
  { pos: [-11, 3], dest: '/city', title: 'THE DATACENTER CITY', label: 'entering the datacenter city', color: '#39e0ff' },
];
const PLAY_SPAWN: [number, number, number] = [0, 0, 8];

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

// easeInOutCubic — accelerate then decelerate, so the move has cinematic weight (not linear)
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// The establishing shot: open on a big high orbit of the whole world, then ease + swoop DOWN
// into it. Camera POSITION eases (easeInOutCubic); ORIENTATION uses quaternion SLERP between
// keyframes — no gimbal lock, smooth cinematic rotation. Hands off to orbit when it lands.
const TOUR_KEYS: { pos: [number, number, number]; tgt: [number, number, number]; dur: number }[] = [
  { pos: [0, 56, 40], tgt: [0, 0, -3], dur: 0 },       // establishing — high angle, world fills frame
  { pos: [46, 38, 46], tgt: [0, 3, 0], dur: 4.4 },     // grand slow orbit around it
  { pos: [-40, 27, 36], tgt: [0, 2, -2], dur: 4.2 },   // swing around and descend
  { pos: [18, 14, 32], tgt: [0, 2, 0], dur: 3.2 },     // sweep down toward the land
  { pos: [8, 9, 22], tgt: [0, 2, 0], dur: 2.8 },       // settle to a hero 3/4 view
];
function CinematicIntro({ onDone }: { onDone: () => void }) {
  const camera = useThree((s) => s.camera);
  const frames = useMemo(() => {
    const d = new THREE.PerspectiveCamera(); // a camera dummy so lookAt orients -Z toward target
    return TOUR_KEYS.map((k) => { d.position.set(...k.pos); d.lookAt(...k.tgt); return { pos: new THREE.Vector3(...k.pos), quat: d.quaternion.clone(), dur: k.dur }; });
  }, []);
  const seg = useRef(0);
  const segStart = useRef(-1);
  const done = useRef(false);
  useFrame((s) => {
    if (done.current) return;
    const i = seg.current;
    if (i >= frames.length - 1) { done.current = true; onDone(); return; }
    if (segStart.current < 0) { segStart.current = s.clock.elapsedTime; camera.position.copy(frames[0].pos); camera.quaternion.copy(frames[0].quat); }
    const a = frames[i], b = frames[i + 1];
    const u = Math.min(1, (s.clock.elapsedTime - segStart.current) / b.dur);
    const e = easeInOutCubic(u);
    camera.position.lerpVectors(a.pos, b.pos, e);
    camera.quaternion.copy(a.quat).slerp(b.quat, e); // SLERP — smooth, gimbal-lock-free rotation
    if (u >= 1) { seg.current = i + 1; segStart.current = s.clock.elapsedTime; }
  });
  return null;
}

// ── The fabrics: each company's actual industrial site, low-poly + stylized, themed by
// its accent. Datacenter / fab / oil derrick / mine headframe / power plant. ──
function Datacenter({ accent }: { accent: string }) {
  return (
    <group>
      {[-1.1, 0, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 1, 2.4]} /><meshStandardMaterial color="#2a3340" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {[-1.1, 0, 1.1].map((x, i) => (
        <mesh key={'w' + i} position={[x, 0.62, 1.21]}><boxGeometry args={[0.86, 0.16, 0.03]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      ))}
      <mesh position={[0, 1.12, -0.9]} castShadow><boxGeometry args={[2.9, 0.28, 0.5]} /><meshStandardMaterial color="#1c2430" /></mesh>
    </group>
  );
}
function Fab({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow><boxGeometry args={[3.4, 1.4, 2.4]} /><meshStandardMaterial color="#d6dce3" roughness={0.4} metalness={0.2} /></mesh>
      <mesh position={[1.2, 2.0, 0.6]} castShadow><cylinderGeometry args={[0.24, 0.3, 2.6, 12]} /><meshStandardMaterial color="#b3bcc8" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[1.2, 3.45, 0.6]}><sphereGeometry args={[0.32, 16, 12]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      <mesh position={[0, 1.42, 1.21]}><boxGeometry args={[3.0, 0.12, 0.03]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
    </group>
  );
}
function Derrick({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2, 0.5, 2]} /><meshStandardMaterial color="#34291d" /></mesh>
      <mesh position={[0, 1.9, 0]}><coneGeometry args={[0.95, 3.4, 4, 1, true]} /><meshStandardMaterial color="#6a5640" wireframe /></mesh>
      <mesh position={[0, 3.7, 0]} castShadow><boxGeometry args={[0.5, 0.4, 0.5]} /><meshStandardMaterial color="#5a4a38" /></mesh>
      <mesh position={[0, 4.0, 0]}><sphereGeometry args={[0.16, 10, 8]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
    </group>
  );
}
function Mine({ accent }: { accent: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow><ringGeometry args={[0.9, 2.4, 32]} /><meshStandardMaterial color="#2a2018" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.7, 0]}><coneGeometry args={[0.7, 3.3, 4, 1, true]} /><meshStandardMaterial color="#4a4038" wireframe /></mesh>
      <mesh position={[0, 3.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.06, 8, 20]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      {[[-1.5, 1.5], [1.6, -1.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow><boxGeometry args={[0.6, 0.4, 0.95]} /><meshStandardMaterial color="#6a5a3a" /></mesh>
      ))}
    </group>
  );
}
function Plant({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.62, 0.92, 2.4, 18]} /><meshStandardMaterial color="#9aa0a6" roughness={0.7} /></mesh>
      ))}
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={'s' + i} position={[x, 2.45, 0]}><cylinderGeometry args={[0.62, 0.62, 0.12, 18]} /><meshBasicMaterial color={accent} transparent opacity={0.5} toneMapped={false} /></mesh>
      ))}
      <mesh position={[2.1, 1.5, 0]}><coneGeometry args={[0.45, 3, 4, 1, true]} /><meshStandardMaterial color="#7a8088" wireframe /></mesh>
    </group>
  );
}
const STRUCT: Record<string, 'datacenter' | 'fab' | 'derrick' | 'mine' | 'plant'> = {
  Nvidia: 'datacenter', OpenAI: 'datacenter', Microsoft: 'datacenter', TSMC: 'fab', ASML: 'fab', Oil: 'derrick', Copper: 'mine', RareEarth: 'mine', Power: 'plant',
};
function structFor(type: string, accent: string) {
  return type === 'datacenter' ? <Datacenter accent={accent} /> : type === 'fab' ? <Fab accent={accent} /> : type === 'derrick' ? <Derrick accent={accent} /> : type === 'mine' ? <Mine accent={accent} /> : <Plant accent={accent} />;
}
function WorldStructures({ sampleRef }: { sampleRef: { current: ((x: number, z: number) => number) | null } }) {
  const placed = useMemo(() => FIELD.map((f) => {
    const [fx, fz] = f.pos; const len = Math.hypot(fx, fz) || 1;
    // offset to the SIDE of the figure (perpendicular to the radius) so the site sits beside it
    const px = -fz / len, pz = fx / len;
    return { x: fx + px * 5, z: fz + pz * 5, type: STRUCT[f.node], accent: f.fig.accent };
  }).filter((p) => p.type), []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    for (let i = 0; i < placed.length; i++) { const g = groups.current[i]; if (g) g.position.y = sampleRef.current ? Math.max(sampleRef.current(placed[i].x, placed[i].z), -0.05) : 0; }
  });
  return <>{placed.map((p, i) => (
    <group key={i} ref={(el) => { groups.current[i] = el; }} position={[p.x, 0, p.z]} rotation={[0, Math.atan2(-p.x, -p.z), 0]}>{structFor(p.type, p.accent)}</group>
  ))}</>;
}

// drives a full day/night cycle — the sun arcs overhead, light warms at dawn/dusk,
// the sky + fog shift toward night, and the day value is published to dayRef so the
// water can dim in step. day: 0/1 = midnight, 0.25 = dawn, 0.5 = noon, 0.75 = dusk.
function Sun({ auto, manual, dayRef, fog }: { auto: boolean; manual: number; dayRef: { current: number }; fog?: string }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<any>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const dayCol = useMemo(() => new THREE.Color('#fff3da'), []);
  const duskCol = useMemo(() => new THREE.Color('#ff7327'), []);
  const dayFog = useMemo(() => new THREE.Color(fog || '#c3d7e8'), [fog]);
  const nightFog = useMemo(() => new THREE.Color('#0a1424'), []);
  const sunPos = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((s) => {
    const day = auto ? (s.clock.elapsedTime * 0.009 + 0.4) % 1 : manual;   // arrive mid-morning (sun up), then cycle slowly (~110s)
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
      <directionalLight ref={light} position={[50, 44, 26]} intensity={2.4} color="#fff3da" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={160} />
    </>
  );
}

const TIME_LABEL = (d: number) => (d < 0.2 || d > 0.82 ? 'night' : d < 0.32 ? 'dawn' : d < 0.68 ? 'day' : 'dusk');

export default function ProceduralTerrain() {
  // deep-link params from the globe: ?mode=play (drop straight in) & ?at=<company> (spawn near it)
  const params = useMemo(() => { if (typeof window === 'undefined') return { mode: '', at: '', dive: false }; const p = new URLSearchParams(window.location.search); return { mode: p.get('mode') || '', at: p.get('at') || '', dive: p.get('dive') === '1' }; }, []);
  const [amp, setAmp] = useState(10);
  const [freq, setFreq] = useState(0.05);
  const [octaves, setOctaves] = useState(5);
  const [seed, setSeed] = useState(1);
  const [mode, setMode] = useState<'tour' | 'orbit' | 'walk' | 'play'>(params.mode === 'play' ? 'play' : 'tour');
  const playSpawn = useMemo<[number, number, number]>(() => {
    const f = FIELD.find((x) => x.node.toLowerCase() === params.at.toLowerCase());
    if (f) { const [fx, fz] = f.pos; const len = Math.hypot(fx, fz) || 1; return [fx + (fx / len) * 6, 0, fz + (fz / len) * 6]; } // spawn just outside the chosen company, facing it
    return PLAY_SPAWN;
  }, [params.at]);
  // the locale you dove into sets the atmosphere haze (desert dust at the copper pit, cool overcast at ASML…)
  const arriveFog = useMemo(() => {
    const f = FIELD.find((x) => x.node.toLowerCase() === params.at.toLowerCase());
    return (f && LOCALE[f.node]?.fog) || '#c3d7e8';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [timeAuto, setTimeAuto] = useState(true);
  const [timeManual, setTimeManual] = useState(0.5);
  const dayRef = useRef(0.5);
  const sampleRef = useRef<((x: number, z: number) => number) | null>(null);
  const playerPosRef = useRef(new THREE.Vector3());
  const [driving, setDriving] = useState(false);
  const colliders = useMemo(() => worldColliders(FIELD), []);
  // the learning codex — commodities you've discovered by walking up to them (persisted)
  const [discovered, setDiscovered] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('s2d_discovered') || '[]'); } catch { return []; } });
  const [codexOpen, setCodexOpen] = useState(false);
  const [factIdx, setFactIdx] = useState(0);   // ambient card cycles through a node's facts

  // in-world encounters
  const [choices, setChoice] = useChoices();
  const [near, setNear] = useState(-1);
  const nearRef = useRef(-1);
  const [active, setActive] = useState(-1);       // index of the open encounter, -1 = none
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = active >= 0; }, [active]);
  const walking = mode === 'walk' || mode === 'play';   // exploring on foot (1st- or 3rd-person)
  const onFootOrigin = mode === 'play' ? playerPosRef : undefined;
  const metCount = FIELD.filter((f) => choices[f.node]).length;
  const meters = worldMeters(choices);
  const { go, out: leaving, label: leaveLabel } = useFade();

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

  // discover a commodity by walking up to it (records it in the codex)
  useEffect(() => {
    if (near < 0) return;
    const node = FIELD[near].node;
    setDiscovered((prev) => { if (prev.includes(node)) return prev; const next = [...prev, node]; try { localStorage.setItem('s2d_discovered', JSON.stringify(next)); } catch {} return next; });
  }, [near]);

  // the ambient card cycles through all of a node's facts while you stand near it
  useEffect(() => {
    setFactIdx(0);
    if (near < 0) return;
    const n = FACTS[FIELD[near].node]?.length || 0;
    if (n <= 1) return;
    const t = setInterval(() => setFactIdx((i) => (i + 1) % n), 5500);
    return () => clearInterval(t);
  }, [near]);

  return (
    <div className="pt-stage">
      <Canvas shadows dpr={[1, 1.5]} performance={{ min: 0.5 }} camera={{ position: [42, 28, 42], fov: 42 }}>
        <fog attach="fog" args={[arriveFog, 80, 175]} />
        <Sun auto={timeAuto} manual={timeManual} dayRef={dayRef} fog={arriveFog} />
        <Birds count={16} />
        <Clouds material={THREE.MeshBasicMaterial} limit={60}>
          <Cloud seed={seed} segments={30} bounds={[40, 4, 40]} volume={9} color="#ffffff" opacity={0.55} position={[0, 30, -10]} />
          <Cloud seed={seed + 5} segments={24} bounds={[30, 3, 30]} volume={7} color="#eef4ff" opacity={0.45} position={[-20, 26, 20]} />
        </Clouds>
        <Terrain amp={amp} freq={freq} octaves={octaves} seed={seed} dayRef={dayRef} sampleRef={sampleRef} />
        <WorldFigures field={FIELD} sampleRef={sampleRef} walking={walking && active < 0} choices={choices} nearRef={nearRef} setNear={setNear} originRef={onFootOrigin} />
        <WorldModels field={FIELD} sampleRef={sampleRef} />
        {(mode === 'play' || mode === 'walk') && <NPCs sampleRef={sampleRef} count={18} hubs={FIELD.map((f) => f.pos)} />}
        {(mode === 'play' || mode === 'walk') && <Traffic sampleRef={sampleRef} waypoints={FIELD.map((f) => f.pos)} count={6} />}
        <WorldPortals portals={TERRAIN_PORTALS} sampleRef={sampleRef} walking={walking && active < 0} onEnter={(p) => go(p.dest, p.label)} originRef={onFootOrigin} />
        {mode === 'tour' ? <CinematicIntro onDone={() => setMode('orbit')} />
          : mode === 'play' ? <PlayWorld sampleRef={sampleRef} pausedRef={pausedRef} posRef={playerPosRef} setDrivingUI={setDriving} colliders={colliders} spawn={playSpawn} bound={SIZE / 2 - 1.5} />
          : mode === 'walk' ? <FirstPerson sampleRef={sampleRef} pausedRef={pausedRef} bound={SIZE / 2 - 1.5} />
          : <OrbitControls makeDefault enablePan={false} minDistance={22} maxDistance={110} maxPolarAngle={1.52} autoRotate autoRotateSpeed={0.2} target={[0, 2, 0]} />}
        <EffectComposer>
          <Bloom intensity={0.32} luminanceThreshold={0.72} luminanceSmoothing={0} mipmapBlur={false} />
          <Vignette eskil={false} offset={0.2} darkness={0.62} />
        </EffectComposer>
      </Canvas>

      <div className="pt-ui">
        <div className="pt-top">
          <Link href="/world" className="pt-back">← world</Link>
          <div className="pt-title">PROCEDURAL WORLD</div>
          <div className="pt-sub">FBM terrain · biomes · carved rivers · day/night · walk it in first person</div>
        </div>
        <div className="pt-panel">
          {/* the world-generator sliders are a sandbox tool — hide them in the immersive modes
              (play / 1st-person) so the game reads as a game, not a dev panel */}
          {!walking && (
            <>
              <Slider label="Amplitude" v={amp} min={3} max={18} step={0.5} onChange={setAmp} hint="height of the mountains" />
              <Slider label="Frequency" v={freq} min={0.018} max={0.095} step={0.002} onChange={setFreq} hint="ruggedness of the land" fmt={(x) => x.toFixed(3)} />
              <Slider label="Octaves" v={octaves} min={1} max={6} step={1} onChange={(x) => setOctaves(Math.round(x))} hint="layers of detail" />
              <Slider label="Time of day" v={timeManual} min={0} max={1} step={0.01} disabled={timeAuto}
                onChange={(x) => { setTimeAuto(false); setTimeManual(x); }} hint={timeAuto ? 'cycling automatically' : 'drag to set the sun'}
                fmt={() => (timeAuto ? 'auto ☀→🌙' : TIME_LABEL(timeManual))} />
              <button className="pt-seed" style={{ width: '100%' }} onClick={() => setSeed((s) => s + 1)}>↻ generate a new world</button>
            </>
          )}
          <div className="pt-modes">
            {(['tour', 'orbit', 'walk', 'play'] as const).map((m) => (
              <button key={m} className={'pt-mode' + (mode === m ? ' pt-mode-on' : '')} onClick={() => setMode(m)}>
                {m === 'tour' ? '🎬 tour' : m === 'orbit' ? '⊙ orbit' : m === 'walk' ? '🚶 1st' : '🎮 play'}
              </button>
            ))}
          </div>
          <button className={'pt-fly' + (timeAuto ? ' pt-fly-on' : '')} style={{ width: '100%' }} onClick={() => setTimeAuto((a) => !a)}>{timeAuto ? '🌗 day/night: auto' : '🌗 day/night: manual'}</button>
        </div>
      </div>

      {(mode === 'walk' || mode === 'play') && (
        <div className="pt-walkhint">click to look · <b>WASD</b> move{mode === 'play' ? <> · <b>F</b> {driving ? 'exit car' : 'enter car'}</> : <> · <b>shift</b> run</>} · <b>esc</b> release</div>
      )}

      {mode === 'tour' && (
        <button className="pt-skip" onClick={() => setMode('orbit')}>skip intro ▸</button>
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

      {/* ambient learning — facts about this commodity cycle as you stand near it */}
      {walking && active < 0 && near >= 0 && (() => {
        const facts = FACTS[FIELD[near].node] || [];
        if (!facts.length) return null;
        const i = factIdx % facts.length;
        return (
          <div className="pt-learn" style={{ borderColor: FIELD[near].fig.accent + '55' }}>
            <div className="pt-learn-head" style={{ color: FIELD[near].fig.accent }}>◆ {FIELD[near].node.toUpperCase()} · DID YOU KNOW{facts.length > 1 ? <span style={{ opacity: 0.55, marginLeft: 6 }}>{i + 1}/{facts.length}</span> : null}</div>
            <div className="pt-learn-fact"><b>{facts[i].label}.</b> {facts[i].text}</div>
          </div>
        );
      })()}

      {/* the in-scene decision */}
      {active >= 0 && (
        <EncounterPanel f={FIELD[active]} prior={choices[FIELD[active].node]} onPick={(id) => setChoice(FIELD[active].node, id)} onClose={() => setActive(-1)} />
      )}

      {/* finished the chain on foot */}
      {walking && active < 0 && metCount === FIELD.length && (
        <Link href="/world" className="pt-complete">⚖ You walked the whole chain — see the world you built →</Link>
      )}

      {/* the learning codex */}
      {walking && active < 0 && (
        <button className="pt-codex-btn" onClick={() => setCodexOpen(true)}>📖 codex · {discovered.length}/{FIELD.length}</button>
      )}
      {codexOpen && (
        <div className="pt-codex" onClick={() => setCodexOpen(false)}>
          <div className="pt-codex-card" onClick={(e) => e.stopPropagation()}>
            <button className="pt-codex-x" onClick={() => setCodexOpen(false)} aria-label="Close">×</button>
            <div className="pt-codex-title">THE CHIP-WORLD CODEX <span>{discovered.length}/{FIELD.length} discovered</span></div>
            <div className="pt-codex-grid">
              {FIELD.map((f) => {
                const got = discovered.includes(f.node);
                return (
                  <div key={f.node} className={'pt-codex-item' + (got ? '' : ' locked')} style={got ? { borderColor: f.fig.accent + '55' } : undefined}>
                    <div className="pt-codex-name" style={got ? { color: f.fig.accent } : undefined}>{got ? `◆ ${f.node}` : '◇ ???'}</div>
                    {got
                      ? (FACTS[f.node] || []).map((x, i) => <div key={i} className="pt-codex-fact"><b>{x.label}.</b> {x.text}</div>)
                      : <div className="pt-codex-fact pt-codex-dim">Walk up to this site to discover it.</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Fader out={leaving} label={leaveLabel} inTone={params.dive ? 'cloud' : 'dark'} />

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
        .pt-modes{display:flex;gap:6px}
        .pt-mode{flex:1;font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.02em;color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:9px;padding:9px 2px;cursor:pointer;transition:all 0.18s}
        .pt-mode:hover{border-color:rgba(127,208,255,0.6)}
        .pt-mode-on{background:#7fd0ff;color:#04140d;border-color:#7fd0ff;font-weight:700}
        .pt-skip{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:auto;font-family:var(--font-mono);font-size:0.64rem;letter-spacing:0.1em;color:#fff;background:rgba(10,16,28,0.6);border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:9px 20px;cursor:pointer;backdrop-filter:blur(8px)}
        .pt-skip:hover{border-color:rgba(127,208,255,0.7);color:#7fd0ff}
        .pt-walkhint{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);z-index:5;pointer-events:none;font-family:var(--font-mono);font-size:0.64rem;letter-spacing:0.06em;color:#fff;background:rgba(10,16,28,0.6);border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 18px;backdrop-filter:blur(8px)}
        .pt-walkhint b{color:#7fd0ff}
        ${ENCOUNTER_CSS}

        .pt-quest{position:absolute;top:90px;right:24px;z-index:6;width:240px;padding:14px 16px 12px;background:linear-gradient(160deg,rgba(20,25,44,0.85),rgba(12,15,31,0.9));border:1px solid rgba(255,255,255,0.1);border-radius:14px;backdrop-filter:blur(10px);box-shadow:0 14px 40px rgba(0,0,0,0.4)}
        .pt-quest-head{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.18em;color:#7fd0ff;margin-bottom:10px}
        .pt-quest-foot{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.03em;color:rgba(255,255,255,0.5);margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.08)}

        .pt-prompt{position:absolute;bottom:74px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.04em;color:#fff;background:rgba(10,16,28,0.78);border:1px solid rgba(127,208,255,0.4);border-radius:999px;padding:11px 20px;backdrop-filter:blur(8px);box-shadow:0 8px 30px rgba(0,0,0,0.4)}
        .pt-prompt .pt-key{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:9px;border-radius:5px;background:#7fd0ff;color:#04140d;font-weight:700;font-size:0.66rem;vertical-align:middle}
        .pt-learn{position:absolute;bottom:120px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;width:min(90vw,470px);background:rgba(10,16,28,0.82);border:1px solid;border-radius:14px;padding:12px 16px;backdrop-filter:blur(10px);box-shadow:0 10px 34px rgba(0,0,0,0.45)}
        .pt-learn-head{font-family:var(--font-mono);font-size:0.54rem;letter-spacing:0.18em;margin-bottom:6px}
        .pt-learn-fact{font-family:var(--font-sans);font-size:0.82rem;line-height:1.5;color:rgba(255,255,255,0.82)}
        .pt-learn-fact b{color:#fff}
        .pt-codex-btn{position:absolute;bottom:30px;right:24px;z-index:6;pointer-events:auto;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.06em;color:#fff;background:rgba(10,16,28,0.7);border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:9px 15px;cursor:pointer;backdrop-filter:blur(8px)}
        .pt-codex-btn:hover{border-color:rgba(127,208,255,0.6);color:#7fd0ff}
        .pt-codex{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(120% 90% at 50% 50%,rgba(6,9,18,0.6),rgba(5,7,14,0.9));backdrop-filter:blur(3px)}
        .pt-codex-card{position:relative;width:min(94vw,720px);max-height:80vh;overflow-y:auto;background:rgba(13,18,32,0.95);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:24px 26px}
        .pt-codex-x{position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;line-height:1;cursor:pointer}
        .pt-codex-x:hover{color:#fff}
        .pt-codex-title{font-family:var(--font-mono);font-size:0.82rem;letter-spacing:0.16em;color:#fff;margin-bottom:18px}
        .pt-codex-title span{font-size:0.58rem;letter-spacing:0.08em;color:#7fd0ff;margin-left:8px}
        .pt-codex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px}
        .pt-codex-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:13px 15px}
        .pt-codex-item.locked{opacity:0.45}
        .pt-codex-name{font-family:var(--font-mono);font-size:0.78rem;font-weight:700;color:rgba(255,255,255,0.6);margin-bottom:8px;letter-spacing:0.04em}
        .pt-codex-fact{font-family:var(--font-sans);font-size:0.72rem;line-height:1.5;color:rgba(255,255,255,0.72);margin-bottom:6px}
        .pt-codex-fact b{color:#fff}
        .pt-codex-dim{color:rgba(255,255,255,0.4);font-style:italic}

        .pt-complete{position:absolute;bottom:74px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:auto;text-decoration:none;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.04em;color:#04140d;background:linear-gradient(135deg,#7fd0ff,#3affb0);border-radius:999px;padding:12px 22px;box-shadow:0 10px 34px rgba(127,208,255,0.4)}
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

