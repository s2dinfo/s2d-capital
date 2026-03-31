import Link from 'next/link';
import { getCommodities, fredChart, fmtPct, pctCol } from '@/lib/api';
import CommCharts from './charts';

export const metadata = { title: 'Commodities & Energy | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function CommoditiesPage() {
  const [commod, oilC, brentC] = await Promise.all([getCommodities(), fredChart('DCOILWTICO',60), fredChart('DCOILBRENTEU',60)]);
  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#8B5E3C',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'#fff'}}>Commodities &amp; <em style={{fontStyle:'italic',color:'#8B5E3C'}}>Energy</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Oil, gold, natural gas, and energy markets. Data from FRED &amp; Yahoo Finance.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:28}}>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'24px 20px',borderLeft:'4px solid #8B5E3C',borderRadius:4}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#8B5E3C',marginBottom:6}}>WTI CRUDE OIL</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1}}>${commod.oil?.toFixed(2)||'-'}<span style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:400,marginLeft:6}}>/bbl</span></div>
          {commod.oilChg!=null&&<p style={{fontSize:'0.65rem',color:pctCol(commod.oilChg),marginTop:4,fontFamily:'var(--font-mono)'}}>{fmtPct(commod.oilChg)} 24h</p>}
        </div>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'24px 20px',borderLeft:'4px solid #B8860B',borderRadius:4}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#B8860B',marginBottom:6}}>GOLD FUTURES</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1}}>${commod.gold?.toFixed(0)||'-'}<span style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:400,marginLeft:6}}>/oz</span></div>
          {commod.goldChg!=null&&<p style={{fontSize:'0.65rem',color:pctCol(commod.goldChg),marginTop:4,fontFamily:'var(--font-mono)'}}>{fmtPct(commod.goldChg)} 24h</p>}
        </div>
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'24px 20px',borderLeft:'4px solid #D4A843',borderRadius:4}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#D4A843',marginBottom:6}}>NATURAL GAS</p>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'2.2rem',fontWeight:700,color:'#fff',lineHeight:1}}>${commod.natgas?.toFixed(3)||'-'}<span style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:400,marginLeft:6}}>/MMBtu</span></div>
          {commod.natgasChg!=null&&<p style={{fontSize:'0.65rem',color:pctCol(commod.natgasChg),marginTop:4,fontFamily:'var(--font-mono)'}}>{fmtPct(commod.natgasChg)} 24h</p>}
        </div>
      </div>

      <CommCharts oilC={oilC} brentC={brentC} />
    </div>
  );
}
