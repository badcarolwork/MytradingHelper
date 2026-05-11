'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'active'|'paused'|'inactive'|'filled'|'open'|'partial'|'connected'|'disconnected'

const badgeStyles: Record<BadgeVariant, string> = {
  active:       'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  paused:       'bg-amber-500/10   text-amber-400   border border-amber-500/20',
  inactive:     'bg-slate-500/10   text-slate-400   border border-slate-500/20',
  filled:       'bg-emerald-500/10 text-emerald-400',
  open:         'bg-blue-500/10    text-blue-400',
  partial:      'bg-amber-500/10   text-amber-400',
  connected:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  disconnected: 'bg-blue-500/10    text-blue-400    border border-blue-500/25',
}

export function Badge({ variant, children, className }: {
  variant: BadgeVariant; children: ReactNode; className?: string
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wide', badgeStyles[variant], className)}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('tp-card', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>{title}</span>
      {action}
    </div>
  )
}

// ── Metric ────────────────────────────────────────────────────────────────────
export function Metric({ label, value, sub, subUp }: {
  label: string; value: ReactNode; sub?: ReactNode; subUp?: boolean
}) {
  return (
    <div className="tp-metric">
      <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, color: subUp === true ? 'var(--green2)' : subUp === false ? 'var(--red2)' : 'var(--text3)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        position: 'relative', width: 44, height: 24, borderRadius: 100,
        border: `1px solid ${checked ? '#3b82f6' : 'rgba(99,160,255,0.22)'}`,
        background: checked ? '#3b82f6' : '#1e2d45',
        cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 18, height: 18, background: '#fff', borderRadius: '50%',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', paddingTop: 4, display: 'block' }}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('animate-spin', className)}
      style={{ width: 20, height: 20, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#60a5fa', borderRadius: '50%' }}
    />
  )
}
