'use client';
// Minimal turntable viewer to confirm a generated GLB loads + looks right.
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Center, ContactShadows } from '@react-three/drei';
import { Suspense, useRef, useEffect } from 'react';
import type { Group } from 'three';

function Model({ src }: { src: string }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(src);
  const { actions, names } = useAnimations(animations, group);
  useEffect(() => {
    const a = names[0] ? actions[names[0]] : null;
    a?.reset().fadeIn(0.2).play();
    return () => { a?.fadeOut(0.2); };
  }, [actions, names]);
  return <group ref={group}><Center><primitive object={scene} /></Center></group>;
}

export default function AssetViewer({ src = '/models/car.glb' }: { src?: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 40%, #1a2438, #070b14)' }}>
      <Canvas camera={{ position: [3.2, 2.2, 3.2], fov: 45 }} shadows dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#bcd4f2', '#202830', 0.6]} />
        <directionalLight position={[5, 9, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <Model src={src} />
        </Suspense>
        <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={12} blur={2.2} far={4} />
        <OrbitControls autoRotate autoRotateSpeed={2.2} enablePan={false} minDistance={2} maxDistance={10} />
      </Canvas>
      <div style={{ position: 'absolute', top: 18, left: 20, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
        MESHY · {src.split('/').pop()}
      </div>
    </div>
  );
}
