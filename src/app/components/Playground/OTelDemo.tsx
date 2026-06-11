"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from './Playground.module.css';

const OTEL_SERVICES = ['ingest', 'analytics', 'notify', 'auth', 'audit'];
const OTEL_BASELINES: Record<string, number> = { ingest: 32, analytics: 47, notify: 22, auth: 14, audit: 9 };
const OTEL_BASE_RPS: Record<string, number> = { ingest: 1240, analytics: 847, notify: 421, auth: 387, audit: 119 };
const OTEL_POINTS = 40;

const HYPOTHESES: Record<string, string> = {
  analytics: 'pgvector pool exhausted on tenant ACME-7142 — recall queries fanning out',
  ingest: 'kafka rebalance in progress · 2 partitions migrating between brokers',
  notify: 'slack API returning 429s on the alerts rate bucket',
  auth: 'JWT verification queue depth growing — token-vault cold start',
  audit: 'cold-tier writeback amplification — Delta compaction overdue'
};

function heatColor(t: number) {
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

export default function OTelDemo() {
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState('analytics');
  const [history, setHistory] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {};
    OTEL_SERVICES.forEach((s) => {
      const drift = s === 'analytics' ? 0.6 : 0;
      init[s] = Array.from({ length: OTEL_POINTS }, (_, i) =>
        OTEL_BASELINES[s] + (Math.random() - 0.5) * 5 + i / OTEL_POINTS * drift * 30
      );
    });
    return init;
  });
  const [traces, setTraces] = useState<any[]>([]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setHistory((prev) => {
        const next: Record<string, number[]> = {};
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
          v = v * 0.92 + base * 0.08;
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
            svc, dur,
            status: dur > 130 ? 'ERR' : 'OK',
            anomaly: isHot,
            ts: new Date().toLocaleTimeString().slice(0, 8)
          }, ...t
        ].slice(0, 6));
      }
    }, 700);
    return () => clearInterval(id);
  }, [paused]);

  const byService = useMemo(() => {
    const out: Record<string, any> = {};
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

  const anomalies = traces.filter((t) => t.anomaly).length;
  const budgetUsed = Math.min(0.62, 0.18 + tick * 0.00018 + anomalies * 0.004);
  const daysObserved = 2.1 + tick * 0.0008;
  const burnRate = budgetUsed / (daysObserved / 7);
  const daysToExhaust = Math.max(0.5, 7 * (1 - budgetUsed) / Math.max(0.4, burnRate));
  const rpsBaseline = 2541;
  const rpsDelta = (totalRps - rpsBaseline) / rpsBaseline;

  const insights = [];
  if (worst.delta > 0.25) {
    insights.push({
      kind: 'warn', icon: '!', title: `${worst.s} p99 trending up`,
      stat: `${worst.recent.toFixed(0)} ms`,
      delta: `${(worst.delta > 0 ? '+' : '') + (worst.delta * 100).toFixed(0)}% vs ${worst.baseline}ms baseline`,
      reason: HYPOTHESES[worst.s], tag: 'live · 7m',
      onClick: () => setSelected(worst.s)
    });
  } else {
    insights.push({
      kind: 'ok', icon: '✓', title: 'All services within tolerance',
      stat: `${worst.recent.toFixed(0)} ms`,
      delta: `worst delta: ${worst.s} ${(worst.delta * 100).toFixed(0)}%`,
      reason: 'no service exceeding 25% drift from 7-day baseline', tag: 'live · 7m'
    });
  }
  insights.push({
    kind: burnRate > 1.3 ? 'crit' : burnRate > 1 ? 'warn' : 'ok',
    icon: burnRate > 1 ? '▲' : '◇', title: 'Error budget',
    stat: `${(budgetUsed * 100).toFixed(1)}%`, delta: `consumed of weekly 99.9% SLO`,
    reason: burnRate > 1 ? `burn rate ${burnRate.toFixed(2)}× · exhausted in ${daysToExhaust.toFixed(1)}d at this pace` : `on track · ${daysToExhaust.toFixed(1)}d of budget remaining`,
    tag: 'window · 7d'
  });
  insights.push({
    kind: 'info', icon: '◆', title: 'Traffic shift detected',
    stat: `${totalRps.toLocaleString()} rps`,
    delta: `${rpsDelta >= 0 ? '+' : ''}${(rpsDelta * 100).toFixed(0)}% vs 7-day mean`,
    reason: 'notify → ingest after release v0.4.2 (13:42 UTC)', tag: 'change-detect'
  });

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <div>
          <div className={`${styles.demoTitle} mono`}>otel-insights · live</div>
          <div className={styles.demoSub}>auto-derived findings across {OTEL_SERVICES.length} services · streaming from kafka</div>
        </div>
        <div className={styles.demoMode}>
          <span className={`${styles.demoPill} mono ${styles.isOn}`} style={{ cursor: 'default' }}>
            <span className={styles.otLiveDot} /> {paused ? 'paused' : 'streaming'}
          </span>
          <button className={`${styles.demoPill} mono`} onClick={() => setPaused(!paused)}>
            {paused ? '▶ resume' : '❚❚ pause'}
          </button>
        </div>
      </div>

      <div className={`${styles.demoBody} ${styles.otel2Body}`}>
        <div className={styles.otInsights}>
          {insights.map((ins, i) =>
            <div key={i} className={`${styles.otIns} ${styles[`otMk${ins.kind}`] || ''} ${ins.onClick ? styles.isClickable : ''}`}
              onClick={ins.onClick}>
              <div className={styles.otInsHead}>
                <span className={`${styles.otInsMarker} ${styles[`otMk${ins.kind}`]} mono`}>{ins.icon}</span>
                <span className={styles.otInsTitle}>{ins.title}</span>
                <span className={`${styles.otInsTag} mono`}>{ins.tag}</span>
              </div>
              <div className={`${styles.otInsStat} mono`}>{ins.stat}</div>
              <div className={`${styles.otInsDelta} mono`}>{ins.delta}</div>
              <div className={styles.otInsReason}>
                <span className="mono dim">why</span> {ins.reason}
              </div>
            </div>
          )}
        </div>

        <div className={styles.otPanel}>
          <div className={styles.otPanelH}>
            <span className="eyebrow">// LATENCY HEATMAP · p99 by service · click to inspect</span>
            <span className={`${styles.otAxis} mono`}><span>← 28m ago</span><span>now →</span></span>
          </div>
          <div className={styles.otHeat}>
            {OTEL_SERVICES.map((s) => {
              const r = byService[s];
              const isSel = selected === s;
              const hi = OTEL_BASELINES[s] * 2.5;
              return (
                <button key={s} type="button" className={`${styles.otHeatRow} ${isSel ? styles.isSel : ''}`} onClick={() => setSelected(s)}>
                  <div className={`${styles.otHeatLabel} mono`}>{s}</div>
                  <div className={styles.otHeatCells}>
                    {r.history.map((v: number, i: number) => {
                      const intensity = Math.max(0, (v - OTEL_BASELINES[s] * 0.6) / (hi - OTEL_BASELINES[s] * 0.6));
                      return <div key={i} className={styles.otHeatCell} style={{ background: heatColor(intensity) }} title={`${v.toFixed(0)}ms`} />;
                    })}
                  </div>
                  <div className={`${styles.otHeatMeta} mono`}>
                    <span className={r.delta > 0.25 ? styles.otBad : r.delta < -0.05 ? styles.otOk : styles.otMid}>
                      {r.recent.toFixed(0)}ms
                    </span>
                    <span className={`${styles.otArrow} ${r.delta > 0 ? styles.otUp : styles.otDown}`}>
                      {r.delta > 0 ? '↑' : '↓'}{(Math.abs(r.delta) * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
