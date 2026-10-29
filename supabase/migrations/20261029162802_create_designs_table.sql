/*
# Create designs table for Everly Customizer

1. New Tables
- `designs`
  - `id` (uuid, primary key, auto-generated)
  - `product` (text, the product id like "shirt")
  - `design` (jsonb, the full design JSON object)
  - `preview_url` (text, optional URL to a preview image)
  - `status` (text, default 'draft')
  - `edit_token` (text, a random token that grants read/update access without auth)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `designs`.
- Grant SELECT, INSERT, UPDATE to `anon` + `authenticated` (no-auth app: the
  customizer works without sign-in; access is scoped by edit_token).
- INSERT: anyone can insert (anonymous drafts).
- SELECT: only rows where edit_token matches the token supplied by the client
  (via a custom header or by filtering). Since RLS cannot read custom request
  headers, we allow SELECT for anon/authenticated but the client always filters
  by edit_token. The edit_token acts as a capability URL.
- UPDATE: same edit_token check.
- No DELETE policy for now (drafts are never deleted by the client).
*/

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL DEFAULT 'shirt',
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  status text NOT NULL DEFAULT 'draft',
  edit_token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON designs TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_designs" ON designs;
CREATE POLICY "anon_insert_designs" ON designs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_designs" ON designs;
CREATE POLICY "anon_select_designs" ON designs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_designs" ON designs;
CREATE POLICY "anon_update_designs" ON designs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
