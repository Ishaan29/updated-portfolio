"use client";

import React, { useState, useEffect } from 'react';
import styles from './Playground.module.css';

const stages = [
  { k: 'push', name: 'git push', sub: 'commit 8a3f12c', dur: 600 },
  { k: 'build', name: 'docker build', sub: 'multi-stage · 4 layers cached', dur: 1500 },
  { k: 'test', name: 'pytest · 247 tests', sub: 'parallel · 4 workers', dur: 1800 },
  { k: 'scan', name: 'trivy scan', sub: '0 high, 2 medium', dur: 1000 },
  { k: 'ecr', name: 'push to ECR', sub: '982MB → 142MB compressed', dur: 1200 },
  { k: 'deploy', name: 'helm upgrade', sub: 'rolling · 0 downtime', dur: 2200 },
  { k: 'smoke', name: 'smoke tests', sub: '12 synthetic checks', dur: 900 }
];

export default function EKSDemo() {
  const [running, setRunning] = useState(false);
  const [doneIdx, setDoneIdx] = useState(-1);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [logs, setLogs] = useState<{ type: string; text: string }[]>([]);

  const start = () => {
    setRunning(true); setDoneIdx(-1); setActiveIdx(0); setLogs([]);
    let total = 0;
    stages.forEach((s, i) => {
      setTimeout(() => {
        setActiveIdx(i);
        setLogs((l) => [...l, { type: 'info', text: `▸ stage[${i}] starting: ${s.name}` }]);
      }, total);
      total += Math.floor(s.dur / 2);
      setTimeout(() => {
        setLogs((l) => [...l, { type: 'dim', text: `  ${s.sub}` }]);
      }, total);
      total += Math.floor(s.dur / 2);
      setTimeout(() => {
        setDoneIdx(i);
        setLogs((l) => [...l, { type: 'ok', text: `✓ stage[${i}] done in ${(s.dur / 1000).toFixed(1)}s` }]);
      }, total);
    });
    setTimeout(() => {
      setLogs((l) => [...l, { type: '', text: '' }, { type: 'accent', text: '🎉 deployed v0.4.2 → prod-eks-us-east-1' }]);
      setRunning(false);
    }, total + 200);
  };

  useEffect(() => {
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <div>
          <div className={`${styles.demoTitle} mono`}>eks-deploy.yml · GitHub Actions</div>
          <div className={styles.demoSub}>automated build → scan → deploy on push to main</div>
        </div>
        <div className={styles.demoMode}>
          <button className={`${styles.demoPill} mono ${styles.isOn}`} onClick={start} disabled={running}>
            {running ? '● running' : '↻ replay'}
          </button>
        </div>
      </div>

      <div className={`${styles.demoBody} ${styles.eksBody}`}>
        <div className={styles.eksPipe}>
          {stages.map((s, i) => {
            const state = doneIdx >= i ? 'Done' : activeIdx === i ? 'Active' : 'Idle';
            return (
              <React.Fragment key={s.k}>
                <div className={`${styles.eksStage} ${styles[`eks${state}`]}`}>
                  <div className={`${styles.eksStageI} mono`}>{state === 'Done' ? '✓' : state === 'Active' ? '●' : i + 1}</div>
                  <div className={styles.eksStageName}>{s.name}</div>
                  <div className={styles.eksStageSub}>{s.sub}</div>
                </div>
                {i < stages.length - 1 && <div className={`${styles.eksConn} ${doneIdx >= i ? styles.eksConnOn : ''}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className={`mono ${styles.eksLogs}`}>
          <div className={styles.eksLogsBar}>
            <span className="dim">github-actions → eks-deploy.yml</span>
            <span className="dim">{logs.length} lines</span>
          </div>
          <div className={styles.eksLogsBody}>
            {logs.map((l, i) =>
              <div key={i} className={`${styles.eksLog} ${styles[`eksLog${l.type}`]}`}>{l.text || '\u00a0'}</div>
            )}
            {running && <div className={`${styles.eksLog} ${styles.eksLogcursor}`}>▍</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
