'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockMarketApi } from '@/lib/mockApi'
import { MOCK_PRICES } from '@/lib/mockData'
import { Card, CardHeader } from '@/components/ui'
import type { PriceData } from '@/types'

const MY_SYMBOLS = ['PBBANK','MAYBANK','TENAGA','CIMB','DIALOG','HARTA']
const US_SYMBOLS = ['NVDA','AAPL','TSLA','MSFT']

function PriceRow({ symbol, prices }: { symbol: string; prices: Record<string, PriceData> }) {
  const p = prices[symbol]
  if (!p) return null
  const up = p.change_pct >= 0
  return (
    <div className="wl-item">
      <div className="wl-left">
        <div className="wl-icon">{symbol.slice(0, 3)}</div>
        <div>
          <div className="wl-ticker">{symbol}</div>
          <div className="wl-name">{p.name}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="wl-right">
          <div className="wl-price">{p.price.toFixed(2)}</div>
          <div className={`wl-chg ${up ? 'up' : 'dn'}`}>{up ? '+' : ''}{p.change_pct.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  )
}

export function Watchlist({ onToast }: { onToast: (m: string) => void }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({ ...MOCK_PRICES })
  const [trigger, setTrigger] = useState('RSI_OVERSOLD')

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(sym => {
          const base  = MOCK_PRICES[sym].price
          const drift = (Math.random() - 0.48) * base * 0.001
          const price = Math.max(base * 0.9, Math.min(base * 1.1, next[sym].price + drift))
          const chg   = price - MOCK_PRICES[sym].open
          next[sym]   = { ...next[sym], price: +price.toFixed(4), change: +chg.toFixed(4), change_pct: +(chg / MOCK_PRICES[sym].open * 100).toFixed(2) }
        })
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const { data: scanData } = useQuery({ queryKey: ['scanner', trigger], queryFn: () => mockMarketApi.scanner(trigger).then(r => r.data), refetchInterval: 30_000 })
  const signals = scanData?.results.filter(r => r.signal) ?? []

  return (
    <>
      <Card>
        <CardHeader title="Bursa Malaysia" action={<button className="card-action" onClick={() => onToast('+ Add coming soon')}>+ Add</button>} />
        {MY_SYMBOLS.map(s => <PriceRow key={s} symbol={s} prices={prices} />)}
      </Card>

      <Card>
        <CardHeader title="US Markets (Moomoo)" action={<button className="card-action" onClick={() => onToast('+ Add coming soon')}>+ Add</button>} />
        {US_SYMBOLS.map(s => <PriceRow key={s} symbol={s} prices={prices} />)}
      </Card>

      <Card>
        <CardHeader
          title="Signal Scanner"
          action={
            <select value={trigger} onChange={e => setTrigger(e.target.value)}
              style={{ fontSize: 10, fontFamily: 'var(--mono)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--accent2)', outline: 'none' }}>
              <option value="RSI_OVERSOLD">RSI Oversold</option>
              <option value="MACD_BULLISH_CROSS">MACD Cross</option>
              <option value="VOLUME_SPIKE">Volume Spike</option>
            </select>
          }
        />
        {signals.length === 0
          ? <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No signals right now</div>
          : signals.map(r => (
            <div key={r.symbol} className="wl-item">
              <div className="wl-left">
                <div className="wl-icon">{r.symbol.slice(0,3)}</div>
                <div>
                  <div className="wl-ticker">{r.symbol}</div>
                  <div className="wl-name" style={{ color: 'var(--amber2)' }}>{r.trigger.replace(/_/g,' ').toLowerCase()}</div>
                </div>
              </div>
              <div className="wl-right">
                <div className="wl-price">{r.price.toFixed(2)}</div>
                {r.rsi_14 && <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--amber2)' }}>RSI {r.rsi_14.toFixed(1)}</div>}
              </div>
            </div>
          ))
        }
        <div style={{ marginTop: 8, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
          {scanData?.results.length ?? 0} scanned · {signals.length} signals
        </div>
      </Card>
    </>
  )
}
