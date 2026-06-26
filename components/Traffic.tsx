'use client';
// Off-road industrial vehicles hauling between the sites — haul trucks + cars that drape on
// the terrain and align to its slope (quaternion from the local normal), so they hug the
// ground like real off-roaders instead of floating. Moving metal = traffic/life. No roads yet
// (cross-country is honest for an industrial world; a real road network is a later pass).
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const lerpAngle = (a: number, b: number, t: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };

export default function Traffic({ sampleRef, waypoints, count = 6 }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  waypoints: [number, number][];
  count?: number;
}) {
  const car = useGLTF('/models/car.glb');
  const truck = useGLTF('/models/haultruck.glb');

  // clone + scale to a target footprint, drop wheels to y=0, wrap so we can move/tilt freely
  const prep = (scene: THREE.Object3D, targetLen: number) => {
    const inner = scene.clone(true);
    inner.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
    const box = new THREE.Box3().setFromObject(inner);
    const size = box.getSize(new THREE.Vector3());
    inner.scale.setScalar(targetLen / Math.max(size.x, size.z, 0.001));
    const box2 = new THREE.Box3().setFromObject(inner);
    const c = box2.getCenter(new THREE.Vector3());
    inner.position.set(-c.x, -box2.min.y, -c.z);
    const wrap = new THREE.Group(); wrap.add(inner); return wrap;
  };

  const scratch = useMemo(() => ({
    dir: new THREE.Vector3(), normal: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
    qUp: new THREE.Quaternion(), qYaw: new THREE.Quaternion(),
  }), []);

  const pickWaypoint = (): [number, number] => waypoints[(Math.random() * waypoints.length) | 0] || [0, 0];

  const fleet = useMemo(() => Array.from({ length: count }, (_, i) => {
    const isTruck = i % 2 === 0;
    const obj = prep(isTruck ? truck.scene : car.scene, isTruck ? 5.5 : 2.8);
    const a = pickWaypoint(), b = pickWaypoint();
    return { obj, pos: new THREE.Vector3(a[0], 0, a[1]), target: new THREE.Vector3(b[0], 0, b[1]), facing: 0, speed: isTruck ? 3.4 : 5.5 };
  }), [car.scene, truck.scene, count]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const sample = sampleRef.current;
    for (const v of fleet) {
      scratch.dir.subVectors(v.target, v.pos); scratch.dir.y = 0;
      const d = scratch.dir.length();
      if (d < 3) { const w = pickWaypoint(); v.target.set(w[0], 0, w[1]); }
      else { scratch.dir.normalize(); v.pos.addScaledVector(scratch.dir, v.speed * dt); v.facing = lerpAngle(v.facing, Math.atan2(scratch.dir.x, scratch.dir.z), 0.05); }
      v.pos.y = sample ? Math.max(sample(v.pos.x, v.pos.z), 0) : 0;
      v.obj.position.copy(v.pos);
      if (sample) {
        // terrain normal from nearby height samples, then yaw within that tilted frame
        const x = v.pos.x, z = v.pos.z;
        scratch.normal.set(sample(x - 1.2, z) - sample(x + 1.2, z), 2.4, sample(x, z - 1.2) - sample(x, z + 1.2)).normalize();
        scratch.qUp.setFromUnitVectors(scratch.up, scratch.normal);
        scratch.qYaw.setFromAxisAngle(scratch.up, v.facing);
        v.obj.quaternion.copy(scratch.qUp).multiply(scratch.qYaw);
      } else {
        v.obj.rotation.y = v.facing;
      }
    }
  });

  const refs = useRef<THREE.Object3D[]>([]);
  return <>{fleet.map((v, i) => <primitive key={i} object={v.obj} ref={(el: THREE.Object3D) => { refs.current[i] = el; }} />)}</>;
}
