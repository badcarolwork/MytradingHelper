'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, TrendingUp, Zap, FileText, Settings, PowerOff } from 'lucide-react'

// ── TopBar ────────────────────────────────────────────────────────────────────
export function TopBar({ killActive }: { killActive: boolean }) {
  return (
    <header className="tp-topbar" style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, zIndex: 50,
      padding: '14px 20px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: '#e2e8f0' }}>
        MyTrade<span style={{ color: '#60a5fa' }}>Helper</span>
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 100,
        border: `1px solid ${killActive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}`,
        background: killActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: killActive ? '#f87171' : '#34d399',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: killActive ? '#f87171' : '#34d399',
          animation: killActive ? 'none' : 'pulse 2s ease-in-out infinite',
        }} />
        {killActive ? 'HALTED' : 'LIVE'}
      </div>
    </header>
  )
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutGrid },
  { id: 'watchlist',  label: 'Watchlist',  Icon: TrendingUp },
  { id: 'strategies', label: 'Strategies', Icon: Zap },
  { id: 'orders',     label: 'Orders',     Icon: FileText },
  { id: 'settings',   label: 'Settings',   Icon: Settings },
] as const

export type TabId = typeof NAV[number]['id']

export function BottomNav({ active, onNavigate }: { active: TabId; onNavigate: (tab: TabId) => void }) {
  return (
    <nav className="tp-bottomnav" style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, zIndex: 50,
      display: 'flex', justifyContent: 'space-around',
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    }}>
      {NAV.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onNavigate(id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 10, letterSpacing: '0.04em',
          color: active === id ? '#60a5fa' : '#64748b',
          transition: 'color 0.2s',
        }}>
          <Icon size={22} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
      background: '#243352', border: '1px solid rgba(99,160,255,0.22)',
      padding: '10px 18px', borderRadius: 10,
      fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0',
      pointerEvents: 'none', whiteSpace: 'nowrap',
      opacity: visible ? 1 : 0, transition: 'all 0.3s', zIndex: 200,
    }}>
      {message}
    </div>
  )
}
