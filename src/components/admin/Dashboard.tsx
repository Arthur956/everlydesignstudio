import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../context/ConfigContext'
import { formatEUR } from '../../lib/format'
import type { AdminPage } from './AdminLayout'

interface DashboardProps {
  onNavigate: (page: AdminPage) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { products, clipart } = useConfig()
  const [designCount, setDesignCount] = useState<number | null>(null)
  const [completedCount, setCompletedCount] = useState<number | null>(null)
  const [recentDesigns, setRecentDesigns] = useState<{ id: string; product: string; status: string; created_at: string }[]>([])

  useEffect(() => {
    supabase.from('designs').select('*', { count: 'exact', head: true }).then(({ count }) => setDesignCount(count ?? 0))
    supabase.from('designs').select('*', { count: 'exact', head: true }).eq('status', 'completed').then(({ count }) => setCompletedCount(count ?? 0))
    supabase.from('designs').select('id,product,status,created_at').order('created_at', { ascending: false }).limit(5).then(({ data }) => setRecentDesigns(data ?? []))
  }, [])

  const productCount = Object.keys(products).length
  const hairStyleCount = clipart.hairStyles.length
  const skinColorCount = clipart.skinColors.length
  const hairColorCount = clipart.hairColors.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ margin: '8px 0 0', fontSize: '16px', color: 'var(--color-body)' }}>Overzicht van je Everly Ontwerpstudio.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard label="Producten" value={productCount} color="var(--color-accent)" onClick={() => onNavigate('products')} />
        <StatCard label="Kapsels" value={hairStyleCount} color="var(--color-trust)" onClick={() => onNavigate('clipart')} />
        <StatCard label="Huidskleuren" value={skinColorCount} color="var(--color-trust)" onClick={() => onNavigate('clipart')} />
        <StatCard label="Haarkleuren" value={hairColorCount} color="var(--color-trust)" onClick={() => onNavigate('clipart')} />
        <StatCard label="Ontwerpen (totaal)" value={designCount ?? '…'} color="var(--color-ink)" onClick={() => onNavigate('designs')} />
        <StatCard label="Voltooid" value={completedCount ?? '…'} color="var(--color-trust)" onClick={() => onNavigate('designs')} />
      </div>

      {/* Recent designs */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Recente ontwerpen</h2>
        {recentDesigns.length === 0 ? (
          <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Nog geen ontwerpen.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentDesigns.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--color-line)' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '15px' }}>{d.product}</strong>
                  <span style={{ display: 'block', fontSize: '13px', color: 'var(--color-muted)', fontFamily: 'ui-monospace, monospace' }}>{d.id.slice(0, 8)}…</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: d.status === 'completed' ? 'var(--color-trust)' : 'var(--color-faint)', background: d.status === 'completed' ? 'var(--color-sage)' : 'var(--color-sand)', padding: '4px 10px', borderRadius: '99px' }}>
                  {d.status}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{new Date(d.created_at).toLocaleDateString('nl-BE')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product prices overview */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Productprijzen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(products).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <strong style={{ flex: 1, fontSize: '15px' }}>{p.name}</strong>
              <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{p.maxPeople} personen max</span>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>{formatEUR(p.prices[1] ?? 0)} – {formatEUR(p.prices[p.maxPeople] ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, onClick }: { label: string; value: number | string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', cursor: 'pointer',
    }}>
      <span style={{ fontSize: '40px', fontFamily: 'var(--font-display)', fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-body)' }}>{label}</span>
    </button>
  )
}
