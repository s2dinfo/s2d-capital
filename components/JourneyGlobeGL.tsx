'use client';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color, DirectionalLight } from 'three';
import * as topojson from 'topojson-client';

export interface JourneyStop {
  place: string;
  location: [number, number]; // [lat, lng]
  active?: boolean;
  index?: number; // chapter index for click navigation
}

export interface JourneyArc {
  from: [number, number];
  to: [number, number];
}

export interface JourneyChokepointMarker {
  label: string;
  location: [number, number];
}

const GOLD_LIGHT = '#D4B85C';
const RED = '#E07070';

const labelKey = (l: any) => `${l.lat},${l.lng}`;

// A choropleth layer: paint + extrude each country by a numeric value
// (country name -> value), interpolated across [min, max].
export interface GlobeDataLayer {
  values: Record<string, number>;
  min: number;
  max: number;
}

// A located, severity-coloured marker (e.g. an active conflict). intensity
// (0..1) scales how big/urgent the pulse reads.
export interface GlobeHotspot {
  label: string;
  location: [number, number];
  color: string;
  intensity?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
// mix a hex toward white (amt 0..1) — keeps a lens accent bright enough to read
function mix(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const m = (c: number) => Math.round(c + (255 - c) * amt);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}
function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Light the globe from the real sun: a warm directional light placed at the
// current subsolar point (where the sun is overhead now) gives a live
// day/night terminator across the navy sphere. The globe spins through it.
function applyDayNight(g: any) {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10)); // solar declination °
    const subLng = -15 * (now.getUTCHours() + now.getUTCMinutes() / 60 - 12); // sun overhead at local noon
    const c = g.getCoords(decl, subLng, 3);
    const scene = g.scene();
    let placed = false;
    // gentle terminator: high ambient keeps the whole globe readable (it's a
    // hero, never a dark ball), the directional sun just warms the day side
    scene.traverse((o: any) => {
      if (o.isDirectionalLight) { o.position.set(c.x, c.y, c.z); o.intensity = 0.85; o.color = new Color('#ffe9c2'); placed = true; }
      else if (o.isAmbientLight) { o.intensity = 0.95; o.color = new Color('#6076a0'); }
    });
    if (!placed) {
      const sun = new DirectionalLight(0xffe9c2, 0.85);
      sun.position.set(c.x, c.y, c.z);
      scene.add(sun);
    }
  } catch { /* lighting is non-critical */ }
}

// cool navy-blue (cheap) -> brand gold -> warm red (expensive)
const HEAT_STOPS = [
  [30, 58, 95],
  [201, 162, 39],
  [224, 83, 58],
];
function heatColor(t: number, alpha = 0.82) {
  const x = Math.max(0, Math.min(1, t)) * (HEAT_STOPS.length - 1);
  const i = Math.min(HEAT_STOPS.length - 2, Math.floor(x));
  const f = x - i;
  const [ar, ag, ab] = HEAT_STOPS[i];
  const [br, bg, bb] = HEAT_STOPS[i + 1];
  const r = Math.round(ar + (br - ar) * f);
  const g = Math.round(ag + (bg - ag) * f);
  const b = Math.round(ab + (bb - ab) * f);
  return `rgba(${r},${g},${b},${alpha})`;
}

