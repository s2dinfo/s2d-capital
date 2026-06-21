'use client';
// ── The Nvidia encounter as a real 3D space with a RECOGNIZABLE figure. ──
// Environment: stylized stage + reflective floor + emissive structure + atmosphere.
// Character: a Grok-generated stylized Jensen presented as a holographic projection
// (hand-written GLSL: black-key, scanlines, scan bar) that reacts LIVE to his real
// ElevenLabs voice (a Web Audio analyser drives the glow/pulse) and faces the viewer.
import * as THREE from 'three';
import { useRef, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Sparkles, Billboard, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ENCOUNTERS, lineAudioId } from '@/lib/encounters';

const VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG = `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uSpeaking;
  uniform float uAmp;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    uv.x += sin(uv.y * 150.0 + uTime * 9.0) * 0.0013 * (0.4 + uAmp);   // hologram jitter
    vec4 tex = texture2D(uMap, uv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 holo = mix(vec3(0.12, 0.95, 0.55), vec3(0.7, 1.0, 0.85), lum);
    vec3 col = mix(tex.rgb * 1.12, holo, 0.4);
    col *= 0.84 + 0.16 * sin(uv.y * 900.0 - uTime * 7.0);              // scanlines
    float bar = abs(fract(uv.y - uTime * 0.10) - 0.5);                 // travelling scan bar
    col += smoothstep(0.5, 0.46, bar) * vec3(0.12, 0.4, 0.26);
    col *= 1.0 + 0.32 * uAmp * sin(uTime * 22.0) + 0.10 * uSpeaking;   // live voice pulse
    float keyed = smoothstep(0.02, 0.17, lum);                        // drop the black bg
    vec2 e = smoothstep(0.0, 0.07, vUv) * smoothstep(0.0, 0.07, 1.0 - vUv);
    float alpha = keyed * e.x * e.y * (0.88 + 0.12 * uSpeaking);
    gl_FragColor = vec4(col, alpha);
  }
`;

function HoloFigure({ mouthRef, speaking }: { mouthRef: React.MutableRefObject<number>; speaking: boolean }) {
  const tex = useTexture('/characters/jensen-figure.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const billRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uMap: { value: tex }, uTime: { value: 0 }, uSpeaking: { value: 0 }, uAmp: { value: 0 } }),
    [tex],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = t;
      u.uSpeaking.value += ((speaking ? 1 : 0) - u.uSpeaking.value) * 0.08;
      u.uAmp.value += (mouthRef.current - u.uAmp.value) * 0.4;
    }
    if (billRef.current) billRef.current.position.y = 1.82 + Math.sin(t * 1.1) * 0.03;
  });
  return (
    <Billboard ref={billRef} position={[0, 1.82, 0]}>
      <mesh>
        <planeGeometry args={[2.35, 3.13]} />
        <shaderMaterial ref={matRef} transparent depthWrite={false} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
      </mesh>
      {/* projection base glow */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 48]} />
        <meshBasicMaterial color="#1affa0" transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function Stage() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#0a1118" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.7, 64]} />
        <meshBasicMaterial color="#1affa0" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {[-6, -4.4, -2.8, 2.8, 4.4, 6].map((x, i) => (
        <mesh key={i} position={[x, 3.2, -6.5]}>
          <boxGeometry args={[0.1, 6.4, 0.1]} />
          <meshStandardMaterial color="#08120c" emissive="#1affa0" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 3, -7]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#060a10" metalness={0.3} roughness={0.9} />
      </mesh>
      {[-2.2, 0, 2.2].map((x, i) => (
        <mesh key={`o${i}`} position={[x, 6.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.08, 4, 0.08]} />
          <meshStandardMaterial color="#08120c" emissive="#39e0ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ mouthRef, speaking }: { mouthRef: React.MutableRefObject<number>; speaking: boolean }) {
  return (
    <>
      <color attach="background" args={['#04060b']} />
      <fog attach="fog" args={['#04060b', 8, 26]} />

      <hemisphereLight args={['#2a3340', '#000', 0.5]} />
      <ambientLight intensity={0.18} />
      <spotLight position={[2.5, 7, 5]} angle={0.55} penumbra={0.9} intensity={400} color="#eaf6ff" distance={40} />
      <spotLight position={[-4, 4, -2]} angle={0.7} penumbra={1} intensity={120} color="#1affa0" distance={28} />
      <pointLight position={[3.5, 2, 3]} intensity={26} color="#39e0ff" distance={22} />

      <Suspense fallback={null}>
        <HoloFigure mouthRef={mouthRef} speaking={speaking} />
      </Suspense>
      <Stage />
      <Sparkles count={70} scale={[14, 7, 10]} position={[0, 3.5, -1]} size={2.2} speed={0.25} color="#1affa0" opacity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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
        target={[0, 1.65, 0]}
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
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.7, 5.4], fov: 44 }}>
        <Scene mouthRef={mouthRef} speaking={speaking} />
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
