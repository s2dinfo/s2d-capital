import Link from 'next/link';
import { getCryptoMarkets, getGlobal, getFearGreed, getTrending, getCoinChart, getDefiTvl, fmtP, fmtPct, pctCol } from '@/lib/api';
import CryptoCharts from './charts';

export const metadata = { title: 'Crypto & Digital Assets | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function CryptoPage() {
  const [coins, global, fg, trending, btcC, ethC, solC, defi] = await Promise.all([
    getCryptoMarkets(), getGlobal(), getFearGreed(), getTrending(),
    getCoinChart('bitcoin'), getCoinChart('ethereum'), getCoinChart('solana'), getDefiTvl(),
  ]);

  const fgVal = fg?.current?.value??50;
  const fgLbl = fg?.current?.label??'Neutral';
  const fgCol = fgVal<=25?'#C0392B':fgVal<=45?'#E67E22':fgVal<=55?'#F1C40F':fgVal<=75?'#82E0AA':'#2D8F5E';

  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#B8860B',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'var(--navy)'}}>Crypto &amp; <em style={{fontStyle:'italic',color:'#B8860B'}}>Digital Assets</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>Live prices, charts, sentiment, and trending coins. Data from CoinGecko &amp; Alternative.me.</p>

      {/* Global + Fear & Greed row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,marginBottom:24}}>
        {global && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8}}>
            {[{l:'Total MCap',v:fmtP(global.totalMcap),s:fmtPct(global.mcapChg),c:pctCol(global.mcapChg)},{l:'24h Volume',v:fmtP(global.vol24h)},{l:'BTC Dom',v:(global.btcDom?.toFixed(1)||'-')+'%'},{l:'ETH Dom',v:(global.ethDom?.toFixed(1)||'-')+'%'},{l:'DeFi TVL',v:defi?.current?'$'+(defi.current/1e9).toFixed(1)+'B':'-'}].map((x,i)=>(
              <div key={i} style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'14px 12px'}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#B8860B',display:'block',marginBottom:3}}>{x.l}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:'1.1rem',fontWeight:600,color:'var(--navy)'}}>{x.v}</span>
                {x.s&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:x.c,display:'block'}}>{x.s}</span>}
              </div>
            ))}
          </div>
        )}
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'20px 28px',textAlign:'center',minWidth:140}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#B8860B',marginBottom:10}}>FEAR &amp; GREED</p>
          <div style={{width:90,height:90,borderRadius:'50%',border:`5px solid ${fgCol}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto',background:`${fgCol}08`}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'1.8rem',fontWeight:700,color:fgCol,lineHeight:1}}>{fgVal}</span>
            <span style={{fontSize:'0.45rem',fontWeight:600,textTransform:'uppercase',color:fgCol}}>{fgLbl}</span>
          </div>
        </div>
      </div>

      {/* Charts + Coins */}
      <CryptoCharts coins={coins} btcChart={btcC} ethChart={ethC} solChart={solC} fgHistory={fg?.history} defiChart={defi?.chart} trending={trending} />
    </div>
  );
}
