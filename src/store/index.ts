import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, PriceData, RiskConfig } from '@/types'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// ── Auth store ────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loginAt: number | null           // unix ms — used to enforce 24h TTL
  login: (user: User, access: string, refresh: string) => void
  logout: () => void
  checkSession: () => boolean      // returns true if session still valid
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loginAt: null,

      login: (user, access, refresh) => {
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
          loginAt: Date.now(),
        })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loginAt: null,
        })
      },

      checkSession: () => {
        const { loginAt, isAuthenticated, logout } = get()
        if (!isAuthenticated || !loginAt) return false
        const expired = Date.now() - loginAt > SESSION_TTL_MS
        if (expired) {
          logout()
          return false
        }
        return true
      },
    }),
    {
      name: 'mytradehelper-auth',
      // Persist everything needed to restore the session
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
        loginAt: s.loginAt,
      }),
    }
  )
)

// ── Market store ──────────────────────────────────────────────────────────────
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

// ── Trading/UI store ──────────────────────────────────────────────────────────
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
