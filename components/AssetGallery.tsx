'use client';
// Lineup viewer to eyeball a batch of generated world assets at once.
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { Suspense, useMemo } from 'react';

const MODELS = ['datacenter', 'fab', 'pumpjack', 'powerplant', 'minehead', 'haultruck', 'container'];

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const k = 2.6 / (Math.max(size.x, size.y, size.z) || 1);
    s.scale.setScalar(k);
    const b2 = new THREE.Box3().setFromObject(s);
    const c = b2.getCenter(new THREE.Vector3());
    s.position.set(-c.x, -b2.min.y, -c.z);
    return s;
  }, [scene]);
  return <primitive object={obj} />;
}

export default function AssetGallery() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 35%, #1a2438, #060a12)' }}>
      <Canvas camera={{ position: [0, 4.2, 15], fov: 46 }} shadows dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#bcd4f2', '#202830', 0.6]} />
        <directionalLight position={[6, 11, 6]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
        <Suspense fallback={null}>
          {MODELS.map((m, i) => (
            <group key={m} position={[(i - (MODELS.length - 1) / 2) * 3.6, 0, 0]}>
              <Model src={`/models/${m}.glb`} />
              <Html position={[0, -0.4, 0]} center style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{m}</Html>
            </group>
          ))}
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={26} blur={2.4} far={6} />
        <OrbitControls enablePan={false} target={[0, 1, 0]} minDistance={6} maxDistance={28} />
      </Canvas>
    </div>
  );
}
