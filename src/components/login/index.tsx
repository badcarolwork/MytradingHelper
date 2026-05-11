'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { mockAuthApi } from '@/lib/mockApi'
import { cn } from '@/lib/utils'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/mockData'

export function Login() {
  const login = useAuthStore(s => s.login)
  const [email, setEmail]       = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await mockAuthApi.login(email, password)
      const tokens = res.data
      const user = await mockAuthApi.me()
      login(user.data, tokens.access_token, tokens.refresh_token)
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0f1e] flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <div className="text-[32px] font-bold tracking-tight text-white mb-1">
          MyTrade<span className="text-blue-400">Helper</span>
        </div>
        <div className="text-[13px] text-slate-400 font-mono">Auto Trading Monitor</div>
      </div>

      <div className="w-full max-w-[360px] bg-[#111827] border border-blue-500/10 rounded-2xl p-6">
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

        <div className="mt-4 pt-4 border-t border-blue-500/10 text-center text-[11px] text-slate-500 font-mono">
          Demo: {DEMO_EMAIL} · {DEMO_PASSWORD}
        </div>
      </div>
    </div>
  )
}
