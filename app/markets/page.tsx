import { getCryptoWithSparklines, getGlobalData, getMacroData, getFxRates, getFearGreed, getTrending, getBtcChart, getEthChart, getFredChart, getDefiTvl, formatPrice, formatPct, pctColor } from '@/lib/api';
import MarketCharts from './charts';
import styles from './markets.module.css';

export const metadata = { title: 'Markets | S2D Capital Insights', description: 'Live market data dashboard.' };
export const revalidate = 300;

export default async function MarketsPage() {
  const [sparklineCoins, global, macro, fx, fearGreed, trending, btcChart, ethChart, fedRateChart, defiTvl] = await Promise.all([
    getCryptoWithSparklines(),
    getGlobalData(),
    getMacroData(),
    getFxRates(),
    getFearGreed(),
    getTrending(),
    getBtcChart(),
    getEthChart(),
    getFredChart('FEDFUNDS', 24),
    getDefiTvl(),
  ]);

  const fxPairs = fx ? [
    { pair: 'EUR/USD', val: (1 / fx.EUR).toFixed(4) }, { pair: 'GBP/USD', val: (1 / fx.GBP).toFixed(4) },
    { pair: 'USD/JPY', val: fx.JPY?.toFixed(2) }, { pair: 'USD/CHF', val: fx.CHF?.toFixed(4) },
    { pair: 'AUD/USD', val: (1 / fx.AUD).toFixed(4) }, { pair: 'USD/CAD', val: fx.CAD?.toFixed(4) },
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
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>LIVE MARKET DATA</p>
        <h1 className={styles.title}>Market <em>Intelligence</em> Dashboard</h1>
        <p className={styles.subtitle}>Real-time data across all six verticals. 7 APIs integrated.</p>
      </div>

      {/* ═══ GLOBAL OVERVIEW ═══ */}
      {global && (
        <div className={styles.globalRow}>
          <div className={styles.globalCard}>
            <span className={styles.globalLabel}>Total Crypto Market Cap</span>
            <span className={styles.globalValue}>{formatPrice(global.totalMarketCap)}</span>
            <span className={styles.globalChg} style={{ color: pctColor(global.marketCapChange24h) }}>{formatPct(global.marketCapChange24h)} 24h</span>
          </div>
          <div className={styles.globalCard}>
            <span className={styles.globalLabel}>24h Volume</span>
            <span className={styles.globalValue}>{formatPrice(global.totalVolume)}</span>
          </div>
          <div className={styles.globalCard}>
            <span className={styles.globalLabel}>BTC Dominance</span>
            <span className={styles.globalValue}>{global.btcDominance?.toFixed(1)}%</span>
            <div className={styles.domBar}><div className={styles.domFill} style={{ width: `${global.btcDominance}%` }} /></div>
          </div>
          <div className={styles.globalCard}>
            <span className={styles.globalLabel}>DeFi TVL</span>
            <span className={styles.globalValue}>{defiTvl?.current ? '$' + (defiTvl.current / 1e9).toFixed(1) + 'B' : '-'}</span>
          </div>
          <div className={styles.globalCard}>
            <span className={styles.globalLabel}>Active Cryptos</span>
            <span className={styles.globalValue}>{global.activeCryptos?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ═══ FEAR & GREED + MACRO ═══ */}
      <div className={styles.topRow}>
        <div className={styles.fgCard}>
          <p className={styles.cardLabel}>CRYPTO FEAR &amp; GREED INDEX</p>
          <div className={styles.fgCircle} style={{ borderColor: fgColor, background: `${fgColor}08` }}>
            <span className={styles.fgValue} style={{ color: fgColor }}>{fgValue}</span>
            <span className={styles.fgLabelText} style={{ color: fgColor }}>{fgLabel}</span>
          </div>
          <p className={styles.fgNote}>0 = Extreme Fear / 100 = Extreme Greed</p>
        </div>
        <div className={styles.macroGrid}>
          {macroCards.map((m) => (
            <div key={m.label} className={styles.macroCard} style={{ borderLeftColor: m.color }}>
              <p className={styles.macroLabel} style={{ color: m.color }}>{m.label}</p>
              <div className={styles.macroValue}>{m.value}</div>
              <p className={styles.macroSub}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CRYPTO WITH SPARKLINES ═══ */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>CRYPTO MARKETS</p>
        <MarketCharts
          sparklineCoins={sparklineCoins}
          btcChart={btcChart}
          ethChart={ethChart}
          fedRateChart={fedRateChart}
          fearGreedHistory={fearGreed?.history}
          defiTvlChart={defiTvl?.chart}
          btcPrice={sparklineCoins?.[0]?.current_price}
          ethPrice={sparklineCoins?.[1]?.current_price}
          btcChange={sparklineCoins?.[0]?.price_change_percentage_24h}
          ethChange={sparklineCoins?.[1]?.price_change_percentage_24h}
        />
      </div>

      {/* ═══ TRENDING + FX ═══ */}
      <div className={styles.bottomRow}>
        {trending && (
          <div className={styles.trendingCard}>
            <p className={styles.sectionLabel}>TRENDING ON COINGECKO</p>
            <div className={styles.trendingList}>
              {trending.map((t: any, i: number) => (
                <div key={i} className={styles.trendingItem}>
                  <div className={styles.trendingLeft}>
                    <span className={styles.trendingNum}>{i + 1}</span>
                    {t.thumb && <img src={t.thumb} alt={t.name} className={styles.trendingImg} />}
                    <span className={styles.trendingName}>{t.name}</span>
                    <span className={styles.trendingSym}>{t.symbol}</span>
                  </div>
                  {t.priceChange24h != null && (
                    <span className={styles.trendingChg} style={{ color: pctColor(t.priceChange24h) }}>{formatPct(t.priceChange24h)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {fxPairs.length > 0 && (
          <div className={styles.fxCard}>
            <p className={styles.sectionLabel} style={{ color: '#2D8F5E' }}>FX RATES</p>
            <div className={styles.fxGrid}>
              {fxPairs.map((f) => (
                <div key={f.pair} className={styles.fxItem}>
                  <div className={styles.fxPair}>{f.pair}</div>
                  <div className={styles.fxVal}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.attribution}>
        Data provided by <a href="https://www.coingecko.com" target="_blank" rel="noopener">CoinGecko</a>,{' '}
        <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener">FRED</a>,{' '}
        <a href="https://open.er-api.com" target="_blank" rel="noopener">Open Exchange Rates</a>,{' '}
        <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener">Alternative.me</a>, and{' '}
        <a href="https://defillama.com" target="_blank" rel="noopener">DefiLlama</a>.
      </div>
    </div>
  );
}
