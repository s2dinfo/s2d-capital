'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface YieldPoint { label: string; value: number }

// billboard text via a canvas texture — always faces the camera, stays legible
function makeLabel(text: string, color: string, sx: number, sy: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.font = 'bold 44px ui-monospace, SFMono-Regular, monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(sx, sy, 1);
  return sprite;
}

// A 3D US Treasury yield curve: today's curve (bright gold) and a prior curve
// (faint), with a translucent ribbon between them so the "twist" reads in 3D.
export default function YieldCurve3D({ current, prior }: { current: YieldPoint[]; prior: YieldPoint[] }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || current.length < 2) return;

    let W = mount.clientWidth || 600;
    let H = mount.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 7.5, 18);
    camera.lookAt(0, 2.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const N = current.length;
    const spanX = 16;
    const X = (i: number) => -spanX / 2 + (i / (N - 1)) * spanX;
    const allV = [...current, ...prior].map((p) => p.value);
    const vMin = Math.min(...allV);
    const vMax = Math.max(...allV);
    const yScale = 6 / Math.max(0.4, vMax - vMin);
    const Y = (v: number) => (v - vMin) * yScale + 0.7;
    const Z_CUR = 1.7;
    const Z_PRI = -1.7;

    const GOLD = 0xd4b85c;
    const GOLD_DIM = 0x8b6914;

    const mkCurve = (pts: YieldPoint[], z: number) =>
      new THREE.CatmullRomCurve3(pts.map((p, i) => new THREE.Vector3(X(i), Y(p.value), z)));

    const tubeCur = new THREE.Mesh(
      new THREE.TubeGeometry(mkCurve(current, Z_CUR), 90, 0.12, 10, false),
      new THREE.MeshBasicMaterial({ color: GOLD })
    );
    const tubePri = new THREE.Mesh(
      new THREE.TubeGeometry(mkCurve(prior, Z_PRI), 90, 0.07, 8, false),
      new THREE.MeshBasicMaterial({ color: GOLD_DIM, transparent: true, opacity: 0.5 })
    );
    group.add(tubeCur, tubePri);

    // translucent ribbon between the two curves
    const verts: number[] = [];
    for (let i = 0; i < N - 1; i++) {
      const x0 = X(i), x1 = X(i + 1);
      const c0 = Y(current[i].value), c1 = Y(current[i + 1].value);
      const p0 = Y(prior[i].value), p1 = Y(prior[i + 1].value);
      verts.push(x0, c0, Z_CUR, x1, c1, Z_CUR, x1, p1, Z_PRI);
      verts.push(x0, c0, Z_CUR, x1, p1, Z_PRI, x0, p0, Z_PRI);
    }
    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const ribbon = new THREE.Mesh(ribbonGeo, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
    group.add(ribbon);

    // faint base lines under each maturity
    const gpts: number[] = [];
    for (let i = 0; i < N; i++) gpts.push(X(i), 0, Z_PRI, X(i), 0, Z_CUR);
    gpts.push(X(0), 0, Z_CUR, X(N - 1), 0, Z_CUR, X(0), 0, Z_PRI, X(N - 1), 0, Z_PRI);
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gpts, 3));
    group.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x2a3a5a, transparent: true, opacity: 0.55 })));

    // nodes + maturity / value labels on the current curve
    current.forEach((p, i) => {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
      node.position.set(X(i), Y(p.value), Z_CUR);
      group.add(node);

      const mat = makeLabel(p.label, '#D4B85C', 3.4, 0.85);
      mat.position.set(X(i), -0.55, Z_CUR);
      group.add(mat);

      const val = makeLabel(p.value.toFixed(2), '#ffffff', 3.0, 0.75);
      val.position.set(X(i), Y(p.value) + 0.95, Z_CUR);
      group.add(val);
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = 0;
    const render = () => {
      t += 0.004;
      group.rotation.y = reduced ? -0.35 : Math.sin(t) * 0.6 - 0.12; // gentle sway keeps maturities readable
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const ro = new ResizeObserver(() => {
      W = mount.clientWidth || W;
      H = mount.clientHeight || H;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      scene.traverse((o: any) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m: any) => { m.map?.dispose?.(); m.dispose?.(); });
      });
    };
  }, [current, prior]);

  return <div ref={mountRef} style={{ width: '100%', height: 360 }} />;
}
