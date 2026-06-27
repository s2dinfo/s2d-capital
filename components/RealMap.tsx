'use client';
// REAL-WORLD MAP — the Arnis technique in our R3F stack: pull a real location's building footprints
// from OpenStreetMap (Overpass API), read height tags, extrude into our stylized low-poly look.
// Pick the place with ?at=<key> — our 9 chip-world districts at their REAL coordinates + a demo.
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type BBox = { s: number; w: number; n: number; e: number };

// each chip-world district at its REAL location (lat, lng) + half-span in degrees
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

function buildCity(elements: any[], b: BBox): THREE.BufferGeometry | null {
  const lat0 = (b.s + b.n) / 2, lon0 = (b.w + b.e) / 2;
  const mLat = 110540, mLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const geos: THREE.BufferGeometry[] = [];
  for (const el of elements) {
    const ring = el.geometry;
    if (!ring || ring.length < 4) continue;                       // need a closed polygon
    const shape = new THREE.Shape();
    ring.forEach((p: any, i: number) => {
      const x = (p.lon - lon0) * mLon, z = (p.lat - lat0) * mLat;
      i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z);
    });
    const t = el.tags || {};
    let h = parseFloat(t.height) || parseFloat(t['building:levels']) * 3.2 || 6 + Math.random() * 9;
    h = Math.max(3, Math.min(h, 380));
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);                                       // footprint → ground, height → up
    g.computeVertexNormals();
    geos.push(g);
  }
  return geos.length ? mergeGeometries(geos, false) : null;
}

export default function RealMap() {
  const { bbox, name } = useMemo(() => {
    const at = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('at') || 'Manhattan' : 'Manhattan';
    const loc = LOCATIONS[at] || LOCATIONS.Manhattan;
    const dLon = loc.span / Math.cos((loc.lat * Math.PI) / 180);
    return { bbox: { s: loc.lat - loc.span, n: loc.lat + loc.span, w: loc.lng - dLon, e: loc.lng + dLon } as BBox, name: loc.name };
  }, []);
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const [status, setStatus] = useState(`Loading ${name} from OpenStreetMap…`);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query(bbox)));
        const json = await res.json();
        const g = buildCity(json.elements || [], bbox);
        if (!alive) return;
        if (!g) { setStatus('no buildings here — try a different district'); return; }
        setGeo(g);
        setStatus(`${(json.elements || []).length} real buildings · drag to orbit`);
      } catch (e: any) { if (alive) setStatus('OSM fetch failed: ' + (e?.message || e)); }
    })();
    return () => { alive = false; };
  }, [bbox]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#cdd9e6' }}>
      <Canvas shadows camera={{ position: [320, 260, 320], fov: 45 }} dpr={[1, 1.5]}>
        <Sky sunPosition={[120, 70, 90]} turbidity={5} rayleigh={2} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#e3eef9', '#5a5f50', 0.6]} />
        <directionalLight position={[140, 200, 100]} intensity={2.3} color="#fff3da" castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-450} shadow-camera-right={450}
          shadow-camera-top={450} shadow-camera-bottom={-450} shadow-camera-far={1000} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[4000, 4000]} />
          <meshStandardMaterial color="#93a06a" roughness={1} />
        </mesh>
        {geo && (
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color="#dde1e7" roughness={0.92} metalness={0} flatShading />
          </mesh>
        )}
        <OrbitControls makeDefault enablePan target={[0, 25, 0]} maxPolarAngle={1.5} maxDistance={1400} />
      </Canvas>
      <div style={{ position: 'absolute', top: 18, left: 20, fontFamily: 'var(--font-mono,monospace)', fontSize: 12, letterSpacing: '0.05em', color: '#11202e', background: 'rgba(255,255,255,0.82)', padding: '8px 12px', borderRadius: 8 }}>
        REAL-WORLD DISTRICT · <b>{name}</b><br />OpenStreetMap → extruded low-poly · {status}
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', flexWrap: 'wrap', gap: 6, fontFamily: 'var(--font-mono,monospace)', fontSize: 11 }}>
        {ORDER.map((k) => (
          <a key={k} href={`/realmap?at=${k}`} style={{ padding: '5px 9px', borderRadius: 7, textDecoration: 'none', color: '#11202e', background: name === LOCATIONS[k].name ? '#aee0c0' : 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.12)' }}>{k}</a>
        ))}
      </div>
    </div>
  );
}
