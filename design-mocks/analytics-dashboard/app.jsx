/* Root app shell — top bar, tab routing, lead-detail drill-down */

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

function App() {
  const data = window.OPS_DATA;
  const [tab, setTab] = useStateApp("overview");
  const [leadId, setLeadId] = useStateApp(null);
  const [showLinkGen, setShowLinkGen] = useStateApp(false);

  const tabs = [
    { k: "overview", label: "Overview", count: null },
    { k: "leads",    label: "Leads",    count: data.leads.length },
    { k: "channels", label: "Channels", count: 3 },
    { k: "sessions", label: "Sessions", count: data.allSessions.length },
  ];

  const openLead = (id) => {
    setLeadId(id);
    setTab("lead-detail");
    window.scrollTo({ top: 0 });
  };
  const backToLeads = () => {
    setLeadId(null);
    setTab("leads");
  };

  const lead = useMemoApp(() => data.leads.find(l => l.id === leadId), [leadId, data]);

  // realtime "now" tick for the topbar clock
  const [, setTick] = useStateApp(0);
  useEffectApp(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const topVisits = data.totals(7).visits;

  return (
    <div className="ops-shell">
      <header className="ops-topbar">
        <div className="brand">
          <span className="dot" />
          <span className="path">eshaanbajpai.dev / <b>admin / visits</b></span>
        </div>
        <nav className="tabs">
          {tabs.map(t => (
            <button
              key={t.k}
              className="tab"
              aria-current={tab === t.k || (t.k === "leads" && tab === "lead-detail")}
              onClick={() => { setLeadId(null); setTab(t.k); }}
            >
              {t.label}
              {t.count != null && <span className="count">{t.count}</span>}
            </button>
          ))}
        </nav>
        <div className="right">
          <span className="cell">
            <span className="live" />
            live
          </span>
          <span className="cell">
            7d &nbsp;<b className="num">{topVisits}</b>&nbsp; visits
          </span>
          <span className="cell">
            <span className="text-dim">{new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
          </span>
          <button
            className="cell"
            onClick={() => {
              sessionStorage.removeItem("ops_visits_auth_v1_session");
              location.reload();
            }}
            style={{
              background: "transparent", border: 0, borderLeft: "1px solid var(--border)",
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg-muted)", cursor: "pointer",
            }}
          >
            logout ↗
          </button>
        </div>
      </header>

      {/* Sub toolbar — only on non-detail tabs */}
      {tab !== "lead-detail" && (
        <div className="ops-toolbar">
          <span className="crumb">
            {tab === "overview" && <>signals / <b>overview</b></>}
            {tab === "leads" && <>pipeline / <b>leads</b></>}
            {tab === "channels" && <>attribution / <b>channels</b></>}
            {tab === "sessions" && <>raw / <b>session stream</b></>}
          </span>
          <span className="spacer" />
          <button className="tool primary" onClick={() => setShowLinkGen(true)}>
            ◫ &nbsp;Generate tracking link
          </button>
          <button className="tool" onClick={() => alert("Export CSV — not wired in this demo.")}>
            ↓ &nbsp;Export CSV
          </button>
        </div>
      )}

      <main className="ops-main">
        {tab === "overview" && <Overview data={data} onOpenLead={openLead} onOpenLinkGen={() => setShowLinkGen(true)} />}
        {tab === "leads" && <Leads data={data} onOpenLead={openLead} />}
        {tab === "lead-detail" && lead && <LeadDetail lead={lead} onBack={backToLeads} />}
        {tab === "channels" && <Channels data={data} />}
        {tab === "sessions" && <Sessions data={data} onOpenLead={openLead} />}
      </main>

      {showLinkGen && <LinkGenerator onClose={() => setShowLinkGen(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthGate>
    <App />
  </AuthGate>
);
