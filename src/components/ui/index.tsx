'use client'

import { type ReactNode } from 'react'

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
      {sub && (
        <div className={`metric-sub ${subUp === true ? 'up' : subUp === false ? 'dn' : ''}`}>
          {sub}
        </div>
      )}
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

// Toggle — pure div implementation, no CSS sibling selector dependency
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 44,
        height: 24,
        borderRadius: 100,
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'background 0.25s, border-color 0.25s',
        background: checked ? 'var(--accent)' : 'var(--surface)',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border2)'}`,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'transform 0.25s',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="section-label">{children}</span>
}

export function Spinner() {
  return (
    <div style={{
      width: 24, height: 24,
      border: '2px solid rgba(99,160,255,0.2)',
      borderTopColor: 'var(--accent2)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  )
}
