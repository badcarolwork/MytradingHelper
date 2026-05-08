'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMarketStore } from '@/store/market'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/api/v1/market/ws/prices'

export function usePriceFeed() {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setPrices = useMarketStore(s => s.setPrices)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null
    const url = token ? `${WS_URL}?token=${token}` : WS_URL

    const socket = new WebSocket(url)
    ws.current = socket

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'snapshot' || msg.type === 'price_update') {
          setPrices(msg.data)
        }
      } catch {}
    }

    socket.onclose = () => {
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    socket.onerror = () => socket.close()

    // Keep-alive ping every 25s
    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'ping' }))
      }
    }, 25_000)

    socket.addEventListener('close', () => clearInterval(ping))
  }, [setPrices])

  useEffect(() => {
    connect()
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])
}
