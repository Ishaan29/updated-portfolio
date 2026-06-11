/* global React */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   PROJECT PLAYGROUND — tabbed shell with a live demo per project
   ============================================================ */
function Playground() {
  const projects = [
  {
    id: 'vector',
    name: 'Distributed Vector DB',
    tag: 'Go · HNSW · FAISS · gRPC',
    blurb: 'High-performance vector DB optimized for similarity search using SIMD instructions and custom indexing. AWS re:Inforce grant.',
    demo: 'search'
  },
  {
    id: 'assistant',
    name: 'AI Desktop Assistant',
    tag: 'Python · FastAPI · LangChain · Electron',
    blurb: 'Intelligent desktop assistant orchestrating multiple LLM providers for context-aware task completion.',
    demo: 'chat'
  },
  {
    id: 'terpspark',
    name: 'TerpSpark Backend',
    tag: 'FastAPI · PostgreSQL · JWT · Pydantic',
    blurb: 'RBAC + events management system. REST API for managing campus events with auth and advanced filtering.',
    demo: 'api'
  },
  {
    id: 'eks',
    name: 'EKS Microservices',
    tag: 'Kubernetes · AWS EKS · Docker · GitHub Actions',
    blurb: 'Automated CI/CD pipeline for deploying e-commerce microservices on AWS EKS with version tagging.',
    demo: 'pipeline'
  },
  {
    id: 'otel',
    name: 'Otel Telemetry Platform',
    tag: 'Java · Spring · Kafka · OpenTelemetry',
    blurb: 'Scalable real-time telemetry ingestion + processing for distributed systems observability.',
    demo: 'metrics'
  }];


  const [active, setActive] = useState(projects[0].id);
  const project = projects.find((p) => p.id === active);

  return (
    <section id="play">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">// 04 — project playground</span>
            <h2>The work,<br /><em>plugged in</em>.</h2>
          </div>
          <div className="head-aside">
            Each of my projects, running live in your browser. Click around — interact with the vector DB, chat with the desktop assistant, hit the API. This is what bullet points look like when they're plugged in.
          </div>
        </div>

        <div className="pp-shell">
          <aside className="pp-side">
            <div className="eyebrow pp-side-h">// PROJECTS</div>
            <div className="pp-tabs">
              {projects.map((p) =>
              <button
                key={p.id}
                className={`pp-tab ${active === p.id ? 'is-on' : ''}`}
                onClick={() => setActive(p.id)}>
                
                  <div className="pp-tab-name">{p.name}</div>
                  <div className="pp-tab-tag mono">{p.tag}</div>
                </button>
              )}
            </div>

            <div className="pp-side-meta">
              <div className="mono pp-meta-row">
                <span className="dim">project</span>
                <span>{project.name}</span>
              </div>
              <div className="pp-blurb">{project.blurb}</div>
              <a className="pp-repo mono" href="#" onClick={(e) => e.preventDefault()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" /></svg>
                view source ↗
              </a>
            </div>
          </aside>

          <main className="pp-main">
            {project.demo === 'search' && <VectorDBDemo />}
            {project.demo === 'chat' && <AssistantDemo />}
            {project.demo === 'api' && <TerpSparkDemo />}
            {project.demo === 'pipeline' && <EKSDemo />}
            {project.demo === 'metrics' && <OTelDemo />}
          </main>
        </div>
      </div>

      <style>{`
        .pp-shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: oklch(0.13 0.005 70);
          overflow: hidden;
          min-height: 540px;
        }
        @media (max-width: 880px) { .pp-shell { grid-template-columns: 1fr; } }
        .pp-side {
          padding: 22px;
          border-right: 1px solid var(--border);
          background: oklch(0.16 0.006 70);
          display: flex; flex-direction: column;
        }
        @media (max-width: 880px) { .pp-side { border-right: 0; border-bottom: 1px solid var(--border); } }
        .pp-side-h { margin-bottom: 14px; }
        .pp-tabs { display: flex; flex-direction: column; gap: 4px; }
        .pp-tab {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          color: var(--fg-muted);
          font-family: var(--sans);
          transition: all 0.15s;
        }
        .pp-tab:hover { background: oklch(0.20 0.006 70); color: var(--fg); }
        .pp-tab.is-on {
          background: oklch(0.82 0.135 75 / 0.10);
          border-color: oklch(0.82 0.135 75 / 0.4);
          color: var(--fg);
        }
        .pp-tab-name { font-size: 14px; font-weight: 500; }
        .pp-tab-tag { font-size: 10.5px; color: var(--fg-dim); margin-top: 3px; letter-spacing: 0.02em; }
        .pp-tab.is-on .pp-tab-tag { color: oklch(0.82 0.135 75 / 0.85); }

        .pp-side-meta {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }
        .pp-meta-row {
          display: flex; justify-content: space-between;
          font-size: 11px; margin-bottom: 10px;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .pp-blurb { font-size: 13px; color: var(--fg-muted); line-height: 1.55; margin-bottom: 14px; }
        .pp-repo {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--accent);
          text-decoration: none;
          padding: 6px 10px;
          border: 1px solid oklch(0.82 0.135 75 / 0.3);
          border-radius: 999px;
        }
        .pp-repo:hover { background: oklch(0.82 0.135 75 / 0.10); }

        .pp-main {
          min-height: 540px;
          display: flex; flex-direction: column;
        }
      `}</style>
    </section>);

}

/* =====================================================================
   1) VECTOR DB DEMO — semantic + lexical search
   ===================================================================== */
function VectorDBDemo() {
  const corpus = [
  { id: 1, text: 'kafka exactly-once semantics with idempotent producers and transactional consumers', tags: ['kafka', 'streaming'] },
  { id: 2, text: 'pgvector HNSW index tuning for sub-50ms nearest-neighbor recall', tags: ['vector', 'postgres'] },
  { id: 3, text: 'kubernetes blue/green rollout with helm and per-tenant resource quotas', tags: ['k8s', 'deploy'] },
  { id: 4, text: 'opentelemetry distributed tracing across 12 microservices reduced MTTR by 50%', tags: ['otel', 'observability'] },
  { id: 5, text: 'event-sourced notification engine with replay-safe stateless projectors', tags: ['event-sourcing', 'notify'] },
  { id: 6, text: 'redis read-through cache in front of postgres for hot device state', tags: ['redis', 'cache'] },
  { id: 7, text: 'spring boot reactive backpressure with bounded thread pools and circuit breakers', tags: ['spring', 'resilience'] },
  { id: 8, text: 'airflow idempotent task graph with explicit retry budgets and DLQ replay tooling', tags: ['airflow', 'etl'] },
  { id: 9, text: 'aws eks terraform iac for repeatable zero-downtime infra rollouts', tags: ['aws', 'iac'] },
  { id: 10, text: 'rag analytics microservice over 10TB of multi-tenant data with circuit breakers', tags: ['rag', 'analytics'] },
  { id: 11, text: 'multi-tenant rate limiter with token buckets per tenant scope', tags: ['rate-limit', 'multi-tenant'] },
  { id: 12, text: 'mqtt bridge tuned for 2K concurrent device connections and 150ms RTT', tags: ['mqtt', 'iot'] }];


  const queries = [
  'how do you handle backpressure?',
  'multi-tenant isolation patterns',
  'ETL that does not page you at 3am',
  'debug a slow microservice'];


  const [query, setQuery] = useState(queries[0]);
  const [typed, setTyped] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [latency, setLatency] = useState(0);
  const [mode, setMode] = useState('semantic');

  const tokenize = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
  const score = (q, doc) => {
    const qt = new Set(tokenize(q));
    const dt = tokenize(doc.text + ' ' + doc.tags.join(' '));
    let hits = 0;
    dt.forEach((t) => qt.has(t) && hits++);
    doc.tags.forEach((tag) => {
      qt.forEach((qtok) => {
        if (qtok.length > 3 && (tag.includes(qtok) || qtok.includes(tag))) hits += 0.5;
      });
    });
    return hits;
  };
  const lexicalRank = (q) => corpus.
  map((d) => ({ ...d, s: score(q, d) })).
  filter((d) => d.s > 0).
  sort((a, b) => b.s - a.s).
  slice(0, 4);

  const semanticRank = async (q) => {
    const prompt = `Rank these snippets by semantic relevance to the query.

QUERY: "${q}"

SNIPPETS:
${corpus.map((d) => `${d.id}: ${d.text}`).join('\n')}

Return ONLY valid JSON, top 4 best matches, no prose:
{"ranked":[{"id":<number>,"score":<1-10>},...]}`;
    try {
      const raw = await window.claude.complete(prompt);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error();
      const parsed = JSON.parse(m[0]);
      return parsed.ranked.slice(0, 4).
      map((r) => {const d = corpus.find((x) => x.id === r.id);return d ? { ...d, s: r.score } : null;}).
      filter(Boolean);
    } catch (e) {return lexicalRank(q);}
  };

  const runQuery = (q) => {
    setRunning(true);
    setResults([]);
    setTyped('');
    let i = 0;
    const step = () => {
      if (i <= q.length) {setTyped(q.slice(0, i));i++;setTimeout(step, 18);} else
      {
        const t0 = performance.now();
        if (mode === 'semantic' && window.claude?.complete) {
          semanticRank(q).then((r) => {
            setLatency(performance.now() - t0);setResults(r);setRunning(false);
          });
        } else {
          const lat = 24 + Math.random() * 16;
          setLatency(lat);
          setTimeout(() => {setResults(lexicalRank(q));setRunning(false);}, lat * 6);
        }
      }
    };
    step();
  };

  useEffect(() => {runQuery(queries[0]); /* eslint-disable-next-line */}, []);

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <div className="demo-title mono">vectordb-go · 0.3.1</div>
          <div className="demo-sub">similarity search over 12 indexed snippets</div>
        </div>
        <div className="demo-mode">
          <button
            className={`demo-pill mono ${mode === 'semantic' ? 'is-on' : ''}`}
            onClick={() => setMode('semantic')}>
            semantic</button>
          <button
            className={`demo-pill mono ${mode === 'lexical' ? 'is-on' : ''}`}
            onClick={() => setMode('lexical')}>
            lexical · bm25</button>
        </div>
      </div>

      <div className="demo-body">
        <div className="vdb-query-bar">
          <span className="mono vdb-prompt"><span className="dim">db.query</span>(</span>
          <span className="mono vdb-q">"{typed}{running && <span className="play-cursor">▍</span>}"</span>
          <span className="mono vdb-prompt">)</span>
          <span className="mono vdb-meta">
            {running ? 'searching…' : `top-${results.length} · ${latency.toFixed(0)}ms · ${mode}`}
          </span>
        </div>

        <div className="vdb-grid">
          <div className="vdb-left">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// PRESET QUERIES</div>
            <div className="vdb-presets">
              {queries.map((q) =>
              <button key={q} className={`vdb-preset ${query === q ? 'is-on' : ''}`}
              onClick={() => {setQuery(q);runQuery(q);}}>{q}</button>
              )}
            </div>
            <form className="vdb-form" onSubmit={(e) => {e.preventDefault();if (query.trim()) runQuery(query);}}>
              <input className="vdb-input mono" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="ask anything…" />
              <button type="submit" className="btn btn-primary vdb-go">run</button>
            </form>
          </div>

          <div className="vdb-right">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// TOP-K MATCHES</div>
            <div className="vdb-results">
              {results.length === 0 && !running && <div className="vdb-empty mono dim">no matches</div>}
              {results.map((r, i) =>
              <div key={r.id} className="vdb-r">
                  <div className="vdb-r-head">
                    <span className="mono vdb-rank">#{i + 1}</span>
                    <span className="mono dim">score {Number(r.s).toFixed(1)}</span>
                  </div>
                  <div className="vdb-r-text">{r.text}</div>
                  <div className="vdb-r-tags">{r.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .vdb-query-bar {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 14px 18px;
          background: oklch(0.16 0.006 70);
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
        }
        .vdb-prompt { color: var(--fg-muted); }
        .vdb-q { color: var(--accent); flex: 1; min-width: 0; }
        .vdb-meta { color: var(--fg-dim); font-size: 12px; margin-left: auto; }
        .play-cursor { color: var(--accent); animation: blink 1s steps(2) infinite; }
        .vdb-grid { display: grid; grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.4fr); gap: 18px; }
        @media (max-width: 760px) { .vdb-grid { grid-template-columns: 1fr; } }
        .vdb-presets { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .vdb-preset {
          background: transparent; border: 1px solid var(--border); color: var(--fg-muted);
          padding: 8px 12px; border-radius: 8px;
          font-size: 12.5px; text-align: left; cursor: pointer; font-family: var(--sans);
          transition: all 0.15s;
        }
        .vdb-preset:hover { color: var(--fg); border-color: var(--border-strong); }
        .vdb-preset.is-on { background: oklch(0.82 0.135 75 / 0.12); border-color: var(--accent); color: var(--accent); }
        .vdb-form { display: flex; gap: 6px; }
        .vdb-input {
          flex: 1; background: var(--bg); border: 1px solid var(--border);
          color: var(--fg); padding: 9px 12px; border-radius: 8px; font-size: 12.5px; outline: none;
        }
        .vdb-input:focus { border-color: var(--accent); }
        .vdb-go { padding: 9px 14px; font-size: 12.5px; }
        .vdb-results { display: flex; flex-direction: column; gap: 8px; }
        .vdb-empty { padding: 40px 20px; text-align: center; border: 1px dashed var(--border); border-radius: 8px; font-size: 12.5px; }
        .vdb-r {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 12px 14px;
          animation: slideIn 0.25s ease-out both;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
        .vdb-r-head { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
        .vdb-rank { color: var(--accent); }
        .vdb-r-text { font-size: 13px; color: var(--fg); line-height: 1.5; margin-bottom: 6px; }
        .vdb-r-tags { display: flex; flex-wrap: wrap; gap: 4px; }
      `}</style>
    </div>);

}

/* =====================================================================
   2) AI DESKTOP ASSISTANT — chat
   ===================================================================== */
function AssistantDemo() {
  const [messages, setMessages] = useState([
  { role: 'assistant', text: "Hi — I'm Eshaan's desktop assistant. Ask me about his work, projects, or anything technical. I'll route to the right context." }]
  );
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const presets = [
  "What's Eshaan's strongest backend stack?",
  "Tell me about a hard distributed-systems problem he solved",
  "Why hire him over another backend engineer?"];


  const send = async (text) => {
    if (!text.trim() || busy) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);

    const context = `You are an AI assistant embedded on Eshaan Bajpai's portfolio. Answer concisely (2-4 sentences, casual but professional). Facts to use:
- 4+ years backend engineering (Java/Spring, Kafka, Python, AWS).
- At Gainsight: built notification infra serving 1M+ users at 99.99% uptime, 80ms p99. Then owned analytics/observability stack for 400+ tenant SaaS, built a RAG service over 10TB, deployed OpenTelemetry across 12 services.
- At Velotio: led IoT telemetry platform at 100K+ events/sec, sub-10ms p99, saved client $5K/mo via right-sizing.
- Currently MS Software Engineering at UMD, working at CATT Labs on transit data infra.
- Strengths: distributed systems, real-time data, ML/data infra, multi-tenant SaaS, observability.
- Available May 2026, interviewing now.

USER QUESTION: ${text}`;

    try {
      const reply = await window.claude.complete(context);
      setMessages((m) => [...m, { role: 'assistant', text: reply.trim() }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: "(LLM call failed — but in production this would route to one of the configured providers. Try refreshing.)" }]);
    }
    setBusy(false);
  };

  useEffect(() => {
    if (endRef.current) {
      const container = endRef.current.parentElement;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [messages, busy]);

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <div className="demo-title mono">eshaan-assistant · multi-LLM</div>
          <div className="demo-sub">routes to claude / openai based on intent</div>
        </div>
        <div className="demo-mode">
          <span className="demo-pill mono is-on" style={{ cursor: 'default' }}>
            <span className="pp-online" /> claude
          </span>
        </div>
      </div>

      <div className="demo-body chat-body">
        <div className="chat-thread">
          {messages.map((m, i) =>
          <div key={i} className={`chat-msg chat-${m.role}`}>
              <div className="chat-avatar mono">{m.role === 'user' ? 'you' : 'AI'}</div>
              <div className="chat-bubble">{m.text}</div>
            </div>
          )}
          {busy &&
          <div className="chat-msg chat-assistant">
              <div className="chat-avatar mono">AI</div>
              <div className="chat-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          }
          <div ref={endRef} />
        </div>

        <div className="chat-presets">
          {presets.map((p) =>
          <button key={p} className="chat-preset mono" onClick={() => send(p)} disabled={busy}>
              {p}
            </button>
          )}
        </div>

        <form className="chat-form" onSubmit={(e) => {e.preventDefault();send(input);}}>
          <input
            className="chat-input"
            placeholder="Ask the assistant anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy} />
          
          <button type="submit" className="btn btn-primary chat-send" disabled={busy || !input.trim()}>
            send →
          </button>
        </form>
      </div>

      <style>{`
        .chat-body { display: flex; flex-direction: column; gap: 14px; }
        .chat-thread {
          flex: 1;
          background: oklch(0.16 0.006 70);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          min-height: 320px;
          max-height: 360px;
          overflow-y: auto;
          display: flex; flex-direction: column; gap: 14px;
        }
        .chat-msg { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; }
        .chat-user { grid-template-columns: 1fr 30px; }
        .chat-user .chat-avatar { order: 2; }
        .chat-user .chat-bubble { order: 1; text-align: right; background: oklch(0.82 0.135 75 / 0.12); border-color: oklch(0.82 0.135 75 / 0.3); }
        .chat-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: oklch(0.20 0.006 70); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: var(--fg-muted); letter-spacing: 0.04em;
        }
        .chat-user .chat-avatar { background: oklch(0.82 0.135 75 / 0.15); border-color: oklch(0.82 0.135 75 / 0.4); color: var(--accent); }
        .chat-bubble {
          background: oklch(0.20 0.006 70);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13.5px; line-height: 1.55;
          color: var(--fg);
        }
        .chat-typing { display: inline-flex; gap: 4px; padding: 16px 14px; }
        .chat-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--fg-muted);
          animation: ccDot 1.4s infinite;
        }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ccDot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

        .chat-presets { display: flex; flex-wrap: wrap; gap: 6px; }
        .chat-preset {
          background: transparent; border: 1px solid var(--border);
          color: var(--fg-muted); padding: 7px 12px;
          border-radius: 999px; font-size: 11.5px;
          cursor: pointer; transition: all 0.15s;
        }
        .chat-preset:hover:not(:disabled) { color: var(--fg); border-color: var(--border-strong); }
        .chat-preset:disabled { opacity: 0.5; cursor: not-allowed; }

        .chat-form { display: flex; gap: 8px; }
        .chat-input {
          flex: 1; background: var(--bg); border: 1px solid var(--border);
          color: var(--fg); padding: 11px 14px;
          border-radius: 8px; font-size: 13.5px;
          font-family: var(--sans); outline: none;
        }
        .chat-input:focus { border-color: var(--accent); }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .pp-online {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--good);
          margin-right: 4px; vertical-align: 1px;
        }
      `}</style>
    </div>);

}

/* =====================================================================
   3) TERPSPARK — REST API explorer
   ===================================================================== */
function TerpSparkDemo() {
  const endpoints = [
  {
    m: 'POST', p: '/api/auth/login',
    desc: 'Authenticate and receive a JWT',
    body: '{"email": "you@umd.edu", "password": "••••••"}',
    res: { status: 200, body: '{"access_token":"eyJhbGc…","refresh_token":"…","expires_in":3600,"user":{"id":42,"role":"organizer"}}' }
  },
  {
    m: 'GET', p: '/api/events?dept=cs&from=2026-06-01',
    desc: 'List events with advanced filters',
    body: null,
    res: { status: 200, body: '{"results":[{"id":108,"title":"Distributed Systems Reading Group","starts":"2026-06-03T18:00","seats_left":12},{"id":111,"title":"AI/ML Beer & Code","starts":"2026-06-05T19:30","seats_left":3}],"total":2}' }
  },
  {
    m: 'POST', p: '/api/events',
    desc: 'Create an event · requires role:organizer',
    body: '{"title":"K8s Office Hours","dept":"cs","capacity":40}',
    res: { status: 201, body: '{"id":204,"title":"K8s Office Hours","status":"draft","permalink":"/e/204"}' }
  },
  {
    m: 'POST', p: '/api/events/108/rsvp',
    desc: 'Reserve a seat',
    body: '{"notes":"vegetarian"}',
    res: { status: 200, body: '{"rsvp_id":1041,"seat":11,"qr":"data:image/png;base64,iVBOR…"}' }
  },
  {
    m: 'GET', p: '/api/admin/users',
    desc: 'Admin only — denied for non-admin token',
    body: null,
    res: { status: 403, body: '{"error":"insufficient_role","required":"admin","got":"organizer"}' }
  }];


  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | sending | done
  const ep = endpoints[active];

  const send = () => {
    setPhase('sending');
    setTimeout(() => setPhase('done'), 600 + Math.random() * 600);
  };

  useEffect(() => {setPhase('idle');}, [active]);

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <div className="demo-title mono">terpspark-api · v1.0</div>
          <div className="demo-sub">FastAPI · Postgres · JWT · 28 endpoints · RBAC</div>
        </div>
        <div className="demo-mode">
          <span className="demo-pill mono is-on" style={{ cursor: 'default' }}>
            <span className="pp-online" /> 200 OK · 14ms avg
          </span>
        </div>
      </div>

      <div className="demo-body api-body">
        <div className="api-grid">
          <div className="api-left">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// ENDPOINTS</div>
            <div className="api-list">
              {endpoints.map((e, i) =>
              <button key={i}
              className={`api-row ${active === i ? 'is-on' : ''}`}
              onClick={() => setActive(i)}>
                
                  <span className={`api-method m-${e.m}`}>{e.m}</span>
                  <span className="api-path mono">{e.p}</span>
                </button>
              )}
            </div>
          </div>

          <div className="api-right">
            <div className="api-card">
              <div className="api-card-h">
                <span className={`api-method m-${ep.m}`}>{ep.m}</span>
                <span className="api-path mono">{ep.p}</span>
                <button className="btn btn-primary api-send" onClick={send} disabled={phase === 'sending'}>
                  {phase === 'sending' ? 'sending…' : 'send →'}
                </button>
              </div>
              <div className="api-desc">{ep.desc}</div>

              {ep.body &&
              <>
                  <div className="eyebrow" style={{ marginTop: 14 }}>// REQUEST BODY</div>
                  <pre className="api-pre mono">{ep.body}</pre>
                </>
              }

              <div className="eyebrow" style={{ marginTop: 14 }}>// RESPONSE</div>
              {phase === 'idle' && <pre className="api-pre mono api-pre-dim">→ click "send" to see response</pre>}
              {phase === 'sending' &&
              <div className="api-spin">
                  <div className="api-bar"><div className="api-bar-inner" /></div>
                </div>
              }
              {phase === 'done' &&
              <>
                  <div className={`api-status mono status-${ep.res.status}`}>
                    {ep.res.status} {ep.res.status === 200 ? 'OK' : ep.res.status === 201 ? 'Created' : 'Forbidden'}
                    <span className="dim" style={{ marginLeft: 12 }}>· {(8 + Math.random() * 14).toFixed(0)}ms</span>
                  </div>
                  <pre className="api-pre mono api-pre-res">{prettyJson(ep.res.body)}</pre>
                </>
              }
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .api-grid { display: grid; grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.6fr); gap: 18px; }
        @media (max-width: 760px) { .api-grid { grid-template-columns: 1fr; } }
        .api-list { display: flex; flex-direction: column; gap: 4px; }
        .api-row {
          display: grid; grid-template-columns: 56px 1fr; gap: 10px;
          background: transparent; border: 1px solid var(--border);
          border-radius: 8px; padding: 9px 12px;
          text-align: left; cursor: pointer; font-family: var(--mono); font-size: 12px;
          color: var(--fg-muted); transition: all 0.15s;
        }
        .api-row:hover { border-color: var(--border-strong); color: var(--fg); }
        .api-row.is-on { border-color: oklch(0.82 0.135 75 / 0.5); background: oklch(0.82 0.135 75 / 0.08); color: var(--fg); }
        .api-method {
          font-family: var(--mono); font-size: 10.5px; font-weight: 600;
          padding: 3px 6px; border-radius: 4px;
          text-align: center; align-self: center;
        }
        .m-GET { background: oklch(0.78 0.10 230 / 0.18); color: oklch(0.85 0.10 230); }
        .m-POST { background: oklch(0.78 0.13 160 / 0.18); color: oklch(0.85 0.13 160); }
        .m-DELETE { background: oklch(0.7 0.15 25 / 0.18); color: oklch(0.85 0.15 25); }
        .api-path { font-size: 12px; align-self: center; }
        .api-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; }
        .api-card-h { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .api-card-h .api-path { font-size: 14px; color: var(--fg); flex: 1; min-width: 0; }
        .api-send { padding: 8px 14px; font-size: 12.5px; }
        .api-desc { color: var(--fg-muted); font-size: 13px; margin-top: 10px; }
        .api-pre {
          background: oklch(0.13 0.006 70); border: 1px solid var(--border);
          border-radius: 8px; padding: 12px 14px;
          font-size: 12px; line-height: 1.55; color: var(--fg);
          margin: 8px 0 0; overflow-x: auto; max-height: 240px;
        }
        .api-pre-dim { color: var(--fg-dim); }
        .api-pre-res { color: oklch(0.85 0.10 160); }
        .api-status { font-size: 12px; margin-top: 8px; font-weight: 600; }
        .status-200, .status-201 { color: var(--good); }
        .status-403 { color: oklch(0.75 0.15 25); }
        .api-spin { margin-top: 12px; }
        .api-bar { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .api-bar-inner { height: 100%; width: 30%; background: var(--accent); animation: barSlide 1.2s infinite linear; }
        @keyframes barSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(380%); } }
      `}</style>
    </div>);

}
function prettyJson(s) {
  try {return JSON.stringify(JSON.parse(s), null, 2);} catch {return s;}
}

