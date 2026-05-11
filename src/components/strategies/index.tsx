'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, Pause, FlaskConical, AlertCircle } from 'lucide-react'
import { mockStrategyApi } from '@/lib/mockApi'
import { Card, Badge, Spinner } from '@/components/ui'
import type { Strategy, StrategyCreate } from '@/types'

// ── Validation ────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string
  symbols?: string
  quantity?: string
  max_position_size?: string
}

function validate(form: StrategyCreate): FormErrors {
  const errs: FormErrors = {}

  if (!form.name.trim())
    errs.name = 'Strategy name is required'
  else if (form.name.trim().length < 3)
    errs.name = 'Name must be at least 3 characters'
  else if (form.name.trim().length > 40)
    errs.name = 'Name must be 40 characters or less'

  if (!form.symbols.length || form.symbols.every(s => !s.trim()))
    errs.symbols = 'At least one stock symbol is required'

  if (!form.quantity || form.quantity <= 0)
    errs.quantity = 'Quantity must be greater than 0'
  else if (form.quantity > 100_000)
    errs.quantity = 'Quantity cannot exceed 100,000 lots'

  if (!form.max_position_size || form.max_position_size <= 0)
    errs.max_position_size = 'Max position size must be greater than 0'
  else if (form.max_position_size > 500_000)
    errs.max_position_size = 'Max position size cannot exceed RM 500,000'

  if (form.quantity > 0 && (form.max_position_size ?? 0) > 0) {
    // warn if quantity * approx price > max_position_size (rough sanity check)
    const roughValue = form.market === 'KLSE'
      ? form.quantity * 5       // ~RM 5 avg per lot
      : form.quantity * 1000    // ~RM 1000 per share for US
    if (roughValue > (form.max_position_size ?? 0) * 10) {
      errs.quantity = `Quantity seems very large for this max position size`
    }
  }

  return errs
}

// ── Strategy card ─────────────────────────────────────────────────────────────
function StrategyCard({ s, onToggle, onEval }: { s: Strategy; onToggle: () => void; onEval: () => void }) {
  const wr  = s.stats.trades > 0 ? Math.round(s.stats.wins / s.stats.trades * 100) : 0
  const pnl = s.stats.total_pnl
  return (
    <div className="strat-card">
      <div className="strat-header">
        <div className="strat-name">{s.name}</div>
        <Badge variant={s.status as 'active'|'paused'|'inactive'}>{s.status.toUpperCase()}</Badge>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 8 }}>
        {s.broker} · {s.market} · {s.mode}
      </div>
      <div className="strat-criteria">
        <span className="criterion">{s.entry_trigger.replace(/_/g,' ').toLowerCase()}</span>
        <span className="criterion">{s.exit_trigger.replace(/_/g,' ').toLowerCase()}</span>
        {s.symbols.slice(0,3).map(sym => <span key={sym} className="criterion">{sym}</span>)}
      </div>
      <div className="strat-stats">
        <div className="strat-stat">
          <div className="strat-stat-val">{s.stats.trades}</div>
          <div className="strat-stat-label">Trades</div>
        </div>
        <div className="strat-stat">
          <div className={`strat-stat-val ${wr > 0 ? 'up' : ''}`}>{wr}%</div>
          <div className="strat-stat-label">Win rate</div>
        </div>
        <div className="strat-stat">
          <div className={`strat-stat-val ${pnl >= 0 ? 'up' : 'dn'}`}>
            {pnl >= 0 ? '+' : ''}RM {Math.abs(pnl).toLocaleString()}
          </div>
          <div className="strat-stat-label">P&L</div>
        </div>
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

