'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockTradingApi } from '@/lib/mockApi'
import { Card, CardHeader, Spinner } from '@/components/ui'
import type { Order } from '@/types'

function OrderRow({ o, onCancel }: { o: Order; onCancel?: () => void }) {
  const up = (o.avg_fill_price ?? o.price) >= o.price
  const statusCls = o.status === 'FILLED' ? 'status-filled' : o.status === 'OPEN' ? 'status-open' : 'status-partial'
  return (
    <div className="order-row">
      <div className={`order-side ${o.side === 'BUY' ? 'side-buy' : 'side-sell'}`}>{o.side}</div>
      <div className="order-sym">{o.symbol}</div>
      <div className="order-detail">{o.quantity} @ {o.price.toFixed(2)}</div>
      <div style={{ textAlign: 'right' }}>
        <span className={`order-status ${statusCls}`}>{o.status}</span>
      </div>
      {o.status === 'OPEN' && onCancel && (
        <button onClick={onCancel} style={{ marginLeft: 8, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
      )}
    </div>
  )
}

export function Orders({ onToast }: { onToast: (m: string) => void }) {
  const qc = useQueryClient()
  const { data: allOrders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => mockTradingApi.orders().then(r => r.data), refetchInterval: 8_000 })
  const { data: positions } = useQuery({ queryKey: ['positions'], queryFn: () => mockTradingApi.positions().then(r => r.data), refetchInterval: 10_000 })

  const cancelMutation = useMutation({
    mutationFn: () => mockTradingApi.cancelOrder(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); onToast('Order cancelled') },
  })

  const open    = allOrders?.orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIAL') ?? []
  const history = allOrders?.orders.filter(o => o.status === 'FILLED' || o.status === 'CANCELLED') ?? []

  return (
    <>
      <Card>
        <CardHeader title="Open Positions" />
        {isLoading && <div style={{ display:'flex', justifyContent:'center', padding: 16 }}><Spinner /></div>}
        {positions?.positions.map(p => (
          <div key={p.symbol} className="wl-item">
            <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
              <div className="wl-icon">{p.symbol.slice(0,3)}</div>
              <div>
                <div className="wl-ticker">{p.symbol}</div>
                <div className="wl-name">{p.quantity.toLocaleString()} lots · avg {p.avg_cost.toFixed(2)}</div>
              </div>
            </div>
            <div className="wl-right">
              <div className="wl-price">RM {p.market_value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
              <div className={`wl-chg ${p.unrealised_pnl >= 0 ? 'up' : 'dn'}`}>{p.unrealised_pnl >= 0 ? '+' : ''}RM {Math.abs(p.unrealised_pnl).toFixed(2)}</div>
            </div>
          </div>
        ))}
        {positions && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display:'flex', justifyContent:'space-between', fontSize: 11, fontFamily:'var(--mono)', color:'var(--text2)' }}>
            <span>Total invested</span>
            <span>RM {positions.summary.total_market_value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={`Open Orders (${open.length})`} />
        {open.length === 0 ? <div style={{ padding: '12px 0', textAlign:'center', color:'var(--text3)', fontSize:12 }}>No open orders</div>
          : open.map(o => <OrderRow key={o.order_id} o={o} onCancel={() => cancelMutation.mutate()} />)}
      </Card>

      <Card>
        <CardHeader title="Order History" action={<button className="card-action" onClick={() => onToast('Export coming soon')}>Export CSV</button>} />
        {history.length === 0 ? <div style={{ padding: '12px 0', textAlign:'center', color:'var(--text3)', fontSize:12 }}>No history yet</div>
          : history.slice(0,20).map(o => <OrderRow key={o.order_id} o={o} />)}
      </Card>
    </>
  )
}
