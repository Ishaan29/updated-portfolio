-- Project short links: eshaanbajpai.dev/project/<slug> → GitHub (or any target URL)
-- Run in the Supabase SQL editor.

-- 1. Project links — one row per shareable project URL.
--    The slug is the path segment after /project/. Deactivating or deleting a
--    row makes the URL redirect to the home page instead.
CREATE TABLE IF NOT EXISTS project_links (
    slug TEXT PRIMARY KEY,                     -- 'vectorDB' — case preserved for display
    target_url TEXT NOT NULL,                  -- where the visitor lands
    title TEXT,                                -- 'Distributed Vector Database'
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Slugs resolve case-insensitively, so /vectordb and /vectorDB are the same
-- link. This index also stops two rows differing only by case.
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_links_slug_lower
    ON project_links (lower(slug));

-- 2. Project clicks — one row per open of /<slug>
CREATE TABLE IF NOT EXISTS project_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES project_links(slug) ON DELETE CASCADE,
    company_id TEXT,                           -- from ?c=<company>, when present
    user_agent TEXT,
    referrer TEXT,
    ip_address TEXT,
    device_type TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    clicked_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_clicks_slug ON project_clicks(slug);
CREATE INDEX IF NOT EXISTS idx_project_clicks_company ON project_clicks(company_id);

-- 3. RLS — service role only, same as the other tables
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to project_links"
  ON project_links FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to project_clicks"
  ON project_clicks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Seed the projects already listed in src/lib/constants.ts
INSERT INTO project_links (slug, target_url, title) VALUES
    ('vectordb',   'https://github.com/Ishaan29/vectorDB',           'Distributed Vector Database'),
    ('terpspark',  'https://github.com/Ishaan29/terpspark-backend',  'TerpSpark Backend'),
    ('eks',        'https://github.com/Ishaan29/eks-microservices',  'EKS Microservices'),
    ('otel',       'https://github.com/Ishaan29/opentelemetry-demo', 'Otel Telemetry Platform'),
    ('LLMrouter',  'https://github.com/Ishaan29/superuser',          'LLM Router')
ON CONFLICT (slug) DO NOTHING;
