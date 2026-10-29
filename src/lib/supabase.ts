import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export interface DesignRow {
  id: string
  product: string
  design: Record<string, unknown>
  preview_url: string | null
  status: string
  edit_token: string
  created_at: string
  updated_at: string
}
