import React from 'react';

export default function RAGArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="r-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      {/* sources */}
      <g fontFamily="var(--font-mono, monospace)" fontSize="10" fill="oklch(0.72 0.01 70)">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
        <rect x="10" y="180" width="460" height="36" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="198" fill="oklch(0.78 0.13 160)">OpenTelemetry SDK · distributed tracing across 12 services · MTTR −50%</text>
        <text x="22" y="210" fill="oklch(0.78 0.13 160 / 0.8)" fontSize="9">circuit breakers · retries with backoff · cached degraded mode</text>
      </g>

      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
