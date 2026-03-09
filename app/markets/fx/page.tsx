import Link from 'next/link';
import { getFx, getMacro, fredChart } from '@/lib/api';
import FxCharts from './charts';

export const metadata = { title: 'FX & Currencies | S2D Capital Insights' };
export const revalidate = 300;

export default async function FxPage() {
  const [fx, macro, dxyC] = await Promise.all([getFx(), getMacro(), fredChart('DTWEXBGS',30)]);
  const pairs = fx ? [
    {p:'EUR/USD',v:(1/fx.EUR).toFixed(4)},{p:'GBP/USD',v:(1/fx.GBP).toFixed(4)},{p:'USD/JPY',v:fx.JPY?.toFixed(2)},{p:'USD/CHF',v:fx.CHF?.toFixed(4)},
    {p:'AUD/USD',v:(1/fx.AUD).toFixed(4)},{p:'USD/CAD',v:fx.CAD?.toFixed(4)},{p:'NZD/USD',v:(1/fx.NZD).toFixed(4)},{p:'EUR/GBP',v:(fx.GBP/fx.EUR).toFixed(4)},
    {p:'USD/CNY',v:fx.CNY?.toFixed(4)},{p:'USD/TRY',v:fx.TRY?.toFixed(2)},{p:'USD/BRL',v:fx.BRL?.toFixed(4)},{p:'USD/INR',v:fx.INR?.toFixed(2)},
  ] : [];

  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#2D8F5E',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'var(--navy)'}}>FX &amp; <em style={{fontStyle:'italic',color:'#2D8F5E'}}>Currencies</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Live exchange rates for 12 major pairs. Dollar Index tracking. Data from Open Exchange Rates &amp; FRED.</p>

      {macro.dxy&&<div style={{background:'var(--navy)',padding:'18px 24px',marginBottom:20,display:'inline-block'}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'rgba(255,255,255,0.4)',display:'block'}}>US DOLLAR INDEX (DXY)</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'1.8rem',fontWeight:600,color:'#fff'}}>{macro.dxy}</span>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:28}}>
        {pairs.map(f=>(
          <div key={f.p} style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'14px 14px'}}>
            <div style={{fontSize:'0.68rem',fontWeight:700,color:'var(--navy)',marginBottom:3}}>{f.p}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'1.1rem',fontWeight:500,color:'#2D8F5E'}}>{f.v}</div>
          </div>
        ))}
      </div>

      <FxCharts dxyC={dxyC} />
    </div>
  );
}
