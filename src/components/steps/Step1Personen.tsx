import type { Design, Person, PersonType } from '../../types'
import { personTypes, personTypeLabels, personTypeFactors, getProductColor, getPrice } from '../../config/products'
import { useConfig } from '../../context/ConfigContext'
import Figure from '../Figure'
import { formatEUR } from '../../lib/format'

interface Step1Props {
  design: Design
  onUpdate: (updater: (prev: Design) => Design) => void
}

export default function Step1Personen({ design, onUpdate }: Step1Props) {
  const { products } = useConfig()
  const product = products[design.product]
  if (!product) return null
  const maxPeople = product.maxPeople
  const canAdd = design.people.length < maxPeople

  const addPriceLabel = (() => {
    if (!canAdd) return ''
    const next = design.people.length + 1
    const curr = design.people.length
    const nextPrice = getPrice(product, next)
    const currPrice = getPrice(product, curr)
    return nextPrice > currPrice ? `+${formatEUR(nextPrice - currPrice)}` : 'zelfde prijs'
  })()

  function addPerson() {
    const newPerson: Person = { type: 'adult', skin: 1, hair: 'kort', hairColor: 'bruin', glasses: false, name: '' }
    onUpdate((prev) => ({ ...prev, people: [...prev.people, newPerson] }))
  }

  function removePerson(i: number) {
    onUpdate((prev) => ({ ...prev, people: prev.people.filter((_, j) => j !== i) }))
  }

  function setPersonType(i: number, type: PersonType) {
    onUpdate((prev) => ({ ...prev, people: prev.people.map((p, j) => (j === i ? { ...p, type } : p)) }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Wie staat erop?
        </h2>
        <span style={{ fontSize: '14.5px', color: 'var(--color-body)', lineHeight: 1.4 }}>
          Tot {maxPeople} personen. De prijs past zich aan.
        </span>
      </div>

      {design.people.map((person, i) => {
        const sizeFactor = personTypeFactors[person.type] ?? 1
        return (
          <div key={i} style={{ padding: '10px 12px 12px', borderRadius: '16px', background: '#fff', border: '1px solid var(--color-line)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Figure person={person} size={34 * sizeFactor} showBody={false} />
              </div>
              <strong style={{ flex: 1, fontSize: '15.5px' }}>{person.name || `Persoon ${i + 1}`}</strong>
              {design.people.length > 1 && (
                <button onClick={() => removePerson(i)} aria-label="Verwijderen" style={{ width: '44px', height: '44px', margin: '-6px -6px -6px 0', border: 0, background: 'none', color: 'var(--color-faint)', fontSize: '22px' }}>×</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
              {personTypes.map((type) => {
                const selected = person.type === type
                return (
                  <button key={type} onClick={() => setPersonType(i, type)} style={{
                    height: '44px', borderRadius: '12px',
                    border: `1.5px solid ${selected ? 'var(--color-ink)' : 'var(--color-field-border)'}`,
                    background: selected ? 'var(--color-ink)' : '#fff',
                    color: selected ? '#fff' : 'var(--color-ink)',
                    fontWeight: 600, fontSize: '12px', padding: '0 2px', letterSpacing: '-0.01em',
                  }}>
                    {personTypeLabels[type]}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {canAdd && (
        <button onClick={addPerson} style={{
          minHeight: '52px', borderRadius: '16px', border: '1.5px dashed #C9B6A2', background: 'none',
          fontWeight: 700, fontSize: '15px', color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          + Persoon toevoegen <span style={{ fontWeight: 500, color: 'var(--color-muted)' }}>· {addPriceLabel}</span>
        </button>
      )}
    </div>
  )
}

// Keep getProductColor import referenced
void getProductColor
