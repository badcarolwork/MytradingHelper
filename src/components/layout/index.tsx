'use client'

import { cn } from '@/lib/utils'
import {
  LayoutGrid, TrendingUp, Zap, FileText, Settings,
  PowerOff,
} from 'lucide-react'

// ─── TopBar ───────────────────────────────────────────────────────────────────
export function TopBar({ killActive }: { killActive: boolean }) {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-blue-500/10 px-5 py-3.5 flex items-center justify-between">
      <span className="text-[17px] font-bold tracking-tight text-white">
        MyTrade<span className="text-blue-400">Helper</span>
      </span>
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-colors',
        killActive
          ? 'bg-red-500/10 border-red-500/20 text-red-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      )}>
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          killActive ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
        )} />
        {killActive ? 'HALTED' : 'LIVE'}
      </div>
    </header>
  )
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { id: 'watchlist', label: 'Watchlist', Icon: TrendingUp },
  { id: 'strategies', label: 'Strategies', Icon: Zap },
  { id: 'orders', label: 'Orders', Icon: FileText },
  { id: 'settings', label: 'Settings', Icon: Settings },
] as const

export type TabId = typeof NAV_ITEMS[number]['id']

export function BottomNav({ active, onNavigate }: {
  active: TabId
  onNavigate: (tab: TabId) => void
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-blue-500/10 flex justify-around pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={cn(
            'flex flex-col items-center gap-1 py-2.5 px-4 text-[10px] tracking-wide transition-colors',
            active === id ? 'text-blue-400' : 'text-slate-500'
          )}
        >
          <Icon size={20} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={cn(
      'fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl border border-blue-500/20 bg-[#243352] text-[12px] font-mono text-slate-200 pointer-events-none whitespace-nowrap transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    )}>
      {message}
    </div>
  )
}
