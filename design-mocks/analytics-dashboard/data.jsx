/* ============================================================
   Seeded data — deterministic, ~529 visits / 29 companies.
   Generated once at module load, exposed on window.OPS_DATA.
   ============================================================ */

(function () {
  // Deterministic PRNG (mulberry32) so re-renders / refreshes stay stable.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(20260515);
  const r = () => rng();
  const rint = (a, b) => Math.floor(rng() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const weighted = (pairs) => {
    const tot = pairs.reduce((s, p) => s + p[1], 0);
    let n = rng() * tot;
    for (const [v, w] of pairs) { n -= w; if (n <= 0) return v; }
    return pairs[pairs.length - 1][0];
  };

  // ---------- Companies (29) ----------
  const COMPANIES = [
    { name: "Stripe",      tier: "unicorn", role: "backend", hq: "San Francisco, US",  domain: "stripe.com" },
    { name: "Anthropic",   tier: "unicorn", role: "infra",   hq: "San Francisco, US",  domain: "anthropic.com" },
    { name: "OpenAI",      tier: "unicorn", role: "ml",      hq: "San Francisco, US",  domain: "openai.com" },
    { name: "Datadog",     tier: "public",  role: "backend", hq: "New York, US",       domain: "datadoghq.com" },
    { name: "Snowflake",   tier: "public",  role: "infra",   hq: "Bozeman, US",        domain: "snowflake.com" },
    { name: "Vercel",      tier: "unicorn", role: "infra",   hq: "San Francisco, US",  domain: "vercel.com" },
    { name: "Figma",       tier: "public",  role: "backend", hq: "San Francisco, US",  domain: "figma.com" },
    { name: "Linear",      tier: "startup", role: "backend", hq: "Remote",             domain: "linear.app" },
    { name: "Ramp",        tier: "unicorn", role: "backend", hq: "New York, US",       domain: "ramp.com" },
    { name: "Scale AI",    tier: "unicorn", role: "ml",      hq: "San Francisco, US",  domain: "scale.com" },
    { name: "Cloudflare",  tier: "public",  role: "infra",   hq: "San Francisco, US",  domain: "cloudflare.com" },
    { name: "Supabase",    tier: "startup", role: "backend", hq: "Remote",             domain: "supabase.com" },
    { name: "Databricks",  tier: "unicorn", role: "infra",   hq: "San Francisco, US",  domain: "databricks.com" },
    { name: "Notion",      tier: "unicorn", role: "backend", hq: "San Francisco, US",  domain: "notion.so" },
    { name: "Plaid",       tier: "unicorn", role: "backend", hq: "San Francisco, US",  domain: "plaid.com" },
    { name: "Coinbase",    tier: "public",  role: "backend", hq: "Remote",             domain: "coinbase.com" },
    { name: "Airbnb",      tier: "public",  role: "infra",   hq: "San Francisco, US",  domain: "airbnb.com" },
    { name: "Confluent",   tier: "public",  role: "infra",   hq: "Mountain View, US",  domain: "confluent.io" },
    { name: "MongoDB",     tier: "public",  role: "backend", hq: "New York, US",       domain: "mongodb.com" },
    { name: "HashiCorp",   tier: "public",  role: "infra",   hq: "San Francisco, US",  domain: "hashicorp.com" },
    { name: "PlanetScale", tier: "startup", role: "infra",   hq: "San Francisco, US",  domain: "planetscale.com" },
    { name: "Modal Labs",  tier: "startup", role: "infra",   hq: "New York, US",       domain: "modal.com" },
    { name: "Pinecone",    tier: "startup", role: "ml",      hq: "New York, US",       domain: "pinecone.io" },
    { name: "Anyscale",    tier: "startup", role: "ml",      hq: "San Francisco, US",  domain: "anyscale.com" },
    { name: "Weights & Biases", tier: "startup", role: "ml", hq: "San Francisco, US",  domain: "wandb.ai" },
    { name: "Mistral",     tier: "unicorn", role: "ml",      hq: "Paris, FR",          domain: "mistral.ai" },
    { name: "Cohere",      tier: "unicorn", role: "ml",      hq: "Toronto, CA",        domain: "cohere.com" },
    { name: "Replit",      tier: "startup", role: "infra",   hq: "San Francisco, US",  domain: "replit.com" },
    { name: "Retool",      tier: "unicorn", role: "backend", hq: "San Francisco, US",  domain: "retool.com" },
  ];

  // ---------- Time framing ----------
  // "Now" = May 15, 2026 (matches the system clock in screenshots).
  const NOW = new Date("2026-05-15T18:30:00Z");
  const DAY = 86400_000;
  const WINDOW_DAYS = 60;
  const START = new Date(NOW.getTime() - WINDOW_DAYS * DAY);

  // ---------- Channel / page / device / referrer pools ----------
  const CHANNELS = ["coldApp", "coldOutreach", "hmOutreach"];
  const CH_WEIGHTS = { coldApp: 0.55, coldOutreach: 0.28, hmOutreach: 0.17 };

  const SECTIONS = ["About", "Experience", "Projects", "Recent Activity", "Testimonials", "Get in Touch"];
  const DEVICES = [
    { k: "MacBook Pro / Chrome",   t: "desktop", w: 6 },
    { k: "MacBook Air / Safari",   t: "desktop", w: 4 },
    { k: "Windows / Chrome",       t: "desktop", w: 5 },
    { k: "Windows / Edge",         t: "desktop", w: 3 },
    { k: "Linux / Firefox",        t: "desktop", w: 2 },
    { k: "iPhone / Safari",        t: "mobile",  w: 4 },
    { k: "Android / Chrome",       t: "mobile",  w: 2 },
    { k: "iPad / Safari",          t: "tablet",  w: 1 },
  ];

  const LOCATIONS = [
    "San Francisco, US","Mountain View, US","Palo Alto, US","Seattle, US","New York, US",
    "Brooklyn, US","Boston, US","Austin, US","Chicago, US","Los Angeles, US",
    "Denver, US","Portland, US","Toronto, CA","Vancouver, CA","London, UK",
    "Berlin, DE","Paris, FR","Amsterdam, NL","Dublin, IE","Zurich, CH",
    "Warsaw, PL","Tel Aviv, IL","Bangalore, IN","Singapore, SG","Sydney, AU",
  ];

  const REFERRERS = [
    { k: "LinkedIn DM",         w: 5 },
    { k: "Gmail (Apple Mail)",  w: 6 },
    { k: "Gmail (Web)",         w: 4 },
    { k: "Outlook",             w: 3 },
    { k: "Slack",               w: 2 },
    { k: "Direct",              w: 5 },
    { k: "Twitter / X",         w: 1 },
  ];

  const STAGES = [
    "sent","clicked","engaged","replied","screen","onsite","offer","rejected","ghosted",
  ];

  // weighted helper for {k,w} arrays
  const pickW = (arr) => {
    const t = arr.reduce((s, x) => s + x.w, 0);
    let n = rng() * t;
    for (const x of arr) { n -= x.w; if (n <= 0) return x; }
    return arr[arr.length - 1];
  };

  // ---------- Generate lead per company ----------
  function makeLead(co, i) {
    // pick a channel for this lead's first outreach
    const channel = weighted([
      ["coldApp", CH_WEIGHTS.coldApp],
      ["coldOutreach", CH_WEIGHTS.coldOutreach],
      ["hmOutreach", CH_WEIGHTS.hmOutreach],
    ]);

    // outreach date sometime in the window, leaning earlier
    const outreachOffset = Math.floor(Math.pow(rng(), 0.6) * (WINDOW_DAYS - 1));
    const outreachAt = new Date(START.getTime() + outreachOffset * DAY + rint(8, 18) * 3600_000 + rint(0, 59) * 60_000);

    // probability of clicking / engaging / replying depend on channel
    const pClick = channel === "hmOutreach" ? 0.85 : channel === "coldOutreach" ? 0.4 : 0.18;
    const pEng   = channel === "hmOutreach" ? 0.7  : channel === "coldOutreach" ? 0.55 : 0.45;
    const pReply = channel === "hmOutreach" ? 0.5  : channel === "coldOutreach" ? 0.2  : 0.04;

    // determine outcome stage
    const clicked = rng() < pClick;
    const engaged = clicked && rng() < pEng;
    const replied = engaged && rng() < pReply;
    const advanced = replied && rng() < 0.55;
    const onsite = advanced && rng() < 0.55;
    const outcome = onsite && rng() < 0.5;

    let stage = "sent";
    if (clicked) stage = "clicked";
    if (engaged) stage = "engaged";
    if (replied) stage = "replied";
    if (advanced) stage = "screen";
    if (onsite) stage = "onsite";
    if (outcome) stage = rng() < 0.55 ? "offer" : "rejected";
    if (!clicked && (NOW - outreachAt) > 10 * DAY) stage = "ghosted";

    // sessions count if clicked
    const sessionCount = clicked
      ? Math.max(1, Math.round( (engaged ? rint(3, 18) : rint(1, 4)) * (replied ? 1.4 : 1) ))
      : 0;

    // sessions distribution: first one is at click time, others lag over days
    const sessions = [];
    let firstClickAt = null;
    if (clicked) {
      // first click 0–48h after outreach
      firstClickAt = new Date(outreachAt.getTime() + rint(15 * 60_000, 48 * 3600_000));
      const targetVisits = sessionCount;
      // distribute sessions across following 10 days
      const spread = engaged ? rint(3, 16) : rint(1, 5);
      for (let s = 0; s < targetVisits; s++) {
        const t = s === 0
          ? firstClickAt
          : new Date(firstClickAt.getTime() + rng() * spread * DAY + rint(0, 18) * 3600_000);
        if (t > NOW) continue;
        const device = pickW(DEVICES);
        const referrer = s === 0 ? pickW(REFERRERS) : (rng() < 0.6 ? { k: "Direct", w: 1 } : pickW(REFERRERS));
        // bounce-y for cold app, deeper for warm
        const isEngaged = engaged && rng() < 0.7;
        const duration = isEngaged ? rint(45, 320) : rint(2, 28);
        const scroll = isEngaged ? rint(55, 100) : rint(5, 45);
        // sections read
        const sectionsHit = isEngaged
          ? SECTIONS.slice(0, rint(3, SECTIONS.length))
          : SECTIONS.slice(0, rint(1, 2));
        const sectionDwell = {};
        for (const sec of sectionsHit) sectionDwell[sec] = rint(4, 70);
        // click path
        const path = [];
        path.push("/" + (channel === "coldApp" ? "c/coldApp-" + co.name.toLowerCase().split(" ")[0]
                       : channel === "coldOutreach" ? "c/coldOutreach-" + co.name.toLowerCase().split(" ")[0]
                       : "c/hmOutreach-" + co.name.toLowerCase().split(" ")[0]));
        if (isEngaged) {
          path.push("#experience");
          if (rng() < 0.6) path.push("#projects");
          if (rng() < 0.4) path.push("github.com/eshaanbajpai");
          if (rng() < 0.3) path.push("linkedin.com/in/eshaanbajpai");
          if (rng() < 0.35) path.push("resume.pdf");
          if (rng() < 0.15) path.push("#get-in-touch");
        }
        const dlResume = isEngaged && rng() < 0.35;
        const clickGithub = isEngaged && rng() < 0.4;
        const clickLinkedin = isEngaged && rng() < 0.3;

        sessions.push({
          at: t,
          duration,
          scroll,
          device: device.k,
          deviceType: device.t,
          location: pick(LOCATIONS),
          referrer: referrer.k,
          sections: sectionDwell,
          path,
          events: {
            resumeDownload: dlResume,
            githubClick: clickGithub,
            linkedinClick: clickLinkedin,
            contactForm: isEngaged && rng() < 0.06,
          },
          engaged: isEngaged,
        });
      }
      sessions.sort((a,b) => a.at - b.at);
    }

    // outreach events timeline
    const outreach = [];
    outreach.push({
      at: outreachAt,
      kind: channel,
      label:
        channel === "coldApp"      ? "Cold application submitted" :
        channel === "coldOutreach" ? "Cold email sent to recruiting" :
                                     "DM sent to hiring manager",
      meta: channel === "hmOutreach" ? `via LinkedIn DM — included /c/hmOutreach-${co.name.toLowerCase().split(" ")[0]}`
            : channel === "coldOutreach" ? `Subject: "Backend SWE — 4yrs distributed systems @ Gainsight"`
            : `Applied via careers page — tracked link in resume header`,
    });
    if (advanced) outreach.push({
      at: new Date((sessions[sessions.length-1]?.at || firstClickAt || outreachAt).getTime() + rint(1, 4) * DAY),
      kind: "reply",
      label: "Recruiter replied — phone screen scheduled",
      meta: "30 min intro call",
    });
    if (onsite) outreach.push({
      at: new Date(outreachAt.getTime() + rint(7, 18) * DAY),
      kind: "onsite",
      label: "Onsite loop scheduled",
      meta: "4 rounds — system design, coding x2, behavioral",
    });
    if (stage === "offer") outreach.push({
      at: new Date(outreachAt.getTime() + rint(18, 28) * DAY),
      kind: "offer",
      label: "Offer extended",
      meta: "Senior Backend SWE",
    });
    if (stage === "rejected") outreach.push({
      at: new Date(outreachAt.getTime() + rint(14, 24) * DAY),
      kind: "rejected",
      label: "Rejected after onsite",
      meta: "Feedback: strong, but team chose another candidate",
    });

    // heat score
    const heat = computeHeat({ sessions, channel, outreachAt, stage });

    // sparkline: daily visit counts last 30d
    const spark = new Array(30).fill(0);
    const sparkStart = new Date(NOW.getTime() - 30 * DAY);
    for (const s of sessions) {
      const d = Math.floor((s.at - sparkStart) / DAY);
      if (d >= 0 && d < 30) spark[d]++;
    }

    // first click & last seen
    const lastSeen = sessions.length ? sessions[sessions.length-1].at : null;
    const engagedSessions = sessions.filter(s => s.engaged).length;
    const resumeDLs = sessions.filter(s => s.events.resumeDownload).length;

    return {
      id: "co_" + i.toString().padStart(2, "0"),
      company: co.name,
      tier: co.tier,
      role: co.role,
      hq: co.hq,
      domain: co.domain,
      channel,
      stage,
      outreachAt,
      firstClickAt,
      lastSeen,
      sessions,
      outreach,
      heat,
      spark,
      engagedSessions,
      resumeDLs,
      visits: sessions.length,
    };
  }

  function computeHeat({ sessions, channel, outreachAt, stage }) {
    // weighted: recency (35) + engagement (25) + repeat (15) + resume DL (15) + outreach activity (10)
    if (!sessions.length) return Math.max(2, Math.min(10, 8 - Math.floor((Date.now ? 0 : 0))));
    const last = sessions[sessions.length-1].at;
    const daysSince = Math.max(0, (NOW - last) / DAY);
    const recency = Math.max(0, 35 - Math.min(35, daysSince * 4));
    const engagedCount = sessions.filter(s => s.engaged).length;
    const engagement = Math.min(25, engagedCount * 5);
    const repeats = Math.min(15, Math.max(0, sessions.length - 1) * 2);
    const dl = sessions.some(s => s.events.resumeDownload) ? 15 : 0;
    const outreachBonus = channel === "hmOutreach" ? 10 : channel === "coldOutreach" ? 7 : 4;
    const stageBonus = stage === "onsite" || stage === "offer" ? 10 : stage === "screen" ? 6 : stage === "replied" ? 4 : 0;
    return Math.max(2, Math.min(99, Math.round(recency + engagement + repeats + dl + outreachBonus + stageBonus - 10)));
  }

  // build all leads
  const leads = COMPANIES.map((co, i) => makeLead(co, i));

  // ---------- Add a couple of unattributed / organic visits to round to ~529 ----------
  // Sum sessions so far
  const attributed = leads.reduce((s, l) => s + l.sessions.length, 0);
  const TARGET = 529;
  const filler = Math.max(0, TARGET - attributed);
  const organicVisits = [];
  for (let i = 0; i < filler; i++) {
    const t = new Date(START.getTime() + rng() * WINDOW_DAYS * DAY);
    const device = pickW(DEVICES);
    const eng = rng() < 0.08;
    organicVisits.push({
      at: t,
      duration: eng ? rint(40, 200) : rint(1, 20),
      scroll: eng ? rint(50, 100) : rint(5, 40),
      device: device.k,
      deviceType: device.t,
      location: pick(LOCATIONS),
      referrer: pickW([
        { k: "Direct", w: 8 },
        { k: "Google", w: 3 },
        { k: "Twitter / X", w: 1 },
        { k: "GitHub", w: 1 },
      ]).k,
      engaged: eng,
      events: {
        resumeDownload: eng && rng() < 0.1,
        githubClick: eng && rng() < 0.2,
        linkedinClick: eng && rng() < 0.15,
        contactForm: false,
      },
      channel: "organic",
    });
  }

  // ---------- Aggregate stats ----------
  const allSessions = leads.flatMap(l =>
    l.sessions.map(s => ({ ...s, company: l.company, channel: l.channel, leadId: l.id }))
  ).concat(organicVisits.map(s => ({ ...s, company: null, leadId: null })));

  // daily series last 60 days
  const dailySeries = new Array(WINDOW_DAYS).fill(0).map((_, i) => ({
    date: new Date(START.getTime() + i * DAY),
    visits: 0,
    engaged: 0,
    pageViews: 0,
    bounces: 0,
  }));
  for (const s of allSessions) {
    const idx = Math.floor((s.at - START) / DAY);
    if (idx < 0 || idx >= WINDOW_DAYS) continue;
    dailySeries[idx].visits++;
    if (s.engaged) dailySeries[idx].engaged++;
    // page views = 1 + path-length above first
    dailySeries[idx].pageViews += (s.path?.length || 1);
    if (s.duration < 8 || (s.scroll < 25 && !s.engaged)) dailySeries[idx].bounces++;
  }

  // funnel totals across all leads
  const funnel = {
    outreach: leads.length,
    clicked:  leads.filter(l => l.sessions.length).length,
    engaged:  leads.filter(l => l.engagedSessions > 0).length,
    replied:  leads.filter(l => ["replied","screen","onsite","offer","rejected"].includes(l.stage)).length,
    screen:   leads.filter(l => ["screen","onsite","offer","rejected"].includes(l.stage)).length,
    onsite:   leads.filter(l => ["onsite","offer","rejected"].includes(l.stage)).length,
    offer:    leads.filter(l => l.stage === "offer").length,
  };

  // channel breakdown
  const byChannel = {};
  for (const ch of CHANNELS.concat(["organic"])) {
    byChannel[ch] = {
      sent: ch === "organic" ? 0 : leads.filter(l => l.channel === ch).length,
      clicks: 0, engaged: 0, replied: 0,
    };
  }
  for (const l of leads) {
    byChannel[l.channel].clicks += l.sessions.length;
    byChannel[l.channel].engaged += l.engagedSessions;
    byChannel[l.channel].replied += ["replied","screen","onsite","offer","rejected"].includes(l.stage) ? 1 : 0;
  }
  byChannel.organic.clicks = organicVisits.length;
  byChannel.organic.engaged = organicVisits.filter(v => v.engaged).length;

  // heatmap: 7 days x 24 hours, counts
  const heatmap = new Array(7).fill(0).map(() => new Array(24).fill(0));
  for (const s of allSessions) {
    const d = new Date(s.at);
    heatmap[d.getUTCDay()][d.getUTCHours()]++;
  }

  // section dwell — average seconds across all engaged sessions
  const sectionAgg = {};
  for (const s of allSessions) {
    if (!s.sections) continue;
    for (const sec of Object.keys(s.sections)) {
      if (!sectionAgg[sec]) sectionAgg[sec] = { total: 0, n: 0 };
      sectionAgg[sec].total += s.sections[sec];
      sectionAgg[sec].n++;
    }
  }
  const sectionDwell = SECTIONS.map(sec => ({
    name: sec,
    avg: sectionAgg[sec] ? Math.round(sectionAgg[sec].total / sectionAgg[sec].n) : 0,
    visits: sectionAgg[sec]?.n || 0,
  }));

  // role-type breakdown
  const byRole = { backend: 0, infra: 0, ml: 0 };
  for (const l of leads) byRole[l.role]++;

  // device breakdown
  const byDevice = { desktop: 0, mobile: 0, tablet: 0 };
  for (const s of allSessions) byDevice[s.deviceType]++;

  // alerts — synthesize a few "hot" signals based on data
  const alerts = [];
  // 1. highest heat lead
  const sortedByHeat = [...leads].sort((a,b)=>b.heat - a.heat);
  const top = sortedByHeat[0];
  alerts.push({
    kind: "hot",
    when: NOW.getTime() - top.lastSeen,
    msg: ["Heat score", `${top.heat}`, "—", { co: top.company }, "visited", `${top.visits}× ·`, "downloaded resume"],
    leadId: top.id,
  });
  // 2. repeat-visit burst
  const burst = [...leads].filter(l => l.sessions.length >= 5).sort((a,b)=>b.lastSeen - a.lastSeen)[0];
  if (burst) {
    const last24 = burst.sessions.filter(s => (NOW - s.at) < 2 * DAY).length;
    if (last24 >= 2) alerts.push({
      kind: "warm",
      when: NOW.getTime() - burst.lastSeen,
      msg: [{ co: burst.company }, "—", `${last24} visits in the last 48h`, "from", burst.sessions[burst.sessions.length-1].location],
      leadId: burst.id,
    });
  }
  // 3. resume DL by a fresh visitor
  const fresh = leads.find(l => l.resumeDLs > 0 && l.sessions.length <= 2 && (NOW - l.lastSeen) < 4 * DAY);
  if (fresh) alerts.push({
    kind: "warm",
    when: NOW.getTime() - fresh.lastSeen,
    msg: [{ co: fresh.company }, "downloaded résumé on first visit", "—", "consider follow-up"],
    leadId: fresh.id,
  });
  // 4. ghost watchlist
  const ghosted = leads.filter(l => l.stage === "ghosted").length;
  if (ghosted) alerts.push({
    kind: "info",
    when: 0,
    msg: ["Ghost watchlist:", `${ghosted} companies`, "with no click after 10+ days — consider re-pinging"],
  });

  // ---------- KPI rollup ----------
  function totals(range = WINDOW_DAYS) {
    const cutoff = NOW.getTime() - range * DAY;
    const inWin = allSessions.filter(s => s.at >= cutoff);
    const prevCutoff = NOW.getTime() - 2 * range * DAY;
    const prevWin = allSessions.filter(s => s.at >= prevCutoff && s.at < cutoff);
    const tot = inWin.length;
    const prev = prevWin.length;
    const eng = inWin.filter(s => s.engaged).length;
    const prevEng = prevWin.filter(s => s.engaged).length;
    return {
      visits: tot, prevVisits: prev,
      pageViews: inWin.reduce((s, x) => s + (x.path?.length || 1), 0),
      bounceRate: tot ? Math.round(inWin.filter(s => s.duration < 8 || (s.scroll < 25 && !s.engaged)).length / tot * 100) : 0,
      uniqueCompanies: new Set(inWin.map(s => s.company).filter(Boolean)).size,
      engaged: eng,
      prevEngaged: prevEng,
      resumeDLs: inWin.filter(s => s.events?.resumeDownload).length,
      githubClicks: inWin.filter(s => s.events?.githubClick).length,
      linkedinClicks: inWin.filter(s => s.events?.linkedinClick).length,
    };
  }

  // Expose
  window.OPS_DATA = {
    NOW, START, WINDOW_DAYS, DAY,
    leads,
    organicVisits,
    allSessions,
    dailySeries,
    funnel,
    byChannel,
    heatmap,
    sectionDwell,
    byRole,
    byDevice,
    alerts,
    sections: SECTIONS,
    totals,
    CHANNELS,
    STAGES,
  };
})();
