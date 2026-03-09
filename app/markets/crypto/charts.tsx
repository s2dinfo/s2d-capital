'use client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Spark({data,color}:{data:number[];color:string}) {
  if(!data||data.length<10) return null;
  const s=data.filter((_,i)=>i%Math.max(1,Math.floor(data.length/40))===0);
  const mn=Math.min(...s),mx=Math.max(...s),rg=mx-mn||1;
  const pts=s.map((v,i)=>`${(i/(s.length-1))*100},${32-((v-mn)/rg)*32}`).join(' ');
  return <svg width={90} height={28} viewBox="0 0 100 32"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

const tip={fontSize:'0.7rem',background:'#fff',border:'1px solid #F0EDE6',borderRadius:2};
const fP=(n:number)=>{if(n>=1e12)return'$'+(n/1e12).toFixed(1)+'T';if(n>=1e9)return'$'+(n/1e9).toFixed(1)+'B';if(n>=1000)return'$'+n.toLocaleString('en-US',{maximumFractionDigits:0});if(n>=1)return'$'+n.toFixed(2);return'$'+n.toFixed(4);};

export default function CryptoCharts({coins,btcChart,ethChart,solChart,fgHistory,defiChart,trending}:any) {
  return (
    <>
      {/* Coin cards with sparklines */}
      {coins&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginBottom:24}}>
        {coins.map((c:any)=>{const sp=c.sparkline_in_7d?.price||[];const up=c.price_change_percentage_24h>0;const col=up?'#2D8F5E':'#C0392B';return(
          <div key={c.id} style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:'16px 14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>{c.image&&<img src={c.image} alt="" style={{width:22,height:22,borderRadius:'50%'}}/>}<div><span style={{fontSize:'0.75rem',fontWeight:700,color:'var(--navy)',display:'block',lineHeight:1.1}}>{c.symbol?.toUpperCase()}</span><span style={{fontSize:'0.55rem',color:'var(--text-muted)'}}>{c.name}</span></div></div>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.58rem',fontWeight:600,color:col}}>{up?'+':''}{c.price_change_percentage_24h?.toFixed(1)}%</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:4}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'1.1rem',fontWeight:600,color:'var(--navy)'}}>{fP(c.current_price)}</span>
              <Spark data={sp} color={col}/>
            </div>
            <span style={{fontSize:'0.55rem',color:'var(--text-muted)'}}>MCap {fP(c.market_cap)}</span>
          </div>
        );})}
      </div>}

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
        {btcChart&&<ChartCard label="BITCOIN / 30 DAYS" color="#B8860B" data={btcChart} price={coins?.[0]?.current_price} chg={coins?.[0]?.price_change_percentage_24h} id="b"/>}
        {ethChart&&<ChartCard label="ETHEREUM / 30 DAYS" color="#3B6CB4" data={ethChart} price={coins?.[1]?.current_price} chg={coins?.[1]?.price_change_percentage_24h} id="e"/>}
        {solChart&&<ChartCard label="SOLANA / 30 DAYS" color="#9945FF" data={solChart} price={coins?.[2]?.current_price} chg={coins?.[2]?.price_change_percentage_24h} id="s"/>}
        {fgHistory&&(
          <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#B8860B',marginBottom:4}}>FEAR &amp; GREED / 14 DAYS</p>
            <ResponsiveContainer width="100%" height={200}><BarChart data={fgHistory}><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:8,fill:'#9C9CAF'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} domain={[0,100]}/><Tooltip contentStyle={tip}/><Bar dataKey="value" radius={[2,2,0,0]} fill="#B8860B"/></BarChart></ResponsiveContainer>
          </div>
        )}
        {defiChart&&(
          <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#5B4FA0',marginBottom:4}}>DEFI TVL / 30 DAYS</p>
            <ResponsiveContainer width="100%" height={200}><AreaChart data={defiChart}><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4FA0" stopOpacity={0.2}/><stop offset="95%" stopColor="#5B4FA0" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>'$'+v+'B'}/><Tooltip contentStyle={tip}/><Area type="monotone" dataKey="tvl" stroke="#5B4FA0" strokeWidth={2} fill="url(#dg)"/></AreaChart></ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Trending */}
      {trending&&<div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:20}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#B8860B',marginBottom:12}}>TRENDING ON COINGECKO</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:6}}>
          {trending.map((t:any,i:number)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border-lt)'}}>
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.78rem',color:'var(--navy)'}}><span style={{fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'var(--text-muted)',width:14}}>{i+1}</span>{t.thumb&&<img src={t.thumb} alt="" style={{width:16,height:16,borderRadius:'50%'}}/>}{t.name} <span style={{fontFamily:'var(--font-mono)',fontSize:'0.52rem',color:'var(--text-muted)'}}>{t.symbol}</span></span>
              {t.chg!=null&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',fontWeight:500,color:t.chg>0?'#2D8F5E':'#C0392B'}}>{t.chg>0?'+':''}{t.chg.toFixed(1)}%</span>}
            </div>
          ))}
        </div>
      </div>}

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </>
  );
}

function ChartCard({label,color,data,price,chg,id}:{label:string;color:string;data:any[];price?:number;chg?:number;id:string}) {
  return (
    <div style={{background:'var(--bg-warm)',border:'1px solid var(--border-lt)',padding:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div><p style={{fontFamily:'var(--font-mono)',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',color}}>{label}</p>{price&&<span style={{fontFamily:'var(--font-mono)',fontSize:'1.1rem',fontWeight:600,color:'var(--navy)'}}>${price.toLocaleString()}</span>}</div>
        {chg!=null&&<span style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',fontWeight:600,color:chg>0?'#2D8F5E':'#C0392B'}}>{chg>0?'+':''}{chg.toFixed(1)}%</span>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.2}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6"/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:9,fill:'#9C9CAF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>v>=1000?'$'+(v/1000).toFixed(0)+'k':'$'+v}/><Tooltip contentStyle={tip} formatter={(v:number)=>['$'+v.toLocaleString(),label.split('/')[0].trim()]}/><Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#${id})`}/></AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
