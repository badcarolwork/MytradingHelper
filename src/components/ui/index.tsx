'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'active' | 'paused' | 'inactive' | 'filled' | 'open' | 'partial' | 'connected' | 'disconnected'

const badgeStyles: Record<BadgeVariant, string> = {
  active:       'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  paused:       'bg-amber-500/12 text-amber-400 border border-amber-500/20',
  inactive:     'bg-slate-500/12 text-slate-400 border border-slate-500/20',
  filled:       'bg-emerald-500/10 text-emerald-400',
  open:         'bg-blue-500/10 text-blue-400',
  partial:      'bg-amber-500/10 text-amber-400',
  connected:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  disconnected: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
}

export function Badge({ variant, children, className }: {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wide',
      badgeStyles[variant], className
    )}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-[14px] border border-blue-500/10 bg-[#111827] p-4',
      'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/[0.03] before:to-transparent',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">{title}</span>
      {action}
    </div>
  )
}

// ─── Metric tile ──────────────────────────────────────────────────────────────
export function Metric({ label, value, sub, subUp }: {
  label: string
  value: ReactNode
  sub?: ReactNode
  subUp?: boolean
}) {
  return (
    <div className="rounded-[10px] border border-blue-500/10 bg-[#1a2235] px-3.5 py-3">
      <div className="text-[10px] tracking-[0.06em] uppercase text-slate-500 mb-1.5">{label}</div>
      <div className="text-xl font-semibold font-mono leading-none">{value}</div>
      {sub && (
        <div className={cn('text-[11px] font-mono mt-1', subUp === true ? 'text-emerald-400' : subUp === false ? 'text-red-400' : 'text-slate-500')}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full border transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-blue-500 border-blue-500' : 'bg-[#1e2d45] border-blue-500/20'
      )}
    >
      <span className={cn(
        'absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
        checked && 'translate-x-5'
      )} />
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-500 pt-1 block">
      {children}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-5 h-5 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin', className)} />
  )
}
