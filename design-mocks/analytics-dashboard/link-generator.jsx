/* Link generator modal */

const { useState: useStateLG } = React;

function LinkGenerator({ onClose }) {
  const [channel, setChannel] = useStateLG("coldApp");
  const [company, setCompany] = useStateLG("");
  const [copied, setCopied] = useStateLG(false);

  const slug = company.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const url = `https://eshaanbajpai.dev/c/${channel}-${slug || "company"}`;

  function copy() {
    if (!slug) return;
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header className="modal-head">
          <h2>⟶ Generate tracking link</h2>
          <button className="x" onClick={onClose} aria-label="close">✕</button>
        </header>
        <div className="modal-body">
          <div className="field">
            <label>Channel</label>
            <select value={channel} onChange={e => setChannel(e.target.value)}>
              <option value="coldApp">coldApp — embedded in resume / careers-page submission</option>
              <option value="coldOutreach">coldOutreach — mass cold email to recruiting@</option>
              <option value="hmOutreach">hmOutreach — DM / email to specific hiring manager</option>
            </select>
          </div>
          <div className="field">
            <label>Company name</label>
            <input
              type="text"
              placeholder="e.g. stripe, anthropic, openai"
              value={company}
              onChange={e => setCompany(e.target.value)}
              autoFocus
            />
          </div>

          <div className="preview-url">
            <span style={{ color: "var(--fg-dim)" }}>↗</span>
            <span>{url}</span>
            <button className={"copy" + (copied ? " done" : "")} onClick={copy} disabled={!slug}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: "var(--fg-dim)", lineHeight: 1.6, fontFamily: "var(--mono)" }}>
            <div style={{ color: "var(--fg-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>How it routes</div>
            <div>1. visitor opens <code style={{ color: "var(--accent)" }}>/c/{channel}-{slug || "co"}</code></div>
            <div>2. edge worker records click → channel, company, timestamp, headers</div>
            <div>3. 302 redirect to <code style={{ color: "var(--accent)" }}>/</code> with session cookie attached</div>
            <div>4. on-page tracker correlates session, scroll, dwell, event clicks</div>
            <div>5. heat score recomputed; surfaces in <code style={{ color: "var(--accent)" }}>/admin/visits</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LinkGenerator = LinkGenerator;
