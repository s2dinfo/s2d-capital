"use client";
import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
interface Props { value?: number; label?: string; }
export default function FearGreedGauge({ value=50, label="Neutral" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const spring = useSpring(0, { stiffness: 30, damping: 15 });
  const rotation = useTransform(spring, [0,100], [-135,135]);
  const displayVal = useTransform(spring, (v: number) => Math.round(v));
  useEffect(() => { if (isInView) spring.set(value); }, [isInView, value, spring]);
  const color = value<=25?"#C0392B":value<=45?"#E88A3C":value<=55?"#B8860B":value<=75?"#2D8F5E":"#1A8A7A";
  return (
    <motion.div ref={ref} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <div style={{position:'relative',width:160,height:100}}>
        <svg width="160" height="100" viewBox="0 0 180 110" style={{overflow:"visible"}}>
          <defs><linearGradient id="fgGaugeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C0392B"/><stop offset="25%" stopColor="#E88A3C"/><stop offset="50%" stopColor="#B8860B"/><stop offset="75%" stopColor="#2D8F5E"/><stop offset="100%" stopColor="#1A8A7A"/></linearGradient></defs>
          <path d="M 15 100 A 75 75 0 0 1 165 100" fill="none" stroke="#E8E6E0" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 15 100 A 75 75 0 0 1 165 100" fill="none" stroke="url(#fgGaugeGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
          {[0,25,50,75,100].map(tick=>{const angle=(-135+(tick/100)*270)*(Math.PI/180);return <line key={tick} x1={90+80*Math.cos(angle)} y1={100+80*Math.sin(angle)} x2={90+86*Math.cos(angle)} y2={100+86*Math.sin(angle)} stroke="#9C9CAF" strokeWidth="1.5"/>;})}
        </svg>
        <motion.div style={{position:'absolute',bottom:10,left:'50%',width:2,height:52,background:'linear-gradient(to top,#1A1A2E,transparent)',transformOrigin:'bottom center',rotate:rotation,marginLeft:-1,borderRadius:1}}/>
        <div style={{position:'absolute',bottom:5,left:'50%',width:8,height:8,background:'#1A1A2E',borderRadius:'50%',transform:'translateX(-50%)',boxShadow:'0 0 4px rgba(26,26,46,0.2)'}}/>
      </div>
      <div style={{textAlign:'center',marginTop:-2}}>
        <motion.div style={{fontFamily:'var(--font-mono)',fontSize:'1.4rem',fontWeight:700,color}}>{displayVal}</motion.div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color,letterSpacing:'0.1em',textTransform:'uppercase' as const,fontWeight:600}}>{label}</div>
      </div>
    </motion.div>
  );
}
