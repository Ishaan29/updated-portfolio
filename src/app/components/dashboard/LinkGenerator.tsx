'use client';

import { useState } from 'react';

const CHANNELS: Array<[string, string]> = [
    ['apollo', 'apollo — cold email sequence'],
    ['linkedin', 'linkedin — DM / InMail to hiring manager'],
    ['app', 'app — embedded in resume / careers-page submission'],
    ['gh-cold', 'gh-cold — GitHub-sourced cold outreach'],
    ['referral', 'referral — warm intro'],
];

export function LinkGenerator({ onClose }: { onClose: () => void }) {
    const [channel, setChannel] = useState('apollo');
    const [company, setCompany] = useState('');
    const [copied, setCopied] = useState(false);

    const slug = company.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/c/${channel}-${slug || 'company'}`;

    const copy = () => {
        if (!slug) return;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="modal-back" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-head">
                    <h2>⟶ Generate tracking link</h2>
                    <button className="x" onClick={onClose} aria-label="close">✕</button>
                </header>
                <div className="modal-body">
                    <div className="field">
                        <label>Channel</label>
                        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                            {CHANNELS.map(([k, label]) => (
                                <option key={k} value={k}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Company name</label>
                        <input
                            type="text"
                            placeholder="e.g. stripe, anthropic, openai"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="preview-url">
                        <span style={{ color: 'var(--fg-dim)' }}>↗</span>
                        <span>{url}</span>
                        <button className={`copy${copied ? ' done' : ''}`} onClick={copy} disabled={!slug}>
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>

                    <div style={{ marginTop: 16, fontSize: 11, color: 'var(--fg-dim)', lineHeight: 1.6, fontFamily: 'var(--mono)' }}>
                        <div style={{ color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            How it routes
                        </div>
                        <div>1. visitor opens <code style={{ color: 'var(--accent)' }}>/c/{channel}-{slug || 'co'}</code></div>
                        <div>2. visit recorded → channel, company, timestamp, geo, device</div>
                        <div>3. redirect to <code style={{ color: 'var(--accent)' }}>/</code> with session attached</div>
                        <div>4. on-page tracker correlates scroll, dwell, event clicks</div>
                        <div>5. heat score recomputed; surfaces in <code style={{ color: 'var(--accent)' }}>/admin/visits</code></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
