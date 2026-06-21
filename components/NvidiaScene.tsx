'use client';
// ── The Nvidia encounter as a real 3D space with a RIGGED, TALKING avatar. ──
// Environment: stylized stage + reflective floor + emissive structure + atmosphere.
// Character: a VRM avatar that lip-syncs to the real ElevenLabs voice (mouth driven
// by a live Web Audio analyser), blinks, sways, and looks at the camera.
import * as THREE from 'three';
import { useRef, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';

// ── The rigged avatar ──────────────────────────────────────────────────────
function Avatar({ mouthRef }: { mouthRef: React.MutableRefObject<number> }) {
  const gltf = useLoader(GLTFLoader, '/characters/avatar.vrm', (loader) => {
    (loader as GLTFLoader).register((parser) => new VRMLoaderPlugin(parser));
  });
  const vrm = (gltf.userData as { vrm: any }).vrm;
  const blinkT = useRef(2);
  const mouth = useRef(0);

  useEffect(() => {
    if (!vrm) return;
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    vrm.scene.traverse((o: THREE.Object3D) => {
      o.frustumCulled = false;
      o.castShadow = true;
    });
  }, [vrm]);

  useFrame((state, delta) => {
    if (!vrm) return;
    const t = state.clock.elapsedTime;
    const em = vrm.expressionManager;
    const bone = (n: string) => vrm.humanoid?.getNormalizedBoneNode?.(n);

    // pose out of the default T-pose into a natural relaxed stance (arms down)
    const lUp = bone('leftUpperArm'); if (lUp) lUp.rotation.set(0.1, 0, -1.25);
    const rUp = bone('rightUpperArm'); if (rUp) rUp.rotation.set(0.1, 0, 1.25);
    const lLo = bone('leftLowerArm'); if (lLo) lLo.rotation.set(0, -0.25, -0.15);
    const rLo = bone('rightLowerArm'); if (rLo) rLo.rotation.set(0, 0.25, 0.15);

    // lip-sync: smooth the analyser amplitude into the mouth-open expression
    mouth.current += (mouthRef.current - mouth.current) * 0.5;
    if (em) {
      em.setValue('aa', Math.min(1, mouth.current));
      // periodic natural blink
      blinkT.current -= delta;
      let blink = 0;
      if (blinkT.current < 0.16 && blinkT.current > 0) blink = 1 - Math.abs(blinkT.current - 0.08) / 0.08;
      if (blinkT.current <= 0) blinkT.current = 2.5 + Math.random() * 3.5;
      em.setValue('blink', Math.max(0, blink));
    }
    // jaw bone fallback (some VRMs animate the mouth via a jaw bone, not expressions)
    const jaw = vrm.humanoid?.getNormalizedBoneNode?.('jaw');
    if (jaw) jaw.rotation.x = Math.min(1, mouth.current) * 0.28;

    // subtle idle aliveness
    const spine = vrm.humanoid?.getNormalizedBoneNode?.('spine');
    if (spine) spine.rotation.y = Math.sin(t * 0.5) * 0.035;
    const head = vrm.humanoid?.getNormalizedBoneNode?.('head');
    if (head) head.rotation.x = Math.sin(t * 0.7) * 0.025;

    // look at the viewer
    if (vrm.lookAt) vrm.lookAt.target = state.camera;
    vrm.update(delta);
  });

  // face the +Z camera
  return <primitive object={vrm.scene} rotation={[0, 0, 0]} position={[0, 0, 0]} />;
}

// ── Environment ─────────────────────────────────────────────────────────────
function Stage() {
  return (
    <group>
      {/* glowing stage disc the figure stands on */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#0a1118" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color="#1affa0" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* back structure: emissive vertical light bars */}
      {[-6, -4.4, -2.8, 2.8, 4.4, 6].map((x, i) => (
        <mesh key={i} position={[x, 3.2, -6.5]}>
          <boxGeometry args={[0.1, 6.4, 0.1]} />
          <meshStandardMaterial color="#08120c" emissive="#1affa0" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}
      {/* a wide dim back wall for depth */}
      <mesh position={[0, 3, -7]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#060a10" metalness={0.3} roughness={0.9} />
      </mesh>
      {/* overhead accent bars */}
      {[-2.2, 0, 2.2].map((x, i) => (
        <mesh key={`o${i}`} position={[x, 6.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.08, 4, 0.08]} />
          <meshStandardMaterial color="#08120c" emissive="#39e0ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ mouthRef }: { mouthRef: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={['#04060b']} />
      <fog attach="fog" args={['#04060b', 8, 26]} />

      <hemisphereLight args={['#2a3340', '#000', 0.5]} />
      <ambientLight intensity={0.18} />
      <spotLight position={[2.5, 7, 5]} angle={0.55} penumbra={0.9} intensity={500} color="#eaf6ff" distance={40} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} />
      <spotLight position={[-4, 4, -2]} angle={0.7} penumbra={1} intensity={120} color="#1affa0" distance={28} />
      <pointLight position={[3.5, 2, 3]} intensity={26} color="#39e0ff" distance={22} />

      <Suspense fallback={null}>
        <Avatar mouthRef={mouthRef} />
      </Suspense>
      <Stage />
      <Sparkles count={70} scale={[14, 7, 10]} position={[0, 3.5, -1]} size={2.2} speed={0.25} color="#1affa0" opacity={0.5} />

      {/* reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial
          blur={[300, 110]}
          resolution={1024}
          mixBlur={1}
          mixStrength={45}
          roughness={0.8}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#060a11"
          metalness={0.75}
        />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.8}
        maxDistance={9}
        minPolarAngle={0.6}
        maxPolarAngle={1.56}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 1.3, 0]}
      />

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.4} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.3} darkness={0.92} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </>
  );
}

export default function NvidiaScene() {
  const [speaking, setSpeaking] = useState(false);
  const mouthRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  const speak = () => {
    if (speaking) return;
    const script = ENCOUNTERS.Nvidia;
    const line = script.intro.find((l) => l.who === 'speaker')?.text || '';
    const src = `/audio/${lineAudioId(script.voiceId || '', line)}.mp3`;
    const audio = new Audio(src);
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
    }
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const data = new Uint8Array(analyser.fftSize);
    setSpeaking(true);
    const tick = () => {
      if (audio.paused || audio.ended) { mouthRef.current = 0; return; }
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      mouthRef.current = Math.min(1, Math.sqrt(sum / data.length) * 3.4);
      requestAnimationFrame(tick);
    };
    audio.onended = () => { setSpeaking(false); mouthRef.current = 0; };
    audio.onerror = () => { setSpeaking(false); mouthRef.current = 0; };
    ctx.resume().then(() => audio.play()).then(() => tick()).catch(() => setSpeaking(false));
  };

  return (
    <div className="ns-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.4, 3.8], fov: 42 }}>
        <Scene mouthRef={mouthRef} />
      </Canvas>

      <div className="ns-ui">
        <div className="ns-top">
          <Link href="/world" className="ns-back">← back to the world</Link>
          <div className="ns-eyebrow">NVIDIA HQ · SANTA CLARA</div>
          <h1 className="ns-name">Jensen Huang</h1>
          <div className="ns-role">Founder &amp; CEO, Nvidia — stylized, dramatized from public statements</div>
        </div>
        <div className="ns-bottom">
          <button className={'ns-speak' + (speaking ? ' ns-speaking' : '')} onClick={speak}>
            {speaking ? '◉ speaking…' : '▶ speak with Jensen'}
          </button>
          <div className="ns-hint">drag to look around · scroll to move closer</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ns-stage{position:fixed;inset:0;background:#04060b}
        .ns-stage canvas{display:block;width:100%;height:100%}
        .ns-ui{position:absolute;inset:0;pointer-events:none;padding:28px 32px;display:flex;flex-direction:column;justify-content:space-between}
        .ns-top{max-width:60%}
        .ns-back{pointer-events:auto;display:inline-block;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.1em;color:rgba(255,255,255,0.5);text-decoration:none;margin-bottom:22px}
        .ns-back:hover{color:#fff}
        .ns-eyebrow{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.24em;color:#1affa0;margin-bottom:10px;text-shadow:0 0 16px rgba(26,255,160,0.5)}
        .ns-name{font-family:var(--font-serif);font-weight:400;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 8px;line-height:1}
        .ns-role{font-family:var(--font-sans);font-size:0.82rem;color:rgba(255,255,255,0.5)}
        .ns-bottom{display:flex;flex-direction:column;align-items:center;gap:12px}
        .ns-speak{pointer-events:auto;font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#04140d;background:linear-gradient(135deg,#3affb0,#12c98a);border:none;padding:14px 30px;border-radius:999px;cursor:pointer;box-shadow:0 0 32px rgba(26,255,160,0.4);transition:transform 0.2s,box-shadow 0.2s}
        .ns-speak:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(26,255,160,0.6)}
        .ns-speaking{animation:nsPulse 1.1s ease-in-out infinite}
        @keyframes nsPulse{0%,100%{box-shadow:0 0 28px rgba(26,255,160,0.4)}50%{box-shadow:0 0 56px rgba(26,255,160,0.85)}}
        .ns-hint{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.06em;color:rgba(255,255,255,0.32)}
      ` }} />
    </div>
  );
}
