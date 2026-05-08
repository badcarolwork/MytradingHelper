'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { marketApi } from '@/lib/api'
import { useMarketStore } from '@/store/market'
import { Card, CardHeader, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ScannerResult } from '@/types'

const MY_SYMBOLS = ['PBBANK', 'MAYBANK', 'TENAGA', 'CIMB', 'DIALOG', 'HARTA']
const US_SYMBOLS = ['NVDA', 'AAPL', 'TSLA', 'MSFT']

function PriceRow({ symbol, onToast }: { symbol: string; onToast: (msg: string) => void }) {
  const price = useMarketStore(s => s.prices[symbol])

  if (!price) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-blue-500/10 last:border-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1e2d45] animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-16 h-3 bg-[#1e2d45] rounded animate-pulse" />
            <div className="w-24 h-2.5 bg-[#1e2d45] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const up = price.change_pct >= 0

  return (
    <div className="flex items-center justify-between py-3 border-b border-blue-500/10 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[11px] font-bold font-mono text-blue-400">
          {symbol.slice(0, 3)}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-slate-100">{symbol}</div>
          <div className="text-[11px] text-slate-500">{price.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {up ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
        <div className="text-right">
          <div className="text-[14px] font-semibold font-mono text-slate-100">{price.price.toFixed(2)}</div>
          <div className={cn(
            'text-[11px] font-mono px-1.5 py-0.5 rounded',
            up ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400'
          )}>
            {up ? '+' : ''}{price.change_pct.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}

function ScannerRow({ result }: { result: ScannerResult }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-blue-500/10 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[11px] font-bold font-mono text-blue-400">
          {result.symbol.slice(0, 3)}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-100">{result.symbol}</div>
          <div className="text-[11px] text-amber-400">{result.trigger.replace('_', ' ').toLowerCase()}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[13px] font-mono font-semibold text-slate-100">{result.price.toFixed(2)}</div>
        {result.rsi_14 && (
          <div className="text-[10px] font-mono text-amber-400">RSI {result.rsi_14.toFixed(1)}</div>
        )}
      </div>
    </div>
  )
}

export function Watchlist({ onToast }: { onToast: (msg: string) => void }) {
  const [trigger, setTrigger] = useState('RSI_OVERSOLD')

  const { data: scanData } = useQuery({
    queryKey: ['scanner', trigger],
    queryFn: () => marketApi.scanner(trigger, 'KLSE').then(r => r.data),
    refetchInterval: 30_000,
  })

  const signals = scanData?.results.filter(r => r.signal) ?? []

  return (
    <div className="flex flex-col gap-3.5">

      {/* Bursa */}
      <Card>
        <CardHeader
          title="Bursa Malaysia"
          action={
            <button onClick={() => onToast('+ Watchlist coming soon')}
              className="flex items-center gap-1 text-[11px] text-blue-400 font-mono px-2.5 py-1 border border-blue-400/25 rounded-md">
              <Plus size={11} /> Add
            </button>
          }
        />
        {MY_SYMBOLS.map(sym => <PriceRow key={sym} symbol={sym} onToast={onToast} />)}
      </Card>

      {/* US Markets */}
      <Card>
        <CardHeader
          title="US Markets (Moomoo)"
          action={
            <button onClick={() => onToast('+ Watchlist coming soon')}
              className="flex items-center gap-1 text-[11px] text-blue-400 font-mono px-2.5 py-1 border border-blue-400/25 rounded-md">
              <Plus size={11} /> Add
            </button>
          }
        />
        {US_SYMBOLS.map(sym => <PriceRow key={sym} symbol={sym} onToast={onToast} />)}
      </Card>

      {/* Scanner */}
      <Card>
        <CardHeader
          title="Signal Scanner"
          action={
            <select
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              className="text-[10px] font-mono bg-[#1a2235] border border-blue-500/20 rounded px-2 py-1 text-blue-400"
            >
              <option value="RSI_OVERSOLD">RSI Oversold</option>
              <option value="MACD_BULLISH_CROSS">MACD Cross</option>
              <option value="VOLUME_SPIKE">Volume Spike</option>
            </select>
          }
        />
        {signals.length === 0 ? (
          <div className="py-4 text-center text-[12px] text-slate-500">No signals right now</div>
        ) : (
          signals.map(r => <ScannerRow key={r.symbol} result={r} />)
        )}
        <div className="mt-2 text-[10px] font-mono text-slate-500">
          {scanData?.results.length ?? 0} symbols scanned · {signals.length} signals found
        </div>
      </Card>

    </div>
  )
}
