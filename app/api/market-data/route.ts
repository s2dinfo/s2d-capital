// app/api/market-data/route.ts
// Unified market data API — Yahoo Finance + CoinGecko global + Fear & Greed + FRED
import { NextResponse } from "next/server";

const SYMBOLS: Record<string, { symbol: string; label: string; sector: string }> = {
  BTC:    { symbol: "BTC-USD",   label: "Bitcoin",    sector: "crypto" },
  ETH:    { symbol: "ETH-USD",   label: "Ethereum",   sector: "crypto" },
  SOL:    { symbol: "SOL-USD",   label: "Solana",     sector: "crypto" },
  XRP:    { symbol: "XRP-USD",   label: "XRP",        sector: "crypto" },
  GOLD:   { symbol: "GC=F",     label: "Gold",       sector: "commodities" },
  OIL:    { symbol: "CL=F",     label: "WTI Crude",  sector: "commodities" },
  SILVER: { symbol: "SI=F",     label: "Silver",     sector: "commodities" },
  BRENT:  { symbol: "BZ=F",     label: "Brent Crude", sector: "commodities" },
  NATGAS: { symbol: "NG=F",     label: "Nat Gas",    sector: "commodities" },
  COPPER: { symbol: "HG=F",     label: "Copper",     sector: "commodities" },
  EURUSD: { symbol: "EURUSD=X", label: "EUR/USD",    sector: "fx" },
  GBPUSD: { symbol: "GBPUSD=X", label: "GBP/USD",    sector: "fx" },
  USDJPY: { symbol: "USDJPY=X", label: "USD/JPY",    sector: "fx" },
  USDCHF: { symbol: "USDCHF=X", label: "USD/CHF",    sector: "fx" },
  DXY:    { symbol: "DX-Y.NYB", label: "Dollar Index", sector: "fx" },
  SPX:    { symbol: "^GSPC",    label: "S&P 500",    sector: "macro" },
  DJI:    { symbol: "^DJI",     label: "Dow Jones",  sector: "macro" },
  NDX:    { symbol: "^IXIC",    label: "NASDAQ",     sector: "macro" },
  VIX:    { symbol: "^VIX",     label: "VIX",        sector: "macro" },
  US10Y:  { symbol: "^TNX",     label: "US 10Y",     sector: "bonds" },
  US2Y:   { symbol: "2YY=F",    label: "US 2Y",      sector: "bonds" },
};

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

async function fetchYahoo(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const closes = result.indicators?.quote?.[0]?.close?.filter((v: any) => v != null) ?? [];
    return { price, change, prevClose, sparkline: closes.slice(-30) };
  } catch {
    return null;
  }
}

async function fetchFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=14", { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      value: parseInt(d.data[0].value),
      label: d.data[0].value_classification,
      history: d.data.slice(0, 14).reverse().map((x: any) => ({
        date: new Date(parseInt(x.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: parseInt(x.value),
      })),
    };
  } catch {
    return null;
  }
}

async function fetchCryptoGlobal() {
  try {
    const CG = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
    const headers: Record<string, string> = CG ? { "x-cg-demo-api-key": CG } : {};
    const res = await fetch("https://api.coingecko.com/api/v3/global", { headers, next: { revalidate: 300 } });
    if (!res.ok) return null;
    const d = (await res.json()).data;
    return {
      totalMcap: d.total_market_cap?.usd,
      vol24h: d.total_volume?.usd,
      btcDom: d.market_cap_percentage?.btc,
      ethDom: d.market_cap_percentage?.eth,
      active: d.active_cryptocurrencies,
      mcapChg: d.market_cap_change_percentage_24h_usd,
    };
  } catch {
    return null;
  }
}

async function fetchFredSeries(seriesId: string): Promise<string | null> {
  try {
    const FR = process.env.FRED_API_KEY || "";
    if (!FR) return null;
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FR}&file_type=json&sort_order=desc&limit=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const obs = (await res.json()).observations?.filter((o: any) => o.value !== ".");
    return obs?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }

  // Fetch everything in parallel
  const entries = Object.entries(SYMBOLS);
  const [yahooResults, fearGreed, cryptoGlobal, fedRate, cpi, unemp, dxyFred] = await Promise.all([
    Promise.allSettled(entries.map(([, v]) => fetchYahoo(v.symbol))),
    fetchFearGreed(),
    fetchCryptoGlobal(),
    fetchFredSeries("FEDFUNDS"),
    fetchFredSeries("CPIAUCSL"),
    fetchFredSeries("UNRATE"),
    fetchFredSeries("DTWEXBGS"),
  ]);

  // Build symbols data
  const symbols: Record<string, any> = {};
  entries.forEach(([key, meta], i) => {
    const r = yahooResults[i];
    const val = r.status === "fulfilled" && r.value ? r.value : null;
    symbols[key] = {
      ...meta,
      price: val?.price ?? null,
      change: val?.change ?? null,
      prevClose: val?.prevClose ?? null,
      sparkline: val?.sparkline ?? [],
    };
  });

  const data = {
    symbols,
    fearGreed,
    cryptoGlobal,
    fedRate,
    cpi,
    unemp,
    dxy: dxyFred,
    timestamp: new Date().toISOString(),
  };

  cache = { data, ts: Date.now() };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
