"use client";

import React, { useState } from 'react';
import styles from './Playground/Playground.module.css';
import { useSectionTracking } from '@/lib/tracking';
import VectorDBDemo from './Playground/VectorDBDemo';
import TerpSparkDemo from './Playground/TerpSparkDemo';
import EKSDemo from './Playground/EKSDemo';
import OTelDemo from './Playground/OTelDemo';

const projects = [
  {
    id: 'vector',
    name: 'Distributed Vector DB',
    tag: 'Go · HNSW · FAISS · gRPC',
    blurb: 'High-performance vector DB optimized for similarity search using SIMD instructions and custom indexing. AWS re:Inforce grant.',
    demo: 'search',
    github: 'https://github.com/Ishaan29/vectorDB',
  },
  {
    id: 'terpspark',
    name: 'TerpSpark Backend',
    tag: 'FastAPI · PostgreSQL · JWT · Pydantic',
    blurb: 'RBAC + events management system. REST API for managing campus events with auth and advanced filtering.',
    demo: 'api',
    github: 'https://github.com/Ishaan29/terpspark-backend',
  },
  {
    id: 'eks',
    name: 'EKS Microservices',
    tag: 'Kubernetes · AWS EKS · Docker · GitHub Actions',
    blurb: 'Automated CI/CD pipeline for deploying e-commerce microservices on AWS EKS with version tagging.',
    demo: 'pipeline',
    github: 'https://github.com/Ishaan29/eks-microservices',
  },
  {
    id: 'otel',
    name: 'Otel Telemetry Platform',
    tag: 'Java · Spring · Kafka · OpenTelemetry',
    blurb: 'Scalable real-time telemetry ingestion + processing for distributed systems observability.',
    demo: 'metrics',
    github: 'https://github.com/Ishaan29/opentelemetry-demo',
  }
];

export default function Playground() {
  const [active, setActive] = useState(projects[0].id);
  const project = projects.find((p) => p.id === active) || projects[0];
  const sectionRef = useSectionTracking('Playground') as React.RefObject<HTMLElement>;

  return (
    <section id="play" ref={sectionRef}>
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

        <div className={styles.ppShell}>
          <aside className={styles.ppSide}>
            <div className={`eyebrow ${styles.ppSideH}`}>// PROJECTS</div>
            <div className={styles.ppTabs}>
              {projects.map((p) =>
                <button
                  key={p.id}
                  className={`${styles.ppTab} ${active === p.id ? styles.isOn : ''}`}
                  onClick={() => setActive(p.id)}>
                  <div className={styles.ppTabName}>{p.name}</div>
                  <div className={`${styles.ppTabTag} mono`}>{p.tag}</div>
                </button>
              )}
            </div>

            <div className={styles.ppSideMeta}>
              <div className={`mono ${styles.ppMetaRow}`}>
                <span className="dim">project</span>
                <span>{project.name}</span>
              </div>
              <div className={styles.ppBlurb}>{project.blurb}</div>
              <a className={`${styles.ppRepo} mono`} href={project.github} target="_blank" rel="noopener noreferrer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
                </svg>
                view source ↗
              </a>
            </div>
          </aside>

          <main className={styles.ppMain}>
            {project.demo === 'search' && <VectorDBDemo />}
            {project.demo === 'api' && <TerpSparkDemo />}
            {project.demo === 'pipeline' && <EKSDemo />}
            {project.demo === 'metrics' && <OTelDemo />}
          </main>
        </div>
      </div>
    </section>
  );
}
