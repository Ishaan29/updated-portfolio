/* Lead detail — drill-down view */

const { useMemo: useMemoLD } = React;

function LeadDetail({ lead, onBack }) {
  // build merged chronological feed of sessions + outreach
  const feed = useMemoLD(() => {
    const items = [];
    for (const s of lead.sessions) {
      items.push({ at: s.at, kind: "visit", session: s, engaged: s.engaged });
      for (const ev of Object.keys(s.events || {})) {
        if (s.events[ev]) {
          items.push({ at: new Date(s.at.getTime() + 1000), kind: ev });
        }
      }
    }
    for (const o of lead.outreach) {
      items.push({ at: o.at, kind: "outreach", outreach: o });
    }
    return items.sort((a, b) => b.at - a.at);
  }, [lead]);

  const eventCounts = useMemoLD(() => {
    const c = { resumeDownload: 0, githubClick: 0, linkedinClick: 0, contactForm: 0 };
    for (const s of lead.sessions) {
      for (const k of Object.keys(c)) if (s.events?.[k]) c[k]++;
    }
    return c;
  }, [lead]);

  // section dwell aggregated for this lead
  const sectionDwell = useMemoLD(() => {
    const agg = {};
    for (const s of lead.sessions) {
      if (!s.sections) continue;
      for (const sec of Object.keys(s.sections)) {
        if (!agg[sec]) agg[sec] = { total: 0, n: 0 };
        agg[sec].total += s.sections[sec];
        agg[sec].n++;
      }
    }
    return window.OPS_DATA.sections.map(name => ({
      name,
      avg: agg[name] ? Math.round(agg[name].total / agg[name].n) : 0,
      visits: agg[name]?.n || 0,
    }));
  }, [lead]);

  return (
    <React.Fragment>
      <div className="ops-toolbar">
        <button className="back" onClick={onBack}>← Back to leads</button>
        <span style={{ marginLeft: 14 }} className="crumb">
          Leads / <b>{lead.company}</b>
        </span>
        <span className="spacer" />
        <span className="crumb">
          Heat <HeatBadge value={lead.heat} /> &nbsp;·&nbsp; Stage <StatusChip stage={lead.stage} />
        </span>
      </div>

      <Panel flush style={{ background: "linear-gradient(180deg, oklch(0.22 0.008 70), var(--bg-card))" }}>
        <div className="lead-head">
          <div>
            <h1 className="title">{lead.company}</h1>
            <div className="sub">
              <span>{lead.role} · {lead.tier}</span>
              <span style={{ color: "var(--fg-dim)" }}>·</span>
              <span>{lead.hq}</span>
              <span style={{ color: "var(--fg-dim)" }}>·</span>
              <span style={{ color: "var(--fg-dim)" }}>{lead.domain}</span>
              <span style={{ color: "var(--fg-dim)" }}>·</span>
              <ChannelChip channel={lead.channel} />
            </div>
            <div className="sub" style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 11.5 }}>
              <span className="text-dim">tracking link:</span>
              <code style={{ color: "var(--accent)" }}>/c/{lead.channel}-{lead.company.toLowerCase().split(" ")[0]}</code>
            </div>
          </div>
          <div className="meta">
            <div className="cell">
              <div className="k">Visits</div>
              <div className="v num">{lead.visits}</div>
            </div>
            <div className="cell">
              <div className="k">Engaged</div>
              <div className="v num">{lead.engagedSessions}</div>
            </div>
            <div className="cell">
              <div className="k">Resume DL</div>
              <div className="v num" style={{ color: lead.resumeDLs ? "var(--signal)" : "var(--fg)" }}>
                {lead.resumeDLs}
              </div>
            </div>
            <div className="cell">
              <div className="k">Outreach</div>
              <div className="v">{fmtDate(lead.outreachAt)}</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Per-lead kpi strip — section dwell summary */}
      <div className="row r-1-2">
        <Panel title="Conversion events" meta="this lead">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 4 }}>
            {[
              ["Resume downloads", eventCounts.resumeDownload, "var(--signal)"],
              ["GitHub clicks",    eventCounts.githubClick,    "var(--info)"],
              ["LinkedIn clicks",  eventCounts.linkedinClick,  "var(--info)"],
              ["Contact form",     eventCounts.contactForm,    "var(--accent)"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ padding: "10px 12px", background: "var(--bg-card)" }}>
                <div style={{ fontSize: 10.5, color: "var(--fg-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
                <div style={{ fontSize: 22, color: v ? c : "var(--fg-dim)", fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Section dwell time" meta="avg seconds per session">
          <DwellBars data={sectionDwell} />
        </Panel>
      </div>

      {/* Timeline + sessions */}
      <div className="row r-1-1">
        <Panel title="Sessions" meta={`${lead.sessions.length} total`} flush>
          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            <table className="t">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Location</th>
                  <th>Device</th>
                  <th>Referrer</th>
                  <th className="num">Dur</th>
                  <th className="num">Scroll</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lead.sessions.slice().reverse().map((s, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td className="dim">{fmtDateTime(s.at)}</td>
                    <td>{s.location}</td>
                    <td className="dim">{s.device}</td>
                    <td className="dim">{s.referrer}</td>
                    <td className="num">{fmtDur(s.duration)}</td>
                    <td className="num">{s.scroll}%</td>
                    <td>
                      {s.engaged
                        ? <span className="stat engaged"><span className="pip" />engaged</span>
                        : <span className="stat clicked"><span className="pip" />clicked</span>}
                    </td>
                  </tr>
                ))}
                {lead.sessions.length === 0 && (
                  <tr style={{ cursor: "default" }}>
                    <td colSpan="7" className="dim" style={{ padding: 30, textAlign: "center" }}>
                      No clicks yet — link hasn't been opened.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Chronological feed" meta="outreach + visits + events">
          <div className="timeline" style={{ maxHeight: 480, overflowY: "auto" }}>
            {feed.map((it, i) => {
              if (it.kind === "outreach") {
                return (
                  <div key={i} className="tl-item outreach">
                    <span className="dot" />
                    <div className="ts">{fmtDateTime(it.at)}</div>
                    <div className="hdr">
                      <span>{it.outreach.label}</span>
                    </div>
                    <div className="body">{it.outreach.meta}</div>
                  </div>
                );
              }
              if (it.kind === "visit") {
                const s = it.session;
                return (
                  <div key={i} className={"tl-item visit" + (s.engaged ? " engaged" : "")}>
                    <span className="dot" />
                    <div className="ts">{fmtDateTime(it.at)}</div>
                    <div className="hdr">
                      <span>
                        {s.engaged ? "Engaged visit" : "Site visit"} · {s.location} · {fmtDur(s.duration)} · {s.scroll}% scroll
                      </span>
                    </div>
                    <div className="body">
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ color: "var(--fg-dim)" }}>via</span> {s.referrer} <span style={{ color: "var(--fg-dim)" }}>on</span> {s.device}
                      </div>
                      {s.path && s.path.length > 0 && (
                        <div className="path-step">
                          path:&nbsp;
                          {s.path.map((p, j) => (
                            <React.Fragment key={j}>
                              <b>{p}</b>{j < s.path.length - 1 ? <span style={{ color: "var(--fg-dim)" }}> → </span> : null}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                      {Object.keys(s.sections || {}).length > 0 && (
                        <div className="path-step" style={{ marginTop: 4 }}>
                          sections:&nbsp;
                          {Object.entries(s.sections).map(([k, v], j) => (
                            <React.Fragment key={k}>
                              <b>{k}</b><span style={{ color: "var(--fg-dim)" }}> {v}s</span>
                              {j < Object.keys(s.sections).length - 1 ? <span style={{ color: "var(--fg-dim)" }}>, </span> : null}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              const labels = {
                resumeDownload: ["Resume downloaded", "var(--signal)"],
                githubClick: ["Clicked GitHub link", "var(--info)"],
                linkedinClick: ["Clicked LinkedIn link", "var(--info)"],
                contactForm: ["Submitted contact form", "var(--accent)"],
              };
              const [label, color] = labels[it.kind] || ["Event", "var(--fg)"];
              return (
                <div key={i} className={"tl-item " + (it.kind === "resumeDownload" ? "download" : "reply")}>
                  <span className="dot" />
                  <div className="ts">{fmtDateTime(it.at)}</div>
                  <div className="hdr"><span style={{ color }}>{label}</span></div>
                </div>
              );
            })}
            {feed.length === 0 && (
              <div className="text-dim" style={{ padding: 30, textAlign: "center" }}>No activity recorded.</div>
            )}
          </div>
        </Panel>
      </div>
    </React.Fragment>
  );
}

window.LeadDetail = LeadDetail;
