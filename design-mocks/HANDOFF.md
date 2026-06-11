# Antigravity Handoff: Port /admin/visits mock → Ishaan29/updated-portfolio

You are working in the **`Ishaan29/updated-portfolio`** repo (Next.js 16 + TypeScript + Tailwind 4 + Supabase + Recharts).

This doc maps every piece of the operator-console dashboard mock in `admin/visits/` of the **design project** to a precise location in the **live repo**. Read it end-to-end before starting.

The mock is HTML+JSX (via Babel) running off seeded data. The live repo is Next.js with real Supabase. Most of the **backend is already done** — your job is mostly UI + a few new metrics.

---

## 0. Two reference projects

| Project                | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `Ishaan29/updated-portfolio` | The live site you're modifying                |
| (this design project)        | Reference mock — read but don't deploy from   |

Open the design project's `admin/visits/` folder in a viewer alongside the live repo. Every visual decision is captured there.

---

## 1. What the live repo already has (don't rebuild)

✅ Tracking grammar `/c/{channel}-{company}` at `src/app/c/[slug]/page.tsx`
✅ Legacy `/{company}` at `src/app/[company]/page.tsx` — **keep working, treat as `organic` channel**
✅ Supabase tables `visits`, `visit_events`, `outreach_logs` (see `supabase_migration_v2.sql`)
✅ `POST /api/track` — logs visit + IP + geo + device
✅ `POST /api/track/event` — logs sectional/engagement events
✅ `GET /api/visits` — returns aggregated leads with heat scores
✅ `POST /api/outreach` — log manual outreach
✅ `src/lib/tracking.ts` — client hooks: `useTimeTracking`, `useSectionTracking`, `useEngagementTracking`, `trackCtaClick`
✅ Heat score formula (recency 35 + frequency 25 + engagement 25 + depth 15) in `api/visits/route.ts::calculateHeatScore`
✅ Engaged = >30s AND ≥25% scroll
✅ Admin gate via `ADMIN_ACCESS_TOKEN` env

