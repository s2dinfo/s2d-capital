"use client";
import { useEffect, useRef } from "react";
export interface CandleData { time:string; open:number; high:number; low:number; close:number; }
export function generateMockCandles(basePrice:number,days:number,volatility:number): CandleData[] {
  const candles:CandleData[]=[]; let price=basePrice; const now=new Date();
  for(let i=days;i>=0;i--){const date=new Date(now.getTime()-i*86400000);const time=date.toISOString().split("T")[0];const change=(Math.random()-0.48)*volatility;const open=price;const close=price+change;const high=Math.max(open,close)+Math.random()*volatility*0.5;const low=Math.min(open,close)-Math.random()*volatility*0.5;candles.push({time,open:Math.round(open*100)/100,high:Math.round(high*100)/100,low:Math.round(low*100)/100,close:Math.round(close*100)/100});price=close;}
  return candles;
}
interface Props { data:CandleData[]; title:string; height?:number; }
export default function TVCandlestickChart({data,title,height=280}:Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let chart:any=null;let cancelled=false;let ro:ResizeObserver|null=null;
    import("lightweight-charts").then(mod=>{
      if(cancelled||!containerRef.current) return;
      const{createChart,CandlestickSeries,CrosshairMode}=mod;
      chart=createChart(containerRef.current,{width:containerRef.current.clientWidth,height,layout:{background:{color:'#FDFCF9'},textColor:'#9C9CAF',fontFamily:"'JetBrains Mono',monospace",fontSize:10},grid:{vertLines:{color:'rgba(232,230,224,0.6)'},horzLines:{color:'rgba(232,230,224,0.6)'}},crosshair:{mode:CrosshairMode.Normal,vertLine:{color:'rgba(184,134,11,0.3)',width:1,style:3,labelBackgroundColor:'#B8860B'},horzLine:{color:'rgba(184,134,11,0.3)',width:1,style:3,labelBackgroundColor:'#B8860B'}},rightPriceScale:{borderColor:'#E8E6E0',scaleMargins:{top:0.08,bottom:0.08}},timeScale:{borderColor:'#E8E6E0',timeVisible:false},handleScroll:{vertTouchDrag:false}});
      const series=chart.addSeries(CandlestickSeries,{upColor:'#2D8F5E',downColor:'#C0392B',borderUpColor:'#2D8F5E',borderDownColor:'#C0392B',wickUpColor:'rgba(45,143,94,0.5)',wickDownColor:'rgba(192,57,43,0.5)'});
      series.setData(data);chart.timeScale().fitContent();
      ro=new ResizeObserver(entries=>{if(chart&&entries[0])chart.applyOptions({width:entries[0].contentRect.width});});
      ro.observe(containerRef.current);
    });
    return()=>{cancelled=true;ro?.disconnect();if(chart){chart.remove();chart=null;}};
  },[data,height]);
  return (
    <div style={{background:'var(--bg-warm)',borderRadius:4,border:'1px solid var(--border-lt)',overflow:'hidden'}}>
      <div style={{padding:'12px 14px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.7rem',fontWeight:600,color:'var(--navy)',letterSpacing:'0.05em'}}>{title}</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'var(--text-muted)'}}>90D</span>
      </div>
      <div ref={containerRef} style={{width:'100%',height}}/>
      <div style={{padding:'4px 14px 6px',fontFamily:'var(--font-mono)',fontSize:'0.5rem',color:'var(--text-muted)',textAlign:'right'}}>Powered by TradingView</div>
    </div>
  );
}
