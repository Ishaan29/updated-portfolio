/* Channels tab — Sankey + per-channel cards + referrer breakdown */

function Channels({ data }) {
  const channels = [
    { k: "coldApp",      label: "Cold application", desc: "Tracking link embedded in resume / careers-page submission" },
    { k: "coldOutreach", label: "Cold outreach",    desc: "Mass cold-email campaigns to recruiting@" },
    { k: "hmOutreach",   label: "Hiring manager",   desc: "Direct DM / email to specific HMs" },
  ];

  // referrer aggregation
  const refAgg = {};
  for (const l of data.leads) {
    for (const s of l.sessions) {
      refAgg[s.referrer] = (refAgg[s.referrer] || 0) + 1;
    }
  }
  const refs = Object.entries(refAgg).sort((a, b) => b[1] - a[1]);
  const refMax = Math.max(...refs.map(r => r[1]), 1);

  // device aggregation
  const dev = data.byDevice;
  const devTot = dev.desktop + dev.mobile + dev.tablet;

  return (
    <React.Fragment>
      <Panel title="Channel → company → outcome" meta="flow analysis · all leads">
        <SankeyChart leads={data.leads} />
      </Panel>

      <div className="row r-3">
        {channels.map(c => {
          const t = data.byChannel[c.k];
          // companies for this channel
          const leads = data.leads.filter(l => l.channel === c.k);
          const replies = leads.filter(l => !["sent","clicked","engaged","ghosted"].includes(l.stage)).length;
          const eng = leads.filter(l => l.engagedSessions > 0).length;
          return (
            <Panel
              key={c.k}
              title={<span><ChannelChip channel={c.k} /> &nbsp;{c.label}</span>}
              meta={`${t.sent} sent`}
            >
              <div style={{ color: "var(--fg-muted)", fontSize: 11.5, lineHeight: 1.5, marginBottom: 12 }}>
                {c.desc}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 4 }}>
                {[
                  ["Click rate",   t.sent ? Math.round((leads.filter(l => l.sessions.length).length / t.sent) * 100) + "%" : "—"],
                  ["Engage rate", leads.filter(l => l.sessions.length).length ? Math.round((eng / leads.filter(l => l.sessions.length).length) * 100) + "%" : "—"],
                  ["Total visits", t.clicks],
                  ["Reply rate",   t.sent ? Math.round((replies / t.sent) * 100) + "%" : "—"],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: "8px 10px", background: "var(--bg-card)" }}>
                    <div style={{ fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 18, color: "var(--fg)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11 }}>
                <div style={{ color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontSize: 10 }}>top companies</div>
                {leads.slice().sort((a, b) => b.heat - a.heat).slice(0, 4).map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                    <HeatBadge value={l.heat} />
                    <span style={{ color: "var(--fg)" }}>{l.company}</span>
                    <span style={{ color: "var(--fg-dim)", marginLeft: "auto" }}>{l.visits} visits</span>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="row r-1-1">
        <Panel title="Referrers" meta="where clicks originate">
          <div>
            {refs.map(([k, v]) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "150px 1fr 60px", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--grid-line-soft)" }}>
                <span style={{ color: "var(--fg-muted)" }}>{k}</span>
                <span style={{ background: "oklch(0.25 0.008 70)", height: 8, borderRadius: 1, position: "relative" }}>
                  <span style={{ position: "absolute", inset: 0, right: "auto", width: ((v / refMax) * 100) + "%", background: "linear-gradient(90deg, var(--info), var(--accent))", borderRadius: 1 }} />
                </span>
                <span className="num" style={{ textAlign: "right", color: "var(--fg)" }}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Devices" meta={`${fmtNum(devTot)} sessions`}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "8px 4px" }}>
            <Donut
              slices={[
                { value: dev.desktop, color: "var(--accent)" },
                { value: dev.mobile, color: "var(--info)" },
                { value: dev.tablet, color: "var(--signal)" },
              ]}
              size={120}
            />
            <div style={{ flex: 1 }}>
              {[
                ["Desktop", dev.desktop, "var(--accent)", "Likely HM / engineer at workstation"],
                ["Mobile",  dev.mobile,  "var(--info)",   "Often quick-check / recruiter on the move"],
                ["Tablet",  dev.tablet,  "var(--signal)", "Rare; usually weekend browsing"],
              ].map(([l, v, c, hint]) => (
                <div key={l} style={{ padding: "6px 0", borderBottom: "1px solid var(--grid-line-soft)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "10px 1fr auto auto", gap: 10, alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    <span style={{ color: "var(--fg)" }}>{l}</span>
                    <span className="num" style={{ color: "var(--fg-muted)" }}>{v}</span>
                    <span className="num" style={{ color: "var(--fg-dim)", minWidth: 44, textAlign: "right" }}>{fmtPct(v / devTot * 100)}</span>
                  </div>
                  <div style={{ color: "var(--fg-dim)", fontSize: 10.5, marginTop: 2, marginLeft: 18 }}>{hint}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </React.Fragment>
  );
}

window.Channels = Channels;
