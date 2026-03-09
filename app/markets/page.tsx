import Link from 'next/link';
import { getCryptoPrices, getMacro, getCommodities, getFx, getFearGreed, getGlobal, getDefiTvl, fmtP, fmtPct, pctCol } from '@/lib/api';

export const metadata = { title: 'Markets | S2D Capital Insights' };
export const revalidate = 300;

export default async function MarketsHub() {
  const [prices, macro, commod, fx, fg, global, defi] = await Promise.all([
    getCryptoPrices(), getMacro(), getCommodities(), getFx(), getFearGreed(), getGlobal(), getDefiTvl(),
  ]);

  const btc = prices?.bitcoin;
  const fgVal = fg?.current?.value ?? 50;
  const fgCol = fgVal<=25?'#C0392B':fgVal<=45?'#E67E22':fgVal<=55?'#F1C40F':fgVal<=75?'#82E0AA':'#2D8F5E';

  const cards = [
    { href: '/markets/crypto', color: '#B8860B', tag: 'CRYPTO & DIGITAL ASSETS', metric: fmtP(btc?.usd), label: 'Bitcoin', sub: fmtPct(btc?.usd_24h_change), subCol: pctCol(btc?.usd_24h_change), extra: `Fear & Greed: ${fgVal}`, extraCol: fgCol },
    { href: '/markets/macro', color: '#3B6CB4', tag: 'MACRO & CENTRAL BANKS', metric: macro.fedRate ? macro.fedRate + '%' : '-', label: 'Fed Funds Rate', sub: `10Y: ${macro.t10y||'-'}%`, subCol: '#3B6CB4', extra: `Unemployment: ${macro.unemp||'-'}%`, extraCol: '#8B2252' },
    { href: '/markets/commodities', color: '#8B5E3C', tag: 'COMMODITIES & ENERGY', metric: commod.oil ? '$'+commod.oil.toFixed(2) : '-', label: 'WTI Crude Oil', sub: 'per barrel', subCol: '#8B5E3C', extra: `Gold: ${commod.gold?'$'+commod.gold.toFixed(0):'-'}`, extraCol: '#B8860B' },
    { href: '/markets/fx', color: '#2D8F5E', tag: 'FX & CURRENCIES', metric: fx ? (1/fx.EUR).toFixed(4) : '-', label: 'EUR/USD', sub: `USD/JPY: ${fx?.JPY?.toFixed(1)||'-'}`, subCol: '#2D8F5E', extra: `DXY: ${macro.dxy||'-'}`, extraCol: '#2D8F5E' },
    { href: '/markets/geopolitics', color: '#8B2252', tag: 'GEOPOLITICS & POLICY', metric: macro.yieldSpread ? macro.yieldSpread + '%' : '-', label: 'Yield Curve (10Y-2Y)', sub: parseFloat(macro.yieldSpread||'0')<0?'INVERTED':'Positive', subCol: parseFloat(macro.yieldSpread||'0')<0?'#C0392B':'#2D8F5E', extra: `M2: $${macro.m2?(parseFloat(macro.m2)/1e3).toFixed(1)+'T':'-'}`, extraCol: '#3B6CB4' },
    { href: '/markets/structure', color: '#5B4FA0', tag: 'MARKET STRUCTURE', metric: defi?.current ? '$'+(defi.current/1e9).toFixed(1)+'B' : '-', label: 'DeFi TVL', sub: 'Total Value Locked', subCol: '#5B4FA0', extra: `${global?.active?.toLocaleString()||'-'} active cryptos`, extraCol: '#9C9CAF' },
  ];

  return (
    <div style={{padding:'32px 48px 48px',minHeight:'80vh',maxWidth:'100%',overflowX:'hidden'}}>
      <div style={{marginBottom:32}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>MARKET INTELLIGENCE</p>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:'var(--navy)',marginBottom:8}}>Choose Your <em style={{fontStyle:'italic',color:'var(--gold)'}}>Vertical</em></h1>
        <p style={{fontSize:'0.88rem',color:'var(--text-sec)',fontWeight:300}}>Live data across all six verticals. Click any section to explore.</p>
      </div>

      {/* Global bar */}
      {global && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8,marginBottom:28}}>
          {[
            {l:'Total Crypto MCap',v:fmtP(global.totalMcap),c:pctCol(global.mcapChg),s:fmtPct(global.mcapChg)},
            {l:'24h Volume',v:fmtP(global.vol24h)},
            {l:'BTC Dominance',v:(global.btcDom?.toFixed(1)||'-')+'%'},
            {l:'DeFi TVL',v:defi?.current?'$'+(defi.current/1e9).toFixed(1)+'B':'-'},
            {l:'Fear & Greed',v:String(fgVal),c:fgCol,s:fg?.current?.label},
          ].map((item,i)=>(
            <div key={i} style={{background:'var(--navy)',padding:'14px 12px'}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',display:'block'}}>{item.l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.95rem',fontWeight:600,color:'#fff',display:'block'}}>{item.v}</span>
              {item.s&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:item.c||'rgba(255,255,255,0.5)'}}>{item.s}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Vertical Cards Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16}}>
        {cards.map((card)=>(
          <Link key={card.href} href={card.href} style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'28px 24px',display:'block',transition:'all 0.4s',position:'relative',overflow:'hidden',textDecoration:'none',color:'inherit',borderTop:`4px solid ${card.color}`}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.15em',fontWeight:600,color:card.color,marginBottom:16}}>{card.tag}</p>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'2.2rem',fontWeight:700,color:'var(--navy)',lineHeight:1,marginBottom:4}}>{card.metric}</div>
            <div style={{fontSize:'0.82rem',color:'var(--text-sec)',marginBottom:12}}>{card.label}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:14,borderTop:'1px solid var(--border-lt)'}}>
              <div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:card.subCol,fontWeight:500}}>{card.sub}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:card.extraCol,display:'block',marginTop:2}}>{card.extra}</span>
              </div>
              <span style={{fontSize:'1.2rem',color:card.color,fontWeight:300}}>&#8594;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
