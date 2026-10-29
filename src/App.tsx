import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { designSchema, type Design, type Person } from './types'
import { getProductColor, getPrice, fallbackProducts } from './config/products'
import { formatEUR } from './lib/format'
import { saveToLocalStorage, loadFromLocalStorage } from './lib/storage'
import { supabase } from './lib/supabase'
import { useAutosave } from './hooks/useAutosave'
import { addToCart } from './lib/cart'
import Header from './components/Header'
import MobileHeader from './components/MobileHeader'
import ProgressBar from './components/ProgressBar'
import Preview from './components/Preview'
import Step1Personen from './components/steps/Step1Personen'
import Step2Uiterlijk from './components/steps/Step2Uiterlijk'
import Step3Namen from './components/steps/Step3Namen'
import Step4Controle from './components/steps/Step4Controle'
import SuccessScreen from './components/SuccessScreen'
import { useConfig } from './context/ConfigContext'

function parseUrlParams(): { productId: string; color: string; size: string; variant: string; returnTo: string } {
  const params = new URLSearchParams(window.location.search)
  // Also check path: /customize/:productId
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const pathProductId = pathParts.length >= 2 && pathParts[0] === 'customize' ? pathParts[1] : ''

  const productId = pathProductId || params.get('productId') || 'shirt'
  const color = params.get('color') || 'wit'
  const size = params.get('size') || 'M'
  const variant = params.get('variant') || ''
  const returnTo = params.get('return') || ''

  return { productId, color, size, variant, returnTo }
}

function createDefaultDesign(productId: string, color: string): Design {
  const product = fallbackProducts[productId] ?? fallbackProducts['shirt']!
  const validColor = product.colors.some((c) => c.id === color) ? color : product.colors[0].id

  const defaultPeople: Person[] = [
    { type: 'adult', skin: 1, hair: 'lang', hairColor: 'bruin', glasses: false, name: 'Lotte' },
    { type: 'adult', skin: 2, hair: 'kort', hairColor: 'bruin', glasses: true, name: 'Bram' },
    { type: 'child', skin: 1, hair: 'staartjes', hairColor: 'blond', glasses: false, name: 'Noor' },
  ]

  return {
    product: product.id,
    color: validColor,
    people: defaultPeople,
    line: '',
    font: 'speels',
  }
}