/* =====================================================================
   4) EKS — CI/CD pipeline animation
   ===================================================================== */
function EKSDemo() {
  const stages = [
  { k: 'push', name: 'git push', sub: 'commit 8a3f12c', dur: 600 },
  { k: 'build', name: 'docker build', sub: 'multi-stage · 4 layers cached', dur: 1500 },
  { k: 'test', name: 'pytest · 247 tests', sub: 'parallel · 4 workers', dur: 1800 },
  { k: 'scan', name: 'trivy scan', sub: '0 high, 2 medium', dur: 1000 },
  { k: 'ecr', name: 'push to ECR', sub: '982MB → 142MB compressed', dur: 1200 },
  { k: 'deploy', name: 'helm upgrade', sub: 'rolling · 0 downtime', dur: 2200 },
  { k: 'smoke', name: 'smoke tests', sub: '12 synthetic checks', dur: 900 }];


  const [running, setRunning] = useState(false);
  const [doneIdx, setDoneIdx] = useState(-1);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [logs, setLogs] = useState([]);

  const start = () => {
    setRunning(true);setDoneIdx(-1);setActiveIdx(0);setLogs([]);
    let total = 0;
    stages.forEach((s, i) => {
      // start log
      setTimeout(() => {
        setActiveIdx(i);
        setLogs((l) => [...l, { type: 'info', text: `▸ stage[${i}] starting: ${s.name}` }]);
      }, total);
      total += Math.floor(s.dur / 2);
      setTimeout(() => {
        setLogs((l) => [...l, { type: 'dim', text: `  ${s.sub}` }]);
      }, total);
      total += Math.floor(s.dur / 2);
      setTimeout(() => {
        setDoneIdx(i);
        setLogs((l) => [...l, { type: 'ok', text: `✓ stage[${i}] done in ${(s.dur / 1000).toFixed(1)}s` }]);
      }, total);
    });
    setTimeout(() => {
      setLogs((l) => [...l, { type: '', text: '' }, { type: 'accent', text: '🎉 deployed v0.4.2 → prod-eks-us-east-1' }]);
      setRunning(false);
    }, total + 200);
  };

  useEffect(() => {
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <div className="demo-title mono">eks-deploy.yml · GitHub Actions</div>
          <div className="demo-sub">automated build → scan → deploy on push to main</div>
        </div>
        <div className="demo-mode">
          <button className="demo-pill mono is-on" onClick={start} disabled={running}>
            {running ? '● running' : '↻ replay'}
          </button>
        </div>
      </div>

      <div className="demo-body eks-body">
        <div className="eks-pipe">
          {stages.map((s, i) => {
            const state = doneIdx >= i ? 'done' : activeIdx === i ? 'active' : 'idle';
            return (
              <React.Fragment key={s.k}>
                <div className={`eks-stage eks-${state}`}>
                  <div className="eks-stage-i mono">{state === 'done' ? '✓' : state === 'active' ? '●' : i + 1}</div>
                  <div className="eks-stage-name">{s.name}</div>
                  <div className="eks-stage-sub">{s.sub}</div>
                </div>
                {i < stages.length - 1 && <div className={`eks-conn eks-conn-${doneIdx >= i ? 'on' : 'off'}`} />}
              </React.Fragment>);

          })}
        </div>

        <div className="eks-logs mono">
          <div className="eks-logs-bar">
            <span className="dim">github-actions → eks-deploy.yml</span>
            <span className="dim">{logs.length} lines</span>
          </div>
          <div className="eks-logs-body">
            {logs.map((l, i) =>
            <div key={i} className={`eks-log eks-log-${l.type}`}>{l.text || '\u00a0'}</div>
            )}
            {running && <div className="eks-log eks-log-cursor">▍</div>}
          </div>
        </div>
      </div>

      <style>{`
        .eks-body { display: flex; flex-direction: column; gap: 18px; }
        .eks-pipe { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .eks-stage {
          flex: 1; min-width: 110px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 12px;
          transition: all 0.2s;
        }
        .eks-stage-i {
          width: 22px; height: 22px; border-radius: 50%;
          background: oklch(0.20 0.006 70);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: var(--fg-muted);
          margin-bottom: 6px;
        }
        .eks-stage-name { font-size: 12px; color: var(--fg); font-weight: 500; }
        .eks-stage-sub { font-size: 10.5px; color: var(--fg-dim); margin-top: 2px; line-height: 1.4; }
        .eks-active { border-color: var(--accent); background: oklch(0.82 0.135 75 / 0.10); }
        .eks-active .eks-stage-i { background: oklch(0.82 0.135 75 / 0.2); border-color: var(--accent); color: var(--accent); animation: eksPulse 1s infinite; }
        @keyframes eksPulse { 50% { transform: scale(1.1); } }
        .eks-done { border-color: oklch(0.78 0.13 160 / 0.4); }
        .eks-done .eks-stage-i { background: oklch(0.78 0.13 160 / 0.2); border-color: var(--good); color: var(--good); }
        .eks-conn { flex: 0; width: 12px; height: 1px; background: var(--border); }
        .eks-conn-on { background: var(--good); }

        .eks-logs {
          background: oklch(0.11 0.005 70);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        .eks-logs-bar {
          display: flex; justify-content: space-between;
          padding: 8px 14px; font-size: 10.5px;
          background: oklch(0.16 0.006 70);
          border-bottom: 1px solid var(--border);
        }
        .eks-logs-body {
          padding: 12px 14px;
          font-size: 11.5px; line-height: 1.7;
          min-height: 200px; max-height: 240px;
          overflow-y: auto;
        }
        .eks-log { white-space: pre-wrap; }
        .eks-log-info { color: var(--fg); }
        .eks-log-dim { color: var(--fg-dim); }
        .eks-log-ok { color: var(--good); }
        .eks-log-accent { color: var(--accent); font-weight: 500; }
        .eks-log-cursor { color: var(--accent); animation: blink 1s steps(2) infinite; display: inline-block; }
      `}</style>
    </div>);

}

/* =====================================================================
   5) OTEL — insight-first analytics view
   surfaces *what changed* and *why* before showing raw timeseries
   ===================================================================== */
const OTEL_SERVICES = ['ingest', 'analytics', 'notify', 'auth', 'audit'];
const OTEL_BASELINES = { ingest: 32, analytics: 47, notify: 22, auth: 14, audit: 9 };
const OTEL_BASE_RPS = { ingest: 1240, analytics: 847, notify: 421, auth: 387, audit: 119 };
const OTEL_POINTS = 40;

const HYPOTHESES = {
  analytics: 'pgvector pool exhausted on tenant ACME-7142 — recall queries fanning out',
  ingest: 'kafka rebalance in progress · 2 partitions migrating between brokers',
  notify: 'slack API returning 429s on the alerts rate bucket',
  auth: 'JWT verification queue depth growing — token-vault cold start',
  audit: 'cold-tier writeback amplification — Delta compaction overdue'
};

function heatColor(t) {
  const k = Math.max(0, Math.min(1, t));
  if (k < 0.33) {
    const u = k / 0.33;
    return `oklch(${(0.22 + u * 0.10).toFixed(3)} ${(0.012 + u * 0.045).toFixed(3)} 215)`;
  }
  if (k < 0.66) {
    const u = (k - 0.33) / 0.33;
    return `oklch(${(0.32 + u * 0.20).toFixed(3)} ${(0.06 + u * 0.06).toFixed(3)} ${(215 - u * 110).toFixed(0)})`;
  }
  const u = (k - 0.66) / 0.34;
  return `oklch(${(0.52 + u * 0.12).toFixed(3)} ${(0.13 + u * 0.05).toFixed(3)} ${(105 - u * 80).toFixed(0)})`;
}

function Sparkline({ data, width = 88, height = 22, color = 'currentColor' }) {
  if (!data || data.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = i / (data.length - 1) * width;
    const y = height - 1 - (v - min) / range * (height - 2);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = data[data.length - 1];
  const lx = width;
  const ly = height - 1 - (last - min) / range * (height - 2);
  return (
    <svg width={width} height={height} className="ot-spark">
      <path d={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx={lx - 1} cy={ly} r="1.8" fill={color} />
    </svg>);

}

function OTelDemo() {
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState('analytics');
  const [history, setHistory] = useState(() => {
    const init = {};
    OTEL_SERVICES.forEach((s) => {
      const drift = s === 'analytics' ? 0.6 : 0;
      init[s] = Array.from({ length: OTEL_POINTS }, (_, i) =>
      OTEL_BASELINES[s] + (Math.random() - 0.5) * 5 + i / OTEL_POINTS * drift * 30
      );
    });
    return init;
  });
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setHistory((prev) => {
        const next = {};
        for (const s of OTEL_SERVICES) {
          const arr = prev[s].slice(1);
          const last = prev[s][prev[s].length - 1];
          const base = OTEL_BASELINES[s];
          let drift = 0;
          if (s === 'analytics') drift = 0.35;
          if (s === 'ingest') drift = 0.06;
          const wobble = (Math.random() - 0.5) * 6;
          const spike = s === 'analytics' && Math.random() < 0.10 ?
          25 + Math.random() * 50 :
          Math.random() < 0.015 ? 12 + Math.random() * 18 : 0;
          let v = last + wobble + drift + spike * 0.5;
          v = v * 0.92 + base * 0.08; // mean-revert
          v = Math.max(base * 0.5, Math.min(base * 3.6, v));
          arr.push(v);
          next[s] = arr;
        }
        return next;
      });

      if (Math.random() < 0.55) {
        const svc = OTEL_SERVICES[Math.floor(Math.random() * OTEL_SERVICES.length)];
        const isHot = svc === 'analytics' && Math.random() < 0.4;
        const dur = isHot ?
        Math.round(70 + Math.random() * 80) :
        Math.round(OTEL_BASELINES[svc] + Math.random() * 22);
        setTraces((t) => [
        {
          id: Date.now() + Math.random(),
          svc,
          dur,
          status: dur > 130 ? 'ERR' : 'OK',
          anomaly: isHot,
          ts: new Date().toLocaleTimeString().slice(0, 8)
        },
        ...t].
        slice(0, 6));
      }
    }, 700);
    return () => clearInterval(id);
  }, [paused]);

  // Derive per-service stats
  const byService = useMemo(() => {
    const out = {};
    for (const s of OTEL_SERVICES) {
      const h = history[s];
      const sorted = [...h].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      const recent = h.slice(-8).reduce((a, b) => a + b, 0) / 8;
      const baseline = OTEL_BASELINES[s];
      const delta = (recent - baseline) / baseline;
      const rps = Math.round(OTEL_BASE_RPS[s] * (1 + Math.sin(tick * 0.11 + s.length) * 0.04));
      const errPct = s === 'analytics' ? (0.6 + Math.sin(tick * 0.07) * 0.5).toFixed(2) : (Math.random() * 0.2).toFixed(2);
      out[s] = { p50, p99, recent, baseline, delta, rps, errPct, history: h };
    }
    return out;
  }, [history, tick]);

  const totalRps = OTEL_SERVICES.reduce((acc, s) => acc + byService[s].rps, 0);
  const ranked = OTEL_SERVICES.map((s) => ({ s, ...byService[s] })).sort((a, b) => b.delta - a.delta);
  const worst = ranked[0];

  // Error-budget burn: derived from anomalous trace volume + analytics drift
  const anomalies = traces.filter((t) => t.anomaly).length;
  const budgetUsed = Math.min(0.62, 0.18 + tick * 0.00018 + anomalies * 0.004);
  const daysObserved = 2.1 + tick * 0.0008;
  const burnRate = budgetUsed / (daysObserved / 7); // 1.0 = on track
  const daysToExhaust = Math.max(0.5, 7 * (1 - budgetUsed) / Math.max(0.4, burnRate));

  const rpsBaseline = 2541;
  const rpsDelta = (totalRps - rpsBaseline) / rpsBaseline;

  const insights = [];
  if (worst.delta > 0.25) {
    insights.push({
      kind: 'warn',
      icon: '!',
      title: `${worst.s} p99 trending up`,
      stat: `${worst.recent.toFixed(0)} ms`,
      delta: `${(worst.delta > 0 ? '+' : '') + (worst.delta * 100).toFixed(0)}% vs ${worst.baseline}ms baseline`,
      reason: HYPOTHESES[worst.s],
      tag: 'live · 7m',
      onClick: () => setSelected(worst.s)
    });
  } else {
    insights.push({
      kind: 'ok',
      icon: '✓',
      title: 'All services within tolerance',
      stat: `${worst.recent.toFixed(0)} ms`,
      delta: `worst delta: ${worst.s} ${(worst.delta * 100).toFixed(0)}%`,
      reason: 'no service exceeding 25% drift from 7-day baseline',
      tag: 'live · 7m'
    });
  }
  insights.push({
    kind: burnRate > 1.3 ? 'crit' : burnRate > 1 ? 'warn' : 'ok',
    icon: burnRate > 1 ? '▲' : '◇',
    title: 'Error budget',
    stat: `${(budgetUsed * 100).toFixed(1)}%`,
    delta: `consumed of weekly 99.9% SLO`,
    reason: burnRate > 1 ?
    `burn rate ${burnRate.toFixed(2)}× · exhausted in ${daysToExhaust.toFixed(1)}d at this pace` :
    `on track · ${daysToExhaust.toFixed(1)}d of budget remaining`,
    tag: 'window · 7d'
  });
  insights.push({
    kind: 'info',
    icon: '◆',
    title: 'Traffic shift detected',
    stat: `${totalRps.toLocaleString()} rps`,
    delta: `${rpsDelta >= 0 ? '+' : ''}${(rpsDelta * 100).toFixed(0)}% vs 7-day mean`,
    reason: 'notify → ingest after release v0.4.2 (13:42 UTC)',
    tag: 'change-detect'
  });

  // Selected service detail data
  const sel = byService[selected];
  const selHist = sel.history;
  const W = 580,H = 100;
  const selMax = Math.max(...selHist) * 1.1;
  const selMin = Math.min(0, ...selHist) - 4;
  const yScale = (v) => H - (v - selMin) / (selMax - selMin) * (H - 6) - 3;
  const xScale = (i) => i / (selHist.length - 1) * W;
  const path = selHist.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
  const fillPath = `${path} L${W},${H} L0,${H} Z`;
  const baselineY = yScale(OTEL_BASELINES[selected]);
  // mark anomaly points (>2x baseline)
  const anomalyPts = selHist.
  map((v, i) => ({ v, i })).
  filter((p) => p.v > OTEL_BASELINES[selected] * 1.9);

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <div className="demo-title mono">otel-insights · live</div>
          <div className="demo-sub">auto-derived findings across {OTEL_SERVICES.length} services · streaming from kafka</div>
        </div>
        <div className="demo-mode">
          <span className="demo-pill mono is-on" style={{ cursor: 'default' }}>
            <span className="ot-live-dot" /> {paused ? 'paused' : 'streaming'}
          </span>
          <button className="demo-pill mono" onClick={() => setPaused(!paused)}>
            {paused ? '▶ resume' : '❚❚ pause'}
          </button>
        </div>
      </div>

      <div className="demo-body otel2-body">
        {/* AUTO-DERIVED INSIGHTS */}
        <div className="ot-insights">
          {insights.map((ins, i) =>
          <div
            key={i}
            className={`ot-ins ot-ins-${ins.kind} ${ins.onClick ? 'is-clickable' : ''}`}
            onClick={ins.onClick}>
            
              <div className="ot-ins-head">
                <span className={`ot-ins-marker ot-mk-${ins.kind} mono`}>{ins.icon}</span>
                <span className="ot-ins-title">{ins.title}</span>
                <span className="ot-ins-tag mono">{ins.tag}</span>
              </div>
              <div className="ot-ins-stat mono">{ins.stat}</div>
              <div className="ot-ins-delta mono">{ins.delta}</div>
              <div className="ot-ins-reason">
                <span className="mono dim">why</span> {ins.reason}
              </div>
            </div>
          )}
        </div>

        {/* SERVICE LATENCY HEATMAP */}
        <div className="ot-panel">
          <div className="ot-panel-h">
            <span className="eyebrow">// LATENCY HEATMAP · p99 by service · click to inspect</span>
            <span className="ot-axis mono">
              <span>← 28m ago</span><span>now →</span>
            </span>
          </div>
          <div className="ot-heat">
            {OTEL_SERVICES.map((s) => {
              const r = byService[s];
              const isSel = selected === s;
              const hi = OTEL_BASELINES[s] * 2.5;
              return (
                <button
                  key={s}
                  type="button"
                  className={`ot-heat-row ${isSel ? 'is-sel' : ''}`}
                  onClick={() => setSelected(s)}>
                  
                  <div className="ot-heat-label mono">{s}</div>
                  <div className="ot-heat-cells">
                    {r.history.map((v, i) => {
                      const intensity = Math.max(0, (v - OTEL_BASELINES[s] * 0.6) / (hi - OTEL_BASELINES[s] * 0.6));
                      return (
                        <div
                          key={i}
                          className="ot-heat-cell"
                          style={{ background: heatColor(intensity) }}
                          title={`${v.toFixed(0)}ms`} />);


                    })}
                  </div>
                  <div className="ot-heat-meta mono">
                    <span className={r.delta > 0.25 ? 'ot-bad' : r.delta < -0.05 ? 'ot-ok' : 'ot-mid'}>
                      {r.recent.toFixed(0)}ms
                    </span>
                    <span className={`ot-arrow ${r.delta > 0 ? 'ot-up' : 'ot-down'}`}>
                      {r.delta > 0 ? '↑' : '↓'}{(Math.abs(r.delta) * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>);

            })}
          </div>
        </div>

      </div>

      <style>{`
        .otel2-body { display: flex; flex-direction: column; gap: 14px; }

        .ot-live-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: var(--good); margin-right: 6px; vertical-align: 1px;
          animation: otBlip 1.4s infinite;
        }
        @keyframes otBlip { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

        /* INSIGHT CARDS */
        .ot-insights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 760px) { .ot-insights { grid-template-columns: 1fr; } }
        .ot-ins {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          transition: border-color 0.15s, transform 0.15s;
        }
        .ot-ins.is-clickable { cursor: pointer; }
        .ot-ins.is-clickable:hover { border-color: var(--border-strong); transform: translateY(-1px); }
        .ot-ins-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .ot-ins-marker {
          width: 18px; height: 18px; border-radius: 5px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; flex-shrink: 0;
        }
        .ot-mk-warn { background: oklch(0.78 0.14 75 / 0.18); color: oklch(0.84 0.14 75); }
        .ot-mk-crit { background: oklch(0.70 0.18 28 / 0.18); color: oklch(0.82 0.18 28); }
        .ot-mk-info { background: oklch(0.72 0.10 220 / 0.18); color: oklch(0.84 0.10 220); }
        .ot-mk-ok   { background: oklch(0.78 0.13 160 / 0.18); color: var(--good); }
        .ot-ins-title { font-size: 12.5px; color: var(--fg); font-weight: 500; flex: 1; }
        .ot-ins-tag { font-size: 9.5px; color: var(--fg-dim); letter-spacing: 0.08em; text-transform: uppercase; }
        .ot-ins-stat { font-size: 26px; color: var(--fg); letter-spacing: -0.02em; line-height: 1; }
        .ot-ins-delta { font-size: 11.5px; color: var(--fg-muted); margin-top: 4px; }
        .ot-ins-reason {
          font-size: 12px; color: var(--fg-muted); line-height: 1.5;
          margin-top: 10px; padding-top: 10px;
          border-top: 1px dashed var(--border);
        }
        .ot-ins-reason .dim { margin-right: 6px; font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; }

        /* PANELS */
        .ot-panel {
          background: oklch(0.11 0.005 70);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
        }
        .ot-panel-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; gap: 12px; }
        .ot-axis { font-size: 10px; color: var(--fg-dim); display: flex; gap: 12px; }

        /* HEATMAP */
        .ot-heat { display: flex; flex-direction: column; gap: 4px; }
        .ot-heat-row {
          display: grid; grid-template-columns: 78px 1fr 112px;
          gap: 12px; align-items: center;
          background: transparent; border: 0; padding: 4px 6px;
          border-radius: 6px; cursor: pointer; text-align: left;
          font: inherit; color: inherit;
          transition: background 0.12s;
        }
        .ot-heat-row:hover { background: oklch(0.18 0.005 70 / 0.5); }
        .ot-heat-row.is-sel { background: oklch(0.82 0.135 75 / 0.08); outline: 1px solid oklch(0.82 0.135 75 / 0.35); }
        .ot-heat-label { font-size: 12px; color: var(--fg); }
        .ot-heat-cells {
          display: grid; grid-template-columns: repeat(${OTEL_POINTS}, 1fr);
          gap: 2px; height: 22px;
        }
        .ot-heat-cell { border-radius: 2px; }
        .ot-heat-meta { font-size: 11.5px; display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
        .ot-arrow { font-size: 11px; }
        .ot-bad { color: oklch(0.78 0.16 30); }
        .ot-ok { color: var(--good); }
        .ot-mid { color: var(--fg-muted); }
        .ot-up { color: oklch(0.78 0.16 30); }
        .ot-down { color: var(--good); }

        @media (max-width: 760px) {
          .ot-heat-row { grid-template-columns: 68px 1fr 96px; }
        }
      `}</style>
    </div>);

}

