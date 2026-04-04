'use client';
import { useMarketData } from '@/hooks/useMarketData';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { VERTICALS } from '@/lib/verticals';
import { articles } from '@/lib/articles';
import ParticleField from '@/components/ParticleField';
import AnimatedCounter from '@/components/AnimatedCounter';
import TVCandlestickChart, { generateMockCandles } from '@/components/TVCandlestickChart';
import FearGreedGauge from '@/components/FearGreedGauge';
import InteractiveVerticalCard from '@/components/InteractiveVerticalCard';
import MarketFlowDiagram from '@/components/MarketFlowDiagram';
import Watchlist from '@/components/Watchlist';

/* ── Helpers ── */
function Mini({data,color,h=44}:{data:number[];color:string;h?:number}) {
  if(!data||data.length<5) return null;
  const s=data.filter((_,i)=>i%Math.max(1,Math.floor(data.length/30))===0);
  const cd=s.map((v,i)=>({t:i,v}));
  return <ResponsiveContainer width="100%" height={h}><AreaChart data={cd} margin={{top:2,right:0,bottom:0,left:0}}><defs><linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g${color.replace('#','')})`} dot={false}/></AreaChart></ResponsiveContainer>;
}
function Section({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  const ref=useRef(null); const inView=useInView(ref,{once:true,margin:'-50px'});
  return <motion.div ref={ref} initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6,delay,ease:'easeOut'}}>{children}</motion.div>;
}
function fakeSparkline(base:number,vol:number):number[] {
  return Array.from({length:30},(_,i)=>base+Math.sin(i*0.35)*vol+(Math.random()-0.5)*vol*0.6);
}
const domData=[{name:'BTC',value:56.2,color:'#B8860B'},{name:'ETH',value:10.1,color:'#3B6CB4'},{name:'Other',value:33.7,color:'#E8E6E0'}];
function pc(v:number|null|undefined){if(!v)return'var(--text-muted)';return v>0?'var(--green)':'var(--red)';}
function fp(v:number|null|undefined){if(v===null||v===undefined)return'-';return(v>0?'+':'')+v.toFixed(1)+'%';}

/* ── Market Status Badge (NYSE hours) ── */
function MarketStatusBadge() {
  const [status, setStatus] = useState<{open:boolean;text:string}>({open:false,text:''});
  useEffect(() => {
    function calc() {
      const now = new Date();
      const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const day = et.getDay();
      const h = et.getHours();
      const m = et.getMinutes();
      const mins = h * 60 + m;
      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && mins >= 570 && mins < 960; // 9:30=570, 16:00=960

      if (isOpen) {
        const left = 960 - mins;
        const lh = Math.floor(left / 60);
        const lm = left % 60;
        setStatus({ open: true, text: `Closes in ${lh}h ${lm}m` });
      } else {
        // Calculate minutes until next open
        let daysUntil = 0;
        let nextDay = day;
        if (isWeekday && mins < 570) {
          daysUntil = 0; // today, before open
        } else {
          // After close or weekend — find next weekday
          nextDay = day;
          do {
            nextDay = (nextDay + 1) % 7;
            daysUntil++;
          } while (nextDay === 0 || nextDay === 6);
        }
        const minsUntil = daysUntil * 24 * 60 + (570 - mins);
        const totalMins = minsUntil > 0 ? minsUntil : minsUntil + 7 * 24 * 60;
        const uh = Math.floor(totalMins / 60);
        const um = totalMins % 60;
        setStatus({ open: false, text: uh > 24 ? `Opens in ${Math.floor(uh/24)}d ${uh%24}h` : `Opens in ${uh}h ${um}m` });
      }
    }
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:status.open?'var(--green)':'#C0392B',boxShadow:status.open?'0 0 6px rgba(45,143,94,0.5)':'0 0 6px rgba(192,57,43,0.5)'}}/>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.1em',color:status.open?'var(--green)':'#C0392B',fontWeight:600}}>{status.open?'Markets Open':'Markets Closed'}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',color:'rgba(255,255,255,0.3)',marginLeft:4}}>{status.text}</span>
    </div>
  );
}

/* ── Home Ticker (pixel-measured infinite loop) ── */
function HomeTicker({items}:{items:{l:string;v:string;c?:string}[]}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (measureRef.current) {
      setSetWidth(measureRef.current.scrollWidth);
    }
  }, [items]);

  // How many full copies we need to fill 2x the viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const copies = setWidth > 0 ? Math.max(2, Math.ceil((vw * 2) / setWidth) + 1) : 3;
  const speed = 35; // px per second
  const duration = setWidth > 0 ? setWidth / speed : 30;

  const renderSet = (key: string) => (
    <div key={key} style={{display:'flex',alignItems:'center',flexShrink:0}}>
      {items.map((item,i)=>(
        <span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,marginRight:36,fontFamily:'var(--font-mono)',fontSize:'0.64rem',whiteSpace:'nowrap',flexShrink:0}}>
          <span style={{color:'rgba(255,255,255,0.45)',fontWeight:400,flexShrink:0}}>{item.l}</span>
          <span style={{color:item.c||'rgba(255,255,255,0.9)',fontWeight:600,flexShrink:0}}>{item.v}</span>
          <span style={{color:'rgba(255,255,255,0.1)',marginLeft:4,fontSize:'0.5rem',flexShrink:0}}>│</span>
        </span>
      ))}
    </div>
  );

  return (
    <div style={{background:'rgba(0,0,0,0.4)',borderBottom:'1px solid rgba(184,134,11,0.2)',overflow:'hidden',whiteSpace:'nowrap',height:36,position:'relative'}}>
      {/* Hidden measure element — must be inside positioned+overflow:hidden parent */}
      <div ref={measureRef} style={{position:'absolute',left:0,top:0,visibility:'hidden',display:'flex',alignItems:'center',pointerEvents:'none'}}>
        {items.map((item,i)=>(
          <span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,marginRight:36,fontFamily:'var(--font-mono)',fontSize:'0.64rem',whiteSpace:'nowrap',flexShrink:0}}>
            <span>{item.l}</span><span>{item.v}</span><span style={{marginLeft:4}}>│</span>
          </span>
        ))}
      </div>
      {setWidth > 0 && (
        <div
          style={{
            display:'flex',alignItems:'center',height:36,
            animation:`hpTicker ${duration}s linear infinite`,
            willChange:'transform',
          }}
        >
          {Array.from({length:copies},(_,i)=>renderSet(`set-${i}`))}
        </div>
      )}
      <style>{`@keyframes hpTicker{from{transform:translateX(0)}to{transform:translateX(-${setWidth}px)}}`}</style>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({name,val,chg,color,prefix,dec,spark,href}:any){
  const[h,setH]=useState(false);
  const inner = <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?'rgba(184,134,11,0.06)':'rgba(255,255,255,0.03)',border:`1px solid ${h?'rgba(184,134,11,0.2)':'rgba(255,255,255,0.06)'}`,padding:'16px 14px',transition:'all 0.3s ease',transform:h?'translateY(-2px)':'translateY(0)',boxShadow:h?'0 8px 24px rgba(0,0,0,0.15)':'none',position:'relative',overflow:'hidden',borderRadius:6}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.1em',color,fontWeight:500}}>{name}</span>
      {chg!==null&&chg!==undefined&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,color:pc(chg)}}>{fp(chg)}</span>}
    </div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:'1.2rem',fontWeight:600,color:'#fff',marginBottom:4}}>
      {val != null && val !== 0 ? `${prefix||''}${Number(val).toLocaleString('en-US',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0})}` : '—'}
    </div>
    <Mini data={spark} color={color}/>
    <span style={{position:'absolute',bottom:8,right:10,fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'rgba(255,255,255,0.3)',opacity:h?1:0,transition:'opacity 0.3s ease'}}>View →</span>
    <div style={{position:'absolute',bottom:0,left:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,width:h?'100%':'0%',transition:'width 0.5s ease'}}/>
  </div>;
  if(href) return <Link href={href} style={{textDecoration:'none',color:'inherit',display:'block'}}>{inner}</Link>;
  return inner;
}

/* ── Data Card (dark) ── */
function DataCard({title,color,rows}:{title:string;color:string;rows:{l:string;v:string;c?:string}[]}){
  return <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'14px 12px',borderRadius:6,flex:1}}>
    <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color,display:'block',marginBottom:10,fontWeight:600}}>{title}</span>
    {rows.map(m=><div key={m.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.45)'}}>{m.l}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',fontWeight:500,color:m.c||color}}>{m.v}</span>
    </div>)}
  </div>;
}

/* ── Loading Skeleton for Market Pulse ── */
function PulseSkeleton() {
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
    {[1,2,3,4,5,6].map(i=><div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px 14px',borderRadius:6,overflow:'hidden',position:'relative'}}>
      <div style={{width:'40%',height:10,background:'rgba(255,255,255,0.06)',borderRadius:3,marginBottom:12}}/>
      <div style={{width:'65%',height:20,background:'rgba(255,255,255,0.04)',borderRadius:3,marginBottom:8}}/>
      <div style={{width:'100%',height:44,background:'rgba(255,255,255,0.02)',borderRadius:3}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)',animation:'shimmer 1.5s infinite'}}/>
    </div>)}
  </div>;
}

/* ── Topic Button Pair (shared hover state — only one is filled at a time) ── */
function TopicButtons({dataHref,articleHref,color}:{dataHref:string;articleHref:string;color:string}) {
  const [active, setActive] = useState<'data'|'articles'>('data');
  return (
    <div style={{display:'flex',gap:8,justifyContent:'center'}}>
      <Link href={dataHref} onClick={(e:any)=>e.stopPropagation()}
        onMouseEnter={()=>setActive('data')}
        style={{
          display:'flex',alignItems:'center',gap:4,
          fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,
          padding:'8px 16px',borderRadius:4,textDecoration:'none',
          letterSpacing:'0.05em',
          background: active==='data' ? color : 'transparent',
          color: active==='data' ? '#fff' : 'rgba(255,255,255,0.5)',
          border: `1.5px solid ${active==='data' ? color : color+'55'}`,
          transform: active==='data' ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: active==='data' ? `0 4px 14px ${color}33` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >📊 Data</Link>
      <Link href={articleHref} onClick={(e:any)=>e.stopPropagation()}
        onMouseEnter={()=>setActive('articles')}
        style={{
          display:'flex',alignItems:'center',gap:4,
          fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,
          padding:'8px 16px',borderRadius:4,textDecoration:'none',
          letterSpacing:'0.05em',
          background: active==='articles' ? color : 'transparent',
          color: active==='articles' ? '#fff' : 'rgba(255,255,255,0.5)',
          border: `1.5px solid ${active==='articles' ? color : color+'55'}`,
          transform: active==='articles' ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: active==='articles' ? `0 4px 14px ${color}33` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >📝 Articles</Link>
    </div>
  );
}

/* ── Topic Selector Card ── */
const TOPICS = [
  {key:'crypto',icon:'₿',label:'Crypto & Digital Assets',sub:'CLARITY Act, ETFs, DeFi',color:'#B8860B',dataHref:'/markets/crypto',articleHref:'/research'},
  {key:'macro',icon:'🏛',label:'Macro & Central Banks',sub:'Fed, ECB, Rates, Liquidity',color:'#3B6CB4',dataHref:'/markets/macro',articleHref:'/research'},
  {key:'commodities',icon:'🛢',label:'Commodities & Energy',sub:'Gold, Oil, Nat Gas',color:'#8B5E3C',dataHref:'/markets/commodities',articleHref:'/research'},
  {key:'fx',icon:'💱',label:'FX & Currencies',sub:'EUR/USD, EM, Stablecoins',color:'#2D8F5E',dataHref:'/markets/fx',articleHref:'/research'},
  {key:'geopolitics',icon:'🌍',label:'Geopolitics & Policy',sub:'Tariffs, Sanctions, Elections',color:'#8B2252',dataHref:'/markets/geopolitics',articleHref:'/research'},
];

function TopicCard({t,onSelect,selected}:{t:typeof TOPICS[0];onSelect:(k:string)=>void;selected:string|null}){
  const[h,setH]=useState(false);
  const isSelected = selected===t.key;
  return <motion.div
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    onClick={()=>onSelect(isSelected?'':t.key)}
    layout
    whileHover={{y:-3}} whileTap={{scale:0.98}}
    style={{cursor:'pointer',padding:'20px 16px',borderRadius:8,
      background:isSelected?`linear-gradient(135deg,${t.color}22,${t.color}08)`:'rgba(255,255,255,0.03)',
      border:`1.5px solid ${isSelected?t.color+'66':h?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.06)'}`,
      transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',textAlign:'center',position:'relative',overflow:'hidden'}}>
    {isSelected&&<motion.div layoutId="topicAccent" style={{position:'absolute',top:0,left:0,right:0,height:2,background:t.color}} transition={{duration:0.3}}/>}
    <div style={{fontSize:'1.5rem',marginBottom:8,transition:'transform 0.3s',transform:isSelected?'scale(1.15)':'scale(1)'}}>{t.icon}</div>
    <div style={{fontFamily:'var(--font-serif)',fontSize:'0.88rem',fontWeight:500,color:isSelected?'#fff':'rgba(255,255,255,0.8)',marginBottom:4,transition:'color 0.3s'}}>{t.label}</div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:isSelected?t.color:'rgba(255,255,255,0.4)',letterSpacing:'0.05em',transition:'color 0.3s'}}>{t.sub}</div>
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{opacity:0,height:0,marginTop:0}}
          animate={{opacity:1,height:'auto',marginTop:12}}
          exit={{opacity:0,height:0,marginTop:0}}
          transition={{duration:0.3,ease:[0.4,0,0.2,1]}}
          style={{display:'flex',gap:8,justifyContent:'center',overflow:'hidden'}}
        >
          <TopicButtons dataHref={t.dataHref} articleHref={t.articleHref} color={t.color} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>;
}

