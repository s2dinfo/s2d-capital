'use client';
import { useMarketData } from '@/hooks/useMarketData';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { VERTICALS } from '@/lib/verticals';
import { articles } from '@/lib/articles';
import dynamic from 'next/dynamic';
const TVChart = dynamic(() => import('@/components/TVChart'), { ssr: false, loading: () => <div style={{ height: 300, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }} /> });
import FearGreedGauge from '@/components/FearGreedGauge';
import Watchlist from '@/components/Watchlist';
import EconomicCalendar from '@/components/EconomicCalendar';
import AnimatedCounter from '@/components/AnimatedCounter';
import GlowCard from '@/components/GlowCard';

/* ── Topics config ── */
const TOPICS = [
  {key:'crypto',icon:'₿',label:'Crypto',sub:'ETFs, DeFi, Regulation',color:'#B8860B',dataHref:'/markets/crypto',articleHref:'/research'},
  {key:'macro',icon:'🏛',label:'Macro',sub:'Fed, ECB, Rates',color:'#3B6CB4',dataHref:'/markets/macro',articleHref:'/research'},
  {key:'commodities',icon:'🛢',label:'Commodities',sub:'Gold, Oil, Nat Gas',color:'#8B5E3C',dataHref:'/markets/commodities',articleHref:'/research'},
  {key:'fx',icon:'💱',label:'FX',sub:'EUR/USD, DXY',color:'#2D8F5E',dataHref:'/markets/fx',articleHref:'/research'},
  {key:'geopolitics',icon:'🌍',label:'Geopolitics',sub:'Tariffs, Sanctions',color:'#8B2252',dataHref:'/markets/geopolitics',articleHref:'/research'},
];

