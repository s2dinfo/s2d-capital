'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2};
export default function FxCharts({dxyC}:any) {
  if(!dxyC) return null;
  return (
    <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
      <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#2D8F5E',marginBottom:10}}>US DOLLAR INDEX / 30 DAYS</p>
      <ResponsiveContainer width="100%" height={250}><LineChart data={dxyC}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v.toFixed(2),'DXY']}/><Line type="monotone" dataKey="value" stroke="#2D8F5E" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
    </div>
  );
}
