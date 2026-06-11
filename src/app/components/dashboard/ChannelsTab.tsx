import { DashboardData, CompanyLead } from './lib/types';
import { Panel } from './primitives/Panel';
import { HeatBadge } from './primitives/HeatBadge';
import { ChannelChip } from './primitives/ChannelChip';
import { Donut, CHANNEL_COLORS } from './ChannelMix';
import { fmtNum, fmtPct } from './lib/format';

/* Live channel taxonomy (LOCKED — see HANDOFF.md §1). */
const CHANNEL_META: Record<string, { label: string; desc: string }> = {
    apollo: { label: 'Apollo outreach', desc: 'Cold-email sequences via Apollo to recruiting / eng leadership' },
    linkedin: { label: 'LinkedIn', desc: 'Direct DM / InMail to specific hiring managers and recruiters' },
    app: { label: 'Cold application', desc: 'Tracking link embedded in resume / careers-page submission' },
    'gh-cold': { label: 'GitHub cold', desc: 'Cold email referencing a repo / PR — engineer-to-engineer' },
    referral: { label: 'Referral', desc: 'Warm intro through a mutual contact' },
    organic: { label: 'Organic', desc: 'Untracked / direct traffic — legacy links and search' },
};

const OUTCOMES = ['offer', 'onsite+', 'replied', 'engaged', 'clicked-only', 'ghosted'] as const;
type Outcome = (typeof OUTCOMES)[number];

const OUTCOME_COLORS: Record<Outcome, string> = {
    offer: 'oklch(0.85 0.18 145)',
    'onsite+': 'var(--signal)',
    replied: 'var(--accent)',
    engaged: 'oklch(0.78 0.10 230)',
    'clicked-only': 'var(--fg-dim)',
    ghosted: 'oklch(0.50 0.012 70)',
};

function outcomeOf(l: CompanyLead): Outcome {
    if (l.stage === 'offer') return 'offer';
    if (['onsite', 'screen', 'rejected'].includes(l.stage)) return 'onsite+';
    if (l.stage === 'replied') return 'replied';
    if (l.engagedVisits > 0) return 'engaged';
    if (l.totalVisits > 0) return 'clicked-only';
    return 'ghosted';
}

/* ---------- Sankey: channel → company → outcome (ported from the design mock) ---------- */

