"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './CaseStudies.module.css';
import { useSectionTracking } from '@/lib/tracking';
import RAGArchitecture from './CaseStudyDiagrams/RAGArchitecture';
import IoTArchitecture from './CaseStudyDiagrams/IoTArchitecture';
import NotifyArchitecture from './CaseStudyDiagrams/NotifyArchitecture';

export default function CaseStudies() {
  const [open, setOpen] = useState<string | null>(null);
  const hasAutoOpened = useRef(false);

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

  const sectionRef = useSectionTracking('Case Studies') as React.RefObject<HTMLElement>;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoOpened.current) {
          hasAutoOpened.current = true;
          setOpen('rag');
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionRef]);

  return (
    <section id="work" ref={sectionRef}>
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

        <div className={styles.studies}>
          {studies.map((s) => {
            const isOpen = open === s.id;
            return (
              <div key={s.id} className={`${styles.study} ${isOpen ? styles.isOpen : ''}`}>
                <button
                  className={styles.studyHead}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                >
                  <div className="study-head-l">
                    <div className={`mono ${styles.studyTag}`}>{s.tag}</div>
                    <div className={styles.studyTitle}>{s.title}</div>
                    <div className={styles.studyOne}>{s.one}</div>
                  </div>
                  <div className={styles.studyHeadR}>
                    <div className={`${styles.studyHeadline} mono`}>{s.headline}</div>
                    <div className={styles.studyToggle} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={isOpen ? "M5 15l7-7 7 7" : "M5 9l7 7 7-7"}/>
                      </svg>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className={styles.studyBody}>
                    <div className={styles.studyGrid}>
                      <div className="study-col">
                        <div className="eyebrow">// THE PROBLEM</div>
                        <p className={styles.studyText}>{s.problem}</p>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// KEY DECISIONS</div>
                        <ul className={styles.studyList}>
                          {s.decisions.map((d, i) => (
                            <li key={i}>
                              <span className={`mono ${styles.studyBullet}`}>→</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// STACK</div>
                        <div className={styles.studyStack}>
                          {s.stack.map((t) => <span key={t} className="chip">{t}</span>)}
                        </div>
                      </div>

                      <div className="study-col">
                        <div className="eyebrow">// ARCHITECTURE</div>
                        <div className={styles.studyDiagWrap}>{s.diagram}</div>

                        <div className="eyebrow" style={{ marginTop: 24 }}>// RESULTS</div>
                        <div className={styles.studyResults}>
                          {s.results.map(([n, l], i) => (
                            <div key={i} className={styles.resultCell}>
                              <div className={`${styles.resultN} mono`}>{n}</div>
                              <div className={styles.resultL}>{l}</div>
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
    </section>
  );
}
