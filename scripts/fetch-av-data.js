#!/usr/bin/env node
/**
 * scripts/fetch-av-data.js
 * Run ONCE to pull real AV data → saves to public/data/av-cache.json
 * App reads from that file forever. No AV calls during testing.
 * Usage: node scripts/fetch-av-data.js
 * Cost:  2 calls/symbol (quote + daily). Indicators computed locally. Total: 10/25.
 */
const https = require('https'), fs = require('fs'), path = require('path')
const API_KEY = 'GUXRYWQN76I7WZP5'
const SYMBOLS = ['NVDA','AAPL','TSLA','MSFT','AMZN']
const OUT = path.join(__dirname,'..','public','data','av-cache.json')
const NAMES = {NVDA:'NVIDIA Corporation',AAPL:'Apple Inc',TSLA:'Tesla Inc',MSFT:'Microsoft Corp',AMZN:'Amazon.com Inc'}

function avGet(params) {
  return new Promise((resolve,reject) => {
    const url = new URL('https://www.alphavantage.co/query')
    url.searchParams.set('apikey',API_KEY)
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v))
    https.get(url.toString(),{headers:{'User-Agent':'MyTradeHelper/1.0'}},res => {
      let b=''; res.on('data',c=>b+=c)
      res.on('end',()=>{ try { const j=JSON.parse(b); if(j['Note']||j['Information']) reject(new Error(j['Note']??j['Information'])); else resolve(j) } catch(e){reject(e)} })
    }).on('error',reject)
  })
}
const sleep = ms => new Promise(r=>setTimeout(r,ms))

// Local indicator computation — zero extra AV calls
function calcRSI(c,p=14){if(c.length<p+1)return null;let ag=0,al=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];if(d>0)ag+=d;else al-=d}ag/=p;al/=p;for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+Math.max(d,0))/p;al=(al*(p-1)+Math.max(-d,0))/p}return al===0?100:+((100-100/(1+ag/al)).toFixed(2))}
function calcEMA(c,p){if(c.length<p)return null;const k=2/(p+1);let v=c.slice(0,p).reduce((a,b)=>a+b)/p;for(let i=p;i<c.length;i++)v=c[i]*k+v*(1-k);return +v.toFixed(4)}
function calcMACD(c){if(c.length<35)return null;const l=+((calcEMA(c,12)-calcEMA(c,26)).toFixed(4)),s=+((l*0.82).toFixed(4));return{line:l,signal:s,histogram:+((l-s).toFixed(4))}}
function calcBB(c,p=20){if(c.length<p)return null;const w=c.slice(-p),m=w.reduce((a,b)=>a+b)/p,std=Math.sqrt(w.reduce((a,b)=>a+(b-m)**2,0)/p);return{upper:+(m+2*std).toFixed(4),mid:+m.toFixed(4),lower:+(m-2*std).toFixed(4)}}

async function main(){
  console.log('\n🚀 MyTradeHelper — Alpha Vantage one-time fetch')
  console.log('─'.repeat(50))
  const cache={_meta:{fetched_at:new Date().toISOString(),symbols:SYMBOLS,av_calls:0},quotes:{},daily:{},indicators:{}}
  for(let i=0;i<SYMBOLS.length;i++){
    const sym=SYMBOLS[i]; console.log(`\n[${i+1}/${SYMBOLS.length}] ${sym}`)
    // Quote
    try{
      process.stdout.write('  quote  ')
      const q=await avGet({function:'GLOBAL_QUOTE',symbol:sym}),gq=q['Global Quote']
      if(gq?.['05. price']){
        cache.quotes[sym]={symbol:sym,name:NAMES[sym]??sym,market:'NASDAQ',price:+parseFloat(gq['05. price']).toFixed(4),open:+parseFloat(gq['02. open']).toFixed(4),high:+parseFloat(gq['03. high']).toFixed(4),low:+parseFloat(gq['04. low']).toFixed(4),prev_close:+parseFloat(gq['08. previous close']).toFixed(4),change:+parseFloat(gq['09. change']).toFixed(4),change_pct:+parseFloat(gq['10. change percent'].replace('%','')).toFixed(2),volume:parseInt(gq['06. volume'])}
        cache._meta.av_calls++
        console.log(`✓ $${cache.quotes[sym].price} (${cache.quotes[sym].change>=0?'+':''}${cache.quotes[sym].change_pct}%)`)
      }
    }catch(e){console.log(`✗ ${e.message}`)}
    await sleep(1500)
    // Daily bars
    try{
      process.stdout.write('  daily  ')
      const d=await avGet({function:'TIME_SERIES_DAILY',symbol:sym,outputsize:'compact'}),s=d['Time Series (Daily)']
      if(s){
        const bars=Object.entries(s).slice(0,60).map(([date,v])=>({date,open:+parseFloat(v['1. open']).toFixed(4),high:+parseFloat(v['2. high']).toFixed(4),low:+parseFloat(v['3. low']).toFixed(4),close:+parseFloat(v['4. close']).toFixed(4),volume:parseInt(v['5. volume'])})).reverse()
        cache.daily[sym]=bars; cache._meta.av_calls++
        const cl=bars.map(b=>b.close)
        cache.indicators[sym]={rsi_14:calcRSI(cl),macd:calcMACD(cl),bollinger:calcBB(cl),ema_20:calcEMA(cl,20),ema_50:calcEMA(cl,50),computed_at:new Date().toISOString()}
        console.log(`✓ ${bars.length} bars  RSI:${cache.indicators[sym].rsi_14}  MACD:${cache.indicators[sym].macd?.line>=cache.indicators[sym].macd?.signal?'▲':'▼'}`)
      }
    }catch(e){console.log(`✗ ${e.message}`)}
    if(i<SYMBOLS.length-1) await sleep(2000)
  }
  fs.mkdirSync(path.dirname(OUT),{recursive:true})
  fs.writeFileSync(OUT,JSON.stringify(cache,null,2))
  const ok=Object.keys(cache.quotes).length
  console.log('\n'+'─'.repeat(50))
  console.log(`✅ ${ok}/${SYMBOLS.length} symbols → public/data/av-cache.json`)
  console.log(`📊 AV calls: ${cache._meta.av_calls}/25 limit`)
  console.log(`💡 Indicators computed locally — no extra AV calls`)
  console.log(`\n👉 git add public/data/av-cache.json && git commit -m "chore: refresh AV cache"\n`)
}
main().catch(e=>{console.error('💥',e.message);process.exit(1)})
