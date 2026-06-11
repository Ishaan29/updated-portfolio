"use client";

import React from 'react';
import styles from './Testimonials.module.css';
import { useSectionTracking } from '@/lib/tracking';

const quotes = [
  {
    name: 'Pallavi Gajbhiye',
    role: 'Engineering Manager · Gainsight',
    relation: 'Managed Eshaan directly',
    quote: 'Across multiple projects, he worked in and out of the problems given to him covering all the edge cases, which needed very little to no quality validation from QA. He is capable of building scalable solutions and writing code thats very easy to understand and maintain.',
  },
  {
    name: 'Madgula Amit',
    role: 'GenAI Engineer + Principal Engineer · Gainsight',
    relation: 'Senior; worked on the same team',
    quote: "I've worked with Eshaan for almost 2 years. He's an excellent team player, technical, and good problem solver. He's an expert in NodeJs, Java, Backend systems. We have worked in 3 projects together. I greatly appreciate his humility.",
  },
  {
    name: 'Lavneesh Chandna',
    role: 'Backend Software Engineer · Salesforce',
    relation: 'Senior; worked on the same team',
    quote: 'A rare combination of technical expertise and creativity. Consistently delivered high-quality code, with a deep understanding of the technologies being used, and always showed a keen interest in exploring new technologies and methodologies to improve our work.',
  },
  {
    name: 'Vishwajeet Singh Chauhan',
    role: 'Staff Engineer · ServiceNow',
    relation: 'Senior; worked on the same team',
    quote: "Quickly onboarded a new tech stack — excelled in Node.js while simultaneously working on Java backend systems. Strong ability to translate business requirements into technical solutions. Actively participated in knowledge sharing and mentorship.",
  },
];

export default function Testimonials() {
  const sectionRef = useSectionTracking('Testimonials') as React.RefObject<HTMLElement>;
  return (
    <section id="says" ref={sectionRef}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">// 06 — what people who worked with me actually say</span>
            <h2>The <em>peer review</em>.</h2>
          </div>
          <div className="head-aside">
            Real quotes from former managers and senior teammates — open to direct reference calls; ask and I'll connect you.
          </div>
        </div>

        <div className={styles.refGrid}>
          {quotes.map((q, i) => (
            <figure key={i} className={styles.refCard}>
              <svg className={styles.refQuote} width="22" height="18" viewBox="0 0 22 18" fill="none">
                <path d="M0 18V10C0 4.477 4.477 0 10 0V4C7.79 4 6 5.79 6 8H10V18H0ZM12 18V10C12 4.477 16.477 0 22 0V4C19.79 4 18 5.79 18 8H22V18H12Z" fill="oklch(0.82 0.135 75 / 0.5)"/>
              </svg>
              <blockquote className={styles.refQuoteBody}>&ldquo;{q.quote}&rdquo;</blockquote>
              <figcaption className={styles.refCite}>
                <div className={styles.refName}>{q.name}</div>
                <div className={`${styles.refRole} mono`}>{q.role}</div>
                <div className={styles.refRel}>{q.relation}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
