import { AuroraShader } from 's2d-capital-insights';

// AuroraShader is a full-bleed WebGL canvas (position:absolute, inset:0) that
// renders a flowing navy/gold aurora behind the hero. It's designed to sit over
// a navy backdrop and degrade gracefully to that backdrop where WebGL is
// unavailable — so the preview composes it exactly that way: real hero copy on
// the navy gradient the component is built to overlay.
export function Hero() {
  return (
    <div
      style={{
        position: 'relative',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'radial-gradient(120% 120% at 50% 38%, #20254a 0%, #1A1A2E 48%, #0e1020 100%)',
      }}
    >
      <AuroraShader />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)", fontSize: '1.7rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
          S2D Capital Insights
        </div>
        <div style={{ fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", fontSize: '0.82rem', color: 'rgba(255,255,255,0.62)', marginTop: 10, maxWidth: 320 }}>
          Financial intelligence across crypto, macro, commodities, FX &amp; geopolitics
        </div>
      </div>
    </div>
  );
}
