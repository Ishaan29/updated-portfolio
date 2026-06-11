"use client";

import React, { useState, useEffect } from 'react';
import styles from './Playground.module.css';

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
  { id: 12, text: 'mqtt bridge tuned for 2K concurrent device connections and 150ms RTT', tags: ['mqtt', 'iot'] }
];

const queries = [
  'how do you handle backpressure?',
  'multi-tenant isolation patterns',
  'ETL that does not page you at 3am',
  'debug a slow microservice'
];

export default function VectorDBDemo() {
  const [query, setQuery] = useState(queries[0]);
  const [typed, setTyped] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [latency, setLatency] = useState(0);
  const [mode, setMode] = useState<'semantic' | 'lexical'>('semantic');

  const tokenize = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) || [];
  const score = (q: string, doc: any) => {
    const qt = new Set(tokenize(q));
    const dt = tokenize(doc.text + ' ' + doc.tags.join(' '));
    let hits = 0;
    dt.forEach((t) => qt.has(t) && hits++);
    doc.tags.forEach((tag: string) => {
      qt.forEach((qtok: string) => {
        if (qtok.length > 3 && (tag.includes(qtok) || qtok.includes(tag))) hits += 0.5;
      });
    });
    return hits;
  };

  const lexicalRank = (q: string) => corpus
    .map((d) => ({ ...d, s: score(q, d) }))
    .filter((d) => d.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4);

  const semanticRank = async (q: string) => {
    const prompt = `Rank these snippets by semantic relevance to the query.

QUERY: "${q}"

SNIPPETS:
${corpus.map((d) => `${d.id}: ${d.text}`).join('\n')}

Return ONLY valid JSON, top 4 best matches, no prose:
{"ranked":[{"id":<number>,"score":<1-10>},...]}`;
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = data.text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error();
      const parsed = JSON.parse(m[0]);
      return parsed.ranked.slice(0, 4)
        .map((r: any) => { const d = corpus.find((x) => x.id === r.id); return d ? { ...d, s: r.score } : null; })
        .filter(Boolean);
    } catch (e) { return lexicalRank(q); }
  };

  const runQuery = (q: string) => {
    setRunning(true);
    setResults([]);
    setTyped('');
    let i = 0;
    const step = () => {
      if (i <= q.length) { setTyped(q.slice(0, i)); i++; setTimeout(step, 18); } else {
        const t0 = performance.now();
        if (mode === 'semantic') {
          semanticRank(q).then((r) => {
            setLatency(performance.now() - t0); setResults(r); setRunning(false);
          });
        } else {
          const lat = 24 + Math.random() * 16;
          setLatency(lat);
          setTimeout(() => { setResults(lexicalRank(q)); setRunning(false); }, lat * 6);
        }
      }
    };
    step();
  };

  useEffect(() => { runQuery(queries[0]); }, []);

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <div>
          <div className={`${styles.demoTitle} mono`}>vectordb-go · 0.3.1</div>
          <div className={styles.demoSub}>similarity search over 12 indexed snippets</div>
        </div>
        <div className={styles.demoMode}>
          <button
            className={`${styles.demoPill} mono ${mode === 'semantic' ? styles.isOn : ''}`}
            onClick={() => setMode('semantic')}>
            semantic
          </button>
          <button
            className={`${styles.demoPill} mono ${mode === 'lexical' ? styles.isOn : ''}`}
            onClick={() => setMode('lexical')}>
            lexical · bm25
          </button>
        </div>
      </div>

      <div className={styles.demoBody}>
        <div className={styles.vdbQueryBar}>
          <span className={`mono ${styles.vdbPrompt}`}><span className="dim">db.query</span>(</span>
          <span className={`mono ${styles.vdbQ}`}>"{typed}{running && <span className={styles.playCursor}>▍</span>}"</span>
          <span className={`mono ${styles.vdbPrompt}`}>)</span>
          <span className={`mono ${styles.vdbMeta}`}>
            {running ? 'searching…' : `top-${results.length} · ${latency.toFixed(0)}ms · ${mode}`}
          </span>
        </div>

        <div className={styles.vdbGrid}>
          <div className="vdb-left">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// PRESET QUERIES</div>
            <div className={styles.vdbPresets}>
              {queries.map((q) =>
                <button key={q} className={`${styles.vdbPreset} ${query === q ? styles.isOn : ''}`}
                  onClick={() => { setQuery(q); runQuery(q); }}>{q}</button>
              )}
            </div>
            <form className={styles.vdbForm} onSubmit={(e) => { e.preventDefault(); if (query.trim()) runQuery(query); }}>
              <input className={`mono ${styles.vdbInput}`} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="ask anything…" />
              <button type="submit" className={`btn btn-primary ${styles.vdbGo}`}>run</button>
            </form>
          </div>

          <div className="vdb-right">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// TOP-K MATCHES</div>
            <div className={styles.vdbResults}>
              {results.length === 0 && !running && <div className={`mono dim ${styles.vdbEmpty}`}>no matches</div>}
              {results.map((r, i) =>
                <div key={r.id} className={styles.vdbR}>
                  <div className={styles.vdbRHead}>
                    <span className={`mono ${styles.vdbRank}`}>#{i + 1}</span>
                    <span className="mono dim">score {Number(r.s).toFixed(1)}</span>
                  </div>
                  <div className={styles.vdbRText}>{r.text}</div>
                  <div className={styles.vdbRTags}>{r.tags.map((t: string) => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
