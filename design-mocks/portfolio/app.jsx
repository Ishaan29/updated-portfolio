/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakToggle, Hero, Capabilities, CaseStudies, Playground, Timeline, Testimonials, About, CTA */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f5b95c",
  "pitchVariant": "metrics",
  "showPlayground": true,
  "showTerminal": true,
  "headingStyle": "editorial"
}/*EDITMODE-END*/;

function applyAccent(hex) {
  // Convert hex → an oklch-ish via CSS variable; rely on relative-color OR set fallbacks.
  // For simplicity, set the accent vars directly. We'll compute a darker tone too.
  const r = document.documentElement.style;
  r.setProperty('--accent', hex);
  // Slight tint for accent-soft using rgba
  const c = hexToRgb(hex);
  r.setProperty('--accent-soft', `rgba(${c.r}, ${c.g}, ${c.b}, 0.14)`);
}
function hexToRgb(h) {
  const s = h.replace('#', '');
  const v = s.length === 3
    ? s.split('').map((c) => parseInt(c + c, 16))
    : [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  return { r: v[0], g: v[1], b: v[2] };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => { applyAccent(t.accent); }, [t.accent]);

  useEffect(() => {
    if (t.headingStyle === 'editorial') {
      document.documentElement.style.setProperty('--serif', "'Instrument Serif', 'Iowan Old Style', Georgia, serif");
    } else if (t.headingStyle === 'sans') {
      document.documentElement.style.setProperty('--serif', "var(--sans)");
    } else if (t.headingStyle === 'mono') {
      document.documentElement.style.setProperty('--serif', "var(--mono)");
    }
  }, [t.headingStyle]);

  return (
    <>
      <TopNav />
      <Hero accent={t.accent} pitchVariant={t.pitchVariant} />
      <CaseStudies />
      {t.showPlayground && <Playground />}
      <Timeline />
      <Testimonials />
      <About />
      <CTA />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakColor
            label="Accent color"
            value={t.accent}
            options={['#f5b95c', '#c0a4ff', '#7adfa3', '#82cdff', '#ff8a73']}
            onChange={(v) => setTweak('accent', v)}
          />
        </TweakSection>

        <TweakSection label="Hero">
          <TweakSelect
            label="Pitch style"
            value={t.pitchVariant}
            options={[
              { value: 'metrics', label: 'Metrics-forward' },
              { value: 'pitch', label: 'Sharp one-liner' },
              { value: 'terminal', label: 'Engineer-voice' },
            ]}
            onChange={(v) => setTweak('pitchVariant', v)}
          />
        </TweakSection>

        <TweakSection label="Typography">
          <TweakRadio
            label="Heading style"
            value={t.headingStyle}
            options={[
              { value: 'editorial', label: 'Serif' },
              { value: 'sans', label: 'Sans' },
              { value: 'mono', label: 'Mono' },
            ]}
            onChange={(v) => setTweak('headingStyle', v)}
          />
        </TweakSection>

        <TweakSection label="Sections">
          <TweakToggle
            label="Live playground"
            value={t.showPlayground}
            onChange={(v) => setTweak('showPlayground', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function TopNav() {
  return (
    <header className="topnav">
      <div className="container topnav-inner">
        <a className="brand" href="#top">
          <span className="brand-dot" />
          <span>eshaan.bajpai</span>
        </a>
        <nav>
          <ul className="nav-links">
            <li><a href="#work">Work</a></li>
            <li><a href="#play">Playground</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#says">References</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="nav-status">
            <span className="pulse" />
            available may 2026
          </span>
          <a className="nav-cta" href="#book">Let's connect →</a>
        </div>
      </div>
    </header>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
