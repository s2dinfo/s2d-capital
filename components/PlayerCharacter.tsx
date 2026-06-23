'use client';
// Third-person playable character: the rigged Meshy character, steered with WASD relative to
// a mouse-orbit follow camera, animation crossfading walk/run by speed, ground-following.
import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

const lerpAngle = (a: number, b: number, t: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
// drop root-translation tracks so locomotion clips play IN PLACE (we drive position ourselves)
const inPlace = (clip: THREE.AnimationClip) => { const c = clip.clone(); c.tracks = c.tracks.filter((t) => !t.name.endsWith('.position')); return c; };

export default function PlayerCharacter({ sampleRef, pausedRef, spawn = [0, 0, 8], bound = 33 }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  pausedRef?: { current: boolean };
  spawn?: [number, number, number];
  bound?: number;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const root = useRef<THREE.Group>(null);
  const walkGltf = useGLTF('/models/character-walk.glb');
  const runGltf = useGLTF('/models/character-run.glb');
  const clips = useMemo(() => {
    const w = walkGltf.animations.map((c) => { const x = inPlace(c); x.name = 'walk'; return x; });
    const r = runGltf.animations.map((c) => { const x = inPlace(c); x.name = 'run'; return x; });
    return [...w, ...r];
  }, [walkGltf, runGltf]);
  const { actions } = useAnimations(clips, root);

  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0), pitch = useRef(0.42), facing = useRef(Math.PI);
  const pos = useMemo(() => new THREE.Vector3(spawn[0], 0, spawn[2]), [spawn]);
  const tmp = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), move: new THREE.Vector3(), desired: new THREE.Vector3() }), []);

  useEffect(() => {
    const dom = gl.domElement;
    const g = sampleRef.current ? Math.max(sampleRef.current(spawn[0], spawn[2]), 0) : 0;
    pos.set(spawn[0], g, spawn[2]); facing.current = Math.PI;
    const onClick = () => { if (document.pointerLockElement !== dom) dom.requestPointerLock?.(); };
    const onMove = (e: MouseEvent) => { if (document.pointerLockElement === dom) { yaw.current -= e.movementX * 0.0026; pitch.current = Math.max(0.08, Math.min(1.15, pitch.current + e.movementY * 0.0026)); } };
    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    dom.addEventListener('click', onClick); document.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp);
    return () => { dom.removeEventListener('click', onClick); document.removeEventListener('mousemove', onMove); window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); keys.current = {}; if (document.pointerLockElement === dom) document.exitPointerLock?.(); };
  }, [gl, sampleRef, spawn, pos]);

  useEffect(() => { const w = actions['walk'], r = actions['run']; w?.play(); r?.play(); if (w) w.weight = 1; if (r) r.weight = 0; }, [actions]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (pausedRef?.current) return;
    const k = keys.current;
    const running = !!(k['ShiftLeft'] || k['ShiftRight']);
    const sp = running ? 9 : 4.6;
    tmp.fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    tmp.right.set(tmp.fwd.z, 0, -tmp.fwd.x);
    tmp.move.set(0, 0, 0);
    if (k['KeyW'] || k['ArrowUp']) tmp.move.add(tmp.fwd);
    if (k['KeyS'] || k['ArrowDown']) tmp.move.sub(tmp.fwd);
    if (k['KeyD'] || k['ArrowRight']) tmp.move.add(tmp.right);
    if (k['KeyA'] || k['ArrowLeft']) tmp.move.sub(tmp.right);
    const moving = tmp.move.lengthSq() > 0;
    if (moving) {
      tmp.move.normalize();
      pos.addScaledVector(tmp.move, sp * dt);
      pos.x = THREE.MathUtils.clamp(pos.x, -bound, bound); pos.z = THREE.MathUtils.clamp(pos.z, -bound, bound);
      facing.current = lerpAngle(facing.current, Math.atan2(tmp.move.x, tmp.move.z), 0.18);
    }
    const g = sampleRef.current ? Math.max(sampleRef.current(pos.x, pos.z), -0.05) : 0;
    pos.y += (g - pos.y) * Math.min(1, dt * 12);
    if (root.current) { root.current.position.copy(pos); root.current.rotation.y = facing.current; }

    const w = actions['walk'], r = actions['run'];
    if (w && r) {
      w.weight += ((!running ? 1 : 0) - w.weight) * 0.2;   // walk drives idle (frozen) + walking
      r.weight += ((moving && running ? 1 : 0) - r.weight) * 0.2;
      w.paused = !moving;       // freeze the walk pose when standing (avoids the T-pose)
      r.paused = !(moving && running);
    }

    const D = 5.2, cp = Math.cos(pitch.current), spn = Math.sin(pitch.current);
    tmp.desired.set(pos.x + Math.sin(yaw.current) * cp * D, pos.y + 1.5 + spn * D, pos.z + Math.cos(yaw.current) * cp * D);
    camera.position.lerp(tmp.desired, Math.min(1, dt * 10));
    const cg = sampleRef.current ? sampleRef.current(camera.position.x, camera.position.z) : 0;
    if (camera.position.y < cg + 0.6) camera.position.y = cg + 0.6;
    camera.lookAt(pos.x, pos.y + 1.3, pos.z);
  });

  return <group ref={root}><primitive object={walkGltf.scene} /></group>;
}
useGLTF.preload('/models/character-walk.glb');
useGLTF.preload('/models/character-run.glb');
