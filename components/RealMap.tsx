'use client';
// REAL-WORLD MAP — Arnis technique in R3F: OpenStreetMap building footprints (Overpass) extruded
// into our low-poly look, draped on real terrain from AWS terrarium elevation tiles (free, no token).
// Pick the place with ?at=<district>.
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type BBox = { s: number; w: number; n: number; e: number };
type Sampler = (lat: number, lon: number) => number;

const LOCATIONS: Record<string, { name: string; lat: number; lng: number; span: number }> = {
  Nvidia:    { name: 'Santa Clara · Nvidia',        lat: 37.3714,  lng: -121.9560, span: 0.0070 },
  TSMC:      { name: 'Hsinchu · TSMC',              lat: 24.7740,  lng: 120.9970,  span: 0.0070 },
  ASML:      { name: 'Veldhoven · ASML',            lat: 51.4190,  lng: 5.4040,    span: 0.0070 },
  OpenAI:    { name: 'San Francisco · OpenAI',      lat: 37.7626,  lng: -122.4145, span: 0.0055 },
  Microsoft: { name: 'Redmond · Microsoft',        lat: 47.6420,  lng: -122.1370, span: 0.0075 },
  Oil:       { name: 'Dhahran · Saudi Aramco',      lat: 26.2960,  lng: 50.1500,   span: 0.0080 },
  Copper:    { name: 'Atacama · Copper',            lat: -24.2600, lng: -69.0700,  span: 0.0120 },
  Power:     { name: 'Ashburn · Data Center Alley', lat: 39.0150,  lng: -77.4850,  span: 0.0110 },
  RareEarth: { name: 'Baotou · Rare Earth',         lat: 40.6570,  lng: 109.8400,  span: 0.0080 },
  Manhattan: { name: 'Midtown Manhattan (demo)',    lat: 40.7543,  lng: -73.9845,  span: 0.0030 },
};
const ORDER = ['Nvidia', 'TSMC', 'ASML', 'OpenAI', 'Microsoft', 'Oil', 'Copper', 'Power', 'RareEarth', 'Manhattan'];

const query = (b: BBox) => `[out:json][timeout:30];way["building"](${b.s},${b.w},${b.n},${b.e});out geom;`;

// lat/lng → local metres, centred on the bbox (shared by buildings + terrain)
function projector(b: BBox) {
  const lat0 = (b.s + b.n) / 2, lon0 = (b.w + b.e) / 2;
  const mLat = 110540, mLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  return { x: (lon: number) => (lon - lon0) * mLon, z: (lat: number) => (lat - lat0) * mLat };
}

