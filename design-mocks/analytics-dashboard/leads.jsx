/* Leads tab — prioritization list with sparkline per row */

const { useState: useStateLd, useMemo: useMemoLd } = React;

function Leads({ data, onOpenLead }) {
  const [sortKey, setSortKey] = useStateLd("heat");
  const [sortDir, setSortDir] = useStateLd("desc");
  const [filter, setFilter] = useStateLd("all");
  const [search, setSearch] = useStateLd("");

  const filtered = useMemoLd(() => {
    let list = data.leads;
    if (filter === "hot") list = list.filter(l => l.heat >= 60);
    else if (filter === "engaged") list = list.filter(l => l.engagedSessions > 0);
    else if (filter === "ghosted") list = list.filter(l => l.stage === "ghosted");
    else if (filter === "replied") list = list.filter(l => !["sent","clicked","engaged","ghosted"].includes(l.stage));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => l.company.toLowerCase().includes(s) || l.channel.toLowerCase().includes(s));
    }
    list = [...list].sort((a, b) => {
      const get = (l) => {
        switch (sortKey) {
          case "heat": return l.heat;
          case "company": return l.company;
          case "channel": return l.channel;
          case "stage": return l.stage;
          case "visits": return l.visits;
          case "engaged": return l.engagedSessions;
          case "lastSeen": return l.lastSeen ? +l.lastSeen : 0;
          case "outreach": return +l.outreachAt;
          default: return 0;
        }
      };
      const va = get(a); const vb = get(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, sortKey, sortDir, filter, search]);

  const flip = (k) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(k === "company" || k === "channel" ? "asc" : "desc"); }
  };

  const headerCell = (k, label, align) => (
    <th
      className={"sortable" + (align === "right" ? " num" : "")}
      aria-sort={sortKey === k ? sortDir : "none"}
      onClick={() => flip(k)}
    >
      {label}<span className="arr">{sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
    </th>
  );

  return (
    <Panel
      title="Lead prioritization"
      meta={`${filtered.length} of ${data.leads.length} companies`}
      flush
      right={
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          {[["all","All"],["hot","Hot ≥60"],["engaged","Engaged"],["replied","Replied+"],["ghosted","Ghosted"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              style={{
                appearance: "none",
                background: filter === k ? "oklch(0.82 0.135 75 / 0.1)" : "transparent",
                color: filter === k ? "var(--accent)" : "var(--fg-muted)",
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
          <input
            type="text"
            placeholder="filter…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "oklch(0.16 0.006 70)",
              border: 0,
              borderLeft: "1px solid var(--border)",
              color: "var(--fg)",
              fontFamily: "var(--mono)",
              fontSize: 11.5,
              padding: "4px 10px",
              outline: "none",
              width: 140,
            }}
          />
        </div>
      }
    >
      <table className="t">
        <thead>
          <tr>
            {headerCell("heat", "Heat", "right")}
            {headerCell("company", "Company")}
            <th>Role · tier</th>
            {headerCell("channel", "Channel")}
            {headerCell("stage", "Stage")}
            {headerCell("visits", "Visits", "right")}
            <th className="num">Engaged</th>
            <th>30-day trend</th>
            {headerCell("lastSeen", "Last seen", "right")}
            {headerCell("outreach", "Outreach", "right")}
          </tr>
        </thead>
        <tbody>
          {filtered.map(l => (
            <tr key={l.id} onClick={() => onOpenLead(l.id)} className={l.heat >= 80 ? "hot" : ""}>
              <td className="num"><HeatBadge value={l.heat} /></td>
              <td>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{l.company}</span>
              </td>
              <td className="dim">
                <span style={{ color: "var(--fg-muted)" }}>{l.role}</span>
                <span style={{ color: "var(--fg-dim)" }}> · {l.tier}</span>
              </td>
              <td><ChannelChip channel={l.channel} /></td>
              <td><StatusChip stage={l.stage} /></td>
              <td className="num">{l.visits}</td>
              <td className="num"><EngBar engaged={l.engagedSessions} total={l.visits} /></td>
              <td>
                <Sparkline data={l.spark} width={84} height={18}
                  color={l.heat >= 80 ? "var(--danger)" : l.heat >= 60 ? "var(--accent)" : "var(--fg-muted)"} />
              </td>
              <td className="num dim">{l.lastSeen ? fmtRelative(window.OPS_DATA.NOW - l.lastSeen) : "—"}</td>
              <td className="num dim">{fmtRelative(window.OPS_DATA.NOW - l.outreachAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

window.Leads = Leads;
