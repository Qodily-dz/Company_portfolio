-- ============================================================
-- QODILY-DZ — Additive migration (idempotent, safe to re-run)
-- Adds:
--   1. Project case study: explicit architecture + product gallery
--   2. Service packs (fixed-price client plans)
-- ============================================================

-- ── 1. Projects — case study enrichment ─────────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]';
ALTER TABLE project_translations ADD COLUMN IF NOT EXISTS architecture TEXT NOT NULL DEFAULT '';

-- ── 2. Service packs (plans) ───────────────────────────
CREATE TABLE IF NOT EXISTS service_packs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  price NUMERIC,
  price_label TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT '$',
  period TEXT NOT NULL DEFAULT 'one-off',
  featured BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_pack_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pack_id TEXT NOT NULL REFERENCES service_packs(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  deliverables JSONB NOT NULL DEFAULT '[]',
  UNIQUE(pack_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_service_pack_translations_pack_id ON service_pack_translations(pack_id);
CREATE INDEX IF NOT EXISTS idx_service_packs_order ON service_packs("order");

ALTER TABLE service_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pack_translations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_packs' AND policyname = 'Public read service_packs') THEN
    CREATE POLICY "Public read service_packs" ON service_packs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_pack_translations' AND policyname = 'Public read service_pack_translations') THEN
    CREATE POLICY "Public read service_pack_translations" ON service_pack_translations FOR SELECT USING (true);
  END IF;
END $$;