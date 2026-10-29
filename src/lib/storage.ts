import type { Design } from '../types'

const STORAGE_KEY = 'everly-design'

export function saveToLocalStorage(design: Design): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(design))
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

export function loadFromLocalStorage(): Design | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Design
  } catch {
    return null
  }
}
