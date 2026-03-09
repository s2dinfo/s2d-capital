import { getCryptoWithSparklines, getGlobalData, getMacroData, getCommodities, getFxRates, getFearGreed, getTrending, getBtcChart, getEthChart, getFredChart, getDefiTvl, getDefiByChain, getOilChart, formatPrice, formatPct, pctColor } from '@/lib/api';
import MarketCharts from './charts';
import styles from './markets.module.css';

export const metadata = { title: 'Markets | S2D Capital Insights' };
export const revalidate = 300;

export default async function MarketsPage() {
  const [coins, global, macro, commodities, fx, fg, trending, btcC, ethC, fedC, defi, chains, oilC, yieldC, dxyC] = await Promise.all([
    getCryptoWithSparklines(), getGlobalData(), getMacroData(), getCommodities(),
    getFxRates(), getFearGreed(), getTrending(), getBtcChart(), getEthChart(),
    getFredChart('FEDFUNDS', 24), getDefiTvl(), getDefiByChain(), getOilChart(),
    getFredChart('T10Y2Y', 24), getFredChart('DTWEXBGS', 30),
  ]);

  const fxPairs = fx ? [
    { pair: 'EUR/USD', val: (1/fx.EUR).toFixed(4) }, { pair: 'GBP/USD', val: (1/fx.GBP).toFixed(4) },
    { pair: 'USD/JPY', val: fx.JPY?.toFixed(2) }, { pair: 'USD/CHF', val: fx.CHF?.toFixed(4) },
    { pair: 'AUD/USD', val: (1/fx.AUD).toFixed(4) }, { pair: 'USD/CAD', val: fx.CAD?.toFixed(4) },
    { pair: 'EUR/GBP', val: (fx.GBP/fx.EUR).toFixed(4) }, { pair: 'USD/CNY', val: fx.CNY?.toFixed(4) },
  ] : [];

  const fgVal = fg?.current?.value ?? 50;
  const fgLbl = fg?.current?.label ?? 'Neutral';
  const fgCol = fgVal<=25?'#C0392B':fgVal<=45?'#E67E22':fgVal<=55?'#F1C40F':fgVal<=75?'#82E0AA':'#2D8F5E';
  const ysVal = macro.yieldSpread ? parseFloat(macro.yieldSpread) : null;
  const ysColor = ysVal !== null ? (ysVal < 0 ? '#C0392B' : ysVal < 0.5 ? '#E67E22' : '#2D8F5E') : '#9C9CAF';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eye}>LIVE MARKET DATA</p>
        <h1 className={styles.h1}>Market <em>Intelligence</em> Dashboard</h1>
        <p className={styles.sub}>Real-time data across all six verticals. 8 APIs. Updated every 5 minutes.</p>
      </div>

      {/* ════ GLOBAL OVERVIEW ════ */}
      {global && (
        <div className={styles.globalRow}>
          <div className={styles.gCard}><span className={styles.gLabel}>Total Crypto MCap</span><span className={styles.gVal}>{formatPrice(global.totalMarketCap)}</span><span style={{color:pctColor(global.marketCapChange24h),fontFamily:'var(--font-mono)',fontSize:'0.6rem'}}>{formatPct(global.marketCapChange24h)}</span></div>
          <div className={styles.gCard}><span className={styles.gLabel}>24h Volume</span><span className={styles.gVal}>{formatPrice(global.totalVolume)}</span></div>
          <div className={styles.gCard}><span className={styles.gLabel}>BTC Dominance</span><span className={styles.gVal}>{global.btcDominance?.toFixed(1)}%</span><div className={styles.bar}><div className={styles.barFill} style={{width:`${global.btcDominance}%`}}/></div></div>
          <div className={styles.gCard}><span className={styles.gLabel}>DeFi TVL</span><span className={styles.gVal}>{defi?.current?'$'+(defi.current/1e9).toFixed(1)+'B':'-'}</span></div>
          <div className={styles.gCard}><span className={styles.gLabel}>Fear &amp; Greed</span><span className={styles.gVal} style={{color:fgCol}}>{fgVal} - {fgLbl}</span></div>
        </div>
      )}

      {/* ════ 1. CRYPTO ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#B8860B'}}>
          <span className={styles.vertTag} style={{color:'#B8860B'}}>CRYPTO &amp; DIGITAL ASSETS</span>
          <span className={styles.vertDesc}>CoinGecko + Alternative.me</span>
        </div>
        <div className={styles.fgRow}>
          <div className={styles.fgBox}>
            <div className={styles.fgCircle} style={{borderColor:fgCol,background:`${fgCol}08`}}>
              <span className={styles.fgNum} style={{color:fgCol}}>{fgVal}</span>
              <span className={styles.fgTxt} style={{color:fgCol}}>{fgLbl}</span>
            </div>
          </div>
          {trending && (
            <div className={styles.trendBox}>
              <p className={styles.miniLabel}>TRENDING</p>
              {trending.slice(0,6).map((t:any,i:number)=>(
                <div key={i} className={styles.trendItem}>
                  <span className={styles.trendLeft}>{t.thumb&&<img src={t.thumb} alt="" className={styles.trendImg}/>}{t.name} <span className={styles.trendSym}>{t.symbol}</span></span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:pctColor(t.priceChange24h)}}>{formatPct(t.priceChange24h)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════ 2. MACRO ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#3B6CB4'}}>
          <span className={styles.vertTag} style={{color:'#3B6CB4'}}>MACRO &amp; CENTRAL BANKS</span>
          <span className={styles.vertDesc}>Federal Reserve Economic Data (FRED)</span>
        </div>
        <div className={styles.macroGrid}>
          {[
            {l:'Fed Funds Rate',v:macro.fedRate?macro.fedRate+'%':'-',c:'#3B6CB4'},
            {l:'10Y Treasury',v:macro.treasury10y?macro.treasury10y+'%':'-',c:'#3B6CB4'},
            {l:'2Y Treasury',v:macro.treasury2y?macro.treasury2y+'%':'-',c:'#3B6CB4'},
            {l:'Yield Curve (10Y-2Y)',v:macro.yieldSpread?macro.yieldSpread+'%':'-',c:ysColor},
            {l:'CPI Index',v:macro.cpi||'-',c:'#8B5E3C'},
            {l:'Unemployment',v:macro.unemployment?macro.unemployment+'%':'-',c:'#8B2252'},
            {l:'M2 Money Supply',v:macro.m2?'$'+(parseFloat(macro.m2)/1e3).toFixed(1)+'T':'-',c:'#3B6CB4'},
            {l:'US Dollar Index',v:macro.dollarIndex||'-',c:'#2D8F5E'},
          ].map(m=>(
            <div key={m.l} className={styles.mCard} style={{borderLeftColor:m.c}}>
              <p className={styles.mLabel} style={{color:m.c}}>{m.l}</p>
              <div className={styles.mVal}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════ 3. COMMODITIES ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#8B5E3C'}}>
          <span className={styles.vertTag} style={{color:'#8B5E3C'}}>COMMODITIES &amp; ENERGY</span>
          <span className={styles.vertDesc}>FRED (WTI Crude) + CoinGecko (PAX Gold)</span>
        </div>
        <div className={styles.commRow}>
          <div className={styles.commCard}>
            <p className={styles.miniLabel} style={{color:'#8B5E3C'}}>WTI CRUDE OIL</p>
            <div className={styles.commPrice}>${commodities.wtiOil?.toFixed(2) || '-'}<span className={styles.commUnit}>/barrel</span></div>
            {commodities.oilDate && <p className={styles.commDate}>{commodities.oilDate}</p>}
          </div>
          <div className={styles.commCard}>
            <p className={styles.miniLabel} style={{color:'#B8860B'}}>GOLD (PAXG PROXY)</p>
            <div className={styles.commPrice}>${commodities.gold?.toFixed(0) || '-'}<span className={styles.commUnit}>/oz</span></div>
            {commodities.goldChange!=null && <p className={styles.commDate} style={{color:pctColor(commodities.goldChange)}}>{formatPct(commodities.goldChange)}</p>}
          </div>
        </div>
      </div>

      {/* ════ 4. FX ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#2D8F5E'}}>
          <span className={styles.vertTag} style={{color:'#2D8F5E'}}>FX &amp; CURRENCIES</span>
          <span className={styles.vertDesc}>Open Exchange Rates + FRED Dollar Index</span>
        </div>
        <div className={styles.fxGrid}>
          {fxPairs.map(f=>(
            <div key={f.pair} className={styles.fxItem}><div className={styles.fxPair}>{f.pair}</div><div className={styles.fxVal}>{f.val}</div></div>
          ))}
        </div>
      </div>

      {/* ════ 5. GEOPOLITICS SIGNALS ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#8B2252'}}>
          <span className={styles.vertTag} style={{color:'#8B2252'}}>GEOPOLITICS &amp; POLICY SIGNALS</span>
          <span className={styles.vertDesc}>Recession indicators from FRED</span>
        </div>
        <div className={styles.geoGrid}>
          <div className={styles.geoCard}>
            <p className={styles.miniLabel}>YIELD CURVE SPREAD (10Y-2Y)</p>
            <div className={styles.geoVal} style={{color:ysColor}}>{macro.yieldSpread?macro.yieldSpread+'%':'-'}</div>
            <p className={styles.geoDesc}>{ysVal!==null?(ysVal<0?'INVERTED - Recession signal':'Positive - Normal conditions'):''}</p>
          </div>
          <div className={styles.geoCard}>
            <p className={styles.miniLabel}>US DOLLAR INDEX (DXY)</p>
            <div className={styles.geoVal}>{macro.dollarIndex||'-'}</div>
            <p className={styles.geoDesc}>Dollar strength impacts EM and commodities</p>
          </div>
          <div className={styles.geoCard}>
            <p className={styles.miniLabel}>M2 MONEY SUPPLY</p>
            <div className={styles.geoVal}>{macro.m2?'$'+(parseFloat(macro.m2)/1e3).toFixed(1)+'T':'-'}</div>
            <p className={styles.geoDesc}>Liquidity indicator for risk assets</p>
          </div>
        </div>
      </div>

      {/* ════ 6. MARKET STRUCTURE ════ */}
      <div className={styles.vertSection}>
        <div className={styles.vertHeader} style={{borderLeftColor:'#5B4FA0'}}>
          <span className={styles.vertTag} style={{color:'#5B4FA0'}}>MARKET STRUCTURE</span>
          <span className={styles.vertDesc}>DefiLlama - Total Value Locked by Chain</span>
        </div>
        {chains && (
          <div className={styles.chainGrid}>
            {chains.map((c:any)=>(
              <div key={c.name} className={styles.chainCard}>
                <span className={styles.chainName}>{c.name}</span>
                <span className={styles.chainTvl}>${(c.tvl/1e9).toFixed(1)}B</span>
                <div className={styles.bar}><div className={styles.barFill} style={{width:`${Math.min(100,(c.tvl/(chains[0]?.tvl||1))*100)}%`,background:'#5B4FA0'}}/></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ CHARTS ════ */}
      <MarketCharts
        sparklineCoins={coins} btcChart={btcC} ethChart={ethC}
        fedRateChart={fedC} fearGreedHistory={fg?.history}
        defiTvlChart={defi?.chart} oilChart={oilC}
        yieldCurveChart={yieldC} dxyChart={dxyC}
        btcPrice={coins?.[0]?.current_price} ethPrice={coins?.[1]?.current_price}
        btcChange={coins?.[0]?.price_change_percentage_24h} ethChange={coins?.[1]?.price_change_percentage_24h}
      />

      <div className={styles.attr}>
        Data: <a href="https://www.coingecko.com" target="_blank" rel="noopener">CoinGecko</a> |{' '}
        <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener">FRED</a> |{' '}
        <a href="https://open.er-api.com" target="_blank" rel="noopener">Open Exchange Rates</a> |{' '}
        <a href="https://alternative.me" target="_blank" rel="noopener">Alternative.me</a> |{' '}
        <a href="https://defillama.com" target="_blank" rel="noopener">DefiLlama</a>
      </div>
    </div>
  );
}
