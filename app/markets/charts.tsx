'use client';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './charts.module.css';

interface Props {
  sparklineCoins: any[] | null; btcChart: any[] | null; ethChart: any[] | null;
  fedRateChart: any[] | null; fearGreedHistory: any[] | null; defiTvlChart: any[] | null;
  oilChart: any[] | null; yieldCurveChart: any[] | null; dxyChart: any[] | null;
  btcPrice?: number; ethPrice?: number; btcChange?: number; ethChange?: number;
}

function Spark({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 10) return null;
  const s = data.filter((_,i) => i % Math.max(1,Math.floor(data.length/40)) === 0);
  const mn = Math.min(...s), mx = Math.max(...s), rg = mx-mn||1;
  const pts = s.map((v,i) => `${(i/(s.length-1))*100},${32-((v-mn)/rg)*32}`).join(' ');
  return <svg width={100} height={32} viewBox="0 0 100 32" style={{display:'block'}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function MarketCharts({ sparklineCoins, btcChart, ethChart, fedRateChart, fearGreedHistory, defiTvlChart, oilChart, yieldCurveChart, dxyChart, btcPrice, ethPrice, btcChange, ethChange }: Props) {
  const pC = (v?:number) => v&&v>0?'#2D8F5E':'#C0392B';
  const pF = (v?:number) => v?(v>0?'+':'')+v.toFixed(1)+'%':'-';
  const fP = (n:number) => { if(n>=1e12) return '$'+(n/1e12).toFixed(1)+'T'; if(n>=1e9) return '$'+(n/1e9).toFixed(1)+'B'; if(n>=1000) return '$'+n.toLocaleString('en-US',{maximumFractionDigits:0}); if(n>=1) return '$'+n.toFixed(2); return '$'+n.toFixed(4); };
  const tip = {fontSize:'0.72rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'};

  return (
    <div className={styles.chartsSection}>
      <p className={styles.chartsTitle}>INTERACTIVE CHARTS</p>

      {/* Sparkline crypto cards */}
      {sparklineCoins && (
        <div className={styles.coinGrid}>
          {sparklineCoins.map((c:any) => {
            const sp = c.sparkline_in_7d?.price||[];
            const up = c.price_change_percentage_24h > 0;
            const col = up ? '#2D8F5E' : '#C0392B';
            return (
              <div key={c.id} className={styles.coinCard}>
                <div className={styles.coinTop}>
                  <div className={styles.coinInfo}>{c.image&&<img src={c.image} alt="" className={styles.coinImg}/>}<div><span className={styles.coinSym}>{c.symbol?.toUpperCase()}</span><span className={styles.coinName}>{c.name}</span></div></div>
                  <span className={styles.coinChg} style={{color:col}}>{pF(c.price_change_percentage_24h)}</span>
                </div>
                <div className={styles.coinMid}><span className={styles.coinPrice}>{fP(c.current_price)}</span><Spark data={sp} color={col}/></div>
                <div className={styles.coinCap}>MCap {fP(c.market_cap)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart grid */}
      <div className={styles.grid}>
        {btcChart && <ChartBox label="BITCOIN / 30 DAYS" color="#B8860B" data={btcChart} dataKey="price" price={btcPrice} change={btcChange} yFmt={(v:number)=>(v/1000).toFixed(0)+'k'} tipFmt="BTC" gradId="bg" />}
        {ethChart && <ChartBox label="ETHEREUM / 30 DAYS" color="#3B6CB4" data={ethChart} dataKey="price" price={ethPrice} change={ethChange} yFmt={(v:number)=>'$'+v} tipFmt="ETH" gradId="eg" />}
        {oilChart && <ChartBox label="WTI CRUDE OIL / 60 DAYS" color="#8B5E3C" data={oilChart} dataKey="value" yFmt={(v:number)=>'$'+v} tipFmt="WTI" gradId="og" sub="FRED - US Energy" />}
        {fedRateChart && (
          <div className={styles.chartCard}>
            <div className={styles.cHeader}><div><p className={styles.cLabel} style={{color:'#3B6CB4'}}>FED FUNDS RATE / 2Y</p><span className={styles.cSub}>Macro - Interest rates</span></div></div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={fedRateChart}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>v+'%'}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v+'%','Fed Rate']}/><Line type="stepAfter" dataKey="value" stroke="#3B6CB4" strokeWidth={2} dot={{r:2,fill:'#3B6CB4'}}/></LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {yieldCurveChart && (
          <div className={styles.chartCard}>
            <div className={styles.cHeader}><div><p className={styles.cLabel} style={{color:'#8B2252'}}>YIELD CURVE (10Y-2Y) / 2Y</p><span className={styles.cSub}>Geopolitics - Recession indicator</span></div></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={yieldCurveChart}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B2252" stopOpacity={0.2}/><stop offset="95%" stopColor="#8B2252" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>v+'%'}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v+'%','Spread']}/><Area type="monotone" dataKey="value" stroke="#8B2252" strokeWidth={2} fill="url(#yg)"/></AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {dxyChart && (
          <div className={styles.chartCard}>
            <div className={styles.cHeader}><div><p className={styles.cLabel} style={{color:'#2D8F5E'}}>US DOLLAR INDEX / 30 DAYS</p><span className={styles.cSub}>FX - Dollar strength</span></div></div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dxyChart}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v.toFixed(1),'DXY']}/><Line type="monotone" dataKey="value" stroke="#2D8F5E" strokeWidth={2} dot={false}/></LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {fearGreedHistory && (
          <div className={styles.chartCard}>
            <div className={styles.cHeader}><div><p className={styles.cLabel}>FEAR &amp; GREED / 14 DAYS</p><span className={styles.cSub}>Crypto - Market sentiment</span></div></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fearGreedHistory}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:8,fill:'#9C9CAF'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} domain={[0,100]}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v,v<=25?'Extreme Fear':v<=45?'Fear':v<=55?'Neutral':v<=75?'Greed':'Extreme Greed']}/><Bar dataKey="value" radius={[2,2,0,0]} fill="#B8860B"/></BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {defiTvlChart && (
          <div className={styles.chartCard}>
            <div className={styles.cHeader}><div><p className={styles.cLabel} style={{color:'#5B4FA0'}}>DEFI TVL / 30 DAYS</p><span className={styles.cSub}>Structure - Total Value Locked</span></div></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={defiTvlChart}><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2}/><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>'$'+v+'B'}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v+'B','TVL']}/><Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#tg)"/></AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartBox({label,color,data,dataKey,price,change,yFmt,tipFmt,gradId,sub}:{label:string;color:string;data:any[];dataKey:string;price?:number;change?:number;yFmt:(v:number)=>string;tipFmt:string;gradId:string;sub?:string}) {
  const tip = {fontSize:'0.72rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2};
  return (
    <div className={styles.chartCard}>
      <div className={styles.cHeader}>
        <div><p className={styles.cLabel} style={{color}}>{label}</p>{price&&<span className={styles.cPrice}>${price.toLocaleString()}</span>}{sub&&<span className={styles.cSub}>{sub}</span>}</div>
        {change!=null&&<span className={styles.cChg} style={{color:change>0?'#2D8F5E':'#C0392B'}}>{change>0?'+':''}{change.toFixed(1)}%</span>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.2}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/>
          <XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
          <YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={yFmt}/>
          <Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v.toLocaleString(),tipFmt]}/>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradId})`}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
