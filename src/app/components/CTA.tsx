"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './CTA.module.css';
import { trackCtaClick, useSectionTracking } from '@/lib/tracking';
import { resumeUrl, socialLinks } from '@/lib/constants';

const CalEmbed = dynamic(() => import('./CalEmbed'), {
  ssr: false,
  loading: () => (
    <div id="cal-embed" className={styles.calEmbed}>
      <div className={`mono ${styles.calLoading}`}>Loading calendar…</div>
    </div>
  ),
});

export default function CTA() {
  const sectionRef = useSectionTracking('Get in Touch') as React.RefObject<HTMLElement>;
  return (
    <section id="book" className={styles.ctaSection} ref={sectionRef}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className="cta-l">
            <span className="eyebrow">// 08 — let&apos;s talk</span>
            <h2 className={`display ${styles.ctaH}`}>
              Hiring an engineer<br/>who scales <em>things</em>?
            </h2>
            <p className={styles.ctaSub}>
              If you&apos;re building systems that need to stay up under load, I&apos;d like to hear about it. Quick intro call, video or audio — 20 minutes, no prep.
            </p>

            <div className={styles.ctaActions}>
              <a className="btn btn-primary" href="#cal-embed"
                onClick={() => trackCtaClick('lets_connect')}>
                Book a time
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
              <a className="btn btn-ghost" href={socialLinks.email}
                onClick={() => trackCtaClick('email')}>
                eshaangrad@gmail.com
              </a>
            </div>

            <div className={styles.ctaList}>
              <div className={styles.ctaRow}>
                <span className={`mono ${styles.ctaK}`}>github</span>
                <a className={styles.ctaLink} href={socialLinks.github} target="_blank" rel="noopener noreferrer">github.com/Ishaan29 ↗</a>
              </div>
              <div className={styles.ctaRow}>
                <span className={`mono ${styles.ctaK}`}>linkedin</span>
                <a className={styles.ctaLink} href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/ishaanbajpai ↗</a>
              </div>
              <div className={styles.ctaRow}>
                <span className={`mono ${styles.ctaK}`}>résumé</span>
                <a className={styles.ctaLink} href={resumeUrl} download>download PDF ↓</a>
              </div>
              <div className={styles.ctaRow}>
                <span className={`mono ${styles.ctaK}`}>refs</span>
                <span className={styles.ctaV}>happy to connect you with former managers / senior teammates on request</span>
              </div>
            </div>
          </div>

          <div className="cta-r">
            <CalEmbed />
          </div>
        </div>

        <footer className={styles.siteFooter}>
          <div className={styles.footerRow}>
            <div className="mono footer-l">designed &amp; built by eshaan bajpai · 2026</div>
            <div className="mono footer-r">
              <span className="pulse" style={{ marginRight: 6 }} />
              available may 2026 — interviewing now
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
