import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase, type DesignRow } from '../lib/supabase'
import type { Design } from '../types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(design: Design, editToken: string | null, designId: string | null) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tokenRef = useRef(editToken)
  const idRef = useRef(designId)

  tokenRef.current = editToken
  idRef.current = designId

  const save = useCallback(async (d: Design, token: string | null, id: string | null): Promise<void> => {
    setStatus('saving')
    try {
      if (id && token) {
        // Update existing design
        const { error } = await supabase
          .from('designs')
          .update({ design: d as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('edit_token', token)
        if (error) throw error
      } else if (token) {
        // Insert new design with a client-generated token
        const { data, error } = await supabase
          .from('designs')
          .insert({
            product: d.product,
            design: d as unknown as Record<string, unknown>,
            edit_token: token,
          })
          .select('id')
          .maybeSingle()
        if (error) throw error
        if (data) {
          idRef.current = data.id
        }
      }
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    // Debounce 1.2s
    timerRef.current = setTimeout(() => {
      void save(design, tokenRef.current, idRef.current)
    }, 1200)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [design, save])

  return { status, save }
}

export { supabase, type DesignRow }
