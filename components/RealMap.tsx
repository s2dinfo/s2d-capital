'use client';
// REAL-WORLD SPIKE — the Arnis technique in our web/R3F stack: pull a real location's building
// footprints from OpenStreetMap (Overpass API), read their height tags, and extrude them into our
// stylized low-poly look. Swap BBOX to point at any place on Earth (our chip-world districts next).
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// a small, dense, recognizable slice to prove the pipeline. (Next: Hsinchu/TSMC 24.78,120.99 ·
// Veldhoven/ASML 51.42,5.40 · Santa Clara/Nvidia 37.37,-121.96 · Atacama/Copper -24.5,-69.25)
const BBOX = { s: 40.7520, w: -73.9870, n: 40.7565, e: -73.9820, name: 'Midtown Manhattan' };

const query = (b: typeof BBOX) => `[out:json][timeout:30];way["building"](${b.s},${b.w},${b.n},${b.e});out geom;`;

function buildCity(elements: any[], b: typeof BBOX): THREE.BufferGeometry | null {
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
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const [status, setStatus] = useState(`Loading ${BBOX.name} from OpenStreetMap…`);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query(BBOX)));
        const json = await res.json();
        const g = buildCity(json.elements || [], BBOX);
        if (!alive) return;
        if (!g) { setStatus('No buildings returned.'); return; }
        setGeo(g);
        setStatus(`${(json.elements || []).length} buildings · drag to orbit`);
      } catch (e: any) { if (alive) setStatus('OSM fetch failed: ' + (e?.message || e)); }
    })();
    return () => { alive = false; };
  }, []);
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
          <planeGeometry args={[3000, 3000]} />
          <meshStandardMaterial color="#93a06a" roughness={1} />
        </mesh>
        {geo && (
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color="#dde1e7" roughness={0.92} metalness={0} flatShading />
          </mesh>
        )}
        <OrbitControls makeDefault enablePan target={[0, 25, 0]} maxPolarAngle={1.5} maxDistance={1200} />
      </Canvas>
      <div style={{ position: 'absolute', top: 18, left: 20, fontFamily: 'var(--font-mono,monospace)', fontSize: 12, letterSpacing: '0.05em', color: '#11202e', background: 'rgba(255,255,255,0.82)', padding: '8px 12px', borderRadius: 8 }}>
        REAL-WORLD SPIKE · <b>{BBOX.name}</b><br />OpenStreetMap → extruded low-poly · {status}
      </div>
    </div>
  );
}
