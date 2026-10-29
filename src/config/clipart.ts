export interface ClipartLayer {
  id: string
  /** path to the image file; for placeholders we use inline SVG data URIs built at runtime */
  src: string
  /** whether this layer is tintable (grey base for hair color application) */
  tintable?: boolean
}

export interface ClipartHairStyle {
  id: string
  label: string
  /** back layers (rendered behind the head) */
  back: ClipartLayer[]
  /** front layers (rendered in front of the head) */
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

// All hex colors are greyscale bases (#888) so CSS filters can tint them.
// The structure mirrors what a real /public/clipart/manifest.json would look like.
// When real clipart is dropped in, only the src paths change — no component changes.

export const clipartManifest: ClipartManifest = {
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
    {
      id: 'kort',
      label: 'Kort',
      back: [],
      front: [{ id: 'kort-front', src: 'placeholder: kort-front', tintable: true }],
    },
    {
      id: 'lang',
      label: 'Lang',
      back: [{ id: 'lang-back', src: 'placeholder: lang-back', tintable: true }],
      front: [{ id: 'lang-front', src: 'placeholder: lang-front', tintable: true }],
    },
    {
      id: 'krullen',
      label: 'Krullen',
      back: [],
      front: [{ id: 'krullen-front', src: 'placeholder: krullen-front', tintable: true }],
    },
    {
      id: 'staartjes',
      label: 'Staartjes',
      back: [
        { id: 'staartjes-back-l', src: 'placeholder: staartjes-back-l', tintable: true },
        { id: 'staartjes-back-r', src: 'placeholder: staartjes-back-r', tintable: true },
      ],
      front: [{ id: 'staartjes-front', src: 'placeholder: staartjes-front', tintable: true }],
    },
    {
      id: 'knot',
      label: 'Knot',
      back: [{ id: 'knot-back', src: 'placeholder: knot-back', tintable: true }],
      front: [{ id: 'knot-front', src: 'placeholder: knot-front', tintable: true }],
    },
    {
      id: 'kaal',
      label: 'Kaal',
      back: [],
      front: [],
    },
  ],
}

// Lookup helpers
export function getSkinColor(id: string): ClipartColorOption | undefined {
  return clipartManifest.skinColors.find((c) => c.id === id)
}

export function getHairColor(id: string): ClipartColorOption | undefined {
  return clipartManifest.hairColors.find((c) => c.id === id)
}

export function getHairStyle(id: string): ClipartHairStyle | undefined {
  return clipartManifest.hairStyles.find((h) => h.id === id)
}
