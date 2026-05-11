'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card fade-in', className)}>{children}</div>
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>{title}</span>
      {action}
    </div>
  )
}

// ── Metric ────────────────────────────────────────────────────────────────────
export function Metric({ label, value, sub, subUp }: {
  label: string; value: ReactNode; sub?: ReactNode; subUp?: boolean
}) {
  return (
    <div className="metric-tile">
      <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, color: subUp === true ? '#34d399' : subUp === false ? '#f87171' : '#64748b' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'active'|'paused'|'inactive'|'filled'|'open'|'partial'|'connected'|'disconnected'

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return <span className={cn('badge', `badge-${variant}`)}>{children}</span>
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('toggle-track', checked && 'on')}
      style={{ cursor: 'pointer', flexShrink: 0 }}
    >
      <div className="toggle-thumb" />
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', paddingTop: 4, display: 'block' }}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-5 h-5 border-2 rounded-full animate-spin', className)}
      style={{ borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#60a5fa' }}
    />
  )
}
