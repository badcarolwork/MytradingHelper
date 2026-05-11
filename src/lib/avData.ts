/**
 * lib/avData.ts
 *
 * Reads public/data/av-cache.json (fetched once from Alpha Vantage).
 * Simulates realtime price movement on top of the cached data.
 * Falls back to MOCK_PRICES for any symbol not in the cache (e.g. KLSE).
 *
 * SECURITY:
 *  - AV key is only in scripts/fetch-av-data.js (run locally, never deployed)
 *  - This file never calls Alpha Vantage — it only reads the committed JSON
 *  - No secrets in frontend code
 */

import type { PriceData, Candle } from '@/types'
import { MOCK_PRICES } from './mockData'

// ── Types matching av-cache.json structure ────────────────────────────────────
interface AVQuote {
  symbol: string; name: string; market: string
  price: number; open: number; high: number; low: number
  prev_close: number; change: number; change_pct: number; volume: number
}

interface AVBar {
  date: string; open: number; high: number
  low: number; close: number; volume: number
}

interface AVIndicators {
  rsi_14: number | null
  macd: { line: number; signal: number; histogram: number } | null
  bollinger: { upper: number; mid: number; lower: number } | null
  ema_20: number | null; ema_50: number | null
  computed_at: string
}

interface AVCache {
  _meta: { fetched_at: string; symbols: string[]; av_calls: number; note?: string }
  quotes: Record<string, AVQuote>
  daily:  Record<string, AVBar[]>
  indicators: Record<string, AVIndicators>
}

// ── Cache loader (client-side fetch from /data/av-cache.json) ─────────────────
let _cache: AVCache | null = null
let _cachePromise: Promise<AVCache> | null = null

async function loadCache(): Promise<AVCache> {
  if (_cache) return _cache
  if (_cachePromise) return _cachePromise

  _cachePromise = fetch('/MytradingHelper/data/av-cache.json')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data || !data.quotes || Object.keys(data.quotes).length === 0) {
        // Try without basePath (local dev)
        return fetch('/data/av-cache.json').then(r => r.ok ? r.json() : null)
      }
      return data
    })
    .then(data => {
      _cache = data as AVCache
      // Seed running prices from cache
      if (_cache?.quotes) {
        Object.entries(_cache.quotes).forEach(([sym, q]) => {
          if (!_running[sym]) _running[sym] = q.price
        })
      }
      return _cache
    })
    .catch(() => null) as Promise<AVCache>

  return _cachePromise
}

// ── Realtime simulation ───────────────────────────────────────────────────────
// Running prices drift ±3% from the real cached close, mean-reverting
const _running: Record<string, number> = {}

function tick(sym: string, basePrice: number): number {
  if (!_running[sym]) _running[sym] = basePrice
  const drift    = (Math.random() - 0.5) * basePrice * 0.0004   // ±0.04% per tick
  const pullback = (basePrice - _running[sym]) * 0.008           // gentle reversion
  _running[sym]  = Math.max(basePrice * 0.97, Math.min(basePrice * 1.03, _running[sym] + drift + pullback))
  return parseFloat(_running[sym].toFixed(4))
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Get simulated-live price for a symbol.
 * Returns real AV data + simulated tick if available, else mock.
 */
export async function getPrice(symbol: string): Promise<PriceData & { source: 'av' | 'mock' }> {
  const cache = await loadCache()
  const q     = cache?.quotes?.[symbol]

  if (!q) {
    // Not in AV cache — return mock (KLSE stocks etc)
    const m = MOCK_PRICES[symbol]
    if (!m) throw new Error(`Unknown symbol: ${symbol}`)
    return { ...m, source: 'mock' }
  }

  const price      = tick(symbol, q.price)
  const change     = parseFloat((price - q.open).toFixed(4))
  const change_pct = parseFloat(((change / q.open) * 100).toFixed(2))

  return {
    symbol:     q.symbol,
    name:       q.name,
    market:     q.market,
    price,
    open:       q.open,
    change,
    change_pct,
    volume:     q.volume + Math.floor(Math.random() * 80_000),
    avg_volume: q.volume,
    bid:        parseFloat((price - 0.01).toFixed(2)),
    ask:        parseFloat((price + 0.01).toFixed(2)),
    source:     'av',
  }
}

/**
 * Get all US prices at once (batched from cache — zero AV calls).
 */
export async function getAllUSPrices(): Promise<Record<string, PriceData & { source: 'av' | 'mock' }>> {
  const cache = await loadCache()
  if (!cache?.quotes) return {}

  const result: Record<string, PriceData & { source: 'av' | 'mock' }> = {}
  for (const sym of Object.keys(cache.quotes)) {
    result[sym] = await getPrice(sym)
  }
  return result
}

/**
 * Get daily OHLCV bars. Appends a synthetic "today" bar using the running price.
 */
export async function getDailyBars(symbol: string, limit = 30): Promise<Candle[]> {
  const cache = await loadCache()
  const bars  = cache?.daily?.[symbol]

  if (!bars?.length) {
    // Fallback: generate synthetic bars from mock price
    const base = MOCK_PRICES[symbol]?.price ?? 100
    let p = base * 0.95
    return Array.from({ length: limit }, (_, i) => {
      const o = p; const c = o + (Math.random() - 0.45) * o * 0.012; p = c
      return { ts: Date.now() / 1000 - (limit - i) * 86400, open: +o.toFixed(4), high: +(Math.max(o, c) * 1.004).toFixed(4), low: +(Math.min(o, c) * 0.996).toFixed(4), close: +c.toFixed(4), volume: Math.floor(Math.random() * 4_000_000) + 500_000 }
    })
  }

  const slice = bars.slice(-limit)
  const runPrice  = _running[symbol] ?? cache.quotes?.[symbol]?.price ?? slice[slice.length - 1].close
  const lastClose = slice[slice.length - 1].close

  // Synthetic today bar
  const today: Candle = {
    ts:     Date.now() / 1000,
    open:   lastClose,
    high:   parseFloat(Math.max(lastClose, runPrice).toFixed(4)),
    low:    parseFloat(Math.min(lastClose, runPrice).toFixed(4)),
    close:  parseFloat(runPrice.toFixed(4)),
    volume: cache.quotes?.[symbol]?.volume ?? 0,
  }

  return [
    ...slice.map(b => ({
      ts:     new Date(b.date + 'T00:00:00Z').getTime() / 1000,
      open:   b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
    })),
    today,
  ]
}

/**
 * Get precomputed indicators (RSI / MACD / Bollinger / EMA).
 * Computed locally from daily bars when cache was built — no AV calls.
 */
export async function getIndicators(symbol: string): Promise<AVIndicators | null> {
  const cache = await loadCache()
  return cache?.indicators?.[symbol] ?? null
}

/**
 * Get cache metadata — useful for showing data freshness in UI.
 */
export async function getCacheMeta() {
  const cache = await loadCache()
  if (!cache) return { ready: false, symbols: [], note: 'Run: node scripts/fetch-av-data.js' }

  const age = cache._meta.fetched_at
    ? Math.floor((Date.now() - new Date(cache._meta.fetched_at).getTime()) / 60_000)
    : null

  return {
    ready:         Object.keys(cache.quotes).length > 0,
    symbols:       cache._meta.symbols,
    fetched_at:    cache._meta.fetched_at,
    age_minutes:   age,
    av_calls_used: cache._meta.av_calls,
    note:          cache._meta.note ?? '',
  }
}

/** Check if a symbol has real AV data (vs mock-only) */
export async function hasAVData(symbol: string): Promise<boolean> {
  const cache = await loadCache()
  return !!cache?.quotes?.[symbol]
}
