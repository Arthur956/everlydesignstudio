import type { Design } from '../../types'
import { getProductColor, personTypeLabels } from '../../config/products'
import { useConfig } from '../../context/ConfigContext'

interface Step4Props {
  design: Design
  checked: boolean
  size: string
  onToggleCheck: () => void
  onEditPerson: (i: number) => void
}

export default function Step4Controle({ design, checked, size, onToggleCheck, onEditPerson }: Step4Props) {
  const { products, clipart } = useConfig()
  const product = products[design.product]
  if (!product) return null
  const color = getProductColor(product, design.color)

  const missing = design.people.filter((p) => !p.name.trim()).length
  const missingMsg = missing === 0 ? '' : missing === 1 ? '1 persoon heeft nog geen naam. Dat mag: dan drukken we geen naam onder dat figuurtje.' : `${missing} personen hebben nog geen naam. Dat mag: dan drukken we geen naam onder die figuurtjes.`

  function personSummary(person: typeof design.people[0]): string {
    const hairStyle = clipart.hairStyles.find((h) => h.id === person.hair)
    const hairColor = clipart.hairColors.find((c) => c.id === person.hairColor)
    const parts = [personTypeLabels[person.type], hairStyle ? hairStyle.label.toLowerCase() : '', hairColor ? hairColor.label.toLowerCase() : '']
    if (person.glasses) parts.push('bril')
    return parts.filter(Boolean).join(' · ')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>Klopt alles?</h2>
        <span style={{ fontSize: '14.5px', color: 'var(--color-body)', lineHeight: 1.4 }}>We drukken precies wat je in het voorbeeld ziet.</span>
      </div>

      <div style={{ borderRadius: '16px', background: '#fff', border: '1px solid var(--color-line)', display: 'flex', flexDirection: 'column' }}>
        {design.people.map((person, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px 8px 12px', borderBottom: i < design.people.length - 1 ? '1px solid #F1E8DD' : 'none' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <strong style={{ fontSize: '15px' }}>{person.name || `Persoon ${i + 1}`}</strong>
              <span style={{ fontSize: '13px', color: 'var(--color-body)' }}>{personSummary(person)}</span>
            </div>
            <button onClick={() => onEditPerson(i)} style={{ height: '44px', padding: '0 10px', border: 0, background: 'none', fontWeight: 700, fontSize: '14px', color: 'var(--color-accent)' }}>Wijzig</button>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px 8px 12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <strong style={{ fontSize: '15px' }}>{product.name}</strong>
            <span style={{ fontSize: '13px', color: 'var(--color-body)' }}>{color.label} · maat {size}</span>
          </div>
        </div>
      </div>

      {missing > 0 && (
        <span style={{ fontSize: '14px', lineHeight: 1.45, color: 'var(--color-accent-hover)', background: 'var(--color-peach)', borderRadius: '12px', padding: '10px 12px' }}>{missingMsg}</span>
      )}

      <button onClick={onToggleCheck} style={{ border: 0, background: 'none', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left', fontWeight: 500, fontSize: '15px', color: 'var(--color-ink)', lineHeight: 1.4 }}>
        <span style={{ flex: '0 0 26px', height: '26px', borderRadius: '8px', border: `2px solid ${checked ? 'var(--color-trust)' : '#BFAE9C'}`, background: checked ? 'var(--color-trust)' : '#fff', color: '#fff', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{checked ? '✓' : ''}</span>
        Ik heb de namen en de spelling gecontroleerd
      </button>

      <div style={{ padding: '12px 14px', borderRadius: '14px', background: 'var(--color-sage)', fontSize: '14px', lineHeight: 1.45, color: 'var(--color-trust)' }}>
        <strong>Toch iets vergeten?</strong> Tot 2 uur na je bestelling kan je je ontwerp nog aanpassen.
      </div>
    </div>
  )
}
