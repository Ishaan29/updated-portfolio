/* Shared UI atoms for /admin/visits */

const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const fmtPct = (n) => (n == null ? "—" : Math.round(n) + "%");
const fmtDur = (s) => {
  if (s == null) return "—";
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60); const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
};
const fmtDate = (d) => {
  if (!d) return "—";
  d = new Date(d);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const fmtDateTime = (d) => {
  if (!d) return "—";
  d = new Date(d);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};
const fmtRelative = (ms) => {
  if (ms == null) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  if (s < 86400 * 7) return Math.floor(s/86400) + "d ago";
  if (s < 86400 * 30) return Math.floor(s/(86400*7)) + "w ago";
  return Math.floor(s/(86400*30)) + "mo ago";
};

const heatClass = (h) => {
  if (h >= 80) return "h-90";
  if (h >= 60) return "h-70";
  if (h >= 40) return "h-50";
  if (h >= 20) return "h-30";
  return "h-00";
};

function HeatBadge({ value }) {
  return <span className={"heat " + heatClass(value)}>{value}</span>;
}

function StatusChip({ stage }) {
  return (
    <span className={"stat " + stage}>
      <span className="pip"></span>
      {stage}
    </span>
  );
}

function ChannelChip({ channel }) {
  if (!channel) return null;
  return <span className={"ch " + channel}>{channel}</span>;
}

function Delta({ now, prev }) {
  if (prev == null || prev === 0) {
    if (now > 0) return <span className="delta up">+new</span>;
    return <span className="delta flat">—</span>;
  }
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="delta flat">0%</span>;
  if (pct > 0) return <span className="delta up">▲ {pct}%</span>;
  return <span className="delta down">▼ {Math.abs(pct)}%</span>;
}

/* Inline sparkline */
function Sparkline({ data, width = 90, height = 18, color = "var(--accent)" }) {
  if (!data || !data.length) return <svg width={width} height={height} />;
  const max = Math.max(1, ...data);
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 2) - 1;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const fillPath = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkcell">
      <path d={fillPath} fill={color} opacity="0.18" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length-1][0]} cy={points[points.length-1][1]} r="1.6" fill={color} />
      )}
    </svg>
  );
}

/* engagement progress bar (inline cell) */
function EngBar({ engaged, total }) {
  const pct = total ? Math.round((engaged / total) * 100) : 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontVariantNumeric: "tabular-nums" }}>
      <span className="num" style={{ color: "var(--fg)", minWidth: 36, textAlign: "right" }}>{engaged}/{total}</span>
      <span className="engbar"><i style={{ width: pct + "%" }} /></span>
    </span>
  );
}

/* Panel wrapper */
function Panel({ title, meta, children, right, flush, style }) {
  return (
    <section className="panel" style={style}>
      <header className="panel-head">
        <h3>{title}</h3>
        <span className="spacer" />
        {meta && <span className="meta">{meta}</span>}
        {right}
      </header>
      <div className={"panel-body" + (flush ? " flush" : "")}>{children}</div>
    </section>
  );
}

/* expose */
Object.assign(window, {
  fmtNum, fmtPct, fmtDur, fmtDate, fmtDateTime, fmtRelative,
  heatClass, HeatBadge, StatusChip, ChannelChip, Delta, Sparkline, EngBar, Panel,
});
