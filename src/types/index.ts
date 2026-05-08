// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  user_id: string
  email: string
  totp_enabled: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  user_id: string
  email: string
}

// ─── Market Data ──────────────────────────────────────────────────────────────
export interface PriceData {
  symbol: string
  name: string
  market: 'KLSE' | 'NASDAQ' | 'NYSE' | string
  price: number
  open: number
  change: number
  change_pct: number
  volume: number
  avg_volume: number
  bid: number
  ask: number
}

export interface Candle {
  ts: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Indicators {
  symbol: string
  period: string
  latest_close: number
  rsi_14: number | null
  macd: { line: number | null; signal: number | null; histogram: number | null }
  ema_20: number | null
  ema_50: number | null
  bollinger: { upper: number | null; mid: number | null; lower: number | null }
}

export interface ScannerResult {
  symbol: string
  name: string
  market: string
  price: number
  rsi_14: number | null
  signal: boolean
  trigger: string
}

// ─── Trading ──────────────────────────────────────────────────────────────────
export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT'
export type OrderStatus = 'FILLED' | 'OPEN' | 'PARTIAL' | 'CANCELLED'
export type ExecMode = 'LIVE' | 'PAPER' | 'SEMI_AUTO'

export interface Order {
  order_id: string
  user_id: string
  symbol: string
  side: OrderSide
  quantity: number
  order_type: OrderType
  price: number
  limit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  status: OrderStatus
  filled_qty: number
  avg_fill_price: number | null
  broker: string
  mode: string
  created_at: string
  updated_at: string
}

export interface OrderRequest {
  symbol: string
  side: OrderSide
  quantity: number
  order_type?: OrderType
  limit_price?: number
  stop_loss?: number
  take_profit?: number
  strategy_id?: string
  mode?: ExecMode
}

export interface Position {
  symbol: string
  name: string
  market: string
  quantity: number
  avg_cost: number
  current_price: number
  market_value: number
  unrealised_pnl: number
  unrealised_pnl_pct: number
}

export interface Portfolio {
  portfolio_value: number
  cash_balance: number
  invested_value: number
  total_unrealised_pnl: number
  today_pnl: number
  today_pnl_pct: number
  positions: Position[]
  open_orders_count: number
}

export interface RiskConfig {
  kill_switch_active: boolean
  max_daily_loss: number
  daily_loss_consumed: number
  daily_loss_pct: number
  max_position_size: number
  cooldown_seconds: number
}

// ─── Strategies ───────────────────────────────────────────────────────────────
export type StrategyStatus = 'active' | 'paused' | 'inactive'
export type EntryTrigger =
  | 'RSI_OVERSOLD'
  | 'RSI_OVERBOUGHT'
  | 'MACD_BULLISH_CROSS'
  | 'VOLUME_SPIKE'
  | 'ABOVE_EMA'
  | 'MANUAL'

export interface StrategyStats {
  trades: number
  wins: number
  losses: number
  total_pnl: number
}

export interface Strategy {
  id: string
  user_id: string
  name: string
  broker: string
  market: string
  symbols: string[]
  entry_trigger: EntryTrigger
  entry_params: Record<string, number>
  exit_trigger: string
  exit_params: Record<string, number>
  quantity: number
  max_position_size: number
  mode: ExecMode
  status: StrategyStatus
  stats: StrategyStats
  win_rate?: number
  created_at: string
}

export interface StrategyCreate {
  name: string
  broker: string
  market: string
  symbols: string[]
  entry_trigger: EntryTrigger
  entry_params?: Record<string, number>
  exit_trigger?: string
  exit_params?: Record<string, number>
  quantity: number
  max_position_size?: number
  mode?: ExecMode
}

export interface EvalResult {
  symbol: string
  current_price: number
  trigger: string
  indicator: string
  signal: boolean
  would_execute: boolean
  blocked_reason: string | null
  error?: string
}

// ─── Portfolio / Brokers ──────────────────────────────────────────────────────
export interface PnLRecord {
  date: string
  daily_pnl: number
  cumulative_pnl: number
}

export type BrokerStatus = 'connected' | 'disconnected'

export interface BrokerConnection {
  broker: string
  label: string
  market: string
  status: BrokerStatus
  account_id: string | null
}

// ─── WebSocket ────────────────────────────────────────────────────────────────
export type WsMessageType = 'snapshot' | 'price_update' | 'pong'

export interface WsMessage {
  type: WsMessageType
  data?: Record<string, PriceData>
}
