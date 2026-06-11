/* global React */
const { useState, useEffect, useRef } = React;

/* ===== Animated count-up ===== */
function CountUp({ to, suffix = '', prefix = '', duration = 1600, decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(eased * to);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  const formatted = decimals > 0 ?
  val.toFixed(decimals) :
  Math.round(val).toLocaleString();
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

/* ===== Hero ===== */
function Hero({ accent, pitchVariant }) {
  const pitches = {
    metrics: {
      eyebrow: '// AVAILABLE MAY 2026 · INTERVIEWING NOW',
      title: <>I build backend systems that <em>don't break</em> under load.</>,
      sub: 'Backend engineer (4 yrs) shipping distributed systems at scale. Java · Kafka · AWS · Python. Currently finishing my Masters at UMD while building real-time transit infra at CATT Labs.'
    },
    pitch: {
      eyebrow: '// AVAILABLE MAY 2026',
      title: <>Latency is a <em>feature</em>. So is sleeping at night.</>,
      sub: 'I design distributed systems where the p99 is the headline metric and on-call is quiet. Previously at Gainsight and Velotio; finishing my Masters at UMD.'
    },
    terminal: {
      eyebrow: '// $ whoami',
      title: <>Backend engineer who treats <em>p99 latency</em> as a love language.</>,
      sub: 'Four years building event-driven systems, observability stacks, and ML pipelines at companies that actually care about uptime. Currently a Masters student at UMD.'
    }
  };
  const p = pitches[pitchVariant] || pitches.metrics;

  return (
    <section id="top" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container">
        <div className="hero-grid">
          <div className="hero-main">
            <div className="eyebrow hero-eyebrow">
              <span className="pulse" /> {p.eyebrow}
            </div>
            <h1 className="display hero-title">{p.title}</h1>
            <p className="hero-sub">{p.sub}</p>

            <div className="hero-ctas">
              <a className="btn btn-primary" href="#book">
                Let's connect — if you're scaling
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a className="btn btn-ghost" href="#work">See the work</a>
              <a className="btn btn-ghost" href="/resume.pdf" download>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Résumé (PDF)
              </a>
            </div>

            <div className="hero-metrics">
              <div className="metric">
                <div className="metric-num mono"><CountUp to={100} suffix="K+" /></div>
                <div className="metric-label">events/sec processed<br /><span className="dim">at sub-10ms p99</span></div>
              </div>
              <div className="metric">
                <div className="metric-num mono"><CountUp to={1} suffix="M+" /></div>
                <div className="metric-label">end users served<br /><span className="dim">notification infra @ Gainsight</span></div>
              </div>
              <div className="metric">
                <div className="metric-num mono"><CountUp to={99.95} decimals={2} suffix="%" /></div>
                <div className="metric-label">uptime, multi-tenant SaaS<br /><span className="dim">400+ enterprise tenants</span></div>
              </div>
              <div className="metric">
                <div className="metric-num mono"><CountUp to={10} suffix="TB" /></div>
                <div className="metric-label">data through one service<br /><span className="dim">RAG analytics pipeline</span></div>
              </div>
            </div>

            <div className="logo-bar">
              <span className="eyebrow" style={{ marginRight: 4 }}>// shipped at</span>
              <span className="logo-pill">Gainsight</span>
              <span className="logo-pill">Velotio</span>
              <span className="logo-pill">CATT Labs · UMD</span>
              <span className="logo-pill">U. Maryland</span>
            </div>
          </div>

          <aside className="hero-aside">
            <TerminalBlock />
          </aside>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .hero-title {
          font-size: clamp(44px, 6.4vw, 84px);
          margin: 0 0 32px;
          max-width: 14ch;
          line-height: 1.05;
          padding-bottom: 0.08em;
        }
        .hero-title em {
          font-style: italic;
          color: var(--accent);
          font-feature-settings: 'ss01' on;
        }
        .hero-sub {
          font-size: 17px;
          color: var(--fg-muted);
          max-width: 60ch;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 56px; }
        .hero-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 24px 0;
        }
        @media (max-width: 720px) {
          .hero-metrics { grid-template-columns: repeat(2, 1fr); gap: 24px 16px; }
        }
        .metric { padding: 0 16px; border-right: 1px solid var(--border); }
        .metric:last-child { border-right: 0; }
        @media (max-width: 720px) {
          .metric:nth-child(2) { border-right: 0; }
          .metric { border-bottom: 0; padding: 0 8px; }
        }
        .metric-num {
          font-size: 32px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--fg);
          margin-bottom: 4px;
        }
        .metric-label { font-size: 12px; color: var(--fg-muted); line-height: 1.4; }
        .logo-bar {
          display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
          margin-top: 28px;
        }
        .logo-pill {
          font-family: var(--mono);
          font-size: 12px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--fg-muted);
          background: oklch(0.20 0.006 70 / 0.5);
        }
        .hero-aside { position: sticky; top: 88px; }
        @media (max-width: 980px) { .hero-aside { position: static; } }
      `}</style>
    </section>);

}

/* ===== Claude-Code-style terminal in hero aside ===== */
function TerminalBlock() {
  const [lines, setLines] = useState([]);
  const script = [
    { t: 'user', text: 'who are you and what do you build?' },
    { t: 'think', text: 'Reading résumé · scanning shipped systems …' },
    { t: 'cm', text: "I'm Eshaan — a backend engineer." },
    { t: 'cm', text: '4 yrs building distributed systems at scale.' },
    { t: 'cm', text: '' },
    { t: 'cm', text: 'recent stack:' },
    { t: 'cm-d', text: '  java · spring · kafka · postgres · aws · python' },
    { t: 'cm', text: '' },
    { t: 'cm', text: 'highlights:' },
    { t: 'bullet', text: '100K+ events/sec, sub-10ms p99 (Velotio)' },
    { t: 'bullet', text: '10TB RAG analytics, 400+ tenants (Gainsight)' },
    { t: 'bullet', text: '1M+ users, 99.99% uptime notifications (Gainsight)' },
    { t: 'cm', text: '' },
    { t: 'cm-ok', text: '✓ available may 2026 · interviewing now' },
  ];

  useEffect(() => {
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      let scheduleNext = false;
      let nextDelay = 320;
      setLines((prev) => {
        if (prev.length >= script.length) return prev;
        const item = script[prev.length];
        if (!item) return prev;
        scheduleNext = prev.length + 1 < script.length;
        // pause longer after the "thinking" line
        if (item.t === 'think') nextDelay = 900;
        else if (item.t === 'user') nextDelay = 600;
        else if (item.text === '') nextDelay = 120;
        return [...prev, item];
      });
      if (scheduleNext) setTimeout(step, nextDelay);
    };
    const t = setTimeout(step, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const isDone = lines.length >= script.length;

  return (
    <div className="cc">
      <div className="cc-header">
        <div className="cc-banner mono">
          <div className="cc-banner-row">╭{'─'.repeat(34)}╮</div>
          <div className="cc-banner-row">│ <span className="cc-accent">✻</span> Welcome to <span className="cc-accent">eshaan.dev</span>{'  '.repeat(3)}│</div>
          <div className="cc-banner-row">│{'  '.repeat(17)} │</div>
          <div className="cc-banner-row">│   <span className="cc-dim">/help</span> for help, <span className="cc-dim">/menu</span> for nav   │</div>
          <div className="cc-banner-row">│{'  '.repeat(17)} │</div>
          <div className="cc-banner-row">│   cwd: <span className="cc-dim">~/portfolio</span>{'  '.repeat(7)}│</div>
          <div className="cc-banner-row">╰{'─'.repeat(34)}╯</div>
        </div>
      </div>

      <div className="cc-body mono">
        {lines.filter(Boolean).map((l, i) => {
          if (l.t === 'user') {
            return (
              <div key={i} className="cc-line cc-user">
                <span className="cc-prompt">&gt;</span> {l.text}
              </div>
            );
          }
          if (l.t === 'think') {
            return (
              <div key={i} className="cc-line cc-think">
                <span className="cc-thinking-dot">✻</span> {l.text}
                <span className="cc-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            );
          }
          if (l.t === 'bullet') {
            return (
              <div key={i} className="cc-line cc-bullet">
                <span className="cc-bullet-mark">⏺</span> {l.text}
              </div>
            );
          }
          if (l.t === 'cm-ok') {
            return <div key={i} className="cc-line cc-ok">{l.text}</div>;
          }
          if (l.t === 'cm-d') {
            return <div key={i} className="cc-line cc-dim">{l.text}</div>;
          }
          return <div key={i} className="cc-line cc-cm">{l.text || '\u00a0'}</div>;
        })}

        {isDone && (
          <div className="cc-input-row">
            <span className="cc-prompt">&gt;</span>
            <span className="cc-placeholder">Try a question…</span>
            <span className="cc-cursor">▍</span>
          </div>
        )}
      </div>

      <div className="cc-footer mono">
        <span className="cc-foot-l"><span className="cc-foot-dot" /> ready</span>
        <span className="cc-foot-r">claude-sonnet · backend-eng-mode</span>
      </div>

      <style>{`
        .cc {
          border-radius: 10px;
          background: oklch(0.11 0.005 70);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 30px 80px -40px rgba(0,0,0,0.7);
          font-family: var(--mono);
        }
        .cc-header {
          padding: 16px 18px 8px;
        }
        .cc-banner { font-size: 11px; line-height: 1.5; color: var(--fg-muted); }
        .cc-banner-row { white-space: pre; }
        .cc-accent { color: var(--accent); }
        .cc-dim { color: var(--fg-dim); }
        .cc-body {
          padding: 12px 18px 4px;
          font-size: 12.5px;
          line-height: 1.65;
          min-height: 280px;
        }
        .cc-line { white-space: pre-wrap; animation: ccIn 0.18s ease-out; }
        @keyframes ccIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; } }
        .cc-cm { color: var(--fg); }
        .cc-dim { color: var(--fg-muted); }
        .cc-user { color: var(--fg); }
        .cc-prompt { color: var(--accent); margin-right: 4px; }
        .cc-think { color: var(--fg-dim); font-style: italic; }
        .cc-thinking-dot { color: var(--accent); }
        .cc-dots span {
          opacity: 0;
          animation: ccDot 1.4s infinite;
        }
        .cc-dots span:nth-child(1) { animation-delay: 0s; }
        .cc-dots span:nth-child(2) { animation-delay: 0.2s; }
        .cc-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ccDot { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
        .cc-bullet { color: var(--fg); padding-left: 0; }
        .cc-bullet-mark { color: var(--accent); margin-right: 6px; }
        .cc-ok { color: var(--good); }
        .cc-input-row {
          display: flex; align-items: center; gap: 4px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed oklch(0.30 0.008 70 / 0.5);
        }
        .cc-placeholder { color: var(--fg-dim); }
        .cc-cursor {
          color: var(--accent);
          animation: blink 1s steps(2) infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .cc-footer {
          padding: 10px 18px;
          border-top: 1px solid oklch(0.30 0.008 70 / 0.5);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10.5px;
          color: var(--fg-dim);
          background: oklch(0.13 0.005 70);
        }
        .cc-foot-dot {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--good);
          margin-right: 6px;
          vertical-align: 1px;
        }
      `}</style>
    </div>
  );
}

window.Hero = Hero;
window.CountUp = CountUp;