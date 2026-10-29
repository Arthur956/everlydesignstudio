import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface DesignListRow {
  id: string
  product: string
  design: Record<string, unknown>
  status: string
  created_at: string
  updated_at: string
}

export default function DesignsViewer() {
  const [designs, setDesigns] = useState<DesignListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'completed'>('all')

  useEffect(() => {
    let q = supabase.from('designs').select('*').order('created_at', { ascending: false }).limit(50)
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setDesigns(data ?? [] as DesignListRow[]); setLoading(false) })
  }, [filter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>Ontwerpen</h1>
        <p style={{ margin: '8px 0 0', fontSize: '16px', color: 'var(--color-body)' }}>Recente ontwerpen die klanten hebben gemaakt.</p>
      </div>

      <div style={{ display: 'flex', gap: '0', borderRadius: '99px', background: 'var(--color-sand)', padding: '4px', width: 'fit-content' }}>
        {(['all', 'draft', 'completed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            height: '36px', padding: '0 16px', borderRadius: '99px', border: 0,
            background: filter === f ? '#fff' : 'transparent', fontWeight: 700, fontSize: '13px', color: 'var(--color-ink)',
          }}>{f === 'all' ? 'Alle' : f === 'draft' ? 'Concepten' : 'Voltooid'}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Laden…</p>
      ) : designs.length === 0 ? (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Geen ontwerpen gevonden.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-line)', textAlign: 'left' }}>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Product</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Personen</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Datum</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((d) => {
                const people = (d.design as { people?: unknown[] })?.people
                const peopleCount = Array.isArray(people) ? people.length : 0
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                    <td style={{ padding: '12px 20px', fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>{d.id.slice(0, 8)}…</td>
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>{d.product}</td>
                    <td style={{ padding: '12px 20px' }}>{peopleCount}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: d.status === 'completed' ? 'var(--color-trust)' : 'var(--color-faint)', background: d.status === 'completed' ? 'var(--color-sage)' : 'var(--color-sand)', padding: '3px 10px', borderRadius: '99px' }}>{d.status}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--color-muted)' }}>{new Date(d.created_at).toLocaleString('nl-BE')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
