-- Create visit_events table for tracking detailed interactions
create table visit_events (
  id uuid default gen_random_uuid() primary key,
  visit_id uuid references visits(id) on delete cascade not null,
  event_type text not null, -- e.g., 'click', 'scroll', 'unload'
  event_name text not null, -- e.g., 'resume', 'experience_section'
  metadata jsonb default '{}'::jsonb, -- Additional data like duration, href
  created_at timestamp with time zone default now()
);

-- Create indexes for faster queries
create index visit_events_visit_id_idx on visit_events(visit_id);
create index visit_events_type_idx on visit_events(event_type);

-- Enable Row Level Security
alter table visit_events enable row level security;

-- Policy: Allow inserts from authenticated service role only
create policy "Allow service role to insert events"
  on visit_events for insert
  to service_role
  with check (true);

-- Policy: Allow reads from authenticated service role only
create policy "Allow service role to read events"
  on visit_events for select
  to service_role
  using (true);
