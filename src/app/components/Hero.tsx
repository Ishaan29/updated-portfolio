"use client";

import React, { useState, useEffect } from "react";
import { trackCtaClick, trackEvent } from "@/lib/tracking";
import { resumeUrl } from "@/lib/constants";
import { useCountUp } from "./hooks/useCountUp";
import styles from "./Hero.module.css";

function CountUp({ to, suffix = '', prefix = '', duration = 1600, decimals = 0 }: { to: number; suffix?: string; prefix?: string; duration?: number; decimals?: number }) {
  const { val, ref } = useCountUp({ to, duration });
  const formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

function charLen(s: string) {
  return [...s].length;
}

const BANNER_INNER = 34;

type BannerSegment = { text: string; className?: string };

function BannerCap({ left, fill, right }: { left: string; fill: string; right: string }) {
  return (
    <div className={styles.ccBannerRow}>
      <span className={styles.ccBannerEdge}>{left}</span>
      <span className={styles.ccBannerInner}>{fill}</span>
      <span className={styles.ccBannerEdge}>{right}</span>
    </div>
  );
}

function BannerLine({ segments }: { segments: BannerSegment[] }) {
  const used = segments.reduce((n, s) => n + charLen(s.text), 0);
  const pad = ' '.repeat(Math.max(0, BANNER_INNER - used));

  return (
    <div className={styles.ccBannerRow}>
      <span className={styles.ccBannerEdge}>│</span>
      <span className={styles.ccBannerInner}>
        {segments.map((s, i) => (
          <span key={i} className={s.className}>{s.text}</span>
        ))}
        {pad}
      </span>
      <span className={styles.ccBannerEdge}>│</span>
    </div>
  );
}

function TerminalBlock() {
  const [lines, setLines] = useState<{t: string, text: string}[]>([]);
  const script = [
    { t: 'user', text: 'who are you and what do you build?' },
    { t: 'think', text: 'Reading résumé · scanning shipped systems …' },
    { t: 'cm', text: "I'm Eshaan — a backend engineer." },
    { t: 'cm', text: '4 yrs building distributed systems at scale.' },
    { t: 'cm', text: '' },
    { t: 'cm', text: 'recent stack:' },
    { t: 'cm-d', text: '  java · spring · kafka · postgres · aws · python' },
    { t: 'cm', text: '' },
    { t: 'cm', text: 'highlights:' },
    { t: 'bullet', text: '100K+ events/sec, sub-10ms p99 (Velotio)' },
    { t: 'bullet', text: '10TB RAG analytics, 400+ tenants (Gainsight)' },
    { t: 'bullet', text: '1M+ users, 99.99% uptime notifications (Gainsight)' },
    { t: 'cm', text: '' },
    { t: 'cm-ok', text: '✓ available may 2026 · interviewing now' },
  ];

  useEffect(() => {
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      let scheduleNext = false;
      let nextDelay = 320;
      setLines((prev) => {
        if (prev.length >= script.length) return prev;
        const item = script[prev.length];
        if (!item) return prev;
        scheduleNext = prev.length + 1 < script.length;
        if (item.t === 'think') nextDelay = 900;
        else if (item.t === 'user') nextDelay = 600;
        else if (item.text === '') nextDelay = 120;
        return [...prev, item];
      });
      if (scheduleNext) setTimeout(step, nextDelay);
    };
    const t = setTimeout(step, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const isDone = lines.length >= script.length;

  return (
    <div className={styles.cc}>
      <div className={styles.ccHeader}>
        <div className={`${styles.ccBanner} mono`}>
          <BannerCap left="╭" fill={'─'.repeat(BANNER_INNER)} right="╮" />
          <BannerLine segments={[
            { text: ' ' },
            { text: '✻', className: styles.ccAccent },
            { text: ' Welcome to ' },
            { text: 'eshaan.dev', className: styles.ccAccent },
          ]} />
          <BannerLine segments={[{ text: ' '.repeat(BANNER_INNER) }]} />
          <BannerLine segments={[
            { text: '   ' },
            { text: '/help', className: styles.ccDim },
            { text: ' for help, ' },
            { text: '/menu', className: styles.ccDim },
            { text: ' for nav' },
          ]} />
          <BannerLine segments={[{ text: ' '.repeat(BANNER_INNER) }]} />
          <BannerLine segments={[
            { text: '   cwd: ' },
            { text: '~/portfolio', className: styles.ccDim },
          ]} />
          <BannerCap left="╰" fill={'─'.repeat(BANNER_INNER)} right="╯" />
        </div>
      </div>

      <div className={`${styles.ccBody} mono`}>
        {lines.filter(Boolean).map((l, i) => {
          if (l.t === 'user') {
            return (
              <div key={i} className={`${styles.ccLine} ${styles.ccUser}`}>
                <span className={styles.ccPrompt}>&gt;</span> {l.text}
              </div>
            );
          }
          if (l.t === 'think') {
            return (
              <div key={i} className={`${styles.ccLine} ${styles.ccThink}`}>
                <span className={styles.ccThinkingDot}>✻</span> {l.text}
                <span className={styles.ccDots}>
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            );
          }
          if (l.t === 'bullet') {
            return (
              <div key={i} className={`${styles.ccLine} ${styles.ccBullet}`}>
                <span className={styles.ccBulletMark}>⏺</span> {l.text}
              </div>
            );
          }
          if (l.t === 'cm-ok') {
            return <div key={i} className={`${styles.ccLine} ${styles.ccOk}`}>{l.text}</div>;
          }
          if (l.t === 'cm-d') {
            return <div key={i} className={`${styles.ccLine} ${styles.ccDim}`}>{l.text}</div>;
          }
          return <div key={i} className={`${styles.ccLine} ${styles.ccCm}`}>{l.text || '\u00a0'}</div>;
        })}

        {isDone && (
          <div className={styles.ccInputRow}>
            <span className={styles.ccPrompt}>&gt;</span>
            <span className={styles.ccPlaceholder}>Try a question…</span>
            <span className={styles.ccCursor}>▍</span>
          </div>
        )}
      </div>

      <div className={`${styles.ccFooter} mono`}>
        <span className="cc-foot-l"><span className={styles.ccFootDot} /> ready</span>
        <span className="cc-foot-r">claude-sonnet · backend-eng-mode</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const eyebrow = 'INTERVIEWING NOW';
  const title = <>I build backend systems that <em>don't break</em> under load.</>;
  const sub = 'Backend engineer (4+ years) shipping distributed systems at scale. Java · Kafka · AWS · Python. Finished my Master\'s at UMD and currently looking for an opportunity.';

  return (
    <section id="top" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className="hero-main">
            <div className={`eyebrow ${styles.heroEyebrow}`}>
              <span className="pulse" /> {eyebrow}
            </div>
            <h1 className={`display ${styles.heroTitle}`}>{title}</h1>
            <p className={styles.heroSub}>{sub}</p>

            <div className={styles.heroCtas}>
              <a className="btn btn-primary" href="#book" onClick={() => trackCtaClick('hero_connect')}>
                Let's connect — if you're scaling
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a className="btn btn-ghost" href="#work" onClick={() => trackCtaClick('hero_work')}>See the work</a>
              <a className="btn btn-ghost" href={resumeUrl} download onClick={() => trackEvent('click', 'resume_download', { location: 'hero' })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Résumé (PDF)
              </a>
            </div>

            <div className={styles.heroMetrics}>
              <div className={styles.metric}>
                <div className={`${styles.metricNum} mono`}><CountUp to={100} suffix="K+" /></div>
                <div className={styles.metricLabel}>events/sec processed<br /><span className="dim">at sub-10ms p99</span></div>
              </div>
              <div className={styles.metric}>
                <div className={`${styles.metricNum} mono`}><CountUp to={1} suffix="M+" /></div>
                <div className={styles.metricLabel}>end users served<br /><span className="dim">notification infra @ Gainsight</span></div>
              </div>
              <div className={styles.metric}>
                <div className={`${styles.metricNum} mono`}><CountUp to={99.95} decimals={2} suffix="%" /></div>
                <div className={styles.metricLabel}>uptime, multi-tenant SaaS<br /><span className="dim">400+ enterprise tenants</span></div>
              </div>
              <div className={styles.metric}>
                <div className={`${styles.metricNum} mono`}><CountUp to={10} suffix="TB" /></div>
                <div className={styles.metricLabel}>data through one service<br /><span className="dim">RAG analytics pipeline</span></div>
              </div>
            </div>

            <div className={styles.logoBar}>
              <span className="eyebrow" style={{ marginRight: 4 }}>// shipped at</span>
              <span className={styles.logoPill}>Gainsight</span>
              <span className={styles.logoPill}>Velotio</span>
              <span className={styles.logoPill}>CATT Labs · UMD</span>
              <span className={styles.logoPill}>U. Maryland</span>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <TerminalBlock />
          </aside>
        </div>
      </div>
    </section>
  );
}
