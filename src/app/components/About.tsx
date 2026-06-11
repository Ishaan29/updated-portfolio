"use client";

import React from 'react';
import styles from './About.module.css';
import { useSectionTracking } from '@/lib/tracking';

export default function About() {
  const sectionRef = useSectionTracking('About') as React.RefObject<HTMLElement>;
  return (
    <section id="about" ref={sectionRef}>
      <div className="container">
        <div className={styles.aboutGrid}>
          <div>
            <span className="eyebrow">// 07 — the human</span>
            <h2 className={`display ${styles.aboutH}`}>
              Off the<br/>clock.
            </h2>
          </div>
          <div className={styles.aboutBody}>
            <p>
              I grew up taking things apart and (mostly) putting them back together. That's still pretty much my job description — except now the things are distributed systems and the parts are usually on fire.
            </p>
            <p>
              When I'm not paged, I'm usually <span style={{ color: 'var(--color-accent)' }}>reading systems papers</span> (currently working through the Tiger Style guide and a re-read of &ldquo;Designing Data-Intensive Applications&rdquo;), running side projects nobody asked for.
            </p>
            <p>
              I write occasionally about whatever stumped me that week — debugging stories, gnarly migrations, that kind of thing.
            </p>

            <div className={styles.aboutList}>
              <div className={styles.aboutRow}>
                <span className={`mono ${styles.aboutK}`}>currently learning</span>
                <span className={styles.aboutV}>Go · LLM eval and harnesses at scale, AI infrastructure</span>
              </div>
              <div className={styles.aboutRow}>
                <span className={`mono ${styles.aboutK}`}>based in</span>
                <span className={styles.aboutV}>Open to relocate anywhere in the US without assistance.</span>
              </div>
              <div className={styles.aboutRow}>
                <span className={`mono ${styles.aboutK}`}>work auth</span>
                <span className={styles.aboutV}>F-1 / STEM OPT eligible, 3 years</span>
              </div>
              <div className={styles.aboutRow}>
                <span className={`mono ${styles.aboutK}`}>strong opinion</span>
                <span className={styles.aboutV}>good observability beats clever architecture, every time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
