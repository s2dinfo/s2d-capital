'use client';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
const tip={fontSize:'0.7rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2};

export default function MacroCharts({fedC,yieldC,cpiC,unempC}:any) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {fedC&&<C label="FED FUNDS RATE / 2Y" color="#3B6CB4" data={fedC} type="step" fmt={(v:number)=>v+'%'} tip="Fed Rate"/>}
      {yieldC&&<C label="YIELD CURVE (10Y-2Y) / 2Y" color="#8B2252" data={yieldC} type="area" fmt={(v:number)=>v+'%'} tip="Spread"/>}
      {cpiC&&<C label="CPI INDEX / 2Y" color="#8B5E3C" data={cpiC} type="line" fmt={(v:number)=>v.toFixed(0)} tip="CPI"/>}
      {unempC&&<C label="UNEMPLOYMENT / 2Y" color="#8B2252" data={unempC} type="area" fmt={(v:number)=>v+'%'} tip="Rate"/>}
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function C({label,color,data,type,fmt,tip:tipLabel}:{label:string;color:string;data:any[];type:string;fmt:(v:number)=>string;tip:string}) {
  return (
    <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
      <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color,marginBottom:10}}>{label}</p>
      <ResponsiveContainer width="100%" height={200}>
        {type==='step'?(
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={fmt}/><Tooltip contentStyle={tip} formatter={(v:number)=>[fmt(v),tipLabel]}/><Line type="stepAfter" dataKey="value" stroke={color} strokeWidth={2} dot={{r:2,fill:color}}/></LineChart>
        ):type==='area'?(
          <AreaChart data={data}><defs><linearGradient id={label.slice(0,3)} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.15}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={fmt}/><Tooltip contentStyle={tip} formatter={(v:number)=>[fmt(v),tipLabel]}/><Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${label.slice(0,3)})`}/></AreaChart>
        ):(
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={fmt}/><Tooltip contentStyle={tip} formatter={(v:number)=>[fmt(v),tipLabel]}/><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false}/></LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
