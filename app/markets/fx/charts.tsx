'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#1e2240',border:'1px solid rgba(255,255,255,0.1)',borderRadius:2,color:'rgba(255,255,255,0.8)'};
export default function FxCharts({dxyC,eurusdC,usdjpyC}:any) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {dxyC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16,borderRadius:6}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#2D8F5E',marginBottom:10}}>US DOLLAR INDEX / 30 DAYS</p>
        <ResponsiveContainer width="100%" height={250}><LineChart data={dxyC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v.toFixed(2),'DXY']}/><Line type="monotone" dataKey="value" stroke="#2D8F5E" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
      </div>}
      {eurusdC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16,borderRadius:6}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#B8860B',marginBottom:10}}>EUR/USD / 30 DAYS</p>
        <ResponsiveContainer width="100%" height={250}><LineChart data={eurusdC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} domain={['auto','auto']}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v.toFixed(4),'EUR/USD']}/><Line type="monotone" dataKey="value" stroke="#B8860B" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
      </div>}
      {usdjpyC&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16,borderRadius:6,gridColumn:dxyC&&eurusdC?'span 2':'auto'}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#3B6CB4',marginBottom:10}}>USD/JPY / 30 DAYS</p>
        <ResponsiveContainer width="100%" height={250}><LineChart data={usdjpyC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="date" tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:'rgba(255,255,255,0.35)'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tip} formatter={(v:number)=>[v.toFixed(2),'USD/JPY']}/><Line type="monotone" dataKey="value" stroke="#3B6CB4" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
      </div>}
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
