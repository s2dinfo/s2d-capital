const CG = process.env.NEXT_PUBLIC_COINGECKO_API_KEY||'';
const FR = process.env.FRED_API_KEY||'';
const cg: Record<string,string> = CG?{'x-cg-demo-api-key':CG}:{};

// CRYPTO
export async function getCryptoMarkets() {
  try { const r=await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&sparkline=true&price_change_percentage=7d',{headers:cg,next:{revalidate:300}}); if(!r.ok) return null; return r.json(); } catch{return null;}
}
export async function getCryptoPrices() {
  try { const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',{headers:cg,next:{revalidate:300}}); if(!r.ok) return FB(); return r.json(); } catch{return FB();}
}
export async function getGlobal() {
  try { const r=await fetch('https://api.coingecko.com/api/v3/global',{headers:cg,next:{revalidate:600}}); if(!r.ok) return null; const d=(await r.json()).data; return {totalMcap:d.total_market_cap?.usd,vol24h:d.total_volume?.usd,btcDom:d.market_cap_percentage?.btc,ethDom:d.market_cap_percentage?.eth,active:d.active_cryptocurrencies,mcapChg:d.market_cap_change_percentage_24h_usd}; } catch{return null;}
}
export async function getCoinChart(id:string,days=30) {
  try { const r=await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,{headers:cg,next:{revalidate:600}}); if(!r.ok) return null; const d=await r.json(); return d.prices?.filter((_:any,i:number)=>i%12===0).map(([t,p]:[number,number])=>({date:new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'}),price:Math.round(p)})); } catch{return null;}
}
export async function getTrending() {
  try { const r=await fetch('https://api.coingecko.com/api/v3/search/trending',{headers:cg,next:{revalidate:600}}); if(!r.ok) return null; const d=await r.json(); return d.coins?.slice(0,8).map((c:any)=>({name:c.item.name,symbol:c.item.symbol,thumb:c.item.thumb,chg:c.item.data?.price_change_percentage_24h?.usd})); } catch{return null;}
}
export async function getFearGreed() {
  try { const r=await fetch('https://api.alternative.me/fng/?limit=30',{next:{revalidate:3600}}); if(!r.ok) return null; const d=await r.json(); return {current:{value:parseInt(d.data[0].value),label:d.data[0].value_classification},history:d.data.slice(0,14).reverse().map((x:any)=>({date:new Date(parseInt(x.timestamp)*1000).toLocaleDateString('en-US',{month:'short',day:'numeric'}),value:parseInt(x.value)}))}; } catch{return null;}
}

// GLOBAL INDICES (FRED)
async function fred(id:string) { if(!FR) return null; try { const r=await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FR}&file_type=json&sort_order=desc&limit=2`,{next:{revalidate:3600}}); if(!r.ok) return null; const obs=(await r.json()).observations?.filter((o:any)=>o.value!=='.'); return obs?.[0]||null; } catch{return null;} }
export async function fredChart(id:string,n=24) { if(!FR) return null; try { const r=await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FR}&file_type=json&sort_order=desc&limit=${n}`,{next:{revalidate:3600}}); if(!r.ok) return null; return (await r.json()).observations?.filter((o:any)=>o.value!=='.').reverse().map((o:any)=>({date:new Date(o.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),value:parseFloat(o.value)||0})); } catch{return null;} }

export async function getIndices() {
  const [sp, dj, nq, nk, vix]=await Promise.all([fred('SP500'),fred('DJIA'),fred('NASDAQCOM'),fred('NIKKEI225'),fred('VIXCLS')]);
  // Calculate changes from previous observations
  const spPrev = await fredPrev('SP500');
  const djPrev = await fredPrev('DJIA');
  return {
    sp500:{val:sp?.value?parseFloat(sp.value):null,date:sp?.date},
    djia:{val:dj?.value?parseFloat(dj.value):null,date:dj?.date},
    nasdaq:{val:nq?.value?parseFloat(nq.value):null,date:nq?.date},
    nikkei:{val:nk?.value?parseFloat(nk.value):null,date:nk?.date},
    vix:{val:vix?.value?parseFloat(vix.value):null,date:vix?.date},
  };
}
async function fredPrev(id:string) { if(!FR) return null; try { const r=await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FR}&file_type=json&sort_order=desc&limit=3`,{next:{revalidate:3600}}); if(!r.ok) return null; const obs=(await r.json()).observations?.filter((o:any)=>o.value!=='.'); return obs?.[1]||null; } catch{return null;} }

// MACRO
export async function getMacro() {
  const [a,b,c,d,e,f,g,h]=await Promise.all([fred('FEDFUNDS'),fred('DGS10'),fred('DGS2'),fred('CPIAUCSL'),fred('UNRATE'),fred('T10Y2Y'),fred('M2SL'),fred('DTWEXBGS')]);
  return {fedRate:a?.value,t10y:b?.value,t2y:c?.value,cpi:d?.value,unemp:e?.value,yieldSpread:f?.value,m2:g?.value,dxy:h?.value,date:a?.date};
}
export async function getCommodities() {
  const [oil,gold]=await Promise.all([fred('DCOILWTICO'),(async()=>{try{const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true',{headers:cg,next:{revalidate:600}});if(!r.ok)return null;return r.json();}catch{return null;}})()]);
  return {oil:oil?.value?parseFloat(oil.value):null,oilDate:oil?.date,gold:gold?.['pax-gold']?.usd,goldChg:gold?.['pax-gold']?.usd_24h_change};
}
export async function getFx() { try { const r=await fetch('https://open.er-api.com/v6/latest/USD',{next:{revalidate:3600}}); if(!r.ok) return null; return (await r.json()).rates; } catch{return null;} }
export async function getDefiTvl() { try { const r=await fetch('https://api.llama.fi/v2/historicalChainTvl',{next:{revalidate:3600}}); if(!r.ok) return null; const d=await r.json(); const s=d.slice(-30); return {current:s[s.length-1]?.tvl,chart:s.map((x:any)=>({date:new Date(x.date*1000).toLocaleDateString('en-US',{month:'short',day:'numeric'}),tvl:Math.round(x.tvl/1e9*10)/10}))}; } catch{return null;} }
export async function getChains() { try { const r=await fetch('https://api.llama.fi/v2/chains',{next:{revalidate:3600}}); if(!r.ok) return null; const d=await r.json(); return d.sort((a:any,b:any)=>(b.tvl||0)-(a.tvl||0)).slice(0,10).map((c:any)=>({name:c.name,tvl:c.tvl})); } catch{return null;} }
export async function getWorldGdp() {
  try { const r=await fetch('https://api.worldbank.org/v2/country/USA;DEU;CHN;GBR;JPN;FRA;IND;BRA/indicator/NY.GDP.MKTP.CD?format=json&per_page=8&date=2023',{next:{revalidate:86400}}); if(!r.ok) return null; const d=await r.json(); return d[1]?.filter((x:any)=>x.value).map((x:any)=>({country:x.country.value,code:x.countryiso3code,gdp:x.value,year:x.date})); } catch{return null;} }

// HELPERS
export function fmtP(n:number|null|undefined):string { if(n===null||n===undefined) return '-'; if(n>=1e12) return '$'+(n/1e12).toFixed(2)+'T'; if(n>=1e9) return '$'+(n/1e9).toFixed(1)+'B'; if(n>=1e6) return '$'+(n/1e6).toFixed(1)+'M'; if(n>=1000) return '$'+n.toLocaleString('en-US',{maximumFractionDigits:0}); if(n>=1) return '$'+n.toFixed(2); return '$'+n.toFixed(4); }
export function fmtPct(v:number|null|undefined):string { if(v===null||v===undefined) return '-'; return (v>0?'+':'')+v.toFixed(1)+'%'; }
export function pctCol(v:number|null|undefined):string { if(!v) return '#9C9CAF'; return v>0?'#2D8F5E':'#C0392B'; }
export const formatPrice = fmtP;
export const formatPct = fmtPct;
export const pctColor = pctCol;
function FB() { return {bitcoin:{usd:68743,usd_24h_change:2.5,usd_market_cap:1360000000000},ethereum:{usd:2023,usd_24h_change:4.3,usd_market_cap:244000000000},solana:{usd:84.95,usd_24h_change:3.8,usd_market_cap:42000000000},ripple:{usd:1.36,usd_24h_change:1.2,usd_market_cap:78000000000},dogecoin:{usd:0.0914,usd_24h_change:2.9,usd_market_cap:13000000000},cardano:{usd:0.2571,usd_24h_change:2.4,usd_market_cap:9200000000}}; }
