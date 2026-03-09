const CG_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';
const FRED_KEY = process.env.FRED_API_KEY || '';
const cgHeaders: Record<string, string> = CG_KEY ? { 'x-cg-demo-api-key': CG_KEY } : {};

// ═══ COINGECKO ═══
export async function getCryptoPrices() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
      { headers: cgHeaders, next: { revalidate: 300 } }
    );
    if (!res.ok) return getFallbackCrypto();
    return await res.json();
  } catch { return getFallbackCrypto(); }
}

export async function getCryptoWithSparklines() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&sparkline=true&price_change_percentage=7d',
      { headers: cgHeaders, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function getGlobalData() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/global',
      { headers: cgHeaders, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    return {
      totalMarketCap: d.total_market_cap?.usd,
      totalVolume: d.total_volume?.usd,
      btcDominance: d.market_cap_percentage?.btc,
      ethDominance: d.market_cap_percentage?.eth,
      activeCryptos: d.active_cryptocurrencies,
      marketCapChange24h: d.market_cap_change_percentage_24h_usd,
    };
  } catch { return null; }
}

export async function getBtcChart() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30',
      { headers: cgHeaders, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.prices?.filter((_: any, i: number) => i % 12 === 0)
      .map(([ts, price]: [number, number]) => ({
        date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(price),
      }));
  } catch { return null; }
}

export async function getEthChart() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30',
      { headers: cgHeaders, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.prices?.filter((_: any, i: number) => i % 12 === 0)
      .map(([ts, price]: [number, number]) => ({
        date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(price),
      }));
  } catch { return null; }
}

export async function getTrending() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      { headers: cgHeaders, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.coins?.slice(0, 8).map((c: any) => ({
      name: c.item.name,
      symbol: c.item.symbol,
      thumb: c.item.thumb,
      marketCapRank: c.item.market_cap_rank,
      priceChange24h: c.item.data?.price_change_percentage_24h?.usd,
    }));
  } catch { return null; }
}

// ═══ FEAR & GREED ═══
export async function getFearGreed() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=30', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      current: { value: parseInt(data.data[0].value), label: data.data[0].value_classification },
      history: data.data.slice(0, 14).reverse().map((d: any) => ({
        date: new Date(parseInt(d.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseInt(d.value),
      })),
    };
  } catch { return null; }
}

// ═══ DEFI LLAMA ═══
export async function getDefiTvl() {
  try {
    const res = await fetch('https://api.llama.fi/v2/historicalChainTvl', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const recent = data.slice(-30);
    return {
      current: recent[recent.length - 1]?.tvl,
      chart: recent.map((d: any) => ({
        date: new Date(d.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tvl: Math.round(d.tvl / 1e9 * 10) / 10,
      })),
    };
  } catch { return null; }
}

// ═══ FRED ═══
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

export async function getFredChart(seriesId: string, limit: number = 24) {
  if (!FRED_KEY) return null;
  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=${limit}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.observations?.reverse().map((o: any) => ({
      date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: parseFloat(o.value) || 0,
    }));
  } catch { return null; }
}

export async function getMacroData() {
  const [fedRate, treasury10y, cpi, unemployment] = await Promise.all([
    getFredSeries('FEDFUNDS'), getFredSeries('DGS10'), getFredSeries('CPIAUCSL'), getFredSeries('UNRATE'),
  ]);
  return {
    fedRate: fedRate?.value || null, treasury10y: treasury10y?.value || null,
    cpi: cpi?.value || null, unemployment: unemployment?.value || null,
    fedRateDate: fedRate?.date || null,
  };
}

// ═══ FX RATES ═══
export async function getFxRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates;
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
  if (!v) return '#9C9CAF';
  return v > 0 ? '#2D8F5E' : '#C0392B';
}

function getFallbackCrypto() {
  return {
    bitcoin: { usd: 68743, usd_24h_change: 2.5, usd_market_cap: 1360000000000 },
    ethereum: { usd: 2023, usd_24h_change: 4.3, usd_market_cap: 244000000000 },
    solana: { usd: 84.95, usd_24h_change: 3.8, usd_market_cap: 42000000000 },
    ripple: { usd: 1.36, usd_24h_change: 1.2, usd_market_cap: 78000000000 },
    dogecoin: { usd: 0.0914, usd_24h_change: 2.9, usd_market_cap: 13000000000 },
    cardano: { usd: 0.2571, usd_24h_change: 2.4, usd_market_cap: 9200000000 },
  };
}
