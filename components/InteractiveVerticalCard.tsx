"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
interface Props { title:string; subtitle:string; shortLabel:string; tags:string[]; color:string; href:string; index:number; }
export default function InteractiveVerticalCard({title,subtitle,shortLabel,tags,color,href,index}:Props) {
  const [h, setH] = useState(false);
  return (
    <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:0.5,delay:index*0.08}}>
      <Link href={href} style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{position:'relative',overflow:'hidden',borderRadius:4,padding:'20px 18px',cursor:'pointer',background:h?'var(--bg-cream)':'var(--bg-warm)',border:`1px solid ${h?color+'44':'var(--border-lt)'}`,transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',transform:h?'translateY(-3px)':'translateY(0)',boxShadow:h?`0 8px 28px ${color}12`:'none'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:100,height:100,borderRadius:'50%',background:`radial-gradient(circle,${color}${h?'10':'00'} 0%,transparent 70%)`,transition:'all 0.4s ease',pointerEvents:'none'}}/>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',fontWeight:700,marginBottom:6,letterSpacing:'0.12em',color,transition:'transform 0.3s ease',transform:h?'scale(1.03)':'scale(1)'}}>{shortLabel.toUpperCase()}</div>
          <div style={{fontFamily:'var(--font-sans)',fontSize:'0.9rem',fontWeight:600,color:'var(--navy)',marginBottom:4}}>{title}</div>
          <div style={{fontFamily:'var(--font-sans)',fontSize:'0.78rem',color:'var(--text-sec)',marginBottom:12}}>{subtitle}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {tags.map(tag=><span key={tag} style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',padding:'3px 8px',borderRadius:2,background:h?`${color}12`:'var(--bg-section)',color:h?color:'var(--text-muted)',transition:'all 0.25s ease'}}>{tag}</span>)}
          </div>
          <div style={{position:'absolute',bottom:0,left:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`,width:h?'100%':'0%',transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)'}}/>
        </div>
      </Link>
    </motion.div>
  );
}