/* ── Orbital Topic Node ── */
function OrbitNode({t,index,total,selected,onSelect,radius,containerSize,small}:{t:typeof TOPICS[0];index:number;total:number;selected:string|null;onSelect:(k:string)=>void;radius:number;containerSize:number;small:boolean}) {
  const NODE_SIZE = small ? 66 : 88;
  const NODE_SIZE_ACTIVE = small ? 72 : 96;
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const cx = containerSize / 2 + Math.cos(angle) * radius;
  const cy = containerSize / 2 + Math.sin(angle) * radius;
  const isSelected = selected === t.key;
  const [h, setH] = useState(false);
  const [btnHover, setBtnHover] = useState<'data'|'articles'|null>(null);
  const size = isSelected ? NODE_SIZE_ACTIVE : NODE_SIZE;

  return (
    <motion.div
      initial={{opacity:0,scale:0}}
      animate={{opacity:1,scale:1}}
      transition={{delay:1.1 + index*0.1,duration:0.5,ease:[0.16,1,0.3,1]}}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      onClick={()=>onSelect(isSelected?'':t.key)}
      style={{
        position:'absolute',
        /* Position so the circle center sits exactly on the orbit point */
        left: cx - size/2,
        top: cy - size/2,
        width: size,
        cursor:'pointer',zIndex:isSelected?10:2,
        display:'flex',flexDirection:'column',alignItems:'center',
        transition:'left 0.3s, top 0.3s, width 0.3s',
      }}
    >
      {/* Glow ring — positioned relative to circle */}
      {isSelected && <motion.div layoutId="orbitGlow" style={{position:'absolute',top:-10,left:-10,width:size+20,height:size+20,borderRadius:'50%',border:`2px solid ${t.color}66`,boxShadow:`0 0 30px ${t.color}33`,pointerEvents:'none'}} transition={{type:'spring',stiffness:300,damping:25}}/>}

      {/* Node circle — fixed size, always centered */}
      <div style={{
        width:size,height:size,borderRadius:'50%',flexShrink:0,
        background:isSelected?`radial-gradient(circle,${t.color}30,rgba(17,25,40,0.9))`:`radial-gradient(circle,rgba(17,25,40,0.9),rgba(17,25,40,0.7))`,
        backdropFilter:'blur(12px)',
        border:`1.5px solid ${isSelected?t.color:h?t.color+'66':'rgba(255,255,255,0.1)'}`,
        display:'flex',alignItems:'center',justifyContent:'center',
        transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:isSelected?`0 0 40px ${t.color}30`:h?`0 4px 24px rgba(0,0,0,0.4)`:'none',
        transform:h&&!isSelected?'scale(1.08)':'scale(1)',
      }}>
        <span style={{fontSize:isSelected?(small?'1.6rem':'2.2rem'):(small?'1.3rem':'1.8rem'),transition:'font-size 0.3s',filter:isSelected?`drop-shadow(0 0 10px ${t.color}60)`:'none',lineHeight:1}}>{t.icon}</span>
      </div>

      {/* Label — flows below circle, centered */}
      <div style={{marginTop:8,whiteSpace:'nowrap',textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-mono)',fontSize:small?'0.55rem':'0.65rem',fontWeight:600,color:isSelected?t.color:'rgba(255,255,255,0.6)',letterSpacing:'0.06em',transition:'color 0.2s'}}>{t.label}</div>
        {isSelected && !small && <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',color:'rgba(255,255,255,0.35)',marginTop:3}}>{t.sub}</motion.div>}
      </div>

      {/* Expanded buttons — desktop only, mobile shows them below orbit */}
      {!small && <AnimatePresence>
        {isSelected && (
          <motion.div initial={{opacity:0,scale:0.8,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.8}} transition={{type:'spring',stiffness:400,damping:25}} style={{display:'flex',gap:8,marginTop:10,justifyContent:'center'}}>
            <Link href={t.dataHref} onClick={e=>e.stopPropagation()}
              onMouseEnter={()=>setBtnHover('data')} onMouseLeave={()=>setBtnHover(null)}
              style={{
                fontFamily:'var(--font-sans)',fontSize:'0.62rem',fontWeight:600,padding:'8px 18px',borderRadius:5,textDecoration:'none',whiteSpace:'nowrap',letterSpacing:'0.04em',
                background:btnHover==='data'?t.color:btnHover==='articles'?'transparent':t.color,
                color:btnHover==='data'?'#fff':btnHover==='articles'?'rgba(255,255,255,0.5)':'#fff',
                border:`1.5px solid ${t.color}`,
                boxShadow:btnHover==='data'||btnHover===null?`0 4px 16px ${t.color}44`:'none',
                transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform:btnHover==='data'?'translateY(-1px)':'translateY(0)',
              }}>Markets</Link>
            <Link href={t.articleHref} onClick={e=>e.stopPropagation()}
              onMouseEnter={()=>setBtnHover('articles')} onMouseLeave={()=>setBtnHover(null)}
              style={{
                fontFamily:'var(--font-sans)',fontSize:'0.62rem',fontWeight:600,padding:'8px 18px',borderRadius:5,textDecoration:'none',whiteSpace:'nowrap',letterSpacing:'0.04em',
                background:btnHover==='articles'?t.color:'transparent',
                color:btnHover==='articles'?'#fff':btnHover==='data'?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.65)',
                border:`1.5px solid ${btnHover==='articles'?t.color:t.color+'66'}`,
                boxShadow:btnHover==='articles'?`0 4px 16px ${t.color}44`:'none',
                transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform:btnHover==='articles'?'translateY(-1px)':'translateY(0)',
              }}>Articles</Link>
          </motion.div>
        )}
      </AnimatePresence>}
    </motion.div>
  );
}

/* ── Orbital Selector ── */
function OrbitSelector({selected,onSelect}:{selected:string|null;onSelect:(k:string)=>void}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return ()=>window.removeEventListener('resize', check);
  },[]);

  const radius = isMobile ? 100 : 200;
  const containerSize = radius * 2 + (isMobile ? 140 : 200);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:0.6}} style={{position:'relative',width:containerSize,height:containerSize,margin:'0 auto',maxWidth:'100vw'}}>
      {/* Center hub */}
      {(() => { const hubSize = isMobile ? 48 : 60; return (
      <motion.div initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:1,duration:0.6,ease:[0.16,1,0.3,1]}} style={{position:'absolute',left:containerSize/2-hubSize/2,top:containerSize/2-hubSize/2,width:hubSize,height:hubSize,zIndex:3}}>
        <div style={{width:hubSize,height:hubSize,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.25),rgba(17,25,40,0.85))',border:'1.5px solid rgba(184,134,11,0.35)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 50px rgba(184,134,11,0.2)'}}>
          <span style={{fontFamily:'var(--font-display)',fontSize:isMobile?'0.6rem':'0.75rem',fontWeight:700,color:'var(--gold-light)',letterSpacing:'-0.02em'}}>S2D</span>
        </div>
      </motion.div>); })()}

      {/* Connecting lines + orbit ring (SVG) */}
      <svg style={{position:'absolute',inset:0,width:containerSize,height:containerSize,pointerEvents:'none',zIndex:1}} viewBox={`0 0 ${containerSize} ${containerSize}`}>
        {TOPICS.map((_,i) => {
          const angle = (i / TOPICS.length) * 2 * Math.PI - Math.PI / 2;
          const lx = containerSize/2 + radius * Math.cos(angle);
          const ly = containerSize/2 + radius * Math.sin(angle);
          return <line key={i} x1={containerSize/2} y1={containerSize/2} x2={lx} y2={ly} stroke={selected===TOPICS[i].key?TOPICS[i].color+'44':"rgba(184,134,11,0.08)"} strokeWidth={selected===TOPICS[i].key?1.5:1} strokeDasharray="4,4" style={{transition:'stroke 0.3s'}}/>;
        })}
        <circle cx={containerSize/2} cy={containerSize/2} r={radius} fill="none" stroke="rgba(184,134,11,0.06)" strokeWidth={1} strokeDasharray="2,6"/>
      </svg>

      {/* Topic nodes */}
      {TOPICS.map((t,i)=>(
        <OrbitNode key={t.key} t={t} index={i} total={TOPICS.length} selected={selected} onSelect={onSelect} radius={radius} containerSize={containerSize} small={isMobile}/>
      ))}

      {/* Mobile: buttons below the orbit */}
      {isMobile && (() => {
        const sel = TOPICS.find(t=>t.key===selected);
        if (!sel) return null;
        return (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} key={sel.key} style={{position:'absolute',bottom:-16,left:0,right:0,display:'flex',gap:10,justifyContent:'center'}}>
            <Link href={sel.dataHref} style={{fontFamily:'var(--font-sans)',fontSize:'0.7rem',fontWeight:600,padding:'10px 22px',borderRadius:6,background:sel.color,color:'#fff',textDecoration:'none',border:`1.5px solid ${sel.color}`,boxShadow:`0 4px 16px ${sel.color}44`}}>Markets</Link>
            <Link href={sel.articleHref} style={{fontFamily:'var(--font-sans)',fontSize:'0.7rem',fontWeight:600,padding:'10px 22px',borderRadius:6,background:'transparent',color:'rgba(255,255,255,0.65)',textDecoration:'none',border:`1.5px solid ${sel.color}66`}}>Articles</Link>
          </motion.div>
        );
      })()}
    </motion.div>
  );
}

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
      const isOpen = isWeekday && mins >= 570 && mins < 960;

      if (isOpen) {
        const left = 960 - mins;
        const lh = Math.floor(left / 60);
        const lm = left % 60;
        setStatus({ open: true, text: `Closes in ${lh}h ${lm}m` });
      } else {
        let daysUntil = 0;
        let nextDay = day;
        if (isWeekday && mins < 570) {
          daysUntil = 0;
        } else {
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
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:status.open?'var(--green)':'#C0392B',boxShadow:status.open?'0 0 8px rgba(45,143,94,0.6)':'0 0 8px rgba(192,57,43,0.6)',animation:status.open?'breathe 3s ease-in-out infinite':'none'}}/>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.08em',color:status.open?'var(--green)':'#C0392B',fontWeight:600}}>{status.open?'OPEN':'CLOSED'}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.3)'}}>{status.text}</span>
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

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const copies = setWidth > 0 ? Math.max(2, Math.ceil((vw * 2) / setWidth) + 1) : 3;
  const speed = 35;
  const duration = setWidth > 0 ? setWidth / speed : 30;

  const renderSet = (key: string) => (
    <div key={key} style={{display:'flex',alignItems:'center',flexShrink:0}}>
      {items.map((item,i)=>(
        <span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,marginRight:36,fontFamily:'var(--font-mono)',fontSize:'0.64rem',whiteSpace:'nowrap',flexShrink:0}}>
          <span style={{color:'rgba(255,255,255,0.4)',fontWeight:400,flexShrink:0}}>{item.l}</span>
          <span style={{color:item.c||'rgba(255,255,255,0.9)',fontWeight:600,flexShrink:0}}>{item.v}</span>
          <span style={{color:'rgba(255,255,255,0.08)',marginLeft:4,fontSize:'0.5rem',flexShrink:0}}>│</span>
        </span>
      ))}
    </div>
  );

  return (
    <div style={{background:'rgba(0,0,0,0.5)',borderBottom:'1px solid rgba(184,134,11,0.12)',overflow:'hidden',whiteSpace:'nowrap',height:36,position:'relative'}}>
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

/* ── Stat Card — premium version ── */
function StatCard({name,val,chg,color,prefix,dec,spark,href}:any){
  const[h,setH]=useState(false);
  const inner = (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      background: h ? 'rgba(17,25,40,0.8)' : 'rgba(17,25,40,0.5)',
      backdropFilter: 'blur(12px)',
      border:`1px solid ${h?color+'44':'rgba(255,255,255,0.06)'}`,
      padding:'18px 16px',transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      transform:h?'translateY(-3px)':'translateY(0)',
      boxShadow:h?`0 12px 40px ${color}15, 0 0 0 1px ${color}22`:'none',
      position:'relative',overflow:'hidden',borderRadius:8
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.1em',color,fontWeight:500}}>{name}</span>
        {chg!==null&&chg!==undefined&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',fontWeight:600,color:pc(chg),padding:'2px 6px',background:chg>0?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)',borderRadius:3}}>{fp(chg)}</span>}
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'1.35rem',fontWeight:700,color:'#fff',marginBottom:6,fontVariantNumeric:'tabular-nums',letterSpacing:'-0.02em'}}>
        {val != null && val !== 0 ? `${prefix||''}${Number(val).toLocaleString('en-US',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0})}` : '—'}
      </div>
      <Mini data={spark} color={color}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,opacity:h?1:0,transition:'opacity 0.4s ease'}}/>
    </div>
  );
  if(href) return <Link href={href} style={{textDecoration:'none',color:'inherit',display:'block'}}>{inner}</Link>;
  return inner;
}

