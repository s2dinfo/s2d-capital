'use client';

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Sparklines, SparklinesCurve } from 'recharts';
import styles from './charts.module.css';

interface Props {
  sparklineCoins: any[] | null;
  btcChart: any[] | null;
  ethChart: any[] | null;
  fedRateChart: any[] | null;
  fearGreedHistory: any[] | null;
  defiTvlChart: any[] | null;
  btcPrice?: number;
  ethPrice?: number;
  btcChange?: number;
  ethChange?: number;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 10) return null;
  const sampled = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 40)) === 0);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const h = 32;
  const w = 100;
  const points = sampled.map((v, i) => `${(i / (sampled.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketCharts({ sparklineCoins, btcChart, ethChart, fedRateChart, fearGreedHistory, defiTvlChart, btcPrice, ethPrice, btcChange, ethChange }: Props) {
  const fmt = (n: number) => n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'k' : '$' + n;
  const pCol = (v?: number) => v && v > 0 ? '#2D8F5E' : '#C0392B';
  const pFmt = (v?: number) => v ? (v > 0 ? '+' : '') + v.toFixed(1) + '%' : '-';
  const fmtP = (n: number) => {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 1) return '$' + n.toFixed(2);
    return '$' + n.toFixed(4);
  };

  const tipStyle = { fontSize: '0.72rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };

  return (
    <>
      {/* SPARKLINE CRYPTO CARDS */}
      {sparklineCoins && (
        <div className={styles.coinGrid}>
          {sparklineCoins.map((coin: any) => {
            const sparkData = coin.sparkline_in_7d?.price || [];
            const isUp = coin.price_change_percentage_24h > 0;
            const color = isUp ? '#2D8F5E' : '#C0392B';
            return (
              <div key={coin.id} className={styles.coinCard}>
                <div className={styles.coinTop}>
                  <div className={styles.coinInfo}>
                    {coin.image && <img src={coin.image} alt={coin.symbol} className={styles.coinImg} />}
                    <div>
                      <span className={styles.coinSym}>{coin.symbol?.toUpperCase()}</span>
                      <span className={styles.coinName}>{coin.name}</span>
                    </div>
                  </div>
                  <span className={styles.coinChg} style={{ color }}>{pFmt(coin.price_change_percentage_24h)}</span>
                </div>
                <div className={styles.coinMid}>
                  <span className={styles.coinPrice}>{fmtP(coin.current_price)}</span>
                  <MiniSparkline data={sparkData} color={color} />
                </div>
                <div className={styles.coinCap}>MCap {fmtP(coin.market_cap)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHARTS GRID */}
      <div className={styles.grid}>
        {btcChart && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartLabel} style={{ color: '#B8860B' }}>BITCOIN / 30 DAYS</p>
                <span className={styles.chartPrice}>${btcPrice?.toLocaleString() || '-'}</span>
              </div>
              <span className={styles.chartChg} style={{ color: pCol(btcChange) }}>{pFmt(btcChange)}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={btcChart}>
                <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B8860B" stopOpacity={0.2}/><stop offset="95%" stopColor="#B8860B" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={fmt} domain={['dataMin-2000','dataMax+2000']} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => ['$'+v.toLocaleString(),'BTC']} />
                <Area type="monotone" dataKey="price" stroke="#B8860B" strokeWidth={2} fill="url(#bg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {ethChart && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartLabel} style={{ color: '#3B6CB4' }}>ETHEREUM / 30 DAYS</p>
                <span className={styles.chartPrice}>${ethPrice?.toLocaleString() || '-'}</span>
              </div>
              <span className={styles.chartChg} style={{ color: pCol(ethChange) }}>{pFmt(ethChange)}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ethChart}>
                <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B6CB4" stopOpacity={0.2}/><stop offset="95%" stopColor="#3B6CB4" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => '$'+v} domain={['dataMin-100','dataMax+100']} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => ['$'+v.toLocaleString(),'ETH']} />
                <Area type="monotone" dataKey="price" stroke="#3B6CB4" strokeWidth={2} fill="url(#eg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {fedRateChart && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartLabel} style={{ color: '#3B6CB4' }}>FED FUNDS RATE / 2Y</p>
                <span className={styles.chartSub}>Federal Reserve interest rate</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={fedRateChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v+'%'} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => [v+'%','Fed Rate']} />
                <Line type="stepAfter" dataKey="value" stroke="#3B6CB4" strokeWidth={2} dot={{ r: 2, fill: '#3B6CB4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {fearGreedHistory && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartLabel}>FEAR &amp; GREED / 14 DAYS</p>
                <span className={styles.chartSub}>Crypto market sentiment</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fearGreedHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#9C9CAF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => [v, v<=25?'Extreme Fear':v<=45?'Fear':v<=55?'Neutral':v<=75?'Greed':'Extreme Greed']} />
                <Bar dataKey="value" radius={[2,2,0,0]} fill="#B8860B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* DeFi TVL Chart */}
        {defiTvlChart && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartLabel} style={{ color: '#5B4FA0' }}>DEFI TVL / 30 DAYS</p>
                <span className={styles.chartSub}>Total Value Locked across all chains</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={defiTvlChart}>
                <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2}/><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => '$'+v+'B'} />
                <Tooltip contentStyle={tipStyle} formatter={(v: number) => ['$'+v+'B','TVL']} />
                <Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#tg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}
