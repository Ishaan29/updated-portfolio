/* global React */
const { useState, useEffect, useRef } = React;

/* ===== Timeline ===== */
function Timeline() {
  const items = [
    {
      year: '2024 — now',
      where: 'CATT Labs · UMD',
      role: 'Software Analyst Intern',
      type: 'Part-time · On campus',
      copy: 'Driving quality + delivery for transit-research systems used by urban planners across the US. Cut requirement drift 20%, set up a JUnit/Cypress/Selenium framework at 90% coverage, hardened a Jenkins CI/CD with automated test gates that prevents regressions.',
      stack: ['Javascript', 'Python', 'JUnit', 'Cypress', 'Jenkins'],
    },
    {
      year: '2024',
      where: 'Velotio Technologies',
      role: 'Software Engineer · Backend',
      type: 'Full-time',
      copy: 'Led backend architecture for an IoT telemetry platform: 100K+ events/sec at sub-10ms p99, Kafka + Spring Boot, AWS EKS via Terraform. Saved the client ~$5K/mo by right-sizing infra and tuning MQTT/TCP protocols for 2K concurrent device connections at 150ms RTT.',
      stack: ['Java', 'Spring Boot', 'Kafka', 'AWS', 'Terraform', 'Kubernetes'],
    },
    {
      year: '2023 — 24',
      where: 'Gainsight',
      role: 'Software Engineer · Backend',
      type: 'Full-time',
      copy: 'Owned the analytics, observability, and notification stack for a multi-tenant SaaS serving 400+ enterprise customers. Pioneered a RAG analytics service over 10TB of data; deployed a custom OpenTelemetry SDK across 12 services; migrated 5+ services to K8s with blue/green deploys.',
      stack: ['Java', 'Python', 'PGVector', 'Delta Lake', 'Airflow', 'OpenTelemetry', 'K8s'],
    },
    {
      year: '2021 — 23',
      where: 'Gainsight',
      role: 'Associate Software Engineer',
      type: 'Full-time',
      copy: 'Built core notification infrastructure powering real-time alerts for 1M+ end-users: 80ms p99, 99.99% availability, event-sourced. Resolved 100+ production incidents through RCA, reducing recurring issues by 80%.',
      stack: ['Node.js', 'TypeScript', 'OAuth 2.0', 'Event Sourcing', 'Slack API', 'MS Graph API'],
    },
  ];

  return (
    <section id="experience">
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

        <div className="tl">
          <div className="tl-spine" />
          {items.map((it, i) => (
            <div key={i} className="tl-item">
              <div className="tl-marker" />
              <div className="tl-grid">
                <div className="tl-meta">
                  <div className="mono tl-year">{it.year}</div>
                  <div className="tl-where">{it.where}</div>
                  <div className="mono tl-type">{it.type}</div>
                </div>
                <div className="tl-body">
                  <h3 className="tl-role">{it.role}</h3>
                  <p className="tl-copy">{it.copy}</p>
                  <div className="tl-stack">
                    {it.stack.map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="edu-block">
          <div className="edu-tag mono">// EDUCATION</div>
          <div className="edu-grid">
            <div className="edu-row">
              <div className="mono tl-year">2024 — 26</div>
              <div>
                <div className="tl-role" style={{ fontSize: 22 }}>M.S. Software Engineering · University of Maryland</div>
                <div className="tl-copy">Distributed systems, ML systems, cloud architecture. Graduating May 2026.</div>
              </div>
            </div>
            <div className="edu-row">
              <div className="mono tl-year">2017 — 21</div>
              <div>
                <div className="tl-role" style={{ fontSize: 22 }}>B.Tech Computer Science</div>
                <div className="tl-copy">Foundation in algorithms, databases, OS internals.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tl { position: relative; padding-left: 28px; }
        .tl-spine {
          position: absolute; left: 7px; top: 4px; bottom: 4px;
          width: 1px; background: var(--border);
        }
        .tl-item { position: relative; padding: 0 0 36px; }
        .tl-item:last-child { padding-bottom: 0; }
        .tl-marker {
          position: absolute; left: -28px; top: 6px;
          width: 15px; height: 15px;
          border-radius: 50%;
          background: var(--bg);
          border: 2px solid var(--accent);
        }
        .tl-marker::after {
          content: ''; position: absolute; inset: 3px;
          border-radius: 50%; background: var(--accent);
        }
        .tl-grid {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 32px;
        }
        @media (max-width: 720px) { .tl-grid { grid-template-columns: 1fr; gap: 12px; } }
        .tl-year { font-size: 12px; color: var(--accent); letter-spacing: 0.06em; }
        .tl-where { font-size: 14px; color: var(--fg); margin-top: 6px; }
        .tl-type { font-size: 11px; color: var(--fg-dim); margin-top: 4px; }
        .tl-role {
          font-family: var(--serif); font-weight: 400;
          font-size: 26px; letter-spacing: -0.01em; line-height: 1.15;
          margin: 0 0 10px;
        }
        .tl-copy { color: var(--fg-muted); font-size: 14.5px; line-height: 1.65; margin: 0 0 12px; }
        .tl-stack { display: flex; flex-wrap: wrap; gap: 6px; }

        .edu-block {
          margin-top: 56px;
          padding: 28px 28px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .edu-tag { font-size: 11px; color: var(--fg-muted); letter-spacing: 0.1em; margin-bottom: 18px; }
        .edu-grid { display: flex; flex-direction: column; gap: 18px; }
        .edu-row { display: grid; grid-template-columns: 180px 1fr; gap: 32px; align-items: start; }
        @media (max-width: 720px) { .edu-row { grid-template-columns: 1fr; gap: 8px; } }
      `}</style>
    </section>
  );
}

/* ===== Testimonials ===== */
function Testimonials() {
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

  return (
    <section id="says">
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

        <div className="ref-grid">
          {quotes.map((q, i) => (
            <figure key={i} className="ref-card">
              <svg className="ref-quote" width="22" height="18" viewBox="0 0 22 18" fill="none">
                <path d="M0 18V10C0 4.477 4.477 0 10 0V4C7.79 4 6 5.79 6 8H10V18H0ZM12 18V10C12 4.477 16.477 0 22 0V4C19.79 4 18 5.79 18 8H22V18H12Z" fill="oklch(0.82 0.135 75 / 0.5)"/>
              </svg>
              <blockquote className="ref-quote-body">"{q.quote}"</blockquote>
              <figcaption className="ref-cite">
                <div className="ref-name">{q.name}</div>
                <div className="ref-role mono">{q.role}</div>
                <div className="ref-rel dim">{q.relation}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 880px) { .ref-grid { grid-template-columns: 1fr; } }
        .ref-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin: 0;
          display: flex; flex-direction: column;
          transition: border-color 0.2s;
        }
        .ref-card:hover { border-color: var(--border-strong); }
        .ref-quote { margin-bottom: 14px; }
        .ref-quote-body {
          font-family: var(--serif);
          font-size: 19px;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: -0.005em;
          margin: 0 0 20px;
          color: var(--fg);
          flex: 1;
        }
        .ref-cite { border-top: 1px solid var(--border); padding-top: 14px; }
        .ref-name { font-size: 14px; color: var(--fg); font-weight: 600; }
        .ref-role { font-size: 12px; color: var(--accent); margin-top: 2px; letter-spacing: 0.02em; }
        .ref-rel { font-size: 11px; margin-top: 2px; }
      `}</style>
    </section>
  );
}

/* ===== About — short, personality ===== */
function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <span className="eyebrow">// 07 — the human</span>
            <h2 className="display about-h">
              Off the<br/>clock.
            </h2>
          </div>
          <div className="about-body">
            <p>
              I grew up taking things apart and (mostly) putting them back together. That's still pretty much my job description — except now the things are distributed systems and the parts are usually on fire.
            </p>
            <p>
              When I'm not paged, I'm usually <span style={{ color: 'var(--accent)' }}>reading systems papers</span> (currently working through the Tiger Style guide and a re-read of "Designing Data-Intensive Applications"), running side projects nobody asked for, or hanging around the College Park transit lab arguing about bus schedules.
            </p>
            <p>
              I write occasionally about whatever stumped me that week — debugging stories, gnarly migrations, that kind of thing.
            </p>

            <div className="about-list">
              <div className="about-row">
                <span className="mono about-k">currently learning</span>
                <span className="about-v">Rust · WebAssembly · LLM eval at scale</span>
              </div>
              <div className="about-row">
                <span className="mono about-k">based in</span>
                <span className="about-v">College Park, MD — open to relocation, remote-friendly</span>
              </div>
              <div className="about-row">
                <span className="mono about-k">work auth</span>
                <span className="about-v">F-1 / STEM OPT eligible, 3 years</span>
              </div>
              <div className="about-row">
                <span className="mono about-k">strong opinion</span>
                <span className="about-v">good observability beats clever architecture, every time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 880px) { .about-grid { grid-template-columns: 1fr; gap: 24px; } }
        .about-h {
          font-size: clamp(48px, 6vw, 80px);
          margin: 12px 0 0;
        }
        .about-body { color: var(--fg-muted); font-size: 16px; line-height: 1.7; max-width: 62ch; }
        .about-body p { margin: 0 0 18px; }
        .about-list {
          margin-top: 28px;
          border-top: 1px solid var(--border);
        }
        .about-row {
          display: grid; grid-template-columns: 160px 1fr;
          gap: 18px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }
        @media (max-width: 720px) { .about-row { grid-template-columns: 1fr; gap: 4px; } }
        .about-k { color: var(--fg-dim); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; align-self: center; }
        .about-v { color: var(--fg); }
      `}</style>
    </section>
  );
}

/* ===== Final CTA ===== */
function CTA() {
  return (
    <section id="book" className="cta-section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-l">
            <span className="eyebrow">// 08 — let's talk</span>
            <h2 className="display cta-h">
              Hiring an engineer<br/>who scales <em>things</em>?
            </h2>
            <p className="cta-sub">
              If you're building systems that need to stay up under load, I'd like to hear about it. Quick intro call, video or audio — 20 minutes, no prep.
            </p>

            <div className="cta-actions">
              <a className="btn btn-primary" href="https://cal.com/eshaan" target="_blank" rel="noopener">
                Let's connect
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
              <a className="btn btn-ghost" href="mailto:hello@eshaanbajpai.dev">
                hello@eshaanbajpai.dev
              </a>
            </div>

            <div className="cta-list">
              <div className="cta-row">
                <span className="mono cta-k">github</span>
                <a className="cta-link" href="https://github.com/eshaanbajpai" target="_blank" rel="noopener">github.com/eshaanbajpai ↗</a>
              </div>
              <div className="cta-row">
                <span className="mono cta-k">linkedin</span>
                <a className="cta-link" href="https://linkedin.com/in/eshaanbajpai" target="_blank" rel="noopener">linkedin.com/in/eshaanbajpai ↗</a>
              </div>
              <div className="cta-row">
                <span className="mono cta-k">résumé</span>
                <a className="cta-link" href="/resume.pdf" download>download PDF ↓</a>
              </div>
              <div className="cta-row">
                <span className="mono cta-k">refs</span>
                <span className="cta-v">happy to connect you with former managers / senior teammates on request</span>
              </div>
            </div>
          </div>

          <div className="cta-r">
            <CalendarMock />
          </div>
        </div>

        <footer className="site-footer">
          <div className="footer-row">
            <div className="mono footer-l">designed & built by eshaan bajpai · 2026</div>
            <div className="mono footer-r">
              <span className="pulse" style={{ marginRight: 6 }} />
              available may 2026 — interviewing now
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        .cta-section { padding-bottom: 32px; }
        .cta-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 48px;
          align-items: start;
          background-image:
            radial-gradient(600px 280px at 100% 0%, oklch(0.82 0.135 75 / 0.10), transparent 60%);
        }
        @media (max-width: 980px) { .cta-card { grid-template-columns: 1fr; padding: 32px; gap: 32px; } }
        .cta-h { font-size: clamp(40px, 5.5vw, 72px); margin: 12px 0 18px; line-height: 1.05; }
        .cta-sub { color: var(--fg-muted); font-size: 16px; max-width: 50ch; margin: 0 0 28px; }
        .cta-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 36px; }
        .cta-list { display: flex; flex-direction: column; gap: 0; }
        .cta-row {
          display: grid; grid-template-columns: 100px 1fr;
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          font-size: 14px;
        }
        .cta-row:last-child { border-bottom: 1px solid var(--border); }
        .cta-k { color: var(--fg-dim); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; align-self: center; }
        .cta-link { color: var(--accent); text-decoration: none; transition: opacity 0.15s; }
        .cta-link:hover { opacity: 0.7; }
        .cta-v { color: var(--fg-muted); }

        .site-footer { margin-top: 64px; padding: 24px 0; border-top: 1px solid var(--border); }
        .footer-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 12px; color: var(--fg-muted); letter-spacing: 0.02em; }
      `}</style>
    </section>
  );
}

