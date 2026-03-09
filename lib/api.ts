const COINGECKO_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';
const FRED_KEY = process.env.FRED_API_KEY || '';

export async function getCryptoPrices() {
  try {
    console.log('[API] Fetching crypto... Key:', COINGECKO_KEY ? 'YES' : 'NO');
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
      {
        headers: COINGECKO_KEY ? { 'x-cg-demo-api-key': COINGECKO_KEY } : {},
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) { console.error('[API] CoinGecko:', res.status); return getFallback(); }
    const data = await res.json();
    console.log('[API] BTC =', data.bitcoin?.usd);
    return data;
  } catch (e) { console.error('[API] CoinGecko fail:', e); return getFallback(); }
}

export async function getBtcChart() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30',
      { headers: COINGECKO_KEY ? { 'x-cg-demo-api-key': COINGECKO_KEY } : {}, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.prices?.filter((_: any, i: number) => i % 8 === 0)
      .map(([ts, price]: [number, number]) => ({
        date: new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        price: Math.round(price),
      }));
  } catch { return null; }
}

export async function getFredSeries(seriesId: string) {
  if (!FRED_KEY) return null;
  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.observations?.[0];
  } catch { return null; }
}

export async function getMacroData() {
  const [fedRate, treasury10y, cpi, unemployment] = await Promise.all([
    getFredSeries('FEDFUNDS'),
    getFredSeries('DGS10'),
    getFredSeries('CPIAUCSL'),
    getFredSeries('UNRATE'),
  ]);
  return {
    fedRate: fedRate?.value || null,
    treasury10y: treasury10y?.value || null,
    cpi: cpi?.value || null,
    unemployment: unemployment?.value || null,
    fedRateDate: fedRate?.date || null,
  };
}

export async function getFxRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates;
  } catch { return null; }
}

export function formatPrice(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

export function formatPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '-';
  return (v > 0 ? '+' : '') + v.toFixed(1) + '%';
}

export function pctColor(v: number | null | undefined): string {
  if (!v) return 'var(--text-muted)';
  return v > 0 ? 'var(--green)' : 'var(--red)';
}

function getFallback() {
  return {
    bitcoin: { usd: 66635, usd_24h_change: -0.7, usd_market_cap: 1320000000000 },
    ethereum: { usd: 2012, usd_24h_change: -3.4, usd_market_cap: 242000000000 },
    solana: { usd: 142.8, usd_24h_change: 1.2, usd_market_cap: 68000000000 },
    ripple: { usd: 2.34, usd_24h_change: 0.8, usd_market_cap: 134000000000 },
    dogecoin: { usd: 0.182, usd_24h_change: -1.6, usd_market_cap: 26800000000 },
    cardano: { usd: 0.71, usd_24h_change: -0.9, usd_market_cap: 25200000000 },
  };
}
