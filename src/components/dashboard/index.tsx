'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PowerOff, AlertTriangle } from 'lucide-react'
import { tradingApi, portfolioApi } from '@/lib/api'
import { useTradingStore } from '@/store'
import { Card, CardHeader, Metric } from '@/components/ui'
import { PnLChart } from '@/components/dashboard/PnLChart'
import { fmtRM, fmtPct, cn } from '@/lib/utils'
import type { PnLRecord } from '@/types'

export function Dashboard({ onToast }: { onToast: (msg: string) => void }) {
  const qc = useQueryClient()
  const { killSwitchActive, setKillSwitch, setRiskConfig } = useTradingStore()

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => portfolioApi.summary().then(r => r.data),
    refetchInterval: 10_000,
  })

  const { data: pnlHistory } = useQuery({
    queryKey: ['pnl-history'],
    queryFn: () => portfolioApi.pnlHistory(7).then(r => r.data.history),
    staleTime: 60_000,
  })

  const { data: risk } = useQuery({
    queryKey: ['risk'],
    queryFn: () => tradingApi.risk().then(r => {
      setRiskConfig(r.data)
      return r.data
    }),
    refetchInterval: 15_000,
  })

  const killMutation = useMutation({
    mutationFn: (active: boolean) => tradingApi.killSwitch(active),
    onSuccess: (res) => {
      const active = res.data.kill_switch_active
      setKillSwitch(active)
      qc.invalidateQueries({ queryKey: ['risk'] })
      onToast(active ? '⚠ Kill switch activated — all trading halted' : '✓ Trading resumed')
    },
  })

  const todayPnl = portfolio?.today_pnl ?? 0
  const todayPnlPct = portfolio?.today_pnl_pct ?? 0

  return (
    <div className="flex flex-col gap-3.5">

      {/* Metrics */}
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

      {/* P&L Chart */}
      <Card>
        <CardHeader title="P&L — 7 days" />
        <PnLChart data={(pnlHistory as PnLRecord[] | undefined) ?? []} />
      </Card>

      {/* Risk gauge */}
      {risk && (
        <Card>
          <CardHeader title="Risk Status" />
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Daily loss consumed</span>
              <span className={risk.daily_loss_pct >= 80 ? 'text-red-400' : risk.daily_loss_pct >= 60 ? 'text-amber-400' : 'text-emerald-400'}>
                {risk.daily_loss_pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#243352] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(risk.daily_loss_pct, 100)}%`,
                  background: risk.daily_loss_pct >= 80
                    ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                    : risk.daily_loss_pct >= 50
                      ? 'linear-gradient(90deg,#10b981,#f59e0b)'
                      : '#10b981',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>RM 0</span>
              <span>RM {risk.max_daily_loss.toLocaleString()} limit</span>
            </div>
          </div>
        </Card>
      )}

      {/* Kill switch */}
      <button
        onClick={() => killMutation.mutate(!killSwitchActive)}
        disabled={killMutation.isPending}
        className={cn(
          'w-full py-4 rounded-[14px] border-[1.5px] font-mono text-[13px] font-bold tracking-[0.08em]',
          'flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]',
          killSwitchActive
            ? 'bg-red-500/20 border-red-500/60 text-red-300'
            : 'bg-red-500/08 border-red-500/30 text-red-400 hover:bg-red-500/12'
        )}
      >
        <PowerOff size={18} />
        {killSwitchActive ? '⚠ ALL BOTS HALTED — TAP TO RESUME' : 'EMERGENCY KILL SWITCH'}
      </button>

    </div>
  )
}