/* ══════════════════════════════════════════════ */
export default function HomeClient(){
  const { data: _md, loading: _loading } = useMarketData();
  const prices = _md?.symbols ? { bitcoin: { usd: _md.symbols.BTC?.price, usd_24h_change: _md.symbols.BTC?.change, usd_market_cap: null }, ethereum: { usd: _md.symbols.ETH?.price, usd_24h_change: _md.symbols.ETH?.change }, solana: { usd: _md.symbols.SOL?.price }, ripple: { usd: _md.symbols.XRP?.price } } : null;
  const macro = _md ? { fedRate: _md.fedRate, t10y: _md.symbols?.US10Y?.price?.toFixed(2), t2y: _md.symbols?.US2Y?.price?.toFixed(2), cpi: (_md as any)?.cpi ?? null, unemp: (_md as any)?.unemp ? (_md as any).unemp + '%' : null, yieldSpread: _md.symbols?.US10Y?.price && _md.symbols?.US2Y?.price ? (_md.symbols.US10Y.price - _md.symbols.US2Y.price).toFixed(2) : null, m2: null, dxy: _md.symbols?.DXY?.price?.toFixed(2) ?? (_md as any)?.dxy ?? null } : null;
  const commod = _md?.symbols ? { oil: _md.symbols.OIL?.price, oilChg: _md.symbols.OIL?.change, gold: _md.symbols.GOLD?.price, goldChg: _md.symbols.GOLD?.change, natgas: _md.symbols.NATGAS?.price, natgasChg: _md.symbols.NATGAS?.change } : null;
  const fx = _md?.symbols ? { EUR: _md.symbols.EURUSD?.price ? 1/_md.symbols.EURUSD.price : null, GBP: _md.symbols.GBPUSD?.price ? 1/_md.symbols.GBPUSD.price : null, JPY: _md.symbols.USDJPY?.price, CHF: _md.symbols.USDCHF?.price } : null;
  const fg = _md?.fearGreed ? { current: { value: _md.fearGreed.value, label: _md.fearGreed.label }, history: _md.fearGreed.history } : null;
  const global = _md?.cryptoGlobal ?? null;
  const indices = _md?.symbols ? { sp500: { val: _md.symbols.SPX?.price, chg: _md.symbols.SPX?.change, spark: _md.symbols.SPX?.sparkline }, djia: { val: _md.symbols.DJI?.price, chg: _md.symbols.DJI?.change }, nasdaq: { val: _md.symbols.NDX?.price, chg: _md.symbols.NDX?.change }, vix: { val: _md.symbols.VIX?.price, chg: _md.symbols.VIX?.change, spark: _md.symbols.VIX?.sparkline } } : null;
  const sp = (key: string) => _md?.symbols?.[key]?.sparkline?.length ? _md.symbols[key].sparkline : fakeSparkline(100, 10);
  const[time,setTime]=useState('');
  const[selectedTopic,setSelectedTopic]=useState<string|null>(null);
  const[sidebarOpen,setSidebarOpen]=useState(false);
  const[btcCandles]=useState(()=>generateMockCandles(84500,90,1800));
  const[ethCandles]=useState(()=>generateMockCandles(2150,90,80));
  useEffect(()=>{const iv=setInterval(()=>setTime(new Date().toLocaleTimeString('en-US',{hour12:false})),1000);setTime(new Date().toLocaleTimeString('en-US',{hour12:false}));return()=>clearInterval(iv);},[]); 

  const fgVal=fg?.current?.value??50;const fgLabel=fg?.current?.label??'Neutral';
  const vixVal=indices?.vix?.val;const btc=prices?.bitcoin;
  const featured=articles.find((a:any)=>a.featured);
  const selectedTopicData = TOPICS.find(t=>t.key===selectedTopic);

  const marqueeItems=[
    {l:'S&P 500',v:indices?.sp500?.val ? indices.sp500.val.toLocaleString('en-US',{maximumFractionDigits:0}) : '-',c:pc(indices?.sp500?.chg)},
    {l:'DOW',v:indices?.djia?.val ? indices.djia.val.toLocaleString('en-US',{maximumFractionDigits:0}) : '-'},
    {l:'NASDAQ',v:indices?.nasdaq?.val ? indices.nasdaq.val.toLocaleString('en-US',{maximumFractionDigits:0}) : '-'},
    {l:'BTC',v:'$'+(btc?.usd?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'),c:pc(btc?.usd_24h_change)},
    {l:'GOLD',v:'$'+(commod?.gold?.toFixed(0)||'-'),c:pc(commod?.goldChg)},
    {l:'OIL',v:'$'+(commod?.oil?.toFixed(2)||'-'),c:pc(commod?.oilChg)},
    {l:'EUR/USD',v:fx&&fx.EUR?(1/fx.EUR).toFixed(4):'-'},
    {l:'FED',v:(macro?.fedRate||'-')+'%'},
    {l:'VIX',v:vixVal?.toFixed(1)||'-',c:vixVal?(vixVal>30?'var(--red)':vixVal>20?'#E88A3C':'var(--green)'):undefined},
  ];

  return <div style={{background:'#1A1A2E',color:'#fff',minHeight:'100vh',width:'100%',overflowX:'hidden'}}>
    <style>{`
      @keyframes s2d-pulse{0%,100%{opacity:1}50%{opacity:0.4}}.s2d-pulse{animation:s2d-pulse 2s infinite}
      @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      @keyframes auroraMove1{0%{transform:translate(0,0) rotate(0deg) scale(1)}33%{transform:translate(80px,-60px) rotate(120deg) scale(1.3)}66%{transform:translate(-40px,40px) rotate(240deg) scale(0.8)}100%{transform:translate(0,0) rotate(360deg) scale(1)}}
      @keyframes auroraMove2{0%{transform:translate(0,0) rotate(0deg) scale(1.1)}33%{transform:translate(-70px,50px) rotate(-120deg) scale(0.7)}66%{transform:translate(60px,-30px) rotate(-240deg) scale(1.2)}100%{transform:translate(0,0) rotate(-360deg) scale(1.1)}}
      @keyframes auroraMove3{0%{transform:translate(0,0) scale(1)}50%{transform:translate(50px,30px) scale(1.4)}100%{transform:translate(0,0) scale(1)}}
      @keyframes auroraPulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
      .aurora-blob{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;will-change:transform;font-size:0;line-height:0;color:transparent}
      .ambient-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:auroraMove3 25s ease-in-out infinite;max-width:100vw}
      .gold-line{height:1px;background:linear-gradient(90deg,transparent,rgba(184,134,11,0.3),rgba(184,134,11,0.1),transparent);margin:0 16px}
      .nav-link{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.12em;color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.2s;padding:4px 0}
      .nav-link:hover{color:var(--gold-light)}
      .hp-section{padding-left:32px;padding-right:32px;max-width:1200px;margin-left:auto;margin-right:auto;box-sizing:border-box;width:100%}
      .hp-grid-verticals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .hp-grid-verticals>*,.hp-grid-stats>*,.hp-grid-2col>*{min-width:0;overflow:hidden}
      .hp-grid-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .hp-grid-2col{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      @media(max-width:768px){
        .hp-section{padding-left:16px;padding-right:16px}
        .hp-grid-verticals{grid-template-columns:repeat(2,1fr)}
        .hp-grid-stats{grid-template-columns:repeat(2,1fr)}
        .hp-grid-2col{grid-template-columns:1fr}
        .gold-line{margin:0 16px}
      }
      @media(max-width:420px){
        .hp-section{padding-left:12px;padding-right:12px}
        .hp-grid-verticals{grid-template-columns:repeat(2,1fr);gap:8px}
        .hp-grid-stats{grid-template-columns:repeat(2,1fr);gap:8px}
      }
    `}</style>

    {/* ══ TICKER BAR ══ */}
    <HomeTicker items={marqueeItems} />

    {/* ══ MENU BUTTON (top-left) ══ */}
    <button aria-label="Toggle navigation menu" aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(!sidebarOpen)} style={{position:'fixed',top:44,left:20,zIndex:55,background:'rgba(15,15,35,0.8)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:'1px solid rgba(184,134,11,0.2)',borderRadius:6,padding:'10px 12px',cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.5)';e.currentTarget.style.boxShadow='0 4px 20px rgba(184,134,11,0.15)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.2)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)';}}>
      <div style={{width:18,height:2,background:'var(--gold-light)',marginBottom:4,borderRadius:1,transition:'all 0.3s',transform:sidebarOpen?'rotate(45deg) translateY(6px)':'none'}}/>
      <div style={{width:18,height:2,background:'var(--gold-light)',marginBottom:4,borderRadius:1,transition:'all 0.3s',opacity:sidebarOpen?0:1}}/>
      <div style={{width:18,height:2,background:'var(--gold-light)',borderRadius:1,transition:'all 0.3s',transform:sidebarOpen?'rotate(-45deg) translateY(-6px)':'none'}}/>
    </button>

    {/* ══ SIDE PANEL (overlay) ══ */}
    <AnimatePresence>
      {sidebarOpen && <>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:45,backdropFilter:'blur(4px)'}}/>
        <motion.div initial={{x:-300,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-300,opacity:0}} transition={{duration:0.3,ease:'easeOut'}}
          style={{position:'fixed',top:0,left:0,bottom:0,width:280,background:'rgba(15,15,35,0.95)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderRight:'1px solid rgba(184,134,11,0.15)',zIndex:46,overflowY:'auto',padding:'24px 0'}}>
          {/* Panel logo — pushed below the menu button */}
          <div style={{padding:'80px 20px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:16}}>
            <Link href="/" onClick={()=>setSidebarOpen(false)} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:'var(--font-serif)',fontSize:'1.2rem',fontWeight:600,color:'var(--gold-light)'}}>S2D</span>
              <span style={{fontFamily:'var(--font-serif)',fontSize:'0.85rem',fontWeight:400,color:'rgba(255,255,255,0.6)'}}>Capital Insights</span>
            </Link>
          </div>
          {/* Navigation */}
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.2em',color:'rgba(255,255,255,0.25)',padding:'0 12px 8px'}}>NAVIGATE</div>
            {[{l:'Markets',h:'/markets'},{l:'Research',h:'/research'},{l:'Newsletter',h:'/newsletter'},{l:'About',h:'/about'}].map(n=>
              <Link key={n.l} href={n.h} onClick={()=>setSidebarOpen(false)} style={{display:'block',padding:'11px 12px',fontFamily:'var(--font-sans)',fontSize:'0.92rem',fontWeight:500,color:'rgba(255,255,255,0.55)',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2}}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--gold-light)';e.currentTarget.style.background='rgba(184,134,11,0.06)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.55)';e.currentTarget.style.background='transparent';}}>{n.l}</Link>
            )}
          </div>
          <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'16px 20px'}}/>
          {/* Verticals */}
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.2em',color:'rgba(255,255,255,0.25)',padding:'0 12px 8px'}}>VERTICALS</div>
            {[{l:'Crypto & Digital Assets',h:'/markets/crypto',c:'#B8860B'},{l:'Macro & Central Banks',h:'/markets/macro',c:'#3B6CB4'},{l:'Commodities & Energy',h:'/markets/commodities',c:'#8B5E3C'},{l:'FX & Currencies',h:'/markets/fx',c:'#2D8F5E'},{l:'Geopolitics & Policy',h:'/markets/geopolitics',c:'#8B2252'},{l:'Market Structure',h:'/markets/structure',c:'#5B4FA0'}].map(v=>
              <Link key={v.l} href={v.h} onClick={()=>setSidebarOpen(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 12px',fontFamily:'var(--font-sans)',fontSize:'0.92rem',color:'rgba(255,255,255,0.55)',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2,fontWeight:500}}
                onMouseEnter={e=>{e.currentTarget.style.color=v.c;e.currentTarget.style.background='rgba(255,255,255,0.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.55)';e.currentTarget.style.background='transparent';}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:v.c,flexShrink:0}}/>{v.l}
              </Link>
            )}
          </div>
          <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'16px 20px'}}/>
          {/* Research */}
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.2em',color:'rgba(255,255,255,0.25)',padding:'0 12px 8px'}}>LATEST RESEARCH</div>
            {articles.slice(0,4).map((a:any)=>
              <Link key={a.slug} href={`/research/${a.slug}`} onClick={()=>setSidebarOpen(false)} style={{display:'block',padding:'10px 12px',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(184,134,11,0.06)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                <div style={{fontFamily:'var(--font-serif)',fontSize:'0.88rem',color:'rgba(255,255,255,0.75)',lineHeight:1.3,marginBottom:3}}>{a.title}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',color:'rgba(255,255,255,0.25)'}}>{a.date} · {a.readTime}</div>
              </Link>
            )}
          </div>
          <div style={{padding:'12px 20px 0'}}>
            <a href="https://x.com/s2dinfo" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',textDecoration:'none',transition:'color 0.2s'}} onMouseEnter={(e:any)=>{e.currentTarget.style.color='var(--gold-light)';}} onMouseLeave={(e:any)=>{e.currentTarget.style.color='rgba(255,255,255,0.35)';}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @s2dinfo
            </a>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>

    {/* ══ HERO — DARK NAVY + GOLD ══ */}
    <div style={{position:'relative',overflow:'hidden',padding:'56px 16px 40px',textAlign:'center',minHeight:420,background:'linear-gradient(180deg, #080810 0%, #0a0a1a 30%, #1A1A2E 100%)'}}>
      {/* Aurora flowing blobs */}
      <div className="aurora-blob" style={{width:'800px',height:'800px',top:'-30%',left:'-10%',background:'radial-gradient(circle,rgba(184,134,11,0.35) 0%,rgba(184,134,11,0.1) 40%,transparent 70%)',animation:'auroraMove1 35s ease-in-out infinite'}}>&nbsp;</div>
      <div className="aurora-blob" style={{width:'600px',height:'600px',bottom:'-20%',right:'-5%',background:'radial-gradient(circle,rgba(59,108,180,0.3) 0%,rgba(59,108,180,0.08) 40%,transparent 70%)',animation:'auroraMove2 30s ease-in-out infinite'}}>&nbsp;</div>
      <div className="aurora-blob" style={{width:'500px',height:'500px',top:'20%',left:'50%',background:'radial-gradient(circle,rgba(139,34,82,0.2) 0%,transparent 60%)',animation:'auroraMove1 40s ease-in-out infinite reverse'}}>&nbsp;</div>
      <div className="aurora-blob" style={{width:'400px',height:'400px',top:'60%',left:'20%',background:'radial-gradient(circle,rgba(45,143,94,0.15) 0%,transparent 60%)',animation:'auroraMove2 28s ease-in-out infinite reverse'}}>&nbsp;</div>
      <div className="aurora-blob" style={{width:'700px',height:'700px',top:'-10%',right:'20%',background:'radial-gradient(circle,rgba(184,134,11,0.2) 0%,transparent 60%)',animation:'auroraMove3 22s ease-in-out infinite'}}>&nbsp;</div>
      {/* Subtle grid */}
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(184,134,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
      {/* Noise texture */}
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',pointerEvents:'none'}}/>
      {/* Particles */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',opacity:0.2}}><ParticleField/></div>

      <div style={{position:'relative',zIndex:2}}>
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8}}>
          <Image src="/logo-dark.png" alt="S2D Capital Insights" width={320} height={200} style={{objectFit:'contain',margin:'0 auto 20px',mixBlendMode:'lighten',filter:'drop-shadow(0 4px 30px rgba(184,134,11,0.15))',maxWidth:'80vw',height:'auto'}} priority/>
        </motion.div>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.35em',color:'var(--gold-light)',marginBottom:16}}>FINANCIAL INTELLIGENCE</motion.p>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} style={{fontFamily:'var(--font-serif)',fontSize:'clamp(2.2rem,5vw,3.5rem)',fontWeight:400,lineHeight:1.1,color:'#ffffff',marginBottom:14,maxWidth:650,margin:'0 auto 14px',textShadow:'0 2px 30px rgba(184,134,11,0.15)'}}>
          Where Markets Meet Clarity
        </motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} style={{fontSize:'0.95rem',color:'rgba(255,255,255,0.6)',maxWidth:480,margin:'0 auto 36px',lineHeight:1.7}}>
          Six verticals. One picture. Live data from global equities, crypto, macro, commodities, FX, and geopolitics.
        </motion.p>
      </div>

      {/* ── TOPIC SELECTOR ── */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.8}} style={{position:'relative',zIndex:2,maxWidth:900,margin:'0 auto',padding:'0 16px'}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',marginBottom:16}}>WHAT INTERESTS YOU?</p>
        <div className="hp-grid-verticals" style={{marginBottom:16}}>
          {TOPICS.map(t=><TopicCard key={t.key} t={t} onSelect={setSelectedTopic} selected={selectedTopic}/>)}
        </div>
      </motion.div>
    </div>

    <div className="gold-line"/>

    {/* ══ FEATURED RESEARCH ══ */}
    {featured&&<Section><div className="hp-section" style={{paddingTop:28,paddingBottom:28}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'var(--gold)',boxShadow:'0 0 8px rgba(184,134,11,0.5)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:600}}>FEATURED RESEARCH</span>
      </div>
      <Link href={`/research/${featured.slug}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <div style={{background:'linear-gradient(135deg,rgba(184,134,11,0.08),rgba(184,134,11,0.02))',border:'1px solid rgba(184,134,11,0.15)',padding:'28px 24px',borderLeft:'3px solid var(--gold)',transition:'all 0.3s ease',position:'relative',overflow:'hidden',borderRadius:6,cursor:'pointer'}}
          onMouseEnter={e=>{e.currentTarget.style.borderLeftColor='var(--gold-light)';e.currentTarget.style.boxShadow='0 8px 32px rgba(184,134,11,0.12)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderLeftColor='var(--gold)';e.currentTarget.style.boxShadow='none';}}>
          <div style={{display:'flex',gap:6,marginBottom:12}}>
            {featured.tags?.map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.08em',padding:'3px 10px',background:`${v.hex}20`,color:v.hex,borderRadius:2}}>{v.labelShort}</span>:null;})}
          </div>
          <h3 style={{fontFamily:'var(--font-serif)',fontSize:'1.5rem',fontWeight:500,color:'#fff',lineHeight:1.3,marginBottom:10}}>{featured.title}</h3>
          <p style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.5)',lineHeight:1.7,maxWidth:640}}>{featured.excerpt}</p>
          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',flexWrap:'wrap'}}>
            <span>BTC ${btc?.usd?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'}</span>
            <span style={{color:(btc?.usd_24h_change??0)>0?'var(--green)':'var(--red)'}}>{(btc?.usd_24h_change??0)>0?'+':''}{btc?.usd_24h_change?.toFixed(1)}%</span>
            <span style={{marginLeft:'auto',color:'var(--gold-light)'}}>{featured.date} · {featured.readTime} → Read Article</span>
          </div>
        </div>
      </Link>
      {/* Other articles grid */}
      <div className="hp-grid-2col" style={{marginTop:12}}>
        {articles.filter((a:any)=>!a.featured).slice(0,3).map((a:any)=><Link key={a.slug} href={`/research/${a.slug}`} style={{textDecoration:'none',color:'inherit'}}>
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',padding:'18px 16px',borderRadius:6,transition:'all 0.3s',cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.2)';e.currentTarget.style.background='rgba(184,134,11,0.04)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';e.currentTarget.style.background='rgba(255,255,255,0.02)';}}>
            <div style={{display:'flex',gap:4,marginBottom:6}}>
              {a.tags?.slice(0,2).map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.06em',padding:'2px 6px',background:`${v.hex}15`,color:v.hex,borderRadius:2}}>{v.labelShort}</span>:null;})}
            </div>
            <h4 style={{fontFamily:'var(--font-serif)',fontSize:'0.92rem',fontWeight:500,color:'rgba(255,255,255,0.85)',lineHeight:1.35,marginBottom:6}}>{a.title}</h4>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',color:'rgba(255,255,255,0.3)'}}>{a.date} · {a.readTime}</span>
          </div>
        </Link>)}
      </div>
    </div></Section>}

    <div className="gold-line"/>

    {/* ══ MARKET PULSE ══ */}
    <Section><div className="hp-section" style={{paddingTop:28,paddingBottom:28}}>
      <MarketStatusBadge/>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <div className="s2d-pulse" style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px rgba(45,143,94,0.4)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.18em',color:'var(--green)',fontWeight:500}}>MARKET PULSE</span>
        <span style={{marginLeft:'auto',fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.3)'}}>{time}{_md?.timestamp ? ' · Updated '+new Date(_md.timestamp).toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit'}) : ''}</span>
      </div>

      {_loading ? <PulseSkeleton/> : <div className="hp-grid-stats" style={{marginBottom:12}}>
        <StatCard name="S&P 500" val={indices?.sp500?.val} chg={indices?.sp500?.chg} color="#B8860B" spark={sp('SPX')} href="/markets/macro"/>
        <StatCard name="BITCOIN" val={btc?.usd} chg={btc?.usd_24h_change} color="#B8860B" prefix="$" spark={sp('BTC')} href="/markets/crypto"/>
        <StatCard name="GOLD" val={commod?.gold} chg={commod?.goldChg} color="#D4A843" prefix="$" spark={sp('GOLD')} href="/markets/commodities"/>
        <StatCard name="WTI OIL" val={commod?.oil} chg={commod?.oilChg} color="#D4A843" prefix="$" dec={2} spark={sp('OIL')} href="/markets/commodities"/>
        <StatCard name="VIX" val={vixVal} chg={indices?.vix?.chg} color="#C0392B" dec={1} spark={sp('VIX')} href="/markets/macro"/>
        <StatCard name="NAT GAS" val={commod?.natgas} chg={commod?.natgasChg} color="#D4A843" prefix="$" dec={2} spark={sp('NATGAS')} href="/markets/commodities"/>
      </div>}

      <Watchlist data={{
        BTC: { label: 'Bitcoin', value: btc?.usd ? '$'+btc.usd.toLocaleString('en-US',{maximumFractionDigits:0}) : '—', color: '#B8860B' },
        ETH: { label: 'Ethereum', value: prices?.ethereum?.usd ? '$'+prices.ethereum.usd.toLocaleString('en-US',{maximumFractionDigits:0}) : '—', color: '#3B6CB4' },
        SOL: { label: 'Solana', value: prices?.solana?.usd ? '$'+prices.solana.usd.toFixed(2) : '—', color: '#9945FF' },
        XRP: { label: 'XRP', value: prices?.ripple?.usd ? '$'+prices.ripple.usd.toFixed(2) : '—', color: '#2D8F5E' },
        SPX: { label: 'S&P 500', value: indices?.sp500?.val ? indices.sp500.val.toLocaleString('en-US',{maximumFractionDigits:0}) : '—', color: '#B8860B' },
        FEDR: { label: 'Fed Rate', value: macro?.fedRate ? macro.fedRate+'%' : '—', color: '#3B6CB4' },
        T10Y: { label: '10Y Yield', value: macro?.t10y ? macro.t10y+'%' : '—', color: '#3B6CB4' },
        VIX: { label: 'VIX', value: vixVal ? vixVal.toFixed(1) : '—', color: '#C0392B' },
        GOLD: { label: 'Gold', value: commod?.gold ? '$'+commod.gold.toFixed(0) : '—', color: '#D4A843' },
        OIL: { label: 'WTI Oil', value: commod?.oil ? '$'+commod.oil.toFixed(2) : '—', color: '#8B5E3C' },
        BRENT: { label: 'Brent Crude', value: _md?.symbols?.BRENT?.price ? '$'+_md.symbols.BRENT.price.toFixed(2) : '—', color: '#C0392B' },
        NATGAS: { label: 'Nat Gas', value: commod?.natgas ? '$'+commod.natgas.toFixed(2) : '—', color: '#D4A843' },
        SILVER: { label: 'Silver', value: _md?.symbols?.SILVER?.price ? '$'+_md.symbols.SILVER.price.toFixed(2) : '—', color: '#9CA3AF' },
        EURUSD: { label: 'EUR/USD', value: fx?.EUR ? (1/fx.EUR).toFixed(4) : '—', color: '#2D8F5E' },
        GBPUSD: { label: 'GBP/USD', value: fx?.GBP ? (1/fx.GBP).toFixed(4) : '—', color: '#2D8F5E' },
        USDJPY: { label: 'USD/JPY', value: fx?.JPY ? fx.JPY.toFixed(2) : '—', color: '#2D8F5E' },
        DXY: { label: 'DXY', value: macro?.dxy ?? '—', color: '#3B6CB4' },
      }} />

      <div className="hp-grid-2col" style={{marginBottom:12,marginTop:12}}>
        <TVCandlestickChart data={btcCandles} title="BTC / USD" height={300}/>
        <TVCandlestickChart data={ethCandles} title="ETH / USD" height={300}/>
      </div>

      <div className="hp-grid-2col">
        <DataCard title="MACRO & CENTRAL BANKS" color="#6B9BD2" rows={[{l:'Fed Rate',v:(macro?.fedRate||'-')+'%',c:'#6B9BD2'},{l:'10Y Yield',v:(macro?.t10y||'-')+'%',c:'#6B9BD2'},{l:'CPI',v:macro?.cpi||'-',c:'#D4A843'},{l:'Unemployment',v:macro?.unemp||'-',c:'#E06B6B'},{l:'Dollar (DXY)',v:macro?.dxy||'-',c:'#4CAF7D'}]}/>
        <DataCard title="FX RATES" color="#4CAF7D" rows={fx?[{l:'EUR/USD',v:fx.EUR?(1/fx.EUR).toFixed(4):'-',c:'#4CAF7D'},{l:'GBP/USD',v:fx.GBP?(1/fx.GBP).toFixed(4):'-',c:'#4CAF7D'},{l:'USD/JPY',v:fx.JPY?fx.JPY.toFixed(2):'-',c:'#4CAF7D'},{l:'USD/CHF',v:fx.CHF?fx.CHF.toFixed(4):'-',c:'#4CAF7D'}]:[]}/>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px 12px',textAlign:'center',borderRadius:6}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold-light)',display:'block',marginBottom:10,fontWeight:600}}>FEAR & GREED INDEX</span>
          <FearGreedGauge value={fgVal} label={fgLabel}/>
        </div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',padding:'14px 12px',textAlign:'center',borderRadius:6}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold-light)',display:'block',marginBottom:6,fontWeight:600}}>BTC DOMINANCE</span>
          <div style={{width:90,margin:'0 auto'}}><ResponsiveContainer width="100%" height={90}><PieChart><Pie data={domData.map((d,i)=>({...d,value:i===0?(global?.btcDom||56.2):i===1?(global?.ethDom||10.1):100-(global?.btcDom||56.2)-(global?.ethDom||10.1)}))} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="value" strokeWidth={0}>{domData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'1rem',fontWeight:600,color:'var(--gold-light)'}}><AnimatedCounter value={global?.btcDom||56.2} suffix="%" decimals={1} className=""/></span>
        </div>
      </div>
    </div></Section>

    <div className="gold-line"/>

    {/* ══ VERTICALS ══ */}
    <Section delay={0.1}><div className="hp-section" style={{paddingTop:32,paddingBottom:32,position:'relative'}}>
      <div className="ambient-orb" style={{width:300,height:300,bottom:'-20%',left:'5%',background:'radial-gradient(circle,rgba(184,134,11,0.05) 0%,transparent 50%)'}}/>
      <p style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.3em',color:'var(--gold-light)',marginBottom:8}}>OUR COVERAGE</p>
      <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:'#fff',marginBottom:6}}>Six Perspectives. <em style={{fontStyle:'italic',color:'var(--gold-light)'}}>One Picture.</em></h2>
      <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.45)',maxWidth:520,marginBottom:20,lineHeight:1.7}}>Markets are interconnected. We analyze each vertical independently and show how everything connects.</p>
      <div className="hp-grid-verticals">
        {[
          {shortLabel:'Crypto',title:'Crypto & Digital Assets',subtitle:'Regulation, ETFs, Tokenization, DeFi',tags:['CLARITY','ETFs','BTC','DeFi'],color:'#B8860B',href:'/markets/crypto'},
          {shortLabel:'Macro',title:'Macro & Central Banks',subtitle:'Fed, ECB, BOJ, Rates, Liquidity',tags:['Fed','ECB','Rates','CPI'],color:'#3B6CB4',href:'/markets/macro'},
          {shortLabel:'Commodities',title:'Commodities & Energy',subtitle:'Oil, Gold, Agriculture, Supply Chains',tags:['Gold','Oil','Copper'],color:'#8B5E3C',href:'/markets/commodities'},
          {shortLabel:'FX',title:'FX & Currencies',subtitle:'Dollar, EUR/USD, EM Currencies, Stablecoins',tags:['DXY','EUR','Stablecoins'],color:'#2D8F5E',href:'/markets/fx'},
          {shortLabel:'Geopolitics',title:'Geopolitics & Policy',subtitle:'Trade Wars, Sanctions, Elections',tags:['Tariffs','Sanctions','EU'],color:'#8B2252',href:'/markets/geopolitics'},
          {shortLabel:'Structure',title:'DeFi & On-Chain Structure',subtitle:'DeFi TVL, Chain Metrics, Protocol Data',tags:['DeFi TVL','Chains','Protocols'],color:'#5B4FA0',href:'/markets/structure'},
        ].map((v,i)=><InteractiveVerticalCard key={v.shortLabel} index={i} {...v}/>)}
      </div>
      <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:20,maxWidth:600,margin:'20px auto 0'}}><strong style={{color:'#fff'}}>Fed rate decision</strong> → Dollar → Gold & Oil → EM Currencies → Crypto allocation. <strong style={{color:'#fff'}}>We connect these dots.</strong></p>
    </div></Section>

    <div className="gold-line"/>

    {/* ══ CROSS-MARKET FLOW ══ */}
    <Section delay={0.1}><div className="hp-section" style={{paddingTop:32,paddingBottom:32}}>
      <MarketFlowDiagram data={{
        fedRate: macro?.fedRate ?? undefined,
        dxy: macro?.dxy ?? undefined,
        gold: commod?.gold ?? undefined,
        oil: commod?.oil ?? undefined,
        btc: btc?.usd ?? undefined,
        eurUsd: fx?.EUR ? (1/fx.EUR).toFixed(4) : undefined,
      }} />
    </div></Section>

    <div className="gold-line"/>

    {/* ══ NEWSLETTER CTA ══ */}
    <Section delay={0.15}><div className="hp-section" style={{paddingTop:0,paddingBottom:48,marginTop:32}}>
      <div style={{background:'linear-gradient(135deg,rgba(184,134,11,0.1),rgba(184,134,11,0.03))',border:'1px solid rgba(184,134,11,0.15)',padding:'48px 32px',textAlign:'center',borderRadius:8,position:'relative',overflow:'hidden'}}>
        <div className="ambient-orb" style={{width:250,height:250,top:'-30%',right:'0%',background:'radial-gradient(circle,rgba(184,134,11,0.12) 0%,transparent 55%)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(184,134,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <p style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.3em',color:'var(--gold-light)',marginBottom:12}}>NEWSLETTER</p>
          <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:400,color:'#fff',marginBottom:12}}>Stay <em style={{fontStyle:'italic',color:'var(--gold-light)'}}>Informed</em></h2>
          <p style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.4)',maxWidth:440,margin:'0 auto 24px',lineHeight:1.7}}>Investor briefings directly to your inbox. Choose your topics. No spam, only substance.</p>
          <Link href="/newsletter" style={{display:'inline-block',fontFamily:'var(--font-sans)',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',padding:'14px 36px',background:'linear-gradient(135deg,var(--gold),var(--gold-dark))',color:'#fff',borderRadius:4,textDecoration:'none',boxShadow:'0 4px 24px rgba(184,134,11,0.3)',transition:'all 0.35s'}}>Subscribe to Newsletter</Link>
        </div>
      </div>
    </div></Section>

    {/* ══ FOOTER ══ */}
    <footer className="hp-section" style={{paddingTop:40,paddingBottom:24,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontFamily:'var(--font-serif)',fontSize:'0.95rem',fontWeight:600,color:'var(--gold-light)'}}>S2D</span>
          <span style={{fontFamily:'var(--font-serif)',fontSize:'0.8rem',fontWeight:400,color:'rgba(255,255,255,0.5)'}}>Capital Insights</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <a href="https://x.com/s2dinfo" target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.4)',textDecoration:'none',padding:'6px 12px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:4,transition:'all 0.3s'}} onMouseEnter={(e:any)=>{e.currentTarget.style.color='var(--gold-light)';e.currentTarget.style.borderColor='rgba(184,134,11,0.3)';}} onMouseLeave={(e:any)=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            @s2dinfo
          </a>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.2)'}}>© {new Date().getFullYear()} S2D Capital Insights</span>
        </div>
      </div>
    </footer>
  </div>;
}
