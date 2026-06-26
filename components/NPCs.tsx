'use client';
// Wandering low-poly pedestrians — clones of the generated character. Given `hubs`
// (workplaces), most cluster around a site and mill about it, so each locale reads as an
// active workplace rather than empty land. Per-NPC size + colour variety so they don't look
// like identical clones. (A handful of skinned clones; instancing/VAT for true mass crowds.)
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const lerpAngle = (a: number, b: number, t: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
const inPlace = (clip: THREE.AnimationClip) => { const c = clip.clone(); c.tracks = c.tracks.filter((t) => !t.name.endsWith('.position')); return c; };
// muted work-wear palette — tinting toward these reads as a varied crew (hi-vis, denim, grey…)
const TINTS = ['#3a4a6a', '#6a6a6a', '#7a6a4a', '#3a5a3a', '#b06a2a', '#5a5a7a', '#8a3a3a'].map((c) => new THREE.Color(c));

export default function NPCs({ sampleRef, count = 6, range = 26, isWalkable, scale = 1, hubs }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  count?: number;
  range?: number;
  isWalkable?: (x: number, z: number) => boolean;   // city: avoid building cells (else: on land)
  scale?: number;
  hubs?: [number, number][];                         // workplaces to cluster crowds around
}) {
  const { scene, animations } = useGLTF('/models/character-walk.glb');
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // pick a reachable point: near an assigned hub (a workplace) if given, else anywhere on land
  const pointNear = (out: THREE.Vector3, hub?: [number, number]) => {
    for (let i = 0; i < 12; i++) {
      let x: number, z: number;
      if (hub) { const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 8; x = hub[0] + Math.cos(a) * r; z = hub[1] + Math.sin(a) * r; }
      else { x = (Math.random() * 2 - 1) * range; z = (Math.random() * 2 - 1) * range; }
      const ok = isWalkable ? isWalkable(x, z) : (sampleRef.current ? sampleRef.current(x, z) > 0.6 : true);
      if (ok) { out.set(x, 0, z); return out; }
    }
    out.set(hub ? hub[0] : (Math.random() * 2 - 1) * range, 0, hub ? hub[1] : (Math.random() * 2 - 1) * range);
    return out;
  };

  const npcs = useMemo(() => Array.from({ length: count }, (_, i) => {
    const obj = skeletonClone(scene) as THREE.Object3D;
    obj.scale.setScalar(scale * (0.9 + Math.random() * 0.3));      // size variety
    const tint = TINTS[Math.floor(Math.random() * TINTS.length)];  // outfit variety
    obj.traverse((o: any) => { if (o.isMesh && o.material) { o.material = o.material.clone(); if (o.material.color) o.material.color.lerp(tint, 0.24); } });
    const mixer = new THREE.AnimationMixer(obj);
    if (animations[0]) { const a = mixer.clipAction(inPlace(animations[0])); a.timeScale = 0.85 + Math.random() * 0.4; a.time = Math.random() * 2; a.play(); } // desync the strides
    const hub = hubs && hubs.length ? hubs[i % hubs.length] : undefined;   // assign workers round-robin to workplaces
    const pos = pointNear(new THREE.Vector3(), hub);
    return { obj, mixer, pos, target: pointNear(new THREE.Vector3(), hub), hub, facing: Math.random() * Math.PI * 2, speed: 1.1 + Math.random() * 1.1 };
  }), [scene, animations, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useRef<THREE.Object3D[]>([]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    for (const n of npcs) {
      tmp.subVectors(n.target, n.pos); tmp.y = 0;
      const d = tmp.length();
      if (d < 1) { pointNear(n.target, n.hub); }
      else { tmp.normalize(); n.pos.addScaledVector(tmp, n.speed * dt); n.facing = lerpAngle(n.facing, Math.atan2(tmp.x, tmp.z), 0.08); }
      n.pos.y = sampleRef.current ? Math.max(sampleRef.current(n.pos.x, n.pos.z), -0.05) : 0;
      n.obj.position.copy(n.pos); n.obj.rotation.y = n.facing;
      n.mixer.update(dt);
    }
  });

  return <>{npcs.map((n, i) => <primitive key={i} object={n.obj} ref={(el: THREE.Object3D) => { groups.current[i] = el; }} />)}</>;
}
