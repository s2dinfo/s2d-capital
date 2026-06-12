'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color } from 'three';
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

export default function JourneyGlobeGL({
  stops,
  arcs,
  chokepoints = [],
  focus,
  activeCountry,
  zoomedOut = false,
  onStopClick,
}: {
  stops: JourneyStop[];
  arcs: JourneyArc[];
  chokepoints?: JourneyChokepointMarker[];
  focus: [number, number];
  activeCountry: string | null;
  zoomedOut?: boolean;
  onStopClick?: (index: number) => void;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

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

  // gold ring on the active stop + red rings on active chokepoints
  const ringsData = useMemo(() => {
    const rings: any[] = [];
    if (activeStop) rings.push({ lat: activeStop.location[0], lng: activeStop.location[1], danger: false });
    for (const c of chokepoints) rings.push({ lat: c.location[0], lng: c.location[1], danger: true });
    return rings;
  }, [activeStop, chokepoints]);

  // stop labels + red chokepoint labels
  const labelsData = useMemo(() => {
    return [
      ...stops.map((s) => ({ lat: s.location[0], lng: s.location[1], text: s.place, active: !!s.active, danger: false, index: s.index })),
      ...chokepoints.map((c) => ({ lat: c.location[0], lng: c.location[1], text: '⚠ ' + c.label, active: false, danger: true, index: null })),
    ];
  }, [stops, chokepoints]);

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
          polygonCapColor={(f: any) =>
            f.properties.name === activeCountry ? 'rgba(212,184,92,0.16)' : 'rgba(26,36,64,0.65)'
          }
          polygonSideColor={() => 'rgba(0,0,0,0)'}
          polygonStrokeColor={(f: any) =>
            f.properties.name === activeCountry ? 'rgba(232,204,116,0.95)' : 'rgba(110,130,180,0.30)'
          }
          polygonAltitude={(f: any) => (f.properties.name === activeCountry ? 0.012 : 0.005)}
          polygonsTransitionDuration={600}
          arcsData={arcs}
          arcStartLat={(a: any) => a.from[0]}
          arcStartLng={(a: any) => a.from[1]}
          arcEndLat={(a: any) => a.to[0]}
          arcEndLng={(a: any) => a.to[1]}
          arcColor={() => ['rgba(212,184,92,0.25)', '#E8CC74', 'rgba(212,184,92,0.25)']}
          arcStroke={0.45}
          arcDashLength={0.35}
          arcDashGap={1.3}
          arcDashAnimateTime={3200}
          ringsData={ringsData}
          ringLat={(r: any) => r.lat}
          ringLng={(r: any) => r.lng}
          ringMaxRadius={(r: any) => (r.danger ? 2.4 : 3.2)}
          ringPropagationSpeed={1.6}
          ringRepeatPeriod={900}
          ringColor={(r: any) => (t: number) =>
            r.danger
              ? `rgba(224,112,112,${Math.max(0, 0.7 * (1 - t))})`
              : `rgba(212,184,92,${Math.max(0, 0.8 * (1 - t))})`}
          labelsData={labelsData}
          labelLat={(l: any) => l.lat}
          labelLng={(l: any) => l.lng}
          labelText={(l: any) => l.text}
          labelSize={(l: any) => (l.active ? 1.35 : l.danger ? 0.85 : 0.95)}
          labelDotRadius={(l: any) => (l.active ? 0.55 : l.danger ? 0.28 : 0.35)}
          labelColor={(l: any) => (l.active ? GOLD_LIGHT : l.danger ? RED : 'rgba(255,255,255,0.6)')}
          labelAltitude={0.012}
          labelResolution={2}
          onLabelClick={(l: any) => {
            if (l.index != null && onStopClick) onStopClick(l.index);
          }}
          onLabelHover={(l: any) => {
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
            controls.autoRotate = false;
            g.pointOfView({ lat: focus[0], lng: focus[1], altitude: zoomedOut ? 3.6 : 1.8 }, 0);
            setReady(true);
          }}
        />
      )}
    </div>
  );
}
