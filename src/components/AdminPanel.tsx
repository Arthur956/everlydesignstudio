import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminLogin from './admin/AdminLogin'
import AdminLayout, { type AdminPage } from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import ProductManager from './admin/ProductManager'
import ClipartManager from './admin/ClipartManager'
import DesignsViewer from './admin/DesignsViewer'

export default function AdminPanel() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<AdminPage>('dashboard')

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '16px', color: 'var(--color-muted)' }}>Laden…</span></div>
  }

  if (!user) {
    return <AdminLogin />
  }

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'products' && <ProductManager />}
      {page === 'clipart' && <ClipartManager />}
      {page === 'designs' && <DesignsViewer />}
    </AdminLayout>
  )
}
