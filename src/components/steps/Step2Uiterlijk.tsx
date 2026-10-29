import type { Design, Person } from '../../types'
import { personTypeFactors } from '../../config/products'
import { useConfig } from '../../context/ConfigContext'
import Figure from '../Figure'

interface Step2Props {
  design: Design
  activePerson: number
  onUpdate: (updater: (prev: Design) => Design) => void
  onSelectPerson: (i: number) => void
}

export default function Step2Uiterlijk({ design, activePerson, onUpdate, onSelectPerson }: Step2Props) {
  const { clipart } = useConfig()
  const person = design.people[activePerson] ?? design.people[0]

  function updatePerson(patch: Partial<Person>) {
    onUpdate((prev) => ({ ...prev, people: prev.people.map((p, i) => (i === activePerson ? { ...p, ...patch } : p)) }))
  }

  function ringStyle(selected: boolean): string {
    return selected ? '0 0 0 3px var(--color-bg), 0 0 0 5px var(--color-ink)' : 'inset 0 0 0 1px rgba(42,28,20,.18)'
  }

  const hasNextPerson = activePerson < design.people.length - 1
  const nextPersonLabel = hasNextPerson ? design.people[activePerson + 1].name || `Persoon ${activePerson + 2}` : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>Hoe zien ze eruit?</h2>
        <span style={{ fontSize: '14.5px', color: 'var(--color-body)', lineHeight: 1.4 }}>Kies per persoon. Tik ook op een figuurtje in het voorbeeld.</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {design.people.map((p, i) => {
          const selected = i === activePerson
          const sizeFactor = personTypeFactors[p.type] ?? 1
          return (
            <button key={i} onClick={() => onSelectPerson(i)} style={{
              height: '44px', padding: '0 14px 0 6px', borderRadius: '99px',
              border: `1.5px solid ${selected ? 'var(--color-ink)' : 'var(--color-field-border)'}`,
              background: selected ? '#fff' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', color: 'var(--color-ink)',
            }}>
              <Figure person={p} size={30 * sizeFactor} showBody={false} />
              {p.name || `Persoon ${i + 1}`}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Kapsel</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
          {clipart.hairStyles.map((style) => {
            const selected = person.hair === style.id
            const previewPerson: Person = { ...person, hair: style.id }
            return (
              <button key={style.id} onClick={() => updatePerson({ hair: style.id })} style={{
                height: '96px', borderRadius: '14px',
                border: selected ? '2px solid var(--color-ink)' : '2px solid var(--color-line)',
                background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                fontWeight: 600, fontSize: '13.5px', color: 'var(--color-ink)',
              }}>
                <Figure person={previewPerson} size={54} showBody={false} />
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>
          Haarkleur: <span style={{ fontWeight: 400 }}>{clipart.hairColors.find((c) => c.id === person.hairColor)?.label}</span>
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {clipart.hairColors.map((c) => (
            <button key={c.id} aria-label={c.label} onClick={() => updatePerson({ hairColor: c.id })} style={{
              width: '44px', height: '44px', borderRadius: '50%', border: 0, background: c.hex,
              boxShadow: ringStyle(person.hairColor === c.id),
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Huidskleur</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {clipart.skinColors.map((c) => (
            <button key={c.id} aria-label={c.label} onClick={() => updatePerson({ skin: Number(c.id) })} style={{
              width: '44px', height: '44px', borderRadius: '50%', border: 0, background: c.hex,
              boxShadow: ringStyle(String(person.skin) === c.id),
            }} />
          ))}
        </div>
      </div>

      <button onClick={() => updatePerson({ glasses: !person.glasses })} style={{
        minHeight: '56px', padding: '0 14px', borderRadius: '14px', border: '1px solid var(--color-line)', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)',
      }}>
        Met bril
        <span style={{ width: '46px', height: '28px', borderRadius: '99px', background: person.glasses ? 'var(--color-trust)' : 'var(--color-field-border)', position: 'relative', transition: 'background .2s' }}>
          <span style={{ position: 'absolute', top: '3px', left: person.glasses ? '21px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
        </span>
      </button>

      {hasNextPerson && (
        <button onClick={() => onSelectPerson(activePerson + 1)} style={{
          alignSelf: 'flex-start', border: 0, background: 'none', padding: '8px 0', fontWeight: 700, fontSize: '15px', color: 'var(--color-accent)',
        }}>
          Volgende persoon: {nextPersonLabel} →
        </button>
      )}
    </div>
  )
}
