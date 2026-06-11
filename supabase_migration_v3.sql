-- 1. Per-section dwell time IN SECONDS (currently tracking only "viewed" boolean)
-- Already collected via heartbeat events; let's give it a dedicated table for fast queries.
CREATE TABLE IF NOT EXISTS section_dwell (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    section TEXT NOT NULL,                                -- 'About' | 'Experience' | …
    seconds INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (visit_id, section)
);
CREATE INDEX IF NOT EXISTS idx_section_dwell_visit ON section_dwell(visit_id);

-- 2. Click path — ordered list of internal/outbound clicks within a session
CREATE TABLE IF NOT EXISTS click_path (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,                                 -- 0,1,2…
    target TEXT NOT NULL,                                 -- '#experience' | 'github.com/…' | 'resume.pdf'
    kind TEXT NOT NULL,                                   -- 'section' | 'outbound' | 'download' | 'form'
    at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_click_path_visit ON click_path(visit_id, seq);

-- 3. Pipeline stage cache per company (derived from outreach_logs but materialized for fast funnel queries)
ALTER TABLE outreach_logs
  ADD COLUMN IF NOT EXISTS stage TEXT;   -- 'replied'|'screen'|'onsite'|'offer'|'rejected'|'ghosted'

-- 4. Backfill section_dwell from the raw events already captured in visit_events
INSERT INTO section_dwell (visit_id, section, seconds)
SELECT visit_id, event_name, SUM(COALESCE((metadata->>'seconds')::int, 0))
FROM visit_events
WHERE event_type = 'section_dwell'
GROUP BY visit_id, event_name
ON CONFLICT (visit_id, section)
DO UPDATE SET seconds = EXCLUDED.seconds, updated_at = now();
