'use client';
// Real generated GLB sites placed at each company in the world, replacing the primitive
// fabs/datacenters. Each model is cloned (companies share types), normalized to a sensible
// height, sat on the ground, and follows the terrain via sampleRef.
import * as THREE from 'three';
import { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { FieldEntry } from '@/components/WorldEncounter';

const NODE_MODEL: Record<string, string> = {
  Nvidia: 'datacenter', OpenAI: 'datacenter', Microsoft: 'datacenter',
  TSMC: 'fab', ASML: 'fab', Oil: 'pumpjack', Power: 'powerplant',
  Copper: 'minehead', RareEarth: 'minehead',
};
// target LARGEST dimension (normalizing by max dim, not height — flat models otherwise blow up)
const TARGET: Record<string, number> = { datacenter: 6, fab: 6, pumpjack: 5, powerplant: 6.5, minehead: 6, haultruck: 3.2, container: 3.4 };
// extra props scattered for life — haul trucks by the mines, container stacks around
const PROPS = [
  { x: 25, z: 7, type: 'haultruck', key: 'truck1' },
  { x: -26, z: -4, type: 'haultruck', key: 'truck2' },
  { x: 16, z: -13, type: 'container', key: 'cont1' },
  { x: -9, z: 19, type: 'container', key: 'cont2' },
  { x: 8, z: 12, type: 'container', key: 'cont3' },
];

// solid obstacles (x, z, radius) for the player/car to collide with — the site buildings +
// props. Figures are holograms, so they stay walk-through.
export function worldColliders(field: FieldEntry[]) {
  const sites = field.filter((f) => NODE_MODEL[f.node]).map((f) => {
    const [fx, fz] = f.pos; const len = Math.hypot(fx, fz) || 1;
    return { x: fx + (-fz / len) * 5, z: fz + (fx / len) * 5, r: 3.3 };
  });
  const props = PROPS.map((p) => ({ x: p.x, z: p.z, r: p.type === 'haultruck' ? 2.2 : 1.9 }));
  return [...sites, ...props];
}

function Site({ type }: { type: string }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  const obj = useMemo(() => {
    const s = scene.clone(true);
    // make generated materials render-safe (some come out metallic enough that the specular
    // blows out Bloom to NaN and blacks the whole frame) — kill metalness, keep it matte
    s.traverse((o: any) => {
      if (!o.isMesh) return;
      // recompute clean normals — generated meshes can have NaN/zero normals that Bloom's blur
      // spreads into a black frame
      if (o.geometry) { o.geometry.deleteAttribute('normal'); o.geometry.computeVertexNormals(); }
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m: any) => {
        if (!m) return;
        m.transparent = false; m.opacity = 1; m.depthWrite = true; m.colorWrite = true;
        m.side = THREE.FrontSide; m.blending = THREE.NormalBlending; m.toneMapped = true;
        // strip secondary maps — generated normal/metalness maps can yield NaN normals that
        // Bloom's blur then spreads across the whole frame (black screen). Keep base color only.
        for (const k of ['normalMap', 'metalnessMap', 'roughnessMap', 'aoMap', 'emissiveMap', 'bumpMap', 'displacementMap']) { if (m[k]) m[k] = null; }
        if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.05);
        if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 1, 0.8);
        if ('emissive' in m && m.emissive) m.emissive.setRGB(0, 0, 0);
        m.needsUpdate = true;
      });
    });
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    s.scale.setScalar((TARGET[type] || 5) / maxDim);
    const b2 = new THREE.Box3().setFromObject(s);
    const c = b2.getCenter(new THREE.Vector3());
    s.position.set(-c.x, -b2.min.y, -c.z);            // center x/z, feet on the ground
    return s;
  }, [scene, type]);
  return <primitive object={obj} />;
}

export default function WorldModels({ field, sampleRef }: { field: FieldEntry[]; sampleRef: { current: ((x: number, z: number) => number) | null } }) {
  const placed = useMemo(() => field.map((f) => {
    const type = NODE_MODEL[f.node];
    if (!type) return null;
    const [fx, fz] = f.pos; const len = Math.hypot(fx, fz) || 1;
    return { x: fx + (-fz / len) * 5, z: fz + (fx / len) * 5, type, key: f.node }; // beside the figure
  }).filter(Boolean).concat(PROPS) as { x: number; z: number; type: string; key: string }[], [field]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    for (let i = 0; i < placed.length; i++) { const g = groups.current[i]; if (g) g.position.y = sampleRef.current ? Math.max(sampleRef.current(placed[i].x, placed[i].z), -0.05) : 0; }
  });
  return (
    <Suspense fallback={null}>
      {placed.map((p, i) => (
        <group key={p.key} ref={(el) => { groups.current[i] = el; }} position={[p.x, 0, p.z]} rotation={[0, Math.atan2(-p.x, -p.z), 0]}>
          <Site type={p.type} />
        </group>
      ))}
    </Suspense>
  );
}
