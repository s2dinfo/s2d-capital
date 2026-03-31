import Link from 'next/link';
import { getDefiTvl, getChains, getGlobal } from '@/lib/api';
import StructCharts from './charts';

export const metadata = { title: 'Market Structure | S2D Capital Insights' };
export const revalidate = 300;

export default async function StructurePage() {
  const [defi, chains, global] = await Promise.all([getDefiTvl(), getChains(), getGlobal()]);
  return (
    <div style={{padding:'28px 48px 48px',minHeight:'80vh',overflowX:'hidden'}}>
      <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.15em',color:'var(--gold)',marginBottom:16,display:'inline-block'}}>&#8592; ALL MARKETS</Link>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:6,height:32,background:'#5B4FA0',borderRadius:2}}/>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'var(--navy)'}}>Market <em style={{fontStyle:'italic',color:'#5B4FA0'}}>Structure</em></h1>
      </div>
      <p style={{fontSize:'0.82rem',color:'var(--text-sec)',fontWeight:300,marginBottom:28}}>DeFi TVL by chain, protocol metrics, and on-chain ecosystem data. Data from DefiLlama &amp; CoinGecko.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:28}}>
        {[
          {l:'DeFi TVL',v:defi?.current?'$'+(defi.current/1e9).toFixed(1)+'B':'-'},
          {l:'Active Cryptos',v:global?.active?.toLocaleString()||'-'},
          {l:'BTC Dominance',v:(global?.btcDom?.toFixed(1)||'-')+'%'},
          {l:'ETH Dominance',v:(global?.ethDom?.toFixed(1)||'-')+'%'},
        ].map((x,i)=>(
          <div key={i} style={{background:'var(--navy)',padding:'14px 12px'}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',display:'block'}}>{x.l}</span>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'1.1rem',fontWeight:600,color:'#fff'}}>{x.v}</span>
          </div>
        ))}
      </div>

      {/* Chain TVL rankings */}
      {chains&&(
        <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:20,marginBottom:28}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#5B4FA0',marginBottom:14}}>TVL BY BLOCKCHAIN</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
            {chains.map((c:any,i:number)=>(
              <div key={c.name} style={{padding:'14px',background:'var(--bg-cream)',border:'1px solid var(--border-lt)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:'0.75rem',fontWeight:600,color:'var(--navy)'}}><span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'var(--text-muted)',marginRight:6}}>#{i+1}</span>{c.name}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'0.85rem',fontWeight:500,color:'#5B4FA0'}}>${(c.tvl/1e9).toFixed(1)}B</span>
                </div>
                <div style={{width:'100%',height:4,background:'var(--border-lt)',borderRadius:2}}>
                  <div style={{height:'100%',background:'#5B4FA0',borderRadius:2,width:`${Math.min(100,(c.tvl/(chains[0]?.tvl||1))*100)}%`,transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StructCharts defiChart={defi?.chart} />
    </div>
  );
}
