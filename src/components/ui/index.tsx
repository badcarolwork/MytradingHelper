'use client'

import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      {action}
    </div>
  )
}

export function Metric({ label, value, sub, subUp }: {
  label: string; value: ReactNode; sub?: ReactNode; subUp?: boolean
}) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-val">{value}</div>
      {sub && <div className={`metric-sub ${subUp === true ? 'up' : subUp === false ? 'dn' : ''}`}>{sub}</div>}
    </div>
  )
}

export function Badge({ variant, children }: {
  variant: 'active'|'paused'|'inactive'|'filled'|'open'|'partial'|'connected'|'disconnected'
  children: ReactNode
}) {
  const cls = {
    active: 'badge-active', paused: 'badge-paused', inactive: 'badge-inactive',
    filled: 'status-filled', open: 'status-open', partial: 'status-partial',
    connected: 'cb-connected', disconnected: 'cb-disconnected',
  }[variant]
  return <span className={`strat-badge ${cls}`}>{children}</span>
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="slider" />
    </label>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="section-label">{children}</span>
}

export function Spinner() {
  return (
    <div style={{ width: 24, height: 24, border: '2px solid rgba(99,160,255,0.2)', borderTopColor: 'var(--accent2)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  )
}
