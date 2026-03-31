import Link from 'next/link';
import { getMacro, fredChart, getWorldGdp, fmtP } from '@/lib/api';
import GeoCharts from './charts';

export const metadata = { title: 'Global Macro & Policy Signals | S2D Capital Insights' };
export const revalidate = 300;

export default async function GeopoliticsPage() {
  const [macro, yieldC, m2C, gdpData] = await Promise.all([getMacro(), fredChart('T10Y2Y',36), fredChart('M2SL',24), getWorldGdp()]);
  const ys = macro.yieldSpread?parseFloat(macro.yieldSpread):null;
  const ysCol = ys!==null?(ys<0?'#C0392B':ys<0.5?'#E67E22':'#2D8F5E'):'#9C9CAF';

  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#8B2252',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'var(--navy)'}}>Global Macro &amp; <em style={{fontStyle:'italic',color:'#8B2252'}}>Policy Signals</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Recession indicators, liquidity metrics, and macro policy signals that drive cross-market moves. Data from FRED &amp; World Bank.</p>

      {/* Signal cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14,marginBottom:28}}>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'22px 20px',borderTop:`4px solid ${ysCol}`}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#8B2252',marginBottom:6}}>YIELD CURVE SPREAD (10Y-2Y)</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2rem',fontWeight:700,color:ysCol,lineHeight:1,marginBottom:4}}>{macro.yieldSpread?macro.yieldSpread+'%':'-'}</div>
          <p style={{fontSize:'0.72rem',color:'var(--text-sec)',lineHeight:1.5}}>{ys!==null?(ys<0?'Yield curve is INVERTED — historically precedes recessions by 12-18 months.':'Yield curve is positive — no imminent recession signal.'):''}</p>
        </div>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'22px 20px',borderTop:'4px solid #2D8F5E'}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#2D8F5E',marginBottom:6}}>US DOLLAR INDEX</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2rem',fontWeight:700,color:'var(--navy)',lineHeight:1,marginBottom:4}}>{macro.dxy||'-'}</div>
          <p style={{fontSize:'0.72rem',color:'var(--text-sec)',lineHeight:1.5}}>Dollar strength impacts EM currencies, commodities pricing, and capital flows globally.</p>
        </div>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'22px 20px',borderTop:'4px solid #3B6CB4'}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#3B6CB4',marginBottom:6}}>M2 MONEY SUPPLY</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2rem',fontWeight:700,color:'var(--navy)',lineHeight:1,marginBottom:4}}>{macro.m2?'$'+(parseFloat(macro.m2)/1e3).toFixed(1)+'T':'-'}</div>
          <p style={{fontSize:'0.72rem',color:'var(--text-sec)',lineHeight:1.5}}>Global liquidity driver. M2 expansion historically correlates with BTC and risk asset rallies.</p>
        </div>
      </div>

      {/* World Bank GDP */}
      {gdpData&&gdpData.length>0&&(
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:20,marginBottom:28}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#8B2252',marginBottom:14}}>WORLD GDP — TOP ECONOMIES ({gdpData[0]?.year})</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
            {gdpData.sort((a:any,b:any)=>b.gdp-a.gdp).map((c:any)=>(
              <div key={c.code} style={{padding:'12px 14px',background:'var(--bg-cream)',border:'1px solid var(--border-lt)'}}>
                <div style={{fontSize:'0.72rem',fontWeight:600,color:'var(--navy)',marginBottom:2}}>{c.country}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:'1rem',fontWeight:500,color:'#8B2252'}}>{fmtP(c.gdp)}</div>
                <div style={{width:'100%',height:3,background:'var(--border-lt)',borderRadius:2,marginTop:4}}>
                  <div style={{height:'100%',background:'#8B2252',borderRadius:2,width:`${Math.min(100,(c.gdp/gdpData.sort((a:any,b:any)=>b.gdp-a.gdp)[0].gdp)*100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GeoCharts yieldC={yieldC} m2C={m2C} />
    </div>
  );
}
