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
    <div style={{ position: 'relative', minHeight: '100dvh', maxWidth: 430, margin: '0 auto', backgroundColor: '#0a0f1e' }}>
      <div className="scanlines" />
      <TopBar killActive={killSwitchActive} />
      <Toast message={toast.msg} visible={toast.visible} />
      <main style={{ paddingTop: 64, paddingBottom: 80, padding: '64px 16px 80px', position: 'relative', zIndex: 1 }}>
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

  if (!mounted) return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return isAuthenticated ? <App /> : <Login />
}
