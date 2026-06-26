'use client';
// A small flock of low-poly birds wheeling overhead — cheap ambient life + a sense of scale.
// One InstancedMesh (no per-bird draw calls); each drifts on its own circle, bobs, and rolls
// to fake a wing-flap. Purely decorative, terrain-independent (it's the sky), so no collision.
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Birds({ count = 16 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => { const g = new THREE.ConeGeometry(0.55, 1.6, 3); g.rotateX(Math.PI / 2); g.scale(1, 0.28, 1); return g; }, []); // a flat dart
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2b3140' }), []);
  const flock = useMemo(() => Array.from({ length: count }, () => ({
    radius: 26 + Math.random() * 46,
    height: 20 + Math.random() * 16,
    cx: (Math.random() * 2 - 1) * 24,
    cz: (Math.random() * 2 - 1) * 24,
    phase: Math.random() * Math.PI * 2,
    speed: 0.05 + Math.random() * 0.05,
    flap: Math.random() * Math.PI * 2,
  })), [count]);

  useFrame((s) => {
    const m = ref.current; if (!m) return;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < flock.length; i++) {
      const b = flock[i];
      const a = b.phase + t * b.speed;
      dummy.position.set(b.cx + Math.cos(a) * b.radius, b.height + Math.sin(t * 0.5 + b.phase) * 1.6, b.cz + Math.sin(a) * b.radius);
      dummy.rotation.set(0, -a, Math.sin(t * 9 + b.flap) * 0.6);   // face the turn + flap roll
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}
