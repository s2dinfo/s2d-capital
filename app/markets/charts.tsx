'use client';

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './charts.module.css';

interface Props {
  btcChart: any[] | null;
  ethChart: any[] | null;
  fedRateChart: any[] | null;
  fearGreedHistory: any[] | null;
  btcPrice?: number;
  ethPrice?: number;
  btcChange?: number;
  ethChange?: number;
}

export default function MarketCharts({ btcChart, ethChart, fedRateChart, fearGreedHistory, btcPrice, ethPrice, btcChange, ethChange }: Props) {
  const fmt = (n: number) => n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'k' : '$' + n;
  const pCol = (v?: number) => v && v > 0 ? '#2D8F5E' : '#C0392B';
  const pFmt = (v?: number) => v ? (v > 0 ? '+' : '') + v.toFixed(1) + '%' : '-';

  const tipStyle = { fontSize: '0.72rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };

  return (
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
    </div>
  );
}
