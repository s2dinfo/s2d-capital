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
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?'var(--bg-cream)':'var(--bg-warm)',border:`1px solid ${h?'var(--gold-pale)':'var(--border-lt)'}`,padding:'16px 14px',transition:'all 0.3s ease',transform:h?'translateY(-2px)':'translateY(0)',boxShadow:h?'0 6px 20px rgba(184,134,11,0.08)':'none',position:'relative',overflow:'hidden',borderRadius:4}}>
    <div style={{position:'absolute',top:-20,right:-20,width:60,height:60,borderRadius:'50%',background:`radial-gradient(circle,${h?'rgba(184,134,11,0.08)':'transparent'} 0%,transparent 70%)`,transition:'all 0.4s ease',pointerEvents:'none'}}/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.1em',color,fontWeight:500}}>{name}</span>
      {chg!==null&&chg!==undefined&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,color:pc(chg)}}>{fp(chg)}</span>}
    </div>
    <div style={{fontFamily:'var(--font-mono)',fontSize:'1.2rem',fontWeight:600,color:'var(--navy)',marginBottom:4}}>
      <AnimatedCounter value={val||0} prefix={prefix||''} decimals={dec||0} className=""/>
    </div>
    <Mini data={spark} color={color}/>
    <div style={{position:'absolute',bottom:0,left:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,width:h?'100%':'0%',transition:'width 0.5s ease'}}/>
  </div>;
}

/* ── Data Card ── */
function DataCard({title,color,rows}:{title:string;color:string;rows:{l:string;v:string;c?:string}[]}){
  const[h,setH]=useState(false);
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?'var(--bg-cream)':'var(--bg-warm)',border:`1px solid ${h?'var(--gold-pale)':'var(--border-lt)'}`,padding:'14px 12px',transition:'all 0.3s ease',borderRadius:4,flex:1}}>
    <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color,display:'block',marginBottom:10,fontWeight:600}}>{title}</span>
    {rows.map(m=><div key={m.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border-lt)'}}>
      <span style={{fontSize:'0.72rem',color:'var(--text-sec)'}}>{m.l}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',fontWeight:500,color:m.c||color}}>{m.v}</span>
    </div>)}
  </div>;
}

