/* Sessions tab — raw live feed of recent sessions */

const { useState: useStateSe, useMemo: useMemoSe } = React;

function Sessions({ data, onOpenLead }) {
  const [filterEngaged, setFilterEngaged] = useStateSe(false);
  const [filterCh, setFilterCh] = useStateSe("all");
  const [search, setSearch] = useStateSe("");

  const rows = useMemoSe(() => {
    let list = data.allSessions;
    if (filterEngaged) list = list.filter(s => s.engaged);
    if (filterCh !== "all") list = list.filter(s => s.channel === filterCh);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.company || "").toLowerCase().includes(q) ||
        (s.location || "").toLowerCase().includes(q) ||
        (s.referrer || "").toLowerCase().includes(q) ||
        (s.device || "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => b.at - a.at).slice(0, 300);
  }, [data, filterEngaged, filterCh, search]);

  return (
    <Panel
      title="Session stream"
      meta={`${rows.length} most recent`}
      flush
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button
            onClick={() => setFilterEngaged(e => !e)}
            aria-pressed={filterEngaged}
            style={{
              appearance: "none",
              background: filterEngaged ? "oklch(0.82 0.135 75 / 0.1)" : "transparent",
              color: filterEngaged ? "var(--accent)" : "var(--fg-muted)",
              border: 0,
              borderLeft: "1px solid var(--border)",
              padding: "4px 10px",
              fontSize: 10.5,
              fontFamily: "var(--mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>Engaged only</button>
          {[["all","All"],["coldApp","coldApp"],["coldOutreach","coldOutreach"],["hmOutreach","hmOutreach"],["organic","Organic"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilterCh(k)}
              aria-pressed={filterCh === k}
              style={{
                appearance: "none",
                background: filterCh === k ? "oklch(0.82 0.135 75 / 0.1)" : "transparent",
                color: filterCh === k ? "var(--accent)" : "var(--fg-muted)",
                border: 0,
                borderLeft: "1px solid var(--border)",
                padding: "4px 10px",
                fontSize: 10.5,
                fontFamily: "var(--mono)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}>{l}</button>
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
      <div style={{ maxHeight: 700, overflowY: "auto" }}>
        <table className="t">
          <thead>
            <tr>
              <th>When</th>
              <th>Company</th>
              <th>Channel</th>
              <th>Location</th>
              <th>Device</th>
              <th>Referrer</th>
              <th className="num">Dur</th>
              <th className="num">Scroll</th>
              <th>Events</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const events = [];
              if (s.events?.resumeDownload) events.push(["DL", "var(--signal)"]);
              if (s.events?.githubClick) events.push(["GH", "var(--info)"]);
              if (s.events?.linkedinClick) events.push(["LI", "var(--info)"]);
              if (s.events?.contactForm) events.push(["✉", "var(--accent)"]);
              return (
                <tr
                  key={i}
                  onClick={() => s.leadId && onOpenLead(s.leadId)}
                  style={{ cursor: s.leadId ? "pointer" : "default" }}
                >
                  <td className="dim num">{fmtDateTime(s.at)}</td>
                  <td>
                    {s.company
                      ? <span style={{ color: "var(--fg)" }}>{s.company}</span>
                      : <span className="dim">— anonymous —</span>}
                  </td>
                  <td><ChannelChip channel={s.channel} /></td>
                  <td className="dim">{s.location}</td>
                  <td className="dim">{s.device}</td>
                  <td className="dim">{s.referrer}</td>
                  <td className="num">{fmtDur(s.duration)}</td>
                  <td className="num">{s.scroll}%</td>
                  <td>
                    {events.length === 0 ? <span className="dim">—</span> : (
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        {events.map(([t, c], j) => (
                          <span key={j} style={{
                            background: c, color: "oklch(0.16 0.02 70)",
                            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                            padding: "1px 5px", borderRadius: 2, letterSpacing: "0.04em",
                          }}>{t}</span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td>
                    {s.engaged
                      ? <span className="stat engaged"><span className="pip" />engaged</span>
                      : <span className="stat clicked"><span className="pip" />clicked</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

window.Sessions = Sessions;
