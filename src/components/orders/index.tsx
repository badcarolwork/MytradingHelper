'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { mockTradingApi as tradingApi } from '@/lib/mockApi'
import { Card, CardHeader, Badge, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

function OrderRow({ order, onCancel }: { order: Order; onCancel?: () => void }) {
  const pnlUp = order.avg_fill_price
    ? order.side === 'BUY'
      ? order.avg_fill_price <= order.price
      : order.avg_fill_price >= order.price
    : true

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-blue-500/10 last:border-0">
      <div className={cn(
        'w-8 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono tracking-wide flex-shrink-0',
        order.side === 'BUY'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-red-500/12 text-red-400'
      )}>
        {order.side}
      </div>
      <div className="font-semibold font-mono text-[13px] text-slate-100 w-[52px] flex-shrink-0">
        {order.symbol}
      </div>
      <div className="text-[11px] text-slate-400 font-mono flex-1 min-w-0 truncate">
        {order.quantity} @ {order.price.toFixed(2)}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Badge variant={order.status.toLowerCase() as 'filled' | 'open' | 'partial'}>
          {order.status}
        </Badge>
        {order.status === 'OPEN' && onCancel && (
          <button onClick={onCancel} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function Orders({ onToast }: { onToast: (msg: string) => void }) {
  const qc = useQueryClient()

  const { data: allOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => tradingApi.orders().then(r => r.data),
    refetchInterval: 8_000,
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => tradingApi.cancelOrder(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      onToast('Order cancelled')
    },
    onError: () => onToast('Cancel failed'),
  })

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => tradingApi.positions().then(r => r.data),
    refetchInterval: 10_000,
  })

  const openOrders = allOrders?.orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIAL') ?? []
  const history   = allOrders?.orders.filter(o => o.status === 'FILLED' || o.status === 'CANCELLED') ?? []

  return (
    <div className="flex flex-col gap-3.5">

      {/* Positions */}
      <Card>
        <CardHeader title="Open Positions" />
        {isLoading && <div className="flex justify-center py-4"><Spinner /></div>}
        {positions?.positions.length === 0 && (
          <div className="py-3 text-center text-[12px] text-slate-500">No open positions</div>
        )}
        {positions?.positions.map(p => (
          <div key={p.symbol} className="flex items-center justify-between py-2.5 border-b border-blue-500/10 last:border-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[11px] font-bold font-mono text-blue-400">
                {p.symbol.slice(0, 3)}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-100">{p.symbol}</div>
                <div className="text-[11px] text-slate-500 font-mono">{p.quantity.toLocaleString()} lots</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-mono font-semibold text-slate-100">
                RM {p.market_value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </div>
              <div className={cn('text-[11px] font-mono', p.unrealised_pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {p.unrealised_pnl >= 0 ? '+' : ''}RM {Math.abs(p.unrealised_pnl).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
        {positions && (
          <div className="mt-2 pt-2 border-t border-blue-500/10 flex justify-between text-[11px] font-mono text-slate-400">
            <span>Total invested</span>
            <span>RM {positions.summary.total_market_value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </Card>

      {/* Open orders */}
      <Card>
        <CardHeader title={`Open Orders (${openOrders.length})`} />
        {openOrders.length === 0 ? (
          <div className="py-3 text-center text-[12px] text-slate-500">No open orders</div>
        ) : (
          openOrders.map(o => (
            <OrderRow
              key={o.order_id}
              order={o}
              onCancel={() => cancelMutation.mutate(o.order_id)}
            />
          ))
        )}
      </Card>

      {/* History */}
      <Card>
        <CardHeader
          title="Order History"
          action={
            <button onClick={() => onToast('Export coming soon')}
              className="text-[11px] text-blue-400 font-mono px-2.5 py-1 border border-blue-400/25 rounded-md">
              Export CSV
            </button>
          }
        />
        {history.length === 0 ? (
          <div className="py-3 text-center text-[12px] text-slate-500">No history yet</div>
        ) : (
          history.slice(0, 20).map(o => <OrderRow key={o.order_id} order={o} />)
        )}
      </Card>

    </div>
  )
}
