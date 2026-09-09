-- ============================================================
-- QODILY-DZ — Supabase Migration
-- Run this in the Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- ENUMS
CREATE TYPE locale AS ENUM ('en', 'fr', 'ar');
CREATE TYPE project_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'PUBLISHED');
CREATE TYPE article_category AS ENUM ('TECHNOLOGY', 'SOFTWARE', 'BUSINESS', 'DESIGN', 'MARKETING', 'DIGITAL_TRANSFORMATION');
CREATE TYPE article_status AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE contact_status AS ENUM ('NEW', 'CONTACTED', 'IN_DISCUSSION', 'CLOSED');
CREATE TYPE admin_role AS ENUM ('ADMIN', 'EDITOR');

-- ============================================================
-- 1. admin_users
-- ============================================================
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'EDITOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. site_config (singleton)
-- ============================================================
CREATE TABLE site_config (
  id INT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Qodily',
  legal_name TEXT NOT NULL DEFAULT 'Qodily-dz',
  tagline TEXT NOT NULL DEFAULT 'From idea to impact.',
  positioning TEXT NOT NULL DEFAULT 'Build. Design. Grow.',
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT 'https://qodily.dz',
  email TEXT NOT NULL DEFAULT 'hello@qodily.dz',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  address_city TEXT NOT NULL DEFAULT 'Algiers',
  address_country TEXT NOT NULL DEFAULT 'Algeria',
  default_language locale NOT NULL DEFAULT 'en',
  social JSONB NOT NULL DEFAULT '{}',
  seo_keywords JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (id = 1)
);

-- ============================================================
-- 3. projects
-- ============================================================
CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  design TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  accent_a TEXT NOT NULL DEFAULT '#2b6cb5',
  accent_b TEXT NOT NULL DEFAULT '#5fa3e0',
  span TEXT NOT NULL DEFAULT 'md:col-span-7',
  client TEXT,
  status project_status NOT NULL DEFAULT 'DRAFT',
  featured BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. project_translations
-- ============================================================
CREATE TABLE project_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  design TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  UNIQUE(project_id, locale)
);

-- ============================================================
-- 5. project_technologies
-- ============================================================
CREATE TABLE project_technologies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology TEXT NOT NULL
);

-- ============================================================
-- 6. articles
-- ============================================================
CREATE TABLE articles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  category article_category NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_time TEXT NOT NULL DEFAULT '5 min read',
  status article_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. article_translations
-- ============================================================
CREATE TABLE article_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body JSONB NOT NULL DEFAULT '[]',
  keywords JSONB NOT NULL DEFAULT '[]',
  UNIQUE(article_id, locale)
);

-- ============================================================
-- 8. pillars
-- ============================================================
CREATE TABLE pillars (
  id TEXT PRIMARY KEY,
  index TEXT NOT NULL DEFAULT '01',
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 9. pillar_translations
-- ============================================================
CREATE TABLE pillar_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pillar_id TEXT NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  label TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  lede TEXT NOT NULL DEFAULT '',
  UNIQUE(pillar_id, locale)
);

-- ============================================================
-- 10. services
-- ============================================================
CREATE TABLE services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pillar_id TEXT NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 11. service_translations
-- ============================================================
CREATE TABLE service_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(service_id, locale)
);

-- ============================================================
-- 12. contact_requests
-- ============================================================
CREATE TABLE contact_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  build TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT '',
  needs JSONB NOT NULL DEFAULT '[]',
  budget TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  message TEXT,
  status contact_status NOT NULL DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. engineering_nodes
