import type { Design } from '../../types'
import { personTypeLabels } from '../../config/products'
import { useConfig } from '../../context/ConfigContext'

interface Step3Props {
  design: Design
  onUpdate: (updater: (prev: Design) => Design) => void
}

export default function Step3Namen({ design, onUpdate }: Step3Props) {
  const { products } = useConfig()
  const product = products[design.product]
  if (!product) return null

  function setName(i: number, name: string) {
    onUpdate((prev) => ({ ...prev, people: prev.people.map((p, j) => (j === i ? { ...p, name: name.slice(0, 12) } : p)) }))
  }

  function setLine(line: string) {
    onUpdate((prev) => ({ ...prev, line: line.slice(0, 32) }))
  }

  function setFont(fontId: string) {
    onUpdate((prev) => ({ ...prev, font: fontId as Design['font'] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>Namen &amp; tekst</h2>
        <span style={{ fontSize: '14.5px', color: 'var(--color-body)', lineHeight: 1.4 }}>De naam komt onder elk figuurtje. Maximaal 12 tekens.</span>
      </div>

      {design.people.map((person, i) => (
        <label key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
            Persoon {i + 1} · {personTypeLabels[person.type]}
            <span style={{ fontWeight: 500, color: 'var(--color-faint)' }}>{person.name.length}/12</span>
          </span>
          <input value={person.name} onChange={(e) => setName(i, e.target.value)} placeholder="Naam" style={{
            height: '50px', borderRadius: '12px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 14px', fontWeight: 500, fontSize: '16px', color: 'var(--color-ink)',
          }} />
        </label>
      ))}

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
          Extra regel <span style={{ fontWeight: 500, color: 'var(--color-faint)' }}>optioneel · {design.line.length}/32</span>
        </span>
        <input value={design.line} onChange={(e) => setLine(e.target.value)} placeholder="bv. Familie Peeters · sinds 2014" style={{
          height: '50px', borderRadius: '12px', border: '1.5px solid var(--color-field-border)', background: '#fff', padding: '0 14px', fontWeight: 500, fontSize: '16px', color: 'var(--color-ink)',
        }} />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Lettertype</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
          {product.fonts.map((font) => {
            const selected = design.font === font.id
            return (
              <button key={font.id} onClick={() => setFont(font.id)} style={{
                height: '84px', borderRadius: '14px',
                border: selected ? '2px solid var(--color-ink)' : '2px solid var(--color-line)',
                background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--color-ink)',
              }}>
                <span style={{ fontFamily: font.family, fontWeight: font.weight, fontSize: `${Math.round(24 * font.sizeFactor)}px`, lineHeight: 1 }}>Lotte</span>
                <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--color-body)' }}>{font.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
