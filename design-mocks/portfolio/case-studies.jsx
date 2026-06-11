/* global React */
const { useState } = React;

function CaseStudies() {
  const [open, setOpen] = useState('rag');

  const studies = [
    {
      id: 'rag',
      tag: 'GAINSIGHT · 2023–24',
      title: 'RAG analytics microservice across 400+ tenants',
      one: 'Built the analytics + observability stack for a multi-tenant SaaS. RAG over 10TB of customer data, 99.95% uptime, partition-aware ETL.',
      headline: '10TB processed · 45% query speedup · 99.95% uptime',
      problem: 'Each enterprise tenant had its own data shape, retention rules, and access boundaries. The legacy analytics stack scanned everything per query — at 400 tenants and 10TB it was unusably slow, and one noisy tenant could starve the rest. We needed a multi-tenant analytics service that stayed fast as tenant count grew, without leaking data across boundaries.',
      decisions: [
        'PGVector with HNSW indexes per logical tenant scope — let us tune recall/latency per workload.',
        'Delta Lake for the cold tier; partition pruning by tenant+time cut scan cost by ~60%.',
        'Apache Airflow with idempotent task graphs and explicit retry budgets — fewer 3am pages.',
        'Circuit breakers around the vector store; degraded mode returned cached top-K rather than 500ing.',
      ],
      results: [
        ['10TB', 'data processed across 400+ tenants'],
        ['99.95%', 'uptime over the year'],
        ['−45%', 'p95 query latency vs. prior service'],
        ['2×', 'ETL throughput via partition tuning'],
      ],
      stack: ['Java', 'Python', 'PGVector', 'Postgres', 'AWS Glue', 'S3', 'DynamoDB', 'Delta Lake', 'Apache Airflow', 'OpenTelemetry', 'Kubernetes', 'Helm'],
      diagram: <RAGArchitecture />,
    },
    {
      id: 'iot',
      tag: 'VELOTIO · 2024',
      title: 'IoT telemetry platform at 100K events/sec',
      one: 'Led backend architecture for an enterprise IoT platform with real-time telemetry processing, AWS infra-as-code, and sub-10ms p99 ingestion.',
      headline: '100K events/sec · sub-10ms p99 · $5K/mo saved',
      problem: 'The client had thousands of edge devices reporting telemetry over MQTT/TCP. The existing ingestion path queued in-memory and dropped messages under spikes; downstream consumers (alerts, dashboards, ML) could not trust the stream. We rebuilt the platform end-to-end on AWS.',
      decisions: [
        'Kafka with carefully sized partitions per device class — bounded backpressure instead of in-memory queues.',
        'Custom MQTT bridge tuned for 2K concurrent connections with 150ms round-trip latency.',
        'EKS + Terraform for the whole footprint — repeatable, blue/green deploys, zero-downtime rollouts.',
        'Redis as a hot cache in front of Postgres for the device-state read path.',
      ],
      results: [
        ['100K+', 'events/sec sustained'],
        ['<10ms', 'p99 ingestion latency'],
        ['99.9%', 'reliability against device churn'],
        ['−30%', 'infra cost via right-sizing'],
      ],
      stack: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'AWS EKS', 'AWS ALB', 'Terraform', 'MQTT', 'TCP/IP'],
      diagram: <IoTArchitecture />,
    },
    {
      id: 'notify',
      tag: 'GAINSIGHT · 2021–23',
      title: 'Notification infra for 1M+ end users',
      one: 'Core notification engine powering real-time alerts and third-party integrations for over a million end users — built around event sourcing.',
      headline: '1M+ users · 80ms p99 · 99.99% available',
      problem: 'The product needed reliable, deduped, multi-channel notifications (Slack, Teams, email) across a million end-users with per-tenant rate limits. The original cron-based fanout missed SLAs and double-sent under retry storms.',
      decisions: [
        'Event-sourced log of intents; downstream channels were stateless projectors — replay-safe.',
        'OAuth 2.0 token vault with rotation for Slack and Microsoft Graph at 5K msg/sec.',
        'Dead-letter queues per channel, with surfaced replay tooling so on-call could resolve without engineers.',
        '85% test coverage with Jest + Mocha and contract tests via Pact across the Node.js services.',
      ],
      results: [
        ['1M+', 'end users served'],
        ['80ms', 'p99 latency'],
        ['99.99%', 'availability'],
        ['−80%', 'recurring incident rate via RCA'],
      ],
      stack: ['Node.js', 'TypeScript', 'OAuth 2.0', 'Slack API', 'Microsoft Graph API', 'Event Sourcing', 'Jest', 'Mocha', 'Pact'],
      diagram: <NotifyArchitecture />,
    },
  ];

  return (
    <section id="work">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">// 03 — selected work</span>
            <h2>Three systems,<br/>in <em>depth</em>.</h2>
          </div>
          <div className="head-aside">
            Click a study to expand the architecture, decisions, and the results that landed in a perf review. Numbers are real, not aspirational.
          </div>
        </div>

        <div className="studies">
          {studies.map((s) => {
            const isOpen = open === s.id;
            return (
              <div key={s.id} className={`study ${isOpen ? 'is-open' : ''}`}>
                <button
                  className="study-head"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                >
                  <div className="study-head-l">
                    <div className="mono study-tag">{s.tag}</div>
                    <div className="study-title">{s.title}</div>
                    <div className="study-one">{s.one}</div>
                  </div>
                  <div className="study-head-r">
                    <div className="study-headline mono">{s.headline}</div>
                    <div className="study-toggle" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={isOpen ? "M5 15l7-7 7 7" : "M5 9l7 7 7-7"}/>
                      </svg>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="study-body">
                    <div className="study-grid">
                      <div className="study-col">
                        <div className="eyebrow">// THE PROBLEM</div>
                        <p className="study-text">{s.problem}</p>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// KEY DECISIONS</div>
                        <ul className="study-list">
                          {s.decisions.map((d, i) => (
                            <li key={i}>
                              <span className="mono study-bullet">→</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// STACK</div>
                        <div className="study-stack">
                          {s.stack.map((t) => <span key={t} className="chip">{t}</span>)}
                        </div>
                      </div>

                      <div className="study-col">
                        <div className="eyebrow">// ARCHITECTURE</div>
                        <div className="study-diag-wrap">{s.diagram}</div>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// RESULTS</div>
                        <div className="study-results">
                          {s.results.map(([n, l], i) => (
                            <div key={i} className="result-cell">
                              <div className="result-n mono">{n}</div>
                              <div className="result-l">{l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .studies { display: flex; flex-direction: column; gap: 14px; }
        .study {
          border: 1px solid var(--border);
          background: var(--bg-card);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .study.is-open { border-color: oklch(0.82 0.135 75 / 0.4); }
        .study-head {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: center;
          padding: 24px 28px;
          background: transparent;
          border: 0;
          color: inherit;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .study-head:hover { background: oklch(0.25 0.008 70 / 0.4); }
        .study-tag { font-size: 11px; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 8px; }
        .study-title {
          font-family: var(--serif);
          font-size: clamp(22px, 2.6vw, 30px);
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.15;
          margin-bottom: 6px;
        }
        .study-one { color: var(--fg-muted); font-size: 14.5px; max-width: 64ch; }
        .study-head-r {
          display: flex; align-items: center; gap: 18px;
        }
        .study-headline {
          font-size: 12px;
          color: var(--fg-muted);
          text-align: right;
          letter-spacing: 0.02em;
        }
        @media (max-width: 720px) { .study-headline { display: none; } }
        .study-toggle {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--border-strong);
          color: var(--fg-muted);
          flex-shrink: 0;
        }
        .study.is-open .study-toggle { color: var(--accent); border-color: var(--accent); }
        .study-body {
          border-top: 1px solid var(--border);
          padding: 28px;
          background: oklch(0.18 0.006 70 / 0.5);
        }
        .study-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
        }
        @media (max-width: 880px) { .study-grid { grid-template-columns: 1fr; gap: 32px; } }
        .study-text { color: var(--fg-muted); font-size: 14.5px; line-height: 1.65; margin: 12px 0 0; }
        .study-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .study-list li {
          display: grid; grid-template-columns: 16px 1fr; gap: 10px;
          color: var(--fg-muted); font-size: 14.5px; line-height: 1.55;
        }
        .study-bullet { color: var(--accent); }
        .study-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .study-diag-wrap {
          margin-top: 12px;
          background: oklch(0.13 0.006 70);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px;
          aspect-ratio: 16/10;
        }
        .study-results {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px;
        }
        .result-cell {
          background: oklch(0.16 0.006 70);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
        }
        .result-n { font-size: 24px; color: var(--fg); letter-spacing: -0.01em; }
        .result-l { font-size: 12px; color: var(--fg-muted); margin-top: 4px; }
      `}</style>
    </section>
  );
}

/* ===== Full architecture diagrams ===== */
function RAGArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="r-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      {/* sources */}
      <g fontFamily="var(--mono, monospace)" fontSize="10" fill="oklch(0.72 0.01 70)">
        <text x="10" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">SOURCES</text>
        <rect x="10" y="22" width="86" height="24" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="53" y="38" textAnchor="middle">tenant API logs</text>
        <rect x="10" y="56" width="86" height="24" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="53" y="72" textAnchor="middle">CRM exports</text>
        <rect x="10" y="90" width="86" height="24" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="53" y="106" textAnchor="middle">webhooks</text>
        <rect x="10" y="124" width="86" height="24" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="53" y="140" textAnchor="middle">S3 cold dump</text>
      </g>

      {/* ETL */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="130" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">ETL · AIRFLOW</text>
        <rect x="130" y="22" width="100" height="126" rx="6" fill="oklch(0.78 0.10 230 / 0.08)" stroke="oklch(0.78 0.10 230)"/>
        <text x="180" y="42" textAnchor="middle" fill="oklch(0.78 0.10 230)" fontSize="11">orchestrator</text>
        <text x="180" y="60" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">partition prune</text>
        <text x="180" y="76" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">retry budget</text>
        <text x="180" y="92" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">idempotent</text>
        <text x="180" y="108" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">embed batch</text>
        <text x="180" y="124" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">DLQ + replay</text>
      </g>

      {/* delta lake */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="262" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">STORAGE</text>
        <rect x="262" y="22" width="100" height="58" rx="6" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="312" y="42" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">delta lake</text>
        <text x="312" y="58" textAnchor="middle" fill="oklch(0.72 0.01 70)">cold tier</text>
        <text x="312" y="72" textAnchor="middle" fill="oklch(0.72 0.01 70)">parquet partitions</text>

        <rect x="262" y="90" width="100" height="58" rx="6" fill="oklch(0.82 0.135 75 / 0.10)" stroke="oklch(0.82 0.135 75)"/>
        <text x="312" y="110" textAnchor="middle" fill="oklch(0.82 0.135 75)" fontSize="11">pgvector</text>
        <text x="312" y="126" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">HNSW idx</text>
        <text x="312" y="140" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">per-tenant scope</text>
      </g>

      {/* serving */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="392" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">SERVING</text>
        <rect x="392" y="22" width="78" height="40" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="431" y="40" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">analytics</text>
        <text x="431" y="54" textAnchor="middle" fill="oklch(0.72 0.01 70)">API</text>

        <rect x="392" y="70" width="78" height="36" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="431" y="84" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">RAG svc</text>
        <text x="431" y="98" textAnchor="middle" fill="oklch(0.72 0.01 70)">top-K · LLM</text>

        <rect x="392" y="114" width="78" height="34" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="431" y="128" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">dashboards</text>
        <text x="431" y="142" textAnchor="middle" fill="oklch(0.72 0.01 70)">React UI</text>
      </g>

      {/* observability strip */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="180" width="460" height="36" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="198" fill="oklch(0.78 0.13 160)">OpenTelemetry SDK · distributed tracing across 12 services · MTTR −50%</text>
        <text x="22" y="210" fill="oklch(0.78 0.13 160 / 0.8)" fontSize="9">circuit breakers · retries with backoff · cached degraded mode</text>
      </g>

      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="226" width="460" height="44" rx="6" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="22" y="244" fill="oklch(0.85 0.005 70)">kubernetes · helm charts · blue/green deploys · per-tenant resource quotas</text>
        <text x="22" y="258" fill="oklch(0.72 0.01 70)" fontSize="9">5+ services migrated · +60% deploy reliability</text>
      </g>

      <g stroke="oklch(0.55 0.01 70)" strokeWidth="1" fill="none" markerEnd="url(#r-arr)">
        <path d="M96 34 L130 50"/>
        <path d="M96 68 L130 70"/>
        <path d="M96 102 L130 90"/>
        <path d="M96 136 L130 110"/>
        <path d="M230 60 L262 50"/>
        <path d="M230 110 L262 110"/>
        <path d="M362 50 L392 42"/>
        <path d="M362 119 L392 88"/>
        <path d="M362 119 L392 131"/>
      </g>
    </svg>
  );
}

function IoTArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="i-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="10" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">EDGE · 2K CONCURRENT</text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="10" y={22 + i * 28} width="80" height="20" rx="3" fill="none" stroke="oklch(0.40 0.01 70)"/>
            <text x="50" y={36 + i * 28} textAnchor="middle" fill="oklch(0.72 0.01 70)">device {i + 1}</text>
          </g>
        ))}
        <text x="50" y="150" textAnchor="middle" fill="oklch(0.55 0.01 70)">… 2K devices</text>
      </g>

      {/* MQTT bridge */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="120" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">INGESTION</text>
        <rect x="120" y="22" width="100" height="60" rx="6" fill="oklch(0.78 0.10 230 / 0.10)" stroke="oklch(0.78 0.10 230)"/>
        <text x="170" y="42" textAnchor="middle" fill="oklch(0.78 0.10 230)" fontSize="11">MQTT bridge</text>
        <text x="170" y="58" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">150ms RTT</text>
        <text x="170" y="72" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.85)">TCP/IP tuned</text>

        <rect x="120" y="92" width="100" height="62" rx="6" fill="oklch(0.82 0.135 75 / 0.10)" stroke="oklch(0.82 0.135 75)"/>
        <text x="170" y="112" textAnchor="middle" fill="oklch(0.82 0.135 75)" fontSize="11">kafka</text>
        <text x="170" y="128" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">3 brokers · 12 part.</text>
        <text x="170" y="144" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">at-least-once</text>
      </g>

      {/* processing */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="252" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">PROCESSING · SPRING</text>
        <rect x="252" y="22" width="100" height="44" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="302" y="40" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">ingest svc</text>
        <text x="302" y="56" textAnchor="middle" fill="oklch(0.72 0.01 70)">validate · enrich</text>

        <rect x="252" y="74" width="100" height="44" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="302" y="92" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">alerts svc</text>
        <text x="302" y="108" textAnchor="middle" fill="oklch(0.72 0.01 70)">rule eval · fanout</text>

        <rect x="252" y="126" width="100" height="44" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="302" y="144" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">aggregator</text>
        <text x="302" y="160" textAnchor="middle" fill="oklch(0.72 0.01 70)">windowed metrics</text>
      </g>

      {/* storage */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="384" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">STATE</text>
        <rect x="384" y="22" width="84" height="40" rx="4" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="426" y="40" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">redis</text>
        <text x="426" y="54" textAnchor="middle" fill="oklch(0.72 0.01 70)">device-state hot</text>

        <rect x="384" y="70" width="84" height="40" rx="4" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="426" y="88" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">postgres</text>
        <text x="426" y="102" textAnchor="middle" fill="oklch(0.72 0.01 70)">authoritative</text>

        <rect x="384" y="118" width="84" height="56" rx="4" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="426" y="138" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">timescale</text>
        <text x="426" y="152" textAnchor="middle" fill="oklch(0.72 0.01 70)">tsdb</text>
        <text x="426" y="166" textAnchor="middle" fill="oklch(0.72 0.01 70)">long-term</text>
      </g>

      {/* infra strip */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="194" width="460" height="36" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="212" fill="oklch(0.78 0.13 160)">AWS EKS · Terraform IaC · ALB · 3× auto-scaling · zero-downtime blue/green</text>
        <text x="22" y="224" fill="oklch(0.78 0.13 160 / 0.8)" fontSize="9">+30% throughput · −$5K/mo infra cost · 99.9% reliability</text>
      </g>

      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="240" width="460" height="30" rx="6" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="22" y="259" fill="oklch(0.72 0.01 70)">CloudWatch · Prometheus · Grafana · alert runbook per RCA category</text>
      </g>

      <g stroke="oklch(0.55 0.01 70)" strokeWidth="1" fill="none" markerEnd="url(#i-arr)">
        <path d="M90 32 L120 40"/>
        <path d="M90 60 L120 50"/>
        <path d="M90 88 L120 60"/>
        <path d="M90 116 L120 70"/>
        <path d="M220 52 L120 102" stroke="none"/>
        <path d="M170 82 L170 92"/>
        <path d="M220 124 L252 42"/>
        <path d="M220 124 L252 96"/>
        <path d="M220 124 L252 148"/>
        <path d="M352 42 L384 88"/>
        <path d="M352 96 L384 88"/>
        <path d="M352 148 L384 146"/>
        <path d="M352 96 L384 42"/>
      </g>
    </svg>
  );
}

function NotifyArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="n-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="10" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">PRODUCERS</text>
        <rect x="10" y="22" width="96" height="22" rx="3" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="58" y="36" textAnchor="middle" fill="oklch(0.72 0.01 70)">CS workflows</text>
        <rect x="10" y="50" width="96" height="22" rx="3" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="58" y="64" textAnchor="middle" fill="oklch(0.72 0.01 70)">rule engine</text>
        <rect x="10" y="78" width="96" height="22" rx="3" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="58" y="92" textAnchor="middle" fill="oklch(0.72 0.01 70)">scheduled jobs</text>
        <rect x="10" y="106" width="96" height="22" rx="3" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="58" y="120" textAnchor="middle" fill="oklch(0.72 0.01 70)">user actions</text>
      </g>

      {/* event log */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="138" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">EVENT LOG · APPEND-ONLY</text>
        <rect x="138" y="22" width="120" height="118" rx="6" fill="oklch(0.82 0.135 75 / 0.10)" stroke="oklch(0.82 0.135 75)"/>
        <text x="198" y="46" textAnchor="middle" fill="oklch(0.82 0.135 75)" fontSize="11">intent log</text>
        <text x="198" y="64" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">notify_intent</text>
        <text x="198" y="80" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">target_user</text>
        <text x="198" y="96" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">tenant_scope</text>
        <text x="198" y="112" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">rate_bucket</text>
        <text x="198" y="128" textAnchor="middle" fill="oklch(0.82 0.135 75 / 0.85)">idempotency_key</text>
      </g>

      {/* projectors */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <text x="290" y="14" fill="oklch(0.55 0.01 70)" fontSize="9">CHANNEL PROJECTORS · STATELESS</text>
        <rect x="290" y="22" width="80" height="32" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="330" y="42" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">slack</text>

        <rect x="378" y="22" width="92" height="32" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="424" y="42" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">ms teams</text>

        <rect x="290" y="62" width="80" height="32" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="330" y="82" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">email</text>

        <rect x="378" y="62" width="92" height="32" rx="4" fill="none" stroke="oklch(0.40 0.01 70)"/>
        <text x="424" y="82" textAnchor="middle" fill="oklch(0.85 0.005 70)" fontSize="11">webhook</text>

        <rect x="290" y="102" width="180" height="38" rx="4" fill="oklch(0.78 0.10 230 / 0.10)" stroke="oklch(0.78 0.10 230)"/>
        <text x="380" y="120" textAnchor="middle" fill="oklch(0.78 0.10 230)" fontSize="11">oauth token vault</text>
        <text x="380" y="134" textAnchor="middle" fill="oklch(0.78 0.10 230 / 0.8)">rotation · 5K msg/sec</text>
      </g>

      {/* dlq + replay */}
      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="156" width="460" height="40" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="174" fill="oklch(0.78 0.13 160)">DLQ per channel · self-serve replay tooling for on-call · contract tests (Pact)</text>
        <text x="22" y="186" fill="oklch(0.78 0.13 160 / 0.85)" fontSize="9">−80% recurring incident rate · MTTD &lt; 90s</text>
      </g>

      <g fontFamily="var(--mono, monospace)" fontSize="10">
        <rect x="10" y="206" width="460" height="62" rx="6" fill="oklch(0.20 0.006 70)" stroke="oklch(0.40 0.01 70)"/>
        <text x="22" y="226" fill="oklch(0.85 0.005 70)" fontSize="11">runtime · node.js + typescript · 85% coverage</text>
        <text x="22" y="242" fill="oklch(0.72 0.01 70)">jest unit · mocha integration · pact contract · synthetic canaries every 60s</text>
        <text x="22" y="258" fill="oklch(0.72 0.01 70)">p99 80ms · 99.99% available · 1M+ users</text>
      </g>

      <g stroke="oklch(0.55 0.01 70)" strokeWidth="1" fill="none" markerEnd="url(#n-arr)">
        <path d="M106 34 L138 60"/>
        <path d="M106 62 L138 78"/>
        <path d="M106 90 L138 90"/>
        <path d="M106 118 L138 110"/>
        <path d="M258 60 L290 38"/>
        <path d="M258 70 L378 38"/>
        <path d="M258 90 L290 78"/>
        <path d="M258 100 L378 78"/>
      </g>
    </svg>
  );
}

window.CaseStudies = CaseStudies;
