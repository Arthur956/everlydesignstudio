import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../context/ConfigContext'
import { formatEUR } from '../../lib/format'
import type { ProductConfig, ProductColor, FontOption, LayoutSlot } from '../../config/products'

interface ProductRow {
  id: string
  name: string
  config: ProductConfig
  sort_order: number
  active: boolean
}

export default function ProductManager() {
  const { reload } = useConfig()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [creating, setCreating] = useState(false)

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('sort_order')
    if (data) {
      setProducts(data as unknown as ProductRow[])
    }
    setLoading(false)
  }

  useEffect(() => { void loadProducts() }, [])

  async function deleteProduct(id: string) {
    if (!confirm(`"${id}" verwijderen?`)) return
    await supabase.from('products').delete().eq('id', id)
    void loadProducts()
    void reload()
  }

  if (creating) {
    return <ProductEditor product={null} onSave={async () => { setCreating(false); void loadProducts(); void reload() }} onCancel={() => setCreating(false)} />
  }

  if (editing) {
    return <ProductEditor product={editing} onSave={async () => { setEditing(null); void loadProducts(); void reload() }} onCancel={() => setEditing(null)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>Producten</h1>
          <p style={{ margin: '8px 0 0', fontSize: '16px', color: 'var(--color-body)' }}>Beheer je producten, kleuren, prijzen en lay-outs.</p>
        </div>
        <button onClick={() => setCreating(true)} style={{
          height: '48px', padding: '0 24px', borderRadius: '99px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: '15px',
        }}>+ Nieuw product</button>
      </div>

      {loading ? (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Laden…</p>
      ) : products.length === 0 ? (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Nog geen producten.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((row) => {
            const cfg = row.config
            return (
              <div key={row.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '18px' }}>{row.name}</strong>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', fontFamily: 'ui-monospace, monospace', background: 'var(--color-sand)', padding: '3px 8px', borderRadius: '6px' }}>{row.id}</span>
                    {!row.active && <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-faint)', background: 'var(--color-sand)', padding: '3px 8px', borderRadius: '99px' }}>inactief</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '14px', color: 'var(--color-body)' }}>
                    <span>{cfg.colors.length} kleuren</span>
                    <span>Max {cfg.maxPeople} personen</span>
                    <span>{cfg.fonts.length} lettertypes</span>
                    <span>{formatEUR(cfg.prices[1] ?? 0)} – {formatEUR(cfg.prices[cfg.maxPeople] ?? 0)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {cfg.colors.map((c) => (
                      <div key={c.id} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.hex, border: '1px solid var(--color-line)' }} title={c.label} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditing(row)} style={{ height: '44px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>Bewerk</button>
                  <button onClick={() => deleteProduct(row.id)} style={{ height: '44px', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--color-peach)', background: 'var(--color-peach)', fontWeight: 700, fontSize: '14px', color: 'var(--color-accent-hover)' }}>Verwijder</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProductEditor({ product, onSave, onCancel }: { product: ProductRow | null; onSave: () => Promise<void>; onCancel: () => void }) {
  const [id, setId] = useState(product?.id ?? '')
  const [name, setName] = useState(product?.name ?? '')
  const [maxPeople, setMaxPeople] = useState(product?.config.maxPeople ?? 6)
  const [colors, setColors] = useState<ProductColor[]>(product?.config.colors ?? [{ id: 'wit', label: 'Wit', hex: '#FFFFFF', ink: '#2A1C14', top: '#E25F0C' }])
  const [fonts, setFonts] = useState<FontOption[]>(product?.config.fonts ?? [
    { id: 'speels', label: 'Speels', family: 'var(--font-display)', weight: 700, sizeFactor: 1 },
    { id: 'klassiek', label: 'Klassiek', family: 'var(--font-serif)', weight: 400, sizeFactor: 1.05 },
    { id: 'handgeschreven', label: 'Handgeschreven', family: 'var(--font-script)', weight: 700, sizeFactor: 1.3 },
  ])
  const [prices, setPrices] = useState<Record<number, number>>(product?.config.prices ?? { 1: 32.95, 2: 34.95, 3: 34.95, 4: 37.95, 5: 37.95, 6: 39.95 })
  const [printArea, setPrintArea] = useState(product?.config.printArea ?? { x: 25, y: 18, width: 50, height: 64 })
  const [layout, setLayout] = useState<Record<number, LayoutSlot[]>>(product?.config.layout ?? { 1: [{ x: 50, y: 60, scale: 1 }] })
  const [active, setActive] = useState(product?.active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    const config: ProductConfig = { id, name, colors, maxPeople, prices, printArea, layout, fonts }
    const row = { id, name, config: config as unknown as Record<string, unknown>, active, sort_order: product?.sort_order ?? 0 }
    const { error } = await supabase.from('products').upsert(row).eq('id', id)
    if (error) setError(error.message)
    else await onSave()
    setSaving(false)
  }

  function updateColor(i: number, patch: Partial<ProductColor>) {
    setColors((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  }

  function addColor() {
    setColors((prev) => [...prev, { id: `kleur-${prev.length + 1}`, label: 'Nieuwe kleur', hex: '#FFFFFF', ink: '#2A1C14', top: '#E25F0C' }])
  }

  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, j) => j !== i))
  }

  function updatePrice(count: number, value: number) {
    setPrices((prev) => ({ ...prev, [count]: value }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>{product ? 'Product bewerken' : 'Nieuw product'}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ height: '44px', padding: '0 20px', borderRadius: '99px', border: '1.5px solid var(--color-field-border)', background: '#fff', fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>Annuleren</button>
          <button onClick={handleSave} disabled={saving || !id || !name} style={{ height: '44px', padding: '0 24px', borderRadius: '99px', border: 0, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: '14px', opacity: saving || !id || !name ? 0.5 : 1 }}>Opslaan</button>
        </div>
      </div>

      {error && <div style={{ fontSize: '14px', color: 'var(--color-accent-hover)', background: 'var(--color-peach)', borderRadius: '12px', padding: '12px 16px' }}>{error}</div>}

      {/* Basic info */}
      <Section title="Algemeen">
        <Field label="Product ID (slug)"><input value={id} onChange={(e) => setId(e.target.value.replace(/[^a-z0-9-]/g, '-'))} disabled={!!product} placeholder="bv. shirt" style={inputStyle} /></Field>
        <Field label="Naam"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="bv. Gezinsportret T-shirt" style={inputStyle} /></Field>
        <Field label="Max personen"><input type="number" min={1} max={10} value={maxPeople} onChange={(e) => setMaxPeople(Number(e.target.value))} style={inputStyle} /></Field>
        <Field label="Actief">
          <button onClick={() => setActive(!active)} style={{ height: '44px', padding: '0 16px', borderRadius: '12px', border: `1.5px solid ${active ? 'var(--color-trust)' : 'var(--color-field-border)'}`, background: active ? 'var(--color-trust)' : '#fff', color: active ? '#fff' : 'var(--color-ink)', fontWeight: 600, fontSize: '14px' }}>{active ? 'Actief' : 'Inactief'}</button>
        </Field>
      </Section>

      {/* Colors */}
      <Section title="Kleuren">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {colors.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid var(--color-line)', cursor: 'pointer' }} />
              <input value={c.id} onChange={(e) => updateColor(i, { id: e.target.value })} placeholder="id" style={{ ...inputStyle, width: '100px' }} />
              <input value={c.label} onChange={(e) => updateColor(i, { label: e.target.value })} placeholder="Label" style={{ ...inputStyle, flex: 1 }} />
              <input type="color" value={c.ink} onChange={(e) => updateColor(i, { ink: e.target.value })} title="Tekstkleur" style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--color-line)', cursor: 'pointer' }} />
              <input type="color" value={c.top} onChange={(e) => updateColor(i, { top: e.target.value })} title="Bodykleur figuur" style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--color-line)', cursor: 'pointer' }} />
              <button onClick={() => removeColor(i)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--color-peach)', background: 'var(--color-peach)', color: 'var(--color-accent-hover)', fontWeight: 700 }}>×</button>
            </div>
          ))}
          <button onClick={addColor} style={{ alignSelf: 'flex-start', height: '40px', padding: '0 16px', borderRadius: '12px', border: '1.5px dashed var(--color-field-border)', background: 'none', fontWeight: 700, fontSize: '14px', color: 'var(--color-accent)' }}>+ Kleur toevoegen</button>
        </div>
      </Section>

      {/* Prices */}
      <Section title="Prijzen per aantal personen">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
          {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => (
            <Field key={n} label={`${n} ${n === 1 ? 'persoon' : 'personen'}`}>
              <input type="number" step="0.05" min="0" value={prices[n] ?? 0} onChange={(e) => updatePrice(n, Number(e.target.value))} style={inputStyle} />
            </Field>
          ))}
        </div>
      </Section>

      {/* Print area */}
      <Section title="Printgebied (positie in %)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <Field label="X (%)"><input type="number" value={printArea.x} onChange={(e) => setPrintArea({ ...printArea, x: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Y (%)"><input type="number" value={printArea.y} onChange={(e) => setPrintArea({ ...printArea, y: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Breedte (%)"><input type="number" value={printArea.width} onChange={(e) => setPrintArea({ ...printArea, width: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Hoogte (%)"><input type="number" value={printArea.height} onChange={(e) => setPrintArea({ ...printArea, height: Number(e.target.value) })} style={inputStyle} /></Field>
        </div>
      </Section>

      {/* Fonts (read-only display — fonts use CSS variables) */}
      <Section title="Lettertypes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fonts.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={f.id} onChange={(e) => setFonts((prev) => prev.map((fo, j) => (j === i ? { ...fo, id: e.target.value } : fo)))} placeholder="id" style={{ ...inputStyle, width: '140px' }} />
              <input value={f.label} onChange={(e) => setFonts((prev) => prev.map((fo, j) => (j === i ? { ...fo, label: e.target.value } : fo)))} placeholder="Label" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontFamily: f.family, fontWeight: f.weight, fontSize: '20px' }}>Lotte</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Layout (simplified — show per-count slots) */}
      <Section title="Lay-out posities">
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', margin: '0 0 12px' }}>Elke persoon krijgt een positie (x, y in %) en een schaalfactor.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: maxPeople }, (_, i) => i + 1).map((n) => {
            const slots = layout[n] ?? []
            return (
              <div key={n} style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-sand)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <strong>{n} {n === 1 ? 'persoon' : 'personen'}</strong>
                  <button onClick={() => setLayout({ ...layout, [n]: [...slots, { x: 50, y: 60, scale: 0.8 }] })} style={{ height: '28px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-field-border)', background: '#fff', fontWeight: 600, fontSize: '12px' }}>+ positie</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {slots.map((slot, si) => (
                    <div key={si} style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '4px 8px' }}>
                      <input type="number" value={slot.x} onChange={(e) => setLayout({ ...layout, [n]: slots.map((s, j) => (j === si ? { ...s, x: Number(e.target.value) } : s)) })} style={{ width: '50px', ...miniInput }} />
                      <input type="number" value={slot.y} onChange={(e) => setLayout({ ...layout, [n]: slots.map((s, j) => (j === si ? { ...s, y: Number(e.target.value) } : s)) })} style={{ width: '50px', ...miniInput }} />
                      <input type="number" step="0.05" value={slot.scale} onChange={(e) => setLayout({ ...layout, [n]: slots.map((s, j) => (j === si ? { ...s, scale: Number(e.target.value) } : s)) })} style={{ width: '50px', ...miniInput }} />
                      <button onClick={() => setLayout({ ...layout, [n]: slots.filter((_, j) => j !== si) })} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 0, background: 'var(--color-peach)', color: 'var(--color-accent-hover)', fontWeight: 700 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

const inputStyle: React.CSSProperties = { height: '44px', borderRadius: '10px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 12px', fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)' }
const miniInput: React.CSSProperties = { height: '32px', borderRadius: '6px', border: '1px solid var(--color-field-border)', background: '#fff', padding: '0 6px', fontSize: '13px', color: 'var(--color-ink)' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '24px' }}>
      <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)' }}>{label}</span>
      {children}
    </label>
  )
}