/* ===== Mock calendar embed ===== */
function CalendarMock() {
  const [day, setDay] = useState(15);
  const [slot, setSlot] = useState('11:00');
  const days = [
    { d: 14, dow: 'THU' },
    { d: 15, dow: 'FRI' },
    { d: 16, dow: 'SAT', off: true },
    { d: 17, dow: 'SUN', off: true },
    { d: 18, dow: 'MON' },
    { d: 19, dow: 'TUE' },
    { d: 20, dow: 'WED' },
  ];
  const slots = ['10:00', '10:30', '11:00', '14:00', '15:30', '16:30'];

  return (
    <div className="cal">
      <div className="cal-head">
        <div>
          <div className="mono dim" style={{ fontSize: 11, letterSpacing: 0.1, textTransform: 'uppercase' }}>cal · 20 min intro</div>
          <div className="cal-title">eshaan bajpai</div>
        </div>
        <div className="cal-month mono">MAY 2026</div>
      </div>

      <div className="cal-days">
        {days.map((d) => (
          <button
            key={d.d}
            className={`cal-day ${d.off ? 'is-off' : ''} ${day === d.d ? 'is-on' : ''}`}
            onClick={() => !d.off && setDay(d.d)}
            disabled={d.off}
          >
            <div className="cal-dow mono">{d.dow}</div>
            <div className="cal-dn">{d.d}</div>
          </button>
        ))}
      </div>

      <div className="cal-slots">
        <div className="eyebrow" style={{ marginBottom: 10 }}>// AVAILABLE TIMES · EDT</div>
        <div className="cal-slot-grid">
          {slots.map((s) => (
            <button
              key={s}
              className={`cal-slot mono ${slot === s ? 'is-on' : ''}`}
              onClick={() => setSlot(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="btn btn-primary cal-confirm" onClick={() => window.open('https://cal.com/eshaan', '_blank')}>
          Confirm May {day} at {slot}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <div className="dim mono" style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}>
          opens cal.com · 1-click confirm
        </div>
      </div>

      <style>{`
        .cal {
          background: oklch(0.13 0.005 70);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 22px;
        }
        .cal-head {
          display: flex; align-items: start; justify-content: space-between;
          margin-bottom: 18px;
        }
        .cal-title { font-family: var(--serif); font-size: 22px; margin-top: 4px; }
        .cal-month { font-size: 11px; color: var(--fg-muted); letter-spacing: 0.1em; margin-top: 8px; }
        .cal-days {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 6px; margin-bottom: 24px;
        }
        .cal-day {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 8px 4px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--sans);
          transition: all 0.15s;
        }
        .cal-day:hover:not(:disabled) { border-color: var(--border-strong); }
        .cal-day.is-on { background: var(--accent); border-color: var(--accent); color: oklch(0.18 0.02 70); }
        .cal-day.is-off { opacity: 0.3; cursor: not-allowed; }
        .cal-dow { font-size: 9px; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 2px; }
        .cal-dn { font-size: 15px; font-weight: 500; }
        .cal-slot-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
          margin-bottom: 16px;
        }
        .cal-slot {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 9px 8px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cal-slot:hover { border-color: var(--border-strong); }
        .cal-slot.is-on { background: oklch(0.82 0.135 75 / 0.15); border-color: var(--accent); color: var(--accent); }
        .cal-confirm { width: 100%; justify-content: center; }
      `}</style>
    </div>
  );
}

window.Timeline = Timeline;
window.Testimonials = Testimonials;
window.About = About;
window.CTA = CTA;
