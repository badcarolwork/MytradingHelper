'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store'
import { Login } from '@/components/login'
import { TopBar, BottomNav, Toast, type TabId } from '@/components/layout'
import { Dashboard } from '@/components/dashboard'
import { Watchlist } from '@/components/watchlist'
import { Strategies } from '@/components/strategies'
import { Orders } from '@/components/orders'
import { Settings } from '@/components/settings'
import { useTradingStore } from '@/store'

function App() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const killSwitchActive = useTradingStore(s => s.killSwitchActive)

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])

  return (
    <div className="relative min-h-dvh max-w-[430px] mx-auto">
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }}
      />
      <TopBar killActive={killSwitchActive} />
      <Toast message={toast.msg} visible={toast.visible} />

      <main className="relative z-10" style={{ paddingTop: '64px', paddingBottom: '72px', padding: '64px 16px 80px' }}>
        {tab === 'dashboard'  && <Dashboard  onToast={showToast} />}
        {tab === 'watchlist'  && <Watchlist  onToast={showToast} />}
        {tab === 'strategies' && <Strategies onToast={showToast} />}
        {tab === 'orders'     && <Orders     onToast={showToast} />}
        {tab === 'settings'   && <Settings   onToast={showToast} />}
      </main>

      <BottomNav active={tab} onNavigate={setTab} />
    </div>
  )
}

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <App /> : <Login />
}
