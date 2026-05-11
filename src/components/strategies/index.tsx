'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, Pause, FlaskConical } from 'lucide-react'
import { mockStrategyApi } from '@/lib/mockApi'
import { Card, Badge, Spinner } from '@/components/ui'
import type { Strategy, StrategyCreate } from '@/types'

function StrategyCard({ s, onToggle, onEval }: { s: Strategy; onToggle: () => void; onEval: () => void }) {
  const wr  = s.stats.trades > 0 ? Math.round(s.stats.wins / s.stats.trades * 100) : 0
  const pnl = s.stats.total_pnl
  return (
    <div className="strat-card">
      <div className="strat-header">
        <div className="strat-name">{s.name}</div>
        <Badge variant={s.status as 'active'|'paused'|'inactive'}>{s.status.toUpperCase()}</Badge>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 8 }}>{s.broker} · {s.market} · {s.mode}</div>
      <div className="strat-criteria">
        <span className="criterion">{s.entry_trigger.replace(/_/g,' ').toLowerCase()}</span>
        <span className="criterion">{s.exit_trigger.replace(/_/g,' ').toLowerCase()}</span>
        {s.symbols.slice(0,3).map(sym => <span key={sym} className="criterion">{sym}</span>)}
      </div>
      <div className="strat-stats">
        <div className="strat-stat"><div className="strat-stat-val">{s.stats.trades}</div><div className="strat-stat-label">Trades</div></div>
        <div className="strat-stat"><div className={`strat-stat-val ${wr > 0 ? 'up' : ''}`}>{wr}%</div><div className="strat-stat-label">Win rate</div></div>
        <div className="strat-stat"><div className={`strat-stat-val ${pnl >= 0 ? 'up' : 'dn'}`}>{pnl >= 0 ? '+' : ''}RM {Math.abs(pnl).toLocaleString()}</div><div className="strat-stat-label">P&L</div></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={onToggle} className="card-action" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {s.status === 'active' ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
        </button>
        <button onClick={onEval} className="card-action" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <FlaskConical size={11} /> Evaluate
        </button>
      </div>
    </div>
  )
}

function NewModal({ onClose, onSave }: { onClose: () => void; onSave: (d: StrategyCreate) => void }) {
  const [form, setForm] = useState<StrategyCreate>({
    name: '', broker: 'moomoo', market: 'KLSE', symbols: ['PBBANK'],
    entry_trigger: 'RSI_OVERSOLD', entry_params: { rsi_threshold: 30 },
    exit_trigger: 'TAKE_PROFIT', exit_params: { take_profit_pct: 5, stop_loss_pct: 2 },
    quantity: 1000, max_position_size: 5000, mode: 'PAPER',
  })
  const set = (k: keyof StrategyCreate, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div
      className="modal-bg open"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        {/* Fixed handle at top — never scrolls away */}
        <div className="modal-handle" />

        {/* Scrollable content area */}
        <div className="modal-scroll">
          <div className="modal-title">Build Strategy</div>

          <div className="builder-field">
            <label className="field-label">Strategy name</label>
            <input
              type="text"
              placeholder="e.g. MY Swing RSI"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="field-input"
            />
          </div>

          <div className="builder-field">
            <label className="field-label">Market</label>
            <select className="field-input" value={form.market} onChange={e => set('market', e.target.value)}>
              <option value="KLSE">Bursa Malaysia (KLSE)</option>
              <option value="NASDAQ">US Market (NASDAQ)</option>
              <option value="NYSE">US Market (NYSE)</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="field-label">Broker</label>
            <select className="field-input" value={form.broker} onChange={e => set('broker', e.target.value)}>
              <option value="moomoo">Moomoo (Futu)</option>
              <option value="tiger">Tiger Brokers</option>
              <option value="ibkr">Interactive Brokers</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="field-label">Entry trigger</label>
            <select className="field-input" value={form.entry_trigger} onChange={e => set('entry_trigger', e.target.value)}>
              <option value="RSI_OVERSOLD">RSI crosses below 30 (oversold)</option>
              <option value="RSI_OVERBOUGHT">RSI crosses above 70 (overbought)</option>
              <option value="MACD_BULLISH_CROSS">MACD bullish crossover</option>
              <option value="VOLUME_SPIKE">Volume spike (2× avg)</option>
              <option value="ABOVE_EMA">Price above 20 EMA</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="field-label">Exit trigger</label>
            <select className="field-input" value={form.exit_trigger} onChange={e => set('exit_trigger', e.target.value)}>
              <option value="TAKE_PROFIT">Take profit +5%</option>
              <option value="TRAILING_STOP">Trailing stop 2%</option>
              <option value="RSI_OVERBOUGHT">RSI crosses above 70</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="field-label">Stop loss</label>
            <select className="field-input">
              <option>Fixed -2%</option>
              <option>Fixed -3%</option>
              <option>ATR-based (1×)</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="field-label">Quantity (lots)</label>
            <input
              type="number"
              value={form.quantity}
              onChange={e => set('quantity', +e.target.value)}
              className="field-input"
            />
          </div>

          <div className="builder-field">
            <label className="field-label">Max position size (RM)</label>
            <input
              type="number"
              value={form.max_position_size}
              onChange={e => set('max_position_size', +e.target.value)}
              className="field-input"
            />
          </div>

          <div className="builder-field">
            <label className="field-label">Execution mode</label>
            <select className="field-input" value={form.mode} onChange={e => set('mode', e.target.value as 'PAPER'|'SEMI_AUTO'|'LIVE')}>
              <option value="PAPER">Paper trade (no real orders)</option>
              <option value="SEMI_AUTO">Semi-auto (confirm before trade)</option>
              <option value="LIVE">Full auto (execute immediately)</option>
            </select>
          </div>

          <div className="btn-row">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => form.name && onSave(form)}
              disabled={!form.name}
            >
              Save Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Strategies({ onToast }: { onToast: (m: string) => void }) {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => mockStrategyApi.list().then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      mockStrategyApi.update(id, { status: status === 'active' ? 'paused' : 'active' }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['strategies'] })
      onToast(v.status === 'active' ? '⏸ Strategy paused' : '▶ Strategy resumed')
    },
  })

  const createMutation = useMutation({
    mutationFn: mockStrategyApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['strategies'] })
      setShowModal(false)
      onToast('✓ Strategy saved (paper mode)')
    },
  })

  const evalMutation = useMutation({
    mutationFn: (id: string) => mockStrategyApi.evaluate(id).then(r => r.data),
    onSuccess: d => {
      const hits = d.results.filter((r: { signal: boolean }) => r.signal).length
      onToast(`Evaluated: ${hits}/${d.results.length} signals`)
    },
  })

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 8px' }}>
        <span className="section-label">My Strategies</span>
        <button
          className="btn btn-primary"
          style={{ flex: 0, padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={13} /> New
        </button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
      )}

      {data?.strategies.map(s => (
        <StrategyCard
          key={s.id}
          s={s}
          onToggle={() => toggleMutation.mutate({ id: s.id, status: s.status })}
          onEval={() => evalMutation.mutate(s.id)}
        />
      ))}

      {showModal && (
        <NewModal
          onClose={() => setShowModal(false)}
          onSave={createMutation.mutate}
        />
      )}
    </>
  )
}
