"use client";

import React, { useState, useEffect } from 'react';
import styles from './Playground.module.css';

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
  }
];

function prettyJson(s: string) {
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}

export default function TerpSparkDemo() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle');
  const ep = endpoints[active];

  const send = () => {
    setPhase('sending');
    setTimeout(() => setPhase('done'), 600 + Math.random() * 600);
  };

  useEffect(() => { setPhase('idle'); }, [active]);

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <div>
          <div className={`${styles.demoTitle} mono`}>terpspark-api · v1.0</div>
          <div className={styles.demoSub}>FastAPI · Postgres · JWT · 28 endpoints · RBAC</div>
        </div>
        <div className={styles.demoMode}>
          <span className={`${styles.demoPill} mono ${styles.isOn}`} style={{ cursor: 'default' }}>
            <span className={styles.ppOnline} /> 200 OK · 14ms avg
          </span>
        </div>
      </div>

      <div className={`${styles.demoBody} ${styles.apiBody}`}>
        <div className={styles.apiGrid}>
          <div className="api-left">
            <div className="eyebrow" style={{ marginBottom: 10 }}>// ENDPOINTS</div>
            <div className={styles.apiList}>
              {endpoints.map((e, i) =>
                <button key={i}
                  className={`${styles.apiRow} ${active === i ? styles.isOn : ''}`}
                  onClick={() => setActive(i)}>
                  <span className={`${styles.apiMethod} ${styles[`m${e.m}`]}`}>{e.m}</span>
                  <span className={`mono ${styles.apiPath}`}>{e.p}</span>
                </button>
              )}
            </div>
          </div>

          <div className="api-right">
            <div className={styles.apiCard}>
              <div className={styles.apiCardH}>
                <span className={`${styles.apiMethod} ${styles[`m${ep.m}`]}`}>{ep.m}</span>
                <span className={`mono ${styles.apiPath}`}>{ep.p}</span>
                <button className={`btn btn-primary ${styles.apiSend}`} onClick={send} disabled={phase === 'sending'}>
                  {phase === 'sending' ? 'sending…' : 'send →'}
                </button>
              </div>
              <div className={styles.apiDesc}>{ep.desc}</div>

              {ep.body &&
                <>
                  <div className="eyebrow" style={{ marginTop: 14 }}>// REQUEST BODY</div>
                  <pre className={`mono ${styles.apiPre}`}>{ep.body}</pre>
                </>
              }

              <div className="eyebrow" style={{ marginTop: 14 }}>// RESPONSE</div>
              {phase === 'idle' && <pre className={`mono ${styles.apiPre} ${styles.apiPreDim}`}>→ click "send" to see response</pre>}
              {phase === 'sending' &&
                <div className={styles.apiSpin}>
                  <div className={styles.apiBar}><div className={styles.apiBarInner} /></div>
                </div>
              }
              {phase === 'done' &&
                <>
                  <div className={`mono ${styles.apiStatus} ${styles[`status${ep.res.status}`]}`}>
                    {ep.res.status} {ep.res.status === 200 ? 'OK' : ep.res.status === 201 ? 'Created' : 'Forbidden'}
                    <span className="dim" style={{ marginLeft: 12 }}>· {(8 + Math.random() * 14).toFixed(0)}ms</span>
                  </div>
                  <pre className={`mono ${styles.apiPre} ${styles.apiPreRes}`}>{prettyJson(ep.res.body)}</pre>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
