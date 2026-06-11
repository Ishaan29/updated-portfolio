import React from 'react';

export default function NotifyArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="n-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
        <rect x="10" y="156" width="460" height="40" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="174" fill="oklch(0.78 0.13 160)">DLQ per channel · self-serve replay tooling for on-call · contract tests (Pact)</text>
        <text x="22" y="186" fill="oklch(0.78 0.13 160 / 0.85)" fontSize="9">−80% recurring incident rate · MTTD &lt; 90s</text>
      </g>

      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