**Channel taxonomy (LOCKED — use these, not the mock's names):**
`apollo` · `linkedin` · `app` · `gh-cold` · `referral` · `organic`

Mock used `coldApp / coldOutreach / hmOutreach` — those are wrong. Always use the live repo's set.

---

## 2. What the mock adds (port these)

| # | Feature                                                | Mock file (design project)               | Live target (port to)                           |
| - | ------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------- |
| 1 | Operator-console aesthetic                             | `admin/visits/styles.css`                | Tailwind classes + new tokens in `globals.css`  |
| 2 | Top bar with tabs (Overview · Leads · Channels · Sessions) | `admin/visits/app.jsx`               | `src/app/components/dashboard/Shell.tsx`        |
| 3 | KPI strip (6 cards: visits, companies, click/engage/reply, conversions) | `admin/visits/overview.jsx`     | `dashboard/KpiStrip.tsx`                        |
| 4 | Live signals banner (hot leads, repeat-visit bursts, ghost watchlist) | `admin/visits/overview.jsx`     | `dashboard/SignalsBanner.tsx`                   |
| 5 | Time-series area chart with metric switcher            | `admin/visits/charts.jsx::AreaChart`     | Replace `DailyVisitsChart.tsx` or extend it     |
| 6 | **Funnel chart** with drop-off per stage               | `admin/visits/charts.jsx::FunnelChart`   | `dashboard/FunnelChart.tsx` (new)               |
| 7 | **Day × hour heatmap**                                 | `admin/visits/charts.jsx::HeatmapChart`  | `dashboard/Heatmap.tsx` (new)                   |
| 8 | **Sankey:** channel → company → outcome                | `admin/visits/charts.jsx::SankeyChart`   | `dashboard/SankeyChart.tsx` (new)               |
| 9 | Section dwell bars (avg seconds per section)           | `admin/visits/charts.jsx::DwellBars`     | `dashboard/SectionDwell.tsx` (new)              |
| 10| Channel-mix donut + per-channel CTR                    | `admin/visits/overview.jsx::Donut`       | `dashboard/ChannelMix.tsx` (new)                |
| 11| Lead table with **per-row sparkline** + status pipeline | `admin/visits/leads.jsx`                | `dashboard/LeadsTable.tsx` (replaces current Leads tab) |
| 12| Lead drill-down: chronological feed + section dwell + click path | `admin/visits/lead-detail.jsx` | `dashboard/LeadDetail.tsx` (replaces current Deep Dive) |
| 13| **Sessions raw stream tab** (filterable, last 300)     | `admin/visits/sessions.jsx`              | `dashboard/SessionsStream.tsx` (new)            |
| 14| Link generator modal (cleaner UX)                      | `admin/visits/link-generator.jsx`        | `dashboard/LinkGenerator.tsx`                   |

---

## 3. Design tokens

Add to `src/app/globals.css` (extend, don't replace your existing palette):

```css
@theme {
  /* Existing — keep */
  --color-navy: #0a192f;
  --color-navy-light: #112240;
  --color-slate: #8892b0;
  --color-light-slate: #ccd6f6;
  --color-green: #64ffda;

  /* NEW — operator console */
  --color-amber: oklch(0.82 0.135 75);    /* heat / accent for ops dashboard */
  --color-amber-soft: oklch(0.82 0.135 75 / 0.12);
  --color-heat-90: oklch(0.72 0.21 28);    /* scarlet — heat ≥80 */
  --color-heat-70: oklch(0.78 0.17 50);    /* orange — heat 60-79 */
  --color-heat-50: oklch(0.82 0.135 75);   /* amber — heat 40-59 */
  --color-heat-30: oklch(0.72 0.07 85);    /* dim gold — heat 20-39 */
  --color-signal: oklch(0.78 0.13 160);    /* green — engaged/live */
  --color-info-blue: oklch(0.78 0.10 230); /* blue — clicked */
  --color-danger: oklch(0.70 0.20 25);     /* red — alerts/rejected */
  --color-row-hover: oklch(0.26 0.010 70);
  --color-grid-line: oklch(0.30 0.008 70 / 0.55);
  --color-grid-line-soft: oklch(0.30 0.008 70 / 0.28);

  /* Mono dominance for the dashboard */
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}
```

Then the dashboard wraps in `<div className="font-mono text-[12.5px] bg-navy ...">` and uses these tokens via `text-amber`, `bg-amber-soft`, `border-grid-line`, etc.

**Existing portfolio pages — DO NOT change**. The new tokens are additive; the dashboard uses mono + amber, the portfolio keeps its serif/green.

---

## 4. Schema changes needed

The current tables almost cover everything. Two small migrations:

### `supabase_migration_v3.sql` (new)
```sql
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
CREATE INDEX idx_section_dwell_visit ON section_dwell(visit_id);

-- 2. Click path — ordered list of internal/outbound clicks within a session
CREATE TABLE IF NOT EXISTS click_path (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,                                 -- 0,1,2…
    target TEXT NOT NULL,                                 -- '#experience' | 'github.com/…' | 'resume.pdf'
    kind TEXT NOT NULL,                                   -- 'section' | 'outbound' | 'download' | 'form'
    at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_click_path_visit ON click_path(visit_id, seq);

-- 3. Pipeline stage cache per company (derived from outreach_logs but materialized for fast funnel queries)
ALTER TABLE outreach_logs
  ADD COLUMN IF NOT EXISTS stage TEXT;   -- 'replied'|'screen'|'onsite'|'offer'|'rejected'|'ghosted'
```

That's it. Everything else already exists.

---

## 5. Tracker enhancements (`src/lib/tracking.ts`)

The current tracker is good. Add three things:

### a. Section dwell in seconds (currently only fires once on "viewed")
Replace `useSectionTracking` so it accumulates time-in-view via IntersectionObserver, flushing to `/api/track/event` with `{event_type: 'section_dwell', event_name: 'About', metadata: {seconds: N}}` every 10s and on `pagehide`.

### b. Outbound click tracking
```ts
export const useOutboundTracking = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      let kind = 'outbound';
      if (href.includes('github.com/eshaanbajpai')) kind = 'github_click';
      else if (href.includes('linkedin.com/in/eshaanbajpai')) kind = 'linkedin_click';
      else if (href.endsWith('.pdf')) kind = 'resume_download';
      else if (href.startsWith('#')) kind = 'section_jump';
      else if (a.target === '_blank') kind = 'outbound';
      else return;
      trackEvent('engagement', kind, { href, text: a.textContent?.trim() });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
};
```
Wire this in `AnalyticsInitializer.tsx`.

### c. Resume download already exists in `Hero.tsx` — also fire from anywhere else resume.pdf is linked.

---

## 6. API extensions

### Extend `GET /api/visits/route.ts` response

Today it returns `{ companies, outreachLogs, summary }`. Add:

```ts
{
  companies: CompanyLead[];          // existing
  outreachLogs: OutreachLog[];       // existing
  summary: {                         // existing + new fields
    totalVisits, uniqueCompanies,
    clickRate, engageRate, replyRate,     // NEW — computed per §7
    resumeDLs, githubClicks, linkedinClicks, // NEW — count from visit_events
  };
  funnel: {                          // NEW
    outreach, clicked, engaged, replied, screen, onsite, offer
  };
  byChannel: {                       // NEW — keyed by 'apollo'|'linkedin'|…
    [k: string]: { sent, clicks, engaged, replied };
  };
  byDevice: { desktop, mobile, tablet }; // NEW
  heatmap: number[7][24];            // NEW — [day_of_week][hour_utc]
  sectionDwell: Array<{ name, avg, visits }>; // NEW — from section_dwell table
  dailySeries: Array<{ date, visits, engaged, pageViews, bounces }>; // NEW
  alerts: Array<{ kind: 'hot'|'warm'|'info', when, msg, leadId? }>;  // NEW — see §8
}
```

All extra aggregations should be one Supabase query each, then computed in JS.

### Add `GET /api/visits/sessions?limit=300&channel=&engaged=&search=`
For the new Sessions tab. Returns a flat list of visit rows with their `sessionStats` joined, sorted by `visited_at` DESC.

### Add `GET /api/visits/leads/:companyId`
Returns one company's full detail including all sessions, events, click_path, section_dwell. Already mostly there in `/api/visits?company=` — formalize it.

---

## 7. Derived metrics (compute server-side, don't store)

### Funnel stages (per company)
```
sent     = outreach_logs row exists (any action_type)
clicked  = sent AND ≥1 visit
engaged  = clicked AND ≥1 visit with isEngaged=true
replied  = outreach_logs row with stage IN ('replied','screen','onsite','offer','rejected')
screen   = stage IN ('screen','onsite','offer','rejected')
onsite   = stage IN ('onsite','offer','rejected')
offer    = stage = 'offer'
ghosted  = sent AND NOT clicked AND now - first_outreach.action_date > 10 days
```

### Rates for KPI strip
- `clickRate  = clicked / outreach`
- `engageRate = engaged / clicked`
- `replyRate  = replied / engaged`

### Alerts (synthesized at read time)
```
HOT  if any company.heatScore >= 80
WARM if any company has >= 3 visits in last 48h
WARM if any company has a resume_download event in last 7d
INFO if ghosted company count > 0
```

---

## 8. Recharts equivalents for the new viz

The mock uses raw SVG. Port to Recharts:

| Mock chart        | Recharts component             | Notes                                                    |
| ----------------- | ------------------------------ | -------------------------------------------------------- |
| AreaChart         | `<AreaChart>` (already in use) | Just swap colors to amber and tighten tick density       |
| FunnelChart       | `<FunnelChart>` (built-in)     | Or HTML/CSS bars — funnel is just 7 horizontal bars      |
| HeatmapChart      | Custom — use a `<div>` grid    | Recharts has no heatmap; CSS grid + opacity ramp is fine |
| SankeyChart       | `<Sankey>` (built-in!)         | Recharts has it. Use the mock's data shape directly      |
| DwellBars         | `<BarChart layout="vertical">` | Or just CSS like the mock                                |
| Donut             | `<PieChart>` with `innerRadius` | Standard recharts donut                                 |
| Sparkline         | `<AreaChart>` w/ no axes       | Or custom `<svg>` — mock has a clean implementation      |

---

## 9. File layout to create

```
src/app/components/dashboard/        # NEW folder
├── Shell.tsx                        # top bar + tab routing
├── KpiStrip.tsx
├── SignalsBanner.tsx                # live alerts
├── TimelineChart.tsx                # extends/replaces DailyVisitsChart
├── FunnelChart.tsx
├── Heatmap.tsx
├── ChannelMix.tsx
├── SectionDwell.tsx
├── SankeyChart.tsx
├── DevicesDonut.tsx
├── LeadsTable.tsx
├── LeadDetail.tsx                   # chronological feed merging visits+outreach+events
├── SessionsStream.tsx
├── LinkGenerator.tsx                # modal
├── primitives/
│   ├── HeatBadge.tsx
│   ├── StatusChip.tsx
│   ├── ChannelChip.tsx
│   ├── Panel.tsx                    # the panel-head + body chrome
│   └── Sparkline.tsx
└── lib/
    ├── api.ts                       # typed fetch wrappers
    └── types.ts                     # the response interfaces from §6

src/app/admin/visits/page.tsx        # REFACTOR — auth gate stays, swap dashboard mount
src/app/components/VisitsDashboard.tsx # DELETE after migration complete

src/lib/tracking.ts                  # ADD useOutboundTracking + section-dwell-in-seconds

supabase_migration_v3.sql            # NEW — see §4
src/app/api/visits/route.ts          # EXTEND response per §6
src/app/api/visits/sessions/route.ts # NEW
src/app/api/visits/leads/[id]/route.ts # NEW
```

---

## 10. Port the **portfolio** design too

The design project's portfolio (warm amber, editorial serif, tweaks panel) is also new. To port:

| Mock file        | Live target                                  | Notes                                  |
| ---------------- | -------------------------------------------- | -------------------------------------- |
| `hero.jsx`       | `src/app/components/Hero.tsx`                | Keep `trackEvent('cta_click', …)` calls intact |
| `sections.jsx`   | Split into Experience/Projects/Testimonials  | Match existing component split         |
| `case-studies.jsx` | New: `src/app/components/CaseStudies.tsx`  | If you keep this section               |
| `playground.jsx` | New: `src/app/components/Playground.tsx`     | Live demo block                        |
| `app.jsx::TopNav` | `src/app/components/Navigation.tsx`         | Already exists — restyle               |
| `styles.css`     | Translate to Tailwind utility classes        | Use existing CSS vars in `globals.css` |

**Do NOT** port the `Tweaks` panel — that's a design tool, not a production feature.

The portfolio's warm-amber accent will conflict with the existing teal `--color-green`. Decision: **make accent themeable.** Add a third theme alongside next-themes' light/dark called `amber` that swaps `--color-accent` between the two. Default stays teal for now; you can switch in `ThemeProvider.tsx`.

---

## 11. Migration phases — paste each into Antigravity in order

### Phase 1: Schema + tracker enhancements
> Read `admin/visits/HANDOFF.md` end-to-end. Implement §4 (run `supabase_migration_v3.sql` against my Supabase project) and §5 (extend `src/lib/tracking.ts` with `useOutboundTracking` and section-dwell-in-seconds). Wire the new hooks into `AnalyticsInitializer.tsx`. Verify by visiting `/c/apollo-test`, browsing the portfolio, then querying `section_dwell` and `click_path` tables in Supabase — both should have rows.

### Phase 2: API extension
> Extend `src/app/api/visits/route.ts` per HANDOFF.md §6 — add the new fields to the summary response (clickRate, engageRate, replyRate, resumeDLs, githubClicks, linkedinClicks), and the new top-level keys (funnel, byChannel, byDevice, heatmap, sectionDwell, dailySeries, alerts). Implement the derived metrics in §7. Also create `GET /api/visits/sessions` and `GET /api/visits/leads/[id]`. Don't touch the UI yet — write API tests by hitting the routes with curl.

### Phase 3: Dashboard shell + primitives
> Create the `src/app/components/dashboard/` folder per HANDOFF.md §9. Build `Shell.tsx`, `primitives/Panel.tsx`, `primitives/HeatBadge.tsx`, `primitives/StatusChip.tsx`, `primitives/ChannelChip.tsx`, `primitives/Sparkline.tsx`. Refactor `src/app/admin/visits/page.tsx` to mount `<Shell>` instead of `<VisitsDashboard>`. Build the top-bar tabs (Overview · Leads · Channels · Sessions) and tab routing. Use the new design tokens from §3 (add them to `globals.css` first). The aesthetic to match is in `admin/visits/styles.css` of the design project — operator-console, dense, monospace-heavy.

### Phase 4: Overview tab
> Build the Overview tab: `KpiStrip` (6 cards), `SignalsBanner` (live alerts), `TimelineChart` (extend the existing `DailyVisitsChart` with the 4 metrics from the mock), `FunnelChart`, `Heatmap`, `ChannelMix`, `SectionDwell`. Layout matches `admin/visits/overview.jsx` in the design project. Use Recharts where listed in HANDOFF.md §8.

### Phase 5: Leads + drill-down
> Build `LeadsTable.tsx` — sortable, filterable (All / Hot ≥60 / Engaged / Replied+ / Ghosted), with per-row sparklines from the new 30-day spark data in the API response. Build `LeadDetail.tsx` matching the mock's `lead-detail.jsx`: conversion events panel, section dwell bars, sessions table, and chronological feed merging visits + outreach + click events. Delete `src/app/components/VisitsDashboard.tsx` once parity is verified.

### Phase 6: Channels + Sessions tabs
> Build `Channels` tab: Sankey channel → company → outcome, per-channel cards with click/engage/reply rates, referrer breakdown, devices donut. Build `Sessions` tab: 300-row stream filterable by channel + engaged-only, with event badges (DL/GH/LI/contact). Both match the mock exactly.

### Phase 7: Port portfolio design
> Now port the design project's portfolio per HANDOFF.md §10. Keep all `trackEvent` and tracking hook calls intact. Don't port the Tweaks panel.

---

## 12. Acceptance test (run after every phase)

1. `npm run build` passes with no TS errors.
2. `npm run lint` clean.
3. Visit `/c/apollo-stripe` → redirects to `/` → row appears in Supabase `visits` with `channel='apollo', company_id='stripe'`.
4. Browse the portfolio for 60s, scroll past every section, click GitHub and resume download.
5. Open `/admin/visits`, enter token. Stripe should be at the top of Leads with heat ≥ 60, an Engaged status, a sparkline, and a chronological feed showing the resume download.

---

## 13. What NOT to change

- Tracking grammar `/c/{channel}-{company}` and `/{company}` legacy — both stay.
- Channel taxonomy from §1 — locked.
- `ADMIN_ACCESS_TOKEN` auth pattern — keep, just restyle the gate.
- Supabase `visits` / `visit_events` / `outreach_logs` columns — additive only.
- The portfolio's existing serif/green if user hasn't opted into the amber theme.
- Anything in the design project — that's reference, not source of truth.

---

## 14. Cost / scale notes

- Free Supabase tier (500MB DB, 50k MAU) covers ≥ 100k visits with all new tables.
- Recharts adds ~80KB gzipped; you already pay this. No additional deps needed.
- No edge functions needed — everything runs through Next.js API routes on Vercel.
