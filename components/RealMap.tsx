'use client';
// REAL-WORLD MAP — Arnis technique in R3F: OpenStreetMap (Overpass) → buildings (extruded) + roads
// (ribbons) + water + parks, draped on real terrain from AWS terrarium elevation tiles (free, no
// token), all in our low-poly look. Pick the place with ?at=<district>.
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FirstPerson } from '@/components/WorldEncounter';

type BBox = { s: number; w: number; n: number; e: number };
type Sampler = (lat: number, lon: number) => number;
type Proj = { x: (lon: number) => number; z: (lat: number) => number };

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

// one Overpass call for every layer we draw
const query = (b: BBox) => `[out:json][timeout:40];(` +
  `way["building"](${b.s},${b.w},${b.n},${b.e});` +
  `way["highway"](${b.s},${b.w},${b.n},${b.e});` +
  `way["natural"="water"](${b.s},${b.w},${b.n},${b.e});` +
  `way["waterway"="riverbank"](${b.s},${b.w},${b.n},${b.e});` +
  `way["leisure"="park"](${b.s},${b.w},${b.n},${b.e});` +
  `way["landuse"~"grass|forest|meadow|recreation_ground|cemetery"](${b.s},${b.w},${b.n},${b.e});` +
  `);out geom;`;

function projector(b: BBox): Proj {
  const lat0 = (b.s + b.n) / 2, lon0 = (b.w + b.e) / 2;
  const mLat = 110540, mLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  return { x: (lon) => (lon - lon0) * mLon, z: (lat) => (lat - lat0) * mLat };
}

