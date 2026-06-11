import { useEffect, useMemo, useState } from 'react';
import { CompanyLead } from './lib/types';
import { Panel } from './primitives/Panel';
import { HeatBadge } from './primitives/HeatBadge';
import { StatusChip } from './primitives/StatusChip';
import { ChannelChip } from './primitives/ChannelChip';
import { DwellBars } from './SectionDwell';
import { fmtDate, fmtDateTime, fmtDur } from './lib/format';

interface DetailData {
    companyId: string;
    visits: any[];
    outreachLogs: any[];
    clickPath: any[];
    sectionDwell: Array<{ name: string; seconds: number }>;
}

const EVENT_LABELS: Record<string, [string, string]> = {
    resume_download: ['Resume downloaded', 'var(--signal)'],
    github_click: ['Clicked GitHub link', 'var(--info)'],
    linkedin_click: ['Clicked LinkedIn link', 'var(--info)'],
    contact_form: ['Submitted contact form', 'var(--accent)'],
};

function countEvents(visits: any[], name: string) {
    return visits.reduce(
        (acc, v) => acc + (v.visit_events?.filter((e: any) => e.event_name === name).length || 0),
        0
    );
}

export function LeadDetail({ lead, onBack, accessToken }: { lead: CompanyLead; onBack: () => void; accessToken: string }) {
    const [detail, setDetail] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/visits/leads/${lead.companyId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                    const result = await res.json();
                    setDetail(result.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [lead.companyId, accessToken]);

    const visits = detail?.visits ?? [];

    const eventCounts = useMemo(
        () => ({
            resumeDL: countEvents(visits, 'resume_download'),
            github: countEvents(visits, 'github_click'),
            linkedin: countEvents(visits, 'linkedin_click'),
            contact: countEvents(visits, 'contact_form'),
        }),
        [visits]
    );

    const feed = useMemo(() => {
        const items: Array<{ at: number; kind: string; visit?: any; outreach?: any }> = [];
        for (const v of visits) {
            items.push({ at: +new Date(v.visited_at), kind: v.sessionStats?.isEngaged ? 'engaged-visit' : 'visit', visit: v });
            for (const e of v.visit_events || []) {
                if (EVENT_LABELS[e.event_name]) {
                    items.push({ at: +new Date(e.created_at), kind: e.event_name });
                }
            }
        }
        for (const o of detail?.outreachLogs ?? []) {
            items.push({ at: +new Date(o.action_date), kind: 'outreach', outreach: o });
        }
        return items.sort((a, b) => b.at - a.at);
    }, [visits, detail]);

    return (
        <>
            <div className="ops-toolbar" style={{ border: '1px solid var(--border)', borderRadius: 6, paddingRight: 14 }}>
                <button className="back" onClick={onBack}>← Back to leads</button>
                <span className="crumb" style={{ marginLeft: 14 }}>
                    Leads / <b style={{ textTransform: 'capitalize' }}>{lead.companyId}</b>
                </span>
                <span className="spacer" />
                <span className="crumb">
                    Heat <HeatBadge score={lead.heatScore} /> · Stage <StatusChip status={lead.stage} />
                </span>
            </div>

            <Panel flush style={{ background: 'linear-gradient(180deg, oklch(0.22 0.008 70), var(--bg-card))' }}>
                <div className="lead-head">
                    <div>
                        <h1 className="title">{lead.companyId}</h1>
                        <div className="sub">
                            {(lead.role || lead.tier) && (
                                <>
                                    <span>{[lead.role, lead.tier].filter(Boolean).join(' · ')}</span>
                                    <span style={{ color: 'var(--fg-dim)' }}>·</span>
                                </>
                            )}
                            <ChannelChip channel={lead.channel} />
                        </div>
                        <div className="sub" style={{ marginTop: 12, fontSize: 11.5 }}>
                            <span className="text-dim">tracking link:</span>
                            <code style={{ color: 'var(--accent)' }}>/c/{lead.channel}-{lead.companyId}</code>
                        </div>
                    </div>
                    <div className="meta">
                        <div className="cell">
                            <div className="k">Visits</div>
                            <div className="v num">{lead.totalVisits}</div>
                        </div>
                        <div className="cell">
                            <div className="k">Engaged</div>
                            <div className="v num">{lead.engagedVisits}</div>
                        </div>
                        <div className="cell">
                            <div className="k">Resume DL</div>
                            <div className="v num" style={{ color: eventCounts.resumeDL ? 'var(--signal)' : 'var(--fg)' }}>
                                {eventCounts.resumeDL}
                            </div>
                        </div>
                        <div className="cell">
                            <div className="k">Outreach</div>
                            <div className="v">{fmtDate(lead.lastOutreach)}</div>
                        </div>
                    </div>
                </div>
            </Panel>

            {loading ? (
                <div className="loading-msg">Querying lead data…</div>
            ) : (
                <>
                    <div className="row r-1-2">
                        <Panel title="Conversion events" meta="this lead">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 1,
                                    background: 'var(--border)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                }}
                            >
                                {([
                                    ['Resume downloads', eventCounts.resumeDL, 'var(--signal)'],
                                    ['GitHub clicks', eventCounts.github, 'var(--info)'],
                                    ['LinkedIn clicks', eventCounts.linkedin, 'var(--info)'],
                                    ['Contact form', eventCounts.contact, 'var(--accent)'],
                                ] as Array<[string, number, string]>).map(([label, value, color]) => (
                                    <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
                                        <div style={{ fontSize: 10.5, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {label}
                                        </div>
                                        <div style={{ fontSize: 22, color: value ? color : 'var(--fg-dim)', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Section dwell time" meta="avg seconds per session">
                            <DwellBars data={(detail?.sectionDwell ?? []).map((d) => ({ name: d.name, avg: d.seconds }))} />
                        </Panel>
                    </div>

                    <div className="row r-1-1">
                        <Panel title="Sessions" meta={`${visits.length} total`} flush>
                            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                                <table className="t">
                                    <thead>
                                        <tr>
                                            <th>When</th>
                                            <th>Location</th>
                                            <th>Device</th>
                                            <th className="num">Dur</th>
                                            <th className="num">Scroll</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visits.map((v) => (
                                            <tr key={v.id}>
                                                <td className="dim">{fmtDateTime(v.visited_at)}</td>
                                                <td>{v.city ? `${v.city}, ${v.country ?? v.region ?? ''}` : '—'}</td>
                                                <td className="dim" style={{ textTransform: 'capitalize' }}>{v.device_type || '—'}</td>
                                                <td className="num">{fmtDur(v.sessionStats?.duration ?? 0)}</td>
                                                <td className="num">{v.sessionStats?.maxScroll ?? 0}%</td>
                                                <td>
                                                    {v.sessionStats?.isEngaged ? (
                                                        <span className="stat engaged"><span className="pip" />engaged</span>
                                                    ) : (
                                                        <span className="stat clicked"><span className="pip" />clicked</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {visits.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="dim" style={{ padding: 30, textAlign: 'center' }}>
                                                    No clicks yet — link hasn&apos;t been opened.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>

                        <Panel title="Chronological feed" meta="outreach + visits + events" flush>
                            <div className="timeline" style={{ maxHeight: 480, overflowY: 'auto' }}>
                                {feed.map((it, i) => {
                                    if (it.kind === 'outreach') {
                                        return (
                                            <div key={i} className="tl-item outreach">
                                                <span className="dot" />
                                                <div className="ts">{fmtDateTime(it.at)}</div>
                                                <div className="hdr"><span>Outreach: {it.outreach.action_type}</span></div>
                                                {(it.outreach.notes || it.outreach.contact_name) && (
                                                    <div className="body">
                                                        {it.outreach.contact_name && (
                                                            <span><span style={{ color: 'var(--fg-dim)' }}>to</span> {it.outreach.contact_name} </span>
                                                        )}
                                                        {it.outreach.notes}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    if (it.kind === 'visit' || it.kind === 'engaged-visit') {
                                        const v = it.visit;
                                        const engaged = it.kind === 'engaged-visit';
                                        const sections: string[] = v.sessionStats?.sections ?? [];
                                        return (
                                            <div key={i} className={`tl-item visit${engaged ? ' engaged' : ''}`}>
                                                <span className="dot" />
                                                <div className="ts">{fmtDateTime(it.at)}</div>
                                                <div className="hdr">
                                                    <span>
                                                        {engaged ? 'Engaged visit' : 'Site visit'}
                                                        {v.city ? ` · ${v.city}, ${v.country ?? ''}` : ''}
                                                        {' · '}{fmtDur(v.sessionStats?.duration ?? 0)} · {v.sessionStats?.maxScroll ?? 0}% scroll
                                                    </span>
                                                </div>
                                                <div className="body">
                                                    <div>
                                                        <span style={{ color: 'var(--fg-dim)' }}>via</span> {v.channel || 'organic'}
                                                        {v.device_type && (
                                                            <> <span style={{ color: 'var(--fg-dim)' }}>on</span> <span style={{ textTransform: 'capitalize' }}>{v.device_type}</span></>
                                                        )}
                                                    </div>
                                                    {sections.length > 0 && (
                                                        <div className="path-step" style={{ marginTop: 4 }}>
                                                            sections: {sections.map((s, j) => (
                                                                <span key={s}><b>{s}</b>{j < sections.length - 1 ? ', ' : ''}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    const [label, color] = EVENT_LABELS[it.kind] ?? ['Event', 'var(--fg)'];
                                    return (
                                        <div key={i} className={`tl-item ${it.kind === 'resume_download' ? 'download' : 'reply'}`}>
                                            <span className="dot" />
                                            <div className="ts">{fmtDateTime(it.at)}</div>
                                            <div className="hdr"><span style={{ color }}>{label}</span></div>
                                        </div>
                                    );
                                })}
                                {feed.length === 0 && (
                                    <div className="text-dim" style={{ padding: 30, textAlign: 'center' }}>No activity recorded.</div>
                                )}
                            </div>
                        </Panel>
                    </div>
                </>
            )}
        </>
    );
}
