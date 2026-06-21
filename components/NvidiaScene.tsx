'use client';
// ── Vertical slice: the Nvidia encounter as a real 3D space you can look around in.
// Proves the new foundation — R3F + custom GLSL shader + baked-feel lighting + post
// + the existing ElevenLabs voice — vs. the old "click a card" demo. ──
import * as THREE from 'three';
import { useRef, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';

const VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
// Hologram look: tinted portrait + scanlines + a travelling scan bar + soft oval
// mask (so it reads as a projection, not a pasted photo) + a speaking pulse.
const FRAG = `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uSpeaking;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    float jitter = sin(uv.y * 140.0 + uTime * 9.0) * 0.0016 * (0.4 + uSpeaking);
    uv.x += jitter;
    vec4 tex = texture2D(uMap, uv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 holo = mix(vec3(0.10, 0.95, 0.50), vec3(0.65, 1.0, 0.85), lum);
    vec3 col = mix(tex.rgb, holo, 0.4);
    col *= 0.82 + 0.18 * sin(uv.y * 820.0 - uTime * 7.0);            // scanlines
    float bar = abs(fract(uv.y - uTime * 0.10) - 0.5);              // travelling scan bar
    col += smoothstep(0.5, 0.46, bar) * vec3(0.15, 0.45, 0.30);
    vec2 c = uv - 0.5;
    float d = length(vec2(c.x * 1.15, c.y * 0.95));
    float mask = smoothstep(0.58, 0.34, d);                         // soft oval edge fade
    float flick = 0.92 + 0.08 * sin(uTime * 30.0 + 2.0);
    col *= 1.0 + 0.22 * uSpeaking * sin(uTime * 16.0);              // speaking glow pulse
    float alpha = mask * flick * (0.80 + 0.20 * uSpeaking);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Hologram({ speaking }: { speaking: boolean }) {
  const tex = useTexture('/characters/jensen-still.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const grpRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uMap: { value: tex }, uTime: { value: 0 }, uSpeaking: { value: 0 } }),
    [tex],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      const target = speaking ? 1 : 0;
      matRef.current.uniforms.uSpeaking.value += (target - matRef.current.uniforms.uSpeaking.value) * 0.08;
    }
    if (grpRef.current) grpRef.current.position.y = 1.55 + Math.sin(t * 1.2) * 0.04;
  });
  return (
    <group ref={grpRef} position={[0, 1.55, 0]}>
      <mesh>
        <planeGeometry args={[2.2, 2.9, 1, 1]} />
        <shaderMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
        />
      </mesh>
      {/* projection base glow on the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[1.15, 48]} />
        <meshBasicMaterial color="#1affa0" transparent opacity={0.13} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Pillars() {
  const xs = [-5, -3, 3, 5, 6.5];
  return (
    <>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, 3, -5 - (i % 2) * 2.5]}>
          <boxGeometry args={[0.14, 6, 0.14]} />
          <meshStandardMaterial color="#0a140e" emissive="#1affa0" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Scene({ speaking }: { speaking: boolean }) {
  return (
    <>
      <color attach="background" args={['#05060c']} />
      <fog attach="fog" args={['#05060c', 9, 24]} />

      <hemisphereLight args={['#223', '#000', 0.4]} />
      <ambientLight intensity={0.12} />
      <spotLight position={[3, 8, 5]} angle={0.6} penumbra={0.9} intensity={400} color="#cfffe6" distance={40} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3.5, 2.2, -3]} intensity={45} color="#1affa0" distance={22} />
      <pointLight position={[3.5, 1.6, 2.5]} intensity={28} color="#39e0ff" distance={20} />

      <Suspense fallback={null}>
        <Hologram speaking={speaking} />
      </Suspense>
      <Pillars />

      {/* reflective floor — reflects the hologram + pillars for the premium look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={42}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#070b12"
          metalness={0.7}
        />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        minPolarAngle={0.7}
        maxPolarAngle={1.55}
        autoRotate
        autoRotateSpeed={0.35}
        target={[0, 1.3, 0]}
      />

      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.38} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.3} darkness={0.92} />
        <Noise opacity={0.045} premultiply />
      </EffectComposer>
    </>
  );
}

export default function NvidiaScene() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = () => {
    if (speaking) return;
    const script = ENCOUNTERS.Nvidia;
    const line = script.intro.find((l) => l.who === 'speaker')?.text || '';
    const src = `/audio/${lineAudioId(script.voiceId || '', line)}.mp3`;
    const a = new Audio(src);
    audioRef.current = a;
    a.onended = () => setSpeaking(false);
    a.onerror = () => setSpeaking(false);
    setSpeaking(true);
    a.play().catch(() => setSpeaking(false));
  };

  return (
    <div className="ns-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.6, 5.5], fov: 45 }}>
        <Scene speaking={speaking} />
      </Canvas>

      <div className="ns-ui">
        <div className="ns-top">
          <Link href="/world" className="ns-back">← back to the world</Link>
          <div className="ns-eyebrow">NVIDIA HQ · SANTA CLARA</div>
          <h1 className="ns-name">Jensen Huang</h1>
          <div className="ns-role">Founder &amp; CEO, Nvidia — dramatized from public statements</div>
        </div>
        <div className="ns-bottom">
          <button className={'ns-speak' + (speaking ? ' ns-speaking' : '')} onClick={speak}>
            {speaking ? '◉ speaking…' : '▶ speak with Jensen'}
          </button>
          <div className="ns-hint">drag to look around · scroll to move closer</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ns-stage{position:fixed;inset:0;background:#05060c}
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
