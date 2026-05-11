'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PowerOff } from 'lucide-react'
import { mockTradingApi, mockPortfolioApi } from '@/lib/mockApi'
import { useTradingStore } from '@/store'
import { Card, CardHeader, Metric } from '@/components/ui'
import { PnLChart } from '@/components/dashboard/PnLChart'
import { fmtRM, fmtPct, cn } from '@/lib/utils'

export function Dashboard({ onToast }: { onToast: (msg: string) => void }) {
  const qc = useQueryClient()
  const { killSwitchActive, setKillSwitch, setRiskConfig } = useTradingStore()

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => mockPortfolioApi.summary().then(r => r.data),
    refetchInterval: 10_000,
  })

  const { data: pnlHistory } = useQuery({
    queryKey: ['pnl-history'],
    queryFn: () => mockPortfolioApi.pnlHistory(7).then(r => r.data.history),
    staleTime: 60_000,
  })

  const { data: risk } = useQuery({
    queryKey: ['risk'],
    queryFn: () => mockTradingApi.risk().then(r => { setRiskConfig(r.data); return r.data }),
    refetchInterval: 15_000,
  })

  const killMutation = useMutation({
    mutationFn: (active: boolean) => mockTradingApi.killSwitch(active),
    onSuccess: (res) => {
      setKillSwitch(res.data.kill_switch_active)
      qc.invalidateQueries({ queryKey: ['risk'] })
      onToast(res.data.message)
    },
  })

  const todayPnl    = portfolio?.today_pnl    ?? 0
  const todayPnlPct = portfolio?.today_pnl_pct ?? 0

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        <Metric
          label="Portfolio"
          value={<span className="text-slate-100">{portfolio ? fmtRM(portfolio.portfolio_value) : '—'}</span>}
          sub={portfolio ? `${todayPnl >= 0 ? '+' : ''}${fmtRM(todayPnl)} today` : undefined}
          subUp={todayPnl >= 0}
        />
        <Metric
          label="Today P&L"
          value={<span className={todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {portfolio ? `${todayPnl >= 0 ? '+' : ''}${fmtRM(todayPnl)}` : '—'}
          </span>}
          sub={portfolio ? `${fmtPct(todayPnlPct)} ${todayPnlPct >= 0 ? '▲' : '▼'}` : undefined}
          subUp={todayPnlPct >= 0}
        />
        <Metric
          label="Positions"
          value={<span className="text-slate-100">{portfolio?.positions.length ?? '—'}</span>}
          sub={portfolio ? fmtRM(portfolio.invested_value) + ' invested' : undefined}
        />
        <Metric
          label="Open Orders"
          value={<span className="text-amber-400">{portfolio?.open_orders_count ?? '—'}</span>}
          sub={portfolio ? fmtRM(portfolio.cash_balance) + ' cash' : undefined}
        />
      </div>

      <Card>
        <CardHeader title="P&L — 7 days" />
        <PnLChart data={pnlHistory ?? []} />
      </Card>

      {risk && (
        <Card>
          <CardHeader title="Risk Status" />
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Daily loss consumed</span>
              <span className={risk.daily_loss_pct >= 80 ? 'text-red-400' : risk.daily_loss_pct >= 60 ? 'text-amber-400' : 'text-emerald-400'}>
                {risk.daily_loss_pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#243352] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(risk.daily_loss_pct, 100)}%`, background: risk.daily_loss_pct >= 80 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : '#10b981' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>RM 0</span><span>RM {risk.max_daily_loss.toLocaleString()} limit</span>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Live Alerts" />
        {[
          { color: 'bg-emerald-400', text: <><strong className="font-mono text-slate-100">PBBANK</strong> hit RSI target (32.4). Buy order placed: 200 lots @ RM 4.12</>, time: '2 min ago · Moomoo' },
          { color: 'bg-amber-400',   text: <><strong className="font-mono text-slate-100">MAYBANK</strong> approaching stop-loss (RM 8.60). Current: RM 8.63</>, time: '7 min ago · Strategy: MY Swing' },
          { color: 'bg-blue-400',    text: <><strong className="font-mono text-slate-100">KLCI</strong> daily volume breakout detected. 2.3× avg volume threshold</>, time: '22 min ago · Scanner' },
          { color: 'bg-red-400',     text: <><strong className="font-mono text-slate-100">Daily loss limit</strong> 85% consumed. Risk guard active</>, time: '1 hr ago · Risk Engine' },
        ].map((a, i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b border-blue-500/10 last:border-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${a.color}`} />
            <div>
              <div className="text-[12px] text-slate-400 leading-relaxed">{a.text}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{a.time}</div>
            </div>
          </div>
        ))}
      </Card>

      <button
        onClick={() => killMutation.mutate(!killSwitchActive)}
        disabled={killMutation.isPending}
        className={cn(
          'w-full py-4 rounded-[14px] border-[1.5px] font-mono text-[13px] font-bold tracking-[0.08em]',
          'flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]',
          killSwitchActive
            ? 'bg-red-500/20 border-red-500/60 text-red-300'
            : 'bg-red-500/08 border-red-500/30 text-red-400'
        )}
      >
        <PowerOff size={18} />
        {killSwitchActive ? '⚠ ALL BOTS HALTED — TAP TO RESUME' : 'EMERGENCY KILL SWITCH'}
      </button>
    </div>
  )
}