/* ── Sidebar Article Card ── */
function SidebarArticle({a,btc}:{a:any;btc:any}){
  const[h,setH]=useState(false);
  return <Link href={`/research/${a.slug}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:'16px 18px',borderLeft:h?'3px solid var(--gold)':'3px solid transparent',background:h?'rgba(184,134,11,0.04)':'transparent',transition:'all 0.3s',marginBottom:2}}>
      <div style={{display:'flex',gap:4,marginBottom:6,flexWrap:'wrap'}}>
        {a.tags?.slice(0,2).map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.45rem',letterSpacing:'0.06em',padding:'2px 6px',background:`${v.hex}15`,color:v.hex,borderRadius:2}}>{v.labelShort}</span>:null;})}
      </div>
      <h4 style={{fontFamily:'var(--font-serif)',fontSize:'0.88rem',fontWeight:500,color:'var(--navy)',lineHeight:1.35,marginBottom:4}}>{a.title}</h4>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'var(--text-muted)'}}>{a.date} · {a.readTime}</span>
    </div>
  </Link>;
}

/* ══════════════════════════════════════════════════════════════ */
/* ══  MAIN COMPONENT                                         ══ */
/* ══════════════════════════════════════════════════════════════ */
export default function HomeClient({prices,macro,commod,fx,fg,global,indices}:any){
  const[time,setTime]=useState('');
  const[sidebarOpen,setSidebarOpen]=useState(true);
  const[btcCandles]=useState(()=>generateMockCandles(84500,90,1800));
  const[ethCandles]=useState(()=>generateMockCandles(2150,90,80));
  useEffect(()=>{const iv=setInterval(()=>setTime(new Date().toLocaleTimeString('en-US',{hour12:false})),1000);setTime(new Date().toLocaleTimeString('en-US',{hour12:false}));return()=>clearInterval(iv);},[]); 

  const fgVal=fg?.current?.value??50;const fgLabel=fg?.current?.label??'Neutral';
  const vixVal=indices?.vix?.val;const btc=prices?.bitcoin;
  const featured=articles.find((a:any)=>a.featured);

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

  return <div style={{background:'var(--bg)',color:'var(--text-body)',minHeight:'100vh'}}>
    <style>{`
      @keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}
      @keyframes s2d-pulse{0%,100%{opacity:1}50%{opacity:0.4}}.s2d-pulse{animation:s2d-pulse 2s infinite}
      @keyframes ambientFloat{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.1)}66%{transform:translate(-20px,15px) scale(0.95)}100%{transform:translate(0,0) scale(1)}}
      @keyframes goldShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      .ambient-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:ambientFloat 20s ease-in-out infinite}
      .gold-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(184,134,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
      .sidebar-link{display:block;padding:8px 18px;font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.1em;color:var(--text-muted);transition:all 0.2s;text-decoration:none;border-left:2px solid transparent}
      .sidebar-link:hover{color:var(--gold);border-left-color:var(--gold);background:rgba(184,134,11,0.03)}
      .sidebar-link.active{color:var(--gold);border-left-color:var(--gold);font-weight:600}
    `}</style>

    {/* ══ TICKER BAR ══ */}
    <div style={{background:'var(--navy)',borderBottom:'1px solid rgba(184,134,11,0.15)',overflow:'hidden',whiteSpace:'nowrap',height:36,position:'relative',zIndex:50}}>
      <motion.div animate={{x:['0%','-50%']}} transition={{duration:35,repeat:Infinity,ease:'linear'}} style={{display:'inline-flex',alignItems:'center',height:36}}>
        {[...marqueeItems,...marqueeItems].map((item,i)=><span key={i} style={{display:'inline-flex',alignItems:'center',gap:6,marginRight:32,fontFamily:'var(--font-mono)',fontSize:'0.65rem'}}>
          <span style={{color:'rgba(255,255,255,0.4)',fontWeight:400}}>{item.l}</span>
          <span style={{color:item.c||'rgba(255,255,255,0.85)',fontWeight:600}}>{item.v}</span>
        </span>)}
      </motion.div>
    </div>

    {/* ══ NAVBAR — CENTERED LOGO ══ */}
    <nav style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'14px 32px',background:'rgba(253,252,249,0.92)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',borderBottom:'1px solid var(--border-lt)',position:'sticky',top:0,zIndex:40}}>
      {/* Left nav */}
      <div style={{position:'absolute',left:32,display:'flex',gap:20,alignItems:'center'}}>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.1em',color:'var(--text-muted)',padding:'4px 8px',transition:'color 0.2s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--gold)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
          {sidebarOpen?'◀ RESEARCH':'▶ RESEARCH'}
        </button>
        <Link href="/markets" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.1em',color:'var(--text-muted)',textDecoration:'none',transition:'color 0.2s'}}>MARKETS</Link>
      </div>
      {/* Center logo */}
      <Link href="/" style={{textDecoration:'none'}}>
        <Image src="/logo-hero.png" alt="S2D Capital Insights" width={140} height={48} style={{filter:'drop-shadow(0 2px 8px rgba(184,134,11,0.1))'}} priority/>
      </Link>
      {/* Right nav */}
      <div style={{position:'absolute',right:32,display:'flex',gap:20,alignItems:'center'}}>
        <Link href="/newsletter" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.1em',color:'var(--text-muted)',textDecoration:'none'}}>NEWSLETTER</Link>
        <Link href="/about" style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.1em',color:'var(--text-muted)',textDecoration:'none'}}>ABOUT</Link>
      </div>
    </nav>

    {/* ══ MAIN LAYOUT: SIDEBAR + CONTENT ══ */}
    <div style={{display:'flex',minHeight:'calc(100vh - 86px)'}}>

      {/* ── SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && <motion.aside
          initial={{width:0,opacity:0}} animate={{width:280,opacity:1}} exit={{width:0,opacity:0}}
          transition={{duration:0.3,ease:'easeInOut'}}
          style={{borderRight:'1px solid var(--border-lt)',background:'var(--bg-warm)',overflow:'hidden',flexShrink:0,position:'sticky',top:86,height:'calc(100vh - 86px)',overflowY:'auto'}}
        >
          <div style={{padding:'20px 0'}}>
            <div style={{padding:'0 18px 12px',fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.2em',color:'var(--gold)',fontWeight:600}}>LATEST RESEARCH</div>
            {articles.map((a:any)=><SidebarArticle key={a.slug} a={a} btc={btc}/>)}
            <div style={{height:1,background:'var(--border-lt)',margin:'16px 18px'}}/>
            <div style={{padding:'0 18px 8px',fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.2em',color:'var(--gold)',fontWeight:600}}>VERTICALS</div>
            {[
              {l:'Crypto & Digital Assets',h:'/markets/crypto'},
              {l:'Macro & Central Banks',h:'/markets/macro'},
              {l:'Commodities & Energy',h:'/markets/commodities'},
              {l:'FX & Currencies',h:'/markets/fx'},
              {l:'Geopolitics & Policy',h:'/markets/geopolitics'},
              {l:'Market Structure',h:'/markets/structure'},
            ].map(v=><Link key={v.l} href={v.h} className="sidebar-link">{v.l}</Link>)}
            <div style={{height:1,background:'var(--border-lt)',margin:'16px 18px'}}/>
            <div style={{padding:'0 18px'}}>
              <Link href="/newsletter" className="sidebar-link" style={{borderLeft:'none',padding:'10px 0'}}>
                <span style={{color:'var(--gold)',fontWeight:600}}>Subscribe to Newsletter →</span>
              </Link>
            </div>
          </div>
        </motion.aside>}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main style={{flex:1,overflow:'hidden'}}>

        {/* HERO — with gold ambient background */}
        <div style={{position:'relative',overflow:'hidden',padding:'48px 32px 32px',textAlign:'center',minHeight:360,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          {/* Ambient gold orbs */}
          <div className="ambient-orb" style={{width:400,height:400,top:'-15%',left:'20%',background:'radial-gradient(circle,rgba(184,134,11,0.07) 0%,transparent 60%)'}}/>
          <div className="ambient-orb" style={{width:300,height:300,bottom:'-10%',right:'15%',background:'radial-gradient(circle,rgba(184,134,11,0.05) 0%,transparent 60%)',animationDelay:'-7s'}}/>
          <div className="ambient-orb" style={{width:200,height:200,top:'30%',right:'40%',background:'radial-gradient(circle,rgba(15,15,35,0.03) 0%,transparent 60%)',animationDelay:'-14s'}}/>
          {/* Gold grid pattern */}
          <div className="gold-grid"/>
          {/* Particle field */}
          <div style={{position:'absolute',inset:0,overflow:'hidden',opacity:0.35}}><ParticleField/></div>

          <div style={{position:'relative',zIndex:2}}>
            <motion.p initial={{opacity:0}} animate={{opacity:0.8}} transition={{delay:0.2}} className="eyebrow" style={{marginBottom:16}}>Financial Intelligence</motion.p>
            <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="section-title" style={{marginBottom:14,maxWidth:600,margin:'0 auto 14px'}}>Where Markets Meet <em>Clarity</em></motion.h1>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} style={{fontSize:'0.9rem',color:'var(--text-sec)',maxWidth:460,margin:'0 auto 28px',lineHeight:1.7}}>Six verticals. One picture. Live data from global equities, crypto, macro, commodities, FX, and geopolitics.</motion.p>
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.65}} style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/markets" className="btn-gold">Live Markets →</Link>
              <Link href="/research" className="btn-outline">Research</Link>
            </motion.div>
          </div>
        </div>

        <div className="gold-divider"/>

        {/* ══ FEATURED RESEARCH — immediately visible ══ */}
        {featured&&<Section><div style={{padding:'28px 32px',position:'relative'}}>
          {/* Background glow */}
          <div style={{position:'absolute',top:0,right:0,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.04) 0%,transparent 60%)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'var(--gold)',boxShadow:'0 0 8px rgba(184,134,11,0.4)'}}/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.2em',color:'var(--gold)',fontWeight:600}}>FEATURED RESEARCH</span>
          </div>
          <Link href={`/research/${featured.slug}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
            <div style={{background:'linear-gradient(135deg,var(--bg-warm) 0%,var(--gold-tint) 100%)',border:'1px solid var(--gold-pale)',padding:'28px 24px',borderLeft:'3px solid var(--gold)',transition:'all 0.3s ease',position:'relative',overflow:'hidden',borderRadius:4}}>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                {featured.tags?.map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.08em',padding:'3px 10px',background:`${v.hex}12`,color:v.hex,borderRadius:2}}>{v.labelShort}</span>:null;})}
              </div>
              <h3 style={{fontFamily:'var(--font-serif)',fontSize:'1.5rem',fontWeight:500,color:'var(--navy)',lineHeight:1.3,marginBottom:10}}>{featured.title}</h3>
              <p style={{fontSize:'0.88rem',color:'var(--text-sec)',lineHeight:1.7,maxWidth:640}}>{featured.excerpt}</p>
              <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'var(--text-muted)',flexWrap:'wrap'}}>
                <span>BTC ${btc?.usd?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'}</span>
                <span style={{color:btc?.usd_24h_change>0?'var(--green)':'var(--red)'}}>{btc?.usd_24h_change>0?'+':''}{btc?.usd_24h_change?.toFixed(1)}%</span>
                <span style={{marginLeft:'auto',color:'var(--gold)'}}>{featured.date} · {featured.readTime} → Read</span>
              </div>
            </div>
          </Link>
        </div></Section>}

        <div className="gold-divider" style={{margin:'0 32px'}}/>

        {/* ══ MARKET PULSE ══ */}
        <Section><div style={{padding:'28px 32px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
            <div className="s2d-pulse" style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px rgba(45,143,94,0.3)'}}/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.18em',color:'var(--green)',fontWeight:500}}>MARKET PULSE</span>
            <span style={{marginLeft:'auto',fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'var(--text-muted)'}}>{time}</span>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:12}}>
            <StatCard name="S&P 500" val={indices?.sp500?.val||5780} chg={indices?.sp500?.chg} color="#B8860B" spark={fakeSparkline(5700,150)}/>
            <StatCard name="BITCOIN" val={btc?.usd||68980} chg={btc?.usd_24h_change} color="#B8860B" prefix="$" spark={fakeSparkline(67000,2500)}/>
            <StatCard name="GOLD" val={commod?.gold||2920} chg={commod?.goldChg} color="#8B5E3C" prefix="$" spark={fakeSparkline(2900,60)}/>
            <StatCard name="WTI OIL" val={commod?.oil||67.4} chg={commod?.oilChg} color="#8B5E3C" prefix="$" dec={2} spark={fakeSparkline(68,3)}/>
            <StatCard name="VIX" val={vixVal||25.7} chg={indices?.vix?.chg} color="#C0392B" dec={1} spark={fakeSparkline(24,4)}/>
            <StatCard name="NAT GAS" val={commod?.natgas||4.12} chg={commod?.natgasChg} color="#8B5E3C" prefix="$" dec={2} spark={fakeSparkline(4,0.5)}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:10,marginBottom:12}}>
            <TVCandlestickChart data={btcCandles} title="BTC / USD" height={300}/>
            <TVCandlestickChart data={ethCandles} title="ETH / USD" height={300}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
            <DataCard title="MACRO & CENTRAL BANKS" color="#3B6CB4" rows={[{l:'Fed Rate',v:(macro?.fedRate||'-')+'%',c:'#3B6CB4'},{l:'10Y Yield',v:(macro?.t10y||'-')+'%',c:'#3B6CB4'},{l:'CPI',v:macro?.cpi||'-',c:'#8B5E3C'},{l:'Unemployment',v:(macro?.unemp||'-')+'%',c:'#C0392B'},{l:'Dollar (DXY)',v:macro?.dxy||'-',c:'#2D8F5E'}]}/>
            <DataCard title="FX RATES" color="#2D8F5E" rows={fx?[{l:'EUR/USD',v:(1/fx.EUR).toFixed(4),c:'#2D8F5E'},{l:'GBP/USD',v:(1/fx.GBP).toFixed(4),c:'#2D8F5E'},{l:'USD/JPY',v:fx.JPY?.toFixed(2),c:'#2D8F5E'},{l:'USD/CHF',v:fx.CHF?.toFixed(4),c:'#2D8F5E'}]:[]}/>
            <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'16px 12px',textAlign:'center',borderRadius:4}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold)',display:'block',marginBottom:10,fontWeight:600}}>FEAR & GREED INDEX</span>
              <FearGreedGauge value={fgVal} label={fgLabel}/>
            </div>
            <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'14px 12px',textAlign:'center',borderRadius:4}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold)',display:'block',marginBottom:6,fontWeight:600}}>BTC DOMINANCE</span>
              <div style={{width:90,margin:'0 auto'}}><ResponsiveContainer width="100%" height={90}><PieChart><Pie data={domData.map((d,i)=>({...d,value:i===0?(global?.btcDom||56.2):i===1?(global?.ethDom||10.1):100-(global?.btcDom||56.2)-(global?.ethDom||10.1)}))} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="value" strokeWidth={0}>{domData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'1rem',fontWeight:600,color:'var(--gold)'}}><AnimatedCounter value={global?.btcDom||56.2} suffix="%" decimals={1} className=""/></span>
            </div>
          </div>
        </div></Section>

        <div className="gold-divider" style={{margin:'0 32px'}}/>

        {/* ══ VERTICALS ══ */}
        <Section delay={0.1}><div style={{padding:'32px 32px',position:'relative'}}>
          {/* Ambient background */}
          <div style={{position:'absolute',bottom:'-20%',left:'10%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.03) 0%,transparent 50%)',pointerEvents:'none',filter:'blur(40px)'}}/>
          <p className="eyebrow" style={{marginBottom:8}}>Our Coverage</p>
          <h2 className="section-title" style={{marginBottom:6}}>Six Perspectives. <em>One Picture.</em></h2>
          <p style={{fontSize:'0.85rem',color:'var(--text-sec)',maxWidth:520,marginBottom:20,lineHeight:1.7}}>Markets are interconnected. We analyze each vertical independently and show how everything connects.</p>
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
          <p style={{fontSize:'0.85rem',color:'var(--text-sec)',textAlign:'center',marginTop:20,maxWidth:600,margin:'20px auto 0'}}><strong style={{color:'var(--navy)'}}>Fed rate decision</strong> → Dollar → Gold & Oil → EM Currencies → Crypto allocation. <strong style={{color:'var(--navy)'}}>We connect these dots.</strong></p>
        </div></Section>

        <div className="gold-divider" style={{margin:'0 32px'}}/>

        {/* ══ NEWSLETTER CTA ══ */}
        <Section delay={0.2}><div style={{padding:'0 32px 40px',marginTop:32}}>
          <div style={{background:'var(--navy)',padding:'48px 32px',textAlign:'center',borderRadius:4,position:'relative',overflow:'hidden'}}>
            {/* Gold ambient orbs */}
            <div style={{position:'absolute',top:-60,right:-40,width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.12) 0%,transparent 60%)',pointerEvents:'none'}}/>
            <div style={{position:'absolute',bottom:-40,left:-30,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.08) 0%,transparent 60%)',pointerEvents:'none'}}/>
            <div className="gold-grid" style={{opacity:0.5}}/>
            <div style={{position:'relative',zIndex:1}}>
              <p style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.3em',color:'var(--gold-light)',marginBottom:12}}>NEWSLETTER</p>
              <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:400,color:'#fff',marginBottom:12}}>Stay <em style={{fontStyle:'italic',color:'var(--gold-light)'}}>Informed</em></h2>
              <p style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.5)',maxWidth:440,margin:'0 auto 24px',lineHeight:1.7}}>Investor briefings directly to your inbox. Choose your topics. No spam, only substance.</p>
              <Link href="/newsletter" style={{display:'inline-block',fontFamily:'var(--font-sans)',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',padding:'14px 36px',background:'linear-gradient(135deg,var(--gold) 0%,var(--gold-dark) 100%)',color:'#fff',borderRadius:2,textDecoration:'none',boxShadow:'0 4px 20px rgba(184,134,11,0.3)',transition:'all 0.35s'}}>Subscribe to Newsletter</Link>
            </div>
          </div>
        </div></Section>

      </main>
    </div>
  </div>;
}
