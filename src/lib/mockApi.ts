/**
 * mockApi.ts
 * Drop-in replacement for api.ts calls when no backend is available.
 * Used automatically on GitHub Pages / demo mode.
 */
import {
  DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER,
  MOCK_PORTFOLIO, MOCK_STRATEGIES, MOCK_OPEN_ORDERS,
  MOCK_ORDER_HISTORY, MOCK_RISK, MOCK_BROKERS, MOCK_PRICES,
  getMockPnLHistory, getMockScannerResults,
} from './mockData'
import type { Strategy, StrategyCreate } from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// In-memory state for demo session
let strategies = [...MOCK_STRATEGIES]
let killActive = false
let brokers = [...MOCK_BROKERS]

// ── Auth ──────────────────────────────────────────────────────────────────────
export const mockAuthApi = {
  login: async (email: string, password: string) => {
    await delay()
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return { data: { access_token: 'mock-token', refresh_token: 'mock-refresh', token_type: 'bearer', user_id: DEMO_USER.user_id, email: DEMO_USER.email } }
    }
    throw new Error('Invalid credentials')
  },
  me: async () => { await delay(100); return { data: DEMO_USER } },
  logout: async () => { await delay(100); return { data: { message: 'ok' } } },
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const mockPortfolioApi = {
  summary: async () => { await delay(); return { data: MOCK_PORTFOLIO } },
  pnlHistory: async (days: number) => { await delay(); return { data: { history: getMockPnLHistory(days) } } },
  brokers: async () => { await delay(); return { data: { brokers } } },
  connectBroker: async (broker: string) => {
    await delay()
    brokers = brokers.map(b => b.broker === broker ? { ...b, status: 'connected' as const, account_id: `${broker.slice(0,2).toUpperCase()}-****-DEMO` } : b)
    return { data: { message: 'connected' } }
  },
  disconnectBroker: async (broker: string) => {
    await delay()
    brokers = brokers.map(b => b.broker === broker ? { ...b, status: 'disconnected' as const, account_id: null } : b)
    return { data: { message: 'disconnected' } }
  },
}

// ── Trading ───────────────────────────────────────────────────────────────────
export const mockTradingApi = {
  portfolio: async () => { await delay(); return { data: MOCK_PORTFOLIO } },
  positions: async () => {
    await delay()
    return { data: { positions: MOCK_PORTFOLIO.positions, summary: { total_market_value: MOCK_PORTFOLIO.invested_value, total_unrealised_pnl: MOCK_PORTFOLIO.total_unrealised_pnl, position_count: MOCK_PORTFOLIO.positions.length } } }
  },
  orders: async () => {
    await delay()
    return { data: { orders: [...MOCK_OPEN_ORDERS, ...MOCK_ORDER_HISTORY], total: MOCK_OPEN_ORDERS.length + MOCK_ORDER_HISTORY.length } }
  },
  risk: async () => { await delay(); return { data: { ...MOCK_RISK, kill_switch_active: killActive } } },
  updateRisk: async (config: object) => { await delay(); return { data: { risk_config: { ...MOCK_RISK, ...config } } } },
  killSwitch: async (active: boolean) => {
    await delay()
    killActive = active
    return { data: { kill_switch_active: active, message: active ? '⚠ All trading halted' : 'Trading resumed' } }
  },
  placeOrder: async () => { await delay(); throw new Error('Connect a broker to place orders') },
  cancelOrder: async () => { await delay(); return { data: {} } },
}

// ── Strategies ────────────────────────────────────────────────────────────────
export const mockStrategyApi = {
  list: async () => { await delay(); return { data: { strategies: strategies.map(s => ({ ...s, win_rate: s.stats.trades > 0 ? Math.round(s.stats.wins / s.stats.trades * 100) : 0 })), total: strategies.length } } },
  get: async (id: string) => { await delay(); return { data: strategies.find(s => s.id === id)! } },
  create: async (data: StrategyCreate) => {
    await delay()
    const s: Strategy = { ...data, id: `strat-${Date.now()}`, user_id: DEMO_USER.user_id, status: 'paused', stats: { trades: 0, wins: 0, losses: 0, total_pnl: 0 }, win_rate: 0, created_at: new Date().toISOString(), entry_params: data.entry_params ?? {}, exit_trigger: data.exit_trigger ?? 'TAKE_PROFIT', exit_params: data.exit_params ?? {}, max_position_size: data.max_position_size ?? 5000, mode: data.mode ?? 'PAPER' }
    strategies = [...strategies, s]
    return { data: s }
  },
  update: async (id: string, updates: Partial<Strategy>) => {
    await delay()
    strategies = strategies.map(s => s.id === id ? { ...s, ...updates } : s)
    return { data: strategies.find(s => s.id === id)! }
  },
  delete: async (id: string) => { await delay(); strategies = strategies.filter(s => s.id !== id); return { data: {} } },
  evaluate: async (id: string) => {
    await delay(800)
    const s = strategies.find(st => st.id === id)!
    return { data: { strategy_id: id, strategy_name: s.name, mode: s.mode, status: s.status, evaluated_at: new Date().toISOString(), results: s.symbols.map(sym => ({ symbol: sym, current_price: MOCK_PRICES[sym]?.price ?? 0, trigger: s.entry_trigger, indicator: `RSI: ${(Math.random() * 40 + 20).toFixed(1)}`, signal: Math.random() > 0.5, would_execute: s.status === 'active', blocked_reason: null })) } }
  },
}

// ── Market ────────────────────────────────────────────────────────────────────
export const mockMarketApi = {
  prices: async () => { await delay(200); return { data: { prices: MOCK_PRICES } } },
  scanner: async (trigger: string) => {
    await delay()
    const results = getMockScannerResults(trigger)
    return { data: { trigger, results, signals_found: results.filter(r => r.signal).length } }
  },
}
