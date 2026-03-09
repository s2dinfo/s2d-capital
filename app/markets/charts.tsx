'use client';

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

  const fgColor = (v: number) => v <= 25 ? '#C0392B' : v <= 45 ? '#E67E22' : v <= 55 ? '#F1C40F' : v <= 75 ? '#82E0AA' : '#2D8F5E';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {/* BTC Chart */}
      {btcChart && (
        <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8860B' }}>BITCOIN / 30 DAYS</p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E' }}>
                ${btcPrice?.toLocaleString() || '-'}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: pCol(btcChange) }}>
              {pFmt(btcChange)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={btcChart}>
              <defs>
                <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8860B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={fmt} domain={['dataMin - 2000', 'dataMax + 2000']} />
              <Tooltip contentStyle={{ fontSize: '0.75rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} formatter={(v: number) => ['$' + v.toLocaleString(), 'BTC']} />
              <Area type="monotone" dataKey="price" stroke="#B8860B" strokeWidth={2} fill="url(#btcGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ETH Chart */}
      {ethChart && (
        <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3B6CB4' }}>ETHEREUM / 30 DAYS</p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E' }}>
                ${ethPrice?.toLocaleString() || '-'}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: pCol(ethChange) }}>
              {pFmt(ethChange)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ethChart}>
              <defs>
                <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6CB4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B6CB4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => '$' + v} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip contentStyle={{ fontSize: '0.75rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2 }} formatter={(v: number) => ['$' + v.toLocaleString(), 'ETH']} />
              <Area type="monotone" dataKey="price" stroke="#3B6CB4" strokeWidth={2} fill="url(#ethGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fed Rate Chart */}
      {fedRateChart && (
        <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3B6CB4' }}>FED FUNDS RATE / 2Y</p>
            <p style={{ fontSize: '0.68rem', color: '#6B6B82', marginTop: 2 }}>Federal Reserve interest rate history</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={fedRateChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v + '%'} />
              <Tooltip contentStyle={{ fontSize: '0.75rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2 }} formatter={(v: number) => [v + '%', 'Fed Rate']} />
              <Line type="stepAfter" dataKey="value" stroke="#3B6CB4" strokeWidth={2} dot={{ r: 2, fill: '#3B6CB4' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fear & Greed History */}
      {fearGreedHistory && (
        <div style={{ background: '#FDFCF9', border: '1px solid #F0EDE6', padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8860B' }}>FEAR &amp; GREED / 14 DAYS</p>
            <p style={{ fontSize: '0.68rem', color: '#6B6B82', marginTop: 2 }}>Crypto market sentiment history</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fearGreedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9C9CAF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: '0.75rem', background: '#fff', border: '1px solid #F0EDE6', borderRadius: 2 }} formatter={(v: number) => [v, v <= 25 ? 'Extreme Fear' : v <= 45 ? 'Fear' : v <= 55 ? 'Neutral' : v <= 75 ? 'Greed' : 'Extreme Greed']} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} fill="#B8860B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
