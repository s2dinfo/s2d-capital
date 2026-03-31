'use client';
import { useState, useEffect, useCallback } from 'react';

// ── Types ──
export interface SymbolData {
  symbol: string;
  label: string;
  sector: string;
  price: number | null;
  change: number | null;
  prevClose: number | null;
  sparkline: number[];
}

export interface FearGreedData {
  value: number;
  label: string;
  history: { date: string; value: number }[];
}

export interface CryptoGlobalData {
  totalMcap: number;
  vol24h: number;
  btcDom: number;
  ethDom: number;
  active: number;
  mcapChg: number;
}

export interface MarketDataResponse {
  symbols: Record<string, SymbolData>;
  fearGreed: FearGreedData | null;
  cryptoGlobal: CryptoGlobalData | null;
  fedRate: string | null;
  timestamp: string;
}

export interface UseMarketDataReturn {
  data: MarketDataResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  sym: (key: string) => SymbolData | null;
  price: (key: string) => number | null;
  change: (key: string) => number | null;
  spark: (key: string) => number[];
}

// ── Formatters ──
export function fmt(val: number | null | undefined, opts?: { prefix?: string; decimals?: number; suffix?: string }): string {
  if (val === null || val === undefined) return '\u2014';
  const d = opts?.decimals ?? 0;
  const p = opts?.prefix ?? '';
  const s = opts?.suffix ?? '';
  if (Math.abs(val) >= 1e12) return p + (val / 1e12).toFixed(2) + 'T' + s;
  if (Math.abs(val) >= 1e9) return p + (val / 1e9).toFixed(1) + 'B' + s;
  if (Math.abs(val) >= 1e6) return p + (val / 1e6).toFixed(1) + 'M' + s;
  if (Math.abs(val) >= 1000) return p + val.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) + s;
  if (Math.abs(val) >= 1) return p + val.toFixed(d) + s;
  return p + val.toFixed(Math.max(d, 4)) + s;
}

export function fmtPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return '\u2014';
  return (val > 0 ? '+' : '') + val.toFixed(1) + '%';
}

export function pctColor(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'rgba(255,255,255,0.35)';
  return val > 0 ? '#34d399' : '#f87171';
}

// ── Hook ──
const REFRESH_INTERVAL = 60_000;

export function useMarketData(): UseMarketDataReturn {
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/market-data');
      if (!res.ok) throw new Error('API ' + res.status);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(iv);
  }, [refresh]);

  const sym = (key: string) => data?.symbols?.[key] ?? null;
  const price = (key: string) => data?.symbols?.[key]?.price ?? null;
  const change = (key: string) => data?.symbols?.[key]?.change ?? null;
  const spark = (key: string) => data?.symbols?.[key]?.sparkline ?? [];

  return { data, loading, error, lastUpdated, refresh, sym, price, change, spark };
}

// ── Pre-built data for homepage sections ──

export function getTicker(d: MarketDataResponse | null) {
  if (!d?.symbols) return [];
  const s = d.symbols;
  return [
    { l: 'S&P 500', v: fmt(s.SPX?.price), c: pctColor(s.SPX?.change) },
    { l: 'DOW', v: fmt(s.DJI?.price), c: pctColor(s.DJI?.change) },
    { l: 'NASDAQ', v: fmt(s.NDX?.price), c: pctColor(s.NDX?.change) },
    { l: 'BTC', v: fmt(s.BTC?.price, { prefix: '$' }), c: pctColor(s.BTC?.change) },
    { l: 'GOLD', v: fmt(s.GOLD?.price, { prefix: '$' }), c: pctColor(s.GOLD?.change) },
    { l: 'OIL', v: fmt(s.OIL?.price, { prefix: '$', decimals: 2 }), c: pctColor(s.OIL?.change) },
    { l: 'EUR/USD', v: fmt(s.EURUSD?.price, { decimals: 4 }), c: pctColor(s.EURUSD?.change) },
    { l: 'FED', v: d.fedRate ? d.fedRate + '%' : '\u2014' },
    { l: 'VIX', v: fmt(s.VIX?.price, { decimals: 1 }), c: s.VIX?.price ? (s.VIX.price > 30 ? '#f87171' : s.VIX.price > 20 ? '#E88A3C' : '#34d399') : undefined },
  ];
}

export function getStatCards(d: MarketDataResponse | null) {
  if (!d?.symbols) return [];
  const s = d.symbols;
  return [
    { name: 'S&P 500', val: s.SPX?.price, chg: s.SPX?.change, color: '#B8860B', spark: s.SPX?.sparkline || [] },
    { name: 'BITCOIN', val: s.BTC?.price, chg: s.BTC?.change, color: '#B8860B', prefix: '$', spark: s.BTC?.sparkline || [] },
    { name: 'GOLD', val: s.GOLD?.price, chg: s.GOLD?.change, color: '#D4A843', prefix: '$', spark: s.GOLD?.sparkline || [] },
    { name: 'WTI OIL', val: s.OIL?.price, chg: s.OIL?.change, color: '#D4A843', prefix: '$', dec: 2, spark: s.OIL?.sparkline || [] },
    { name: 'VIX', val: s.VIX?.price, chg: s.VIX?.change, color: '#C0392B', dec: 1, spark: s.VIX?.sparkline || [] },
    { name: 'NAT GAS', val: s.NATGAS?.price, chg: s.NATGAS?.change, color: '#D4A843', prefix: '$', dec: 2, spark: s.NATGAS?.sparkline || [] },
  ];
}

export function getMacroRows(d: MarketDataResponse | null) {
  if (!d?.symbols) return [];
  const s = d.symbols;
  return [
    { l: 'Fed Rate', v: d.fedRate ? d.fedRate + '%' : '\u2014', c: '#6B9BD2' },
    { l: '10Y Yield', v: fmt(s.US10Y?.price, { decimals: 2, suffix: '%' }), c: '#6B9BD2' },
    { l: '2Y Yield', v: fmt(s.US2Y?.price, { decimals: 2, suffix: '%' }), c: '#6B9BD2' },
    { l: 'Yield Spread', v: s.US10Y?.price && s.US2Y?.price ? (s.US10Y.price - s.US2Y.price).toFixed(2) + '%' : '\u2014', c: '#D4A843' },
    { l: 'VIX', v: fmt(s.VIX?.price, { decimals: 1 }), c: '#E06B6B' },
  ];
}

export function getFxRows(d: MarketDataResponse | null) {
  if (!d?.symbols) return [];
  const s = d.symbols;
  return [
    { l: 'EUR/USD', v: fmt(s.EURUSD?.price, { decimals: 4 }), c: '#4CAF7D' },
    { l: 'GBP/USD', v: fmt(s.GBPUSD?.price, { decimals: 4 }), c: '#4CAF7D' },
    { l: 'USD/JPY', v: fmt(s.USDJPY?.price, { decimals: 2 }), c: '#4CAF7D' },
    { l: 'USD/CHF', v: fmt(s.USDCHF?.price, { decimals: 4 }), c: '#4CAF7D' },
  ];
}
