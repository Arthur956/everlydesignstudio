export interface ClipartLayer {
  id: string
  src: string
  tintable?: boolean
}

export interface ClipartHairStyle {
  id: string
  label: string
  back: ClipartLayer[]
  front: ClipartLayer[]
}

export interface ClipartColorOption {
  id: string
  label: string
  hex: string
}

export interface ClipartManifest {
  skinColors: ClipartColorOption[]
  hairColors: ClipartColorOption[]
  hairStyles: ClipartHairStyle[]
}

// Fallback used when DB is unavailable. Also used as default by ConfigContext.
export const fallbackManifest: ClipartManifest = {
  skinColors: [
    { id: '0', label: 'Huidskleur 1', hex: '#F6D9C4' },
    { id: '1', label: 'Huidskleur 2', hex: '#F2CDB0' },
    { id: '2', label: 'Huidskleur 3', hex: '#D9A27E' },
    { id: '3', label: 'Huidskleur 4', hex: '#B07850' },
    { id: '4', label: 'Huidskleur 5', hex: '#8C5A3C' },
    { id: '5', label: 'Huidskleur 6', hex: '#5E3B26' },
  ],
  hairColors: [
    { id: 'zwart', label: 'Zwart', hex: '#2A1C14' },
    { id: 'bruin', label: 'Bruin', hex: '#6B4226' },
    { id: 'blond', label: 'Blond', hex: '#E3B65B' },
    { id: 'rood', label: 'Rood', hex: '#B5532A' },
    { id: 'grijs', label: 'Grijs', hex: '#B9B3AC' },
  ],
  hairStyles: [
    { id: 'kort', label: 'Kort', back: [], front: [{ id: 'kort-front', src: 'placeholder: kort-front', tintable: true }] },
    { id: 'lang', label: 'Lang', back: [{ id: 'lang-back', src: 'placeholder: lang-back', tintable: true }], front: [{ id: 'lang-front', src: 'placeholder: lang-front', tintable: true }] },
    { id: 'krullen', label: 'Krullen', back: [], front: [{ id: 'krullen-front', src: 'placeholder: krullen-front', tintable: true }] },
    { id: 'staartjes', label: 'Staartjes', back: [{ id: 'staartjes-back-l', src: 'placeholder: staartjes-back-l', tintable: true }, { id: 'staartjes-back-r', src: 'placeholder: staartjes-back-r', tintable: true }], front: [{ id: 'staartjes-front', src: 'placeholder: staartjes-front', tintable: true }] },
    { id: 'knot', label: 'Knot', back: [{ id: 'knot-back', src: 'placeholder: knot-back', tintable: true }], front: [{ id: 'knot-front', src: 'placeholder: knot-front', tintable: true }] },
    { id: 'kaal', label: 'Kaal', back: [], front: [] },
  ],
}

// Keep backward-compatible export name
export const clipartManifest = fallbackManifest

// Stateless helpers that take a manifest
export function getSkinColorFromManifest(manifest: ClipartManifest, id: string): ClipartColorOption | undefined {
  return manifest.skinColors.find((c) => c.id === id)
}

export function getHairColorFromManifest(manifest: ClipartManifest, id: string): ClipartColorOption | undefined {
  return manifest.hairColors.find((c) => c.id === id)
}

export function getHairStyleFromManifest(manifest: ClipartManifest, id: string): ClipartHairStyle | undefined {
  return manifest.hairStyles.find((h) => h.id === id)
}

// Legacy helpers (use fallback manifest)
export function getSkinColor(id: string): ClipartColorOption | undefined {
  return fallbackManifest.skinColors.find((c) => c.id === id)
}

export function getHairColor(id: string): ClipartColorOption | undefined {
  return fallbackManifest.hairColors.find((c) => c.id === id)
}

export function getHairStyle(id: string): ClipartHairStyle | undefined {
  return fallbackManifest.hairStyles.find((h) => h.id === id)
}
