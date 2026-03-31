import Link from 'next/link';
import { getMacro, fredChart } from '@/lib/api';
import MacroCharts from './charts';

export const metadata = { title: 'Macro & Central Banks | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function MacroPage() {
  const [macro, fedC, yieldC, cpiC, unempC] = await Promise.all([
    getMacro(), fredChart('FEDFUNDS',24), fredChart('T10Y2Y',24), fredChart('CPIAUCSL',24), fredChart('UNRATE',24),
  ]);
  const ys = macro.yieldSpread ? parseFloat(macro.yieldSpread) : null;
  const ysCol = ys!==null?(ys<0?'#C0392B':ys<0.5?'#E67E22':'#2D8F5E'):'#9C9CAF';

  const cards = [
    {l:'Fed Funds Rate',v:macro.fedRate?macro.fedRate+'%':'-',c:'#3B6CB4',s:'Federal Reserve target rate'},
    {l:'10Y Treasury',v:macro.t10y?macro.t10y+'%':'-',c:'#3B6CB4',s:'US government bond yield'},
    {l:'2Y Treasury',v:macro.t2y?macro.t2y+'%':'-',c:'#3B6CB4',s:'Short-term bond yield'},
    {l:'Yield Curve (10Y-2Y)',v:macro.yieldSpread?macro.yieldSpread+'%':'-',c:ysCol,s:ys!==null?(ys<0?'INVERTED — Recession signal':'Positive — Normal'):''},
    {l:'CPI Index',v:macro.cpi||'-',c:'#8B5E3C',s:'Consumer Price Index'},
    {l:'Unemployment',v:macro.unemp?macro.unemp+'%':'-',c:'#8B2252',s:'US labor market'},
    {l:'M2 Money Supply',v:macro.m2?'$'+(parseFloat(macro.m2)/1e3).toFixed(1)+'T':'-',c:'#3B6CB4',s:'Broad money supply'},
    {l:'US Dollar Index',v:macro.dxy||'-',c:'#2D8F5E',s:'Trade-weighted dollar strength'},
  ];

  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#3B6CB4',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'#fff'}}>Macro &amp; <em style={{fontStyle:'italic',color:'#3B6CB4'}}>Central Banks</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Federal Reserve data, treasury yields, inflation metrics, and recession indicators. Data from FRED.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginBottom:28}}>
        {cards.map(m=>(
          <div key={m.l} style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'18px 16px',borderLeft:`4px solid ${m.c}`}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.12em',textTransform:'uppercase',color:m.c,marginBottom:3}}>{m.l}</p>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'1.5rem',fontWeight:600,color:'#fff',lineHeight:1,marginBottom:3}}>{m.v}</div>
            <p style={{fontSize:'0.62rem',color:'var(--text-muted)'}}>{m.s}</p>
          </div>
        ))}
      </div>

      <MacroCharts fedC={fedC} yieldC={yieldC} cpiC={cpiC} unempC={unempC} />
    </div>
  );
}
