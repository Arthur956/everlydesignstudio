export interface ProductColor {
  id: string
  label: string
  hex: string
  ink: string
  top: string
}

export interface PriceTable {
  [peopleCount: number]: number
}

export interface LayoutSlot {
  x: number
  y: number
  scale: number
}

export interface ProductLayout {
  [peopleCount: number]: LayoutSlot[]
}

export interface FontOption {
  id: string
  label: string
  family: string
  weight: number
  sizeFactor: number
}

export interface ProductConfig {
  id: string
  name: string
  colors: ProductColor[]
  printArea: { x: number; y: number; width: number; height: number }
  maxPeople: number
  prices: PriceTable
  layout: ProductLayout
  fonts: FontOption[]
}

export const products: Record<string, ProductConfig> = {
  shirt: {
    id: 'shirt',
    name: 'Gezinsportret T-shirt',
    colors: [
      { id: 'wit', label: 'Wit', hex: '#FFFFFF', ink: '#2A1C14', top: '#E25F0C' },
      { id: 'creme', label: 'Crème', hex: '#F3E3CB', ink: '#2A1C14', top: '#C2490A' },
      { id: 'perzik', label: 'Perzik', hex: '#F7C6A3', ink: '#2A1C14', top: '#2F5D4A' },
      { id: 'dennengroen', label: 'Dennengroen', hex: '#2F5D4A', ink: '#FBF7F2', top: '#F5B98F' },
      { id: 'espresso', label: 'Espresso', hex: '#2A1C14', ink: '#FBF7F2', top: '#E25F0C' },
    ],
    printArea: { x: 25, y: 18, width: 50, height: 64 },
    maxPeople: 6,
    prices: { 1: 32.95, 2: 34.95, 3: 34.95, 4: 37.95, 5: 37.95, 6: 39.95 },
    layout: {
      1: [{ x: 50, y: 60, scale: 1 }],
      2: [{ x: 33, y: 60, scale: 0.85 }, { x: 66, y: 60, scale: 0.85 }],
      3: [{ x: 25, y: 60, scale: 0.72 }, { x: 50, y: 60, scale: 0.72 }, { x: 75, y: 60, scale: 0.72 }],
      4: [{ x: 20, y: 60, scale: 0.62 }, { x: 40, y: 60, scale: 0.62 }, { x: 60, y: 60, scale: 0.62 }, { x: 80, y: 60, scale: 0.62 }],
      5: [{ x: 17, y: 60, scale: 0.55 }, { x: 33, y: 60, scale: 0.55 }, { x: 50, y: 60, scale: 0.55 }, { x: 67, y: 60, scale: 0.55 }, { x: 83, y: 60, scale: 0.55 }],
      6: [{ x: 15, y: 60, scale: 0.5 }, { x: 29, y: 60, scale: 0.5 }, { x: 43, y: 60, scale: 0.5 }, { x: 57, y: 60, scale: 0.5 }, { x: 71, y: 60, scale: 0.5 }, { x: 85, y: 60, scale: 0.5 }],
    },
    fonts: [
      { id: 'speels', label: 'Speels', family: 'var(--font-display)', weight: 700, sizeFactor: 1 },
      { id: 'klassiek', label: 'Klassiek', family: 'var(--font-serif)', weight: 400, sizeFactor: 1.05 },
      { id: 'handgeschreven', label: 'Handgeschreven', family: 'var(--font-script)', weight: 700, sizeFactor: 1.3 },
    ],
  },

  // Bench layout example: 3 seats, 2 people sit centered, 3 people spread.
  // This proves a non-row layout works with the same system.
  bench: {
    id: 'bench',
    name: 'Bankje Portret',
    colors: [
      { id: 'wit', label: 'Wit', hex: '#FFFFFF', ink: '#2A1C14', top: '#E25F0C' },
      { id: 'creme', label: 'Crème', hex: '#F3E3CB', ink: '#2A1C14', top: '#C2490A' },
    ],
    printArea: { x: 20, y: 20, width: 60, height: 60 },
    maxPeople: 3,
    prices: { 1: 32.95, 2: 34.95, 3: 34.95 },
    layout: {
      1: [{ x: 50, y: 65, scale: 1 }],
      2: [{ x: 38, y: 65, scale: 0.85 }, { x: 62, y: 65, scale: 0.85 }],
      3: [{ x: 25, y: 65, scale: 0.72 }, { x: 50, y: 65, scale: 0.72 }, { x: 75, y: 65, scale: 0.72 }],
    },
    fonts: [
      { id: 'speels', label: 'Speels', family: 'var(--font-display)', weight: 700, sizeFactor: 1 },
      { id: 'klassiek', label: 'Klassiek', family: 'var(--font-serif)', weight: 400, sizeFactor: 1.05 },
      { id: 'handgeschreven', label: 'Handgeschreven', family: 'var(--font-script)', weight: 700, sizeFactor: 1.3 },
    ],
  },
}

export function getProduct(id: string): ProductConfig | undefined {
  return products[id]
}

export function getProductColor(product: ProductConfig, colorId: string): ProductColor {
  return product.colors.find((c) => c.id === colorId) ?? product.colors[0]
}

export function getPrice(product: ProductConfig, peopleCount: number): number {
  return product.prices[peopleCount] ?? product.prices[product.maxPeople] ?? 0
}

export function getLayoutSlots(product: ProductConfig, peopleCount: number): LayoutSlot[] {
  const count = Math.min(peopleCount, product.maxPeople)
  return product.layout[count] ?? product.layout[1] ?? [{ x: 50, y: 60, scale: 1 }]
}

export function getFont(product: ProductConfig, fontId: string): FontOption {
  return product.fonts.find((f) => f.id === fontId) ?? product.fonts[0]
}

export const personTypeFactors: Record<string, number> = {
  adult: 1,
  teen: 0.9,
  child: 0.78,
  baby: 0.64,
}

export const personTypeLabels: Record<string, string> = {
  adult: 'Volwassene',
  teen: 'Tiener',
  child: 'Kind',
  baby: 'Baby',
}

export const personTypes = ['adult', 'teen', 'child', 'baby'] as const