-- ============================================================
CREATE TABLE engineering_nodes (
  id TEXT PRIMARY KEY,
  glyph TEXT NOT NULL,
  pos_x FLOAT NOT NULL DEFAULT 0,
  pos_y FLOAT NOT NULL DEFAULT 0,
  pos_z FLOAT NOT NULL DEFAULT 0,
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 14. engineering_node_translations
-- ============================================================
CREATE TABLE engineering_node_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  node_id TEXT NOT NULL REFERENCES engineering_nodes(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '[]',
  UNIQUE(node_id, locale)
);

-- ============================================================
-- 15. process_stages
-- ============================================================
CREATE TABLE process_stages (
  id TEXT PRIMARY KEY,
  num TEXT NOT NULL DEFAULT '01',
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 16. process_stage_translations
-- ============================================================
CREATE TABLE process_stage_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stage_id TEXT NOT NULL REFERENCES process_stages(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  what_we_do JSONB NOT NULL DEFAULT '[]',
  deliverables JSONB NOT NULL DEFAULT '[]',
  technologies JSONB NOT NULL DEFAULT '[]',
  UNIQUE(stage_id, locale)
);

-- ============================================================
-- 17. growth_stages
-- ============================================================
CREATE TABLE growth_stages (
  id TEXT PRIMARY KEY,
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 18. growth_stage_translations
-- ============================================================
CREATE TABLE growth_stage_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stage_id TEXT NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  label TEXT NOT NULL,
  UNIQUE(stage_id, locale)
);

-- ============================================================
-- 19. growth_services
-- ============================================================
CREATE TABLE growth_services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- 20. growth_service_stages (M:N junction)
-- ============================================================
CREATE TABLE growth_service_stages (
  service_id TEXT NOT NULL REFERENCES growth_services(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL REFERENCES growth_stages(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, stage_id)
);

-- ============================================================
-- 21. lab_experiments
-- ============================================================
CREATE TABLE lab_experiments (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active'
);

-- ============================================================
-- 22. lab_experiment_translations
-- ============================================================
CREATE TABLE lab_experiment_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  experiment_id TEXT NOT NULL REFERENCES lab_experiments(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  UNIQUE(experiment_id, locale)
);

-- ============================================================
-- 23. navigation_items
-- ============================================================
CREATE TABLE navigation_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'header',
  visible BOOLEAN NOT NULL DEFAULT true,
  "order" INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 24. seo_settings
-- ============================================================
CREATE TABLE seo_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_path TEXT NOT NULL,
  locale locale NOT NULL,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_image TEXT,
  UNIQUE(page_path, locale)
);

-- ============================================================
-- 25. media
-- ============================================================
CREATE TABLE media (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INT NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  uploaded_by TEXT REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_project_translations_project_id ON project_translations(project_id);
CREATE INDEX idx_project_technologies_project_id ON project_technologies(project_id);
CREATE INDEX idx_article_translations_article_id ON article_translations(article_id);
CREATE INDEX idx_services_pillar_id ON services(pillar_id);
CREATE INDEX idx_service_translations_service_id ON service_translations(service_id);
CREATE INDEX idx_pillar_translations_pillar_id ON pillar_translations(pillar_id);
CREATE INDEX idx_engineering_node_translations_node_id ON engineering_node_translations(node_id);
CREATE INDEX idx_process_stage_translations_stage_id ON process_stage_translations(stage_id);
CREATE INDEX idx_growth_stage_translations_stage_id ON growth_stage_translations(stage_id);
CREATE INDEX idx_growth_service_stages_service_id ON growth_service_stages(service_id);
CREATE INDEX idx_growth_service_stages_stage_id ON growth_service_stages(stage_id);
CREATE INDEX idx_lab_experiment_translations_experiment_id ON lab_experiment_translations(experiment_id);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_order ON projects("order");
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_date ON articles(date DESC);
CREATE INDEX idx_seo_settings_page_path ON seo_settings(page_path);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_node_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stage_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_stage_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_service_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_experiment_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables (anon key)
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public read project_translations" ON project_translations FOR SELECT USING (true);
CREATE POLICY "Public read project_technologies" ON project_technologies FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public read article_translations" ON article_translations FOR SELECT USING (true);
CREATE POLICY "Public read pillars" ON pillars FOR SELECT USING (true);
CREATE POLICY "Public read pillar_translations" ON pillar_translations FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read service_translations" ON service_translations FOR SELECT USING (true);
CREATE POLICY "Public read engineering_nodes" ON engineering_nodes FOR SELECT USING (true);
CREATE POLICY "Public read engineering_node_translations" ON engineering_node_translations FOR SELECT USING (true);
CREATE POLICY "Public read process_stages" ON process_stages FOR SELECT USING (true);
CREATE POLICY "Public read process_stage_translations" ON process_stage_translations FOR SELECT USING (true);
CREATE POLICY "Public read growth_stages" ON growth_stages FOR SELECT USING (true);
CREATE POLICY "Public read growth_stage_translations" ON growth_stage_translations FOR SELECT USING (true);
CREATE POLICY "Public read growth_services" ON growth_services FOR SELECT USING (true);
CREATE POLICY "Public read growth_service_stages" ON growth_service_stages FOR SELECT USING (true);
CREATE POLICY "Public read lab_experiments" ON lab_experiments FOR SELECT USING (true);
CREATE POLICY "Public read lab_experiment_translations" ON lab_experiment_translations FOR SELECT USING (true);
CREATE POLICY "Public read navigation_items" ON navigation_items FOR SELECT USING (visible = true);
CREATE POLICY "Public read seo_settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);

-- Contact insert (anyone can submit)
CREATE POLICY "Anyone can submit contact" ON contact_requests FOR INSERT WITH CHECK (true);

-- Service role bypass (the Express backend uses service_role key)
-- Service role bypasses RLS automatically, so admin routes have full access.
