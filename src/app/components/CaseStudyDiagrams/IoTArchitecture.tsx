import React from 'react';

export default function IoTArchitecture() {
  return (
    <svg viewBox="0 0 480 280" width="100%" height="100%">
      <defs>
        <marker id="i-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0.01 70)"/>
        </marker>
      </defs>

      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
        <rect x="10" y="194" width="460" height="36" rx="6" fill="oklch(0.78 0.13 160 / 0.08)" stroke="oklch(0.78 0.13 160)"/>
        <text x="22" y="212" fill="oklch(0.78 0.13 160)">AWS EKS · Terraform IaC · ALB · 3× auto-scaling · zero-downtime blue/green</text>
        <text x="22" y="224" fill="oklch(0.78 0.13 160 / 0.8)" fontSize="9">+30% throughput · −$5K/mo infra cost · 99.9% reliability</text>
      </g>

      <g fontFamily="var(--font-mono, monospace)" fontSize="10">
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
