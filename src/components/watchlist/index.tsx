'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { mockMarketApi } from '@/lib/mockApi'
import { MOCK_PRICES } from '@/lib/mockData'
import { Card, CardHeader } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PriceData } from '@/types'

const MY_SYMBOLS = ['PBBANK','MAYBANK','TENAGA','CIMB','DIALOG','HARTA']
const US_SYMBOLS = ['NVDA','AAPL','TSLA','MSFT']

function PriceRow({ symbol, prices }: { symbol: string; prices: Record<string, PriceData> }) {
  const p = prices[symbol]
  if (!p) return null
  const up = p.change_pct >= 0
  return (
    <div className="flex items-center justify-between py-3 border-b border-blue-500/10 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[11px] font-bold font-mono text-blue-400">
          {symbol.slice(0, 3)}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-slate-100">{symbol}</div>
          <div className="text-[11px] text-slate-500">{p.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {up ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
        <div className="text-right">
          <div className="text-[14px] font-semibold font-mono text-slate-100">{p.price.toFixed(2)}</div>
          <div className={cn('text-[11px] font-mono px-1.5 py-0.5 rounded mt-0.5', up ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400')}>
            {up ? '+' : ''}{p.change_pct.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export function Watchlist({ onToast }: { onToast: (msg: string) => void }) {
  const [trigger, setTrigger] = useState('RSI_OVERSOLD')
  // Live-tick prices locally
  const [prices, setPrices] = useState<Record<string, PriceData>>({ ...MOCK_PRICES })

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(sym => {
          const base = MOCK_PRICES[sym].price
          const drift = (Math.random() - 0.48) * base * 0.001
          const newPrice = Math.max(base * 0.9, Math.min(base * 1.1, next[sym].price + drift))
          const change = newPrice - MOCK_PRICES[sym].open
          next[sym] = { ...next[sym], price: +newPrice.toFixed(4), change: +change.toFixed(4), change_pct: +(change / MOCK_PRICES[sym].open * 100).toFixed(2) }
        })
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const { data: scanData } = useQuery({
    queryKey: ['scanner', trigger],
    queryFn: () => mockMarketApi.scanner(trigger).then(r => r.data),
    refetchInterval: 30_000,
  })

  const signals = scanData?.results.filter(r => r.signal) ?? []

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHeader title="Bursa Malaysia" />
        {MY_SYMBOLS.map(sym => <PriceRow key={sym} symbol={sym} prices={prices} />)}
      </Card>

      <Card>
        <CardHeader title="US Markets (Moomoo)" />
        {US_SYMBOLS.map(sym => <PriceRow key={sym} symbol={sym} prices={prices} />)}
      </Card>

      <Card>
        <CardHeader
          title="Signal Scanner"
          action={
            <select value={trigger} onChange={e => setTrigger(e.target.value)}
              className="text-[10px] font-mono bg-[#1a2235] border border-blue-500/20 rounded px-2 py-1 text-blue-400 outline-none">
              <option value="RSI_OVERSOLD">RSI Oversold</option>
              <option value="MACD_BULLISH_CROSS">MACD Cross</option>
              <option value="VOLUME_SPIKE">Volume Spike</option>
            </select>
          }
        />
        {signals.length === 0
          ? <div className="py-4 text-center text-[12px] text-slate-500">No signals right now</div>
          : signals.map(r => (
            <div key={r.symbol} className="flex items-center justify-between py-2.5 border-b border-blue-500/10 last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[11px] font-bold font-mono text-blue-400">{r.symbol.slice(0,3)}</div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-100">{r.symbol}</div>
                  <div className="text-[11px] text-amber-400">{r.trigger.replace(/_/g,' ').toLowerCase()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-mono text-slate-100">{r.price.toFixed(2)}</div>
                {r.rsi_14 && <div className="text-[10px] font-mono text-amber-400">RSI {r.rsi_14.toFixed(1)}</div>}
              </div>
            </div>
          ))
        }
        <div className="mt-2 text-[10px] font-mono text-slate-500">
          {scanData?.results.length ?? 0} scanned · {signals.length} signals
        </div>
      </Card>
    </div>
  )
}
