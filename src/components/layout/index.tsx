'use client'

import { LayoutGrid, TrendingUp, Zap, FileText, Settings } from 'lucide-react'

export function TopBar({ killActive }: { killActive: boolean }) {
  return (
    <header className="topbar">
      <div className="topbar-logo">MyTrade<span>Helper</span></div>
      <div className={`status-pill${killActive ? ' halted' : ''}`}>
        <span className="pulse-dot" style={{ background: killActive ? 'var(--red2)' : 'var(--green2)' }} />
        {killActive ? 'HALTED' : 'LIVE'}
      </div>
    </header>
  )
}

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutGrid },
  { id: 'watchlist',  label: 'Watchlist',  Icon: TrendingUp },
  { id: 'strategies', label: 'Strategies', Icon: Zap },
  { id: 'orders',     label: 'Orders',     Icon: FileText },
  { id: 'settings',   label: 'Settings',   Icon: Settings },
] as const

export type TabId = typeof NAV[number]['id']

export function BottomNav({ active, onNavigate }: { active: TabId; onNavigate: (t: TabId) => void }) {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ id, label, Icon }) => (
        <button key={id} className={`nav-item${active === id ? ' active' : ''}`} onClick={() => onNavigate(id)}>
          <Icon size={22} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>
}
