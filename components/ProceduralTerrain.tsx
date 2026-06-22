'use client';
// Procedural 3D terrain — Perlin/Simplex FBM noise sculpts a live landscape.
// Adjust amplitude / frequency / octaves and watch the math shape the world.
// Rocks + trees are scattered by a jittered (Poisson-ish) grid so they don't clump.
import * as THREE from 'three';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const SIZE = 64;
const SEG = 150;

// fractal Brownian motion — sum octaves of simplex for natural detail
function fbm(noise2D: (x: number, y: number) => number, x: number, y: number, octaves: number, freq: number) {
  let amp = 1, f = freq, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) { sum += amp * noise2D(x * f, y * f); norm += amp; amp *= 0.5; f *= 2; }
  return sum / norm; // ~[-1, 1]
}

const SAND = new THREE.Color('#cdbd8f');
const GRASS = new THREE.Color('#4f7d3e');
const ROCK = new THREE.Color('#6f665a');
const SNOW = new THREE.Color('#eef3f7');
function heightColor(h: number, amp: number): THREE.Color {
  const t = h / amp;
  if (t < 0.04) return SAND;
  if (t < 0.36) return GRASS;
  if (t < 0.66) return ROCK;
  return SNOW;
}

function Terrain({ amp, freq, octaves, seed }: { amp: number; freq: number; octaves: number; seed: number }) {
  const noise2D = useMemo(() => createNoise2D(alea(String(seed))), [seed]);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const h = fbm(noise2D, px, py, octaves, freq) * amp;
      pos.setZ(i, h);
      const c = heightColor(h, amp);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [noise2D, amp, freq, octaves]);

  // jittered-grid (Poisson-ish) scatter: rocks on slopes, trees on grass
  const scatter = useMemo(() => {
    const rng = alea('scatter' + seed);
    const rocks: [number, number, number, number][] = [];
    const trees: [number, number, number, number][] = [];
    const cells = 46, cell = SIZE / cells;
    for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
      const px = -SIZE / 2 + (i + 0.15 + rng() * 0.7) * cell;
      const py = -SIZE / 2 + (j + 0.15 + rng() * 0.7) * cell;
      const h = fbm(noise2D, px, py, octaves, freq) * amp;
      const world: [number, number, number, number] = [px, h, -py, 0.4 + rng() * 0.7];
      const t = h / amp;
      if (t > 0.06 && t < 0.34 && rng() > 0.45) trees.push(world);
      else if (t > 0.34 && t < 0.7 && rng() > 0.55) rocks.push(world);
    }
    return { rocks, trees };
  }, [noise2D, amp, freq, octaves, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rockMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: '#5a5650', flatShading: true, roughness: 1 }), Math.max(1, scatter.rocks.length));
    scatter.rocks.forEach((r, i) => { dummy.position.set(r[0], r[1] + 0.1, r[2]); dummy.scale.setScalar(r[3]); dummy.rotation.set(rngAng(i), rngAng(i + 1), rngAng(i + 2)); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [scatter, dummy]);

  const treeGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.55, 1.8, 7);
    g.translate(0, 0.9, 0);
    return g;
  }, []);
  const treeMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ color: '#2f5d2e', flatShading: true, roughness: 1 }), Math.max(1, scatter.trees.length));
    scatter.trees.forEach((r, i) => { dummy.position.set(r[0], r[1], r[2]); dummy.scale.setScalar(r[3] * 1.1); dummy.rotation.set(0, rngAng(i), 0); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [scatter, treeGeo, dummy]);

  return (
    <group>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
      </mesh>
      <primitive object={rockMesh} />
      <primitive object={treeMesh} />
      {/* water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[SIZE * 1.4, SIZE * 1.4]} />
        <meshStandardMaterial color="#2f6f9e" transparent opacity={0.78} roughness={0.25} metalness={0.4} />
      </mesh>
    </group>
  );
}

function rngAng(n: number) { return ((Math.sin(n * 127.1) * 43758.5453) % 1) * Math.PI * 2; }

export default function ProceduralTerrain() {
  const [amp, setAmp] = useState(9);
  const [freq, setFreq] = useState(0.045);
  const [octaves, setOctaves] = useState(5);
  const [seed, setSeed] = useState(1);

  return (
    <div className="pt-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [38, 26, 38], fov: 42 }}>
        <Sky sunPosition={[40, 18, 20]} turbidity={6} rayleigh={1.2} />
        <fog attach="fog" args={['#bcd3e6', 70, 150]} />
        <hemisphereLight args={['#cfe3f2', '#3a4a34', 0.7]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[40, 36, 20]} intensity={2.2} color="#fff4e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50} />
        <Terrain amp={amp} freq={freq} octaves={octaves} seed={seed} />
        <OrbitControls makeDefault enablePan={false} minDistance={20} maxDistance={90} maxPolarAngle={1.5} autoRotate autoRotateSpeed={0.25} target={[0, 2, 0]} />
        <EffectComposer>
          <Bloom intensity={0.25} luminanceThreshold={0.8} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      </Canvas>

      <div className="pt-ui">
        <div className="pt-top">
          <Link href="/world" className="pt-back">← world</Link>
          <div className="pt-title">PROCEDURAL TERRAIN</div>
          <div className="pt-sub">Perlin / Simplex FBM noise · {SEG}×{SEG} grid · jittered scatter</div>
        </div>
        <div className="pt-panel">
          <Slider label="Amplitude" v={amp} min={2} max={16} step={0.5} onChange={setAmp} hint="height of the hills" />
          <Slider label="Frequency" v={freq} min={0.015} max={0.09} step={0.002} onChange={setFreq} hint="how fast it varies" fmt={(x) => x.toFixed(3)} />
          <Slider label="Octaves" v={octaves} min={1} max={6} step={1} onChange={(x) => setOctaves(Math.round(x))} hint="layers of detail" />
          <button className="pt-seed" onClick={() => setSeed((s) => s + 1)}>↻ new world (seed {seed})</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pt-stage{position:fixed;inset:0;background:#bcd3e6}
        .pt-ui{position:absolute;inset:0;pointer-events:none;padding:60px 28px 24px;display:flex;flex-direction:column;justify-content:space-between}
        .pt-top{}
        .pt-back{pointer-events:auto;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:rgba(20,30,45,0.6);text-decoration:none}
        .pt-back:hover{color:#0b1422}
        .pt-title{font-family:var(--font-mono);font-size:0.85rem;letter-spacing:0.22em;color:#0b1422;margin-top:14px}
        .pt-sub{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.06em;color:rgba(20,30,45,0.6);margin-top:5px}
        .pt-panel{pointer-events:auto;align-self:flex-start;width:280px;background:rgba(10,16,28,0.74);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px;backdrop-filter:blur(12px);display:flex;flex-direction:column;gap:14px}
        .pt-row label{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.06em;color:#fff;margin-bottom:5px}
        .pt-row label span{color:#7fd0ff}
        .pt-row input{width:100%;accent-color:#3affb0}
        .pt-row .pt-hint{font-family:var(--font-sans);font-size:0.6rem;color:rgba(255,255,255,0.42);margin-top:3px}
        .pt-seed{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.06em;color:#04140d;background:linear-gradient(135deg,#3affb0,#12c98a);border:none;border-radius:9px;padding:10px;cursor:pointer;margin-top:2px}
      ` }} />
    </div>
  );
}

function Slider({ label, v, min, max, step, onChange, hint, fmt }: { label: string; v: number; min: number; max: number; step: number; onChange: (n: number) => void; hint: string; fmt?: (n: number) => string }) {
  return (
    <div className="pt-row">
      <label>{label} <span>{fmt ? fmt(v) : v}</span></label>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div className="pt-hint">{hint}</div>
    </div>
  );
}
