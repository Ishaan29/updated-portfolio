/* Larger chart components: AreaChart, Funnel, Heatmap, Sankey, DwellBars */

const { useState, useRef, useEffect } = React;

/* ============================================================
   AreaChart — time-series with hover tooltip
   data = [{ date, value }]
============================================================ */
function AreaChart({ data, height = 220, accent = "var(--accent)", label = "Visitors" }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);
  const [w, setW] = useState(800);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.floor(e.contentRect.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const padL = 38, padR = 14, padT = 12, padB = 26;
  const innerW = Math.max(50, w - padL - padR);
  const innerH = height - padT - padB;
  const max = Math.max(1, ...data.map(d => d.value));
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padL + i * stepX;
    const y = padT + innerH - (d.value / niceMax) * innerH;
    return [x, y, d];
  });
  const linePath = points.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const fillPath = linePath + ` L${padL + innerW},${padT + innerH} L${padL},${padT + innerH} Z`;

  // x-axis ticks: every 6 days roughly
  const tickEvery = Math.max(1, Math.floor(data.length / 8));
  const xticks = data.map((d, i) => ({ i, d })).filter(x => x.i % tickEvery === 0);
  // y-axis ticks: 0, max/4, max/2, 3max/4, max
  const yticks = [0, niceMax / 4, niceMax / 2, niceMax * 3/4, niceMax].map(v => Math.round(v));

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < padL || x > padL + innerW) { setHover(null); return; }
    const idx = Math.round((x - padL) / stepX);
    if (idx < 0 || idx >= data.length) { setHover(null); return; }
    const p = points[idx];
    setHover({ idx, x: p[0], y: p[1], data: p[2] });
  }

  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
      <svg
        width={w} height={height} viewBox={`0 0 ${w} ${height}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: "block" }}
      >
        {/* Grid */}
        {yticks.map((v, i) => {
          const y = padT + innerH - (v / niceMax) * innerH;
          return (
            <g key={i}>
              <line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke="var(--grid-line-soft)" strokeDasharray="2 4" />
              <text x={padL - 8} y={y + 3} fill="var(--fg-dim)" fontSize="10" textAnchor="end" fontFamily="var(--mono)">{v}</text>
            </g>
          );
        })}
        {/* X axis */}
        {xticks.map(({ i, d }) => {
          const x = padL + i * stepX;
          return (
            <text key={i} x={x} y={height - 8} fill="var(--fg-dim)" fontSize="10" textAnchor="middle" fontFamily="var(--mono)">
              {fmtDate(d.date)}
            </text>
          );
        })}
        {/* Area + line */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke={accent} strokeWidth="1.6" />
        {/* Hover */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padT} y2={padT + innerH} stroke="var(--accent)" strokeDasharray="2 3" opacity="0.5" />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill={accent} stroke="var(--bg)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      {hover && (
        <div style={{
          position: "absolute",
          left: Math.min(hover.x + 12, w - 160),
          top: hover.y - 36,
          background: "oklch(0.13 0.006 70)",
          border: "1px solid var(--border-strong)",
          borderRadius: 4,
          padding: "6px 10px",
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--fg)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 20px -8px black",
        }}>
          <div style={{ color: "var(--fg-dim)", fontSize: 10 }}>{fmtDate(hover.data.date)}</div>
          <div style={{ fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: accent }}>● </span>{label}: <b>{hover.data.value}</b>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Funnel — Outreach → Click → Engaged → Replied → Screen → Onsite → Offer
============================================================ */
function FunnelChart({ data }) {
  const stages = [
    ["Outreach sent", data.outreach, null],
    ["Link clicked",  data.clicked,  data.outreach],
    ["Engaged read",  data.engaged,  data.clicked],
    ["Replied",       data.replied,  data.engaged],
    ["Phone screen",  data.screen,   data.replied],
    ["Onsite",        data.onsite,   data.screen],
    ["Offer",         data.offer,    data.onsite],
  ];
  const top = Math.max(...stages.map(s => s[1]));
  return (
    <div className="funnel">
      {stages.map(([label, count, prev], i) => {
        const widthPct = top ? (count / top) * 100 : 0;
        const conv = prev != null && prev > 0 ? (count / prev) * 100 : null;
        const dropPct = prev != null && prev > 0 ? ((prev - count) / prev) * 100 : null;
        const convClass = conv == null ? "" : conv >= 60 ? "good" : conv >= 25 ? "warn" : "bad";
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div className="drop">
                <div className="label" style={{ color: "var(--fg-dim)", fontSize: 10 }}>
                  drop-off
                </div>
                <div className="line" />
                <div style={{ textAlign: "right", color: "var(--fg-dim)", fontSize: 10 }}>
                  − {prev - count}
                </div>
                <div style={{ textAlign: "right", color: "var(--fg-dim)", fontSize: 10 }}>
                  {Math.round(dropPct)}%
                </div>
              </div>
            )}
            <div className="stage">
              <span className="label">{label}</span>
              <span style={{ display: "block", position: "relative" }}>
                <span className="bar" style={{ width: widthPct + "%" }} />
              </span>
              <span className="count">{count}</span>
              <span className={"conv " + convClass}>{conv != null ? Math.round(conv) + "%" : "—"}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================================================
   Heatmap — 7 days × 24 hours
============================================================ */
function HeatmapChart({ data }) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const flat = data.flat();
  const max = Math.max(1, ...flat);
  const level = (v) => {
    if (!v) return "";
    const r = v / max;
    if (r < 0.15) return "l1";
    if (r < 0.35) return "l2";
    if (r < 0.6) return "l3";
    if (r < 0.85) return "l4";
    return "l5";
  };
  return (
    <div>
      <div className="heat-grid">
        <div className="corner"></div>
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={h} className="hr-lab">{h % 3 === 0 ? h : ""}</div>
        ))}
        {data.map((row, d) => (
          <React.Fragment key={d}>
            <div className="day-lab">{days[d]}</div>
            {row.map((v, h) => (
              <div key={h} className={"heat-cell " + level(v)} title={`${days[d]} ${h}:00 — ${v} visits`} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="heat-legend">
        <span>less</span>
        <span className="sw heat-cell"></span>
        <span className="sw heat-cell l1"></span>
        <span className="sw heat-cell l2"></span>
        <span className="sw heat-cell l3"></span>
        <span className="sw heat-cell l4"></span>
        <span className="sw heat-cell l5"></span>
        <span>more</span>
        <span style={{ marginLeft: "auto" }}>peak hour: {findPeak(data)}</span>
      </div>
    </div>
  );
}
function findPeak(grid) {
  let best = { d: 0, h: 0, v: -1 };
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  grid.forEach((row, d) => row.forEach((v, h) => { if (v > best.v) best = { d, h, v }; }));
  return `${days[best.d]} ${best.h}:00 (${best.v} visits)`;
}

/* ============================================================
   Sankey — Channel → Company (top N) → Outcome
============================================================ */
function SankeyChart({ leads }) {
  // Columns:
  // 0: Channels
  // 1: Top companies (top 8 by visits, others bucketed)
  // 2: Outcomes (ghosted, clicked-only, engaged, replied+, onsite+, offer)
  const channels = ["coldApp","coldOutreach","hmOutreach"];
  const outcomeOf = (l) => {
    if (l.stage === "offer") return "offer";
    if (["onsite","screen","rejected"].includes(l.stage)) return "onsite+";
    if (l.stage === "replied") return "replied";
    if (l.engagedSessions > 0) return "engaged";
    if (l.sessions.length > 0) return "clicked-only";
    return "ghosted";
  };
  const outcomes = ["offer","onsite+","replied","engaged","clicked-only","ghosted"];
  const outcomeColors = {
    "offer":      "oklch(0.85 0.18 145)",
    "onsite+":    "var(--signal)",
    "replied":    "var(--accent)",
    "engaged":    "oklch(0.78 0.10 230)",
    "clicked-only": "var(--fg-dim)",
    "ghosted":    "oklch(0.50 0.012 70)",
  };
  const channelColors = {
    "coldApp": "var(--info)",
    "coldOutreach": "var(--accent)",
    "hmOutreach": "var(--signal)",
  };

  // Pick top 8 companies by total visits, bucket rest as "Other (21)"
  const byVisits = [...leads].sort((a,b) => b.visits - a.visits);
  const topCos = byVisits.slice(0, 8);
  const others = byVisits.slice(8);
  const otherKey = `Other (${others.length})`;
  const companyList = [...topCos.map(l => l.company), otherKey];
  const companyOf = (l) => topCos.find(t => t.id === l.id) ? l.company : otherKey;

  // size of nodes
  const sizeC = {};   // channel
  const sizeM = {};   // mid
  const sizeO = {};   // outcome
  for (const ch of channels) sizeC[ch] = 0;
  for (const co of companyList) sizeM[co] = 0;
  for (const oc of outcomes) sizeO[oc] = 0;
  for (const l of leads) {
    sizeC[l.channel]++;
    sizeM[companyOf(l)]++;
    sizeO[outcomeOf(l)]++;
  }

  // Links arrays (with source x, target x for left and right halves)
  const linksL = [];   // channel -> company
  const linksR = [];   // company -> outcome
  for (const l of leads) {
    linksL.push({ ch: l.channel, co: companyOf(l) });
    linksR.push({ co: companyOf(l), oc: outcomeOf(l) });
  }
  const aggL = {};
  for (const k of linksL) aggL[k.ch + "→" + k.co] = (aggL[k.ch + "→" + k.co] || 0) + 1;
  const aggR = {};
  for (const k of linksR) aggR[k.co + "→" + k.oc] = (aggR[k.co + "→" + k.oc] || 0) + 1;

  // Geometry
  const W = 900, H = 380;
  const gap = 6;
  const colX = { L: 110, M: W / 2 - 30, R: W - 84 };
  const nodeW = 14;
  const total = leads.length;
  const usableH = H - 20;

  // Build positions per column
  function colPositions(items, sizes) {
    const totalSize = items.reduce((s, k) => s + sizes[k], 0);
    const totalGap = (items.length - 1) * gap;
    const scale = (usableH - totalGap) / Math.max(1, totalSize);
    let y = 10;
    const out = {};
    for (const k of items) {
      const h = sizes[k] * scale;
      out[k] = { y, h };
      y += h + gap;
    }
    return out;
  }
  const posC = colPositions(channels, sizeC);
  // sort companies for nicer layout: by sizeM desc
  const sortedCompanies = [...companyList].sort((a,b) => sizeM[b] - sizeM[a]);
  const posM = colPositions(sortedCompanies, sizeM);
  const posO = colPositions(outcomes, sizeO);

  // For each node, allocate "stack" cursor for outgoing/incoming so links don't overlap
  const stackOutC = {}; for (const k of channels) stackOutC[k] = 0;
  const stackInM = {}; for (const k of sortedCompanies) stackInM[k] = 0;
  const stackOutM = {}; for (const k of sortedCompanies) stackOutM[k] = 0;
  const stackInO = {}; for (const k of outcomes) stackInO[k] = 0;

  // Build curve generator
  function curve(x0, y0, x1, y1, t) {
    const cx0 = x0 + (x1 - x0) * 0.5;
    const cx1 = x0 + (x1 - x0) * 0.5;
    return `M${x0},${y0} L${x0},${y0 + t} C${cx0},${y0 + t} ${cx1},${y1 + t} ${x1},${y1 + t} L${x1},${y1} C${cx1},${y1} ${cx0},${y0} ${x0},${y0} Z`;
  }

  // Aggregate L links sorted top-to-bottom by source then by target
  const flowsL = Object.entries(aggL).map(([k, v]) => {
    const [ch, co] = k.split("→");
    return { ch, co, v };
  });
  flowsL.sort((a, b) => (channels.indexOf(a.ch) - channels.indexOf(b.ch)) || (sortedCompanies.indexOf(a.co) - sortedCompanies.indexOf(b.co)));

  const flowsR = Object.entries(aggR).map(([k, v]) => {
    const [co, oc] = k.split("→");
    return { co, oc, v };
  });
  flowsR.sort((a, b) => (sortedCompanies.indexOf(a.co) - sortedCompanies.indexOf(b.co)) || (outcomes.indexOf(a.oc) - outcomes.indexOf(b.oc)));

  // Scale heights (size already proportional; use same scale as columns)
  const scaleL = (sz) => sz * ((usableH - (channels.length - 1) * gap) / Math.max(1, total));
  const scaleM = (sz) => sz * ((usableH - (sortedCompanies.length - 1) * gap) / Math.max(1, total));
  const scaleR = (sz) => sz * ((usableH - (outcomes.length - 1) * gap) / Math.max(1, total));

  return (
    <div className="sankey-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* L flows */}
        {flowsL.map((f, i) => {
          const c = posC[f.ch]; const m = posM[f.co];
          const t = scaleL(f.v);
          const y0 = c.y + stackOutC[f.ch];
          const y1 = m.y + stackInM[f.co];
          stackOutC[f.ch] += t;
          stackInM[f.co] += t;
          return (
            <path key={"L"+i}
              d={curve(colX.L + nodeW, y0, colX.M, y1, t)}
              fill={channelColors[f.ch]} opacity="0.32"
            >
              <title>{f.ch} → {f.co}: {f.v}</title>
            </path>
          );
        })}
        {/* R flows */}
        {flowsR.map((f, i) => {
          const m = posM[f.co]; const o = posO[f.oc];
          const t = scaleR(f.v);
          const y0 = m.y + stackOutM[f.co];
          const y1 = o.y + stackInO[f.oc];
          stackOutM[f.co] += t;
          stackInO[f.oc] += t;
          return (
            <path key={"R"+i}
              d={curve(colX.M + nodeW, y0, colX.R, y1, t)}
              fill={outcomeColors[f.oc]} opacity="0.32"
            >
              <title>{f.co} → {f.oc}: {f.v}</title>
            </path>
          );
        })}
        {/* Channel nodes */}
        {channels.map(ch => (
          <g key={ch}>
            <rect x={colX.L} y={posC[ch].y} width={nodeW} height={Math.max(2, posC[ch].h)}
                  fill={channelColors[ch]} />
            <text x={colX.L - 8} y={posC[ch].y + posC[ch].h / 2 + 3}
                  textAnchor="end" fill="var(--fg)" fontSize="11" fontFamily="var(--mono)">
              {ch}
            </text>
            <text x={colX.L - 8} y={posC[ch].y + posC[ch].h / 2 + 16}
                  textAnchor="end" fill="var(--fg-dim)" fontSize="9.5" fontFamily="var(--mono)">
              {sizeC[ch]}
            </text>
          </g>
        ))}
        {/* Company nodes */}
        {sortedCompanies.map(co => (
          <g key={co}>
            <rect x={colX.M} y={posM[co].y} width={nodeW} height={Math.max(2, posM[co].h)}
                  fill="var(--fg-muted)" />
            <text x={colX.M + nodeW + 6} y={posM[co].y + posM[co].h / 2 + 3}
                  textAnchor="start" fill="var(--fg)" fontSize="10.5" fontFamily="var(--mono)">
              {co} <tspan fill="var(--fg-dim)" fontSize="9">· {sizeM[co]}</tspan>
            </text>
          </g>
        ))}
        {/* Outcome nodes */}
        {outcomes.map(oc => (
          <g key={oc}>
            <rect x={colX.R} y={posO[oc].y} width={nodeW} height={Math.max(2, posO[oc].h)}
                  fill={outcomeColors[oc]} />
            <text x={colX.R + nodeW + 6} y={posO[oc].y + posO[oc].h / 2 + 3}
                  textAnchor="start" fill="var(--fg)" fontSize="11" fontFamily="var(--mono)">
              {oc}
            </text>
            <text x={colX.R + nodeW + 6} y={posO[oc].y + posO[oc].h / 2 + 16}
                  textAnchor="start" fill="var(--fg-dim)" fontSize="9.5" fontFamily="var(--mono)">
              {sizeO[oc]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ============================================================
   Section dwell bars
============================================================ */
function DwellBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.avg));
  return (
    <div className="dwell">
      {data.map(d => (
        <div className="row" key={d.name}>
          <span className="label">{d.name}</span>
          <span className="bar">
            <i style={{ width: ((d.avg / max) * 100) + "%" }} />
          </span>
          <span className="v">{fmtDur(d.avg)}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Donut — simple ratio donut for channel mix
============================================================ */
function Donut({ slices, size = 110, thickness = 14 }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.24 0.008 70)" strokeWidth={thickness} />
      {slices.map((s, i) => {
        const len = (s.value / total) * circ;
        const el = (
          <circle key={i}
            cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

Object.assign(window, { AreaChart, FunnelChart, HeatmapChart, SankeyChart, DwellBars, Donut });
