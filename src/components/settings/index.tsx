'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Bell, Cpu, Lock } from 'lucide-react'
import { tradingApi, portfolioApi } from '@/lib/api'
import { useAuthStore, useTradingStore } from '@/store'
import { Card, CardHeader, Toggle, SectionLabel, Badge, Spinner } from '@/components/ui'

function ToggleRow({ title, sub, checked, onChange }: {
  title: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-blue-500/10 last:border-0">
      <div className="flex-1 pr-4">
        <div className="text-[13px] font-medium text-slate-200">{title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export function Settings({ onToast }: { onToast: (msg: string) => void }) {
  const { user, logout } = useAuthStore()
  const { riskConfig, setRiskConfig } = useTradingStore()
  const qc = useQueryClient()

  useQuery({
    queryKey: ['risk'],
    queryFn: () => tradingApi.risk().then(r => { setRiskConfig(r.data); return r.data }),
  })

  const { data: brokersData, isLoading: brokersLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => portfolioApi.brokers().then(r => r.data),
  })

  const connectMutation = useMutation({
    mutationFn: ({ broker, connect }: { broker: string; connect: boolean }) =>
      connect
        ? portfolioApi.connectBroker(broker, 'mock_key', 'mock_secret')
        : portfolioApi.disconnectBroker(broker),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['brokers'] })
      onToast(vars.connect ? `✓ ${vars.broker} connected` : `${vars.broker} disconnected`)
    },
  })

  const riskMutation = useMutation({
    mutationFn: (config: { max_daily_loss?: number; max_position_size?: number }) =>
      tradingApi.updateRisk(config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk'] })
      onToast('✓ Risk config updated')
    },
  })

  return (
    <div className="flex flex-col gap-3.5">

      {/* Account */}
      <Card>
        <CardHeader title="Account" />
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-[14px]">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-slate-100">{user?.email}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              2FA {user?.totp_enabled ? '✓ enabled' : '— disabled'}
            </div>
          </div>
        </div>
      </Card>

      {/* Risk controls */}
      <SectionLabel>Risk Controls</SectionLabel>
      <Card>
        <ToggleRow
          title="Auto Trading"
          sub="Allow strategies to execute real orders"
          checked
          onChange={v => onToast(v ? 'Auto trading ON' : 'Auto trading PAUSED')}
        />
        <ToggleRow
          title="Paper Mode"
          sub="Simulate trades without real execution"
          checked={false}
          onChange={v => onToast(v ? 'Paper mode ON' : 'Paper mode OFF')}
        />
        <ToggleRow
          title="Telegram Alerts"
          sub="Push signals to your Telegram bot"
          checked
          onChange={v => onToast(v ? 'Telegram alerts ON' : 'Telegram alerts OFF')}
        />
        <ToggleRow
          title="Max Daily Loss Guard"
          sub={`Pause all bots if loss exceeds RM ${riskConfig?.max_daily_loss?.toLocaleString() ?? 2000}`}
          checked
          onChange={() => {}}
        />

        {riskConfig && (
          <div className="pt-3 pb-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>Daily loss consumed</span>
              <span className={riskConfig.daily_loss_pct >= 80 ? 'text-red-400' : 'text-slate-300'}>
                {riskConfig.daily_loss_pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#243352] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(riskConfig.daily_loss_pct, 100)}%`,
                  background: 'linear-gradient(90deg,#10b981,#f59e0b,#ef4444)',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>RM 0</span>
              <span>RM {riskConfig.max_daily_loss.toLocaleString()} limit</span>
            </div>
          </div>
        )}
      </Card>

      {/* Broker connections */}
      <SectionLabel>Broker Connections</SectionLabel>
      <Card>
        {brokersLoading && <div className="flex justify-center py-3"><Spinner /></div>}
        {brokersData?.brokers.map(b => (
          <div key={b.broker} className="flex items-center justify-between py-3 border-b border-blue-500/10 last:border-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1e2d45] flex items-center justify-center text-[10px] font-bold text-slate-300">
                {b.broker.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-100">{b.label}</div>
                <div className="text-[11px] text-slate-500">{b.market}</div>
              </div>
            </div>
            <button
              onClick={() => connectMutation.mutate({ broker: b.broker, connect: b.status !== 'connected' })}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg font-semibold border ${
                b.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
              }`}
            >
              {b.status === 'connected' ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </Card>

      {/* Security */}
      <SectionLabel>Security</SectionLabel>
      <Card>
        <ToggleRow title="Biometric Lock" sub="Require FaceID / fingerprint on open" checked onChange={() => {}} />
        <ToggleRow title="2FA (TOTP)" sub="Google Authenticator / Authy" checked={!!user?.totp_enabled} onChange={() => onToast('2FA setup coming soon')} />
        <ToggleRow title="API Key Encryption" sub="Broker keys AES-256 encrypted at rest" checked onChange={() => {}} />
      </Card>

      {/* Logout */}
      <button
        onClick={() => { logout(); onToast('Logged out') }}
        className="w-full py-3.5 rounded-[14px] border border-red-500/20 text-red-400 text-[13px] font-semibold"
      >
        Log Out
      </button>

      <div className="text-center pb-2">
        <div className="text-[11px] text-slate-500 font-mono">TradePilot v1.0.0 · Build 2025.05</div>
        <div className="text-[10px] text-slate-600 mt-1">Broker credentials are AES-256 encrypted at rest.</div>
      </div>

    </div>
  )
}