export default function App() {
  const { products } = useConfig()
  const urlParams = useMemo(() => parseUrlParams(), [])
  const [step, setStep] = useState(1)
  const [activePerson, setActivePerson] = useState(0)
  const [checked, setChecked] = useState(false)
  const [successDesignId, setSuccessDesignId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [editToken, setEditToken] = useState<string | null>(null)
  const [designId, setDesignId] = useState<string | null>(null)
  const savingRef = useRef(false)

  const [design, setDesign] = useState<Design>(() => {
    const stored = loadFromLocalStorage()
    if (stored) {
      // Validate stored design
      const result = designSchema.safeParse(stored)
      if (result.success) return result.data
    }
    return createDefaultDesign(urlParams.productId, urlParams.color)
  })

  const { status: saveStatus } = useAutosave(design, editToken, designId)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    saveToLocalStorage(design)
  }, [design])

  // Generate an edit token on first load
  useEffect(() => {
    if (!editToken) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setEditToken(token)
    }
  }, [editToken])

  const updateDesign = useCallback((updater: (prev: Design) => Design) => {
    setDesign((prev) => {
      const next = updater(prev)
      const result = designSchema.safeParse(next)
      if (!result.success) {
        console.warn('Design validation failed:', result.error.issues)
        return prev
      }
      return result.data
    })
  }, [])

  const product = useMemo(() => products[design.product] ?? fallbackProducts[design.product] ?? fallbackProducts['shirt']!, [products, design.product])
  const color = useMemo(() => getProductColor(product, design.color), [product, design.color])
  const price = useMemo(() => getPrice(product, design.people.length), [product, design.people.length])

  const summary = `${design.people.length} ${design.people.length === 1 ? 'persoon' : 'personen'} · ${color.label} · ${urlParams.size}`

  const nextLabel = ['Uiterlijk', 'Namen', 'Controleren'][step - 1] ?? ''
  const ready = step === 4 && checked

  async function handleAddToCart() {
    if (!checked || savingRef.current) return
    savingRef.current = true

    try {
      // Save the design with status 'completed'
      let savedId = designId
      if (savedId && editToken) {
        await supabase
          .from('designs')
          .update({ design: design as unknown as Record<string, unknown>, status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', savedId)
          .eq('edit_token', editToken)
      } else if (editToken) {
        const { data } = await supabase
          .from('designs')
          .insert({
            product: design.product,
            design: design as unknown as Record<string, unknown>,
            edit_token: editToken,
            status: 'completed',
          })
          .select('id')
          .maybeSingle()
        if (data) savedId = data.id
      }

      // Stub: Shopify integration comes later
      await addToCart(design, urlParams.variant || undefined)

      if (savedId) {
        setDesignId(savedId)
        setSuccessDesignId(savedId)
      }
    } catch (err) {
      console.error('Failed to save design:', err)
    } finally {
      savingRef.current = false
    }
  }

  if (successDesignId) {
    return <SuccessScreen designId={successDesignId} returnTo={urlParams.returnTo || undefined} />
  }

  const stepContent = (() => {
    switch (step) {
      case 1:
        return <Step1Personen design={design} onUpdate={updateDesign} />
      case 2:
        return (
          <Step2Uiterlijk
            design={design}
            activePerson={Math.min(activePerson, design.people.length - 1)}
            onUpdate={updateDesign}
            onSelectPerson={(i) => setActivePerson(i)}
          />
        )
      case 3:
        return <Step3Namen design={design} onUpdate={updateDesign} />
      case 4:
        return (
          <Step4Controle
            design={design}
            checked={checked}
            size={urlParams.size}
            onToggleCheck={() => setChecked((c) => !c)}
            onEditPerson={(i) => {
              setActivePerson(i)
              setStep(2)
            }}
          />
        )
      default:
        return null
    }
  })()

  // Mobile layout
  if (isMobile) {
    return (
      <div
        style={{
          height: '100vh',
          background: 'var(--color-bg)',
          borderRadius: '32px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MobileHeader returnTo={urlParams.returnTo || undefined} saved={saveStatus === 'saved'} />

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 16px 8px' }}>
          {['Personen', 'Uiterlijk', 'Namen', 'Controle'].map((label, i) => {
            const stepNum = i + 1
            const isPast = stepNum < step
            const isCurrent = stepNum === step
            return (
              <button
                key={label}
                onClick={() => setStep(stepNum)}
                style={{ flex: 1, border: 0, background: 'none', padding: '4px 0', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}
              >
                <span
                  style={{
                    height: '4px',
                    width: '100%',
                    borderRadius: '2px',
                    background: isPast ? 'var(--color-trust)' : isCurrent ? 'var(--color-accent)' : 'var(--color-field-border)',
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '12.5px',
                    color: isPast ? 'var(--color-trust)' : isCurrent ? 'var(--color-ink)' : 'var(--color-faint)',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Preview */}
        <div
          style={{
            flex: '0 0 auto',
            margin: '0 16px',
            borderRadius: '20px',
            background: 'var(--color-sand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '20px 0',
          }}
        >
          <Preview design={design} selectedPerson={activePerson} onSelectPerson={(i) => { setActivePerson(i); setStep(2) }} variant="mobile" />
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#fff',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '5px 9px',
              borderRadius: '99px',
              color: 'var(--color-trust)',
            }}
          >
            ● Live voorbeeld
          </span>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stepContent}
        </div>

        {/* Sticky bottom bar */}
        <div
          style={{
            padding: '12px 16px 22px',
            background: '#fff',
            borderTop: '1px solid var(--color-line)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 -8px 20px -12px rgba(42,28,20,.2)',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>{summary}</span>
            <strong style={{ fontSize: '17px' }}>{formatEUR(price)}</strong>
          </div>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              aria-label="Vorige stap"
              style={{
                flexShrink: 0,
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '1.5px solid var(--color-field-border)',
                background: '#fff',
                fontSize: '18px',
                color: 'var(--color-ink)',
              }}
            >
              ←
            </button>
          )}
          {step < 4 && (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                height: '52px',
                padding: '0 18px',
                border: 0,
                borderRadius: '99px',
                background: 'var(--color-accent)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {nextLabel} →
            </button>
          )}
          {step === 4 && ready && (
            <button
              onClick={handleAddToCart}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                height: '52px',
                padding: '0 18px',
                border: 0,
                borderRadius: '99px',
                background: 'var(--color-accent)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              In winkelmand
            </button>
          )}
          {step === 4 && !ready && (
            <button
              onClick={() => setChecked(true)}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                height: '52px',
                padding: '0 18px',
                border: 0,
                borderRadius: '99px',
                background: '#E2D5C5',
                color: 'var(--color-muted)',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              In winkelmand
            </button>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header returnTo={urlParams.returnTo || undefined} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: '40px',
          padding: '24px 40px 28px',
        }}
      >
        {/* Preview left */}
        <div
          style={{
            borderRadius: '28px',
            background: 'var(--color-sand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Preview design={design} selectedPerson={activePerson} onSelectPerson={(i) => { setActivePerson(i); setStep(2) }} variant="desktop" />
          <span
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: '99px',
              color: 'var(--color-trust)',
            }}
          >
            ● Live voorbeeld · klik op een figuurtje om het aan te passen
          </span>
          {saveStatus === 'saved' && (
            <span
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '99px',
                color: 'var(--color-trust)',
              }}
            >
              ● Bewaard
            </span>
          )}
        </div>

        {/* Controls right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: 0 }}>
          <ProgressBar step={step} onStepClick={(s) => setStep(s)} />

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {stepContent}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-line)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{summary}</span>
              <strong style={{ fontSize: '22px' }}>{formatEUR(price)}</strong>
            </div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  height: '56px',
                  padding: '0 22px',
                  borderRadius: '99px',
                  border: '1.5px solid var(--color-field-border)',
                  background: '#fff',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--color-ink)',
                }}
              >
                ← Vorige
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  height: '56px',
                  padding: '0 28px',
                  border: 0,
                  borderRadius: '99px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                {nextLabel} →
              </button>
            )}
            {step === 4 && ready && (
              <button
                onClick={handleAddToCart}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  height: '56px',
                  padding: '0 28px',
                  border: 0,
                  borderRadius: '99px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                Toevoegen aan winkelmand →
              </button>
            )}
            {step === 4 && !ready && (
              <button
                onClick={() => setChecked(true)}
                style={{
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  height: '56px',
                  padding: '0 28px',
                  border: 0,
                  borderRadius: '99px',
                  background: '#E2D5C5',
                  color: 'var(--color-muted)',
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                Toevoegen aan winkelmand →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


