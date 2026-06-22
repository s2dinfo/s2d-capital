'use client';
// Procedural 3D WORLD — FBM Simplex noise sculpts the land; a second moisture-noise
// layer paints biomes (desert / savanna / forest / snow); shader water ripples; clouds
// drift; trees, rocks and cacti scatter by a jittered (Poisson-ish) grid. All live.
import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Clouds, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

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
};
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

function Water() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  useFrame((s) => { if (ref.current) ref.current.uniforms.uTime.value = s.clock.elapsedTime; });
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
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
          varying vec3 vW; uniform float uTime;
          void main(){
            vec3 deep = vec3(0.08,0.30,0.48); vec3 shallow = vec3(0.24,0.58,0.72);
            float r = (sin(vW.x*1.4 + uTime*1.4)*0.5+0.5) * (sin(vW.z*1.2 - uTime*1.1)*0.5+0.5);
            vec3 col = mix(deep, shallow, r*0.7);
            col += pow(r, 7.0) * 0.35;
            gl_FragColor = vec4(col, 0.84);
          }`} />
    </mesh>
  );
}

function rngAng(n: number) { return ((Math.sin(n * 127.1) * 43758.5453) % 1) * Math.PI * 2; }

function Terrain({ amp, freq, octaves, seed }: { amp: number; freq: number; octaves: number; seed: number }) {
  const elev = useMemo(() => createNoise2D(alea('e' + seed)), [seed]);
  const moist = useMemo(() => createNoise2D(alea('m' + seed)), [seed]);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const h = fbm(elev, px, py, octaves, freq) * amp;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      pos.setZ(i, h);
      const c = biomeColor(h, mo, amp);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [elev, moist, amp, freq, octaves]);

  const scatter = useMemo(() => {
    const rng = alea('s' + seed);
    const trees: any[] = [], rocks: any[] = [], cacti: any[] = [];
    const cells = 54, cell = SIZE / cells;
    for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
      const px = -SIZE / 2 + (i + 0.15 + rng() * 0.7) * cell;
      const py = -SIZE / 2 + (j + 0.15 + rng() * 0.7) * cell;
      const h = fbm(elev, px, py, octaves, freq) * amp;
      const mo = fbm(moist, px, py, 2, freq * 0.5);
      const t = h / amp;
      if (t < 0.04 || t > 0.72) continue;
      const w: any = [px, h, -py, 0.5 + rng() * 0.7];
      if (mo > 0.35 && rng() > 0.3) trees.push(w);
      else if (mo > 0.0 && rng() > 0.62) trees.push(w);
      else if (mo < -0.3 && rng() > 0.58) cacti.push(w);
      else if (rng() > 0.82) rocks.push(w);
    }
    return { trees, rocks, cacti };
  }, [elev, moist, amp, freq, octaves, seed]);

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
      <Water />
    </group>
  );
}

export default function ProceduralTerrain() {
  const [amp, setAmp] = useState(10);
  const [freq, setFreq] = useState(0.05);
  const [octaves, setOctaves] = useState(5);
  const [seed, setSeed] = useState(1);

  return (
    <div className="pt-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [42, 28, 42], fov: 42 }}>
        <Sky sunPosition={[50, 22, 30]} turbidity={5} rayleigh={1.4} mieCoefficient={0.006} />
        <fog attach="fog" args={['#c3d7e8', 80, 175]} />
        <hemisphereLight args={['#dcebf7', '#3a4a34', 0.7]} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[50, 44, 26]} intensity={2.4} color="#fff3da" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={140} />
        <Clouds material={THREE.MeshBasicMaterial} limit={60}>
          <Cloud seed={seed} segments={30} bounds={[40, 4, 40]} volume={9} color="#ffffff" opacity={0.55} position={[0, 30, -10]} />
          <Cloud seed={seed + 5} segments={24} bounds={[30, 3, 30]} volume={7} color="#eef4ff" opacity={0.45} position={[-20, 26, 20]} />
        </Clouds>
        <Terrain amp={amp} freq={freq} octaves={octaves} seed={seed} />
        <OrbitControls makeDefault enablePan={false} minDistance={22} maxDistance={110} maxPolarAngle={1.52} autoRotate autoRotateSpeed={0.2} target={[0, 2, 0]} />
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.75} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.65} />
        </EffectComposer>
      </Canvas>

      <div className="pt-ui">
        <div className="pt-top">
          <Link href="/world" className="pt-back">← world</Link>
          <div className="pt-title">PROCEDURAL WORLD</div>
          <div className="pt-sub">FBM noise terrain · moisture-noise biomes · shader water · jittered scatter</div>
        </div>
        <div className="pt-panel">
          <Slider label="Amplitude" v={amp} min={3} max={18} step={0.5} onChange={setAmp} hint="height of the mountains" />
          <Slider label="Frequency" v={freq} min={0.018} max={0.095} step={0.002} onChange={setFreq} hint="ruggedness of the land" fmt={(x) => x.toFixed(3)} />
          <Slider label="Octaves" v={octaves} min={1} max={6} step={1} onChange={(x) => setOctaves(Math.round(x))} hint="layers of detail" />
          <button className="pt-seed" onClick={() => setSeed((s) => s + 1)}>↻ generate new world (seed {seed})</button>
        </div>
      </div>

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
        .pt-seed{font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.05em;color:#04140d;background:linear-gradient(135deg,#3affb0,#12c98a);border:none;border-radius:9px;padding:10px;cursor:pointer;margin-top:2px}
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