function JourneyGlobeGL({
  stops,
  arcs,
  chokepoints = [],
  hotspots = [],
  focus,
  activeCountry,
  dataLayer = null,
  arcEnergy = 0.5,
  accent = GOLD_LIGHT,
  arcStyle = 'comet',
  zoomedOut = false,
  onStopClick,
}: {
  stops: JourneyStop[];
  arcs: JourneyArc[];
  chokepoints?: JourneyChokepointMarker[];
  hotspots?: GlobeHotspot[];
  focus: [number, number];
  activeCountry: string | null;
  dataLayer?: GlobeDataLayer | null;
  arcEnergy?: number;
  accent?: string;
  arcStyle?: 'comet' | 'stream';
  zoomedOut?: boolean;
  onStopClick?: (index: number) => void;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  // which country / city the cursor is currently over (one at a time, so the
  // place you leave always clears as the new one lights up)
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  // Country polygons from the bundled Natural Earth topology
  useEffect(() => {
    fetch('/data/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        const geo: any = topojson.feature(topo, topo.objects.countries);
        setCountries(geo.features.filter((f: any) => f.properties.name !== 'Antarctica'));
      })
      .catch(() => {});
  }, []);

  // Track container size (square canvas)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.offsetWidth));
    ro.observe(el);
    setSize(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Fly to the focused stop
  useEffect(() => {
    if (!ready || !globeRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    globeRef.current.pointOfView(
      { lat: focus[0], lng: focus[1], altitude: zoomedOut ? 3.6 : 1.8 },
      reduced ? 0 : 1400
    );
  }, [focus, zoomedOut, ready]);

  const activeStop = stops.find((s) => s.active);
  const litCountry = hoverCountry ?? activeCountry;
  const accentBright = mix(accent, 0.5); // readable lens accent for active label / arc core

  // normalized [0,1] position of a country's value within the data layer, or
  // null if this country has no datum (or there's no layer at all)
  const layerT = (name: string): number | null => {
    if (!dataLayer) return null;
    const v = dataLayer.values[name];
    if (v == null) return null;
    return Math.max(0, Math.min(1, (v - dataLayer.min) / (dataLayer.max - dataLayer.min)));
  };

  // gold ring on the active stop + red rings on chokepoints + severity-
  // coloured rings on hotspots (pulse radius scales with intensity)
  const ringsData = useMemo(() => {
    const rings: any[] = [];
    if (activeStop) rings.push({ lat: activeStop.location[0], lng: activeStop.location[1], danger: false });
    for (const c of chokepoints) rings.push({ lat: c.location[0], lng: c.location[1], danger: true });
    for (const h of hotspots) rings.push({ lat: h.location[0], lng: h.location[1], hot: true, rgb: hexToRgb(h.color), intensity: h.intensity ?? 0.6 });
    return rings;
  }, [activeStop, chokepoints, hotspots]);

  // stop labels + red chokepoint labels + coloured hotspot labels
  const labelsData = useMemo(() => {
    return [
      ...stops.map((s) => ({ lat: s.location[0], lng: s.location[1], text: s.place, active: !!s.active, danger: false, index: s.index })),
      ...chokepoints.map((c) => ({ lat: c.location[0], lng: c.location[1], text: '⚠ ' + c.label, active: false, danger: true, index: null })),
      ...hotspots.map((h) => ({ lat: h.location[0], lng: h.location[1], text: h.label, active: false, danger: false, hot: true, color: h.color, index: null })),
    ];
  }, [stops, chokepoints, hotspots]);

  // brand-navy sphere instead of the default texture
  const globeMaterial = useMemo(
    () => new MeshPhongMaterial({ color: new Color('#0E1626'), emissive: new Color('#050A14'), shininess: 6 }),
    []
  );

  return (
    <div ref={containerRef} style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
      {size > 0 && (
        <Globe
          ref={globeRef}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor="#42528a"
          atmosphereAltitude={0.16}
          polygonsData={countries}
          polygonCapColor={(f: any) => {
            const name = f.properties.name;
            if (name === litCountry) return 'rgba(212,184,92,0.32)';
            const t = layerT(name);
            if (t != null) return heatColor(t);
            return dataLayer ? 'rgba(26,36,64,0.5)' : 'rgba(26,36,64,0.65)';
          }}
          polygonSideColor={() => (dataLayer ? 'rgba(212,184,92,0.10)' : 'rgba(0,0,0,0)')}
          polygonStrokeColor={(f: any) => {
            const name = f.properties.name;
            if (name === litCountry) return 'rgba(232,204,116,0.95)';
            return layerT(name) != null ? 'rgba(232,204,116,0.45)' : 'rgba(110,130,180,0.30)';
          }}
          polygonAltitude={(f: any) => {
            const name = f.properties.name;
            const t = layerT(name);
            if (t != null) return 0.012 + t * 0.10 + (name === litCountry ? 0.02 : 0);
            return name === litCountry ? 0.012 : 0.005;
          }}
          polygonsTransitionDuration={300}
          onPolygonHover={(f: any) => setHoverCountry(f ? f.properties.name : null)}
          arcsData={arcs}
          arcStartLat={(a: any) => a.from[0]}
          arcStartLng={(a: any) => a.from[1]}
          arcEndLat={(a: any) => a.to[0]}
          arcEndLng={(a: any) => a.to[1]}
          arcColor={() => {
            const tail = rgba(accent, 0.3 + arcEnergy * 0.25);
            return [tail, accentBright, tail];
          }}
          arcStroke={arcStyle === 'stream' ? 0.5 : 0.55 + arcEnergy * 0.5}
          arcDashLength={arcStyle === 'stream' ? 0.04 : 0.35}
          arcDashGap={arcStyle === 'stream' ? 0.055 : 0.9}
          arcDashAnimateTime={arcStyle === 'stream' ? 1500 : Math.round(3200 - arcEnergy * 2000)}
          ringsData={ringsData}
          ringLat={(r: any) => r.lat}
          ringLng={(r: any) => r.lng}
          ringMaxRadius={(r: any) => (r.hot ? 1.8 + (r.intensity ?? 0.6) * 3.2 : r.danger ? 2.4 : 3.2)}
          ringPropagationSpeed={(r: any) => (r.hot ? 1.4 + (r.intensity ?? 0.6) * 1.4 : 1.6)}
          ringRepeatPeriod={(r: any) => (r.hot ? 1100 - (r.intensity ?? 0.6) * 500 : 900)}
          ringColor={(r: any) => (t: number) => {
            if (r.hot) { const [R, G, B] = r.rgb; return `rgba(${R},${G},${B},${Math.max(0, 0.8 * (1 - t))})`; }
            if (r.danger) return `rgba(224,112,112,${Math.max(0, 0.7 * (1 - t))})`;
            return rgba(accent, Math.max(0, 0.85 * (1 - t)));
          }}
          labelsData={labelsData}
          labelLat={(l: any) => l.lat}
          labelLng={(l: any) => l.lng}
          labelText={(l: any) => l.text}
          labelSize={(l: any) => (l.active ? 1.6 : l.danger ? 1.05 : l.hot ? 1.1 : 1.25) + (labelKey(l) === hoverLabel ? 0.35 : 0)}
          labelDotRadius={(l: any) => (l.active ? 0.6 : l.hot ? 0.48 : l.danger ? 0.3 : 0.4)}
          labelColor={(l: any) =>
            labelKey(l) === hoverLabel ? GOLD_LIGHT : l.active ? accentBright : l.color ? l.color : l.danger ? RED : 'rgba(255,255,255,0.92)'
          }
          labelAltitude={0.012}
          labelResolution={2}
          onLabelClick={(l: any) => {
            if (l.index != null && onStopClick) onStopClick(l.index);
          }}
          onLabelHover={(l: any) => {
            setHoverLabel(l ? labelKey(l) : null);
            const el = containerRef.current?.querySelector('canvas');
            if (el) (el as HTMLCanvasElement).style.cursor = l && l.index != null ? 'pointer' : 'grab';
          }}
          rendererConfig={{ antialias: true, alpha: true }}
          onGlobeReady={() => {
            const g = globeRef.current;
            if (!g) return;
            const controls = g.controls();
            controls.enableZoom = false; // never hijack page scroll
            controls.enablePan = false;
            // the world keeps turning, slowly (unless the user prefers not)
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            controls.autoRotate = !reduced;
            controls.autoRotateSpeed = 0.35;
            applyDayNight(g);
            g.pointOfView({ lat: focus[0], lng: focus[1], altitude: zoomedOut ? 3.6 : 1.8 }, 0);
            setReady(true);
          }}
        />
      )}
    </div>
  );
}

// memo so a parent re-render with unchanged props (e.g. the 60s market-data
// refresh) can't reset the arc / label layers. The globe only re-renders when
// stops / arcs / focus actually change, or on its own internal hover state.
export default memo(JourneyGlobeGL);
