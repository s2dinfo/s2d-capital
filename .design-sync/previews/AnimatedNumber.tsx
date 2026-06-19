import { AnimatedNumber } from 's2d-capital-insights';

// AnimatedNumber renders a bare <span> that counts up to its value. It's meant
// for the dark data panels, so each stat is composed on a dark tile (the bare
// span would be invisible on the white card body). duration={1} so the static
// capture shows the settled value rather than a mid-tween frame.
function Stat({ label, value, color = '#ffffff' }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        background: '#1A1A2E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8860B', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        <AnimatedNumber value={value} duration={1} />
      </div>
    </div>
  );
}

export function Price() { return <Stat label="BTC / USD" value="$64,087" />; }
export function Percent() { return <Stat label="24h Change" value="+4.49%" color="#34d399" />; }
export function FearGreed() { return <Stat label="Fear & Greed" value="13 · Extreme Fear" color="#f87171" />; }
export function MarketCap() { return <Stat label="Total Market Cap" value="$2.31T" />; }
