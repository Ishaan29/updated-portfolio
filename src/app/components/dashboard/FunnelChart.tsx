import { Fragment } from 'react';
import { DashboardFunnel } from './lib/types';
import { Panel } from './primitives/Panel';

export function FunnelChart({ funnel }: { funnel: DashboardFunnel }) {
    if (!funnel) return null;

    const stages: Array<[string, number, number | null]> = [
        ['Outreach sent', funnel.outreach, null],
        ['Link clicked', funnel.clicked, funnel.outreach],
        ['Engaged read', funnel.engaged, funnel.clicked],
        ['Replied', funnel.replied, funnel.engaged],
        ['Phone screen', funnel.screen, funnel.replied],
        ['Onsite', funnel.onsite, funnel.screen],
        ['Offer', funnel.offer, funnel.onsite],
    ];
    const top = Math.max(1, ...stages.map((s) => s[1]));

    return (
        <Panel title="Conversion funnel" meta="cumulative · all-time" flush>
            <div className="funnel">
                {stages.map(([label, count, prev], i) => {
                    const widthPct = (count / top) * 100;
                    const conv = prev != null && prev > 0 ? (count / prev) * 100 : null;
                    const dropPct = prev != null && prev > 0 ? ((prev - count) / prev) * 100 : null;
                    const convClass = conv == null ? '' : conv >= 60 ? 'good' : conv >= 25 ? 'warn' : 'bad';
                    return (
                        <Fragment key={label}>
                            {i > 0 && prev != null && (
                                <div className="drop">
                                    <div style={{ color: 'var(--fg-dim)', fontSize: 10 }}>drop-off</div>
                                    <div className="line" />
                                    <div style={{ textAlign: 'right' }}>− {prev - count}</div>
                                    <div style={{ textAlign: 'right' }}>{dropPct != null ? `${Math.round(dropPct)}%` : ''}</div>
                                </div>
                            )}
                            <div className="stage">
                                <span className="label">{label}</span>
                                <span style={{ display: 'block', position: 'relative' }}>
                                    <span className="bar" style={{ width: `${widthPct}%` }} />
                                </span>
                                <span className="count">{count}</span>
                                <span className={`conv ${convClass}`}>{conv != null ? `${Math.round(conv)}%` : '—'}</span>
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </Panel>
    );
}