// ── Form helpers ──────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 10, color: error ? 'var(--red2)' : 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: 'var(--red2)', fontFamily: 'var(--mono)' }}>
          <AlertCircle size={11} />
          {error}
        </div>
      )}
    </div>
  )
}

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: 'var(--bg3)',
    border: `1px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: 8,
    padding: '9px 11px',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: 13,
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.2s',
  }
}

// ── Symbols tag input ─────────────────────────────────────────────────────────
const PRESET_SYMBOLS: Record<string, string[]> = {
  KLSE:   ['PBBANK','MAYBANK','TENAGA','CIMB','DIALOG','HARTA','PCHEM','RHBBANK'],
  NASDAQ: ['NVDA','AAPL','TSLA','MSFT','AMZN','META'],
  NYSE:   ['JPM','GS','BAC','XOM','JNJ'],
}

function SymbolsInput({ market, value, onChange, error }: {
  market: string
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  const presets = PRESET_SYMBOLS[market] ?? PRESET_SYMBOLS.KLSE

  const toggle = (sym: string) => {
    onChange(value.includes(sym) ? value.filter(s => s !== sym) : [...value, sym])
  }

  return (
    <Field label="Symbols to trade" error={error}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {presets.map(sym => {
          const active = value.includes(sym)
          return (
            <button
              key={sym}
              type="button"
              onClick={() => toggle(sym)}
              style={{
                fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 10px',
                borderRadius: 5, cursor: 'pointer', transition: 'all 0.15s',
                background: active ? 'var(--accent)' : 'var(--bg3)',
                color: active ? '#fff' : 'var(--text3)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {sym}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>
          {value.length} selected: {value.join(', ')}
        </div>
      )}
    </Field>
  )
}

// ── New strategy modal ────────────────────────────────────────────────────────
function NewModal({ onClose, onSave }: { onClose: () => void; onSave: (d: StrategyCreate) => void }) {
  const [form, setForm] = useState<StrategyCreate>({
    name: '',
    broker: 'moomoo',
    market: 'KLSE',
    symbols: [],
    entry_trigger: 'RSI_OVERSOLD',
    entry_params: { rsi_threshold: 30 },
    exit_trigger: 'TAKE_PROFIT',
    exit_params: { take_profit_pct: 5, stop_loss_pct: 2 },
    quantity: 1000,
    max_position_size: 5000,
    mode: 'PAPER',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof StrategyCreate, v: unknown) => {
    const next = { ...form, [k]: v }
    setForm(next)
    // Re-validate on change after first submit attempt
    if (submitted) setErrors(validate(next))
  }

  const handleSave = () => {
    setSubmitted(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return // block save
    onSave(form)
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div
      className="modal-bg open"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-handle" />

        <div className="modal-scroll">
          <div className="modal-title">Build Strategy</div>

          {/* Strategy name */}
          <Field label="Strategy name *" error={errors.name}>
            <input
              style={fieldStyle(!!errors.name)}
              type="text"
              placeholder="e.g. MY Swing RSI"
              value={form.name}
              maxLength={40}
              onChange={e => set('name', e.target.value)}
            />
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3, textAlign: 'right' }}>
              {form.name.length}/40
            </div>
          </Field>

          {/* Market + Broker side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Market *">
              <select
                style={fieldStyle(false)}
                value={form.market}
                onChange={e => {
                  set('market', e.target.value)
                  set('symbols', []) // reset symbols when market changes
                }}
              >
                <option value="KLSE">Bursa (KLSE)</option>
                <option value="NASDAQ">NASDAQ</option>
                <option value="NYSE">NYSE</option>
              </select>
            </Field>
            <Field label="Broker *">
              <select style={fieldStyle(false)} value={form.broker} onChange={e => set('broker', e.target.value)}>
                <option value="moomoo">Moomoo</option>
                <option value="tiger">Tiger</option>
                <option value="ibkr">IBKR</option>
              </select>
            </Field>
          </div>

          {/* Symbol picker */}
          <SymbolsInput
            market={form.market}
            value={form.symbols}
            onChange={v => set('symbols', v)}
            error={errors.symbols}
          />

          {/* Entry trigger */}
          <Field label="Entry trigger *">
            <select style={fieldStyle(false)} value={form.entry_trigger} onChange={e => set('entry_trigger', e.target.value)}>
              <option value="RSI_OVERSOLD">RSI crosses below 30 (oversold)</option>
              <option value="RSI_OVERBOUGHT">RSI crosses above 70 (overbought)</option>
              <option value="MACD_BULLISH_CROSS">MACD bullish crossover</option>
              <option value="VOLUME_SPIKE">Volume spike (2× avg)</option>
              <option value="ABOVE_EMA">Price above 20 EMA</option>
            </select>
          </Field>

          {/* Exit + Stop loss side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Exit trigger *">
              <select style={fieldStyle(false)} value={form.exit_trigger} onChange={e => set('exit_trigger', e.target.value)}>
                <option value="TAKE_PROFIT">Take profit +5%</option>
                <option value="TRAILING_STOP">Trailing stop 2%</option>
                <option value="RSI_OVERBOUGHT">RSI above 70</option>
              </select>
            </Field>
            <Field label="Stop loss *">
              <select style={fieldStyle(false)}>
                <option>Fixed -2%</option>
                <option>Fixed -3%</option>
                <option>ATR (1×)</option>
              </select>
            </Field>
          </div>

          {/* Quantity + Max size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Quantity (lots) *" error={errors.quantity}>
              <input
                style={fieldStyle(!!errors.quantity)}
                type="number"
                min={1}
                max={100000}
                value={form.quantity}
                onChange={e => set('quantity', +e.target.value)}
              />
            </Field>
            <Field label="Max size (RM) *" error={errors.max_position_size}>
              <input
                style={fieldStyle(!!errors.max_position_size)}
                type="number"
                min={1}
                max={500000}
                value={form.max_position_size}
                onChange={e => set('max_position_size', +e.target.value)}
              />
            </Field>
          </div>

          {/* Mode */}
          <Field label="Execution mode *">
            <select style={fieldStyle(false)} value={form.mode} onChange={e => set('mode', e.target.value as 'PAPER'|'SEMI_AUTO'|'LIVE')}>
              <option value="PAPER">Paper trade (no real orders)</option>
              <option value="SEMI_AUTO">Semi-auto (confirm first)</option>
              <option value="LIVE">Full auto (execute immediately)</option>
            </select>
          </Field>

          {/* LIVE mode warning */}
          {form.mode === 'LIVE' && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 10,
            }}>
              <AlertCircle size={14} style={{ color: 'var(--red2)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: 'var(--red2)', lineHeight: 1.5 }}>
                <strong>Full auto mode</strong> will execute real orders immediately without confirmation. Ensure your broker is connected and risk limits are set correctly.
              </div>
            </div>
          )}

          {/* Summary error if submit blocked */}
          {submitted && hasErrors && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 10,
              fontSize: 12, color: 'var(--red2)', fontFamily: 'var(--mono)',
            }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} above before saving
            </div>
          )}

          {/* Sticky buttons */}
          <div style={{
            display: 'flex', gap: 10, marginTop: 8,
            position: 'sticky', bottom: 0,
            background: 'var(--bg2)',
            paddingTop: 10, paddingBottom: 8,
            borderTop: '1px solid var(--border)',
          }}>
            <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, opacity: submitted && hasErrors ? 0.6 : 1 }}
              onClick={handleSave}
            >
              Save Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Strategies page ───────────────────────────────────────────────────────────
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
      onToast('✓ Strategy saved successfully')
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner />
        </div>
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
