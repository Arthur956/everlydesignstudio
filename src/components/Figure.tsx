import { useMemo } from 'react'
import type { Person } from '../types'
import { useConfig } from '../context/ConfigContext'
import type { ClipartLayer } from '../config/clipart'

interface FigureProps {
  person: Person
  size: number
  showBody?: boolean
  bodyColor?: string
  selected?: boolean
  onClick?: () => void
}

function hexToTintFilter(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const sr = (r / 136).toFixed(3)
  const sg = (g / 136).toFixed(3)
  const sb = (b / 136).toFixed(3)
  return `brightness(${sr}) sepia(1) hue-rotate(${((Math.atan2(Number(b) - Number(g), Number(r) - Number(g)) * 180) / Math.PI).toFixed(1)}deg) saturate(${Math.max(Number(sr), Number(sg), Number(sb)).toFixed(3)})`
}

function LayerShape({ layer, color, tint }: { layer: ClipartLayer; color: string; tint: boolean }) {
  const filter = tint ? hexToTintFilter(color) : undefined
  const fill = tint ? '#888' : color
  const shapeId = layer.id

  if (shapeId.includes('back')) {
    if (shapeId.includes('lang')) return <ellipse cx="50" cy="48" rx="42" ry="46" fill={fill} filter={filter} />
    if (shapeId.includes('knot')) return <ellipse cx="50" cy="14" rx="16" ry="16" fill={fill} filter={filter} />
    if (shapeId.includes('staartjes')) {
      const isLeft = shapeId.includes('back-l')
      return <ellipse cx={isLeft ? 6 : 94} cy="38" rx="12" ry="18" fill={fill} filter={filter} />
    }
  }

  if (shapeId.includes('front')) {
    if (shapeId.includes('kort')) return <path d="M 14 30 Q 50 6 86 30 L 86 36 Q 50 18 14 36 Z" fill={fill} filter={filter} />
    if (shapeId.includes('lang')) return <path d="M 14 28 Q 50 4 86 28 L 84 38 Q 50 20 16 38 Z" fill={fill} filter={filter} />
    if (shapeId.includes('krullen')) {
      return (
        <g fill={fill} filter={filter}>
          <circle cx="20" cy="26" r="12" />
          <circle cx="34" cy="16" r="13" />
          <circle cx="50" cy="12" r="13" />
          <circle cx="66" cy="16" r="13" />
          <circle cx="80" cy="26" r="12" />
          <ellipse cx="50" cy="28" rx="34" ry="14" />
        </g>
      )
    }
    if (shapeId.includes('staartjes')) return <path d="M 14 28 Q 50 6 86 28 L 84 36 Q 50 18 16 38 Z" fill={fill} filter={filter} />
    if (shapeId.includes('knot')) return <path d="M 14 28 Q 50 6 86 28 L 84 36 Q 50 18 16 38 Z" fill={fill} filter={filter} />
  }

  return null
}

const clipartFallback = {
  id: 'kort',
  label: 'Kort',
  back: [] as ClipartLayer[],
  front: [] as ClipartLayer[],
}

export default function Figure({ person, size, showBody = true, bodyColor = '#E25F0C', selected, onClick }: FigureProps) {
  const { clipart } = useConfig()

  const skinColor = useMemo(() => clipart.skinColors.find((c) => c.id === String(person.skin))?.hex ?? '#F2CDB0', [clipart, person.skin])
  const hairColorHex = useMemo(() => clipart.hairColors.find((c) => c.id === person.hairColor)?.hex ?? '#6B4226', [clipart, person.hairColor])
  const hairStyle = useMemo(() => clipart.hairStyles.find((h) => h.id === person.hair) ?? clipartFallback, [clipart, person.hair])

  const headSize = size * 0.8
  const bodyWidth = size
  const bodyHeight = size * 0.5

  return (
    <div
      style={{ width: `${size}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: onClick ? 'auto' : 'none' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Pas ${person.name || 'persoon'} aan` : undefined}
    >
      <div style={{ position: 'relative', width: `${headSize}px`, height: `${headSize}px` }}>
        <svg viewBox="0 0 100 100" width={headSize} height={headSize} style={{ display: 'block' }}>
          {hairStyle.back.map((layer) => (
            <LayerShape key={layer.id} layer={layer} color={hairColorHex} tint={!!layer.tintable} />
          ))}
          <circle cx="50" cy="50" r="38" fill={skinColor} />
          <circle cx="36" cy="50" r="4" fill="#2A1C14" />
          <circle cx="64" cy="50" r="4" fill="#2A1C14" />
          <ellipse cx="28" cy="62" rx="6" ry="4" fill="#F08E7A" opacity="0.4" />
          <ellipse cx="72" cy="62" rx="6" ry="4" fill="#F08E7A" opacity="0.4" />
          {hairStyle.front.map((layer) => (
            <LayerShape key={layer.id} layer={layer} color={hairColorHex} tint={!!layer.tintable} />
          ))}
          {person.glasses && (
            <g stroke="#2A1C14" strokeWidth="2" fill="none">
              <circle cx="34" cy="50" r="10" />
              <circle cx="66" cy="50" r="10" />
              <line x1="44" y1="50" x2="56" y2="50" />
            </g>
          )}
        </svg>
        {selected && (
          <div style={{ position: 'absolute', inset: '-4px', border: '2px dashed var(--color-accent)', borderRadius: '14px', pointerEvents: 'none' }} />
        )}
      </div>
      {showBody && (
        <div
          style={{
            width: `${bodyWidth}px`,
            height: `${bodyHeight}px`,
            marginTop: `-${size * 0.06}px`,
            background: bodyColor,
            borderRadius: '50% 50% 14% 14% / 80% 80% 20% 20%',
          }}
        />
      )}
    </div>
  )
}
