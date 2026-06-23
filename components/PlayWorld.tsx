'use client';
// Third-person play: walk the rigged character OR drive the generated car. Press F near the car
// to get in, F again to get out. On foot = WASD + mouse-orbit follow cam, walk/run animation.
// Driving = arcade car physics (WASD) with an auto-chase cam. Both ground-follow the terrain.
import * as THREE from 'three';
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

const clamp = THREE.MathUtils.clamp;
const lerpAngle = (a: number, b: number, t: number) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
const inPlace = (clip: THREE.AnimationClip) => { const c = clip.clone(); c.tracks = c.tracks.filter((t) => !t.name.endsWith('.position')); return c; };
const CAR_YAW = Math.PI; // orientation offset so the model's front matches travel direction

// push a position out of any solid obstacle circle it has entered (slide-along collision)
function pushOut(pos: THREE.Vector3, colliders?: { x: number; z: number; r: number }[]) {
  if (!colliders) return false;
  let hit = false;
  for (const c of colliders) {
    const dx = pos.x - c.x, dz = pos.z - c.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < c.r * c.r && d2 > 1e-6) { const d = Math.sqrt(d2), push = c.r - d; pos.x += (dx / d) * push; pos.z += (dz / d) * push; hit = true; }
  }
  return hit;
}

