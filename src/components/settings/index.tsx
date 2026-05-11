'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockTradingApi, mockPortfolioApi } from '@/lib/mockApi'
import { useAuthStore, useTradingStore } from '@/store'
import { Card, CardHeader, Toggle, SectionLabel, Spinner } from '@/components/ui'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function sessionTimeLeft(loginAt: number | null): string {
  if (!loginAt) return '—'
  const remaining = loginAt + SESSION_TTL_MS - Date.now()
  if (remaining <= 0) return 'Expired'
  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

function ToggleRow({ title, sub, checked, onChange }: {
  title: string; sub: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <div className="toggle-info-title">{title}</div>
        <div className="toggle-info-sub">{sub}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export function Settings({ onToast }: { onToast: (m: string) => void }) {
  const { user, logout, loginAt } = useAuthStore()
  const { riskConfig, setRiskConfig } = useTradingStore()
  const qc = useQueryClient()

  // ── Risk toggles — each has own state ─────────────────────
  const [autoTrade,    setAutoTrade]    = useState(true)
  const [paper,        setPaper]        = useState(false)
  const [telegram,     setTelegram]     = useState(true)
  const [maxLossGuard, setMaxLossGuard] = useState(true)

  // ── Security toggles ───────────────────────────────────────
  const [biometric,   setBiometric]   = useState(true)
  const [twoFa,       setTwoFa]       = useState(false)
  const [encryption,  setEncryption]  = useState(true)

  useQuery({
    queryKey: ['risk'],
    queryFn: () => mockTradingApi.risk().then(r => { setRiskConfig(r.data); return r.data }),
  })

  const { data: brokersData, isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => mockPortfolioApi.brokers().then(r => r.data),
  })

  const connectMutation = useMutation({
    mutationFn: ({ broker, connect }: { broker: string; connect: boolean }) =>
      connect
        ? mockPortfolioApi.connectBroker(broker)
        : mockPortfolioApi.disconnectBroker(broker),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['brokers'] })
      onToast(v.connect ? `✓ ${v.broker} connected` : `${v.broker} disconnected`)
    },
  })

  const maxLoss = riskConfig?.max_daily_loss?.toLocaleString() ?? '2,000'

  return (
    <>
      {/* ── Account ─────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Account" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
          <div className="wl-icon" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0, background: 'rgba(59,130,246,0.15)', color: 'var(--accent2)' }}>
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              2FA {user?.totp_enabled ? '✓ enabled' : '— disabled'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Session</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Auto-expires after 24 hours</div>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--green2)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: 6 }}>
            {sessionTimeLeft(loginAt)}
          </div>
        </div>
      </Card>

      {/* ── Risk Controls ────────────────────────────────────── */}
      <SectionLabel>Risk Controls</SectionLabel>
      <Card>
        <ToggleRow
          title="Auto Trading"
          sub="Allow strategies to execute real orders"
          checked={autoTrade}
          onChange={v => { setAutoTrade(v); onToast(v ? 'Auto trading ON' : 'Auto trading PAUSED') }}
        />
        <ToggleRow
          title="Paper Mode"
          sub="Simulate trades without real execution"
          checked={paper}
          onChange={v => { setPaper(v); onToast(v ? 'Paper mode ON' : 'Paper mode OFF') }}
        />
        <ToggleRow
          title="Telegram Alerts"
          sub="Push signals to your Telegram bot"
          checked={telegram}
          onChange={v => { setTelegram(v); onToast(v ? 'Telegram alerts ON' : 'Telegram alerts OFF') }}
        />
        <ToggleRow
          title="Max Daily Loss"
          sub={`Pause all bots if loss exceeds RM ${maxLoss}`}
          checked={maxLossGuard}
          onChange={v => { setMaxLossGuard(v); onToast(v ? 'Loss guard ON' : 'Loss guard OFF') }}
        />
        {riskConfig && (
          <div style={{ padding: '12px 0 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--mono)', marginBottom: 6, color: 'var(--text2)' }}>
              <span>Daily loss consumed</span>
              <span className={riskConfig.daily_loss_pct >= 80 ? 'dn' : 'warn'}>
                {riskConfig.daily_loss_pct.toFixed(1)}%
              </span>
            </div>
            <div className="risk-bar">
              <div className="risk-fill" style={{ width: `${Math.min(riskConfig.daily_loss_pct, 100)}%`, background: 'linear-gradient(90deg,var(--green),var(--amber),var(--red))' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4 }}>
              <span>RM 0</span>
              <span>RM {riskConfig.max_daily_loss.toLocaleString()} limit</span>
            </div>
          </div>
        )}
      </Card>

      {/* ── Broker Connections ───────────────────────────────── */}
      <SectionLabel>Broker Connections</SectionLabel>
      <Card>
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><Spinner /></div>}
        {brokersData?.brokers.map(b => (
          <div key={b.broker} className="broker-item">
            <div className="broker-left">
              <div className="broker-logo">{b.broker.slice(0, 2).toUpperCase()}</div>
              <div>
                <div className="broker-name">{b.label}</div>
                <div className="broker-sub">{b.market}</div>
              </div>
            </div>
            <button
              className={`connect-btn ${b.status === 'connected' ? 'cb-connected' : 'cb-disconnected'}`}
              onClick={() => connectMutation.mutate({ broker: b.broker, connect: b.status !== 'connected' })}
            >
              {b.status === 'connected' ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </Card>

      {/* ── Security ─────────────────────────────────────────── */}
      <SectionLabel>Security</SectionLabel>
      <Card>
        <ToggleRow
          title="Biometric Lock"
          sub="Require FaceID / fingerprint on open"
          checked={biometric}
          onChange={v => { setBiometric(v); onToast(v ? 'Biometric lock ON' : 'Biometric lock OFF') }}
        />
        <ToggleRow
          title="2FA (TOTP)"
          sub="Google Authenticator / Authy"
          checked={twoFa}
          onChange={v => { setTwoFa(v); onToast(v ? '2FA enabled' : '2FA disabled — not recommended') }}
        />
        <ToggleRow
          title="API Key Encryption"
          sub="Broker keys AES-256 encrypted at rest"
          checked={encryption}
          onChange={v => { setEncryption(v); onToast(v ? 'Encryption ON' : 'Encryption ON (cannot disable)'); setEncryption(true) }}
        />
      </Card>

      {/* ── Logout ───────────────────────────────────────────── */}
      <button
        className="kill-btn"
        style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', fontSize: 13 }}
        onClick={() => { logout(); onToast('Logged out') }}
      >
        Log Out
      </button>

      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          MyTradeHelper v1.0.0 · Build 2025.05
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
          Session expires 24h after login. Keys AES-256 encrypted.
        </div>
      </div>
    </>
  )
}
