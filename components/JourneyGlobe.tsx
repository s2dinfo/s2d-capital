'use client';
import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// Convert lat/lng to cobe phi/theta so the location faces the camera
function locationToAngles(lat: number, lng: number): [number, number] {
  return [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
}

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  size?: number;
}

export interface GlobeArc {
  from: [number, number];
  to: [number, number];
}

const GOLD: [number, number, number] = [0.83, 0.72, 0.36];

export default function JourneyGlobe({
  markers,
  arcs = [],
  focus,
}: {
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  focus: [number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef<[number, number]>(locationToAngles(focus[0], focus[1]));

  useEffect(() => {
    focusRef.current = locationToAngles(focus[0], focus[1]);
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.offsetWidth || 600;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let [phi, theta] = focusRef.current;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi,
      theta,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 18000,
      mapBrightness: 2.2,
      baseColor: [0.22, 0.26, 0.38],
      markerColor: [0.95, 0.8, 0.4],
      glowColor: [0.06, 0.08, 0.16],
      opacity: 0.85,
      markers: markers.map((m) => ({ location: m.location, size: m.size ?? 0.05 })),
      arcs: arcs.map((a) => ({ from: a.from, to: a.to, color: GOLD })),
      arcWidth: 0.4,
      arcHeight: 0.45,
    });

    // Ease the camera toward the focused stop along the shortest path
    let raf = 0;
    const loop = () => {
      const [fPhi, fTheta] = focusRef.current;
      if (reduced) {
        phi = fPhi;
        theta = fTheta;
      } else {
        const dPhi = ((fPhi - phi + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        phi += dPhi * 0.06;
        theta += (fTheta - theta) * 0.06;
      }
      globe.update({ phi, theta });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
    };
    // markers/arcs are static per journey; rebuild only if they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), JSON.stringify(arcs)]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', aspectRatio: '1', display: 'block', contain: 'layout paint size' }}
      aria-label="Interactive globe showing supply chain stops"
    />
  );
}
