'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { mockAuthApi } from '@/lib/mockApi'
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
    setLoading(true); setError('')
    try {
      const res   = await mockAuthApi.login(email, password)
      const user  = await mockAuthApi.me()
      login(user.data, res.data.access_token, res.data.refresh_token)
    } catch { setError('Invalid email or password') }
    finally  { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
      <div style={{ marginBottom:40, textAlign:'center' }}>
        <div style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.01em', color:'var(--text)', lineHeight:1.1 }}>
          MyTrade<span style={{ color:'var(--accent2)' }}>Helper</span>
        </div>
        <div style={{ fontSize:13, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:6 }}>Auto Trading Monitor</div>
      </div>

      <div className="card" style={{ width:'100%', maxWidth:360, padding:24 }}>
        <form onSubmit={handleLogin}>
          <div className="builder-field">
            <label className="field-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="field-input" />
          </div>
          <div className="builder-field">
            <label className="field-label">Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="field-input" style={{ paddingRight:40 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div style={{ color:'var(--red2)', fontSize:12, fontFamily:'var(--mono)', marginBottom:12 }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading && <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', textAlign:'center', fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
          Demo: {DEMO_EMAIL} · {DEMO_PASSWORD}
        </div>
      </div>
    </div>
  )
}