export default function PlayWorld({ sampleRef, pausedRef, posRef, setDrivingUI, colliders, blockedRef, spawn = [0, 0, 8], carSpawn = [3.5, 0, 6], bound = 33 }: {
  sampleRef: { current: ((x: number, z: number) => number) | null };
  pausedRef?: { current: boolean };
  posRef?: { current: THREE.Vector3 };
  setDrivingUI?: (b: boolean) => void;
  colliders?: { x: number; z: number; r: number }[];
  blockedRef?: { current: ((x: number, z: number) => boolean) | null };   // grid collision (city)
  spawn?: [number, number, number];
  carSpawn?: [number, number, number];
  bound?: number;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const charRoot = useRef<THREE.Group>(null);
  const carRoot = useRef<THREE.Group>(null);
  const idleGltf = useGLTF('/models/character-idle.glb');
  const walkGltf = useGLTF('/models/character-walk.glb');
  const runGltf = useGLTF('/models/character-run.glb');
  const carGltf = useGLTF('/models/car.glb');
  const clips = useMemo(() => {
    const i = idleGltf.animations.map((c) => { const x = inPlace(c); x.name = 'idle'; return x; });
    const w = walkGltf.animations.map((c) => { const x = inPlace(c); x.name = 'walk'; return x; });
    const r = runGltf.animations.map((c) => { const x = inPlace(c); x.name = 'run'; return x; });
    return [...i, ...w, ...r];
  }, [idleGltf, walkGltf, runGltf]);
  const { actions } = useAnimations(clips, charRoot);

  const carObj = useMemo(() => {
    // car was generated origin-at-bottom + centered, so just scale (bbox recenter on a stale
    // matrix was sinking it out of view)
    const s = carGltf.scene.clone(true);
    s.scale.setScalar(2.4);
    return s;
  }, [carGltf]);

  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0), pitch = useRef(0.42), facing = useRef(Math.PI);
  const drivingRef = useRef(false);
  const [, force] = useState(0);
  const avatar = useMemo(() => new THREE.Vector3(), []);   // stable instances (set in the mount effect)
  const carPark = useMemo(() => new THREE.Vector3(), []);
  const carHeading = useRef(0), carSpeed = useRef(0);
  const tmp = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), move: new THREE.Vector3(), desired: new THREE.Vector3() }), []);

  const toggleDrive = () => {
    if (pausedRef?.current) return;
    if (drivingRef.current) {                 // exit: park the car here, step the character out beside it
      carPark.copy(avatar); carSpeed.current = 0;
      avatar.x += Math.cos(carHeading.current) * 1.8; avatar.z += -Math.sin(carHeading.current) * 1.8;
      facing.current = carHeading.current;
      drivingRef.current = false;
    } else {                                  // enter if close to the car
      const dx = avatar.x - carPark.x, dz = avatar.z - carPark.z;
      if (dx * dx + dz * dz < 20) { avatar.copy(carPark); carSpeed.current = 0; drivingRef.current = true; }
      else return;
    }
    setDrivingUI?.(drivingRef.current); force((n) => n + 1);
  };

  useEffect(() => {
    const dom = gl.domElement;
    const g = sampleRef.current ? Math.max(sampleRef.current(spawn[0], spawn[2]), 0) : 0; avatar.set(spawn[0], g, spawn[2]);
    facing.current = Math.atan2(-spawn[0], -spawn[2]);   // face the world centre (down the avenue in the city)
    yaw.current = facing.current + Math.PI;              // camera behind the character
    const cg = sampleRef.current ? Math.max(sampleRef.current(carSpawn[0], carSpawn[2]), 0) : 0; carPark.set(carSpawn[0], cg, carSpawn[2]);
    const onClick = () => { if (document.pointerLockElement !== dom) dom.requestPointerLock?.(); };
    const onMove = (e: MouseEvent) => { if (document.pointerLockElement === dom) { yaw.current -= e.movementX * 0.0026; pitch.current = clamp(pitch.current + e.movementY * 0.0026, 0.08, 1.15); } };
    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true; if (e.code === 'KeyF') toggleDrive(); };
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    dom.addEventListener('click', onClick); document.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp);
    return () => { dom.removeEventListener('click', onClick); document.removeEventListener('mousemove', onMove); window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); keys.current = {}; if (document.pointerLockElement === dom) document.exitPointerLock?.(); };
  }, [gl, sampleRef]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { ['idle', 'walk', 'run'].forEach((n) => actions[n]?.play()); if (actions['idle']) actions['idle'].weight = 1; if (actions['walk']) actions['walk'].weight = 0; if (actions['run']) actions['run'].weight = 0; }, [actions]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (posRef) posRef.current.copy(avatar);
    if (pausedRef?.current) return;
    const k = keys.current;

    if (drivingRef.current) {
      const accel = (k['KeyW'] || k['ArrowUp']) ? 16 : (k['KeyS'] || k['ArrowDown']) ? -11 : 0;
      carSpeed.current = clamp((carSpeed.current + accel * dt) * 0.985, -8, 22);
      if (Math.abs(carSpeed.current) < 0.05) carSpeed.current = 0;
      const steer = ((k['KeyA'] || k['ArrowLeft']) ? 1 : 0) - ((k['KeyD'] || k['ArrowRight']) ? 1 : 0);
      carHeading.current += steer * dt * 1.7 * Math.sign(carSpeed.current) * Math.min(1, Math.abs(carSpeed.current) / 5);
      const ox = avatar.x, oz = avatar.z;
      avatar.x += Math.sin(carHeading.current) * carSpeed.current * dt;
      avatar.z += Math.cos(carHeading.current) * carSpeed.current * dt;
      avatar.x = clamp(avatar.x, -bound, bound); avatar.z = clamp(avatar.z, -bound, bound);
      let hit = pushOut(avatar, colliders);
      if (blockedRef?.current) { if (blockedRef.current(avatar.x, oz)) { avatar.x = ox; hit = true; } if (blockedRef.current(avatar.x, avatar.z)) { avatar.z = oz; hit = true; } }
      if (hit) carSpeed.current *= 0.4; // bumped a building → slow down
      const g = sampleRef.current ? Math.max(sampleRef.current(avatar.x, avatar.z), -0.05) : 0;
      avatar.y += (g - avatar.y) * Math.min(1, dt * 10);
      // auto chase-cam behind the car
      tmp.desired.set(avatar.x - Math.sin(carHeading.current) * 6.5, avatar.y + 3.2, avatar.z - Math.cos(carHeading.current) * 6.5);
      camera.position.lerp(tmp.desired, Math.min(1, dt * 4));
      const cg = sampleRef.current ? sampleRef.current(camera.position.x, camera.position.z) : 0;
      if (camera.position.y < cg + 0.7) camera.position.y = cg + 0.7;
      camera.lookAt(avatar.x, avatar.y + 0.7, avatar.z);
    } else {
      const running = !!(k['ShiftLeft'] || k['ShiftRight']);
      const sp = running ? 9 : 4.6;
      tmp.fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      tmp.right.set(-tmp.fwd.z, 0, tmp.fwd.x);   // forward × up (D = screen-right)
      tmp.move.set(0, 0, 0);
      if (k['KeyW'] || k['ArrowUp']) tmp.move.add(tmp.fwd);
      if (k['KeyS'] || k['ArrowDown']) tmp.move.sub(tmp.fwd);
      if (k['KeyD'] || k['ArrowRight']) tmp.move.add(tmp.right);
      if (k['KeyA'] || k['ArrowLeft']) tmp.move.sub(tmp.right);
      const moving = tmp.move.lengthSq() > 0;
      if (moving) {
        const ox = avatar.x, oz = avatar.z;
        tmp.move.normalize(); avatar.addScaledVector(tmp.move, sp * dt);
        avatar.x = clamp(avatar.x, -bound, bound); avatar.z = clamp(avatar.z, -bound, bound);
        pushOut(avatar, colliders);
        if (blockedRef?.current) { if (blockedRef.current(avatar.x, oz)) avatar.x = ox; if (blockedRef.current(avatar.x, avatar.z)) avatar.z = oz; }
        facing.current = lerpAngle(facing.current, Math.atan2(tmp.move.x, tmp.move.z), 0.18);
      }
      const g = sampleRef.current ? Math.max(sampleRef.current(avatar.x, avatar.z), -0.05) : 0;
      avatar.y += (g - avatar.y) * Math.min(1, dt * 12);
      const state = !moving ? 'idle' : running ? 'run' : 'walk';   // crossfade idle/walk/run
      (['idle', 'walk', 'run'] as const).forEach((nm) => {
        const a = actions[nm]; if (!a) return;
        if (!a.isRunning()) a.play();
        a.paused = false;
        a.weight += ((nm === state ? 1 : 0) - a.weight) * 0.18;
      });
      const D = 5.2, cp = Math.cos(pitch.current), spn = Math.sin(pitch.current);
      tmp.desired.set(avatar.x + Math.sin(yaw.current) * cp * D, avatar.y + 1.5 + spn * D, avatar.z + Math.cos(yaw.current) * cp * D);
      camera.position.lerp(tmp.desired, Math.min(1, dt * 10));
      const cg = sampleRef.current ? sampleRef.current(camera.position.x, camera.position.z) : 0;
      if (camera.position.y < cg + 0.6) camera.position.y = cg + 0.6;
      camera.lookAt(avatar.x, avatar.y + 1.3, avatar.z);
    }

    if (charRoot.current) { charRoot.current.position.copy(avatar); charRoot.current.rotation.y = facing.current; charRoot.current.visible = !drivingRef.current; }
    if (carRoot.current) {
      if (drivingRef.current) carRoot.current.position.copy(avatar); else carRoot.current.position.copy(carPark);
      carRoot.current.rotation.y = carHeading.current + CAR_YAW;
    }
  });

  return (
    <>
      <group ref={charRoot}><primitive object={walkGltf.scene} /></group>
      <group ref={carRoot}><primitive object={carObj} /></group>
    </>
  );
}
useGLTF.preload('/models/character-idle.glb');
useGLTF.preload('/models/character-walk.glb');
useGLTF.preload('/models/character-run.glb');
useGLTF.preload('/models/car.glb');
