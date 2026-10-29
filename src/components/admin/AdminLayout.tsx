import { useState, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

export type AdminPage = 'dashboard' | 'products' | 'clipart' | 'designs'

interface AdminLayoutProps {
  page: AdminPage
  onNavigate: (page: AdminPage) => void
  children: ReactNode
}

const navItems: { id: AdminPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'products', label: 'Producten', icon: '▦' },
  { id: 'clipart', label: 'Clipart', icon: '✎' },
  { id: 'designs', label: 'Ontwerpen', icon: '♡' },
]

export default function AdminLayout({ page, onNavigate, children }: AdminLayoutProps) {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '240px' : '72px',
          flexShrink: 0,
          background: 'var(--color-ink)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .2s',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 0, background: 'rgba(255,255,255,.1)', color: '#fff', fontSize: '18px', flexShrink: 0 }}>
            ☰
          </button>
          {sidebarOpen && <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-brand)' }}>Everly</span>}
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = page === item.id
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} style={{
                height: '48px', borderRadius: '12px', border: 0,
                background: active ? 'var(--color-accent)' : 'transparent',
                color: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0 14px', fontWeight: 600, fontSize: '15px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <button onClick={() => signOut()} style={{
            width: '100%', height: '44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,.15)',
            background: 'transparent', color: '#fff', fontWeight: 600, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '10px', justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: '0 14px',
          }}>
            <span>←</span>
            {sidebarOpen && <span>Uitloggen</span>}
          </button>
          {sidebarOpen && user && (
            <span style={{ display: 'block', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,.5)', padding: '0 14px' }}>{user.email}</span>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  )
}
