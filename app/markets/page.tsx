import { getCryptoPrices, getMacroData, getFxRates, formatPrice, formatPct, pctColor } from '@/lib/api';

export const metadata = {
  title: 'Markets | S2D Capital Insights',
  description: 'Live market data across crypto, FX, macro, and commodities.',
};

export const revalidate = 300;

export default async function MarketsPage() {
  const [prices, macro, fx] = await Promise.all([
    getCryptoPrices(),
    getMacroData(),
    getFxRates(),
  ]);

  const coins = [
    { name: 'Bitcoin', key: 'bitcoin', sym: 'BTC' },
    { name: 'Ethereum', key: 'ethereum', sym: 'ETH' },
    { name: 'Solana', key: 'solana', sym: 'SOL' },
    { name: 'XRP', key: 'ripple', sym: 'XRP' },
    { name: 'Dogecoin', key: 'dogecoin', sym: 'DOGE' },
    { name: 'Cardano', key: 'cardano', sym: 'ADA' },
  ];

  const fxPairs = fx ? [
    { pair: 'EUR/USD', val: (1 / fx.EUR).toFixed(4) },
    { pair: 'GBP/USD', val: (1 / fx.GBP).toFixed(4) },
    { pair: 'USD/JPY', val: fx.JPY?.toFixed(2) },
    { pair: 'USD/CHF', val: fx.CHF?.toFixed(4) },
    { pair: 'AUD/USD', val: (1 / fx.AUD).toFixed(4) },
    { pair: 'USD/CAD', val: fx.CAD?.toFixed(4) },
  ] : [];

  const macroItems = [
    { label: 'Fed Funds Rate', value: macro.fedRate ? macro.fedRate + '%' : '-', color: 'var(--v-macro)' },
    { label: '10Y Treasury', value: macro.treasury10y ? macro.treasury10y + '%' : '-', color: 'var(--v-macro)' },
    { label: 'CPI Index', value: macro.cpi || '-', color: 'var(--v-commodities)' },
    { label: 'Unemployment', value: macro.unemployment ? macro.unemployment + '%' : '-', color: 'var(--v-geopolitics)' },
  ];

  return (
    <section style={{ padding: '48px', minHeight: '80vh' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Live Market Data</p>
      <h1 className="section-title" style={{ marginBottom: 8 }}>
        Market <em>Intelligence</em>
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', fontWeight: 300, marginBottom: 40 }}>
        Real-time data across all verticals. Powered by CoinGecko, FRED &amp; Open Exchange Rates.
      </p>

      {/* ── MACRO (FRED) ── */}
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 16, color: 'var(--v-macro)' }}>
          Macro &amp; Central Banks (FRED)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {macroItems.map((item) => (
            <div key={item.label} style={{
              padding: '24px 20px', background: 'var(--bg-warm)',
              border: '1px solid var(--border-lt)', borderTop: '3px solid ' + item.color,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
                fontWeight: 600, color: 'var(--navy)', lineHeight: 1,
              }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
        {macro.fedRateDate && (
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
            Last updated: {macro.fedRateDate}
          </p>
        )}
      </div>

      {/* ── CRYPTO ── */}
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 16, color: 'var(--v-crypto)' }}>
          Crypto Markets (CoinGecko)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          {coins.map((c) => {
            const d = prices?.[c.key];
            return (
              <div key={c.key} style={{
                padding: '20px 16px', background: 'var(--bg-warm)',
                border: '1px solid var(--border-lt)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--navy)' }}>{c.sym}</span>
                  <span style={{
                    fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
                    fontWeight: 500, color: pctColor(d?.usd_24h_change),
                  }}>
                    {formatPct(d?.usd_24h_change)}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '1.3rem',
                  fontWeight: 600, color: 'var(--navy)',
                }}>
                  {formatPrice(d?.usd)}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  MCap {formatPrice(d?.usd_market_cap)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FX RATES ── */}
      {fxPairs.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <p className="eyebrow" style={{ marginBottom: 16, color: 'var(--v-fx)' }}>
            FX Rates (Open Exchange Rates)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {fxPairs.map((f) => (
              <div key={f.pair} style={{
                padding: '16px 14px', background: 'var(--bg-warm)',
                border: '1px solid var(--border-lt)',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                  {f.pair}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--v-fx)' }}>
                  {f.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ATTRIBUTION ── */}
      <div style={{
        padding: '16px 20px', background: 'var(--bg-cream)',
        border: '1px solid var(--border-lt)', borderRadius: 2,
        fontSize: '0.72rem', color: 'var(--text-muted)',
      }}>
        Data provided by{' '}
        <a href="https://www.coingecko.com" target="_blank" rel="noopener" style={{ color: 'var(--gold)' }}>CoinGecko</a>,{' '}
        <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener" style={{ color: 'var(--gold)' }}>FRED (Federal Reserve Bank of St. Louis)</a>, and{' '}
        <a href="https://open.er-api.com" target="_blank" rel="noopener" style={{ color: 'var(--gold)' }}>Open Exchange Rates</a>.
        Crypto prices update every 5 minutes. Macro data updates hourly. FX rates update daily.
      </div>
    </section>
  );
}
