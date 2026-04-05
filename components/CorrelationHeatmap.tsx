'use client';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// Realistic 30-day rolling correlations (manually curated, update periodically)
const assets = ['BTC', 'ETH', 'SOL', 'Gold', 'S&P 500', 'Oil', 'DXY'];
const correlations = [
  // BTC    ETH    SOL    Gold   SPX    Oil    DXY
  [ 1.00,  0.85,  0.78,  0.25,  0.42,  0.15, -0.35], // BTC
  [ 0.85,  1.00,  0.82,  0.20,  0.38,  0.12, -0.30], // ETH
  [ 0.78,  0.82,  1.00,  0.15,  0.35,  0.10, -0.28], // SOL
  [ 0.25,  0.20,  0.15,  1.00,  0.10,  0.30, -0.45], // Gold
  [ 0.42,  0.38,  0.35,  0.10,  1.00,  0.20, -0.15], // S&P 500
  [ 0.15,  0.12,  0.10,  0.30,  0.20,  1.00,  0.05], // Oil
  [-0.35, -0.30, -0.28, -0.45, -0.15,  0.05,  1.00], // DXY
];

export default function CorrelationHeatmap() {
  // Build data array for ECharts heatmap
  const data: [number, number, number][] = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      data.push([j, i, correlations[i][j]]);
    }
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const x = assets[params.data[0]];
        const y = assets[params.data[1]];
        const val = params.data[2].toFixed(2);
        return `<strong>${y} &times; ${x}</strong><br/>Correlation: ${val}`;
      },
      backgroundColor: 'rgba(15,15,35,0.95)',
      borderColor: 'rgba(184,134,11,0.3)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    grid: {
      top: 10,
      bottom: 60,
      left: 70,
      right: 20,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: assets,
      splitArea: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        rotate: 0,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: assets,
      splitArea: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#C0392B', '#2c1a1a', '#1a1a2e', '#1a2a1a', '#2D8F5E'],
      },
      textStyle: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
      text: ['Strong +', 'Strong \u2212'],
    },
    series: [{
      type: 'heatmap',
      data,
      label: {
        show: true,
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
        formatter: (params: any) => params.data[2].toFixed(2),
      },
      emphasis: {
        itemStyle: {
          borderColor: '#D4B85C',
          borderWidth: 2,
        },
      },
      itemStyle: {
        borderColor: 'rgba(26,26,46,0.8)',
        borderWidth: 2,
        borderRadius: 3,
      },
    }],
  };

  return (
    <div style={{ background: 'rgba(17,25,40,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.15em', color: '#B8860B', fontWeight: 600, textTransform: 'uppercase' as const }}>Asset Correlation Matrix</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginLeft: 12 }}>30-day rolling</span>
      </div>
      <ReactECharts option={option} style={{ height: 380, width: '100%' }} opts={{ renderer: 'canvas' }} theme="dark" />
    </div>
  );
}
