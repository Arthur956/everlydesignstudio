/*
# Create admin tables: products, clipart_skin_colors, clipart_hair_colors, clipart_hair_styles, clipart_hair_layers

1. New Tables
- `products` — product definitions stored as JSON config
- `clipart_skin_colors` — skin color swatches
- `clipart_hair_colors` — hair color swatches
- `clipart_hair_styles` — hair style definitions
- `clipart_hair_layers` — layers belonging to hair styles (FK cascade delete)

2. Security
- RLS enabled on all tables.
- Public read (anon + authenticated) so customizer loads without login.
- Write only for authenticated users (admin).

3. Seed data
- Existing product configs (shirt, bench), skin colors (6), hair colors (5), hair styles (6), layers.
*/

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS clipart_skin_colors (
  id text PRIMARY KEY,
  label text NOT NULL,
  hex text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE clipart_skin_colors ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON clipart_skin_colors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON clipart_skin_colors TO authenticated;

DROP POLICY IF EXISTS "public_read_skin_colors" ON clipart_skin_colors;
CREATE POLICY "public_read_skin_colors" ON clipart_skin_colors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_skin_colors" ON clipart_skin_colors;
CREATE POLICY "auth_insert_skin_colors" ON clipart_skin_colors FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_skin_colors" ON clipart_skin_colors;
CREATE POLICY "auth_update_skin_colors" ON clipart_skin_colors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_skin_colors" ON clipart_skin_colors;
CREATE POLICY "auth_delete_skin_colors" ON clipart_skin_colors FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS clipart_hair_colors (
  id text PRIMARY KEY,
  label text NOT NULL,
  hex text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE clipart_hair_colors ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON clipart_hair_colors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON clipart_hair_colors TO authenticated;

DROP POLICY IF EXISTS "public_read_hair_colors" ON clipart_hair_colors;
CREATE POLICY "public_read_hair_colors" ON clipart_hair_colors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hair_colors" ON clipart_hair_colors;
CREATE POLICY "auth_insert_hair_colors" ON clipart_hair_colors FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hair_colors" ON clipart_hair_colors;
CREATE POLICY "auth_update_hair_colors" ON clipart_hair_colors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hair_colors" ON clipart_hair_colors;
CREATE POLICY "auth_delete_hair_colors" ON clipart_hair_colors FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS clipart_hair_styles (
  id text PRIMARY KEY,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE clipart_hair_styles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON clipart_hair_styles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON clipart_hair_styles TO authenticated;

DROP POLICY IF EXISTS "public_read_hair_styles" ON clipart_hair_styles;
CREATE POLICY "public_read_hair_styles" ON clipart_hair_styles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hair_styles" ON clipart_hair_styles;
CREATE POLICY "auth_insert_hair_styles" ON clipart_hair_styles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hair_styles" ON clipart_hair_styles;
CREATE POLICY "auth_update_hair_styles" ON clipart_hair_styles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hair_styles" ON clipart_hair_styles;
CREATE POLICY "auth_delete_hair_styles" ON clipart_hair_styles FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS clipart_hair_layers (
  id serial PRIMARY KEY,
  hair_style_id text NOT NULL REFERENCES clipart_hair_styles(id) ON DELETE CASCADE,
  layer_id text NOT NULL,
  position text NOT NULL DEFAULT 'front',
  src text NOT NULL DEFAULT '',
  tintable boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE clipart_hair_layers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON clipart_hair_layers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON clipart_hair_layers TO authenticated;

DROP POLICY IF EXISTS "public_read_hair_layers" ON clipart_hair_layers;
CREATE POLICY "public_read_hair_layers" ON clipart_hair_layers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hair_layers" ON clipart_hair_layers;
CREATE POLICY "auth_insert_hair_layers" ON clipart_hair_layers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hair_layers" ON clipart_hair_layers;
CREATE POLICY "auth_update_hair_layers" ON clipart_hair_layers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hair_layers" ON clipart_hair_layers;
CREATE POLICY "auth_delete_hair_layers" ON clipart_hair_layers FOR DELETE TO authenticated USING (true);

INSERT INTO clipart_skin_colors (id, label, hex, sort_order) VALUES
  ('0', 'Huidskleur 1', '#F6D9C4', 0),
  ('1', 'Huidskleur 2', '#F2CDB0', 1),
  ('2', 'Huidskleur 3', '#D9A27E', 2),
  ('3', 'Huidskleur 4', '#B07850', 3),
  ('4', 'Huidskleur 5', '#8C5A3C', 4),
  ('5', 'Huidskleur 6', '#5E3B26', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clipart_hair_colors (id, label, hex, sort_order) VALUES
  ('zwart', 'Zwart', '#2A1C14', 0),
  ('bruin', 'Bruin', '#6B4226', 1),
  ('blond', 'Blond', '#E3B65B', 2),
  ('rood', 'Rood', '#B5532A', 3),
  ('grijs', 'Grijs', '#B9B3AC', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clipart_hair_styles (id, label, sort_order) VALUES
  ('kort', 'Kort', 0),
  ('lang', 'Lang', 1),
  ('krullen', 'Krullen', 2),
  ('staartjes', 'Staartjes', 3),
  ('knot', 'Knot', 4),
  ('kaal', 'Kaal', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clipart_hair_layers (hair_style_id, layer_id, position, src, tintable, sort_order) VALUES
  ('kort', 'kort-front', 'front', 'placeholder: kort-front', true, 0),
  ('lang', 'lang-back', 'back', 'placeholder: lang-back', true, 0),
  ('lang', 'lang-front', 'front', 'placeholder: lang-front', true, 1),
  ('krullen', 'krullen-front', 'front', 'placeholder: krullen-front', true, 0),
  ('staartjes', 'staartjes-back-l', 'back', 'placeholder: staartjes-back-l', true, 0),
  ('staartjes', 'staartjes-back-r', 'back', 'placeholder: staartjes-back-r', true, 1),
  ('staartjes', 'staartjes-front', 'front', 'placeholder: staartjes-front', true, 2),
  ('knot', 'knot-back', 'back', 'placeholder: knot-back', true, 0),
  ('knot', 'knot-front', 'front', 'placeholder: knot-front', true, 1)
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, config, sort_order, active) VALUES
  ('shirt', 'Gezinsportret T-shirt', '{
    "colors": [
      {"id":"wit","label":"Wit","hex":"#FFFFFF","ink":"#2A1C14","top":"#E25F0C"},
      {"id":"creme","label":"Crème","hex":"#F3E3CB","ink":"#2A1C14","top":"#C2490A"},
      {"id":"perzik","label":"Perzik","hex":"#F7C6A3","ink":"#2A1C14","top":"#2F5D4A"},
      {"id":"dennengroen","label":"Dennengroen","hex":"#2F5D4A","ink":"#FBF7F2","top":"#F5B98F"},
      {"id":"espresso","label":"Espresso","hex":"#2A1C14","ink":"#FBF7F2","top":"#E25F0C"}
    ],
    "printArea": {"x":25,"y":18,"width":50,"height":64},
    "maxPeople": 6,
    "prices": {"1":32.95,"2":34.95,"3":34.95,"4":37.95,"5":37.95,"6":39.95},
    "layout": {
      "1":[{"x":50,"y":60,"scale":1}],
      "2":[{"x":33,"y":60,"scale":0.85},{"x":66,"y":60,"scale":0.85}],
      "3":[{"x":25,"y":60,"scale":0.72},{"x":50,"y":60,"scale":0.72},{"x":75,"y":60,"scale":0.72}],
      "4":[{"x":20,"y":60,"scale":0.62},{"x":40,"y":60,"scale":0.62},{"x":60,"y":60,"scale":0.62},{"x":80,"y":60,"scale":0.62}],
      "5":[{"x":17,"y":60,"scale":0.55},{"x":33,"y":60,"scale":0.55},{"x":50,"y":60,"scale":0.55},{"x":67,"y":60,"scale":0.55},{"x":83,"y":60,"scale":0.55}],
      "6":[{"x":15,"y":60,"scale":0.5},{"x":29,"y":60,"scale":0.5},{"x":43,"y":60,"scale":0.5},{"x":57,"y":60,"scale":0.5},{"x":71,"y":60,"scale":0.5},{"x":85,"y":60,"scale":0.5}]
    },
    "fonts": [
      {"id":"speels","label":"Speels","family":"var(--font-display)","weight":700,"sizeFactor":1},
      {"id":"klassiek","label":"Klassiek","family":"var(--font-serif)","weight":400,"sizeFactor":1.05},
      {"id":"handgeschreven","label":"Handgeschreven","family":"var(--font-script)","weight":700,"sizeFactor":1.3}
    ]
  }'::jsonb, 0, true),
  ('bench', 'Bankje Portret', '{
    "colors": [
      {"id":"wit","label":"Wit","hex":"#FFFFFF","ink":"#2A1C14","top":"#E25F0C"},
      {"id":"creme","label":"Crème","hex":"#F3E3CB","ink":"#2A1C14","top":"#C2490A"}
    ],
    "printArea": {"x":20,"y":20,"width":60,"height":60},
    "maxPeople": 3,
    "prices": {"1":32.95,"2":34.95,"3":34.95},
    "layout": {
      "1":[{"x":50,"y":65,"scale":1}],
      "2":[{"x":38,"y":65,"scale":0.85},{"x":62,"y":65,"scale":0.85}],
      "3":[{"x":25,"y":65,"scale":0.72},{"x":50,"y":65,"scale":0.72},{"x":75,"y":65,"scale":0.72}]
    },
    "fonts": [
      {"id":"speels","label":"Speels","family":"var(--font-display)","weight":700,"sizeFactor":1},
      {"id":"klassiek","label":"Klassiek","family":"var(--font-serif)","weight":400,"sizeFactor":1.05},
      {"id":"handgeschreven","label":"Handgeschreven","family":"var(--font-script)","weight":700,"sizeFactor":1.3}
    ]
  }'::jsonb, 1, true)
ON CONFLICT (id) DO NOTHING;
