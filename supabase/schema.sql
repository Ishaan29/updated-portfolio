-- Create visits table for tracking company URL visits
create table visits (
  id uuid default gen_random_uuid() primary key,
  company_id text not null,
  visited_at timestamp with time zone default now(),
  user_agent text,
  referrer text,
  ip_address text,
  created_at timestamp with time zone default now()
);

-- Create indexes for faster queries
create index visits_company_id_idx on visits(company_id);
create index visits_visited_at_idx on visits(visited_at desc);

-- Enable Row Level Security
alter table visits enable row level security;

-- Policy: Allow inserts from authenticated service role only
create policy "Allow service role to insert"
  on visits for insert
  to service_role
  with check (true);

-- Policy: Allow reads from authenticated service role only
create policy "Allow service role to read"
  on visits for select
  to service_role
  using (true);

-- Optional: Create a view for analytics
create or replace view visit_analytics as
select 
  company_id,
  count(*) as total_visits,
  max(visited_at) as last_visit,
  min(visited_at) as first_visit,
  count(distinct date_trunc('day', visited_at)) as unique_days
from visits
group by company_id
order by total_visits desc;
