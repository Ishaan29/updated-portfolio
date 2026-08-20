-- Per-company resume links: eshaanbajpai.dev/resume/<shortId>
-- Run in the Supabase SQL editor.
-- If you already ran an earlier draft of this migration (UUID ids), reset first:
--   DROP TABLE IF EXISTS resume_views; DROP TABLE IF EXISTS resumes;

-- 1. Resumes — one row per generated link. The row id IS the public short id in
--    the URL (10 chars base62, e.g. 'Xk3f9qT2mA', minted by the app).
--    Deactivating (active = false) or deleting a row makes the URL redirect home.
CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    role TEXT,                                 -- e.g. 'Software Engineer, New Grad'
    storage_path TEXT NOT NULL,                -- object path inside the private 'resumes' bucket
    filename TEXT,                             -- original upload filename, admin display only
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resumes_company ON resumes(company_id);

-- 2. Resume views — one row per open of /resume/<shortId>
CREATE TABLE IF NOT EXISTS resume_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    ip_address TEXT,
    device_type TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    viewed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resume_views_resume ON resume_views(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_views_company ON resume_views(company_id);

-- 3. RLS — service role only, same as the other tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to resumes"
  ON resumes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to resume_views"
  ON resume_views FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Private storage bucket for the PDFs. No public URLs — files are only
--    served through /resume/<shortId>, which uses the service role.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;
