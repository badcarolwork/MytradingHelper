'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockMarketApi } from '@/lib/mockApi'
import { MOCK_PRICES } from '@/lib/mockData'
import { getAllUSPrices, getIndicators, getCacheMeta } from '@/lib/avData'
import { Card, CardHeader } from '@/components/ui'
import type { PriceData } from '@/types'

const MY_SYMBOLS = ['PBBANK','MAYBANK','TENAGA','CIMB','DIALOG','HARTA']
const US_SYMBOLS = ['NVDA','AAPL','TSLA','MSFT','AMZN']

// ── Price row (shared for both KLSE and US) ───────────────────────────────────
function PriceRow({ symbol, prices, badge }: {
  symbol: string
  prices: Record<string, PriceData & { source?: 'av' | 'mock' }>
  badge?: boolean
}) {
  const p  = prices[symbol]
  if (!p) return (
    <div className="wl-item">
      <div className="wl-left">
        <div className="wl-icon">{symbol.slice(0,3)}</div>
        <div><div className="wl-ticker">{symbol}</div></div>
      </div>
    </div>
  )
  const up     = p.change_pct >= 0
  const isLive = (p as PriceData & { source?: string }).source === 'av'

  return (
    <div className="wl-item">
      <div className="wl-left">
        <div className="wl-icon">{symbol.slice(0,3)}</div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div className="wl-ticker">{symbol}</div>
            {badge && isLive && (
              <span style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--green2)', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', padding:'1px 5px', borderRadius:3 }}>AV</span>
            )}
          </div>
          <div className="wl-name">{p.name && p.name !== symbol ? p.name : ''}</div>
        </div>
      </div>
      <div className="wl-right">
        <div className="wl-price">{p.price > 0 ? p.price.toFixed(p.price > 10 ? 2 : 4) : '—'}</div>
        <div className={`wl-chg ${up ? 'up' : 'dn'}`}>{up ? '+' : ''}{p.change_pct.toFixed(2)}%</div>
      </div>
    </div>
  )
}

// ── Indicator chips (RSI / MACD) ──────────────────────────────────────────────
function IndicatorChips({ symbol }: { symbol: string }) {
  const { data: ind } = useQuery({
    queryKey: ['av-indicators', symbol],
    queryFn:  () => getIndicators(symbol),
    staleTime: 60 * 60 * 1000, // indicators don't change per tick
  })
  if (!ind?.rsi_14 && !ind?.macd) return null

  const rsiColor = ind.rsi_14 != null
    ? ind.rsi_14 < 30 ? 'var(--green2)' : ind.rsi_14 > 70 ? 'var(--red2)' : 'var(--text3)'
    : 'var(--text3)'
  const bull = ind.macd && ind.macd.line > ind.macd.signal

  return (
    <div style={{ display:'flex', gap:8, paddingLeft:46, paddingBottom:6, flexWrap:'wrap' }}>
      {ind.rsi_14 != null && (
        <span style={{ fontSize:10, fontFamily:'var(--mono)', color: rsiColor }}>
          RSI {ind.rsi_14.toFixed(1)}{ind.rsi_14 < 30 ? ' ▲ oversold' : ind.rsi_14 > 70 ? ' ▼ overbought' : ''}
        </span>
      )}
      {ind.macd && (
        <span style={{ fontSize:10, fontFamily:'var(--mono)', color: bull ? 'var(--green2)' : 'var(--red2)' }}>
          MACD {bull ? '▲ bull' : '▼ bear'}
        </span>
      )}
      {ind.ema_20 && (
        <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--text3)' }}>
          EMA20 {ind.ema_20.toFixed(2)}
        </span>
      )}
    </div>
  )
}

// ── Data source banner ────────────────────────────────────────────────────────
function DataBanner() {
  const { data: meta } = useQuery({
    queryKey: ['av-cache-meta'],
    queryFn:  getCacheMeta,
    staleTime: 5 * 60 * 1000,
  })
  if (!meta) return null

  if (!meta.ready) return (
    <div style={{ marginBottom:8, padding:'6px 10px', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.15)', borderRadius:6, fontSize:10, fontFamily:'var(--mono)', color:'var(--amber2)' }}>
      ⚠ No AV cache — run: <code>node scripts/fetch-av-data.js</code>
    </div>
  )

  const age = meta.age_minutes != null
    ? meta.age_minutes < 60 ? `${meta.age_minutes}m ago` : `${Math.floor(meta.age_minutes / 60)}h ago`
    : ''

  return (
    <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(16,185,129,.04)', border:'1px solid rgba(16,185,129,.12)', borderRadius:6 }}>
      <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--green2)' }}>
        ● AV cached · {meta.symbols.length} symbols · simulated live
      </span>
      {age && <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--text3)' }}>fetched {age}</span>}
    </div>
  )
}

