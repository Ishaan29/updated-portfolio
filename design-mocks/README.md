# Design Mocks — Eshaan Bajpai portfolio

Reference mocks for porting into **`Ishaan29/updated-portfolio`**.

**Start here:** [`HANDOFF.md`](./HANDOFF.md) — the full file-by-file migration spec.

---

## Contents

```
design-mocks/
├── HANDOFF.md                 ★ Read this first
├── README.md                  ← you are here
│
├── analytics-dashboard/       The /admin/visits operator-console redesign
│   ├── index.html             Entry — open in a browser to interact with it
│   ├── styles.css             Operator-console design tokens
│   ├── app.jsx                Shell + tab routing
│   ├── overview.jsx           KPI strip + alerts + funnel + heatmap
│   ├── leads.jsx              Sortable lead table w/ sparklines
│   ├── lead-detail.jsx        Drill-down: sessions + chronological feed
│   ├── channels.jsx           Sankey + per-channel cards + referrers
│   ├── sessions.jsx           Raw session stream
│   ├── charts.jsx             AreaChart, FunnelChart, HeatmapChart, SankeyChart, …
│   ├── primitives.jsx         HeatBadge, StatusChip, Sparkline, Panel
│   ├── link-generator.jsx     /c/{slug} URL builder modal
│   ├── auth.jsx               Password gate (FNV hash demo — replace with real auth)
│   ├── api.js                 ★ Single seam — flip mode "mock" → "live"
│   └── data.jsx               Seeded data (529 visits / 29 companies)
│
├── portfolio/                 The portfolio redesign (warm-amber editorial)
│   ├── index.html             Entry — loads React + Babel
│   ├── styles.css             Design tokens
│   ├── app.jsx                Root composition + TopNav
│   ├── hero.jsx               Hero with rotating pitch variants
│   ├── sections.jsx           Experience timeline, testimonials, about, CTA
│   ├── case-studies.jsx       Project case studies
│   ├── playground.jsx         Live interactive demo block
│   └── tweaks-panel.jsx       (Design tool — DO NOT port to production)
│
└── screenshots/               Visual reference (code is the source of truth)
    ├── 01-overview.png        Overview tab — KPIs, signals, timeline
    ├── 02-leads.png           Leads tab — sortable table w/ sparklines
    ├── 03-lead-detail.png     Lead drill-down — feed + sessions
    ├── 04-channels-sankey.png Channels tab — Sankey flow
    └── 05-auth-gate.png       Password gate (replace with real auth)
```

---

## To preview the mocks locally

Both `analytics-dashboard/` and `portfolio/` are static HTML — no build step required.

```bash
# from the design-mocks/ folder
python3 -m http.server 8000

# then open:
#   http://localhost:8000/analytics-dashboard/        (password: letmein)
#   http://localhost:8000/portfolio/
```

---

## Channel taxonomy (LOCKED)

The mock uses placeholder channel names (`coldApp`, `coldOutreach`, `hmOutreach`) because the analytics author didn't know the live names. **Always use the live repo's taxonomy:**

`apollo` · `linkedin` · `app` · `gh-cold` · `referral` · `organic`

`HANDOFF.md` §1 covers this. Do a find-and-replace as part of the port.

---

## What to port vs. what to ignore

| Port | Skip |
|---|---|
| All `analytics-dashboard/*.jsx` (translate to TSX) | `tweaks-panel.jsx` (design tool, not production) |
| `analytics-dashboard/styles.css` design tokens | The `Tweaks` panel mounting in `portfolio/app.jsx` |
| All visualizations in `charts.jsx` | The seeded `data.jsx` (real data comes from Supabase) |
| `portfolio/hero.jsx`, `sections.jsx`, `case-studies.jsx`, `playground.jsx` | Inline `<script type="text/babel">` setup — use Next.js JSX directly |

---

## Phased migration plan

See `HANDOFF.md` §11. Seven phases, paste each into Antigravity one at a time:

1. **Schema + tracker enhancements** — `supabase_migration_v3.sql` + new tracking hooks
2. **API extension** — funnel, heatmap, sankey data + 2 new routes
3. **Dashboard shell + primitives** — top bar, tabs, Panel/HeatBadge/StatusChip
4. **Overview tab** — KPIs, signals, funnel, heatmap, channel mix
5. **Leads + drill-down** — sortable table, chronological feed
6. **Channels + Sessions tabs** — Sankey, raw session stream
7. **Portfolio design port** — Hero, sections, case studies

Each phase has an acceptance test in `HANDOFF.md` §12.
