import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, PriceData, RiskConfig } from '@/types'
import { setToken, clearToken } from '@/lib/api'

// ─── Auth store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, access, refresh) => {
        setToken(access)
        set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },
      logout: () => {
        clearToken()
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    { name: 'mytradehelper-auth', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
)

// ─── Market store ─────────────────────────────────────────────────────────────
interface MarketState {
  prices: Record<string, PriceData>
  setPrices: (prices: Record<string, PriceData>) => void
  getPrice: (symbol: string) => PriceData | undefined
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  setPrices: (prices) => set({ prices }),
  getPrice: (symbol) => get().prices[symbol],
}))

// ─── Trading/UI store ─────────────────────────────────────────────────────────
interface TradingState {
  killSwitchActive: boolean
  riskConfig: RiskConfig | null
  setKillSwitch: (active: boolean) => void
  setRiskConfig: (config: RiskConfig) => void
}

export const useTradingStore = create<TradingState>((set) => ({
  killSwitchActive: false,
  riskConfig: null,
  setKillSwitch: (active) => set({ killSwitchActive: active }),
  setRiskConfig: (config) => set({ riskConfig: config, killSwitchActive: config.kill_switch_active }),
}))
