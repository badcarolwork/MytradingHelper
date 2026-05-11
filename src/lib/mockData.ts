import type { Portfolio, Strategy, Order, Position, RiskConfig, BrokerConnection, PriceData, PnLRecord } from '@/types'

// ── Demo credentials ──────────────────────────────────────────────────────────
export const DEMO_EMAIL = 'demo@mytradehelper.my'
export const DEMO_PASSWORD = 'Demo1234!'
export const DEMO_USER = {
  user_id: 'demo-user-001',
  email: DEMO_EMAIL,
  totp_enabled: false,
  created_at: '2025-01-01T00:00:00Z',
}

// ── Prices ────────────────────────────────────────────────────────────────────
export const MOCK_PRICES: Record<string, PriceData> = {
  PBBANK:  { symbol: 'PBBANK',  name: 'Public Bank Bhd',      market: 'KLSE',   price: 4.12,    open: 4.08,   change: 0.04,   change_pct: 0.98,  volume: 3200000, avg_volume: 3500000, bid: 4.11,   ask: 4.13 },
  MAYBANK: { symbol: 'MAYBANK', name: 'Malayan Banking Bhd',   market: 'KLSE',   price: 8.63,    open: 8.70,   change: -0.07,  change_pct: -0.80, volume: 4100000, avg_volume: 3800000, bid: 8.62,   ask: 8.64 },
  TENAGA:  { symbol: 'TENAGA',  name: 'Tenaga Nasional Bhd',   market: 'KLSE',   price: 11.40,   open: 11.26,  change: 0.14,   change_pct: 1.24,  volume: 2100000, avg_volume: 2500000, bid: 11.39,  ask: 11.41 },
  CIMB:    { symbol: 'CIMB',    name: 'CIMB Group Holdings',   market: 'KLSE',   price: 6.88,    open: 6.84,   change: 0.04,   change_pct: 0.58,  volume: 5600000, avg_volume: 4900000, bid: 6.87,   ask: 6.89 },
  DIALOG:  { symbol: 'DIALOG',  name: 'Dialog Group Bhd',      market: 'KLSE',   price: 2.38,    open: 2.31,   change: 0.07,   change_pct: 3.03,  volume: 8200000, avg_volume: 2000000, bid: 2.37,   ask: 2.39 },
  HARTA:   { symbol: 'HARTA',   name: 'Hartalega Holdings',    market: 'KLSE',   price: 1.92,    open: 1.88,   change: 0.04,   change_pct: 2.13,  volume: 6400000, avg_volume: 2000000, bid: 1.91,   ask: 1.93 },
  NVDA:    { symbol: 'NVDA',    name: 'NVIDIA Corporation',    market: 'NASDAQ', price: 1047.20, open: 1014.0, change: 33.20,  change_pct: 3.27,  volume: 42000000,avg_volume: 38000000,bid: 1047.0, ask: 1047.4 },
  AAPL:    { symbol: 'AAPL',    name: 'Apple Inc',             market: 'NASDAQ', price: 189.40,  open: 190.0,  change: -0.60,  change_pct: -0.32, volume: 55000000,avg_volume: 58000000,bid: 189.3,  ask: 189.5 },
  TSLA:    { symbol: 'TSLA',    name: 'Tesla Inc',             market: 'NASDAQ', price: 182.60,  open: 179.2,  change: 3.40,   change_pct: 1.90,  volume: 93000000,avg_volume: 88000000,bid: 182.5,  ask: 182.7 },
  MSFT:    { symbol: 'MSFT',    name: 'Microsoft Corp',        market: 'NASDAQ', price: 415.80,  open: 413.0,  change: 2.80,   change_pct: 0.68,  volume: 22000000,avg_volume: 24000000,bid: 415.7,  ask: 415.9 },
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const MOCK_PORTFOLIO: Portfolio = {
  portfolio_value: 42810,
  cash_balance: 12450,
  invested_value: 30360,
  total_unrealised_pnl: 2840,
  today_pnl: 1240,
  today_pnl_pct: 2.98,
  open_orders_count: 2,
  positions: [
    { symbol: 'MAYBANK', name: 'Malayan Banking Bhd', market: 'KLSE',   quantity: 5000,  avg_cost: 8.42,   current_price: 8.63,   market_value: 43150,  unrealised_pnl: 1050,  unrealised_pnl_pct: 2.49 },
    { symbol: 'PBBANK',  name: 'Public Bank Bhd',     market: 'KLSE',   quantity: 2000,  avg_cost: 3.98,   current_price: 4.12,   market_value: 8240,   unrealised_pnl: 280,   unrealised_pnl_pct: 3.52 },
    { symbol: 'TENAGA',  name: 'Tenaga Nasional Bhd', market: 'KLSE',   quantity: 1000,  avg_cost: 11.10,  current_price: 11.40,  market_value: 11400,  unrealised_pnl: 300,   unrealised_pnl_pct: 2.70 },
    { symbol: 'NVDA',    name: 'NVIDIA Corporation',  market: 'NASDAQ', quantity: 10,    avg_cost: 980.00, current_price: 1047.20,market_value: 10472,  unrealised_pnl: 672,   unrealised_pnl_pct: 6.86 },
    { symbol: 'AAPL',    name: 'Apple Inc',           market: 'NASDAQ', quantity: 50,    avg_cost: 192.00, current_price: 189.40, market_value: 9470,   unrealised_pnl: -130,  unrealised_pnl_pct: -1.35 },
  ],
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const MOCK_OPEN_ORDERS: Order[] = [
  { order_id: 'ord-001', user_id: 'demo-user-001', symbol: 'PBBANK',  side: 'BUY',  quantity: 200,  order_type: 'LIMIT',  price: 4.10,   limit_price: 4.10,   stop_loss: 3.98, take_profit: 4.30, status: 'PARTIAL', filled_qty: 100, avg_fill_price: 4.10, broker: 'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-120000).toISOString(), updated_at: new Date().toISOString() },
  { order_id: 'ord-002', user_id: 'demo-user-001', symbol: 'NVDA',    side: 'BUY',  quantity: 5,    order_type: 'LIMIT',  price: 1042.00,limit_price: 1042.00,stop_loss: null, take_profit: null, status: 'OPEN',    filled_qty: 0,   avg_fill_price: null, broker: 'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-300000).toISOString(), updated_at: new Date().toISOString() },
]

export const MOCK_ORDER_HISTORY: Order[] = [
  { order_id: 'ord-003', user_id: 'demo-user-001', symbol: 'MAYBANK', side: 'BUY',  quantity: 5000, order_type: 'MARKET', price: 8.42,   limit_price: null, stop_loss: 8.20, take_profit: 8.80, status: 'FILLED',  filled_qty: 5000,avg_fill_price: 8.42, broker: 'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-86400000).toISOString(), updated_at: new Date().toISOString() },
  { order_id: 'ord-004', user_id: 'demo-user-001', symbol: 'TENAGA',  side: 'BUY',  quantity: 1000, order_type: 'MARKET', price: 11.10,  limit_price: null, stop_loss: 10.80,take_profit: 11.80,status: 'FILLED',  filled_qty: 1000,avg_fill_price: 11.10,broker: 'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-172800000).toISOString(),updated_at: new Date().toISOString() },
  { order_id: 'ord-005', user_id: 'demo-user-001', symbol: 'TSLA',    side: 'SELL', quantity: 10,   order_type: 'MARKET', price: 188.00, limit_price: null, stop_loss: null, take_profit: null, status: 'FILLED',  filled_qty: 10,  avg_fill_price: 188.00,broker:'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-259200000).toISOString(),updated_at: new Date().toISOString() },
  { order_id: 'ord-006', user_id: 'demo-user-001', symbol: 'CIMB',    side: 'BUY',  quantity: 1000, order_type: 'LIMIT',  price: 6.74,   limit_price: 6.74, stop_loss: 6.55, take_profit: 7.00, status: 'FILLED',  filled_qty: 1000,avg_fill_price: 6.74, broker: 'moomoo', mode: 'PAPER', created_at: new Date(Date.now()-345600000).toISOString(),updated_at: new Date().toISOString() },
]

// ── Strategies ────────────────────────────────────────────────────────────────
export const MOCK_STRATEGIES: Strategy[] = [
  { id: 'strat-001', user_id: 'demo-user-001', name: 'MY Swing — RSI',      broker: 'Moomoo', market: 'KLSE',   symbols: ['PBBANK','MAYBANK','TENAGA','CIMB'], entry_trigger: 'RSI_OVERSOLD',      entry_params: { rsi_threshold: 30 }, exit_trigger: 'TAKE_PROFIT', exit_params: { take_profit_pct: 5, stop_loss_pct: 2 }, quantity: 1000, max_position_size: 5000, mode: 'PAPER', status: 'active',   stats: { trades: 47, wins: 32, losses: 15, total_pnl: 3240 }, win_rate: 68, created_at: '2025-04-01T10:00:00Z' },
  { id: 'strat-002', user_id: 'demo-user-001', name: 'US Momentum',         broker: 'Moomoo', market: 'NASDAQ', symbols: ['NVDA','AAPL','TSLA','MSFT'],        entry_trigger: 'MACD_BULLISH_CROSS', entry_params: {},                    exit_trigger: 'TAKE_PROFIT', exit_params: { take_profit_pct: 3, stop_loss_pct: 1.5 },quantity: 5,    max_position_size: 5000, mode: 'PAPER', status: 'active',   stats: { trades: 31, wins: 22, losses: 9,  total_pnl: 5120 }, win_rate: 71, created_at: '2025-04-10T09:00:00Z' },
  { id: 'strat-003', user_id: 'demo-user-001', name: 'Bursa Breakout',      broker: 'Moomoo', market: 'KLSE',   symbols: ['DIALOG','HARTA'],                  entry_trigger: 'VOLUME_SPIKE',       entry_params: { volume_multiplier: 2 },exit_trigger: 'TAKE_PROFIT', exit_params: { take_profit_pct: 5, stop_loss_pct: 2 }, quantity: 2000, max_position_size: 5000, mode: 'PAPER', status: 'active',   stats: { trades: 22, wins: 14, losses: 8,  total_pnl: 1890 }, win_rate: 64, created_at: '2025-04-15T08:00:00Z' },
  { id: 'strat-004', user_id: 'demo-user-001', name: 'Conservative',        broker: 'Tiger',  market: 'KLSE',   symbols: ['MAYBANK','PBBANK'],                entry_trigger: 'ABOVE_EMA',          entry_params: { ema_period: 50 },    exit_trigger: 'TAKE_PROFIT', exit_params: { take_profit_pct: 3, stop_loss_pct: 1.5 },quantity: 500,  max_position_size: 3000, mode: 'PAPER', status: 'paused',   stats: { trades: 12, wins: 9,  losses: 3,  total_pnl: 890  }, win_rate: 75, created_at: '2025-03-20T11:00:00Z' },
]

// ── Risk ──────────────────────────────────────────────────────────────────────
export const MOCK_RISK: RiskConfig = {
  kill_switch_active: false,
  max_daily_loss: 2000,
  daily_loss_consumed: 1700,
  daily_loss_pct: 85,
  max_position_size: 5000,
  cooldown_seconds: 60,
}

// ── Brokers ───────────────────────────────────────────────────────────────────
export const MOCK_BROKERS: BrokerConnection[] = [
  { broker: 'moomoo', label: 'Moomoo (Futu)',       market: 'KLSE · US · HK',  status: 'connected',    account_id: 'MO-****-1234' },
  { broker: 'tiger',  label: 'Tiger Brokers',        market: 'SG · US',          status: 'connected',    account_id: 'TB-****-5678' },
  { broker: 'ibkr',   label: 'Interactive Brokers',  market: 'Global',           status: 'disconnected', account_id: null },
  { broker: 'bursa',  label: 'Bursa Market Data',    market: 'KLSE real-time',   status: 'connected',    account_id: 'BM-FEED' },
]

// ── P&L History ───────────────────────────────────────────────────────────────
export function getMockPnLHistory(days: number): PnLRecord[] {
  const records: PnLRecord[] = []
  let cumulative = 0
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const daily = i === 0 ? 1240 : Math.round((Math.random() - 0.4) * 500)
    cumulative += daily
    const d = new Date(now - i * 86400000)
    records.push({
      date: d.toISOString().slice(0, 10),
      daily_pnl: daily,
      cumulative_pnl: cumulative,
    })
  }
  return records
}

// ── Scanner ───────────────────────────────────────────────────────────────────
export function getMockScannerResults(trigger: string) {
  return Object.values(MOCK_PRICES).map(p => ({
    symbol: p.symbol,
    name: p.name,
    market: p.market,
    price: p.price,
    rsi_14: Math.random() * 100,
    signal: Math.random() > 0.7,
    trigger,
  }))
}
