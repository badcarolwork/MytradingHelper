'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, Pause, FlaskConical, X } from 'lucide-react'
import { strategyApi } from '@/lib/api'
import { Card, Badge, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Strategy, StrategyCreate, EntryTrigger } from '@/types'

function StrategyCard({ strategy, onToggle, onEval }: {
  strategy: Strategy
  onToggle: () => void
  onEval: () => void
}) {
  const winRate = strategy.stats.trades > 0
    ? Math.round((strategy.stats.wins / strategy.stats.trades) * 100)
    : 0
  const pnl = strategy.stats.total_pnl

  return (
    <Card className="mb-2.5 cursor-pointer active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[14px] font-semibold text-slate-100">{strategy.name}</span>
        <Badge variant={strategy.status}>{strategy.status.toUpperCase()}</Badge>
      </div>
      <div className="text-[11px] text-slate-500 font-mono mb-2">{strategy.broker} · {strategy.market}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[strategy.entry_trigger.replace('_', ' ')].map(c => (
          <span key={c} className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            {c.toLowerCase()}
          </span>
        ))}
        <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
          {strategy.mode.toLowerCase()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-[13px] font-semibold font-mono text-slate-100">{strategy.stats.trades}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Trades</div>
        </div>
        <div className="text-center">
          <div className={cn('text-[13px] font-semibold font-mono', winRate > 0 ? 'text-emerald-400' : 'text-slate-400')}>
            {winRate}%
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Win rate</div>
        </div>
        <div className="text-center">
          <div className={cn('text-[13px] font-semibold font-mono', pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {pnl >= 0 ? '+' : ''}RM {Math.abs(pnl).toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">P&L</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-colors',
            strategy.status === 'active'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          )}
        >
          {strategy.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
        </button>
        <button
          onClick={onEval}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
        >
          <FlaskConical size={12} /> Evaluate
        </button>
      </div>
    </Card>
  )
}

function NewStrategyModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (data: StrategyCreate) => void
}) {
  const [form, setForm] = useState<StrategyCreate>({
    name: '',
    broker: 'moomoo',
    market: 'KLSE',
    symbols: ['PBBANK'],
    entry_trigger: 'RSI_OVERSOLD',
    entry_params: { rsi_threshold: 30 },
    exit_trigger: 'TAKE_PROFIT',
    exit_params: { take_profit_pct: 5, stop_loss_pct: 2 },
    quantity: 1000,
    max_position_size: 5000,
    mode: 'PAPER',
  })

  const set = (k: keyof StrategyCreate, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-end justify-center backdrop-blur-sm">
      <div className="bg-[#111827] border border-blue-500/20 rounded-t-[20px] w-full max-w-[430px] p-5 max-h-[85dvh] overflow-y-auto">
        <div className="w-9 h-1 bg-[#243352] rounded mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <span className="text-[17px] font-bold">Build Strategy</span>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {[
          { label: 'Strategy name', type: 'text', key: 'name', placeholder: 'e.g. MY Swing RSI' },
        ].map(f => (
          <div key={f.key} className="mb-3">
            <label className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key as keyof StrategyCreate] as string}
              onChange={e => set(f.key as keyof StrategyCreate, e.target.value)}
              className="w-full bg-[#1a2235] border border-blue-500/15 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        ))}

        {[
          { label: 'Market', key: 'market', options: ['KLSE', 'NASDAQ', 'NYSE'] },
          { label: 'Broker', key: 'broker', options: ['moomoo', 'tiger', 'ibkr'] },
          { label: 'Entry trigger', key: 'entry_trigger', options: ['RSI_OVERSOLD', 'RSI_OVERBOUGHT', 'MACD_BULLISH_CROSS', 'VOLUME_SPIKE', 'ABOVE_EMA'] },
          { label: 'Mode', key: 'mode', options: ['PAPER', 'SEMI_AUTO', 'LIVE'] },
        ].map(f => (
          <div key={f.key} className="mb-3">
            <label className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
            <select
              value={form[f.key as keyof StrategyCreate] as string}
              onChange={e => set(f.key as keyof StrategyCreate, e.target.value)}
              className="w-full bg-[#1a2235] border border-blue-500/15 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-100 outline-none focus:border-blue-500"
            >
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div className="mb-3">
          <label className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">Quantity</label>
          <input
            type="number"
            value={form.quantity}
            onChange={e => set('quantity', Number(e.target.value))}
            className="w-full bg-[#1a2235] border border-blue-500/15 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2.5 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-blue-500/20 text-slate-300 text-[13px] font-semibold">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name}
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-[13px] font-semibold disabled:opacity-40"
          >
            Save Strategy
          </button>
        </div>
      </div>
    </div>
  )
}

export function Strategies({ onToast }: { onToast: (msg: string) => void }) {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategyApi.list().then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      strategyApi.update(id, { status: status === 'active' ? 'paused' : 'active' }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['strategies'] })
      onToast(vars.status === 'active' ? '⏸ Strategy paused' : '▶ Strategy resumed')
    },
  })

  const createMutation = useMutation({
    mutationFn: strategyApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['strategies'] })
      setShowModal(false)
      onToast('✓ Strategy saved (paper mode)')
    },
  })

  const evalMutation = useMutation({
    mutationFn: (id: string) => strategyApi.evaluate(id).then(r => r.data),
    onSuccess: (data) => {
      const hits = data.results.filter(r => r.signal).length
      onToast(`Evaluated: ${hits}/${data.results.length} signals`)
    },
  })

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between py-1">
        <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-500">My Strategies</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-semibold"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8"><Spinner /></div>
      )}

      {data?.strategies.map(s => (
        <StrategyCard
          key={s.id}
          strategy={s}
          onToggle={() => toggleMutation.mutate({ id: s.id, status: s.status })}
          onEval={() => evalMutation.mutate(s.id)}
        />
      ))}

      {showModal && (
        <NewStrategyModal
          onClose={() => setShowModal(false)}
          onSave={createMutation.mutate}
        />
      )}
    </div>
  )
}
