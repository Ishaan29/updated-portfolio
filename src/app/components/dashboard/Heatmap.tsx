import { Fragment } from 'react';
import { Panel } from './primitives/Panel';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function level(v: number, max: number) {
    if (!v) return '';
    const r = v / max;
    if (r < 0.15) return 'l1';
    if (r < 0.35) return 'l2';
    if (r < 0.6) return 'l3';
    if (r < 0.85) return 'l4';
    return 'l5';
}

function findPeak(grid: number[][]) {
    let best = { d: 0, h: 0, v: -1 };
    grid.forEach((row, d) => row.forEach((v, h) => { if (v > best.v) best = { d, h, v }; }));
    return `${DAYS[best.d]} ${best.h}:00 (${best.v} visits)`;
}

export function Heatmap({ data }: { data: number[][] }) {
    if (!data || data.length === 0) return null;

    const max = Math.max(1, ...data.flat());

    return (
        <Panel title="Day × hour activity" meta="UTC · all visits" flush>
            <div className="heat-grid">
                <div className="corner" />
                {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="hr-lab">{h % 3 === 0 ? h : ''}</div>
                ))}
                {data.map((row, d) => (
                    <Fragment key={d}>
                        <div className="day-lab">{DAYS[d]}</div>
                        {row.map((v, h) => (
                            <div key={h} className={`heat-cell ${level(v, max)}`} title={`${DAYS[d]} ${h}:00 — ${v} visits`} />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div className="heat-legend">
                <span>less</span>
                <span className="sw heat-cell" />
                <span className="sw heat-cell l1" />
                <span className="sw heat-cell l2" />
                <span className="sw heat-cell l3" />
                <span className="sw heat-cell l4" />
                <span className="sw heat-cell l5" />
                <span>more</span>
                <span style={{ marginLeft: 'auto' }}>peak hour: {findPeak(data)}</span>
            </div>
        </Panel>
    );
}
