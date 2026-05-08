import axios from 'axios'
import type {
  AuthTokens, User, Portfolio, Order, OrderRequest,
  Position, RiskConfig, Strategy, StrategyCreate,
  PriceData, Candle, Indicators, ScannerResult,
  PnLRecord, BrokerConnection, EvalResult,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({ baseURL: BASE })

// ─── Token management ─────────────────────────────────────────────────────────
export function setToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token)
  }
}

export function clearToken() {
  delete api.defaults.headers.common['Authorization']
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export function loadStoredToken() {
  if (typeof window === 'undefined') return
  const token = localStorage.getItem('access_token')
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens | { require_2fa: true; temp_token: string }>(
      '/auth/login', { email, password }
    ),
  verify2fa: (temp_token: string, totp_code: string) =>
    api.post<AuthTokens>('/auth/2fa/verify', { temp_token, totp_code }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  refresh: (refresh_token: string) =>
    api.post<AuthTokens>('/auth/refresh', { refresh_token }),
  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),
  me: () => api.get<User>('/auth/me'),
}

// ─── Market data ──────────────────────────────────────────────────────────────
export const marketApi = {
  prices: (symbols?: string) =>
    api.get<{ prices: Record<string, PriceData> }>(
      '/market/prices', { params: symbols ? { symbols } : {} }
    ),
  price: (symbol: string) =>
    api.get<PriceData>(`/market/prices/${symbol}`),
  ohlcv: (symbol: string, period = '1d', bars = 50) =>
    api.get<{ symbol: string; period: string; candles: Candle[] }>(
      `/market/ohlcv/${symbol}`, { params: { period, bars } }
    ),
  indicators: (symbol: string, period = '1d') =>
    api.get<Indicators>(`/market/indicators/${symbol}`, { params: { period } }),
  scanner: (trigger = 'RSI_OVERSOLD', market?: string) =>
    api.get<{ trigger: string; results: ScannerResult[]; signals_found: number }>(
      '/market/scanner', { params: { trigger, ...(market ? { market } : {}) } }
    ),
}

// ─── Trading ──────────────────────────────────────────────────────────────────
export const tradingApi = {
  placeOrder: (order: OrderRequest) =>
    api.post<Order>('/trading/orders', order),
  cancelOrder: (orderId: string) =>
    api.delete<Order>(`/trading/orders/${orderId}`),
  orders: (status?: string) =>
    api.get<{ orders: Order[]; total: number }>(
      '/trading/orders', { params: status ? { status } : {} }
    ),
  positions: () =>
    api.get<{ positions: Position[]; summary: { total_market_value: number; total_unrealised_pnl: number; position_count: number } }>(
      '/trading/positions'
    ),
  portfolio: () => api.get<Portfolio>('/trading/portfolio'),
  killSwitch: (active: boolean) =>
    api.post<{ kill_switch_active: boolean; message: string }>(
      '/trading/kill-switch', { active }
    ),
  risk: () => api.get<RiskConfig>('/trading/risk'),
  updateRisk: (config: Partial<RiskConfig>) =>
    api.patch<{ risk_config: RiskConfig }>('/trading/risk', config),
}

// ─── Strategies ───────────────────────────────────────────────────────────────
export const strategyApi = {
  list: () =>
    api.get<{ strategies: Strategy[]; total: number }>('/strategies/'),
  get: (id: string) => api.get<Strategy>(`/strategies/${id}`),
  create: (data: StrategyCreate) =>
    api.post<Strategy>('/strategies/', data),
  update: (id: string, data: Partial<Strategy>) =>
    api.patch<Strategy>(`/strategies/${id}`, data),
  delete: (id: string) => api.delete(`/strategies/${id}`),
  evaluate: (id: string) =>
    api.post<{ results: EvalResult[]; strategy_name: string; mode: string; status: string; evaluated_at: string }>(
      `/strategies/${id}/evaluate`
    ),
}

// ─── Portfolio / Brokers ──────────────────────────────────────────────────────
export const portfolioApi = {
  summary: () => api.get<Portfolio>('/portfolio/summary'),
  pnlHistory: (days = 30) =>
    api.get<{ history: PnLRecord[] }>('/portfolio/pnl-history', { params: { days } }),
  brokers: () =>
    api.get<{ brokers: BrokerConnection[] }>('/portfolio/brokers'),
  connectBroker: (broker: string, api_key: string, api_secret: string) =>
    api.post(`/portfolio/brokers/${broker}/connect`, { broker, api_key, api_secret }),
  disconnectBroker: (broker: string) =>
    api.post(`/portfolio/brokers/${broker}/disconnect`),
}
