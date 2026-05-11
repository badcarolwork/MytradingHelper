'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, TrendingUp, Zap, FileText, Settings } from 'lucide-react'

export function TopBar({ killActive }: { killActive: boolean }) {
  return (
    <header className="topbar">
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: '#e2e8f0' }}>
        MyTrade<span style={{ color: '#60a5fa' }}>Helper</span>
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 100,
        background: killActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${killActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: killActive ? '#f87171' : '#34d399',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: killActive ? '#f87171' : '#34d399',
          display: 'inline-block',
          animation: killActive ? 'none' : 'pulse 2s infinite',
        }} />
        {killActive ? 'HALTED' : 'LIVE'}
      </div>
    </header>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutGrid },
  { id: 'watchlist',  label: 'Watchlist',  Icon: TrendingUp },
  { id: 'strategies', label: 'Strategies', Icon: Zap },
  { id: 'orders',     label: 'Orders',     Icon: FileText },
  { id: 'settings',   label: 'Settings',   Icon: Settings },
] as const

export type TabId = typeof NAV_ITEMS[number]['id']

export function BottomNav({ active, onNavigate }: {
  active: TabId
  onNavigate: (tab: TabId) => void
}) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={cn('nav-btn', active === id && 'active')}
        >
          <Icon size={20} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : -12}px)`,
      background: '#243352', border: '1px solid rgba(99,160,255,0.22)',
      padding: '10px 18px', borderRadius: 10,
      fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0',
      zIndex: 300, opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'all 0.3s', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}
