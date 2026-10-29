import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', borderRadius: '24px', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 50px -20px rgba(42,28,20,.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--color-brand)' }}>Everly</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)' }}>Admin Panel</span>
        </div>

        <div style={{ display: 'flex', gap: '0', borderRadius: '99px', background: 'var(--color-sand)', padding: '4px' }}>
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, height: '40px', borderRadius: '99px', border: 0,
              background: mode === m ? '#fff' : 'transparent',
              fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)',
              boxShadow: mode === m ? '0 2px 8px -2px rgba(42,28,20,.15)' : 'none',
            }}>
              {m === 'login' ? 'Inloggen' : 'Account maken'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>E-mailadres</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@everly.be" style={{
              height: '50px', borderRadius: '12px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 14px', fontWeight: 500, fontSize: '16px', color: 'var(--color-ink)',
            }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Wachtwoord</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minstens 6 tekens" style={{
              height: '50px', borderRadius: '12px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 14px', fontWeight: 500, fontSize: '16px', color: 'var(--color-ink)',
            }} />
          </label>

          {error && (
            <div style={{ fontSize: '14px', color: 'var(--color-accent-hover)', background: 'var(--color-peach)', borderRadius: '12px', padding: '10px 12px' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            height: '52px', borderRadius: '99px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: '16px',
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Bezig…' : mode === 'login' ? 'Inloggen →' : 'Account maken →'}
          </button>
        </form>
      </div>
    </div>
  )
}
