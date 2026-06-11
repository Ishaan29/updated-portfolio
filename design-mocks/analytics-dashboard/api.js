/* ============================================================
   API client — single seam between dashboard and data source.
   
   TODAY: returns window.OPS_DATA (the seeded mock).
   TOMORROW: swap each method to fetch() the real backend
             described in admin/visits/HANDOFF.md.
   ============================================================ */

window.OPS_API = {
  /* ----- mode flag (toggle when backend is live) ----- */
  mode: "mock",  // "mock" | "live"
  baseUrl: "/api/visits",  // when live

  /* ----- read-side: dashboard data ----- */

  // GET /api/visits/summary?range=60
  async summary(range = 60) {
    if (this.mode === "mock") {
      const d = window.OPS_DATA;
      return {
        range, now: d.NOW,
        totals: d.totals(range),
        funnel: d.funnel,
        byChannel: d.byChannel,
        byRole: d.byRole,
        byDevice: d.byDevice,
        alerts: d.alerts,
        heatmap: d.heatmap,
        sectionDwell: d.sectionDwell,
        dailySeries: d.dailySeries,
      };
    }
    return fetch(`${this.baseUrl}/summary?range=${range}`).then(r => r.json());
  },

  // GET /api/visits/leads
  async leads() {
    if (this.mode === "mock") return window.OPS_DATA.leads;
    return fetch(`${this.baseUrl}/leads`).then(r => r.json());
  },

  // GET /api/visits/leads/:id
  async lead(id) {
    if (this.mode === "mock") return window.OPS_DATA.leads.find(l => l.id === id);
    return fetch(`${this.baseUrl}/leads/${id}`).then(r => r.json());
  },

  // GET /api/visits/sessions?limit=300&channel=…&engaged=…
  async sessions({ limit = 300, channel, engaged, search } = {}) {
    if (this.mode === "mock") {
      let list = window.OPS_DATA.allSessions;
      if (engaged) list = list.filter(s => s.engaged);
      if (channel && channel !== "all") list = list.filter(s => s.channel === channel);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(s =>
          (s.company || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q) ||
          (s.referrer || "").toLowerCase().includes(q) ||
          (s.device || "").toLowerCase().includes(q)
        );
      }
      return [...list].sort((a, b) => b.at - a.at).slice(0, limit);
    }
    const qs = new URLSearchParams({ limit, ...(channel && { channel }), ...(engaged && { engaged: "1" }), ...(search && { search }) });
    return fetch(`${this.baseUrl}/sessions?${qs}`).then(r => r.json());
  },

  /* ----- write-side: link generation + auth ----- */

  // POST /api/visits/links { channel, company } -> { slug, url }
  async createLink({ channel, company }) {
    const slug = company.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const url = `${location.origin}/c/${channel}-${slug}`;
    if (this.mode === "mock") return { slug: `${channel}-${slug}`, url };
    return fetch(`${this.baseUrl}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, company }),
    }).then(r => r.json());
  },

  // POST /api/visits/auth/login { password } -> { token }
  async login(password) {
    if (this.mode === "mock") {
      // Reuse the FNV hash from auth.jsx; for now just check sessionStorage
      return { ok: true };
    }
    return fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(r => r.json());
  },
};
