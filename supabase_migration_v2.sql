-- Supabase Schema Migration: Portfolio Link Tracker v2

-- 1. Upgrade `visits` table for Source Attribution and Engagement Geography
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'organic',
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. Create `outreach_logs` table
CREATE TABLE IF NOT EXISTS outreach_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    action_type TEXT NOT NULL,
    contact_name TEXT,
    notes TEXT,
    action_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (if needed, though we use SERVICE_ROLE for admin/API operations)
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to service role pattern (optional, usually bypassed automatically by service key)
CREATE POLICY "Enable read access for all to outreach_logs" ON outreach_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for service role" ON outreach_logs FOR INSERT WITH CHECK (true);