// ── Main Watchlist component ──────────────────────────────────────────────────
export function Watchlist({ onToast }: { onToast: (m: string) => void }) {
  const [klsePrices, setKlsePrices] = useState<Record<string, PriceData>>({ ...MOCK_PRICES })
  const [usPrices,   setUsPrices]   = useState<Record<string, PriceData & { source?: 'av' | 'mock' }>>({})
  const [trigger,    setTrigger]    = useState('RSI_OVERSOLD')

  // ── US: fetch from AV cache on mount, refresh every 15s ──────────────────
  useEffect(() => {
    let cancelled = false
    async function refresh() {
      const data = await getAllUSPrices()
      if (!cancelled && Object.keys(data).length > 0) setUsPrices(data)
    }
    refresh()
    const id = setInterval(refresh, 15_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // ── KLSE: local simulated tick (no AV support for Bursa) ──────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setKlsePrices(prev => {
        const next = { ...prev }
        MY_SYMBOLS.forEach(sym => {
          const base  = MOCK_PRICES[sym]?.price ?? 1
          const cur   = next[sym]?.price ?? base
          const drift = (Math.random() - 0.48) * base * 0.0007
          const pull  = (base - cur) * 0.012
          const price = Math.max(base * 0.92, Math.min(base * 1.08, cur + drift + pull))
          const chg   = price - (MOCK_PRICES[sym]?.open ?? base)
          next[sym]   = { ...(next[sym] ?? MOCK_PRICES[sym]), price: +price.toFixed(4), change: +chg.toFixed(4), change_pct: +(chg / (MOCK_PRICES[sym]?.open ?? base) * 100).toFixed(2) }
        })
        return next
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // ── Scanner (mock — same as before) ──────────────────────────────────────
  const { data: scanData } = useQuery({
    queryKey: ['scanner', trigger],
    queryFn:  () => mockMarketApi.scanner(trigger).then(r => r.data),
    refetchInterval: 60_000,
  })
  const signals = (scanData?.results ?? []).filter((r: { signal: boolean }) => r.signal)

  return (
    <>
      {/* ── Bursa Malaysia ──────────────────────────────── */}
      <Card>
        <CardHeader title="Bursa Malaysia (KLSE)" />
        <div style={{ marginBottom:8, padding:'5px 10px', background:'rgba(245,158,11,.04)', border:'1px solid rgba(245,158,11,.12)', borderRadius:6, fontSize:10, fontFamily:'var(--mono)', color:'var(--amber2)' }}>
          ⚠ KLSE not on Alpha Vantage free tier — simulated prices
        </div>
        {MY_SYMBOLS.map(s => <PriceRow key={s} symbol={s} prices={klsePrices} />)}
      </Card>

      {/* ── US Markets (Alpha Vantage) ───────────────────── */}
      <Card>
        <CardHeader title="US Markets (Alpha Vantage)" />
        <DataBanner />
        {US_SYMBOLS.map(s => (
          <div key={s}>
            <PriceRow
              symbol={s}
              prices={Object.keys(usPrices).length > 0 ? usPrices : MOCK_PRICES}
              badge
            />
            <IndicatorChips symbol={s} />
          </div>
        ))}
      </Card>

      {/* ── Signal Scanner ──────────────────────────────── */}
      <Card>
        <CardHeader
          title="Signal Scanner"
          action={
            <select value={trigger} onChange={e => setTrigger(e.target.value)}
              style={{ fontSize:10, fontFamily:'var(--mono)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 6px', color:'var(--accent2)', outline:'none' }}>
              <option value="RSI_OVERSOLD">RSI Oversold</option>
              <option value="MACD_BULLISH_CROSS">MACD Cross</option>
              <option value="VOLUME_SPIKE">Volume Spike</option>
            </select>
          }
        />
        {signals.length === 0
          ? <div style={{ padding:'16px 0', textAlign:'center', color:'var(--text3)', fontSize:12 }}>No signals right now</div>
          : signals.map((r: { symbol: string; trigger: string; price: number; rsi_14?: number }) => (
            <div key={r.symbol} className="wl-item">
              <div className="wl-left">
                <div className="wl-icon">{r.symbol.slice(0,3)}</div>
                <div>
                  <div className="wl-ticker">{r.symbol}</div>
                  <div className="wl-name" style={{ color:'var(--amber2)' }}>{r.trigger.replace(/_/g,' ').toLowerCase()}</div>
                </div>
              </div>
              <div className="wl-right">
                <div className="wl-price">{r.price.toFixed(2)}</div>
                {r.rsi_14 != null && <div style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--amber2)' }}>RSI {r.rsi_14.toFixed(1)}</div>}
              </div>
            </div>
          ))
        }
        <div style={{ marginTop:8, fontSize:10, fontFamily:'var(--mono)', color:'var(--text3)' }}>
          {scanData?.results?.length ?? 0} scanned · {signals.length} signals
        </div>
      </Card>
    </>
  )
}
