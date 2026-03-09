'use client';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2};
export default function GeoCharts({yieldC,m2C}:any) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {yieldC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}><p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#8B2252',marginBottom:10}}>YIELD CURVE SPREAD / 3Y</p><ResponsiveContainer width="100%" height={220}><AreaChart data={yieldC}><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B2252" stopOpacity={0.15}/><stop offset="95%" stopColor="#8B2252" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={5}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>v+'%'}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v+'%','Spread']}/><Area type="monotone" dataKey="value" stroke="#8B2252" strokeWidth={2} fill="url(#yg)"/></AreaChart></ResponsiveContainer></div>}
      {m2C&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}><p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#3B6CB4',marginBottom:10}}>M2 MONEY SUPPLY / 2Y</p><ResponsiveContainer width="100%" height={220}><LineChart data={m2C}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>(v/1000).toFixed(0)+'T'}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+(v/1000).toFixed(1)+'T','M2']}/><Line type="monotone" dataKey="value" stroke="#3B6CB4" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>}
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
