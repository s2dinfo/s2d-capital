'use client';
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

/* ── Stat Card ── */
function StatCard({name,val,chg,color,prefix,dec,spark}:any){
  const[h,setH]=useState(false);
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?'rgba(184,134,11,0.06)':'rgba(255,255,255,0.03)',border:`1px solid ${h?'rgba(184,134,11,0.2)':'rgba(255,255,255,0.06)'}`,padding:'16px 14px',transition:'all 0.3s ease',transform:h?'translateY(-2px)':'translateY(0)',boxShadow:h?'0 8px 24px rgba(0,0,0,0.15)':'none',position:'relative',overflow:'hidden',borderRadius:6}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.1em',color,fontWeight:500}}>{name}</span>
      {chg!==null&&chg!==undefined&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,color:pc(chg)}}>{fp(chg)}</span>}
    </div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:'1.2rem',fontWeight:600,color:'#fff',marginBottom:4}}>
      <AnimatedCounter value={val||0} prefix={prefix||''} decimals={dec||0} className=""/>
    </div>
    <Mini data={spark} color={color}/>
    <div style={{position:'absolute',bottom:0,left:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,width:h?'100%':'0%',transition:'width 0.5s ease'}}/>
  </div>;
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
    onClick={()=>onSelect(t.key)}
    whileHover={{y:-4}} whileTap={{scale:0.97}}
    style={{cursor:'pointer',padding:'20px 16px',borderRadius:8,
      background:isSelected?`linear-gradient(135deg,${t.color}22,${t.color}08)`:'rgba(255,255,255,0.03)',
      border:`1.5px solid ${isSelected?t.color+'66':h?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.06)'}`,
      transition:'all 0.3s',textAlign:'center',position:'relative',overflow:'hidden'}}>
    {isSelected&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:t.color}}/>}
    <div style={{fontSize:'1.5rem',marginBottom:8}}>{t.icon}</div>
    <div style={{fontFamily:'var(--font-serif)',fontSize:'0.88rem',fontWeight:500,color:'#fff',marginBottom:4}}>{t.label}</div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'rgba(255,255,255,0.4)',letterSpacing:'0.05em'}}>{t.sub}</div>
  </motion.div>;
}

