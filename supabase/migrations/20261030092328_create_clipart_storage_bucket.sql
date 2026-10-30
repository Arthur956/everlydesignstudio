/*
# Create clipart storage bucket

1. Storage
- Create a public bucket `clipart` for storing hair style layer images (transparent PNGs).
- Set public = true so the customizer can load images without auth.
2. Security (RLS on storage.objects)
- Allow anyone (anon + authenticated) to READ from the clipart bucket — the customizer needs images without login.
- Allow only authenticated users to WRITE (upload/update/delete) to the clipart bucket — admin only.
3. Notes
- Bucket is public-read, authenticated-write. This matches the existing RLS pattern on the clipart tables.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('clipart', 'clipart', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for clipart bucket
DROP POLICY IF EXISTS "anon_read_clipart_bucket" ON storage.objects;
CREATE POLICY "anon_read_clipart_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'clipart');

-- Authenticated write for clipart bucket
DROP POLICY IF EXISTS "auth_insert_clipart_bucket" ON storage.objects;
CREATE POLICY "auth_insert_clipart_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clipart');

DROP POLICY IF EXISTS "auth_update_clipart_bucket" ON storage.objects;
CREATE POLICY "auth_update_clipart_bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'clipart')
  WITH CHECK (bucket_id = 'clipart');

DROP POLICY IF EXISTS "auth_delete_clipart_bucket" ON storage.objects;
CREATE POLICY "auth_delete_clipart_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'clipart');