async function elevationSampler(b: BBox, z = 13): Promise<Sampler | null> {
  try {
    const cLat = (b.s + b.n) / 2, cLon = (b.w + b.e) / 2, n = 2 ** z, rad = (d: number) => (d * Math.PI) / 180;
    const tx = Math.floor(((cLon + 180) / 360) * n);
    const ty = Math.floor(((1 - Math.log(Math.tan(rad(cLat)) + 1 / Math.cos(rad(cLat))) / Math.PI) / 2) * n);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${tx}/${ty}.png`;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d')!; ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, 256, 256).data;
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

const ground = (s: Sampler | null, lat: number, lon: number, base: number) => (s ? s(lat, lon) - base : 0);

function buildBuildings(els: any[], p: Proj, s: Sampler | null, base: number) {
  const geos: THREE.BufferGeometry[] = [];
  for (const el of els) {
    const ring = el.geometry; if (!ring || ring.length < 4) continue;
    const shape = new THREE.Shape();
    ring.forEach((pt: any, i: number) => { const x = p.x(pt.lon), zz = p.z(pt.lat); i === 0 ? shape.moveTo(x, zz) : shape.lineTo(x, zz); });
    const t = el.tags || {};
    let h = parseFloat(t.height) || parseFloat(t['building:levels']) * 3.2 || 6 + Math.random() * 9;
    h = Math.max(3, Math.min(h, 380));
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(0, ground(s, ring[0].lat, ring[0].lon, base), 0);
    g.computeVertexNormals();
    geos.push(g);
  }
  return geos.length ? mergeGeometries(geos, false) : null;
}

const roadWidth = (t: any) => {
  const h = t.highway;
  if (h === 'motorway' || h === 'trunk') return 14;
  if (h === 'primary') return 11;
  if (h === 'secondary') return 9;
  if (h === 'tertiary') return 7;
  if (h === 'residential' || h === 'unclassified') return 6;
  if (h === 'service') return 4;
  if (h === 'footway' || h === 'path' || h === 'pedestrian' || h === 'cycleway' || h === 'steps') return 2.5;
  return 5;
};

function buildRoads(els: any[], p: Proj, s: Sampler | null, base: number) {
  const geos: THREE.BufferGeometry[] = [];
  for (const el of els) {
    const g = el.geometry; if (!g || g.length < 2) continue;
    const hw = roadWidth(el.tags || {}) / 2;
    const verts: number[] = [], idx: number[] = [];
    const pts = g.map((pt: any) => ({ x: p.x(pt.lon), z: p.z(pt.lat), y: ground(s, pt.lat, pt.lon, base) + 0.35 }));
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], c = pts[i + 1];
      const dx = c.x - a.x, dz = c.z - a.z, len = Math.hypot(dx, dz) || 1;
      const nx = (-dz / len) * hw, nz = (dx / len) * hw;
      const k = verts.length / 3;
      verts.push(a.x + nx, a.y, a.z + nz, a.x - nx, a.y, a.z - nz, c.x + nx, c.y, c.z + nz, c.x - nx, c.y, c.z - nz);
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
    if (!verts.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geos.push(geo);
  }
  if (!geos.length) return null;
  const m = mergeGeometries(geos, false); m?.computeVertexNormals(); return m;
}

function buildPolys(els: any[], p: Proj, s: Sampler | null, base: number, raise: number) {
  const geos: THREE.BufferGeometry[] = [];
  for (const el of els) {
    const ring = el.geometry; if (!ring || ring.length < 4) continue;
    const shape = new THREE.Shape();
    let clat = 0, clon = 0;
    ring.forEach((pt: any, i: number) => { const x = p.x(pt.lon), zz = p.z(pt.lat); i === 0 ? shape.moveTo(x, zz) : shape.lineTo(x, zz); clat += pt.lat; clon += pt.lon; });
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, ground(s, clat / ring.length, clon / ring.length, base) + raise, 0);
    geos.push(geo);
  }
  return geos.length ? mergeGeometries(geos, false) : null;
}

function classify(el: any): 'building' | 'road' | 'water' | 'green' | null {
  const t = el.tags || {};
  if (t.building) return 'building';
  if (t.highway) return 'road';
  if (t.natural === 'water' || t.waterway) return 'water';
  if (t.leisure === 'park' || t.landuse) return 'green';
  return null;
}

export default function RealMap() {
  const { bbox, name, ext } = useMemo(() => {
    const at = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('at') || 'Manhattan' : 'Manhattan';
    const loc = LOCATIONS[at] || LOCATIONS.Manhattan;
    const dLon = loc.span / Math.cos((loc.lat * Math.PI) / 180);
    const ext = 2 * dLon * 111320 * Math.cos((loc.lat * Math.PI) / 180);
    return { bbox: { s: loc.lat - loc.span, n: loc.lat + loc.span, w: loc.lng - dLon, e: loc.lng + dLon } as BBox, name: loc.name, ext };
  }, []);
  const [layers, setLayers] = useState<{ buildings?: THREE.BufferGeometry | null; roads?: THREE.BufferGeometry | null; water?: THREE.BufferGeometry | null; green?: THREE.BufferGeometry | null; terrain?: THREE.BufferGeometry | null }>({});
  const [status, setStatus] = useState(`Loading ${name}…`);
  const [mode, setMode] = useState<'orbit' | 'walk'>('orbit');
  const sampleRef = useRef<((x: number, z: number) => number) | null>(null);   // world (x,z) → ground height, for FirstPerson
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = mode !== 'walk'; }, [mode]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [res, sample] = await Promise.all([
          fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query(bbox))).then((r) => r.json()),
          elevationSampler(bbox),
        ]);
        if (!alive) return;
        const p = projector(bbox);
        const base = sample ? sample((bbox.s + bbox.n) / 2, (bbox.w + bbox.e) / 2) : 0;
        // world (x,z metres) → ground height for the walker, by inverting the projection to lat/lon
        const lat0 = (bbox.s + bbox.n) / 2, lon0 = (bbox.w + bbox.e) / 2, mLat = 110540, mLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
        sampleRef.current = (x, z) => (sample ? sample(lat0 + z / mLat, lon0 + x / mLon) - base : 0);
        const els = (res.elements || []) as any[];
        const by = { building: [] as any[], road: [] as any[], water: [] as any[], green: [] as any[] };
        for (const el of els) { const c = classify(el); if (c) by[c].push(el); }
        setLayers({
          buildings: buildBuildings(by.building, p, sample, base),
          roads: buildRoads(by.road, p, sample, base),
          water: buildPolys(by.water, p, sample, base, 0.5),
          green: buildPolys(by.green, p, sample, base, 0.15),
          terrain: sample ? buildTerrain(bbox, sample, base) : null,
        });
        setStatus(`${by.building.length} buildings · ${by.road.length} roads · ${by.water.length} water · ${by.green.length} parks · ${sample ? 'real terrain' : 'flat'}`);
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
        {layers.terrain ? (
          <mesh geometry={layers.terrain} receiveShadow>
            <meshStandardMaterial vertexColors flatShading roughness={1} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
            <planeGeometry args={[6000, 6000]} />
            <meshStandardMaterial color="#93a06a" roughness={1} />
          </mesh>
        )}
        {layers.green && <mesh geometry={layers.green} receiveShadow><meshStandardMaterial color="#6f9550" roughness={1} side={THREE.DoubleSide} /></mesh>}
        {layers.water && <mesh geometry={layers.water}><meshStandardMaterial color="#3d6e8c" roughness={0.4} metalness={0.1} side={THREE.DoubleSide} /></mesh>}
        {layers.roads && <mesh geometry={layers.roads} receiveShadow><meshStandardMaterial color="#3a3d42" roughness={0.95} side={THREE.DoubleSide} /></mesh>}
        {layers.buildings && <mesh geometry={layers.buildings} castShadow receiveShadow><meshStandardMaterial color="#dde1e7" roughness={0.92} flatShading /></mesh>}
        {mode === 'walk'
          ? <FirstPerson sampleRef={sampleRef} pausedRef={pausedRef} spawn={[0, 0, 0]} bound={Math.max(20, ext / 2 - 10)} />
          : <OrbitControls makeDefault enablePan target={[0, 0, 0]} maxPolarAngle={1.5} maxDistance={ext * 2.5} />}
      </Canvas>
      <button onClick={() => setMode((m) => (m === 'walk' ? 'orbit' : 'walk'))}
        style={{ position: 'absolute', top: 18, right: 20, fontFamily: 'var(--font-mono,monospace)', fontSize: 12, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', color: '#11202e', background: mode === 'walk' ? '#aee0c0' : 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.15)' }}>
        {mode === 'walk' ? '⊙ orbit' : '🚶 walk it'}
      </button>
      {mode === 'walk' && (
        <div style={{ position: 'absolute', bottom: 58, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono,monospace)', fontSize: 12, color: '#fff', background: 'rgba(10,16,28,0.72)', padding: '6px 14px', borderRadius: 8 }}>
          click to look · <b>WASD</b> move · <b>esc</b> release
        </div>
      )}
      <div style={{ position: 'absolute', top: 18, left: 20, fontFamily: 'var(--font-mono,monospace)', fontSize: 12, letterSpacing: '0.05em', color: '#11202e', background: 'rgba(255,255,255,0.82)', padding: '8px 12px', borderRadius: 8 }}>
        REAL-WORLD DISTRICT · <b>{name}</b><br />OSM buildings·roads·water·parks + AWS terrain · {status}
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', flexWrap: 'wrap', gap: 6, fontFamily: 'var(--font-mono,monospace)', fontSize: 11 }}>
        {ORDER.map((k) => (
          <a key={k} href={`/realmap?at=${k}`} style={{ padding: '5px 9px', borderRadius: 7, textDecoration: 'none', color: '#11202e', background: name === LOCATIONS[k].name ? '#aee0c0' : 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.12)' }}>{k}</a>
        ))}
      </div>
    </div>
  );
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
  for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) { const a = j * N + i; idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
