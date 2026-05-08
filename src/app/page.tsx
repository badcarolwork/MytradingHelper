'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store'
import { loadStoredToken, authApi, setToken } from '@/lib/api'
import { Login } from '@/components/login'
import { TopBar, BottomNav, Toast, type TabId } from '@/components/layout'
import { Dashboard } from '@/components/dashboard'
import { Watchlist } from '@/components/watchlist'
import { Strategies } from '@/components/strategies'
import { Orders } from '@/components/orders'
import { Settings } from '@/components/settings'
import { usePriceFeed } from '@/hooks/usePriceFeed'
import { useTradingStore } from '@/store'

function App() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const killSwitchActive = useTradingStore(s => s.killSwitchActive)

  usePriceFeed()

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])

  return (
    <div className="relative min-h-dvh max-w-[430px] mx-auto">
      {/* Scanline texture */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)' }}
      />

      <TopBar killActive={killSwitchActive} />
      <Toast message={toast.msg} visible={toast.visible} />

      <main className="pt-[60px] pb-[72px] px-4 py-4 relative z-10" style={{ paddingTop: '72px' }}>
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
  const { isAuthenticated, login } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function tryRestore() {
      loadStoredToken()
      const stored = localStorage.getItem('access_token')
      if (stored) {
        try {
          const user = await authApi.me()
          const refresh = localStorage.getItem('refresh_token') ?? ''
          login(user.data, stored, refresh)
        } catch {
          localStorage.clear()
        }
      }
      setChecking(false)
    }
    tryRestore()
  }, [login])

  if (checking) {
    return (
      <div className="min-h-dvh bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <App /> : <Login />
}
