import { useMemo } from 'react'
import type { Design } from '../types'
import { getProduct, getProductColor, getLayoutSlots, getFont, personTypeFactors } from '../config/products'
import Figure from './Figure'

interface PreviewProps {
  design: Design
  selectedPerson: number
  onSelectPerson: (index: number) => void
  variant?: 'mobile' | 'desktop'
}

export default function Preview({ design, selectedPerson, onSelectPerson, variant = 'desktop' }: PreviewProps) {
  const product = useMemo(() => getProduct(design.product), [design.product])
  const color = useMemo(() => (product ? getProductColor(product, design.color) : null), [product, design.color])
  const slots = useMemo(() => (product ? getLayoutSlots(product, design.people.length) : []), [product, design.people.length])
  const font = useMemo(() => (product ? getFont(product, design.font) : null), [product, design.font])

  if (!product || !color || !font) return null

  const isMobile = variant === 'mobile'
  const containerW = isMobile ? 224 : 500
  const containerH = isMobile ? 236 : 520

  // Base figure size for a single person at scale 1
  const baseFigureSize = isMobile ? 74 : 150

  const printArea = product.printArea

  return (
    <div
      style={{
        position: 'relative',
        width: `${containerW}px`,
        height: `${containerH}px`,
        borderRadius: isMobile ? '34px 34px 16px 16px' : '64px 64px 26px 26px',
        background: color.hex,
        boxShadow: '0 24px 50px -20px rgba(42,28,20,.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '8px' : '16px',
        padding: '0 8px',
        transition: 'background .25s',
      }}
    >
      {/* Print area: we position figures absolutely within the print area */}
      <div
        style={{
          position: 'absolute',
          left: `${printArea.x}%`,
          top: `${printArea.y}%`,
          width: `${printArea.width}%`,
          height: `${printArea.height}%`,
        }}
      >
        {/* Figures row */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: isMobile ? '4px' : '8px',
          }}
        >
          {design.people.map((person, i) => {
            const slot = slots[i] ?? slots[0] ?? { x: 50, y: 60, scale: 1 }
            const sizeFactor = personTypeFactors[person.type] ?? 1
            const figureSize = baseFigureSize * slot.scale * sizeFactor

            return (
              <button
                key={i}
                onClick={() => onSelectPerson(i)}
                aria-label={`Pas ${person.name || `persoon ${i + 1}`} aan`}
                style={{
                  border: 0,
                  background: 'none',
                  padding: isMobile ? '2px' : '4px',
                  borderRadius: isMobile ? '10px' : '14px',
                  outline: selectedPerson === i ? '2px dashed var(--color-accent)' : '2px solid transparent',
                  outlineOffset: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? '3px' : '6px',
                  transition: 'outline-color .2s',
                }}
              >
                <Figure
                  person={person}
                  size={figureSize}
                  showBody
                  bodyColor={color.top}
                />
                <span
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.weight,
                    fontSize: `${(isMobile ? 10 : 17) * font.sizeFactor}px`,
                    color: color.ink,
                    lineHeight: 1,
                    minHeight: isMobile ? '10px' : '16px',
                    textAlign: 'center',
                    maxWidth: figureSize * 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {person.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Extra line below the figures */}
      {design.line.trim() && (
        <span
          style={{
            position: 'absolute',
            bottom: isMobile ? '12px' : '24px',
            fontFamily: font.family,
            fontWeight: font.weight,
            fontSize: `${(isMobile ? 12 : 24) * font.sizeFactor}px`,
            color: color.ink,
            textAlign: 'center',
            lineHeight: 1.1,
            padding: '0 12px',
            maxWidth: '90%',
          }}
        >
          {design.line}
        </span>
      )}
    </div>
  )
}
