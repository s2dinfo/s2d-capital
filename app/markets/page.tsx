import { getCryptoPrices, getMacroData, getFxRates, getFearGreed, getTrending, getBtcChart, getEthChart, getFredChart, formatPrice, formatPct, pctColor } from '@/lib/api';
import MarketCharts from './charts';

export const metadata = {
  title: 'Markets | S2D Capital Insights',
  description: 'Live market data across crypto, macro, FX, and commodities.',
};

export const revalidate = 300;

export default async function MarketsPage() {
  const [prices, macro, fx, fearGreed, trending, btcChart, ethChart, fedRateChart] = await Promise.all([
    getCryptoPrices(),
    getMacroData(),
    getFxRates(),
    getFearGreed(),
    getTrending(),
    getBtcChart(),
    getEthChart(),
    getFredChart('FEDFUNDS', 24),
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
    { pair: 'EUR/GBP', val: (fx.GBP / fx.EUR).toFixed(4) },
    { pair: 'USD/CNY', val: fx.CNY?.toFixed(4) },
  ] : [];

  const fgValue = fearGreed?.current?.value ?? 50;
  const fgLabel = fearGreed?.current?.label ?? 'Neutral';
  const fgColor = fgValue <= 25 ? '#C0392B' : fgValue <= 45 ? '#E67E22' : fgValue <= 55 ? '#F1C40F' : fgValue <= 75 ? '#82E0AA' : '#2D8F5E';

  const macroCards = [
    { label: 'Fed Funds Rate', value: macro.fedRate ? macro.fedRate + '%' : '-', color: '#3B6CB4', sub: 'Federal Reserve' },
    { label: '10Y Treasury', value: macro.treasury10y ? macro.treasury10y + '%' : '-', color: '#3B6CB4', sub: 'US Government Bonds' },
    { label: 'CPI Index', value: macro.cpi || '-', color: '#8B5E3C', sub: 'Consumer Prices' },
    { label: 'Unemployment', value: macro.unemployment ? macro.unemployment + '%' : '-', color: '#8B2252', sub: 'US Labor Market' },
  ];

  return (
    <div style={{ padding: '36px 48px 60px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B8860B', marginBottom: 8 }}>
          LIVE MARKET DATA
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, color: '#1A1A2E', marginBottom: 6 }}>
          Market <em style={{ fontStyle: 'italic', color: '#B8860B' }}>Intelligence</em> Dashboard
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#6B6B82', fontWeight: 300 }}>
          Real-time data across all six verticals. Powered by CoinGecko, FRED, Open Exchange Rates &amp; Alternative.me.
        </p>
      </div>

      {/* ═══ ROW 1: Fear & Greed + Macro ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
        {/* Fear & Greed */}
        <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 28, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8860B', marginBottom: 16 }}>
            CRYPTO FEAR &amp; GREED INDEX
          </p>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: `6px solid ${fgColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: `${fgColor}08` }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 700, color: fgColor, lineHeight: 1 }}>
              {fgValue}
            </span>
            <span style={{ fontSize: '0.6rem', color: fgColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {fgLabel}
            </span>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#9C9CAF' }}>0 = Extreme Fear / 100 = Extreme Greed</p>
        </div>

        {/* Macro Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {macroCards.map((m) => (
            <div key={m.label} style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: '22px 18px', borderLeft: `4px solid ${m.color}` }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: m.color, marginBottom: 6 }}>
                {m.label}
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 600, color: '#1A1A2E', lineHeight: 1, marginBottom: 4 }}>
                {m.value}
              </div>
              <p style={{ fontSize: '0.65rem', color: '#9C9CAF' }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ROW 2: Crypto Prices ═══ */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8860B', marginBottom: 14 }}>
          CRYPTO MARKETS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {coins.map((c) => {
            const d = prices?.[c.key];
            return (
              <div key={c.key} style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: '18px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1A1A2E' }}>{c.sym}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600, color: pctColor(d?.usd_24h_change) }}>
                    {formatPct(d?.usd_24h_change)}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 600, color: '#1A1A2E' }}>
                  {formatPrice(d?.usd)}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#9C9CAF', marginTop: 3 }}>
                  MCap {formatPrice(d?.usd_market_cap)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ ROW 3: Charts ═══ */}
      <MarketCharts btcChart={btcChart} ethChart={ethChart} fedRateChart={fedRateChart} fearGreedHistory={fearGreed?.history} btcPrice={prices?.bitcoin?.usd} ethPrice={prices?.ethereum?.usd} btcChange={prices?.bitcoin?.usd_24h_change} ethChange={prices?.ethereum?.usd_24h_change} />

      {/* ═══ ROW 4: Trending + FX ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Trending */}
        {trending && (
          <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 22 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8860B', marginBottom: 14 }}>
              TRENDING ON COINGECKO
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trending.map((t: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < trending.length - 1 ? '1px solid #F0EDE6' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#9C9CAF', width: 16 }}>{i + 1}</span>
                    {t.thumb && <img src={t.thumb} alt={t.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#1A1A2E' }}>{t.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9C9CAF' }}>{t.symbol}</span>
                  </div>
                  {t.priceChange24h != null && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 500, color: pctColor(t.priceChange24h) }}>
                      {formatPct(t.priceChange24h)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FX Rates */}
        {fxPairs.length > 0 && (
          <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 22 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2D8F5E', marginBottom: 14 }}>
              FX RATES
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {fxPairs.map((f) => (
                <div key={f.pair} style={{ padding: '10px 12px', background: '#FAF8F3', border: '1px solid #F0EDE6' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 3 }}>{f.pair}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 500, color: '#2D8F5E' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div style={{ padding: '14px 18px', background: '#FAF8F3', border: '1px solid #F0EDE6', fontSize: '0.68rem', color: '#9C9CAF', borderRadius: 2 }}>
        Data provided by{' '}
        <a href="https://www.coingecko.com" target="_blank" rel="noopener" style={{ color: '#B8860B' }}>CoinGecko</a>,{' '}
        <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener" style={{ color: '#B8860B' }}>FRED</a>,{' '}
        <a href="https://open.er-api.com" target="_blank" rel="noopener" style={{ color: '#B8860B' }}>Open Exchange Rates</a>, and{' '}
        <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener" style={{ color: '#B8860B' }}>Alternative.me</a>.
        Crypto updates every 5min. Macro hourly. FX daily.
      </div>
    </div>
  );
}
