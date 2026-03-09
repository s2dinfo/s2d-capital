import Link from 'next/link';
import { getCommodities, fredChart, fmtPct, pctCol } from '@/lib/api';
import CommCharts from './charts';

export const metadata = { title: 'Commodities & Energy | S2D Capital Insights' };
export const revalidate = 300;

export default async function CommoditiesPage() {
  const [commod, oilC, goldC] = await Promise.all([getCommodities(), fredChart('DCOILWTICO',60), fredChart('DCOILBRENTEU',60)]);
  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#8B5E3C',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'var(--navy)'}}>Commodities &amp; <em style={{fontStyle:'italic',color:'#8B5E3C'}}>Energy</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Oil prices, gold, and energy markets. Data from FRED &amp; CoinGecko.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:28}}>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'28px 24px',borderLeft:'4px solid #8B5E3C'}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#8B5E3C',marginBottom:6}}>WTI CRUDE OIL</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2.6rem',fontWeight:700,color:'var(--navy)',lineHeight:1}}>${commod.oil?.toFixed(2)||'-'}<span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:400,marginLeft:6}}>/barrel</span></div>
          {commod.oilDate&&<p style={{fontSize:'0.65rem',color:'var(--text-muted)',marginTop:4,fontFamily:'var(--font-mono)'}}>Last: {commod.oilDate}</p>}
        </div>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'28px 24px',borderLeft:'4px solid #B8860B'}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#B8860B',marginBottom:6}}>GOLD (PAXG PROXY)</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2.6rem',fontWeight:700,color:'var(--navy)',lineHeight:1}}>${commod.gold?.toFixed(0)||'-'}<span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:400,marginLeft:6}}>/oz</span></div>
          {commod.goldChg!=null&&<p style={{fontSize:'0.65rem',color:pctCol(commod.goldChg),marginTop:4,fontFamily:'var(--font-mono)'}}>{fmtPct(commod.goldChg)} 24h</p>}
        </div>
      </div>

      <CommCharts oilC={oilC} brentC={goldC} />
    </div>
  );
}
