'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi, setToken } from '@/lib/api'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'

export function Login() {
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('demo@mytradehelper.my')
  const [password, setPassword] = useState('Demo1234!')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totp, setTotp] = useState('')
  const [tempToken, setTempToken] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(email, password)
      const data = res.data
      if ('require_2fa' in data && data.require_2fa) {
        setTempToken(data.temp_token)
      } else {
        const tokens = data as { access_token: string; refresh_token: string; user_id: string; email: string }
        setToken(tokens.access_token)
        const user = await authApi.me()
        login(user.data, tokens.access_token, tokens.refresh_token)
      }
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.verify2fa(tempToken, totp)
      const tokens = res.data
      const user = await authApi.me()
      login(user.data, tokens.access_token, tokens.refresh_token)
    } catch {
      setError('Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0f1e] flex flex-col items-center justify-center px-6 py-10">
      {/* Brand */}
      <div className="mb-10 text-center">
        <div className="text-[32px] font-bold tracking-tight text-white mb-1">
          Trade<span className="text-blue-400">Pilot</span>
        </div>
        <div className="text-[13px] text-slate-400 font-mono">Auto Trading Monitor</div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[360px] bg-[#111827] border border-blue-500/10 rounded-2xl p-6">
        {!tempToken ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a2235] border border-blue-500/15 rounded-xl px-4 py-3 text-[14px] font-mono text-slate-100 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#1a2235] border border-blue-500/15 rounded-xl px-4 py-3 pr-11 text-[14px] font-mono text-slate-100 outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-[12px] text-red-400 font-mono">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-[15px] font-semibold text-slate-100 mb-1">Two-Factor Auth</div>
              <div className="text-[12px] text-slate-400">Enter your 6-digit authenticator code</div>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totp}
              onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-[#1a2235] border border-blue-500/15 rounded-xl px-4 py-3 text-[20px] font-mono text-center text-slate-100 outline-none focus:border-blue-500 tracking-[0.4em]"
            />
            {error && <p className="text-[12px] text-red-400 font-mono text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || totp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Verify
            </button>
          </form>
        )}

        {/* Demo hint */}
        <div className="mt-4 pt-4 border-t border-blue-500/10 text-center text-[11px] text-slate-500 font-mono">
          Demo: demo@mytradehelper.my · Demo1234!
        </div>
      </div>
    </div>
  )
}
