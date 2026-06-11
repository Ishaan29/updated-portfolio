"use client";

import React from 'react';
import styles from './Experience.module.css';
import { useSectionTracking } from '@/lib/tracking';

const items = [
  {
    year: '2024 — May 2026',
    where: 'CATT Labs · UMD',
    role: 'Software Analyst Intern',
    type: 'Part-time · On campus',
    copy: 'Driving development, quality and delivery for transit-research systems used by urban transitors across the US. Cut requirement drift 20%, set up a JUnit/Cypress/Selenium framework at 90% coverage, hardened a Jenkins CI/CD with automated test gates that prevents regressions.',
    stack: ['Javascript', 'Python', 'JUnit', 'Cypress', 'Jenkins'],
  },
  {
    year: 'Mar 2024 — Aug 2024',
    where: 'Velotio Technologies',
    role: 'Senior Software Engineer · Backend',
    type: 'Full-time',
    copy: 'Led backend architecture for an IoT telemetry platform: 100K+ events/sec at sub-10ms p99, Kafka + Spring Boot, AWS EKS via Terraform. Saved the client ~$5K/mo by right-sizing infra and tuning MQTT/TCP protocols for 2K concurrent device connections at 150ms RTT.',
    stack: ['Java', 'Spring Boot', 'Kafka', 'AWS', 'Terraform', 'Kubernetes'],
  },
  {
    year: 'Feb 2023 — Feb 2024',
    where: 'Gainsight',
    role: 'Software Engineer · Backend',
    type: 'Full-time',
    copy: 'Owned the analytics, observability, and notification stack for a multi-tenant SaaS serving 400+ enterprise customers. Pioneered a RAG analytics service over 10TB of data; deployed a custom OpenTelemetry SDK across 12 services; migrated 5+ services to K8s with blue/green deploys.',
    stack: ['Java', 'Python', 'PGVector', 'Delta Lake', 'Airflow', 'OpenTelemetry', 'K8s'],
  },
  {
    year: 'May 2021 — Feb 2023',
    where: 'Gainsight',
    role: 'Associate Software Engineer',
    type: 'Full-time',
    copy: 'Built core notification infrastructure powering real-time alerts for 1M+ end-users: 80ms p99, 99.99% availability, event-sourced. Resolved 100+ production incidents through RCA, reducing recurring issues by 80%.',
    stack: ['Node.js', 'TypeScript', 'OAuth 2.0', 'Event Sourcing', 'Slack API', 'MS Graph API'],
  },
];

export default function Experience() {
  const sectionRef = useSectionTracking('Experience') as React.RefObject<HTMLElement>;
  return (
    <section id="experience" ref={sectionRef}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">// 05 — experience</span>
            <h2>Four years,<br/>three teams, <em>one through-line</em>.</h2>
          </div>
          <div className="head-aside">
            Each role added a different shape of scale problem. The common thread: production reliability at high event volume.
          </div>
        </div>

        <div className={styles.tl}>
          <div className={styles.tlSpine} />
          {items.map((it, i) => (
            <div key={i} className={styles.tlItem}>
              <div className={styles.tlMarker} />
              <div className={styles.tlGrid}>
                <div className="tl-meta">
                  <div className={`mono ${styles.tlYear}`}>{it.year}</div>
                  <div className={styles.tlWhere}>{it.where}</div>
                  <div className={`mono ${styles.tlType}`}>{it.type}</div>
                </div>
                <div className="tl-body">
                  <h3 className={styles.tlRole}>{it.role}</h3>
                  <p className={styles.tlCopy}>{it.copy}</p>
                  <div className={styles.tlStack}>
                    {it.stack.map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.eduBlock}>
          <div className={`mono ${styles.eduTag}`}>// EDUCATION</div>
          <div className={styles.eduGrid}>
            <div className={styles.eduRow}>
              <div className={`mono ${styles.tlYear}`}>2024 — 26</div>
              <div>
                <div className={`${styles.tlRole} ${styles.eduRole}`}>Master&apos;s Software Engineering · University of Maryland</div>
                <div className={styles.tlCopy}>Distributed systems, ML systems, cloud architecture. Graduated May 2026.</div>
              </div>
            </div>
            <div className={styles.eduRow}>
              <div className={`mono ${styles.tlYear}`}>2016 — 20</div>
              <div>
                <div className={`${styles.tlRole} ${styles.eduRole}`}>B.Tech Computer Science</div>
                <div className={styles.tlCopy}>Foundation in algorithms, databases, OS internals.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
