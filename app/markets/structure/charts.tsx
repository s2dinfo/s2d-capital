'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#1e2240',border:'1px solid rgba(255,255,255,0.1)',borderRadius:2,color:'rgba(255,255,255,0.8)'};
export default function StructCharts({defiChart}:any) {
  if(!defiChart) return null;
  return (
    <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
      <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#5B4FA0',marginBottom:10}}>TOTAL DEFI TVL / 30 DAYS</p>
      <ResponsiveContainer width="100%" height={260}><AreaChart data={defiChart}><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2}/><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>'$'+v+'B'}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v+'B','TVL']}/><Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#dg)"/></AreaChart></ResponsiveContainer>
    </div>
  );
}
