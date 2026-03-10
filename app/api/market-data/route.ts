// app/api/market-data/route.ts
// Unified market data API — returns prices + % changes for ALL sectors
import { NextResponse } from "next/server";

const SYMBOLS: Record<string, { symbol: string; label: string; sector: string }> = {
  // Crypto
  BTC: { symbol: "BTC-USD", label: "Bitcoin", sector: "crypto" },
  ETH: { symbol: "ETH-USD", label: "Ethereum", sector: "crypto" },
  SOL: { symbol: "SOL-USD", label: "Solana", sector: "crypto" },
  XRP: { symbol: "XRP-USD", label: "XRP", sector: "crypto" },
  // Commodities
  GOLD: { symbol: "GC=F", label: "Gold", sector: "commodities" },
  OIL: { symbol: "CL=F", label: "WTI Crude", sector: "commodities" },
  SILVER: { symbol: "SI=F", label: "Silver", sector: "commodities" },
  NATGAS: { symbol: "NG=F", label: "Nat Gas", sector: "commodities" },
  // FX
  EURUSD: { symbol: "EURUSD=X", label: "EUR/USD", sector: "fx" },
  GBPUSD: { symbol: "GBPUSD=X", label: "GBP/USD", sector: "fx" },
  USDJPY: { symbol: "USDJPY=X", label: "USD/JPY", sector: "fx" },
  USDCHF: { symbol: "USDCHF=X", label: "USD/CHF", sector: "fx" },
  // Macro / Indices
  SPX: { symbol: "^GSPC", label: "S&P 500", sector: "macro" },
  DJI: { symbol: "^DJI", label: "Dow Jones", sector: "macro" },
  NDX: { symbol: "^IXIC", label: "NASDAQ", sector: "macro" },
  VIX: { symbol: "^VIX", label: "VIX", sector: "macro" },
  // Bonds
  US10Y: { symbol: "^TNX", label: "US 10Y", sector: "bonds" },
  US2Y: { symbol: "2YY=F", label: "US 2Y", sector: "bonds" },
};

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

async function fetchYahoo(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
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

    // Get close prices for sparkline
    const closes = result.indicators?.quote?.[0]?.close?.filter((v: any) => v != null) ?? [];

    return { price, change, prevClose, sparkline: closes.slice(-20) };
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

  const entries = Object.entries(SYMBOLS);
  const results = await Promise.allSettled(
    entries.map(([, v]) => fetchYahoo(v.symbol))
  );

  const data: Record<string, any> = {};
  entries.forEach(([key, meta], i) => {
    const r = results[i];
    const val = r.status === "fulfilled" && r.value ? r.value : null;
    data[key] = {
      ...meta,
      price: val?.price ?? null,
      change: val?.change ?? null,
      prevClose: val?.prevClose ?? null,
      sparkline: val?.sparkline ?? [],
    };
  });

  cache = { data, ts: Date.now() };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
