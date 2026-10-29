import type { Design } from '../types'

// STUB: Shopify cart integration comes later.
// For now, this only saves the design and returns the design id.
// When Shopify is wired in, this function will create a cart line item
// with the design as line item properties and the _preview_url.

export interface CartResult {
  designId: string
  success: boolean
}

export async function addToCart(_design: Design, _shopifyVariantId?: string): Promise<CartResult> {
  // This is a stub — the actual implementation will:
  // 1. Save the design to Supabase (done elsewhere)
  // 2. POST to Shopify /cart/add.js with variant_id + line item properties
  // 3. Redirect to the Shopify cart or return URL
  return { designId: '', success: true }
}
