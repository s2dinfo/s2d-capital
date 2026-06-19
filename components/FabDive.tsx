'use client';
import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { AnimatePresence } from 'framer-motion';
import Encounter from '@/components/Encounter';
import { ENCOUNTERS } from '@/lib/encounters';

// ── The chip world on the REAL Earth (Cesium). Branded pins, glowing supply
// connections, a 3D fab over Taiwan, free fly/zoom — and clicking a node flies
// you there and opens its encounter (the same engine as /world). Token-free
// Esri imagery. Isolated on /dive. ──

const GOLD = '#D4B85C';
const RED = '#E07070';

type Geo = { place: string; lng: number; lat: number; danger?: boolean; fab?: boolean };
const GEO: Geo[] = [
  { place: 'ASML', lng: 5.47, lat: 51.42 },
  { place: 'TSMC', lng: 120.9685, lat: 24.774, fab: true },
  { place: 'Nvidia', lng: -121.95, lat: 37.35 },
  { place: 'Taiwan Strait', lng: 119.6, lat: 24.4, danger: true },
];
const LINKS: [string, string][] = [['ASML', 'TSMC'], ['TSMC', 'Nvidia']];
const find = (p: string) => GEO.find((g) => g.place === p)!;

export default function FabDive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [ready, setReady] = useState(false);
  const [encounterNode, setEncounterNode] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});

  // Fly to a node, then open its encounter on arrival (the "dive → story" beat).
  const travel = (place: string) => {
    const n = find(place);
    const v = viewerRef.current;
    if (!n || !v) return;
    const low = place === 'TSMC';
    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(n.lng, n.lat - 0.04, low ? 2600 : 12000),
      orientation: { heading: Cesium.Math.toRadians(15), pitch: Cesium.Math.toRadians(low ? -36 : -50), roll: 0 },
      duration: 3.6,
      complete: () => { if (ENCOUNTERS[place]) setEncounterNode(place); },
    });
  };

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;
    (window as any).CESIUM_BASE_URL = '/cesium';
    Cesium.Ion.defaultAccessToken = '';

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: false as any,
      baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
      navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
      infoBox: false, selectionIndicator: false,
      creditContainer: document.createElement('div'),
    });
    viewerRef.current = viewer;

    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 19,
        credit: 'Imagery © Esri',
      })
    );

    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0d1a');
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0e1626');
    viewer.scene.skyAtmosphere.show = true;

    // ── Nodes: pin + label ──
    for (const n of GEO) {
      const col = n.danger ? RED : GOLD;
      viewer.entities.add({
        id: 'node:' + n.place,
        position: Cesium.Cartesian3.fromDegrees(n.lng, n.lat),
        point: { pixelSize: n.danger ? 10 : 12, color: Cesium.Color.fromCssColorString(col), outlineColor: Cesium.Color.WHITE, outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY },
        label: {
          text: (n.danger ? '⚠ ' : '') + n.place + (ENCOUNTERS[n.place] ? '  ▶' : ''),
          font: '600 13px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(14,18,32,0.85)'),
          pixelOffset: new Cesium.Cartesian2(0, -20),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }

    // ── Connection arcs (glowing geodesic routes) ──
    for (const [a, b] of LINKS) {
      const p = find(a), q = find(b);
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([p.lng, p.lat, q.lng, q.lat]),
          width: 3,
          arcType: Cesium.ArcType.GEODESIC,
          material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.22, color: Cesium.Color.fromCssColorString(GOLD).withAlpha(0.9) }),
        },
      });
    }

    // ── A stylised 3D fab over Taiwan (visible when you zoom in) ──
    const fab = find('TSMC');
    const buildings = [
      { dx: 0, dy: 0, w: 420, l: 280, h: 130 },
      { dx: 0.006, dy: 0.001, w: 300, l: 200, h: 95 },
      { dx: -0.005, dy: 0.003, w: 260, l: 220, h: 80 },
      { dx: 0.002, dy: -0.005, w: 340, l: 180, h: 110 },
    ];
    for (let i = 0; i < buildings.length; i++) {
      const bb = buildings[i];
      viewer.entities.add({
        id: 'fab:TSMC:' + i,
        position: Cesium.Cartesian3.fromDegrees(fab.lng + bb.dx, fab.lat + bb.dy, bb.h / 2),
        box: {
          dimensions: new Cesium.Cartesian3(bb.w, bb.l, bb.h),
          material: Cesium.Color.fromCssColorString('#cdb86a').withAlpha(0.9),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#fff').withAlpha(0.5),
        },
      });
    }

    // ── Click a node / fab → fly there + open its encounter ──
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);
      const id: string | undefined = picked?.id?.id;
      if (!id) return;
      if (id.startsWith('node:')) travel(id.slice(5));
      else if (id.startsWith('fab:')) travel('TSMC');
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Start in orbit over Asia.
    viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(120.0, 22.0, 12_000_000) });
    setReady(true);

    return () => { handler.destroy(); viewer.destroy(); viewerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orbit = () => viewerRef.current?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(120.0, 22.0, 12_000_000), duration: 3 });

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0d1a' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 22, left: 24, zIndex: 5, pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6rem', letterSpacing: '0.3em', color: GOLD, marginBottom: 8 }}>THE CHIP WORLD · LIVE EARTH</div>
        <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 'clamp(1.3rem,2.6vw,2rem)', color: '#fff', lineHeight: 1.1, maxWidth: 380 }}>
          The real places that make the AI era.
        </div>
        <div style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: 8, maxWidth: 340 }}>
          Drag to spin · scroll to zoom · click a gold node to fly in and meet who runs it.
        </div>
      </div>

      {/* Quick-travel pills */}
      <div style={{ position: 'absolute', top: 22, right: 24, zIndex: 5, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60vw' }}>
        {GEO.filter((g) => !g.danger).map((g) => (
          <button key={g.place} onClick={() => travel(g.place)} disabled={!ready} style={pill(!!ENCOUNTERS[g.place])}>
            {g.place}{ENCOUNTERS[g.place] ? ' ▶' : ''}
          </button>
        ))}
      </div>

      {/* Orbit reset */}
      <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        <button onClick={orbit} disabled={!ready} style={pill(false)}>↑&nbsp;&nbsp;BACK TO ORBIT</button>
      </div>

      {/* Encounter overlay — same engine as /world */}
      <AnimatePresence>
        {encounterNode && (
          <Encounter
            key={encounterNode}
            script={ENCOUNTERS[encounterNode]}
            priorChoice={encounterNode === 'TSMC' ? choices['Nvidia'] ?? null : null}
            onClose={() => setEncounterNode(null)}
            onDecision={(c) => setChoices((prev) => ({ ...prev, [encounterNode]: c }))}
            onNext={(next) => travel(next)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function pill(primary: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700,
    padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
    border: primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
    background: primary ? GOLD : 'rgba(14,18,32,0.7)',
    color: primary ? '#1A1A2E' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(8px)',
  };
}
