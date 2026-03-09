const CG_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';
const FRED_KEY = process.env.FRED_API_KEY || '';
const cgH: Record<string, string> = CG_KEY ? { 'x-cg-demo-api-key': CG_KEY } : {};

// ═══ CRYPTO (CoinGecko) ═══
export async function getCryptoWithSparklines() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&sparkline=true&price_change_percentage=7d', { headers: cgH, next: { revalidate: 300 } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
export async function getCryptoPrices() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true', { headers: cgH, next: { revalidate: 300 } });
    if (!r.ok) return FB();
    return await r.json();
  } catch { return FB(); }
}
export async function getGlobalData() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/global', { headers: cgH, next: { revalidate: 600 } });
    if (!r.ok) return null;
    const d = (await r.json()).data;
    return { totalMarketCap: d.total_market_cap?.usd, totalVolume: d.total_volume?.usd, btcDominance: d.market_cap_percentage?.btc, ethDominance: d.market_cap_percentage?.eth, activeCryptos: d.active_cryptocurrencies, marketCapChange24h: d.market_cap_change_percentage_24h_usd };
  } catch { return null; }
}
export async function getBtcChart() { return getCoinChart('bitcoin'); }
export async function getEthChart() { return getCoinChart('ethereum'); }
async function getCoinChart(id: string) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`, { headers: cgH, next: { revalidate: 600 } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.prices?.filter((_: any, i: number) => i % 12 === 0).map(([ts, p]: [number, number]) => ({ date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), price: Math.round(p) }));
  } catch { return null; }
}
export async function getTrending() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/search/trending', { headers: cgH, next: { revalidate: 600 } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.coins?.slice(0, 8).map((c: any) => ({ name: c.item.name, symbol: c.item.symbol, thumb: c.item.thumb, priceChange24h: c.item.data?.price_change_percentage_24h?.usd }));
  } catch { return null; }
}
export async function getFearGreed() {
  try {
    const r = await fetch('https://api.alternative.me/fng/?limit=30', { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    return {
      current: { value: parseInt(d.data[0].value), label: d.data[0].value_classification },
      history: d.data.slice(0, 14).reverse().map((x: any) => ({ date: new Date(parseInt(x.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseInt(x.value) })),
    };
  } catch { return null; }
}

// ═══ MACRO (FRED) ═══
async function fredObs(id: string) {
  if (!FRED_KEY) return null;
  try {
    const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return (await r.json()).observations?.[0];
  } catch { return null; }
}
export async function getFredChart(id: string, limit: number = 24) {
  if (!FRED_KEY) return null;
  try {
    const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=${limit}`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return (await r.json()).observations?.reverse().map((o: any) => ({ date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), value: parseFloat(o.value) || 0 }));
  } catch { return null; }
}
export async function getMacroData() {
  const [fedRate, t10y, t2y, cpi, unemp, yieldSpread, m2, gdp, dxy] = await Promise.all([
    fredObs('FEDFUNDS'), fredObs('DGS10'), fredObs('DGS2'), fredObs('CPIAUCSL'),
    fredObs('UNRATE'), fredObs('T10Y2Y'), fredObs('M2SL'), fredObs('GDPC1'), fredObs('DTWEXBGS'),
  ]);
  return {
    fedRate: fedRate?.value, treasury10y: t10y?.value, treasury2y: t2y?.value,
    cpi: cpi?.value, unemployment: unemp?.value, yieldSpread: yieldSpread?.value,
    m2: m2?.value, gdp: gdp?.value, dollarIndex: dxy?.value,
    fedRateDate: fedRate?.date,
  };
}

// ═══ COMMODITIES (FRED + CoinGecko) ═══
export async function getCommodities() {
  const [oil, goldCg] = await Promise.all([
    fredObs('DCOILWTICO'),
    (async () => { try { const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true', { headers: cgH, next: { revalidate: 600 } }); if (!r.ok) return null; return await r.json(); } catch { return null; } })(),
  ]);
  return {
    wtiOil: oil?.value ? parseFloat(oil.value) : null, oilDate: oil?.date,
    gold: goldCg?.['pax-gold']?.usd, goldChange: goldCg?.['pax-gold']?.usd_24h_change,
  };
}
export async function getOilChart() { return getFredChart('DCOILWTICO', 60); }

// ═══ FX (Open Exchange Rates + FRED DXY) ═══
export async function getFxRates() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return (await r.json()).rates;
  } catch { return null; }
}

// ═══ DEFI / MARKET STRUCTURE (DefiLlama) ═══
export async function getDefiTvl() {
  try {
    const r = await fetch('https://api.llama.fi/v2/historicalChainTvl', { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    const recent = d.slice(-30);
    return { current: recent[recent.length - 1]?.tvl, chart: recent.map((x: any) => ({ date: new Date(x.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), tvl: Math.round(x.tvl / 1e9 * 10) / 10 })) };
  } catch { return null; }
}
export async function getDefiByChain() {
  try {
    const r = await fetch('https://api.llama.fi/v2/chains', { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0)).slice(0, 10).map((c: any) => ({ name: c.name, tvl: c.tvl }));
  } catch { return null; }
}

// ═══ HELPERS ═══
export function formatPrice(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
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
  if (!v) return '#9C9CAF'; return v > 0 ? '#2D8F5E' : '#C0392B';
}
function FB() {
  return { bitcoin: { usd: 68743, usd_24h_change: 2.5, usd_market_cap: 1360000000000 }, ethereum: { usd: 2023, usd_24h_change: 4.3, usd_market_cap: 244000000000 }, solana: { usd: 84.95, usd_24h_change: 3.8, usd_market_cap: 42000000000 }, ripple: { usd: 1.36, usd_24h_change: 1.2, usd_market_cap: 78000000000 }, dogecoin: { usd: 0.0914, usd_24h_change: 2.9, usd_market_cap: 13000000000 }, cardano: { usd: 0.2571, usd_24h_change: 2.4, usd_market_cap: 9200000000 } };
}
