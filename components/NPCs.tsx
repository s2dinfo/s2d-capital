'use client';
// Wandering low-poly pedestrians — clones of the generated character, each walking between
// random points on the land. Cheap crowd life (a handful; VAT/instancing later for big crowds).
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const lerpAngle = (a: number, b: number, t: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
const inPlace = (clip: THREE.AnimationClip) => { const c = clip.clone(); c.tracks = c.tracks.filter((t) => !t.name.endsWith('.position')); return c; };

export default function NPCs({ sampleRef, count = 6, range = 26 }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  count?: number;
  range?: number;
}) {
  const { scene, animations } = useGLTF('/models/character-walk.glb');
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // pick a random target that's on land (not water)
  const landPoint = (out: THREE.Vector3) => {
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() * 2 - 1) * range, z = (Math.random() * 2 - 1) * range;
      const h = sampleRef.current ? sampleRef.current(x, z) : 1;
      if (h > 0.6) { out.set(x, 0, z); return out; }
    }
    out.set((Math.random() * 2 - 1) * range, 0, (Math.random() * 2 - 1) * range);
    return out;
  };

  const npcs = useMemo(() => Array.from({ length: count }, (_, i) => {
    const obj = skeletonClone(scene) as THREE.Object3D;
    const mixer = new THREE.AnimationMixer(obj);
    if (animations[0]) { const a = mixer.clipAction(inPlace(animations[0])); a.timeScale = 0.85 + Math.random() * 0.4; a.play(); }
    const pos = landPoint(new THREE.Vector3());
    return { obj, mixer, pos, target: landPoint(new THREE.Vector3()), facing: Math.random() * Math.PI * 2, speed: 1.3 + Math.random() * 1.1 };
  }), [scene, animations, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useRef<THREE.Object3D[]>([]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    for (const n of npcs) {
      tmp.subVectors(n.target, n.pos); tmp.y = 0;
      const d = tmp.length();
      if (d < 1) { landPoint(n.target); }
      else { tmp.normalize(); n.pos.addScaledVector(tmp, n.speed * dt); n.facing = lerpAngle(n.facing, Math.atan2(tmp.x, tmp.z), 0.08); }
      n.pos.y = sampleRef.current ? Math.max(sampleRef.current(n.pos.x, n.pos.z), -0.05) : 0;
      n.obj.position.copy(n.pos); n.obj.rotation.y = n.facing;
      n.mixer.update(dt);
    }
  });

  return <>{npcs.map((n, i) => <primitive key={i} object={n.obj} ref={(el: THREE.Object3D) => { groups.current[i] = el; }} />)}</>;
}
