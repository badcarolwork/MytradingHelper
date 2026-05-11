'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PowerOff } from 'lucide-react'
import { mockTradingApi, mockPortfolioApi } from '@/lib/mockApi'
import { useTradingStore } from '@/store'
import { Card, CardHeader, Metric } from '@/components/ui'
import { PnLChart } from '@/components/dashboard/PnLChart'

export function Dashboard({ onToast }: { onToast: (m: string) => void }) {
  const qc = useQueryClient()
  const { killSwitchActive, setKillSwitch, setRiskConfig } = useTradingStore()

  const { data: portfolio } = useQuery({ queryKey: ['portfolio'], queryFn: () => mockPortfolioApi.summary().then(r => r.data), refetchInterval: 10_000 })
  const { data: pnlHistory } = useQuery({ queryKey: ['pnl-history'], queryFn: () => mockPortfolioApi.pnlHistory(7).then(r => r.data.history), staleTime: 60_000 })
  const { data: risk } = useQuery({ queryKey: ['risk'], queryFn: () => mockTradingApi.risk().then(r => { setRiskConfig(r.data); return r.data }), refetchInterval: 15_000 })

  const killMutation = useMutation({
    mutationFn: (active: boolean) => mockTradingApi.killSwitch(active),
    onSuccess: (res) => { setKillSwitch(res.data.kill_switch_active); qc.invalidateQueries({ queryKey: ['risk'] }); onToast(res.data.message) },
  })

  const pnl    = portfolio?.today_pnl    ?? 0
  const pnlPct = portfolio?.today_pnl_pct ?? 0
  const fmtRM  = (n: number) => `RM ${Math.abs(n).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`

  return (
    <>
      <div className="metric-row">
        <Metric label="Portfolio"  value={<span>{portfolio ? fmtRM(portfolio.portfolio_value) : '—'}</span>} sub={portfolio ? `${pnl >= 0 ? '+' : ''}${fmtRM(pnl)} today` : undefined} subUp={pnl >= 0} />
        <Metric label="Today P&L"  value={<span className={pnl >= 0 ? 'up' : 'dn'}>{portfolio ? `${pnl >= 0 ? '+' : ''}${fmtRM(pnl)}` : '—'}</span>} sub={portfolio ? `${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% ${pnl >= 0 ? '▲' : '▼'}` : undefined} subUp={pnlPct >= 0} />
        <Metric label="Positions"  value={<span>{portfolio?.positions.length ?? '—'}</span>} sub={portfolio ? fmtRM(portfolio.invested_value) + ' invested' : undefined} />
        <Metric label="Open Orders" value={<span className="warn">{portfolio?.open_orders_count ?? '—'}</span>} sub={portfolio ? fmtRM(portfolio.cash_balance) + ' cash' : undefined} />
      </div>

      <Card>
        <CardHeader title="P&L — 7 days" />
        <PnLChart data={pnlHistory ?? []} />
      </Card>

      {risk && (
        <Card>
          <CardHeader title="Risk Status" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--mono)', marginBottom: 4 }}>
            <span style={{ color: 'var(--text2)' }}>Daily loss consumed</span>
            <span className={risk.daily_loss_pct >= 80 ? 'dn' : risk.daily_loss_pct >= 60 ? 'warn' : 'up'}>{risk.daily_loss_pct.toFixed(1)}%</span>
          </div>
          <div className="risk-bar">
            <div className="risk-fill" style={{ width: `${Math.min(risk.daily_loss_pct, 100)}%`, background: 'linear-gradient(90deg,var(--green),var(--amber),var(--red))' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4 }}>
            <span>RM 0</span><span>RM {risk.max_daily_loss.toLocaleString()} limit</span>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Live Alerts" action={<button className="card-action" onClick={() => onToast('Alerts cleared')}>Clear all</button>} />
        {[
          { cls: 'green', text: <><strong>PBBANK</strong> hit RSI target (32.4). Buy order placed: 200 lots @ RM 4.12</>, time: '2 min ago · Moomoo' },
          { cls: 'amber', text: <><strong>MAYBANK</strong> approaching stop-loss (RM 8.60). Current: RM 8.63</>,           time: '7 min ago · Strategy: MY Swing' },
          { cls: 'blue',  text: <><strong>KLCI</strong> daily volume breakout detected. 2.3× avg volume threshold</>,      time: '22 min ago · Scanner' },
          { cls: 'red',   text: <><strong>Daily loss limit</strong> 85% consumed. Risk guard active</>,                   time: '1 hr ago · Risk Engine' },
        ].map((a, i) => (
          <div key={i} className="alert-item">
            <div className={`alert-dot ${a.cls}`} />
            <div><div className="alert-text">{a.text}</div><div className="alert-time">{a.time}</div></div>
          </div>
        ))}
      </Card>

      <button className={`kill-btn${killSwitchActive ? ' active' : ''}`} onClick={() => killMutation.mutate(!killSwitchActive)}>
        <PowerOff size={18} />
        {killSwitchActive ? '⚠ ALL BOTS HALTED — TAP TO RESUME' : 'EMERGENCY KILL SWITCH'}
      </button>
    </>
  )
}
