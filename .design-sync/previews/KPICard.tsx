import { KPICard } from 's2d-capital-insights';

// Realistic S2D market data — sparkline arrays trend toward the printed value.
const btc = [61200, 61800, 60900, 62400, 63100, 62700, 63800, 64600, 64100, 65200, 64800, 65900, 66400, 65700, 66800, 67200, 66500, 67900, 68400, 64087];
const gold = [2310, 2322, 2318, 2335, 2341, 2329, 2348, 2356, 2351, 2363, 2358, 2371, 2368, 2380, 2375, 2389, 2384, 2396, 2402, 2398];
const dxy = [104.8, 104.6, 104.9, 105.1, 104.7, 104.4, 104.2, 103.9, 104.1, 103.7, 103.5, 103.8, 103.4, 103.1, 103.3, 102.9, 103.0, 102.7, 102.5, 102.84];

// KPICard is a semi-transparent dark-glass tile meant to sit on the dark page.
// Compose each on a navy panel so the glass reads correctly (on the white card
// body it washes out to grey) and the gold accents + sparkline pop.
const wrap = {
  width: 280,
  padding: 18,
  background: 'radial-gradient(130% 130% at 30% 0%, #232850 0%, #14142a 62%)',
  borderRadius: 14,
} as const;

export function CryptoBTC() {
  return <div style={wrap}><KPICard label="BTC / USD" value="$64,087" change={4.49} subtitle="24h volume $38.2B" color="#B8860B" sparkline={btc} /></div>;
}

export function GoldSpot() {
  return <div style={wrap}><KPICard label="Gold Spot" value="$2,398" change={1.27} color="#C9A84C" sparkline={gold} /></div>;
}

export function DollarIndex() {
  return <div style={wrap}><KPICard label="DXY" value="102.84" change={-0.84} subtitle="Dollar index, lower = risk-on" color="#3B6CB4" sparkline={dxy} /></div>;
}

export function NoSparkline() {
  return <div style={wrap}><KPICard label="Fear & Greed" value="13 · Extreme Fear" change={null} subtitle="CNN index, updated daily" color="#f87171" /></div>;
}
