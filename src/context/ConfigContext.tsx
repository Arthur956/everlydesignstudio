import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { products as fallbackProducts, type ProductConfig } from '../config/products'
import { clipartManifest as fallbackManifest, type ClipartManifest, type ClipartHairStyle, type ClipartLayer } from '../config/clipart'

interface ConfigContextValue {
  products: Record<string, ProductConfig>
  clipart: ClipartManifest
  loading: boolean
  reload: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined)

interface ProductRow {
  id: string
  name: string
  config: Record<string, unknown>
  sort_order: number
  active: boolean
}

interface SkinColorRow { id: string; label: string; hex: string; sort_order: number }
interface HairColorRow { id: string; label: string; hex: string; sort_order: number }
interface HairStyleRow { id: string; label: string; sort_order: number }
interface HairLayerRow { id: number; hair_style_id: string; layer_id: string; position: string; src: string; tintable: boolean; sort_order: number }

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Record<string, ProductConfig>>(fallbackProducts)
  const [clipart, setClipart] = useState<ClipartManifest>(fallbackManifest)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [productsRes, skinRes, hairColorRes, hairStyleRes, hairLayerRes] = await Promise.all([
        supabase.from('products').select('*').eq('active', true).order('sort_order'),
        supabase.from('clipart_skin_colors').select('*').order('sort_order'),
        supabase.from('clipart_hair_colors').select('*').order('sort_order'),
        supabase.from('clipart_hair_styles').select('*').order('sort_order'),
        supabase.from('clipart_hair_layers').select('*').order('sort_order'),
      ])

      if (productsRes.data && productsRes.data.length > 0) {
        const productMap: Record<string, ProductConfig> = {}
        for (const row of productsRes.data as ProductRow[]) {
          const cfg = row.config as unknown as ProductConfig
          productMap[row.id] = { ...cfg, id: row.id, name: row.name }
        }
        setProducts(productMap)
      }

      const skinColors = (skinRes.data ?? []) as SkinColorRow[]
      const hairColors = (hairColorRes.data ?? []) as HairColorRow[]
      const hairStyles = (hairStyleRes.data ?? []) as HairStyleRow[]
      const hairLayers = (hairLayerRes.data ?? []) as HairLayerRow[]

      if (skinColors.length > 0 || hairColors.length > 0 || hairStyles.length > 0) {
        const styles: ClipartHairStyle[] = hairStyles.map((hs) => {
          const layers = hairLayers.filter((l) => l.hair_style_id === hs.id)
          return {
            id: hs.id,
            label: hs.label,
            back: layers
              .filter((l) => l.position === 'back')
              .map((l): ClipartLayer => ({ id: l.layer_id, src: l.src, tintable: l.tintable })),
            front: layers
              .filter((l) => l.position === 'front')
              .map((l): ClipartLayer => ({ id: l.layer_id, src: l.src, tintable: l.tintable })),
          }
        })

        setClipart({
          skinColors: skinColors.length > 0 ? skinColors.map((c) => ({ id: c.id, label: c.label, hex: c.hex })) : fallbackManifest.skinColors,
          hairColors: hairColors.length > 0 ? hairColors.map((c) => ({ id: c.id, label: c.label, hex: c.hex })) : fallbackManifest.hairColors,
          hairStyles: styles.length > 0 ? styles : fallbackManifest.hairStyles,
        })
      }
    } catch {
      // Fall back to hardcoded config on any error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <ConfigContext.Provider value={{ products, clipart, loading, reload: load }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
