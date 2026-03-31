'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#1e2240',border:'1px solid rgba(255,255,255,0.1)',borderRadius:2,color:'rgba(255,255,255,0.8)'};
export default function CommCharts({oilC,brentC}:any) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {oilC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}><p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#8B5E3C',marginBottom:10}}>WTI CRUDE OIL / 60 DAYS</p><ResponsiveContainer width="100%" height={220}><LineChart data={oilC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval={8}/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>'$'+v}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v.toFixed(2),'WTI']}/><Line type="monotone" dataKey="value" stroke="#8B5E3C" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>}
      {brentC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}><p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#B8860B',marginBottom:10}}>BRENT CRUDE OIL / 60 DAYS</p><ResponsiveContainer width="100%" height={220}><LineChart data={brentC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval={8}/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>'$'+v}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v.toFixed(2),'Brent']}/><Line type="monotone" dataKey="value" stroke="#B8860B" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>}
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
