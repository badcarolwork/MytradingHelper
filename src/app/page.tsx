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
  const [tab, setTab]   = useState<TabId>('dashboard')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const killSwitchActive  = useTradingStore(s => s.killSwitchActive)

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])

  return (
    <>
      <TopBar killActive={killSwitchActive} />
      <Toast message={toast.msg} visible={toast.visible} />
      <main style={{ paddingTop: 72, paddingBottom: 90, padding: '72px 16px 90px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
        {tab === 'dashboard'  && <Dashboard  onToast={showToast} />}
        {tab === 'watchlist'  && <Watchlist  onToast={showToast} />}
        {tab === 'strategies' && <Strategies onToast={showToast} />}
        {tab === 'orders'     && <Orders     onToast={showToast} />}
        {tab === 'settings'   && <Settings   onToast={showToast} />}
      </main>
      <BottomNav active={tab} onNavigate={setTab} />
    </>
  )
}

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(99,160,255,0.2)', borderTopColor: 'var(--accent2)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return isAuthenticated ? <App /> : <Login />
}