/* ══════════════════════════════════════════════ */
export default function HomeClient({prices,macro,commod,fx,fg,global,indices}:any){
  const[time,setTime]=useState('');
  const[selectedTopic,setSelectedTopic]=useState<string|null>(null);
  const[btcCandles]=useState(()=>generateMockCandles(84500,90,1800));
  const[ethCandles]=useState(()=>generateMockCandles(2150,90,80));
  useEffect(()=>{const iv=setInterval(()=>setTime(new Date().toLocaleTimeString('en-US',{hour12:false})),1000);setTime(new Date().toLocaleTimeString('en-US',{hour12:false}));return()=>clearInterval(iv);},[]); 

  const fgVal=fg?.current?.value??50;const fgLabel=fg?.current?.label??'Neutral';
  const vixVal=indices?.vix?.val;const btc=prices?.bitcoin;
  const featured=articles.find((a:any)=>a.featured);
  const selectedTopicData = TOPICS.find(t=>t.key===selectedTopic);

  const marqueeItems=[
    {l:'S&P 500',v:indices?.sp500?.val?.toLocaleString('en-US',{maximumFractionDigits:0})||'-',c:pc(indices?.sp500?.chg)},
    {l:'DOW',v:indices?.djia?.val?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'},
    {l:'NASDAQ',v:indices?.nasdaq?.val?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'},
    {l:'BTC',v:'$'+(btc?.usd?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'),c:pc(btc?.usd_24h_change)},
    {l:'GOLD',v:'$'+(commod?.gold?.toFixed(0)||'-'),c:pc(commod?.goldChg)},
    {l:'OIL',v:'$'+(commod?.oil?.toFixed(2)||'-'),c:pc(commod?.oilChg)},
    {l:'EUR/USD',v:fx?(1/fx.EUR).toFixed(4):'-'},
    {l:'FED',v:(macro?.fedRate||'-')+'%'},
    {l:'VIX',v:vixVal?.toFixed(1)||'-',c:vixVal?(vixVal>30?'var(--red)':vixVal>20?'#E88A3C':'var(--green)'):undefined},
  ];

  return <div style={{background:'var(--navy)',color:'#fff',minHeight:'100vh'}}>
    <style>{`
      @keyframes s2d-pulse{0%,100%{opacity:1}50%{opacity:0.4}}.s2d-pulse{animation:s2d-pulse 2s infinite}
      @keyframes ambientFloat{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.1)}66%{transform:translate(-20px,15px) scale(0.95)}100%{transform:translate(0,0) scale(1)}}
      .ambient-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:ambientFloat 20s ease-in-out infinite}
      .gold-line{height:1px;background:linear-gradient(90deg,transparent,rgba(184,134,11,0.3),rgba(184,134,11,0.1),transparent);margin:0 32px}
      .nav-link{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.12em;color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.2s;padding:4px 0}
      .nav-link:hover{color:var(--gold-light)}
    `}</style>

    {/* ══ TICKER BAR ══ */}
    <div style={{background:'rgba(0,0,0,0.4)',borderBottom:'1px solid rgba(184,134,11,0.2)',overflow:'hidden',whiteSpace:'nowrap',height:36}}>
      <motion.div animate={{x:['0%','-50%']}} transition={{duration:35,repeat:Infinity,ease:'linear'}} style={{display:'inline-flex',alignItems:'center',height:36}}>
        {[...marqueeItems,...marqueeItems].map((item,i)=><span key={i} style={{display:'inline-flex',alignItems:'center',gap:6,marginRight:32,fontFamily:'var(--font-mono)',fontSize:'0.64rem'}}>
          <span style={{color:'rgba(255,255,255,0.45)',fontWeight:400}}>{item.l}</span>
          <span style={{color:item.c||'rgba(255,255,255,0.9)',fontWeight:600}}>{item.v}</span>
        </span>)}
      </motion.div>
    </div>

    {/* ══ NAVBAR ══ */}
    <nav style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'14px 32px',borderBottom:'1px solid rgba(184,134,11,0.15)',position:'sticky',top:0,zIndex:40,background:'rgba(15,15,35,0.9)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)'}}>
      <div style={{position:'absolute',left:32,display:'flex',gap:20,alignItems:'center'}}>
        <Link href="/markets" className="nav-link">MARKETS</Link>
        <Link href="/research" className="nav-link">RESEARCH</Link>
      </div>
      <Link href="/" style={{textDecoration:'none',display:'flex',alignItems:'center'}}>
        <Image src="/logo-dark.png" alt="S2D Capital Insights" width={180} height={60} style={{objectFit:'contain',filter:'drop-shadow(0 2px 16px rgba(184,134,11,0.2))'}} priority/>
      </Link>
      <div style={{position:'absolute',right:32,display:'flex',gap:20,alignItems:'center'}}>
        <Link href="/newsletter" className="nav-link">NEWSLETTER</Link>
        <Link href="/about" className="nav-link">ABOUT</Link>
      </div>
    </nav>

    {/* ══ HERO — DARK NAVY + GOLD ══ */}
    <div style={{position:'relative',overflow:'hidden',padding:'56px 32px 40px',textAlign:'center',minHeight:420}}>
      {/* Ambient gold orbs */}
      <div className="ambient-orb" style={{width:600,height:600,top:'-25%',left:'10%',background:'radial-gradient(circle,rgba(184,134,11,0.14) 0%,transparent 55%)'}}/>
      <div className="ambient-orb" style={{width:500,height:500,bottom:'-20%',right:'5%',background:'radial-gradient(circle,rgba(184,134,11,0.1) 0%,transparent 55%)',animationDelay:'-8s'}}/>
      <div className="ambient-orb" style={{width:300,height:300,top:'30%',left:'55%',background:'radial-gradient(circle,rgba(59,108,180,0.06) 0%,transparent 55%)',animationDelay:'-14s'}}/>
      {/* Gold grid — more visible */}
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(184,134,11,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.07) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
      {/* Particles */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',opacity:0.3}}><ParticleField/></div>

      <div style={{position:'relative',zIndex:2}}>
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8}}>
          <Image src="/logo-dark.png" alt="S2D Capital Insights" width={280} height={180} style={{objectFit:'contain',margin:'0 auto 24px',filter:'drop-shadow(0 4px 30px rgba(184,134,11,0.2))'}} priority/>
        </motion.div>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.35em',color:'var(--gold-light)',marginBottom:16}}>FINANCIAL INTELLIGENCE</motion.p>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} style={{fontFamily:'var(--font-serif)',fontSize:'clamp(2.2rem,5vw,3.5rem)',fontWeight:400,lineHeight:1.1,color:'#ffffff',marginBottom:14,maxWidth:650,margin:'0 auto 14px',textShadow:'0 2px 30px rgba(184,134,11,0.15)'}}>
          Where Markets Meet <em style={{fontStyle:'italic',color:'var(--gold-light)',textShadow:'0 0 30px rgba(184,134,11,0.3)'}}>Clarity</em>
        </motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} style={{fontSize:'0.95rem',color:'rgba(255,255,255,0.6)',maxWidth:480,margin:'0 auto 36px',lineHeight:1.7}}>
          Six verticals. One picture. Live data from global equities, crypto, macro, commodities, FX, and geopolitics.
        </motion.p>
      </div>

      {/* ── TOPIC SELECTOR ── */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.8}} style={{position:'relative',zIndex:2,maxWidth:900,margin:'0 auto'}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',marginBottom:16}}>WHAT INTERESTS YOU?</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginBottom:16}}>
          {TOPICS.map(t=><TopicCard key={t.key} t={t} onSelect={setSelectedTopic} selected={selectedTopic}/>)}
        </div>
        <AnimatePresence>
          {selectedTopic&&selectedTopicData&&<motion.div initial={{opacity:0,y:10,height:0}} animate={{opacity:1,y:0,height:'auto'}} exit={{opacity:0,y:-10,height:0}} transition={{duration:0.3}} style={{display:'flex',gap:12,justifyContent:'center',marginTop:8}}>
            <Link href={selectedTopicData.dataHref} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-sans)',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',padding:'12px 28px',background:`linear-gradient(135deg,${selectedTopicData.color},${selectedTopicData.color}cc)`,color:'#fff',borderRadius:4,textDecoration:'none',boxShadow:`0 4px 20px ${selectedTopicData.color}33`,transition:'all 0.3s'}}>
              📊 Live Data
            </Link>
            <Link href={selectedTopicData.articleHref} style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-sans)',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',padding:'12px 28px',background:'transparent',color:'#fff',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:4,textDecoration:'none',transition:'all 0.3s'}}>
              📝 Research & Articles
            </Link>
          </motion.div>}
        </AnimatePresence>
      </motion.div>
    </div>

    <div className="gold-line"/>

    {/* ══ FEATURED RESEARCH ══ */}
    {featured&&<Section><div style={{padding:'28px 32px',maxWidth:1200,margin:'0 auto'}}>
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
            <span style={{color:btc?.usd_24h_change>0?'var(--green)':'var(--red)'}}>{btc?.usd_24h_change>0?'+':''}{btc?.usd_24h_change?.toFixed(1)}%</span>
            <span style={{marginLeft:'auto',color:'var(--gold-light)'}}>{featured.date} · {featured.readTime} → Read Article</span>
          </div>
        </div>
      </Link>
      {/* Other articles grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:10,marginTop:12}}>
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
    <Section><div style={{padding:'28px 32px',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <div className="s2d-pulse" style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px rgba(45,143,94,0.4)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.18em',color:'var(--green)',fontWeight:500}}>MARKET PULSE</span>
        <span style={{marginLeft:'auto',fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.3)'}}>{time}</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:12}}>
        <StatCard name="S&P 500" val={indices?.sp500?.val||5780} chg={indices?.sp500?.chg} color="#B8860B" spark={fakeSparkline(5700,150)}/>
        <StatCard name="BITCOIN" val={btc?.usd||68980} chg={btc?.usd_24h_change} color="#B8860B" prefix="$" spark={fakeSparkline(67000,2500)}/>
        <StatCard name="GOLD" val={commod?.gold||2920} chg={commod?.goldChg} color="#D4A843" prefix="$" spark={fakeSparkline(2900,60)}/>
        <StatCard name="WTI OIL" val={commod?.oil||67.4} chg={commod?.oilChg} color="#D4A843" prefix="$" dec={2} spark={fakeSparkline(68,3)}/>
        <StatCard name="VIX" val={vixVal||25.7} chg={indices?.vix?.chg} color="#C0392B" dec={1} spark={fakeSparkline(24,4)}/>
        <StatCard name="NAT GAS" val={commod?.natgas||4.12} chg={commod?.natgasChg} color="#D4A843" prefix="$" dec={2} spark={fakeSparkline(4,0.5)}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:10,marginBottom:12}}>
        <TVCandlestickChart data={btcCandles} title="BTC / USD" height={300}/>
        <TVCandlestickChart data={ethCandles} title="ETH / USD" height={300}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        <DataCard title="MACRO & CENTRAL BANKS" color="#6B9BD2" rows={[{l:'Fed Rate',v:(macro?.fedRate||'-')+'%',c:'#6B9BD2'},{l:'10Y Yield',v:(macro?.t10y||'-')+'%',c:'#6B9BD2'},{l:'CPI',v:macro?.cpi||'-',c:'#D4A843'},{l:'Unemployment',v:(macro?.unemp||'-')+'%',c:'#E06B6B'},{l:'Dollar (DXY)',v:macro?.dxy||'-',c:'#4CAF7D'}]}/>
        <DataCard title="FX RATES" color="#4CAF7D" rows={fx?[{l:'EUR/USD',v:(1/fx.EUR).toFixed(4),c:'#4CAF7D'},{l:'GBP/USD',v:(1/fx.GBP).toFixed(4),c:'#4CAF7D'},{l:'USD/JPY',v:fx.JPY?.toFixed(2),c:'#4CAF7D'},{l:'USD/CHF',v:fx.CHF?.toFixed(4),c:'#4CAF7D'}]:[]}/>
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
    <Section delay={0.1}><div style={{padding:'32px 32px',maxWidth:1200,margin:'0 auto',position:'relative'}}>
      <div className="ambient-orb" style={{width:300,height:300,bottom:'-20%',left:'5%',background:'radial-gradient(circle,rgba(184,134,11,0.05) 0%,transparent 50%)'}}/>
      <p style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.3em',color:'var(--gold-light)',marginBottom:8}}>OUR COVERAGE</p>
      <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:400,color:'#fff',marginBottom:6}}>Six Perspectives. <em style={{fontStyle:'italic',color:'var(--gold-light)'}}>One Picture.</em></h2>
      <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.45)',maxWidth:520,marginBottom:20,lineHeight:1.7}}>Markets are interconnected. We analyze each vertical independently and show how everything connects.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
        {[
          {shortLabel:'Crypto',title:'Crypto & Digital Assets',subtitle:'Regulation, ETFs, Tokenization, DeFi',tags:['CLARITY','ETFs','BTC','DeFi'],color:'#B8860B',href:'/markets/crypto'},
          {shortLabel:'Macro',title:'Macro & Central Banks',subtitle:'Fed, ECB, BOJ, Rates, Liquidity',tags:['Fed','ECB','Rates','CPI'],color:'#3B6CB4',href:'/markets/macro'},
          {shortLabel:'Commodities',title:'Commodities & Energy',subtitle:'Oil, Gold, Agriculture, Supply Chains',tags:['Gold','Oil','Copper'],color:'#8B5E3C',href:'/markets/commodities'},
          {shortLabel:'FX',title:'FX & Currencies',subtitle:'Dollar, EUR/USD, EM Currencies, Stablecoins',tags:['DXY','EUR','Stablecoins'],color:'#2D8F5E',href:'/markets/fx'},
          {shortLabel:'Geopolitics',title:'Geopolitics & Policy',subtitle:'Trade Wars, Sanctions, Elections',tags:['Tariffs','Sanctions','EU'],color:'#8B2252',href:'/markets/geopolitics'},
          {shortLabel:'Structure',title:'Market Structure',subtitle:'Institutional Flows, ETF Architecture, TradFi',tags:['ETF Flows','OCC','Wall St'],color:'#5B4FA0',href:'/markets/structure'},
        ].map((v,i)=><InteractiveVerticalCard key={v.shortLabel} index={i} {...v}/>)}
      </div>
      <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginTop:20,maxWidth:600,margin:'20px auto 0'}}><strong style={{color:'#fff'}}>Fed rate decision</strong> → Dollar → Gold & Oil → EM Currencies → Crypto allocation. <strong style={{color:'#fff'}}>We connect these dots.</strong></p>
    </div></Section>

    <div className="gold-line"/>

    {/* ══ NEWSLETTER CTA ══ */}
    <Section delay={0.15}><div style={{padding:'0 32px 48px',marginTop:32,maxWidth:1200,margin:'32px auto 0'}}>
      <div style={{background:'linear-gradient(135deg,rgba(184,134,11,0.1),rgba(184,134,11,0.03))',border:'1px solid rgba(184,134,11,0.15)',padding:'48px 32px',textAlign:'center',borderRadius:8,position:'relative',overflow:'hidden'}}>
        <div className="ambient-orb" style={{width:250,height:250,top:'-30%',right:'-5%',background:'radial-gradient(circle,rgba(184,134,11,0.12) 0%,transparent 55%)'}}/>
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
    <footer style={{padding:'40px 32px 24px',borderTop:'1px solid rgba(255,255,255,0.05)',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <Image src="/logo-dark.png" alt="S2D Capital Insights" width={140} height={46} style={{objectFit:'contain',opacity:0.7}}/>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.2)'}}>© {new Date().getFullYear()} S2D Capital Insights · sami@s2d.info</div>
      </div>
    </footer>
  </div>;
}