/* ── Data Card ── */
function DataCard({title,color,rows}:{title:string;color:string;rows:{l:string;v:string;c?:string}[]}){
  return <div style={{background:'rgba(17,25,40,0.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px 14px',borderRadius:8}}>
    <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color,display:'block',marginBottom:12,fontWeight:600}}>{title}</span>
    {rows.map(m=><div key={m.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
      <span style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.45)',fontFamily:'var(--font-sans)'}}>{m.l}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',fontWeight:500,color:m.c||color}}>{m.v}</span>
    </div>)}
  </div>;
}

/* ── Loading Skeleton ── */
function PulseSkeleton() {
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
    {[1,2,3,4,5,6].map(i=><div key={i} style={{background:'rgba(17,25,40,0.5)',border:'1px solid rgba(255,255,255,0.06)',padding:'18px 16px',borderRadius:8,overflow:'hidden',position:'relative'}}>
      <div style={{width:'40%',height:10,background:'rgba(255,255,255,0.06)',borderRadius:3,marginBottom:14}}/>
      <div style={{width:'65%',height:22,background:'rgba(255,255,255,0.04)',borderRadius:3,marginBottom:10}}/>
      <div style={{width:'100%',height:44,background:'rgba(255,255,255,0.02)',borderRadius:3}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)',animation:'shimmer 1.5s infinite'}}/>
    </div>)}
  </div>;
}

