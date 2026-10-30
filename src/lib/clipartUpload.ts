import { supabase } from './supabase'

const BUCKET = 'clipart'

export async function uploadClipart(file: File, pathPrefix: string): Promise<{ url: string; error: string | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    contentType: file.type || 'image/png',
    upsert: false,
  })

  if (error) return { url: '', error: error.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return { url: data.publicUrl, error: null }
}

export async function deleteClipart(url: string): Promise<{ error: string | null }> {
  try {
    const u = new URL(url)
    const parts = u.pathname.split(`/${BUCKET}/`)
    if (parts.length < 2) return { error: null }
    const path = parts[1]
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    return { error: error?.message ?? null }
  } catch {
    return { error: null }
  }
}