/* ===== Shared demo chrome styles ===== */
const SharedDemoStyles = `
  .demo { padding: 22px; display: flex; flex-direction: column; gap: 18px; flex: 1; }
  .demo-head {
    display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .demo-title { font-size: 13px; color: var(--fg); }
  .demo-sub { font-size: 11.5px; color: var(--fg-dim); margin-top: 2px; }
  .demo-mode { display: flex; gap: 6px; }
  .demo-pill {
    background: transparent; border: 1px solid var(--border);
    color: var(--fg-muted); padding: 6px 12px;
    border-radius: 999px; font-size: 11px;
    cursor: pointer; transition: all 0.15s;
  }
  .demo-pill:hover:not(:disabled) { border-color: var(--border-strong); color: var(--fg); }
  .demo-pill.is-on { background: oklch(0.82 0.135 75 / 0.12); border-color: var(--accent); color: var(--accent); }
  .demo-pill:disabled { opacity: 0.6; cursor: not-allowed; }
  .demo-body { flex: 1; display: flex; flex-direction: column; }
`;

// Inject shared styles once
if (typeof document !== 'undefined' && !document.getElementById('demo-shared-styles')) {
  const s = document.createElement('style');
  s.id = 'demo-shared-styles';
  s.textContent = SharedDemoStyles;
  document.head.appendChild(s);
}

window.Playground = Playground;