/* ── Vertical Card — premium with glow border ── */
function VerticalCard({title,subtitle,shortLabel,tags,color,href,index}:{title:string;subtitle:string;shortLabel:string;tags:string[];color:string;href:string;index:number}) {
  const [h, setH] = useState(false);
  return (
    <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:0.5,delay:index*0.08}}>
      <Link href={href} style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <GlowCard color={h?`${color}88`:`${color}33`}>
          <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:'22px 18px',transition:'all 0.3s',minHeight:160}}>
            {/* Short label */}
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.12em',color,marginBottom:8,transition:'transform 0.3s',transform:h?'translateX(4px)':'none'}}>{shortLabel.toUpperCase()}</div>
            {/* Title */}
            <div style={{fontFamily:'var(--font-sans)',fontSize:'0.92rem',fontWeight:600,color:'#fff',marginBottom:4,lineHeight:1.3}}>{title}</div>
            {/* Subtitle */}
            <div style={{fontFamily:'var(--font-sans)',fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',marginBottom:14,lineHeight:1.4}}>{subtitle}</div>
            {/* Tags */}
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {tags.map(tag=><span key={tag} style={{fontFamily:'var(--font-mono)',fontSize:'0.58rem',padding:'3px 8px',borderRadius:3,background:h?`${color}18`:'rgba(255,255,255,0.04)',color:h?color:'rgba(255,255,255,0.3)',transition:'all 0.25s',border:`1px solid ${h?color+'22':'transparent'}`}}>{tag}</span>)}
            </div>
          </div>
        </GlowCard>
      </Link>
    </motion.div>
  );
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
  const[sidebarOpen,setSidebarOpen]=useState(false);
  const[selectedTopic,setSelectedTopic]=useState<string|null>(null);
  useEffect(()=>{const iv=setInterval(()=>setTime(new Date().toLocaleTimeString('en-US',{hour12:false})),1000);setTime(new Date().toLocaleTimeString('en-US',{hour12:false}));return()=>clearInterval(iv);},[]);

  const fgVal=fg?.current?.value??50;const fgLabel=fg?.current?.label??'Neutral';
  const vixVal=indices?.vix?.val;const btc=prices?.bitcoin;
  const featured=articles.find((a:any)=>a.featured);

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

  return <div style={{background:'var(--bg)',color:'#fff',minHeight:'100vh',width:'100%',overflowX:'hidden',position:'relative'}}>
    <style>{`
      @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      @keyframes rippleOut{0%{transform:scale(0);opacity:1}100%{transform:scale(1.5);opacity:0}}
      @keyframes breathe{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.8;transform:scale(1.1)}}
      @keyframes heroGrid{0%{opacity:0.03}50%{opacity:0.06}100%{opacity:0.03}}
      @keyframes heroLineH{from{width:0;opacity:0}to{width:100%;opacity:1}}
      @keyframes heroLineV{from{height:0;opacity:0}to{height:100%;opacity:1}}
      @keyframes meshFloat1{0%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.95)}100%{transform:translate(0,0) scale(1)}}
      @keyframes meshFloat2{0%{transform:translate(0,0) scale(1)}33%{transform:translate(-30px,40px) scale(1.05)}66%{transform:translate(20px,-20px) scale(1.1)}100%{transform:translate(0,0) scale(1)}}
      .hero-mesh-1{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;animation:meshFloat1 20s ease-in-out infinite}
      .hero-mesh-2{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:meshFloat2 25s ease-in-out infinite}
      .gold-line{height:1px;background:linear-gradient(90deg,transparent 5%,rgba(184,134,11,0.25) 50%,transparent 95%)}
      .hp-section{padding-left:40px;padding-right:40px;max-width:1200px;margin-left:auto;margin-right:auto;box-sizing:border-box;width:100%}
      .hp-grid-verticals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .hp-grid-verticals-bottom{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:66.666%;margin:12px auto 0}
      .hp-grid-verticals>*,.hp-grid-verticals-bottom>*{min-width:0;overflow:hidden}
      .hp-grid-stats>*,.hp-grid-2col>*{min-width:0;overflow:hidden}
      .hp-grid-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .hp-grid-2col{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
      @media(max-width:768px){
        .hp-section{padding-left:16px;padding-right:16px}
        .hp-grid-verticals{grid-template-columns:repeat(2,1fr)}
        .hp-grid-verticals-bottom{max-width:100%;grid-template-columns:repeat(2,1fr)}
        .hp-grid-stats{grid-template-columns:repeat(2,1fr)}
        .hp-grid-2col{grid-template-columns:1fr}
      }
      @media(max-width:420px){
        .hp-section{padding-left:12px;padding-right:12px}
        .hp-grid-verticals{grid-template-columns:1fr;gap:8px}
        .hp-grid-verticals-bottom{max-width:100%;grid-template-columns:1fr;gap:8px;margin-top:8px}
        .hp-grid-stats{grid-template-columns:repeat(2,1fr);gap:8px}
      }
    `}</style>

    {/* ══ TICKER BAR ══ */}
    <HomeTicker items={marqueeItems} />

    {/* ══ MENU BUTTON (top-left) ══ */}
    <button aria-label="Toggle navigation menu" aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(!sidebarOpen)} style={{position:'fixed',top:44,left:20,zIndex:55,background:'rgba(15,15,35,0.85)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(184,134,11,0.15)',borderRadius:8,padding:'10px 12px',cursor:'pointer',transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.4)';e.currentTarget.style.boxShadow='0 4px 24px rgba(184,134,11,0.12)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.15)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.4)';}}>
      <div style={{width:18,height:2,background:'var(--gold-light)',marginBottom:4,borderRadius:1,transition:'all 0.3s',transform:sidebarOpen?'rotate(45deg) translateY(6px)':'none'}}/>
      <div style={{width:18,height:2,background:'var(--gold-light)',marginBottom:4,borderRadius:1,transition:'all 0.3s',opacity:sidebarOpen?0:1}}/>
      <div style={{width:18,height:2,background:'var(--gold-light)',borderRadius:1,transition:'all 0.3s',transform:sidebarOpen?'rotate(-45deg) translateY(-6px)':'none'}}/>
    </button>

    {/* ══ SIDE PANEL (overlay) ══ */}
    <AnimatePresence>
      {sidebarOpen && <>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSidebarOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:45,backdropFilter:'blur(6px)'}}/>
        <motion.div initial={{x:-300,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-300,opacity:0}} transition={{duration:0.3,ease:'easeOut'}}
          style={{position:'fixed',top:0,left:0,bottom:0,width:280,background:'rgba(15,15,35,0.96)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderRight:'1px solid rgba(184,134,11,0.1)',zIndex:46,overflowY:'auto',padding:'24px 0'}}>
          <div style={{padding:'80px 20px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:16}}>
            <Link href="/" onClick={()=>setSidebarOpen(false)} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:700,color:'var(--gold-light)',letterSpacing:'-0.02em'}}>S2D</span>
              <span style={{fontFamily:'var(--font-sans)',fontSize:'0.8rem',fontWeight:400,color:'rgba(255,255,255,0.5)'}}>Capital Insights</span>
            </Link>
          </div>
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:700,padding:'0 12px 8px'}}>NAVIGATE</div>
            {[{l:'Markets',h:'/markets'},{l:'Articles',h:'/research'},{l:'Newsletter',h:'/newsletter'},{l:'About',h:'/about'}].map(n=>
              <Link key={n.l} href={n.h} onClick={()=>setSidebarOpen(false)} style={{display:'block',padding:'11px 12px',fontFamily:'var(--font-sans)',fontSize:'0.92rem',fontWeight:500,color:'rgba(255,255,255,0.5)',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2}}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--gold-light)';e.currentTarget.style.background='rgba(184,134,11,0.06)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.5)';e.currentTarget.style.background='transparent';}}>{n.l}</Link>
            )}
          </div>
          <div style={{height:1,background:'rgba(255,255,255,0.05)',margin:'16px 20px'}}/>
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:700,padding:'0 12px 8px'}}>VERTICALS</div>
            {[{l:'Crypto & Digital Assets',h:'/markets/crypto',c:'#B8860B'},{l:'Macro & Central Banks',h:'/markets/macro',c:'#3B6CB4'},{l:'Commodities & Energy',h:'/markets/commodities',c:'#8B5E3C'},{l:'FX & Currencies',h:'/markets/fx',c:'#2D8F5E'},{l:'Geopolitics & Policy',h:'/markets/geopolitics',c:'#8B2252'}].map(v=>
              <Link key={v.l} href={v.h} onClick={()=>setSidebarOpen(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 12px',fontFamily:'var(--font-sans)',fontSize:'0.92rem',color:'rgba(255,255,255,0.5)',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2,fontWeight:500}}
                onMouseEnter={e=>{e.currentTarget.style.color=v.c;e.currentTarget.style.background='rgba(255,255,255,0.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.5)';e.currentTarget.style.background='transparent';}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:v.c,flexShrink:0}}/>{v.l}
              </Link>
            )}
          </div>
          <div style={{height:1,background:'rgba(255,255,255,0.05)',margin:'16px 20px'}}/>
          <div style={{padding:'0 8px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:700,padding:'0 12px 8px'}}>LATEST ARTICLES</div>
            {articles.slice(0,4).map((a:any)=>
              <Link key={a.slug} href={`/research/${a.slug}`} onClick={()=>setSidebarOpen(false)} style={{display:'block',padding:'10px 12px',textDecoration:'none',borderRadius:4,transition:'all 0.2s',marginBottom:2}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(184,134,11,0.06)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                <div style={{fontFamily:'var(--font-serif)',fontSize:'0.88rem',color:'rgba(255,255,255,0.7)',lineHeight:1.3,marginBottom:3}}>{a.title}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'rgba(255,255,255,0.2)'}}>{a.date} · {a.readTime}</div>
              </Link>
            )}
          </div>
          <div style={{padding:'12px 20px 0'}}>
            <a href="https://x.com/s2dinfo" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.3)',textDecoration:'none',transition:'color 0.2s'}} onMouseEnter={(e:any)=>{e.currentTarget.style.color='var(--gold-light)';}} onMouseLeave={(e:any)=>{e.currentTarget.style.color='rgba(255,255,255,0.3)';}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @s2dinfo
            </a>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>

    {/* ══ HERO — Premium Entrance ══ */}
    <div style={{position:'relative',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'72px 24px 48px'}}>

      {/* Background layer — clipped so glows don't bleed */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <div className="hero-mesh-1" style={{width:800,height:800,top:'-25%',left:'-15%',background:'radial-gradient(circle,rgba(184,134,11,0.18) 0%,rgba(184,134,11,0.05) 40%,transparent 70%)'}}/>
        <div className="hero-mesh-2" style={{width:600,height:600,bottom:'-20%',right:'-10%',background:'radial-gradient(circle,rgba(59,108,180,0.12) 0%,rgba(59,108,180,0.04) 40%,transparent 70%)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(184,134,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.03) 1px,transparent 1px)',backgroundSize:'80px 80px',animation:'heroGrid 10s ease-in-out infinite'}}/>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center, transparent 40%, var(--bg) 100%)'}}/>
      </div>

      {/* Content */}
      <div style={{position:'relative',zIndex:2,textAlign:'center',maxWidth:800}}>
        {/* Logo */}
        <motion.div initial={{opacity:0,scale:0.85,filter:'blur(10px)'}} animate={{opacity:1,scale:1,filter:'blur(0px)'}} transition={{duration:1,ease:[0.16,1,0.3,1]}}>
          <Image src="/logo-dark.png" alt="S2D Capital Insights" width={280} height={180} style={{objectFit:'contain',margin:'0 auto 24px',mixBlendMode:'lighten',filter:'drop-shadow(0 4px 40px rgba(184,134,11,0.12))',maxWidth:'70vw',height:'auto'}} priority/>
        </motion.div>

        {/* Eyebrow */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6,ease:[0.16,1,0.3,1]}} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:20}}>
          <div style={{width:40,height:1,background:'linear-gradient(90deg,transparent,var(--gold-light))'}}/>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.35em',color:'var(--gold-light)',fontWeight:500}}>FINANCIAL INTELLIGENCE</span>
          <div style={{width:40,height:1,background:'linear-gradient(90deg,var(--gold-light),transparent)'}}/>
        </motion.div>

        {/* Main headline */}
        <motion.h1 initial={{opacity:0,y:30,filter:'blur(8px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:0.5,duration:0.8,ease:[0.16,1,0.3,1]}} style={{fontFamily:'var(--font-serif)',fontSize:'clamp(2.4rem,6vw,4.2rem)',fontWeight:400,lineHeight:1.05,marginBottom:20,color:'#fff',letterSpacing:'-0.01em'}}>
          Where Markets{' '}
          <span className="gradient-text" style={{fontStyle:'italic'}}>Meet Clarity</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7,duration:0.6,ease:[0.16,1,0.3,1]}} style={{fontFamily:'var(--font-sans)',fontSize:'1rem',color:'rgba(255,255,255,0.5)',maxWidth:520,margin:'0 auto 40px',lineHeight:1.8,fontWeight:300}}>
          Six verticals. One picture. Real-time data across equities, crypto, macro, commodities, FX, and geopolitics.
        </motion.p>

      </div>

      {/* ── ORBITAL TOPIC SELECTOR ── */}
      <div style={{position:'relative',zIndex:2,width:'100%',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:0.5}} style={{fontFamily:'var(--font-mono)',fontSize:'0.7rem',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textAlign:'center',marginBottom:16,fontWeight:500}}>WHAT INTERESTS YOU?</motion.p>
        <OrbitSelector selected={selectedTopic} onSelect={setSelectedTopic}/>
      </div>
    </div>

    <div className="gold-line"/>

    {/* ══ FEATURED RESEARCH ══ */}
    {featured&&<Section><div className="hp-section" style={{paddingTop:36,paddingBottom:36}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
        <div style={{width:3,height:20,background:'var(--gold)',borderRadius:2}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:600}}>FEATURED RESEARCH</span>
      </div>
      <Link href={`/research/${featured.slug}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <GlowCard color="rgba(184,134,11,0.35)">
          <div style={{padding:'32px 28px',position:'relative'}}>
            <div style={{display:'flex',gap:6,marginBottom:14}}>
              {featured.tags?.map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.08em',padding:'3px 10px',background:`${v.hex}18`,color:v.hex,borderRadius:3,border:`1px solid ${v.hex}22`}}>{v.labelShort}</span>:null;})}
            </div>
            <h3 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.3rem,3vw,1.8rem)',fontWeight:500,color:'#fff',lineHeight:1.25,marginBottom:12}}>{featured.title}</h3>
            <p style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.45)',lineHeight:1.7,maxWidth:640,fontWeight:300}}>{featured.excerpt}</p>
            <div style={{display:'flex',alignItems:'center',gap:12,marginTop:20,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.3)',flexWrap:'wrap'}}>
              <span>BTC ${btc?.usd?.toLocaleString('en-US',{maximumFractionDigits:0})||'-'}</span>
              <span style={{color:(btc?.usd_24h_change??0)>0?'var(--green)':'var(--red)'}}>{(btc?.usd_24h_change??0)>0?'+':''}{btc?.usd_24h_change?.toFixed(1)}%</span>
              <span style={{marginLeft:'auto',color:'var(--gold-light)',fontWeight:500}}>{featured.date} · {featured.readTime} →</span>
            </div>
          </div>
        </GlowCard>
      </Link>
      {/* Other articles grid */}
      <div className="hp-grid-2col" style={{marginTop:14}}>
        {articles.filter((a:any)=>!a.featured).slice(0,3).map((a:any)=><Link key={a.slug} href={`/research/${a.slug}`} style={{textDecoration:'none',color:'inherit'}}>
          <div style={{background:'rgba(17,25,40,0.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.06)',padding:'20px 18px',borderRadius:8,transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(184,134,11,0.2)';e.currentTarget.style.background='rgba(17,25,40,0.7)';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';e.currentTarget.style.background='rgba(17,25,40,0.5)';e.currentTarget.style.transform='translateY(0)';}}>
            <div style={{display:'flex',gap:4,marginBottom:8}}>
              {a.tags?.slice(0,2).map((t:any)=>{const v=VERTICALS[t as keyof typeof VERTICALS];return v?<span key={t} style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.06em',padding:'2px 6px',background:`${v.hex}12`,color:v.hex,borderRadius:2}}>{v.labelShort}</span>:null;})}
            </div>
            <h4 style={{fontFamily:'var(--font-serif)',fontSize:'0.92rem',fontWeight:500,color:'rgba(255,255,255,0.85)',lineHeight:1.3,marginBottom:8}}>{a.title}</h4>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'rgba(255,255,255,0.25)'}}>{a.date} · {a.readTime}</span>
          </div>
        </Link>)}
      </div>
    </div></Section>}

    <div className="gold-line"/>

    {/* ══ MARKET PULSE ══ */}
    <Section><div className="hp-section" style={{paddingTop:36,paddingBottom:36}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:3,height:20,background:'var(--green)',borderRadius:2}}/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.18em',color:'var(--green)',fontWeight:500}}>MARKET PULSE</span>
          </div>
          <MarketStatusBadge/>
        </div>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.25)'}}>{time}{_md?.timestamp ? ' · '+new Date(_md.timestamp).toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit'}) : ''}</span>
      </div>

      {_loading ? <PulseSkeleton/> : <div className="hp-grid-stats" style={{marginBottom:14}}>
        <StatCard name="S&P 500" val={indices?.sp500?.val} chg={indices?.sp500?.chg} color="#B8860B" spark={sp('SPX')} href="/markets/macro"/>
        <StatCard name="BITCOIN" val={btc?.usd} chg={btc?.usd_24h_change} color="#B8860B" prefix="$" spark={sp('BTC')} href="/markets/crypto"/>
        <StatCard name="GOLD" val={commod?.gold} chg={commod?.goldChg} color="#D4A843" prefix="$" spark={sp('GOLD')} href="/markets/commodities"/>
        <StatCard name="WTI OIL" val={commod?.oil} chg={commod?.oilChg} color="#D4A843" prefix="$" dec={2} spark={sp('OIL')} href="/markets/commodities"/>
        <StatCard name="VIX" val={vixVal} chg={indices?.vix?.chg} color="#C0392B" dec={1} spark={sp('VIX')} href="/markets/macro"/>
        <StatCard name="NAT GAS" val={commod?.natgas} chg={commod?.natgasChg} color="#D4A843" prefix="$" dec={2} spark={sp('NATGAS')} href="/markets/commodities"/>
      </div>}

      <EconomicCalendar />

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

      <div className="hp-grid-2col" style={{marginBottom:14,marginTop:14}}>
        <TVChart symbol="BTC-USD" title="Bitcoin / USD" type="candlestick" range="3mo" color="#B8860B" height={300}/>
        <TVChart symbol="ETH-USD" title="Ethereum / USD" type="candlestick" range="3mo" color="#3B6CB4" height={300}/>
      </div>

      <div className="hp-grid-2col">
        <DataCard title="MACRO & CENTRAL BANKS" color="#6B9BD2" rows={[{l:'Fed Rate',v:(macro?.fedRate||'-')+'%',c:'#6B9BD2'},{l:'10Y Yield',v:(macro?.t10y||'-')+'%',c:'#6B9BD2'},{l:'CPI',v:macro?.cpi||'-',c:'#D4A843'},{l:'Unemployment',v:macro?.unemp||'-',c:'#E06B6B'},{l:'Dollar (DXY)',v:macro?.dxy||'-',c:'#4CAF7D'}]}/>
        <DataCard title="FX RATES" color="#4CAF7D" rows={fx?[{l:'EUR/USD',v:fx.EUR?(1/fx.EUR).toFixed(4):'-',c:'#4CAF7D'},{l:'GBP/USD',v:fx.GBP?(1/fx.GBP).toFixed(4):'-',c:'#4CAF7D'},{l:'USD/JPY',v:fx.JPY?fx.JPY.toFixed(2):'-',c:'#4CAF7D'},{l:'USD/CHF',v:fx.CHF?fx.CHF.toFixed(4):'-',c:'#4CAF7D'}]:[]}/>
        <div style={{background:'rgba(17,25,40,0.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.06)',padding:'18px 14px',textAlign:'center',borderRadius:8}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold-light)',display:'block',marginBottom:10,fontWeight:600}}>FEAR & GREED INDEX</span>
          <FearGreedGauge value={fgVal} label={fgLabel}/>
        </div>
        <div style={{background:'rgba(17,25,40,0.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.06)',padding:'16px 14px',textAlign:'center',borderRadius:8}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.12em',color:'var(--gold-light)',display:'block',marginBottom:8,fontWeight:600}}>BTC DOMINANCE</span>
          <div style={{width:90,margin:'0 auto'}}><ResponsiveContainer width="100%" height={90}><PieChart><Pie data={domData.map((d,i)=>({...d,value:i===0?(global?.btcDom||56.2):i===1?(global?.ethDom||10.1):100-(global?.btcDom||56.2)-(global?.ethDom||10.1)}))} cx="50%" cy="50%" innerRadius={28} outerRadius={40} dataKey="value" strokeWidth={0}>{domData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'1rem',fontWeight:600,color:'var(--gold-light)'}}><AnimatedCounter value={global?.btcDom||56.2} suffix="%" decimals={1} className=""/></span>
        </div>
      </div>
    </div></Section>

    <div className="gold-line"/>

    {/* ══ VERTICALS ══ */}
    <Section delay={0.1}><div className="hp-section" style={{paddingTop:40,paddingBottom:40,position:'relative'}}>
      {/* Section header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <div style={{width:3,height:20,background:'var(--gold)',borderRadius:2}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',letterSpacing:'0.2em',color:'var(--gold-light)',fontWeight:600}}>OUR COVERAGE</span>
      </div>
      <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,3.5vw,2.6rem)',fontWeight:400,color:'#fff',marginBottom:6}}>
        Five Perspectives. <span style={{fontFamily:'var(--font-serif)',fontWeight:400,fontStyle:'italic',color:'var(--gold-light)'}}>One Picture.</span>
      </h2>
      <p style={{fontFamily:'var(--font-sans)',fontSize:'0.88rem',color:'rgba(255,255,255,0.4)',maxWidth:540,marginBottom:24,lineHeight:1.7,fontWeight:300}}>Markets are interconnected. We analyze each vertical independently and show how everything connects.</p>
      {(() => {
        const verts = [
          {shortLabel:'Crypto',title:'Crypto & Digital Assets',subtitle:'Regulation, ETFs, Tokenization, DeFi',tags:['CLARITY','ETFs','BTC','DeFi'],color:'#B8860B',href:'/markets/crypto'},
          {shortLabel:'Macro',title:'Macro & Central Banks',subtitle:'Fed, ECB, BOJ, Rates, Liquidity',tags:['Fed','ECB','Rates','CPI'],color:'#3B6CB4',href:'/markets/macro'},
          {shortLabel:'Commodities',title:'Commodities & Energy',subtitle:'Oil, Gold, Agriculture, Supply Chains',tags:['Gold','Oil','Copper'],color:'#8B5E3C',href:'/markets/commodities'},
          {shortLabel:'FX',title:'FX & Currencies',subtitle:'Dollar, EUR/USD, EM Currencies, Stablecoins',tags:['DXY','EUR','Stablecoins'],color:'#2D8F5E',href:'/markets/fx'},
          {shortLabel:'Geopolitics',title:'Geopolitics & Policy',subtitle:'Trade Wars, Sanctions, Elections',tags:['Tariffs','Sanctions','EU'],color:'#8B2252',href:'/markets/geopolitics'},
        ];
        return <>
          <div className="hp-grid-verticals">
            {verts.slice(0,3).map((v,i)=><VerticalCard key={v.shortLabel} index={i} {...v}/>)}
          </div>
          <div className="hp-grid-verticals-bottom">
            {verts.slice(3).map((v,i)=><VerticalCard key={v.shortLabel} index={i+3} {...v}/>)}
          </div>
        </>;
      })()}
      <p style={{fontFamily:'var(--font-sans)',fontSize:'0.85rem',color:'rgba(255,255,255,0.35)',textAlign:'center',marginTop:24,maxWidth:600,margin:'24px auto 0',lineHeight:1.7}}>
        <strong style={{color:'#fff',fontWeight:600}}>Fed rate decision</strong> → Dollar → Gold & Oil → EM Currencies → Crypto allocation. <strong style={{color:'#fff',fontWeight:600}}>We connect these dots.</strong>
      </p>
    </div></Section>

    <div className="gold-line"/>

    {/* ══ NEWSLETTER CTA ══ */}
    <Section delay={0.15}><div className="hp-section" style={{paddingTop:8,paddingBottom:56,marginTop:36}}>
      <div style={{background:'rgba(17,25,40,0.5)',border:'1px solid rgba(184,134,11,0.15)',borderRadius:8}}>
        <div style={{padding:'56px 36px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          {/* Subtle grid inside */}
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(184,134,11,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(184,134,11,0.02) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',letterSpacing:'0.3em',color:'var(--gold-light)',marginBottom:14,display:'block'}}>NEWSLETTER</span>
            <h2 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:400,color:'#fff',marginBottom:14}}>
              Stay <span style={{fontFamily:'var(--font-serif)',fontWeight:400,fontStyle:'italic',color:'var(--gold-light)'}}>Informed</span>
            </h2>
            <p style={{fontFamily:'var(--font-sans)',fontSize:'0.9rem',color:'rgba(255,255,255,0.4)',maxWidth:440,margin:'0 auto 28px',lineHeight:1.8,fontWeight:300}}>Investor briefings directly to your inbox. Choose your topics. No spam, only substance.</p>
            <Link href="/newsletter" style={{display:'inline-block',fontFamily:'var(--font-sans)',fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase' as const,padding:'14px 40px',background:'linear-gradient(135deg,var(--gold),var(--gold-dark))',color:'#fff',borderRadius:4,textDecoration:'none',boxShadow:'0 4px 28px rgba(184,134,11,0.25)',transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)'}}>Subscribe to Newsletter</Link>
          </div>
        </div>
      </div>
    </div></Section>

    {/* ══ FOOTER ══ */}
    <footer className="hp-section" style={{paddingTop:32,paddingBottom:24,borderTop:'1px solid rgba(255,255,255,0.04)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontFamily:'var(--font-display)',fontSize:'0.95rem',fontWeight:700,color:'var(--gold-light)',letterSpacing:'-0.02em'}}>S2D</span>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'0.8rem',fontWeight:400,color:'rgba(255,255,255,0.4)'}}>Capital Insights</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <a href="https://x.com/s2dinfo" target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',textDecoration:'none',padding:'6px 14px',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,transition:'all 0.3s'}} onMouseEnter={(e:any)=>{e.currentTarget.style.color='var(--gold-light)';e.currentTarget.style.borderColor='rgba(184,134,11,0.25)';}} onMouseLeave={(e:any)=>{e.currentTarget.style.color='rgba(255,255,255,0.35)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            @s2dinfo
          </a>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'rgba(255,255,255,0.15)'}}>© {new Date().getFullYear()} S2D Capital Insights</span>
        </div>
      </div>
    </footer>
  </div>;
}
