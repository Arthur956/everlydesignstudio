import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AdminPanel from './components/AdminPanel'
import { AuthProvider } from './context/AuthContext'
import { ConfigProvider } from './context/ConfigContext'

function getRoute(): 'customizer' | 'admin' {
  const path = window.location.pathname
  if (path.startsWith('/admin') || path.startsWith('/customize/admin') || path === '/admin' || path === '/admin/') {
    return 'admin'
  }
  return 'customizer'
}

function Root() {
  const route = getRoute()

  return (
    <AuthProvider>
      <ConfigProvider>
        {route === 'admin' ? <AdminPanel /> : <App />}
      </ConfigProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
