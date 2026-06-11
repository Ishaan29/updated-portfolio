/* Overview tab */

const { useState: useStateOv, useMemo: useMemoOv } = React;

function Overview({ data, onOpenLead, onOpenLinkGen }) {
  const [metric, setMetric] = useStateOv("visits");
  const [range, setRange] = useStateOv(60);

  const series = useMemoOv(() => {
    return data.dailySeries.slice(-range).map(d => ({
      date: d.date,
      value: metric === "visits" ? d.visits
           : metric === "engaged" ? d.engaged
           : metric === "pageViews" ? d.pageViews
           : d.bounces,
    }));
  }, [metric, range, data]);

  const totals = useMemoOv(() => data.totals(range), [range, data]);

  const channelMix = [
    { label: "coldApp",      value: data.byChannel.coldApp.sent,      color: "var(--info)" },
    { label: "coldOutreach", value: data.byChannel.coldOutreach.sent, color: "var(--accent)" },
    { label: "hmOutreach",   value: data.byChannel.hmOutreach.sent,   color: "var(--signal)" },
  ];

  const clickRate = data.funnel.outreach ? (data.funnel.clicked / data.funnel.outreach * 100) : 0;
  const engageRate = data.funnel.clicked ? (data.funnel.engaged / data.funnel.clicked * 100) : 0;
  const replyRate = data.funnel.engaged ? (data.funnel.replied / data.funnel.engaged * 100) : 0;

  return (
    <React.Fragment>
      {/* KPI strip */}
      <div className="kpis">
        <div className="kpi">
          <span className="label">Visits · {range}d</span>
          <span className="value num">{fmtNum(totals.visits)}</span>
          <span className="sub">
            <Delta now={totals.visits} prev={totals.prevVisits} />
            <span className="text-dim">vs prior {range}d</span>
          </span>
        </div>
        <div className="kpi">
          <span className="label">Companies</span>
          <span className="value num">{totals.uniqueCompanies}</span>
          <span className="sub text-dim">{data.leads.length} total tracked</span>
        </div>
        <div className="kpi">
          <span className="label">Click rate</span>
          <span className="value num">{fmtPct(clickRate)}</span>
          <span className="sub text-dim">{data.funnel.clicked}/{data.funnel.outreach} clicked</span>
        </div>
        <div className="kpi">
          <span className="label">Engage rate</span>
          <span className="value num">{fmtPct(engageRate)}</span>
          <span className="sub text-dim">read ≥50% of page</span>
        </div>
        <div className="kpi hot">
          <span className="label">Reply rate</span>
          <span className="value num">{fmtPct(replyRate)}</span>
          <span className="sub text-dim">engaged → reply</span>
        </div>
        <div className="kpi">
          <span className="label">Resume / GH / LI</span>
          <span className="value num" style={{ fontSize: 22 }}>
            {totals.resumeDLs}<span style={{ color: "var(--fg-dim)" }}> / </span>
            {totals.githubClicks}<span style={{ color: "var(--fg-dim)" }}> / </span>
            {totals.linkedinClicks}
          </span>
          <span className="sub text-dim">conversion events</span>
        </div>
      </div>

      {/* Alerts */}
      <Panel title="◉ Live signals" meta={`${data.alerts.length} active`}>
        <div className="alerts" style={{ border: 0 }}>
          {data.alerts.map((a, i) => (
            <div key={i} className={"alert " + a.kind} style={{ borderBottom: i === data.alerts.length-1 ? 0 : undefined }}>
              <span className="ic">{a.kind === "hot" ? "!" : a.kind === "warm" ? "▲" : "i"}</span>
              <span className="when">
                {a.when ? fmtRelative(a.when) : "—"}
              </span>
              <span className="msg">
                {a.msg.map((m, j) =>
                  typeof m === "string"
                    ? <React.Fragment key={j}>{j ? " " : ""}{m}</React.Fragment>
                    : <span key={j} className="co"> {m.co} </span>
                )}
              </span>
              <button className="act" onClick={() => a.leadId && onOpenLead(a.leadId)}>
                {a.leadId ? "open lead →" : "review"}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Time series with metric switcher */}
      <Panel
        title="Traffic timeline"
        meta={`${range} days · ${metric}`}
        right={
          <div style={{ display: "flex", gap: 0 }}>
            {[
              ["visits", "Visits"],
              ["engaged", "Engaged"],
              ["pageViews", "Page views"],
              ["bounces", "Bounces"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                aria-pressed={metric === k}
                style={{
                  appearance: "none",
                  background: metric === k ? "oklch(0.82 0.135 75 / 0.1)" : "transparent",
                  color: metric === k ? "var(--accent)" : "var(--fg-muted)",
                  border: 0,
                  borderLeft: "1px solid var(--border)",
                  padding: "4px 10px",
                  fontSize: 10.5,
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}>
                {l}
              </button>
            ))}
          </div>
        }
      >
        <AreaChart
          data={series}
          height={240}
          accent={metric === "engaged" ? "var(--signal)" : metric === "bounces" ? "var(--danger)" : "var(--accent)"}
          label={metric}
        />
      </Panel>

      {/* Funnel + Channel + Heatmap row */}
      <div className="row r-1-1">
        <Panel title="Conversion funnel" meta="cumulative · all-time">
          <FunnelChart data={data.funnel} />
        </Panel>

        <Panel title="Day × hour activity" meta="UTC · all visits">
          <HeatmapChart data={data.heatmap} />
        </Panel>
      </div>

      <div className="row r-1-2">
        <Panel title="Channel mix" meta="outreach by source">
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "6px 4px" }}>
            <Donut slices={channelMix} />
            <div style={{ flex: 1 }}>
              {channelMix.map(s => {
                const tot = data.byChannel[s.label];
                const leadsInCh = data.leads.filter(l => l.channel === s.label);
                const clickedLeads = leadsInCh.filter(l => l.sessions.length > 0).length;
                const ctr = leadsInCh.length ? (clickedLeads / leadsInCh.length * 100) : 0;
                return (
                  <div key={s.label} style={{ display: "grid", gridTemplateColumns: "12px 110px auto auto auto", gap: 14, alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--grid-line-soft)", fontSize: 11.5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    <span style={{ color: "var(--fg)" }}>{s.label}</span>
                    <span style={{ color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{tot.sent} sent</span>
                    <span style={{ color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{tot.clicks} clicks</span>
                    <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums", minWidth: 44, textAlign: "right" }}>
                      {fmtPct(ctr)}
                    </span>
                  </div>
                );
              })}
              <div style={{ marginTop: 10, fontSize: 10.5, color: "var(--fg-dim)", letterSpacing: "0.04em" }}>
                CTR = unique companies that clicked / outreach sent
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Section dwell time" meta="avg seconds per engaged session">
          <DwellBars data={data.sectionDwell} />
        </Panel>
      </div>
    </React.Fragment>
  );
}

window.Overview = Overview;