function SankeyChart({ leads }: { leads: CompanyLead[] }) {
    const channels = Object.keys(CHANNEL_META).filter((ch) => leads.some((l) => l.channel === ch));
    // Anything outside the locked taxonomy still flows through an "other" channel bucket.
    const unknown = leads.some((l) => !CHANNEL_META[l.channel]);
    if (unknown) channels.push('other');
    const chanOf = (l: CompanyLead) => (CHANNEL_META[l.channel] ? l.channel : 'other');

    // Top 8 companies by visits; the rest bucketed as "Other (N)"
    const byVisits = [...leads].sort((a, b) => b.totalVisits - a.totalVisits);
    const topCos = byVisits.slice(0, 8);
    const others = byVisits.slice(8);
    const otherKey = `Other (${others.length})`;
    const companyList = [...topCos.map((l) => l.companyId), ...(others.length ? [otherKey] : [])];
    const companyOf = (l: CompanyLead) => (topCos.includes(l) ? l.companyId : otherKey);

    const outcomes = OUTCOMES.filter((oc) => leads.some((l) => outcomeOf(l) === oc));

    // Node sizes
    const sizeC: Record<string, number> = Object.fromEntries(channels.map((c) => [c, 0]));
    const sizeM: Record<string, number> = Object.fromEntries(companyList.map((c) => [c, 0]));
    const sizeO: Record<string, number> = Object.fromEntries(outcomes.map((o) => [o, 0]));
    for (const l of leads) {
        sizeC[chanOf(l)]++;
        sizeM[companyOf(l)]++;
        sizeO[outcomeOf(l)]++;
    }

    // Aggregated flows
    const aggL = new Map<string, number>();
    const aggR = new Map<string, number>();
    for (const l of leads) {
        const kL = `${chanOf(l)}→${companyOf(l)}`;
        const kR = `${companyOf(l)}→${outcomeOf(l)}`;
        aggL.set(kL, (aggL.get(kL) || 0) + 1);
        aggR.set(kR, (aggR.get(kR) || 0) + 1);
    }

    // Geometry
    const W = 900, H = 380, gap = 6, nodeW = 14;
    const colX = { L: 110, M: W / 2 - 30, R: W - 84 };
    const total = leads.length;
    const usableH = H - 20;

    function colPositions(items: string[], sizes: Record<string, number>) {
        const totalSize = items.reduce((s, k) => s + sizes[k], 0);
        const totalGap = (items.length - 1) * gap;
        const scale = (usableH - totalGap) / Math.max(1, totalSize);
        let y = 10;
        const out: Record<string, { y: number; h: number }> = {};
        for (const k of items) {
            const h = sizes[k] * scale;
            out[k] = { y, h };
            y += h + gap;
        }
        return out;
    }

    const posC = colPositions(channels, sizeC);
    const sortedCompanies = [...companyList].sort((a, b) => sizeM[b] - sizeM[a]);
    const posM = colPositions(sortedCompanies, sizeM);
    const posO = colPositions(outcomes, sizeO);

    // Stack cursors so flows in/out of a node don't overlap
    const stackOutC: Record<string, number> = Object.fromEntries(channels.map((c) => [c, 0]));
    const stackInM: Record<string, number> = Object.fromEntries(sortedCompanies.map((c) => [c, 0]));
    const stackOutM: Record<string, number> = Object.fromEntries(sortedCompanies.map((c) => [c, 0]));
    const stackInO: Record<string, number> = Object.fromEntries(outcomes.map((o) => [o, 0]));

    function curve(x0: number, y0: number, x1: number, y1: number, t: number) {
        const cx = x0 + (x1 - x0) * 0.5;
        return `M${x0},${y0} L${x0},${y0 + t} C${cx},${y0 + t} ${cx},${y1 + t} ${x1},${y1 + t} L${x1},${y1} C${cx},${y1} ${cx},${y0} ${x0},${y0} Z`;
    }

    const flowsL = [...aggL.entries()].map(([k, v]) => {
        const [ch, co] = k.split('→');
        return { ch, co, v };
    });
    flowsL.sort(
        (a, b) =>
            channels.indexOf(a.ch) - channels.indexOf(b.ch) ||
            sortedCompanies.indexOf(a.co) - sortedCompanies.indexOf(b.co)
    );

    const flowsR = [...aggR.entries()].map(([k, v]) => {
        const [co, oc] = k.split('→');
        return { co, oc, v };
    });
    flowsR.sort(
        (a, b) =>
            sortedCompanies.indexOf(a.co) - sortedCompanies.indexOf(b.co) ||
            outcomes.indexOf(a.oc as Outcome) - outcomes.indexOf(b.oc as Outcome)
    );

    const scaleL = (sz: number) => sz * ((usableH - (channels.length - 1) * gap) / Math.max(1, total));
    const scaleR = (sz: number) => sz * ((usableH - (outcomes.length - 1) * gap) / Math.max(1, total));

    const chanColor = (ch: string) => CHANNEL_COLORS[ch] || 'var(--fg-muted)';

    return (
        <div className="sankey-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                {flowsL.map((f, i) => {
                    const c = posC[f.ch];
                    const m = posM[f.co];
                    const t = scaleL(f.v);
                    const y0 = c.y + stackOutC[f.ch];
                    const y1 = m.y + stackInM[f.co];
                    stackOutC[f.ch] += t;
                    stackInM[f.co] += t;
                    return (
                        <path key={`L${i}`} d={curve(colX.L + nodeW, y0, colX.M, y1, t)} fill={chanColor(f.ch)} opacity="0.32">
                            <title>{f.ch} → {f.co}: {f.v}</title>
                        </path>
                    );
                })}
                {flowsR.map((f, i) => {
                    const m = posM[f.co];
                    const o = posO[f.oc];
                    const t = scaleR(f.v);
                    const y0 = m.y + stackOutM[f.co];
                    const y1 = o.y + stackInO[f.oc];
                    stackOutM[f.co] += t;
                    stackInO[f.oc] += t;
                    return (
                        <path key={`R${i}`} d={curve(colX.M + nodeW, y0, colX.R, y1, t)} fill={OUTCOME_COLORS[f.oc as Outcome]} opacity="0.32">
                            <title>{f.co} → {f.oc}: {f.v}</title>
                        </path>
                    );
                })}
                {channels.map((ch) => (
                    <g key={ch}>
                        <rect x={colX.L} y={posC[ch].y} width={nodeW} height={Math.max(2, posC[ch].h)} fill={chanColor(ch)} />
                        <text x={colX.L - 8} y={posC[ch].y + posC[ch].h / 2 + 3} textAnchor="end" fill="var(--fg)" fontSize="11" fontFamily="var(--mono)">
                            {ch}
                        </text>
                        <text x={colX.L - 8} y={posC[ch].y + posC[ch].h / 2 + 16} textAnchor="end" fill="var(--fg-dim)" fontSize="9.5" fontFamily="var(--mono)">
                            {sizeC[ch]}
                        </text>
                    </g>
                ))}
                {sortedCompanies.map((co) => (
                    <g key={co}>
                        <rect x={colX.M} y={posM[co].y} width={nodeW} height={Math.max(2, posM[co].h)} fill="var(--fg-muted)" />
                        <text x={colX.M + nodeW + 6} y={posM[co].y + posM[co].h / 2 + 3} textAnchor="start" fill="var(--fg)" fontSize="10.5" fontFamily="var(--mono)">
                            {co} <tspan fill="var(--fg-dim)" fontSize="9">· {sizeM[co]}</tspan>
                        </text>
                    </g>
                ))}
                {outcomes.map((oc) => (
                    <g key={oc}>
                        <rect x={colX.R} y={posO[oc].y} width={nodeW} height={Math.max(2, posO[oc].h)} fill={OUTCOME_COLORS[oc]} />
                        <text x={colX.R + nodeW + 6} y={posO[oc].y + posO[oc].h / 2 + 3} textAnchor="start" fill="var(--fg)" fontSize="11" fontFamily="var(--mono)">
                            {oc}
                        </text>
                        <text x={colX.R + nodeW + 6} y={posO[oc].y + posO[oc].h / 2 + 16} textAnchor="start" fill="var(--fg-dim)" fontSize="9.5" fontFamily="var(--mono)">
                            {sizeO[oc]}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

/* ---------- Channels tab ---------- */

export function ChannelsTab({ data }: { data: DashboardData | null }) {
    if (!data) return <div className="loading-msg">Awaiting telemetry…</div>;

    const leads = data.companies;

    // Channel cards: only channels with activity, ordered by taxonomy
    const activeChannels = Object.keys(CHANNEL_META).filter((ch) => {
        const t = data.byChannel[ch];
        return (t && (t.sent > 0 || t.clicks > 0)) || leads.some((l) => l.channel === ch);
    });

    // Referrers
    const referrers = data.referrers || [];
    const refMax = Math.max(1, ...referrers.map((r) => r.count));

    // Devices
    const dev = data.byDevice;
    const devTot = dev.desktop + dev.mobile + dev.tablet;

    return (
        <>
            <Panel title="Channel → company → outcome" meta="flow analysis · all leads">
                {leads.length > 0 ? (
                    <SankeyChart leads={leads} />
                ) : (
                    <div className="text-dim" style={{ padding: 30, textAlign: 'center' }}>No lead data yet.</div>
                )}
            </Panel>

            <div className="row r-3">
                {activeChannels.map((ch) => {
                    const meta = CHANNEL_META[ch];
                    const t = data.byChannel[ch] ?? { sent: 0, clicks: 0, engaged: 0, replied: 0 };
                    const chLeads = leads.filter((l) => l.channel === ch);
                    const clicked = chLeads.filter((l) => l.totalVisits > 0).length;
                    const engaged = chLeads.filter((l) => l.engagedVisits > 0).length;
                    const replies = chLeads.filter((l) => !['sent', 'clicked', 'engaged', 'ghosted'].includes(l.stage)).length;
                    const totalVisits = chLeads.reduce((s, l) => s + l.totalVisits, 0);
                    const top = [...chLeads].sort((a, b) => b.heatScore - a.heatScore).slice(0, 4);

                    return (
                        <Panel
                            key={ch}
                            title={<span><ChannelChip channel={ch} /> &nbsp;{meta.label}</span>}
                            meta={`${t.sent} sent`}
                        >
                            <div style={{ color: 'var(--fg-muted)', fontSize: 11.5, lineHeight: 1.5, marginBottom: 12 }}>
                                {meta.desc}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                {([
                                    ['Click rate', t.sent ? `${Math.min(100, Math.round((clicked / t.sent) * 100))}%` : '—'],
                                    ['Engage rate', clicked ? `${Math.min(100, Math.round((engaged / clicked) * 100))}%` : '—'],
                                    ['Total visits', fmtNum(totalVisits)],
                                    ['Reply rate', t.sent ? `${Math.min(100, Math.round((replies / t.sent) * 100))}%` : '—'],
                                ] as Array<[string, string | number]>).map(([l, v]) => (
                                    <div key={l} style={{ padding: '8px 10px', background: 'var(--bg-card)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
                                        <div style={{ fontSize: 18, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, fontSize: 11 }}>
                                <div style={{ color: 'var(--fg-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontSize: 10 }}>top companies</div>
                                {top.map((l) => (
                                    <div key={l.companyId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                                        <HeatBadge score={l.heatScore} />
                                        <span style={{ color: 'var(--fg)', textTransform: 'capitalize' }}>{l.companyId}</span>
                                        <span style={{ color: 'var(--fg-dim)', marginLeft: 'auto' }}>{l.totalVisits} visits</span>
                                    </div>
                                ))}
                                {top.length === 0 && <div className="text-dim">No companies yet</div>}
                            </div>
                        </Panel>
                    );
                })}
            </div>

            <div className="row r-1-1">
                <Panel title="Referrers" meta="where clicks originate">
                    <div>
                        {referrers.slice(0, 10).map((r) => (
                            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 60px', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--grid-line-soft)' }}>
                                <span style={{ color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                                <span style={{ background: 'oklch(0.25 0.008 70)', height: 8, borderRadius: 1, position: 'relative' }}>
                                    <span style={{ position: 'absolute', inset: 0, right: 'auto', width: `${(r.count / refMax) * 100}%`, background: 'linear-gradient(90deg, var(--info), var(--accent))', borderRadius: 1 }} />
                                </span>
                                <span className="num" style={{ textAlign: 'right', color: 'var(--fg)' }}>{r.count}</span>
                            </div>
                        ))}
                        {referrers.length === 0 && <div className="text-dim" style={{ fontSize: 11.5 }}>No referrer data yet</div>}
                    </div>
                </Panel>

                <Panel title="Devices" meta={`${fmtNum(devTot)} sessions`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '8px 4px' }}>
                        <Donut
                            slices={[
                                { value: dev.desktop, color: 'var(--accent)' },
                                { value: dev.mobile, color: 'var(--info)' },
                                { value: dev.tablet, color: 'var(--signal)' },
                            ]}
                            size={120}
                        />
                        <div style={{ flex: 1 }}>
                            {([
                                ['Desktop', dev.desktop, 'var(--accent)', 'Likely HM / engineer at workstation'],
                                ['Mobile', dev.mobile, 'var(--info)', 'Often quick-check / recruiter on the move'],
                                ['Tablet', dev.tablet, 'var(--signal)', 'Rare; usually weekend browsing'],
                            ] as Array<[string, number, string, string]>).map(([l, v, c, hint]) => (
                                <div key={l} style={{ padding: '6px 0', borderBottom: '1px solid var(--grid-line-soft)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto auto', gap: 10, alignItems: 'center' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                                        <span style={{ color: 'var(--fg)' }}>{l}</span>
                                        <span className="num" style={{ color: 'var(--fg-muted)' }}>{v}</span>
                                        <span className="num" style={{ color: 'var(--fg-dim)', minWidth: 44, textAlign: 'right' }}>
                                            {devTot ? fmtPct((v / devTot) * 100) : '—'}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--fg-dim)', fontSize: 10.5, marginTop: 2, marginLeft: 18 }}>{hint}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>
            </div>
        </>
    );
}