// one AWS terrarium elevation tile → a metres-above-sea sampler (null if the tile is CORS-blocked)
async function elevationSampler(b: BBox, z = 13): Promise<Sampler | null> {
  try {
    const cLat = (b.s + b.n) / 2, cLon = (b.w + b.e) / 2, n = 2 ** z;
    const rad = (d: number) => (d * Math.PI) / 180;
    const tx = Math.floor(((cLon + 180) / 360) * n);
    const ty = Math.floor(((1 - Math.log(Math.tan(rad(cLat)) + 1 / Math.cos(rad(cLat))) / Math.PI) / 2) * n);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${tx}/${ty}.png`;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d')!; ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, 256, 256).data;   // throws if CORS-tainted
    const tlx = tx * 256, tly = ty * 256;
    return (lat, lon) => {
      const gx = ((lon + 180) / 360) * 256 * n;
      const gy = ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * 256 * n;
      const px = Math.max(0, Math.min(255, Math.round(gx - tlx)));
      const py = Math.max(0, Math.min(255, Math.round(gy - tly)));
      const i = (py * 256 + px) * 4;
      return d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
    };
  } catch { return null; }
}

function buildCity(elements: any[], b: BBox, sample: Sampler | null, base: number): THREE.BufferGeometry | null {
  const p = projector(b);
  const geos: THREE.BufferGeometry[] = [];
  for (const el of elements) {
    const ring = el.geometry;
    if (!ring || ring.length < 4) continue;
    const shape = new THREE.Shape();
    ring.forEach((pt: any, i: number) => { const x = p.x(pt.lon), zz = p.z(pt.lat); i === 0 ? shape.moveTo(x, zz) : shape.lineTo(x, zz); });
    const t = el.tags || {};
    let h = parseFloat(t.height) || parseFloat(t['building:levels']) * 3.2 || 6 + Math.random() * 9;
    h = Math.max(3, Math.min(h, 380));
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);                                         // footprint → ground, height → up
    if (sample) g.translate(0, sample(ring[0].lat, ring[0].lon) - base, 0);  // drape onto the terrain
    g.computeVertexNormals();
    geos.push(g);
  }
  return geos.length ? mergeGeometries(geos, false) : null;
}

function buildTerrain(b: BBox, sample: Sampler, base: number): THREE.BufferGeometry {
  const p = projector(b), N = 56;
  const verts: number[] = [], cols: number[] = [], idx: number[] = [], ys: number[] = [];
  let minY = Infinity, maxY = -Infinity;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const lat = b.s + (b.n - b.s) * (j / (N - 1));
    const lon = b.w + (b.e - b.w) * (i / (N - 1));
    const y = sample(lat, lon) - base;
    ys.push(y); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    verts.push(p.x(lon), y, p.z(lat));
  }
  const range = Math.max(8, maxY - minY);
  const lo = new THREE.Color('#8a9a5b'), mid = new THREE.Color('#b6a374'), hi = new THREE.Color('#ececed');
  for (const y of ys) {
    const t = THREE.MathUtils.clamp((y - minY) / range, 0, 1);
    const c = t < 0.5 ? lo.clone().lerp(mid, t * 2) : mid.clone().lerp(hi, (t - 0.5) * 2);
    cols.push(c.r, c.g, c.b);
  }
  for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
    const a = j * N + i;
    idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export default function RealMap() {
  const { bbox, name, ext } = useMemo(() => {
    const at = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('at') || 'Manhattan' : 'Manhattan';
    const loc = LOCATIONS[at] || LOCATIONS.Manhattan;
    const dLon = loc.span / Math.cos((loc.lat * Math.PI) / 180);
    const ext = 2 * dLon * 111320 * Math.cos((loc.lat * Math.PI) / 180);   // world width (m) → frame the camera to it
    return { bbox: { s: loc.lat - loc.span, n: loc.lat + loc.span, w: loc.lng - dLon, e: loc.lng + dLon } as BBox, name: loc.name, ext };
  }, []);
  const [city, setCity] = useState<THREE.BufferGeometry | null>(null);
  const [terrain, setTerrain] = useState<THREE.BufferGeometry | null>(null);
  const [status, setStatus] = useState(`Loading ${name}…`);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [res, sample] = await Promise.all([
          fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query(bbox))).then((r) => r.json()),
          elevationSampler(bbox),
        ]);
        if (!alive) return;
        const base = sample ? sample((bbox.s + bbox.n) / 2, (bbox.w + bbox.e) / 2) : 0;
        const c = buildCity(res.elements || [], bbox, sample, base);
        if (sample) setTerrain(buildTerrain(bbox, sample, base));
        if (c) setCity(c);
        setStatus(`${(res.elements || []).length} real buildings · ${sample ? 'real terrain' : 'flat (no elevation)'} · drag to orbit`);
      } catch (e: any) { if (alive) setStatus('OSM fetch failed: ' + (e?.message || e)); }
    })();
    return () => { alive = false; };
  }, [bbox]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#cdd9e6' }}>
      <Canvas shadows camera={{ position: [ext * 0.55, ext * 0.45, ext * 0.55], fov: 45, far: ext * 6 }} dpr={[1, 1.5]}>
        <Sky sunPosition={[120, 70, 90]} turbidity={5} rayleigh={2} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#e3eef9', '#5a5f50', 0.6]} />
        <directionalLight position={[ext * 0.5, ext * 0.7, ext * 0.35]} intensity={2.3} color="#fff3da" castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-ext * 0.8} shadow-camera-right={ext * 0.8}
          shadow-camera-top={ext * 0.8} shadow-camera-bottom={-ext * 0.8} shadow-camera-far={ext * 3} />
        {terrain ? (
          <mesh geometry={terrain} receiveShadow>
            <meshStandardMaterial vertexColors flatShading roughness={1} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
            <planeGeometry args={[5000, 5000]} />
            <meshStandardMaterial color="#93a06a" roughness={1} />
          </mesh>
        )}
        {city && (
          <mesh geometry={city} castShadow receiveShadow>
            <meshStandardMaterial color="#dde1e7" roughness={0.92} metalness={0} flatShading />
          </mesh>
        )}
        <OrbitControls makeDefault enablePan target={[0, 0, 0]} maxPolarAngle={1.5} maxDistance={ext * 2.5} />
      </Canvas>
      <div style={{ position: 'absolute', top: 18, left: 20, fontFamily: 'var(--font-mono,monospace)', fontSize: 12, letterSpacing: '0.05em', color: '#11202e', background: 'rgba(255,255,255,0.82)', padding: '8px 12px', borderRadius: 8 }}>
        REAL-WORLD DISTRICT · <b>{name}</b><br />OSM buildings + AWS terrain → low-poly · {status}
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', flexWrap: 'wrap', gap: 6, fontFamily: 'var(--font-mono,monospace)', fontSize: 11 }}>
        {ORDER.map((k) => (
          <a key={k} href={`/realmap?at=${k}`} style={{ padding: '5px 9px', borderRadius: 7, textDecoration: 'none', color: '#11202e', background: name === LOCATIONS[k].name ? '#aee0c0' : 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.12)' }}>{k}</a>
        ))}
      </div>
    </div>
  );
}
